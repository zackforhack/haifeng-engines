// Downloads individual spec sheets for 24 DCEC (Dongfeng Cummins) engine models
// from baifapower.com/FADONGJI and uploads to Supabase.
//
// Source scan performed 2026-05-23: 24 of 55 unique DCEC models found.
// QSB/QSL series and several B/C/L/Z variants are not publicly hosted.

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
const BAIFAU = 'https://www.baifapower.com/static/upload/download/FADONGJI'
const TMP_DIR = path.join(os.tmpdir(), 'dcec-specsheets')
fs.mkdirSync(TMP_DIR, { recursive: true })

// [model, slugs[]]  — slugs is an array to handle models with multiple DB entries
// 4BTA3.9-G2 has two DB entries (g45e1 and g52e1) that share the same spec sheet PDF
const MODELS = [
  // QSZ13 Series
  ['QSZ13-G2',   ['cummins-qsz13-g2']],
  ['QSZ13-G3',   ['cummins-qsz13-g3']],
  ['QSZ13-G5',   ['cummins-qsz13-g5']],
  ['QSZ13-G6',   ['cummins-qsz13-g6']],
  ['QSZ13-G7',   ['cummins-qsz13-g7']],
  ['QSZ13-G10',  ['cummins-qsz13-g10']],
  ['QSZ13-G11',  ['cummins-qsz13-g11']],

  // B3.9 Series
  ['4B3.9-G1',    ['cummins-4b39-g1']],
  ['4B3.9-G2',    ['cummins-4b39-g2']],
  ['4B3.9-G11',   ['cummins-4b39-g11']],
  ['4B3.9-G12',   ['cummins-4b39-g12']],
  ['4BT3.9-G1',   ['cummins-4bt39-g1']],
  ['4BT3.9-G2',   ['cummins-4bt39-g2']],
  ['4BTA3.9-G2',  ['cummins-4bta39-g2-g45e1', 'cummins-4bta39-g2-g52e1']],  // shared PDF, two DB entries
  ['4BTA3.9-G11', ['cummins-4bta39-g11']],
  ['4BTA3.9-G13', ['cummins-4bta39-g13']],

  // B5.9 Series
  ['6BT5.9-G1',    ['cummins-6bt59-g1']],
  ['6BTAA5.9-G12', ['cummins-6btaa59-g12']],

  // C8.3 Series
  ['6CTA8.3-G1',  ['cummins-6cta83-g1']],
  ['6CTA8.3-G2',  ['cummins-6cta83-g2']],
  ['6CTAA8.3-G2', ['cummins-6ctaa83-g2']],

  // L8.9 Series
  ['6LTAA8.9-G2', ['cummins-6ltaa89-g2']],
  ['6LTAA8.9-G3', ['cummins-6ltaa89-g3']],

  // L9.5 Series
  ['6LTAA9.5-G1', ['cummins-6ltaa95-g1']],
]

// Fetch all engine IDs at once
const allSlugs = MODELS.flatMap(([, slugs]) => slugs)
const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', allSlugs)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${allSlugs.length} engine records in DB\n`)

let uploaded = 0, failed = 0

for (const [model, slugs] of MODELS) {
  const filename    = `${model.toLowerCase()}.pdf`
  const storagePath = `${STORAGE_PREFIX}/${filename}`
  const localPath   = path.join(TMP_DIR, filename)
  const sourceUrl   = `${BAIFAU}/${model}.pdf`

  process.stdout.write(`📥 ${model} ... `)

  let buf
  try {
    const res = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    buf = Buffer.from(await res.arrayBuffer())
    if (buf.slice(0, 4).toString() !== '%PDF') throw new Error(`Not a PDF (${buf.length}B)`)
  } catch (e) {
    console.log(`Download failed: ${e.message}`)
    failed++
    continue
  }

  fs.writeFileSync(localPath, buf)
  process.stdout.write(`${Math.round(buf.length / 1024)}KB `)

  const { ok } = await uploadPdf(supabase, BUCKET, localPath, storagePath)
  if (!ok) {
    console.log('Upload failed')
    failed++
    fs.unlinkSync(localPath)
    continue
  }

  // Link PDF to each associated engine
  for (const slug of slugs) {
    const engineId = slugToId[slug]
    if (!engineId) {
      console.warn(`\n  ⚠️  Not in DB: ${slug}`)
      continue
    }
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
  uploaded++
}

console.log(`\n=== DONE ===`)
console.log(`Uploaded: ${uploaded} | Failed: ${failed}`)
console.log(`\nNo spec sheet found for:`)
const foundModels = new Set(MODELS.map(([m]) => m))
const allModels = [
  'QSB3.9-G2','QSB3.9-G3','QSB3.9-G31','QSB3.9-G33','QSB3.9-G35','QSB3.9-G37','QSB3.9-G39',
  'QSB5.9-G2','QSB5.9-G3','QSB5.9-G30','QSB5.9-G31','QSB5.9-G33',
  'QSB6.7-G3','QSB6.7-G4','QSB6.7-G31','QSB6.7-G32',
  'QSL8.9-G2','QSL8.9-G3','QSL8.9-G4','QSL8.9-G30','QSL8.9-G33','QSL8.9-G34',
  '4BTAA3.9-G3','6BT5.9-G2','6BTA5.9-G2','6BTAA5.9-G9',
  '6CTAA8.3-G9','6LTAA9.5-G3','6ZTAA13-G2','6ZTAA13-G3','6ZTAA13-G4',
]
allModels.filter(m => !foundModels.has(m)).forEach(m => console.log(`  ${m}`))
