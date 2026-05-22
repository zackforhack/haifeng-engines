// Downloads spec sheets for Perkins regulated engines (EU Stage IIIA / Stage V / EPA Tier 3/4)
// from Caterpillar/Perkins CDN and uploads to Supabase, linking to engine records.
// Sources: s7d2.scene7.com (Caterpillar CDN), emc.perkins.com (Perkins publications), americasgenerators.com
//
// Skips engines already covered by download-upload-perkins-specsheets.mjs:
//   403D-11G, 403D-15G, 404D-22G, 404D-22TG, 1104D-E44TG1/TAG1/TAG2, 2506C-E15TAG2/3/4
//
// Manually uploaded via upload-perkins-missing-specsheets.mjs: 904J-E36TAG1/3, 1103D-33G2, 2406J-E13TAG3
// Note: 1106J-E70TAG3 and 1204J-E44TAG1 may be incorrect DB entries (no such Perkins models exist)

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
const STORAGE_PREFIX = 'perkins/spec-sheets'
const TMP_DIR = path.join(os.tmpdir(), 'perkins-reg-specsheets')
const BASE = 'https://s7d2.scene7.com/is/content/Caterpillar/'
const EMC = 'https://emc.perkins.com/pubdirect.ashx?media_string_id='

fs.mkdirSync(TMP_DIR, { recursive: true })

// [sourceUrl, storageFilename, label, slugs[]]
const SPEC_SHEETS = [

  // ── 400 Series — 402D / 403D Electro Units (Stage IIIA, 60 Hz) ──────────
  [BASE + 'C10378905', '402D-05G.pdf',
    'Perkins 402D-05G Electro Unit Spec Sheet',
    ['perkins-402d-05g']],

  [BASE + 'C10378948', '403D-07G.pdf',
    'Perkins 403D-07G Electro Unit Spec Sheet',
    ['perkins-403d-07g']],

  // ── 400 J/F Series — range doc (EU Stage V / EPA Tier 4 Final) ──────────
  [EMC + 'PN3214', '403JF-electric-power.pdf',
    'Perkins 403J and 403F Electric Power Engines',
    ['perkins-403j-07g', 'perkins-403j-11g', 'perkins-403f-11g']],

  // ── 404J Series — range doc (EU Stage V / EPA Tier 4 Final) ─────────────
  [EMC + 'PN3218', '404J-electric-power.pdf',
    'Perkins 404J Electric Power Engines',
    ['perkins-404j-22g', 'perkins-404j-e22tag']],

  // ── 1100 Series — 1104D-44TG individual datasheets (Stage IIIA, no E) ───
  [BASE + 'C10379358', '1104D-44TG1.pdf',
    'Perkins 1104D-44TG1 ElectropaK Spec Sheet',
    ['perkins-1104d-44tg1']],

  [BASE + 'C10509502', '1104D-44TG2.pdf',
    'Perkins 1104D-44TG2 ElectropaK Spec Sheet',
    ['perkins-1104d-44tg2']],

  // ── 1100 Series — 1106D range doc (EU Stage IIIA / EPA Tier 3) ──────────
  [BASE + 'CM20210126-a40e3-cffa5', '1106D-E70TAG-electric-power.pdf',
    'Perkins 1106D-E70TAG Electric Power Engines (TAG2 / TAG3 / TAG4 / TAG5)',
    ['perkins-1106d-e70tag2', 'perkins-1106d-e70tag3',
     'perkins-1106d-e70tag4', 'perkins-1106d-e70tag5']],

  // ── 1200 Series — 1204J-E44TTAG2 (EU Stage V / EPA Tier 4 Final) ────────
  [BASE + 'CM20201201-5a9e6-70e85', '1204J-E44TTAG2-electric-power.pdf',
    'Perkins 1204J-E44TTAG2 Electric Power Engines',
    ['perkins-1204j-e44ttag2']],

  // ── 1200 Series — 1206D individual datasheets (EU Stage IIIA) ───────────
  [EMC + 'PN3183', '1206D-E70TTAG1.pdf',
    'Perkins 1206D-E70TTAG1 ElectropaK Spec Sheet',
    ['perkins-1206d-e70ttag1']],

  [EMC + 'PN3182', '1206D-E70TTAG2.pdf',
    'Perkins 1206D-E70TTAG2 ElectropaK Spec Sheet',
    ['perkins-1206d-e70ttag2']],

  [EMC + 'PN3181', '1206D-E70TTAG3.pdf',
    'Perkins 1206D-E70TTAG3 ElectropaK Spec Sheet',
    ['perkins-1206d-e70ttag3']],

  // ── 1200 Series — 1206J range doc (EU Stage V / EPA Tier 4 Final) ────────
  [BASE + 'CM20201201-02bf5-2b016', '1206J-E70TTAG-electric-power.pdf',
    'Perkins 1206J-E70TTAG Electric Power Engines (TTAG3 / TTAG4)',
    ['perkins-1206j-e70ttag3', 'perkins-1206j-e70ttag4']],

  // ── 1700 Series — 1706D range doc (EU Stage IIIA / EPA Tier 3) ──────────
  [BASE + 'CM20200415-22992-fcdea', '1706D-E93TAG-electric-power.pdf',
    'Perkins 1706D-E93TAG Electric Power Engines (TAG1 / TAG2)',
    ['perkins-1706d-e93tag1', 'perkins-1706d-e93tag2']],

  // ── 1700 Series — 1706J range doc (EU Stage V / EPA Tier 4 Final) ────────
  [BASE + 'CM20200707-312d7-96661', '1706J-E93TAG-electric-power.pdf',
    'Perkins 1706J-E93TAG Electric Power Engines (TAG1 / TAG2)',
    ['perkins-1706j-e93tag1', 'perkins-1706j-e93tag2']],

  // ── 2200 Series — 2206D range doc (EU Stage IIIA, 1800 rpm) ─────────────
  [BASE + 'CM20240206-3da4c-111b5', '2206D-E13TAG-electric-power.pdf',
    'Perkins 2206D-E13TAG Electric Power Engines (TAG2 / TAG3)',
    ['perkins-2206d-e13tag2', 'perkins-2206d-e13tag3']],

  // ── 2500 Series — 2506D-E15TAG1 (EU Stage IIIA / EPA Tier 3) ────────────
  ['https://www.americasgenerators.com/1-tp-spec-sheets/perkins-epa/tp-p450-t3-60/2506d-e15tag1.pdf',
    '2506D-E15TAG1.pdf',
    'Perkins 2506D-E15TAG1 ElectropaK Spec Sheet',
    ['perkins-2506d-e15tag1']],

  // ── 2800 Series — 2806J (EU Stage V / EPA Tier 4 Final) ─────────────────
  [BASE + 'CM20221102-c552c-b1ff6', '2806J-E18TAG1-electric-power.pdf',
    'Perkins 2806J-E18TAG1 Electric Power Engines',
    ['perkins-2806j-e18tag1']],

  // ── 2800 Series — 2806F (EU Stage IIIA) ─────────────────────────────────
  [BASE + 'CM20180115-18618-25916', '2806F-E18TAG1.pdf',
    'Perkins 2806F-E18TAG1 ElectropaK Spec Sheet',
    ['perkins-2806f-e18tag1']],

  // ── 2800 Series — 2806C range doc (EU Stage IIIA) ────────────────────────
  [BASE + 'CM20200225-5a6fa-fae96', '2806C-E18TAG-TTAG-electric-power.pdf',
    'Perkins 2806C-E18TAG/TTAG Electric Power Engines (TAG3 / TTAG6 / TTAG7)',
    ['perkins-2806c-e18tag3', 'perkins-2806c-e18ttag6', 'perkins-2806c-e18ttag7']],
]

// Fetch all engine IDs upfront
const allSlugs = [...new Set(SPEC_SHEETS.flatMap(([,,, slugs]) => slugs))]
const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', allSlugs)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${allSlugs.length} engine records\n`)

const missing = allSlugs.filter(s => !slugToId[s])
if (missing.length) console.warn('Missing slugs:', missing)

let downloaded = 0, uploaded = 0, failed = 0, skipped = 0

for (const [sourceUrl, filename, label, slugs] of SPEC_SHEETS) {
  const storagePath = `${STORAGE_PREFIX}/${filename}`
  const localPath = path.join(TMP_DIR, filename)

  process.stdout.write(`📥 ${filename} ... `)

  let downloadOk = false
  try {
    const res = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bot)' }
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

  const fileSize = fs.statSync(localPath).size
  for (const slug of slugs) {
    const engineId = slugToId[slug]
    if (!engineId) { console.warn(`  ⚠️  Not in DB: ${slug}`); continue }

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
