import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import https from 'https'
import { uploadPdf } from './pdf-upload-utils.mjs'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const PDF_DIR = '/Users/ziqianhuang/haifeng-engines/data/hyundai-pdfs'
const BASE_URL = 'https://www.hd-hyundaiengine.com/hd-infra-engine/file/down'

// New PDFs not already present from the certified upload
const downloads = [
  { uuid: '21fce73c-2cbd-41b8-b148-6727a75fa49d', filename: 'hce-sp344cb-spec.pdf' },
  { uuid: 'f964af20-590d-495c-a088-93f1e422b840', filename: 'hce-sp344cc-spec.pdf' },
  { uuid: '13f6f47e-0259-4913-abfd-e4ba9d4ea42b', filename: 'hce-p086ti-spec.pdf' },
  { uuid: 'd0134328-65ca-4a08-bfc6-71f43ea99379', filename: 'hce-p158le-spec.pdf' },
  { uuid: 'faf6ef16-99ac-4221-a5e9-2c08f85b2d2a', filename: 'hce-dp222ca-spec.pdf' },
  { uuid: '3ca0f02a-3e4d-47a2-b265-394be4421927', filename: 'hce-dp222cb-spec.pdf' },
]

const ALL = [
  'hyundai-sp344cb', 'hyundai-sp344cc',
  'hyundai-dp054ca', 'hyundai-dp054cb', 'hyundai-dp054cc',
  'hyundai-dp086ca', 'hyundai-dp086cb', 'hyundai-dp086cc', 'hyundai-dp086cd', 'hyundai-dp086ce',
  'hyundai-p086ti-1', 'hyundai-p086ti',
  'hyundai-dp086la',
  'hyundai-dp126lb', 'hyundai-dp126ca', 'hyundai-dp126cb', 'hyundai-dp126cd', 'hyundai-dp126ce',
  'hyundai-p158le',
  'hyundai-dp158lc', 'hyundai-dp158ld', 'hyundai-dp158cc', 'hyundai-dp158cd-1', 'hyundai-dp158cd',
  'hyundai-dp222la', 'hyundai-dp222lb', 'hyundai-dp222lc',
  'hyundai-dp222ca', 'hyundai-dp222cb', 'hyundai-dp222cc',
  'hyundai-dp372ca', 'hyundai-dp372cb', 'hyundai-dp372cc', 'hyundai-dp372cd', 'hyundai-dp372ce',
]

const pdfEngineMap = [
  // General brochure — all engines
  {
    file: 'hce-engine-brochure-2025.pdf',
    label: 'HCE Engine Product Brochure (2025)',
    type: 'brochure',
    slugs: ALL,
  },
  // DX series brochure — DP054 and above (excludes SP344, P086TI, P158LE, DP372)
  {
    file: 'hce-dx-series-power-generation.pdf',
    label: 'Hyundai DX Series for Power Generation',
    type: 'brochure',
    slugs: [
      'hyundai-dp054ca', 'hyundai-dp054cb', 'hyundai-dp054cc',
      'hyundai-dp086ca', 'hyundai-dp086cb', 'hyundai-dp086cc', 'hyundai-dp086cd', 'hyundai-dp086ce',
      'hyundai-dp086la',
      'hyundai-dp126lb', 'hyundai-dp126ca', 'hyundai-dp126cb', 'hyundai-dp126cd', 'hyundai-dp126ce',
      'hyundai-dp158lc', 'hyundai-dp158ld', 'hyundai-dp158cc', 'hyundai-dp158cd-1', 'hyundai-dp158cd',
      'hyundai-dp222la', 'hyundai-dp222lb', 'hyundai-dp222lc',
      'hyundai-dp222ca', 'hyundai-dp222cb', 'hyundai-dp222cc',
    ],
  },
  // SP344 individual spec sheets
  { file: 'hce-sp344cb-spec.pdf', label: 'SP344CB Specification Sheet', type: 'datasheet', slugs: ['hyundai-sp344cb'] },
  { file: 'hce-sp344cc-spec.pdf', label: 'SP344CC Specification Sheet', type: 'datasheet', slugs: ['hyundai-sp344cc'] },
  // DP054
  { file: 'hce-dx05-dp054cav-spec.pdf', label: 'DX05 (DP054CA) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp054ca'] },
  { file: 'hce-dx05-dp054ccv-spec.pdf', label: 'DX05 (DP054CB/CC) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp054cb', 'hyundai-dp054cc'] },
  // DP086
  { file: 'hce-dx08-dp086ccv-spec.pdf', label: 'DX08 (DP086) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp086ca', 'hyundai-dp086cb', 'hyundai-dp086cc', 'hyundai-dp086cd', 'hyundai-dp086ce'] },
  { file: 'hce-dp086la-spec.pdf', label: 'DP086LA Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp086la'] },
  // P086TI (P086TI-1 shares the same sheet)
  { file: 'hce-p086ti-spec.pdf', label: 'P086TI Specification Sheet', type: 'datasheet', slugs: ['hyundai-p086ti-1', 'hyundai-p086ti'] },
  // DP126
  { file: 'hce-dp126la-spec.pdf', label: 'DP126LA Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp126ca'] },
  { file: 'hce-dp126lb-spec.pdf', label: 'DP126LB Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp126lb', 'hyundai-dp126cb', 'hyundai-dp126cd', 'hyundai-dp126ce'] },
  // P158LE
  { file: 'hce-p158le-spec.pdf', label: 'P158LE Specification Sheet', type: 'datasheet', slugs: ['hyundai-p158le'] },
  // DP158 (LC spec sheet covers all DP158 variants)
  { file: 'hce-dp158lc-spec.pdf', label: 'DP158LC Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp158lc', 'hyundai-dp158ld', 'hyundai-dp158cc', 'hyundai-dp158cd-1', 'hyundai-dp158cd'] },
  // DP222
  { file: 'hce-dp222lb-spec.pdf', label: 'DP222LB Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp222la', 'hyundai-dp222lb', 'hyundai-dp222lc'] },
  { file: 'hce-dp222ca-spec.pdf', label: 'DP222CA Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp222ca'] },
  { file: 'hce-dp222cb-spec.pdf', label: 'DP222CB Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp222cb'] },
  { file: 'hce-dx22-dp222cc-spec.pdf', label: 'DX22 (DP222CC) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp222cc'] },
  // DP372 — no individual spec sheets on website; brochure only (covered above)
]

function download(uuid, destPath) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/${uuid}`
    const file = fs.createWriteStream(destPath)
    https.get(url, res => {
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode} for ${uuid}`)); return }
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
    }).on('error', reject)
  })
}

// Step 1: Download new PDFs
console.log('=== Downloading new PDFs ===\n')
for (const d of downloads) {
  const destPath = path.join(PDF_DIR, d.filename)
  if (fs.existsSync(destPath)) {
    console.log(`⏭  Already exists: ${d.filename}`)
    continue
  }
  try {
    await download(d.uuid, destPath)
    const size = fs.statSync(destPath).size
    console.log(`✅ Downloaded: ${d.filename} (${Math.round(size/1024)}KB)`)
  } catch (e) {
    console.error(`❌ Failed: ${d.filename} — ${e.message}`)
  }
}

// Step 2: Fetch all engine IDs from DB
const { data: engines, error: engErr } = await supabase.from('engines').select('id, slug').in('slug', ALL)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`\nFound ${engines.length} / ${ALL.length} engine records\n`)

// Step 3: Upload to Supabase storage and link to engines
console.log('=== Uploading & Linking ===\n')
let uploaded = 0, failed = 0

for (const entry of pdfEngineMap) {
  const filePath = path.join(PDF_DIR, entry.file)
  if (!fs.existsSync(filePath)) { console.warn(`⚠️  File missing: ${entry.file}`); failed++; continue }

  const storagePath = `hyundai/${entry.file}`
  const fileSize = fs.statSync(filePath).size

  console.log(`\n📄 ${entry.file} (${Math.round(fileSize/1024)}KB)`)
  const { ok } = await uploadPdf(supabase, BUCKET, filePath, storagePath)
  if (!ok) { failed++; continue }
  console.log(`✅ Ready: ${entry.file}`)

  for (const slug of entry.slugs) {
    const engineId = slugToId[slug]
    if (!engineId) { console.warn(`   ⚠️  Not in DB: ${slug}`); continue }

    await supabase.from('engine_pdfs').delete().eq('engine_id', engineId).eq('storage_path', storagePath)

    const { error: insertErr } = await supabase.from('engine_pdfs').insert({
      engine_id: engineId, type: entry.type, label: entry.label,
      storage_path: storagePath, file_size_bytes: fileSize,
    })
    if (insertErr) console.warn(`   ⚠️  DB insert failed for ${slug}: ${insertErr.message}`)
    else console.log(`   → ${slug}`)
  }
  uploaded++
}

console.log(`\n=== DONE === Uploaded: ${uploaded} | Failed: ${failed}`)
