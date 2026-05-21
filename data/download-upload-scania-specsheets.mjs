// Downloads individual Scania engine spec sheets from scania.com and uploads to Supabase
// Source URLs discovered via site:scania.com search — two base paths used by Scania:
//   BASE_WWW  = DC13 series (next-generation path)
//   BASE_NOE  = DC16/OC16 series (scanianoe path)
//   BASE_NOE1 = older DC16/OC16 variants (scanianoe/power-gen1 path)

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
const STORAGE_PREFIX = 'scania/spec-sheets'
const TMP_DIR = path.join(os.tmpdir(), 'scania-specsheets')
fs.mkdirSync(TMP_DIR, { recursive: true })

const BASE_WWW  = 'https://www.scania.com/content/dam/www/market/master/products/power-solutions/engine-pdfs-next-generation/power-generation/'
const BASE_NOE  = 'https://www.scania.com/content/dam/scanianoe/market/master/products-and-services/engines/pdf/specs/power-gen/'
const BASE_NOE1 = 'https://www.scania.com/content/dam/scanianoe/market/master/products-and-services/engines/pdf/specs/power-gen1/'

// [source_url, storage_filename, label, slugs[]]
const SPEC_SHEETS = [
  // ── DC13 505A · EU Stage V ───────────────────────────────────────────────
  [BASE_WWW + 'DC13-505A_300-300kVA_ATS.pdf', 'DC13-505A_300-300kVA_ATS.pdf',
    'Scania DC13 505A 300 kVA Spec Sheet', ['scania-dc13-505a-300']],
  [BASE_WWW + 'DC13-505A_350-350kVA_ATS.pdf', 'DC13-505A_350-350kVA_ATS.pdf',
    'Scania DC13 505A 350 kVA Spec Sheet', ['scania-dc13-505a-350']],
  [BASE_WWW + 'DC13-505A_400-400kVA_ATS.pdf', 'DC13-505A_400-400kVA_ATS.pdf',
    'Scania DC13 505A 400 kVA Spec Sheet', ['scania-dc13-505a-400']],
  // 450 kVA: Scania publishes a combined 505A/506A sheet
  [BASE_WWW + 'DC13-505_506A_450-450kVA_ATS.pdf', 'DC13-505_506A_450-450kVA_ATS.pdf',
    'Scania DC13 505A / 506A 450 kVA Spec Sheet', ['scania-dc13-505a-450', 'scania-dc13-506a-450']],
  [BASE_WWW + 'DC13-505A_500-500kVA_ATS.pdf', 'DC13-505A_500-500kVA_ATS.pdf',
    'Scania DC13 505A 500 kVA Spec Sheet', ['scania-dc13-505a-500']],

  // ── DC13 506A · China IV ─────────────────────────────────────────────────
  [BASE_WWW + 'DC13-506A_300-300kVA_ATS.pdf', 'DC13-506A_300-300kVA_ATS.pdf',
    'Scania DC13 506A 300 kVA Spec Sheet', ['scania-dc13-506a-300']],
  [BASE_WWW + 'DC13-506A_350-350kVA_ATS.pdf', 'DC13-506A_350-350kVA_ATS.pdf',
    'Scania DC13 506A 350 kVA Spec Sheet', ['scania-dc13-506a-350']],
  [BASE_WWW + 'DC13-506A_400-400kVA_ATS.pdf', 'DC13-506A_400-400kVA_ATS.pdf',
    'Scania DC13 506A 400 kVA Spec Sheet', ['scania-dc13-506a-400']],
  // 450 kVA: shared with 505A (entry already above)
  [BASE_WWW + 'DC13-506A_500-500kVA_ATS.pdf', 'DC13-506A_500-500kVA_ATS.pdf',
    'Scania DC13 506A 500 kVA Spec Sheet', ['scania-dc13-506a-500']],

  // ── DC13 507A · Unregulated (prime/standby ratings) ──────────────────────
  [BASE_WWW + 'DC13-507A_300-330kVA.pdf', 'DC13-507A_300-330kVA.pdf',
    'Scania DC13 507A 300/330 kVA Spec Sheet', ['scania-dc13-507a-300']],
  [BASE_WWW + 'DC13-507A_350-385kVA.pdf', 'DC13-507A_350-385kVA.pdf',
    'Scania DC13 507A 350/385 kVA Spec Sheet', ['scania-dc13-507a-350']],
  [BASE_WWW + 'DC13-507A_400-440kVA.pdf', 'DC13-507A_400-440kVA.pdf',
    'Scania DC13 507A 400/440 kVA Spec Sheet', ['scania-dc13-507a-400']],
  [BASE_WWW + 'DC13-507A_450-495kVA.pdf', 'DC13-507A_450-495kVA.pdf',
    'Scania DC13 507A 450/495 kVA Spec Sheet', ['scania-dc13-507a-450']],
  [BASE_WWW + 'DC13-507A_500-550kVA.pdf', 'DC13-507A_500-550kVA.pdf',
    'Scania DC13 507A 500/550 kVA Spec Sheet', ['scania-dc13-507a-500']],
  // NOTE: 550 and 600 kVA variants (507A) — no individual spec sheets found on scania.com

  // ── DC16 320A · EU Stage V ───────────────────────────────────────────────
  [BASE_NOE + 'DC16-320A_398-408kW_ATS.pdf', 'DC16-320A_398-408kW_ATS.pdf',
    'Scania DC16 320A 02-61 Spec Sheet', ['scania-dc16-320a-02-61']],
  [BASE_NOE + 'DC16-320A_439-449kW_ATS.pdf', 'DC16-320A_439-449kW_ATS.pdf',
    'Scania DC16 320A 02-62 Spec Sheet', ['scania-dc16-320a-02-62']],
  [BASE_NOE + 'DC16-320A_481-491kW_ATS.pdf', 'DC16-320A_481-491kW_ATS.pdf',
    'Scania DC16 320A 02-63 Spec Sheet', ['scania-dc16-320a-02-63']],

  // ── DC16 084A · US Tier 4f · 60 Hz ──────────────────────────────────────
  [BASE_NOE + 'DC1684A_367kW_SCR.pdf', 'DC1684A_367kW_SCR.pdf',
    'Scania DC16 084A 01-01A Spec Sheet (400 kVA)', ['scania-dc16-084a-01-01a']],
  [BASE_NOE + 'DC1684A_436kW_SCR.pdf', 'DC1684A_436kW_SCR.pdf',
    'Scania DC16 084A 01-01B Spec Sheet (480 kVA)', ['scania-dc16-084a-01-01b']],
  [BASE_NOE + 'DC1684A_448kW_SCR.pdf', 'DC1684A_448kW_SCR.pdf',
    'Scania DC16 084A 01-01C Spec Sheet (500 kVA)', ['scania-dc16-084a-01-01c']],

  // ── DC16 071A · EU Stage IIIA ────────────────────────────────────────────
  [BASE_NOE + 'DC1671A_438-483kW.pdf', 'DC1671A_438-483kW.pdf',
    'Scania DC16 071A 02-01 Spec Sheet', ['scania-dc16-071a-02-01']],
  [BASE_NOE + 'DC1671A_480-483kW.pdf', 'DC1671A_480-483kW.pdf',
    'Scania DC16 071A 02-02 Spec Sheet', ['scania-dc16-071a-02-02']],

  // ── DC16 093A · Fuel Optimised ───────────────────────────────────────────
  // NOTE: 02-51 (451 kW) — no spec sheet found on scania.com
  [BASE_NOE  + 'DC1693A_486-538kW.pdf', 'DC1693A_486-538kW.pdf',
    'Scania DC16 093A 02-52 Spec Sheet', ['scania-dc16-093a-02-52']],
  [BASE_NOE1 + 'DC1693A_529-585kW.pdf', 'DC1693A_529-585kW.pdf',
    'Scania DC16 093A 02-53 Spec Sheet', ['scania-dc16-093a-02-53']],
  [BASE_NOE  + 'DC1693A_558-634kW.pdf', 'DC1693A_558-634kW.pdf',
    'Scania DC16 093A 02-54 Spec Sheet', ['scania-dc16-093a-02-54']],

  // ── DC16 078A · Fuel Optimised ───────────────────────────────────────────
  [BASE_NOE + 'DC1678A_534-587kW.pdf', 'DC1678A_534-587kW.pdf',
    'Scania DC16 078A 02-41 Spec Sheet', ['scania-dc16-078a-02-41']],
  [BASE_NOE + 'DC1678A_576-634kW.pdf', 'DC1678A_576-634kW.pdf',
    'Scania DC16 078A 02-42 Spec Sheet', ['scania-dc16-078a-02-42']],
  [BASE_NOE + 'DC1678A_620-680kW.pdf', 'DC1678A_620-680kW.pdf',
    'Scania DC16 078A 02-43 Spec Sheet', ['scania-dc16-078a-02-43']],
  // NOTE: 02-44 and 02-45 — no individual spec sheets found on scania.com

  // ── OC16 071A · Gas Engine ───────────────────────────────────────────────
  [BASE_NOE  + 'OC16-071A_333-372kW.pdf', 'OC16-071A_333-372kW.pdf',
    'Scania OC16 071A 02-81 Spec Sheet', ['scania-oc16-071a-02-81']],
  [BASE_NOE  + 'OC16-071A_372-411kW.pdf', 'OC16-071A_372-411kW.pdf',
    'Scania OC16 071A 02-82 Spec Sheet', ['scania-oc16-071a-02-82']],
  [BASE_NOE1 + 'OC1671A_407-426kW.pdf',   'OC1671A_407-426kW.pdf',
    'Scania OC16 071A 02-83 Spec Sheet', ['scania-oc16-071a-02-83']],
  [BASE_NOE  + 'OC16-071A_360-360kW.pdf', 'OC16-071A_360-360kW.pdf',
    'Scania OC16 071A 02-91 Spec Sheet', ['scania-oc16-071a-02-91']],
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

  // Download
  let downloadOk = false
  try {
    const res = await fetch(sourceUrl)
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

  // Link to engines in DB
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

  // Clean up temp file
  fs.unlinkSync(localPath)
}

console.log(`\n=== DONE ===`)
console.log(`Downloaded: ${downloaded} | Uploaded: ${uploaded} | Skipped (already exists): ${skipped} | Failed: ${failed}`)
console.log(`\nNo spec sheets found for:`)
console.log(`  DC13-507A 550 kVA (scania-dc13-507a-550)`)
console.log(`  DC13-507A 600 kVA (scania-dc13-507a-600)`)
console.log(`  DC16-093A 02-51   (scania-dc16-093a-02-51)`)
console.log(`  DC16-078A 02-44   (scania-dc16-078a-02-44)`)
console.log(`  DC16-078A 02-45   (scania-dc16-078a-02-45)`)
