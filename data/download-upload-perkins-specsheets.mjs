// Downloads Perkins unregulated engine spec sheets from Caterpillar/Perkins CDN
// and uploads them to Supabase, linking each to the relevant engine records.
// Source: s7d2.scene7.com (official Perkins/Caterpillar CDN)

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
const TMP_DIR = path.join(os.tmpdir(), 'perkins-specsheets')
const BASE = 'https://s7d2.scene7.com/is/content/Caterpillar/'

fs.mkdirSync(TMP_DIR, { recursive: true })

// [sourceUrl, storageFilename, label, slugs[]]
// Individual ElectropaK datasheets are linked only to their specific engine(s).
// Range/family "Electric Power Engines" docs are linked to all covered engines.
const SPEC_SHEETS = [

  // ── 400 Series — individual datasheets ───────────────────────────────────
  [BASE + 'C10378954', '403D-11G-1500rpm.pdf',
    'Perkins 403D-11G ElectropaK Spec Sheet (50 Hz)',
    ['perkins-403d-11g']],

  [BASE + 'C10378957', '403D-11G-1800rpm.pdf',
    'Perkins 403D-11G ElectropaK Spec Sheet (60 Hz)',
    ['perkins-403d-11g']],

  [BASE + 'C10378968', '403D-15G.pdf',
    'Perkins 403D-15G ElectropaK Spec Sheet',
    ['perkins-403d-15g']],

  [BASE + 'C10378937', '403A-15G2.pdf',
    'Perkins 403A-15G2 ElectropaK Spec Sheet',
    ['perkins-403a-15g2']],

  [BASE + 'CM20150115-18736-14287', '404D-22G.pdf',
    'Perkins 404D-22G ElectropaK Spec Sheet',
    ['perkins-404d-22g']],

  [BASE + 'C10379000', '404D-22TG.pdf',
    'Perkins 404D-22TG ElectropaK Spec Sheet',
    ['perkins-404d-22tg']],

  // ── 1100 Series — 1103A range doc (covers 33G, 33TG1, 33TG2) ─────────────
  [BASE + 'CM20250306-85c42-20d93', '1103A-33-electric-power.pdf',
    'Perkins 1103A-33 Electric Power Engines (33G / 33TG1 / 33TG2)',
    ['perkins-1103a-33g', 'perkins-1103a-33tg1', 'perkins-1103a-33tg2']],

  // ── 1100 Series — 1104A individual datasheets ─────────────────────────────
  [BASE + 'C10379337', '1104A-44TG1.pdf',
    'Perkins 1104A-44TG1 ElectropaK Spec Sheet',
    ['perkins-1104a-44tg1']],

  [BASE + 'CM20150115-36128-51692', '1104A-44TG2.pdf',
    'Perkins 1104A-44TG2 ElectropaK Spec Sheet',
    ['perkins-1104a-44tg2']],

  // ── 1100 Series — 1104C-44TAG2 range doc ─────────────────────────────────
  [BASE + 'CM20210301-71b53-158d1', '1104C-44TAG-electric-power.pdf',
    'Perkins 1104C-44TAG Electric Power Engines',
    ['perkins-1104c-44tag2']],

  // ── 1100 Series — 1106A range doc (covers TG1, TAG2, TAG3, TAG4) ─────────
  [BASE + 'CM20210301-e3760-08c3c', '1106A-70TAG-electric-power.pdf',
    'Perkins 1106A-70TG/TAG Electric Power Engines (TG1 / TAG2 / TAG3 / TAG4)',
    ['perkins-1106a-70tg1', 'perkins-1106a-70tag2',
     'perkins-1106a-70tag3', 'perkins-1106a-70tag4']],

  // ── 1200 Series — individual datasheets ──────────────────────────────────
  [BASE + 'CM20180522-38894-46970', '1206A-E70TTAG1.pdf',
    'Perkins 1206A-E70TTAG1 ElectropaK Spec Sheet',
    ['perkins-1206a-e70ttag1']],

  [BASE + 'CM20180522-38894-00214', '1206A-E70TTAG2.pdf',
    'Perkins 1206A-E70TTAG2 ElectropaK Spec Sheet',
    ['perkins-1206a-e70ttag2']],

  [BASE + 'CM20180522-38894-37737', '1206A-E70TTAG3.pdf',
    'Perkins 1206A-E70TTAG3 ElectropaK Spec Sheet',
    ['perkins-1206a-e70ttag3']],

  // ── 1700 Series ───────────────────────────────────────────────────────────
  [BASE + 'CM20190212-19944-32504', '1706A-E93TAG1-electric-power.pdf',
    'Perkins 1706A-E93TAG1 Electric Power Engines',
    ['perkins-1706a-e93tag1']],

  [BASE + 'CM20231117-edd24-4ff07', '1706A-E93TAG2-electric-power.pdf',
    'Perkins 1706A-E93TAG2 Electric Power Engines',
    ['perkins-1706a-e93tag2']],

  // ── 2200 Series — individual datasheets ──────────────────────────────────
  [BASE + 'C10414624', '2206C-E13TAG2.pdf',
    'Perkins 2206C-E13TAG2 ElectropaK Spec Sheet',
    ['perkins-2206c-e13tag2']],

  [BASE + 'C10414626', '2206C-E13TAG3.pdf',
    'Perkins 2206C-E13TAG3 ElectropaK Spec Sheet',
    ['perkins-2206c-e13tag3']],

  [BASE + 'C10378942', '2206A-E13TAG6.pdf',
    'Perkins 2206A-E13TAG6 ElectropaK Spec Sheet',
    ['perkins-2206a-e13tag6']],

  // ── 2200 Series — range docs (covers TAG5 and all 2206C/2206A variants) ──
  [BASE + 'CM20240206-653e2-06e37', '2206C-E13TAG-electric-power.pdf',
    'Perkins 2206C-E13TAG Electric Power Engines (TAG2 / TAG3 / TAG5)',
    ['perkins-2206c-e13tag2', 'perkins-2206c-e13tag3', 'perkins-2206c-e13tag5']],

  [BASE + 'CM20240206-b483c-15de5', '2206A-E13TAG-electric-power.pdf',
    'Perkins 2206A-E13TAG Electric Power Engines (TAG5 / TAG6)',
    ['perkins-2206c-e13tag5', 'perkins-2206a-e13tag6']],

  // ── 2500 Series — individual datasheets ──────────────────────────────────
  [BASE + 'C10378960', '2506C-E15TAG1.pdf',
    'Perkins 2506C-E15TAG1 ElectropaK Spec Sheet',
    ['perkins-2506c-e15tag1']],

  [BASE + 'C10378962', '2506C-E15TAG2.pdf',
    'Perkins 2506C-E15TAG2 ElectropaK Spec Sheet',
    ['perkins-2506c-e15tag2']],

  [BASE + 'C10378964', '2506C-E15TAG3.pdf',
    'Perkins 2506C-E15TAG3 ElectropaK Spec Sheet',
    ['perkins-2506c-e15tag3']],

  [BASE + 'C10378966', '2506C-E15TAG4.pdf',
    'Perkins 2506C-E15TAG4 ElectropaK Spec Sheet',
    ['perkins-2506c-e15tag4']],

  // ── 2800 Series — individual datasheets ──────────────────────────────────
  [BASE + 'C10414620', '2806C-E18TAG1A.pdf',
    'Perkins 2806C-E18TAG1A ElectropaK Spec Sheet',
    ['perkins-2806c-e18tag1a']],

  [BASE + 'C10378976', '2806A-E18TAG2.pdf',
    'Perkins 2806A-E18TAG2 ElectropaK Spec Sheet',
    ['perkins-2806a-e18tag2']],

  [BASE + 'C10379009', '2806A-E18TAG3.pdf',
    'Perkins 2806A-E18TAG3 ElectropaK Spec Sheet',
    ['perkins-2806a-e18tag3']],

  // ── 2800 Series — range docs (covers TTAG4 through TTAG7) ────────────────
  [BASE + 'CM20200225-5a6fa-fae96', '2806C-E18TAG-TTAG-electric-power.pdf',
    'Perkins 2806C-E18TAG/TTAG Electric Power Engines',
    ['perkins-2806c-e18tag1a']],

  [BASE + 'CM20200212-73080-68bae', '2806A-E18TAG-TTAG-electric-power.pdf',
    'Perkins 2806A-E18TAG/TTAG Electric Power Engines (TAG2-7)',
    ['perkins-2806a-e18tag2', 'perkins-2806a-e18tag3',
     'perkins-2806a-e18ttag4', 'perkins-2806a-e18ttag5',
     'perkins-2806a-e18ttag6', 'perkins-2806a-e18ttag7']],

  // ── 4006 Series — individual datasheets ──────────────────────────────────
  [BASE + 'CM20150119-33535-61834', '4006-23TAG2A.pdf',
    'Perkins 4006-23TAG2A ElectropaK Spec Sheet',
    ['perkins-4006-23tag2a']],

  [BASE + 'CM20150119-33864-49688', '4006-23TAG3A.pdf',
    'Perkins 4006-23TAG3A ElectropaK Spec Sheet',
    ['perkins-4006-23tag3a']],

  // ── 4008 Series — combined datasheet (TAG1A + TAG2A) ─────────────────────
  ['https://gtipowergeneration.com/wp-content/uploads/products/pdf/P50-4008TAG1A-and-2A.pdf',
    '4008TAG1A-TAG2A.pdf',
    'Perkins 4008TAG1A / TAG2A ElectropaK Spec Sheet',
    ['perkins-4008tag1a', 'perkins-4008tag2a']],

  // ── 4000 Series range doc (4008TAG2, 4008-30TAG3, 4012-46TAG, 4016TAG) ───
  [BASE + 'CM20190227-14078-63105', '4000-series-electric-power.pdf',
    'Perkins 4000 Series Electric Power Engines Range',
    ['perkins-4008tag2', 'perkins-4008-30tag3',
     'perkins-4016tag1a', 'perkins-4016tag2a']],

  // ── 4012 Series — range docs ──────────────────────────────────────────────
  [BASE + 'CM20200428-fb404-39c32', '4012-46TWG-electric-power.pdf',
    'Perkins 4012-46TWG Electric Power Engines (TWG2A / TWG3A)',
    ['perkins-4012-46twg2a', 'perkins-4012-46twg3a']],

  [BASE + 'CM20200428-328e2-922da', '4012-46TAG-electric-power.pdf',
    'Perkins 4012-46TAG Electric Power Engines (TAG2A / TAG3A)',
    ['perkins-4012-46tag2a', 'perkins-4012-46tag3a']],

  // ── 4016 Series — range doc ───────────────────────────────────────────────
  [BASE + 'CM20200428-27388-47363', '4016-61TRG-electric-power.pdf',
    'Perkins 4016-61TRG Electric Power Engines (TRG1 / TRG2 / TRG3 / TRG3X)',
    ['perkins-4016-61trg1', 'perkins-4016-61trg2',
     'perkins-4016-61trg3', 'perkins-4016-61trg3x']],
]

// Fetch all engine IDs upfront
const allSlugs = [...new Set(SPEC_SHEETS.flatMap(([,,, slugs]) => slugs))]
const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', allSlugs)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${allSlugs.length} engine records\n`)

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
