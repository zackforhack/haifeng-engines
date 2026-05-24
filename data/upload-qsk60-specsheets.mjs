// Download and upload QSK60 series spec sheet PDFs to Supabase
// G3, G7, G10, G12: cummins.com | G4: cummins.com | G6, G11, G13: mart.cummins.com
// G8, G21, G23: fdkenergy.com (Cummins ONAN UK genset specs)

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
const TMP_DIR = path.join(os.tmpdir(), 'qsk60-specsheets')
fs.mkdirSync(TMP_DIR, { recursive: true })

// [model, filename, slugs[], sourceUrl]
const ENTRIES = [
  ['QSK60-G3', 'qsk60-g3.pdf', ['cummins-qsk60-g3'],
    'https://ghaddar.com/wp-content/uploads/2019/08/QSK60-G3.pdf'],

  ['QSK60-G4', 'qsk60-g4.pdf', ['cummins-qsk60-g4'],
    'https://www.cummins.com/sites/default/files/2019-06/QSK60G4.pdf'],

  ['QSK60-G6', 'qsk60-g6.pdf', ['cummins-qsk60-g6'],
    'https://mart.cummins.com/imagelibrary/data/assetfiles/0070615.pdf'],

  ['QSK60-G7', 'qsk60-g7.pdf', ['cummins-qsk60-g7'],
    'https://www.cummins.com/sites/default/files/2019-06/QSK60G7.pdf'],

  ['QSK60-G8', 'qsk60-g8.pdf', ['cummins-qsk60-g8'],
    'https://fdkenergy.com/wp-content/uploads/2021/07/CG2500-H1-QSK60-G8.pdf'],

  ['QSK60-G10', 'qsk60-g10.pdf', ['cummins-qsk60-g10'],
    'https://www.cummins.com/sites/default/files/2019-06/QSK60G10.pdf'],

  ['QSK60-G11', 'qsk60-g11.pdf', ['cummins-qsk60-g11'],
    'https://mart.cummins.com/imagelibrary/data/assetfiles/0070617.pdf'],

  ['QSK60-G12', 'qsk60-g12.pdf', ['cummins-qsk60-g12'],
    'https://www.cummins.com/sites/default/files/2019-06/QSK60G12UR.pdf'],

  ['QSK60-G13', 'qsk60-g13.pdf', ['cummins-qsk60-g13'],
    'https://mart.cummins.com/imagelibrary/data/assetfiles/0070619.pdf'],

  ['QSK60-G21', 'qsk60-g21.pdf', ['cummins-qsk60-g21'],
    'https://fdkenergy.com/wp-content/uploads/2021/07/CG2500-H1-QSK60-G21.pdf'],

  ['QSK60-G23', 'qsk60-g23.pdf', ['cummins-qsk60-g23'],
    'https://fdkenergy.com/wp-content/uploads/2021/07/CG2750-H1-QSK60-G23.pdf'],
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

  process.stdout.write(`${model} ... `)

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
    if (!engineId) { console.warn(`\n  Not in DB: ${slug}`); continue }
    await supabase.from('engine_pdfs').delete()
      .eq('engine_id', engineId).eq('storage_path', storagePath)
    const { error: insertErr } = await supabase.from('engine_pdfs').insert({
      engine_id: engineId,
      type: 'datasheet',
      label: `${model} Specification Sheet`,
      storage_path: storagePath,
      file_size_bytes: buf.length,
    })
    if (insertErr) console.warn(`\n  DB insert failed for ${slug}: ${insertErr.message}`)
    else process.stdout.write(`→${slug} `)
  }

  console.log()
  fs.unlinkSync(localPath)
  ok++
}

console.log(`\n=== DONE: ${ok} uploaded, ${failed} failed ===`)
