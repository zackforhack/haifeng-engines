// Fixes broken CCEC spec sheets uploaded by download-upload-ccec-individual-specsheets.mjs.
// topone-power.com returned HTML for many models (200 status but non-PDF content).
// This script re-downloads from baifapower.com or squarespace where real PDFs exist,
// and deletes DB entries for models where no real spec sheet is publicly available.
//
// Scan results from 2026-05-23:
//   topone-power: real PDFs for ~16 models only (the ones originally found by user)
//   baifapower/fadongji2: real PDFs for most others
//   baifapower/FADONGJI: real PDFs for QSM11 series
//   No source found: M15-G3–G7, KTA19-G8, KTAA19-G5/G6/G6A, KTA50-G16B,
//                    QSK19-G4/G31–G35, QSK38-G5/G26–G28/G30–G32

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
const BAIFA2  = 'https://www.baifapower.com/static/upload/download/fadongji2'
const BAIFAU  = 'https://www.baifapower.com/static/upload/download/FADONGJI'
const TMP_DIR = path.join(os.tmpdir(), 'ccec-fix')
fs.mkdirSync(TMP_DIR, { recursive: true })

// [model, slug, sourceUrl]  — models with confirmed real PDFs from alternative source
const FIX_WITH_SOURCE = [
  // NT855 — baifapower/fadongji2
  ['NTA855-G1A', 'cummins-nta855-g1a', `${BAIFA2}/NTA855-G1A.pdf`],
  ['NTA855-G1B', 'cummins-nta855-g1b', `${BAIFA2}/NTA855-G1B.pdf`],
  ['NTA855-G2A', 'cummins-nta855-g2a', `${BAIFA2}/NTA855-G2A.pdf`],
  ['NTA855-G3',  'cummins-nta855-g3',  `${BAIFA2}/NTA855-G3.pdf`],

  // K19 — baifapower/fadongji2
  ['KTA19-G3A', 'cummins-kta19-g3a', `${BAIFA2}/KTA19-G3A.pdf`],
  ['KTA19-G8E', 'cummins-kta19-g8e', `${BAIFA2}/KTA19-G8E.pdf`],
  ['KTA19-G8A', 'cummins-kta19-g8a', `${BAIFA2}/KTA19-G8A.pdf`],
  ['KTA19-G9A', 'cummins-kta19-g9a', `${BAIFA2}/KTA19-G9A.pdf`],

  // K38 — baifapower/fadongji2
  ['KTA38-G1',  'cummins-kta38-g1',  `${BAIFA2}/KTA38-G1.pdf`],
  ['KTA38-G1B', 'cummins-kta38-g1b', `${BAIFA2}/KTA38-G1B.pdf`],
  ['KTA38-G2B', 'cummins-kta38-g2b', `${BAIFA2}/KTA38-G2B.pdf`],
  ['KTA38-G4B', 'cummins-kta38-g4b', `${BAIFA2}/KTA38-G4B.pdf`],
  ['KTA38-G9',  'cummins-kta38-g9',  `${BAIFA2}/KTA38-G9.pdf`],
  ['KTA38-G2E', 'cummins-kta38-g2e', `${BAIFA2}/KTA38-G2E.pdf`],
  ['KTA38-G5E', 'cummins-kta38-g5e', `${BAIFA2}/KTA38-G5E.pdf`],
  ['KTA38-G7E', 'cummins-kta38-g7e', `${BAIFA2}/KTA38-G7E.pdf`],
  ['KTA38-G9E', 'cummins-kta38-g9e', `${BAIFA2}/KTA38-G9E.pdf`],
  ['KTA38-G9A', 'cummins-kta38-g9a', `${BAIFA2}/KTA38-G9A.pdf`],

  // K38 — squarespace
  ['KT38-GA', 'cummins-kt38-ga',
    'https://static1.squarespace.com/static/5ced0419d7ab740001278d5b/t/5e0ef80ea9a994607bf11544/1578039314622/KT38-GA-EN.pdf'],

  // K50 — baifapower/fadongji2
  ['KTA50-G3',   'cummins-kta50-g3',   `${BAIFA2}/KTA50-G3.pdf`],
  ['KTA50-G12',  'cummins-kta50-g12',  `${BAIFA2}/KTA50-G12.pdf`],
  ['KTA50-G12A', 'cummins-kta50-g12a', `${BAIFA2}/KTA50-G12A.pdf`],
  ['KTA50-G8',   'cummins-kta50-g8',   `${BAIFA2}/KTA50-G8.pdf`],
  ['KTA50-G9',   'cummins-kta50-g9',   `${BAIFA2}/KTA50-G9.pdf`],
  ['KTA50-G15X', 'cummins-kta50-g15x', `${BAIFA2}/KTA50-G15X.pdf`],
  ['KTA50-G3E',  'cummins-kta50-g3e',  `${BAIFA2}/KTA50-G3E.pdf`],
  ['KTA50-G7E',  'cummins-kta50-g7e',  `${BAIFA2}/KTA50-G7E.pdf`],
  ['KTA50-G8E',  'cummins-kta50-g8e',  `${BAIFA2}/KTA50-G8E.pdf`],
  ['KTA50-G15A', 'cummins-kta50-g15a', `${BAIFA2}/KTA50-G15A.pdf`],
  ['KTA50-G16A', 'cummins-kta50-g16a', `${BAIFA2}/KTA50-G16A.pdf`],

  // QSM11 — baifapower/FADONGJI (uppercase path)
  ['QSM11-G1', 'cummins-qsm11-g1', `${BAIFAU}/QSM11-G1.pdf`],
  ['QSM11-G2', 'cummins-qsm11-g2', `${BAIFAU}/QSM11-G2.pdf`],
  ['QSM11-G3', 'cummins-qsm11-g3', `${BAIFAU}/QSM11-G3.pdf`],
  ['QSM11-G4', 'cummins-qsm11-g4', `${BAIFAU}/QSM11-G4.pdf`],
  ['QSM11-G5', 'cummins-qsm11-g5', `${BAIFAU}/QSM11-G5.pdf`],
  ['QSM11-G6', 'cummins-qsm11-g6', `${BAIFAU}/QSM11-G6.pdf`],

  // QSNT — baifapower/fadongji2 (QSNT-G3 was OK on topone, skip)
  ['QSNT-G1',  'cummins-qsnt-g1',  `${BAIFA2}/QSNT-G1.pdf`],
  ['QSNT-G2',  'cummins-qsnt-g2',  `${BAIFA2}/QSNT-G2.pdf`],
  ['QSNT-G4X', 'cummins-qsnt-g4x', `${BAIFA2}/QSNT-G4X.pdf`],
  ['QSNT-G6',  'cummins-qsnt-g6',  `${BAIFA2}/QSNT-G6.pdf`],
  ['QSNT-G7',  'cummins-qsnt-g7',  `${BAIFA2}/QSNT-G7.pdf`],

  // QSK19 — baifapower/fadongji2
  ['QSK19-G5',  'cummins-qsk19-g5',  `${BAIFA2}/QSK19-G5.pdf`],
  ['QSK19-G6',  'cummins-qsk19-g6',  `${BAIFA2}/QSK19-G6.pdf`],
  ['QSK19-G8',  'cummins-qsk19-g8',  `${BAIFA2}/QSK19-G8.pdf`],
  ['QSK19-G11', 'cummins-qsk19-g11', `${BAIFA2}/QSK19-G11.pdf`],
  ['QSK19-G12', 'cummins-qsk19-g12', `${BAIFA2}/QSK19-G12.pdf`],
  ['QSK19-G13', 'cummins-qsk19-g13', `${BAIFA2}/QSK19-G13.pdf`],
  ['QSK19-G14', 'cummins-qsk19-g14', `${BAIFA2}/QSK19-G14.pdf`],

  // QSK38 — baifapower/fadongji2
  ['QSK38-G1',  'cummins-qsk38-g1',  `${BAIFA2}/QSK38-G1.pdf`],
  ['QSK38-G2',  'cummins-qsk38-g2',  `${BAIFA2}/QSK38-G2.pdf`],
  ['QSK38-G4',  'cummins-qsk38-g4',  `${BAIFA2}/QSK38-G4.pdf`],
  ['QSK38-G6',  'cummins-qsk38-g6',  `${BAIFA2}/QSK38-G6.pdf`],
  ['QSK38-G7',  'cummins-qsk38-g7',  `${BAIFA2}/QSK38-G7.pdf`],
  ['QSK38-G8',  'cummins-qsk38-g8',  `${BAIFA2}/QSK38-G8.pdf`],
  ['QSK38-G19', 'cummins-qsk38-g19', `${BAIFA2}/QSK38-G19.pdf`],
  ['QSK38-G29', 'cummins-qsk38-g29', `${BAIFA2}/QSK38-G29.pdf`],
]

// Models where no real spec sheet found — delete broken storage file + DB entry
const DELETE_BROKEN = [
  ['M15-G3',    'cummins-m15-g3'],
  ['M15-G4',    'cummins-m15-g4'],
  ['M15-G5',    'cummins-m15-g5'],
  ['M15-G6',    'cummins-m15-g6'],
  ['M15-G7',    'cummins-m15-g7'],
  ['M15-G8',    'cummins-m15-g8'],    // has nilniroo spec from first script
  ['KTA19-G8',  'cummins-kta19-g8'],
  ['KTAA19-G5', 'cummins-ktaa19-g5'], // has cummins.com spec from first script
  ['KTAA19-G6', 'cummins-ktaa19-g6'],
  ['KTAA19-G6A','cummins-ktaa19-g6a'],
  ['KTA50-G16B','cummins-kta50-g16b'],
  ['QSK19-G4',  'cummins-qsk19-g4'],
  ['QSK19-G31', 'cummins-qsk19-g31'],
  ['QSK19-G32', 'cummins-qsk19-g32'],
  ['QSK19-G33', 'cummins-qsk19-g33'],
  ['QSK19-G34', 'cummins-qsk19-g34'],
  ['QSK19-G35', 'cummins-qsk19-g35'],
  ['QSK38-G5',  'cummins-qsk38-g5'],
  ['QSK38-G26', 'cummins-qsk38-g26'],
  ['QSK38-G27', 'cummins-qsk38-g27'],
  ['QSK38-G28', 'cummins-qsk38-g28'],
  ['QSK38-G30', 'cummins-qsk38-g30'],
  ['QSK38-G31', 'cummins-qsk38-g31'],
  ['QSK38-G32', 'cummins-qsk38-g32'],
]

// Fetch engine IDs
const allSlugs = [...FIX_WITH_SOURCE, ...DELETE_BROKEN].map(([,slug]) => slug)
const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', allSlugs)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))

// ── Re-download and re-upload broken files ────────────────────────────────────
console.log(`\n=== RE-UPLOADING ${FIX_WITH_SOURCE.length} BROKEN FILES FROM CORRECT SOURCES ===\n`)
let fixed = 0, failed = 0

for (const [model, slug, sourceUrl] of FIX_WITH_SOURCE) {
  const filename = `${model.toLowerCase()}.pdf`
  const storagePath = `${STORAGE_PREFIX}/${filename}`
  const localPath = path.join(TMP_DIR, filename)

  process.stdout.write(`📥 ${model} ... `)

  let buf
  try {
    const res = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    buf = Buffer.from(await res.arrayBuffer())
    if (buf.slice(0,4).toString() !== '%PDF') throw new Error(`Not a PDF (${buf.length}B)`)
  } catch (e) {
    console.log(`Download failed: ${e.message}`)
    failed++
    continue
  }

  fs.writeFileSync(localPath, buf)
  process.stdout.write(`${Math.round(buf.length/1024)}KB `)

  // uploadPdf uses upsert:true so overwrites the broken file in storage
  const { ok } = await uploadPdf(supabase, BUCKET, localPath, storagePath)
  if (!ok) { console.log('Upload failed'); failed++; fs.unlinkSync(localPath); continue }

  // Update DB record (delete + reinsert to refresh file_size_bytes)
  const engineId = slugToId[slug]
  if (engineId) {
    await supabase.from('engine_pdfs').delete()
      .eq('engine_id', engineId).eq('storage_path', storagePath)
    await supabase.from('engine_pdfs').insert({
      engine_id: engineId,
      type: 'datasheet',
      label: `${model} Specification Sheet`,
      storage_path: storagePath,
      file_size_bytes: buf.length,
    })
  }

  console.log(`fixed → ${slug}`)
  fs.unlinkSync(localPath)
  fixed++
}

// ── Delete broken entries with no real source ─────────────────────────────────
console.log(`\n=== REMOVING ${DELETE_BROKEN.length} ENTRIES WITH NO REAL SOURCE ===\n`)
let deleted = 0

for (const [model, slug] of DELETE_BROKEN) {
  const storagePath = `${STORAGE_PREFIX}/${model.toLowerCase()}.pdf`
  const engineId = slugToId[slug]

  // Remove DB record
  if (engineId) {
    const { error } = await supabase.from('engine_pdfs').delete()
      .eq('engine_id', engineId).eq('storage_path', storagePath)
    if (error) console.warn(`  ⚠️  DB delete failed for ${slug}: ${error.message}`)
  }

  // Remove from storage
  const { error: storageErr } = await supabase.storage.from(BUCKET).remove([storagePath])
  if (storageErr) console.warn(`  ⚠️  Storage delete failed for ${model}: ${storageErr.message}`)

  console.log(`🗑  ${model} → removed`)
  deleted++
}

console.log(`\n=== DONE ===`)
console.log(`Fixed: ${fixed} | Deleted (no source): ${deleted} | Failed: ${failed}`)
