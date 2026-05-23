// Upload manually-sourced DCEC spec sheet PDFs to Supabase
// URLs provided by user 2026-05-24

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
const TMP_DIR = path.join(os.tmpdir(), 'dcec-manual-pdfs')
fs.mkdirSync(TMP_DIR, { recursive: true })

// [model, filename, slugs[], sourceUrl]
const ENTRIES = [
  ['6ZTAA13-G2', '6ztaa13-g2.pdf',
    ['cummins-6ztaa13-g2'],
    'https://tongkhomayphatdien.com/wp-content/uploads/2020/11/Catalogue-Cummins-6ZTAA13-G2.pdf'],

  ['6ZTAA13-G3', '6ztaa13-g3.pdf',
    ['cummins-6ztaa13-g3'],
    'https://www.hosempower.com/uploadfile/downloads/6ZTAA13-G3.pdf'],

  ['6ZTAA13-G4', '6ztaa13-g4.pdf',
    ['cummins-6ztaa13-g4'],
    'https://www.kentepower.com/uploads/3bc9738e.pdf'],

  ['6LTAA9.5-G3', '6ltaa95-g3.pdf',
    ['cummins-6ltaa95-g3'],
    'https://www.baifapower.com/static/upload/download/FADONGJI/6LTAA9.5-G.pdf'],

  ['4BTAA3.9-G3', '4btaa39-g3.pdf',
    ['cummins-4btaa39-g3'],
    'https://tpgc-power.com/wp-content/uploads/2025/09/Cummins-4BTAA3.9-G3-Engine.pdf'],

  // 6BT5.9-G2: two DB entries (g75e1 and g84e1) share the same spec sheet
  ['6BT5.9-G2', '6bt59-g2.pdf',
    ['cummins-6bt59-g2-g75e1', 'cummins-6bt59-g2-g84e1'],
    'https://tongkhomayphatdien.com/wp-content/uploads/2020/11/Catalogue-Cummins-6BT5.9-G2.pdf'],

  ['6BTA5.9-G2', '6bta59-g2.pdf',
    ['cummins-6bta59-g2'],
    'https://tongkhomayphatdien.com/wp-content/uploads/2020/11/Catalogue-Cummins-6BTA5.9-G2.pdf'],

  ['6BTAA5.9-G2', '6btaa59-g2.pdf',
    ['cummins-6btaa59-g2'],
    'https://tongkhomayphatdien.com/wp-content/uploads/2020/11/Catalogue-Cummins-6BTAA5.9-G2-163kVA.pdf'],
]

// Fetch all engine IDs
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
