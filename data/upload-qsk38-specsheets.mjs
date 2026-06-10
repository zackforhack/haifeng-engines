// Download and upload QSK38 series spec sheet PDFs to Supabase
// G1–G5: machinery.fi | G7, G13, G14: baifapower FADONGJI

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import path from 'path'
import os from 'os'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const STORAGE_PREFIX = 'cummins/spec-sheets'
const TMP_DIR = path.join(os.tmpdir(), 'qsk38-specsheets')
fs.mkdirSync(TMP_DIR, { recursive: true })

// [model, filename, slugs[], sourceUrl]
const ENTRIES = [
  ['QSK38-G1', 'qsk38-g1.pdf', ['cummins-qsk38-g1'],
    'https://machinery.fi/wp-content/uploads/qsk38-g1.pdf'],

  ['QSK38-G2', 'qsk38-g2.pdf', ['cummins-qsk38-g2'],
    'https://machinery.fi/wp-content/uploads/qsk38-g2.pdf'],

  ['QSK38-G3', 'qsk38-g3.pdf', ['cummins-qsk38-g3'],
    'https://machinery.fi/wp-content/uploads/qsk38-g3.pdf'],

  ['QSK38-G4', 'qsk38-g4.pdf', ['cummins-qsk38-g4'],
    'https://machinery.fi/wp-content/uploads/qsk38-g4.pdf'],

  ['QSK38-G5', 'qsk38-g5.pdf', ['cummins-qsk38-g5'],
    'https://machinery.fi/wp-content/uploads/qsk38-g5.pdf'],

  ['QSK38-G7', 'qsk38-g7.pdf', ['cummins-qsk38-g7'],
    'https://www.baifapower.com/static/upload/download/FADONGJI/QSK38-G7.pdf'],

  ['QSK38-G13', 'qsk38-g13.pdf', ['cummins-qsk38-g13'],
    'https://www.baifapower.com/static/upload/download/FADONGJI/QSK38-G13.pdf'],

  ['QSK38-G14', 'qsk38-g14.pdf', ['cummins-qsk38-g14'],
    'https://www.baifapower.com/static/upload/download/FADONGJI/QSK38-G14.pdf'],
]

const allSlugs = ENTRIES.flatMap(([,,slugs]) => slugs)
const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', allSlugs)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${allSlugs.length} engine records\n`)

let ok = 0, failed = 0

for (const [model, filename, slugs, sourceUrl] of ENTRIES) {
  const storagePath = `${STORAGE_PREFIX}/${filename}`
  const localPath   = path.join(TMP_DIR, filename)

  process.stdout.write(`📥 ${model} ... `)

  let buf
  try {
    const res = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    buf = Buffer.from(await res.arrayBuffer())
    if (buf.slice(0, 4).toString() !== '%PDF') throw new Error(`Not a PDF (got: ${buf.slice(0,20).toString().trim()})`)
  } catch (e) {
    console.log(`Download failed: ${e.message}`)
    failed++
    continue
  }

  fs.writeFileSync(localPath, buf)
  process.stdout.write(`${Math.round(buf.length / 1024)}KB `)

  const { ok: uploaded } = await uploadPdf(supabase, BUCKET, localPath, storagePath)
  if (!uploaded) {
    console.log('Upload failed')
    failed++
    fs.unlinkSync(localPath)
    continue
  }

  for (const slug of slugs) {
    const engineId = slugToId[slug]
    if (!engineId) { console.warn(`\n  ⚠️  Not in DB: ${slug}`); continue }
    await supabase.from('engine_pdfs').delete()
      .eq('engine_id', engineId).eq('storage_path', storagePath)
    const { error: insertErr } = await supabase.from('engine_pdfs').insert({
      engine_id: engineId,
      type: 'datasheet',
      label: `${model} Specification Sheet`,
      storage_path: storagePath,
      file_size_bytes: buf.length,
    })
    if (insertErr) console.warn(`\n  ⚠️  DB insert failed for ${slug}: ${insertErr.message}`)
    else process.stdout.write(`→${slug} `)
  }

  console.log()
  fs.unlinkSync(localPath)
  ok++
}

console.log(`\n=== DONE: ${ok} uploaded, ${failed} failed ===`)
