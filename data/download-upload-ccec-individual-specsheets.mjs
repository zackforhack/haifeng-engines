// Downloads individual spec sheets for all 97 CCEC engine models from topone-power.com
// and uploads to Supabase. Complements the series brochures already uploaded.
//
// Source: https://topone-power.com/wp-content/uploads/{MODEL}.pdf
// All 97 URLs verified 200 OK on 2026-05-23.

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
const BASE = 'https://topone-power.com/wp-content/uploads'
const TMP_DIR = path.join(os.tmpdir(), 'ccec-individual-specsheets')
fs.mkdirSync(TMP_DIR, { recursive: true })

// [model, slug]  — all 97 CCEC models
const MODELS = [
  // ── NT / NTA855 / NTAA855 Series ─────────────────────────────────────────
  ['NT855-GA',   'cummins-nt855-ga'],
  ['NTA855-G1',  'cummins-nta855-g1'],
  ['NTA855-G1A', 'cummins-nta855-g1a'],
  ['NTA855-G1B', 'cummins-nta855-g1b'],
  ['NTA855-G2',  'cummins-nta855-g2'],
  ['NTA855-G2A', 'cummins-nta855-g2a'],
  ['NTA855-G3',  'cummins-nta855-g3'],
  ['NTA855-G4',  'cummins-nta855-g4'],
  ['NTAA855-G7', 'cummins-ntaa855-g7'],
  ['NTAA855-G7A','cummins-ntaa855-g7a'],

  // ── M15 Series ────────────────────────────────────────────────────────────
  ['M15-G3', 'cummins-m15-g3'],
  ['M15-G4', 'cummins-m15-g4'],
  ['M15-G5', 'cummins-m15-g5'],
  ['M15-G6', 'cummins-m15-g6'],
  ['M15-G7', 'cummins-m15-g7'],
  ['M15-G8', 'cummins-m15-g8'],

  // ── K19 Series ────────────────────────────────────────────────────────────
  ['KTA19-G2',  'cummins-kta19-g2'],
  ['KTA19-G3',  'cummins-kta19-g3'],
  ['KTA19-G3A', 'cummins-kta19-g3a'],
  ['KTA19-G4',  'cummins-kta19-g4'],
  ['KTAA19-G5', 'cummins-ktaa19-g5'],
  ['KTAA19-G6', 'cummins-ktaa19-g6'],
  ['KTA19-G8',  'cummins-kta19-g8'],
  ['KTAA19-G6A','cummins-ktaa19-g6a'],
  ['KTAA19-G7', 'cummins-ktaa19-g7'],
  ['KTA19-G8E', 'cummins-kta19-g8e'],
  ['KTA19-G8A', 'cummins-kta19-g8a'],
  ['KTA19-G9A', 'cummins-kta19-g9a'],

  // ── K38 Series ────────────────────────────────────────────────────────────
  ['KT38-G',    'cummins-kt38-g'],
  ['KTA38-G1',  'cummins-kta38-g1'],
  ['KTA38-G1B', 'cummins-kta38-g1b'],
  ['KT38-GA',   'cummins-kt38-ga'],
  ['KTA38-G2',  'cummins-kta38-g2'],
  ['KTA38-G2B', 'cummins-kta38-g2b'],
  ['KTA38-G2A', 'cummins-kta38-g2a'],
  ['KTA38-G4',  'cummins-kta38-g4'],
  ['KTA38-G4B', 'cummins-kta38-g4b'],
  ['KTA38-G5',  'cummins-kta38-g5'],
  ['KTA38-G9',  'cummins-kta38-g9'],
  ['KTA38-G2E', 'cummins-kta38-g2e'],
  ['KTA38-G5E', 'cummins-kta38-g5e'],
  ['KTA38-G7E', 'cummins-kta38-g7e'],
  ['KTA38-G9E', 'cummins-kta38-g9e'],
  ['KTA38-G9A', 'cummins-kta38-g9a'],

  // ── K50 Series ────────────────────────────────────────────────────────────
  ['KTA50-G3',   'cummins-kta50-g3'],
  ['KTA50-G12',  'cummins-kta50-g12'],
  ['KTA50-G12A', 'cummins-kta50-g12a'],
  ['KTA50-G8',   'cummins-kta50-g8'],
  ['KTA50-GS8',  'cummins-kta50-gs8'],
  ['KTA50-G9',   'cummins-kta50-g9'],
  ['KTA50-G15X', 'cummins-kta50-g15x'],
  ['KTA50-G16B', 'cummins-kta50-g16b'],
  ['KTA50-G3E',  'cummins-kta50-g3e'],
  ['KTA50-G7E',  'cummins-kta50-g7e'],
  ['KTA50-G8E',  'cummins-kta50-g8e'],
  ['KTA50-G15A', 'cummins-kta50-g15a'],
  ['KTA50-G16A', 'cummins-kta50-g16a'],

  // ── QSM11 Series ──────────────────────────────────────────────────────────
  ['QSM11-G1', 'cummins-qsm11-g1'],
  ['QSM11-G2', 'cummins-qsm11-g2'],
  ['QSM11-G3', 'cummins-qsm11-g3'],
  ['QSM11-G4', 'cummins-qsm11-g4'],
  ['QSM11-G5', 'cummins-qsm11-g5'],
  ['QSM11-G6', 'cummins-qsm11-g6'],

  // ── QSN / QSNT Series ─────────────────────────────────────────────────────
  ['QSNT-G6',  'cummins-qsnt-g6'],
  ['QSNT-G7',  'cummins-qsnt-g7'],
  ['QSNT-G1',  'cummins-qsnt-g1'],
  ['QSNT-G2',  'cummins-qsnt-g2'],
  ['QSNT-G3',  'cummins-qsnt-g3'],
  ['QSNT-G4X', 'cummins-qsnt-g4x'],

  // ── QSK19 Series ──────────────────────────────────────────────────────────
  ['QSK19-G14', 'cummins-qsk19-g14'],
  ['QSK19-G13', 'cummins-qsk19-g13'],
  ['QSK19-G12', 'cummins-qsk19-g12'],
  ['QSK19-G6',  'cummins-qsk19-g6'],
  ['QSK19-G4',  'cummins-qsk19-g4'],
  ['QSK19-G5',  'cummins-qsk19-g5'],
  ['QSK19-G11', 'cummins-qsk19-g11'],
  ['QSK19-G8',  'cummins-qsk19-g8'],
  ['QSK19-G31', 'cummins-qsk19-g31'],
  ['QSK19-G35', 'cummins-qsk19-g35'],
  ['QSK19-G32', 'cummins-qsk19-g32'],
  ['QSK19-G33', 'cummins-qsk19-g33'],
  ['QSK19-G34', 'cummins-qsk19-g34'],

  // ── QSK38 Series ──────────────────────────────────────────────────────────
  ['QSK38-G8',  'cummins-qsk38-g8'],
  ['QSK38-G7',  'cummins-qsk38-g7'],
  ['QSK38-G6',  'cummins-qsk38-g6'],
  ['QSK38-G1',  'cummins-qsk38-g1'],
  ['QSK38-G2',  'cummins-qsk38-g2'],
  ['QSK38-G5',  'cummins-qsk38-g5'],
  ['QSK38-G4',  'cummins-qsk38-g4'],
  ['QSK38-G19', 'cummins-qsk38-g19'],
  ['QSK38-G26', 'cummins-qsk38-g26'],
  ['QSK38-G27', 'cummins-qsk38-g27'],
  ['QSK38-G28', 'cummins-qsk38-g28'],
  ['QSK38-G29', 'cummins-qsk38-g29'],
  ['QSK38-G30', 'cummins-qsk38-g30'],
  ['QSK38-G31', 'cummins-qsk38-g31'],
  ['QSK38-G32', 'cummins-qsk38-g32'],
]

// ── Main ──────────────────────────────────────────────────────────────────────

const allSlugs = MODELS.map(([, slug]) => slug)
const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', allSlugs)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${allSlugs.length} engine records\n`)

let downloaded = 0, uploaded = 0, failed = 0, skipped = 0

for (const [model, slug] of MODELS) {
  const filename = `${model.toLowerCase()}.pdf`
  const storagePath = `${STORAGE_PREFIX}/${filename}`
  const localPath = path.join(TMP_DIR, filename)
  const sourceUrl = `${BASE}/${model}.pdf`
  const label = `${model} Specification Sheet`

  process.stdout.write(`📥 ${model} ... `)

  // Download
  let downloadOk = false
  try {
    const res = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; engine-catalog-bot/1.0)' },
    })
    if (!res.ok) {
      console.log(`HTTP ${res.status} — skipping`)
      failed++
      continue
    }
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(localPath, buf)
    downloadOk = true
    process.stdout.write(`${Math.round(buf.length / 1024)}KB `)
    downloaded++
  } catch (e) {
    console.log(`Download error: ${e.message}`)
    failed++
    continue
  }

  if (!downloadOk) continue

  const { ok, skipped: wasSkipped } = await uploadPdf(supabase, BUCKET, localPath, storagePath)
  if (!ok) {
    console.log(`Upload failed`)
    failed++
    continue
  }
  if (wasSkipped) {
    console.log(`already in storage`)
    skipped++
  } else {
    console.log(`uploaded`)
    uploaded++
  }

  // Link to engine
  const engineId = slugToId[slug]
  if (!engineId) {
    console.warn(`  ⚠️  Not in DB: ${slug}`)
  } else {
    const fileSize = fs.statSync(localPath).size
    await supabase.from('engine_pdfs').delete()
      .eq('engine_id', engineId).eq('storage_path', storagePath)
    const { error: insertErr } = await supabase.from('engine_pdfs').insert({
      engine_id: engineId,
      type: 'datasheet',
      label,
      storage_path: storagePath,
      file_size_bytes: fileSize,
    })
    if (insertErr) console.warn(`  ⚠️  DB insert failed for ${slug}: ${insertErr.message}`)
    else console.log(`  → ${slug}`)
  }

  fs.unlinkSync(localPath)
}

console.log(`\n=== DONE ===`)
console.log(`Downloaded: ${downloaded} | Uploaded: ${uploaded} | Skipped (already exists): ${skipped} | Failed: ${failed}`)
