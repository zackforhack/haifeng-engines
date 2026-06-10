// Upload Baudouin spec sheet PDFs from third-party datasheets.
// Covers 4M06, 6M16, and 12M26 series (12 models).

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
const STORAGE_PREFIX = 'baudouin/spec-sheets'
const TMP_DIR = path.join(os.tmpdir(), 'baudouin-specs-v2')
fs.mkdirSync(TMP_DIR, { recursive: true })

// [display label, storage filename (no .pdf), db slug, source URL]
const ENTRIES = [
  ['12M26G900/5',  '12M26G900-5',  'baudouin-12m26g900-5',
    'https://www.ctm.it/Datasheet/12M26G900-5/DPK-TDS-EN-12M26-0001-19-08-21_12M26G900-5_StdRad_Datasheet.pdf'],
  ['12M26G1000/5', '12M26G1000-5', 'baudouin-12m26g1000-5',
    'https://www.emsa.gen.tr/images/brochures/TECHNICAL%20DOCUMENTS/ENGINE%20DATASHEET/Baudouin/50%20Hz/12M26G1000-5_DataSheet_Gb.pdf'],
  ['12M26G1100/5', '12M26G1100-5', 'baudouin-12m26g1100-5',
    'https://www.gucbirjenerator.com/engine/baudouin/12M26G1100-5.pdf'],
  ['4M06G25/5',    '4M06G25-5',    'baudouin-4m06g25-5',
    'https://abyaran.com/uploaded_files/4M06G25-5.pdf'],
  ['4M06G35/5',    '4M06G35-5',    'baudouin-4m06g35-5',
    'https://sunirco.com/wp-content/uploads/2023/09/DPK-TDS-EN-4M06-0050-22-08-23_4M06G35-5_StdRad2020_Datasheet.pdf'],
  ['4M06G44/5',    '4M06G44-5',    'baudouin-4m06g44-5',
    'https://target-generators.com/wp-content/uploads/2024/03/4M06G44-5.pdf'],
  ['4M06G50/5',    '4M06G50-5',    'baudouin-4m06g50-5',
    'https://www.ctm.it/Datasheet/4M06G50-5/4M06G50-5_DataSheet_Gb.pdf'],
  ['4M06G55/5',    '4M06G55-5',    'baudouin-4m06g55-5',
    'https://www.emsa.gen.tr/images/brochures/TECHNICAL%20DOCUMENTS/ENGINE%20DATASHEET/Baudouin/50%20Hz/4M06G55-5_DataSheet_Gb.pdf'],
  ['6M16G220/5',   '6M16G220-5',   'baudouin-6m16g220-5',
    'https://twssa.co.za/wp-content/uploads/2023/03/Baudouin-200-kVA-PowerKit-Generator-6M16G220-5.pdf'],
  ['6M16G250/5',   '6M16G250-5',   'baudouin-6m16g250-5',
    'https://www.famcocorp.com/Uploadfiles/CkEditor/Files/Catalog/baudouin-diesel-generator-set-6m16g250-5_catalog.pdf'],
  ['6M16G275/5',   '6M16G275-5',   'baudouin-6m16g275-5',
    'https://abyaran.com/uploaded_files/6M16G275-5.pdf'],
  ['6M16G350/5',   '6M16G350-5',   'baudouin-6m16g350-5',
    'https://www.ctm.it/Datasheet/6M16G350-5/6M16G350-5.pdf'],
]

// Fetch engine id map
const allSlugs = ENTRIES.map(([,,slug]) => slug)
const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', allSlugs)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${allSlugs.length} engine records\n`)

let ok = 0, failed = 0

for (const [label, filename, slug, sourceUrl] of ENTRIES) {
  const storagePath = `${STORAGE_PREFIX}/${filename}.pdf`
  const localPath   = path.join(TMP_DIR, `${filename}.pdf`)

  process.stdout.write(`${label} ... `)

  let buf
  if (fs.existsSync(localPath)) {
    buf = fs.readFileSync(localPath)
    process.stdout.write(`(cached) `)
  } else {
    try {
      const res = await fetch(sourceUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(30000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      buf = Buffer.from(await res.arrayBuffer())
      if (buf.slice(0, 4).toString() !== '%PDF') throw new Error(`Not a PDF (got: ${buf.slice(0,8).toString()})`)
      fs.writeFileSync(localPath, buf)
    } catch (e) {
      console.log(`Download failed: ${e.message}`)
      failed++
      continue
    }
  }

  process.stdout.write(`${Math.round(buf.length / 1024)}KB `)

  const { ok: uploaded } = await uploadPdf(supabase, BUCKET, localPath, storagePath)
  if (!uploaded) { console.log('Upload failed'); failed++; continue }

  const engineId = slugToId[slug]
  if (!engineId) { console.warn(`Not in DB: ${slug}`); failed++; continue }

  await supabase.from('engine_pdfs').delete()
    .eq('engine_id', engineId).eq('storage_path', storagePath)
  const { error: insertErr } = await supabase.from('engine_pdfs').insert({
    engine_id: engineId,
    type: 'datasheet',
    label: `${label} Specification Sheet`,
    storage_path: storagePath,
    file_size_bytes: buf.length,
  })
  if (insertErr) console.warn(`DB insert failed for ${slug}: ${insertErr.message}`)
  else process.stdout.write(`→ ${slug} `)

  console.log()
  ok++
}

console.log(`\n=== DONE: ${ok} uploaded, ${failed} failed ===`)
