// Downloads + uploads spec sheets for all 30 Perkins 5000 Series engine records.
//
// Remote sources (scene7 / teksanus / tritonpower):
//   5006AC, 5008AC, 5006A, 5008A, 5012A  — range docs from Caterpillar CDN
//   5008C-E30TAG4                          — teksanus.com
//   5008C-E30TAG5                          — tritonpower.com
//
// Local files (manually supplied, range docs shared across variants):
//   5012AC-E46TAG (TAG1–4)     Downloads/5012AC-E46TAG1.pdf
//   5012C-E46TAG (TAG5–6)      Downloads/5012C-E46TAG5.pdf
//   5016AC-E61TRG (TRG0–3)    Downloads/5016AC-E61TRG0.pdf
//   5016A-E61TRG (TRG0–3)     Downloads/5016A-E61TRG0.pdf

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
const PREFIX = 'perkins/spec-sheets'
const TMP_DIR = path.join(os.tmpdir(), 'perkins-5000-specsheets')
const DL = '/Users/ziqianhuang/Downloads'

fs.mkdirSync(TMP_DIR, { recursive: true })

// [source, storageFilename, label, slugs[]]
// source = URL string (remote) or local file path
const SPEC_SHEETS = [

  // ── 5006AC — range doc (EU Stage II, 50Hz) ────────────────────────────────
  ['https://s7d2.scene7.com/is/content/Caterpillar/CM20230613-555d1-10995',
    '5006AC-E23TAG-electric-power.pdf',
    'Perkins 5006AC-E23TAG Electric Power Engines',
    ['perkins-5006ac-e23tag1', 'perkins-5006ac-e23tag2']],

  // ── 5008AC — range doc (EU Stage II, 50Hz) ────────────────────────────────
  ['https://s7d2.scene7.com/is/content/Caterpillar/CM20230613-843d0-23fd5',
    '5008AC-E30TAG-electric-power.pdf',
    'Perkins 5008AC-E30TAG Electric Power Engines',
    ['perkins-5008ac-e30tag1', 'perkins-5008ac-e30tag2', 'perkins-5008ac-e30tag3']],

  // ── 5012AC — range doc (EU Stage II, 50Hz) — local ───────────────────────
  [`${DL}/5012AC-E46TAG1.pdf`,
    '5012AC-E46TAG-electric-power.pdf',
    'Perkins 5012AC-E46TAG Electric Power Engines',
    ['perkins-5012ac-e46tag1', 'perkins-5012ac-e46tag2',
     'perkins-5012ac-e46tag3', 'perkins-5012ac-e46tag4']],

  // ── 5016AC — range doc (EU Stage II, 50Hz) — local ───────────────────────
  [`${DL}/5016AC-E61TRG0.pdf`,
    '5016AC-E61TRG-electric-power.pdf',
    'Perkins 5016AC-E61TRG Electric Unit',
    ['perkins-5016ac-e61trg0', 'perkins-5016ac-e61trg1',
     'perkins-5016ac-e61trg2', 'perkins-5016ac-e61trg3']],

  // ── 5008C-E30TAG4 — individual spec sheet (EPA Tier 2, 60Hz) ─────────────
  ['https://www.teksanus.com/Files/TJUD900P-3-PERKINS-5008C-E30TAG4-ENGINE-DATA.pdf',
    '5008C-E30TAG4.pdf',
    'Perkins 5008C-E30TAG4 ElectropaK Spec Sheet',
    ['perkins-5008c-e30tag4']],

  // ── 5008C-E30TAG5 — individual spec sheet (EPA Tier 2, 60Hz) ─────────────
  ['https://www.tritonpower.com/1-tp-spec-sheets/perkins-ul/tp-p1000-t2-60-ul/5008c-e30tag5.pdf',
    '5008C-E30TAG5.pdf',
    'Perkins 5008C-E30TAG5 ElectropaK Spec Sheet',
    ['perkins-5008c-e30tag5']],

  // ── 5012C — range doc (EPA Tier 2, 60Hz) — local ─────────────────────────
  [`${DL}/5012C-E46TAG5.pdf`,
    '5012C-E46TAG-electric-power.pdf',
    'Perkins 5012C-E46TAG ElectropaK',
    ['perkins-5012c-e46tag5', 'perkins-5012c-e46tag6']],

  // ── 5006A — range doc (Fuel Optimised, 50Hz) ──────────────────────────────
  ['https://s7d2.scene7.com/is/content/Caterpillar/CM20220719-03ef1-922f2',
    '5006A-E23TAG-electric-power.pdf',
    'Perkins 5006A-E23TAG Electric Power Engines',
    ['perkins-5006a-e23tag1', 'perkins-5006a-e23tag2']],

  // ── 5008A — range doc (Fuel Optimised, 50Hz) ──────────────────────────────
  ['https://s7d2.scene7.com/is/content/Caterpillar/CM20220719-41940-6dd8d',
    '5008A-E30TAG-electric-power.pdf',
    'Perkins 5008A-E30TAG Electric Power Engines',
    ['perkins-5008a-e30tag1', 'perkins-5008a-e30tag2', 'perkins-5008a-e30tag3']],

  // ── 5012A — range doc (Fuel Optimised, 50Hz) ──────────────────────────────
  ['https://s7d2.scene7.com/is/content/Caterpillar/CM20240404-5ab5f-377ee',
    '5012A-E46TAG-electric-power.pdf',
    'Perkins 5012A-E46TAG Electric Power Engines',
    ['perkins-5012a-e46tag1', 'perkins-5012a-e46tag2',
     'perkins-5012a-e46tag3', 'perkins-5012a-e46tag4']],

  // ── 5016A — range doc (Fuel Optimised, 50Hz) — local ─────────────────────
  [`${DL}/5016A-E61TRG0.pdf`,
    '5016A-E61TRG-electric-power.pdf',
    'Perkins 5016A-E61TRG Electric Unit',
    ['perkins-5016a-e61trg0', 'perkins-5016a-e61trg1',
     'perkins-5016a-e61trg2', 'perkins-5016a-e61trg3']],
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

let uploaded = 0, skipped = 0, failed = 0

for (const [source, filename, label, slugs] of SPEC_SHEETS) {
  const storagePath = `${PREFIX}/${filename}`
  const isLocal = !source.startsWith('http')

  let localPath
  if (isLocal) {
    localPath = source
    process.stdout.write(`📂 ${filename} (local) ... `)
    if (!fs.existsSync(localPath)) {
      console.log(`File not found: ${localPath}`)
      failed++
      continue
    }
    console.log(`${Math.round(fs.statSync(localPath).size / 1024)}KB`)
  } else {
    localPath = path.join(TMP_DIR, filename)
    process.stdout.write(`📥 ${filename} ... `)
    try {
      const res = await fetch(source, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bot)' } })
      if (!res.ok) { console.log(`HTTP ${res.status} — skipping`); failed++; continue }
      const buf = Buffer.from(await res.arrayBuffer())
      fs.writeFileSync(localPath, buf)
      process.stdout.write(`${Math.round(buf.length / 1024)}KB `)
    } catch (e) {
      console.log(`Download error: ${e.message}`)
      failed++
      continue
    }
  }

  const { ok, skipped: wasSkipped } = await uploadPdf(supabase, BUCKET, localPath, storagePath)
  if (!ok) { console.log(`Upload failed`); failed++; if (!isLocal) fs.unlinkSync(localPath); continue }
  console.log(wasSkipped ? `already in storage` : `uploaded`)
  wasSkipped ? skipped++ : uploaded++

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
    if (insertErr) console.warn(`  ⚠️  ${slug}: ${insertErr.message}`)
    else console.log(`  → ${slug}`)
  }

  if (!isLocal && fs.existsSync(localPath)) fs.unlinkSync(localPath)
}

console.log(`\n=== DONE ===`)
console.log(`Uploaded: ${uploaded} | Already existed: ${skipped} | Failed: ${failed}`)
