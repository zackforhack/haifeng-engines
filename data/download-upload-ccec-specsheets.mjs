// Downloads CCEC (Chongqing Cummins) spec sheets from cummins.com and authorised
// distributor mirrors, then uploads to Supabase and links to engine records.
//
// Sources verified 2026-05-23:
//   cummins.com/sites/default/files — 2019 vintage spec sheets (200 OK)
//   mart.cummins.com/imagelibrary   — Cummins document library brochures
//   baifapower.com                  — CCEC/XCEC per-variant G-drive data sheets
//   topone-power.com / hosempower.com / nilniroo.com — authorised distributor mirrors

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
const TMP_DIR = path.join(os.tmpdir(), 'ccec-specsheets')
fs.mkdirSync(TMP_DIR, { recursive: true })

// [sourceUrl, storageFilename, label, type, slugs[]]
const SPEC_SHEETS = [

  // ── NT / NTA855 / NTAA855 Series ─────────────────────────────────────────
  [
    'https://mart.cummins.com/imagelibrary/data/assetfiles/0043310.pdf',
    'n855-ccec-brochure.pdf',
    'N855 CCEC Series Brochure',
    'brochure',
    [
      'cummins-nt855-ga',
      'cummins-nta855-g1', 'cummins-nta855-g1a', 'cummins-nta855-g1b',
      'cummins-nta855-g2', 'cummins-nta855-g2a',
      'cummins-nta855-g3', 'cummins-nta855-g4',
      'cummins-ntaa855-g7', 'cummins-ntaa855-g7a',
    ],
  ],
  [
    'https://www.cummins.com/sites/default/files/2019-05/NTA855G4.pdf',
    'nta855-g4-specsheet.pdf',
    'NTA855-G4 Specification Sheet',
    'datasheet',
    ['cummins-nta855-g4'],
  ],
  [
    'https://www.hosempower.com/uploadfile/downloads/NTAA855-G7%E6%95%B0%E6%8D%AE%E5%8D%95%EF%BC%88%E8%8B%B1%EF%BC%89.pdf',
    'ntaa855-g7-datasheet.pdf',
    'NTAA855-G7 Data Sheet (DS-164E)',
    'datasheet',
    ['cummins-ntaa855-g7'],
  ],
  [
    'https://topone-power.com/wp-content/uploads/NTAA855-G7A.pdf',
    'ntaa855-g7a-specsheet.pdf',
    'NTAA855-G7A Specification Sheet',
    'datasheet',
    ['cummins-ntaa855-g7a'],
  ],

  // ── M15 Series ────────────────────────────────────────────────────────────
  [
    'https://nilniroo.com/wp-content/uploads/2024/M15-G8.pdf',
    'm15-g8-specsheet.pdf',
    'M15-G8 Specification Sheet',
    'datasheet',
    ['cummins-m15-g8'],
  ],

  // ── K19 Series (KTA19 / KTAA19) ───────────────────────────────────────────
  [
    'https://www.cummins.com/sites/default/files/2019-08/KTA19-G4%20Coolpac_3.pdf',
    'kta19-g4-specsheet.pdf',
    'KTA19-G4 Specification Sheet',
    'datasheet',
    ['cummins-kta19-g4'],
  ],
  [
    'https://www.cummins.com/sites/default/files/2023-05/600-625kVA_KTAA19_Specsheet_Rev-5.pdf',
    'ktaa19-600-625kva-specsheet.pdf',
    'KTAA19 600–625 kVA Specification Sheet',
    'datasheet',
    [
      'cummins-ktaa19-g5', 'cummins-ktaa19-g6',
      'cummins-ktaa19-g6a', 'cummins-ktaa19-g7',
    ],
  ],
  [
    'https://www.cummins.com/sites/default/files/india/Gen%20Set%20Specifications/KTAA19_500%20kVA.pdf',
    'ktaa19-500kva-specsheet.pdf',
    'KTAA19 500 kVA Specification Sheet',
    'datasheet',
    ['cummins-ktaa19-g5'],
  ],

  // ── K38 Series (KT38 / KTA38) ─────────────────────────────────────────────
  [
    'https://mart.cummins.com/imagelibrary/data/assetfiles/0043063.pdf',
    'k38-series-brochure.pdf',
    'K38 Series Brochure',
    'brochure',
    [
      'cummins-kt38-g', 'cummins-kt38-ga',
      'cummins-kta38-g1', 'cummins-kta38-g1b',
      'cummins-kta38-g2', 'cummins-kta38-g2a', 'cummins-kta38-g2b',
      'cummins-kta38-g4', 'cummins-kta38-g4b',
      'cummins-kta38-g5',
      'cummins-kta38-g9',
      'cummins-kta38-g2e', 'cummins-kta38-g5e',
      'cummins-kta38-g7e', 'cummins-kta38-g9e', 'cummins-kta38-g9a',
    ],
  ],
  [
    'https://www.cummins.com/sites/default/files/2019-05/KTA38G4.pdf',
    'kta38-g4-specsheet.pdf',
    'KTA38-G4 Specification Sheet',
    'datasheet',
    ['cummins-kta38-g4', 'cummins-kta38-g4b'],
  ],

  // ── K50 Series (KTA50) ────────────────────────────────────────────────────
  [
    'https://mart.cummins.com/imagelibrary/data/assetfiles/0042477.pdf',
    'kta50-series-brochure.pdf',
    'KTA50 Series Brochure',
    'brochure',
    [
      'cummins-kta50-g3', 'cummins-kta50-g12', 'cummins-kta50-g12a',
      'cummins-kta50-g8', 'cummins-kta50-gs8',
      'cummins-kta50-g9', 'cummins-kta50-g15x', 'cummins-kta50-g16b',
      'cummins-kta50-g3e', 'cummins-kta50-g7e', 'cummins-kta50-g8e',
      'cummins-kta50-g15a', 'cummins-kta50-g16a',
    ],
  ],
  [
    'https://www.cummins.com/sites/default/files/2019-08/KTA50-G3.pdf',
    'kta50-g3-specsheet.pdf',
    'KTA50-G3 Specification Sheet',
    'datasheet',
    ['cummins-kta50-g3', 'cummins-kta50-g3e'],
  ],
  [
    'https://www.cummins.com/sites/default/files/2019-08/KTA50-G8.pdf',
    'kta50-g8-specsheet.pdf',
    'KTA50-G8 Specification Sheet',
    'datasheet',
    ['cummins-kta50-g8', 'cummins-kta50-g8e'],
  ],
  [
    'https://www.cummins.com/sites/default/files/2019-08/KTA50-GS8.pdf',
    'kta50-gs8-specsheet.pdf',
    'KTA50-GS8 Specification Sheet',
    'datasheet',
    ['cummins-kta50-gs8'],
  ],
  [
    'https://mart.cummins.com/imagelibrary/data/assetfiles/0070368.pdf',
    'kta50-g9-specsheet.pdf',
    'KTA50-G9 Specification Sheet',
    'datasheet',
    ['cummins-kta50-g9'],
  ],

  // ── QSM11 Series ──────────────────────────────────────────────────────────
  // Per-variant performance data sheets (Xi'an Cummins / XCEC, also in CCEC portfolio)
  [
    'https://www.baifapower.com/static/upload/download/FADONGJI/QSM11-G1.pdf',
    'qsm11-g1-datasheet.pdf',
    'QSM11-G1 Engine Performance Data Sheet',
    'datasheet',
    ['cummins-qsm11-g1'],
  ],
  [
    'https://www.baifapower.com/static/upload/download/FADONGJI/QSM11-G2.pdf',
    'qsm11-g2-datasheet.pdf',
    'QSM11-G2 Engine Performance Data Sheet',
    'datasheet',
    ['cummins-qsm11-g2'],
  ],
  [
    'https://www.baifapower.com/static/upload/download/FADONGJI/QSM11-G3.pdf',
    'qsm11-g3-datasheet.pdf',
    'QSM11-G3 Engine Performance Data Sheet',
    'datasheet',
    ['cummins-qsm11-g3'],
  ],
  [
    'https://www.baifapower.com/static/upload/download/FADONGJI/QSM11-G4.pdf',
    'qsm11-g4-datasheet.pdf',
    'QSM11-G4 Engine Performance Data Sheet',
    'datasheet',
    ['cummins-qsm11-g4'],
  ],
  [
    'https://www.baifapower.com/static/upload/download/FADONGJI/QSM11-G5.pdf',
    'qsm11-g5-datasheet.pdf',
    'QSM11-G5 Engine Performance Data Sheet',
    'datasheet',
    ['cummins-qsm11-g5'],
  ],
  [
    'https://www.baifapower.com/static/upload/download/FADONGJI/QSM11-G6.pdf',
    'qsm11-g6-datasheet.pdf',
    'QSM11-G6 Engine Performance Data Sheet',
    'datasheet',
    ['cummins-qsm11-g6'],
  ],

  // ── QSN Series (QSNT) ─────────────────────────────────────────────────────
  [
    'https://www.baifapower.com/static/upload/download/fadongji2/QSNT-G3.pdf',
    'qsnt-g3-datasheet.pdf',
    'QSNT-G3 Engine Performance Data Sheet',
    'datasheet',
    ['cummins-qsnt-g3'],
  ],

  // ── QSK19 Series ──────────────────────────────────────────────────────────
  [
    'https://www.cummins.com/sites/default/files/2019-06/QSK19G4.pdf',
    'qsk19-g4-specsheet.pdf',
    'QSK19-G4 Specification Sheet',
    'datasheet',
    ['cummins-qsk19-g4'],
  ],
  [
    'https://www.cummins.com/sites/default/files/2018-10/QSK19-G5.pdf',
    'qsk19-g5-specsheet.pdf',
    'QSK19-G5 Specification Sheet',
    'datasheet',
    ['cummins-qsk19-g5', 'cummins-qsk19-g8'],
  ],

  // ── QSK38 Series ──────────────────────────────────────────────────────────
  [
    'https://www.cummins.com/sites/default/files/2019-08/QSK38-G1.pdf',
    'qsk38-g1-specsheet.pdf',
    'QSK38-G1 Specification Sheet',
    'datasheet',
    ['cummins-qsk38-g1'],
  ],
  [
    'https://www.cummins.com/sites/default/files/2018-10/QSK38-G4.pdf',
    'qsk38-g4-specsheet.pdf',
    'QSK38-G4 Specification Sheet',
    'datasheet',
    ['cummins-qsk38-g4'],
  ],
  [
    'https://www.cummins.com/sites/default/files/2018-10/QSK38-G5.pdf',
    'qsk38-g5-specsheet.pdf',
    'QSK38-G5 Specification Sheet',
    'datasheet',
    ['cummins-qsk38-g5', 'cummins-qsk38-g19'],
  ],
  [
    'https://www.cummins.com/sites/default/files/2022-07/centum-qsk38-specification-sheet-revd.pdf',
    'qsk38-centum-specsheet.pdf',
    'QSK38 Centum Series Specification Sheet (Rev D)',
    'datasheet',
    [
      'cummins-qsk38-g26', 'cummins-qsk38-g27', 'cummins-qsk38-g28',
      'cummins-qsk38-g29', 'cummins-qsk38-g30', 'cummins-qsk38-g31',
      'cummins-qsk38-g32',
    ],
  ],
]

// ── Main ──────────────────────────────────────────────────────────────────────

const allSlugs = [...new Set(SPEC_SHEETS.flatMap(([,,,,slugs]) => slugs))]
const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', allSlugs)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${allSlugs.length} engine records\n`)

let downloaded = 0, uploaded = 0, failed = 0, skipped = 0

for (const [sourceUrl, filename, label, pdfType, slugs] of SPEC_SHEETS) {
  const storagePath = `${STORAGE_PREFIX}/${filename}`
  const localPath = path.join(TMP_DIR, filename)

  process.stdout.write(`📥 ${filename} ... `)

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

  // Upload (compresses if >5MB)
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

  // Link to engines
  const fileSize = fs.statSync(localPath).size
  for (const slug of slugs) {
    const engineId = slugToId[slug]
    if (!engineId) { console.warn(`  ⚠️  Not in DB: ${slug}`); continue }

    await supabase.from('engine_pdfs').delete()
      .eq('engine_id', engineId).eq('storage_path', storagePath)

    const { error: insertErr } = await supabase.from('engine_pdfs').insert({
      engine_id: engineId,
      type: pdfType,
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
console.log(`\nModels with no individual spec sheet found:`)
console.log(`  NT855-GA, NTA855-G1/G1A/G1B/G2/G2A/G3 → series brochure only`)
console.log(`  M15-G3/G4/G5/G6/G7 → no public spec sheets found`)
console.log(`  KTA19-G2/G3/G3A/G8/G8E/G8A/G9A → no individual spec sheets found`)
console.log(`  KTA38-G1/G1B/G2/G2A/G2B/G5/G9/G2E/G5E/G7E/G9E/G9A → series brochure only`)
console.log(`  KTA50-G12/G12A/G7E/G15X/G15A/G16A/G16B → series brochure only`)
console.log(`  QSNT-G1/G2/G4X/G6/G7 → no public spec sheets found`)
console.log(`  QSK19-G6/G11/G12/G13/G14/G31/G32/G33/G34/G35 → no spec sheets found`)
console.log(`  QSK38-G2/G6/G7/G8 → no spec sheets found`)
