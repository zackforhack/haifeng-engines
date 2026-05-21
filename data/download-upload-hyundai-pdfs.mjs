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

const downloads = [
  // Shared brochures
  { uuid: '917c9d8a-f576-4ef2-bd3b-12c0f6836107', filename: 'hce-engine-brochure-2025.pdf' },
  { uuid: 'e77ccaac-c90b-4d0d-a177-f192f3ab5d62', filename: 'hce-dx-series-power-generation.pdf' },
  // DM01 (DP023)
  { uuid: 'd7846005-f632-4e91-a694-ca483fbd9b15', filename: 'hce-dm01-dp023cap-spec.pdf' },
  { uuid: 'a6a34cfe-eac5-45aa-8b1c-894208a99d35', filename: 'hce-dm01-dp023cav-spec.pdf' },
  // DM02 (DP024)
  { uuid: '504aea7f-40f9-483e-a3ef-c12aa0230158', filename: 'hce-dm02-dp024cap-spec.pdf' },
  // DM03 (DP034)
  { uuid: 'd5f4484b-718d-4ee5-a7c8-e199342db0ed', filename: 'hce-dm03-dp034cap-spec.pdf' },
  { uuid: '9715b067-5616-4b47-9946-70485e5d6e89', filename: 'hce-dm03-dp034ccp-spec.pdf' },
  // DX05 (DP054)
  { uuid: '53fd1978-e85c-4fbb-b53a-0ee6414391dc', filename: 'hce-dx05-dp054cbk-spec.pdf' },
  { uuid: '1865d33d-83f3-4107-b8ca-be86896bc643', filename: 'hce-dx05-dp054cav-spec.pdf' },
  { uuid: '61fea638-3836-46bf-9191-d873b96baa33', filename: 'hce-dx05-dp054ccv-spec.pdf' },
  // DX08 (DP086)
  { uuid: '2f4f81a6-b0be-4027-9eb5-531a9ce823ac', filename: 'hce-dp086la-spec.pdf' },
  { uuid: '313099b6-d897-4bcb-a41a-bbffc958ff3e', filename: 'hce-dx08-dp086ccv-spec.pdf' },
  // DP126
  { uuid: 'ed589751-6dd3-4652-850c-9c7a4f878576', filename: 'hce-dp126la-spec.pdf' },
  { uuid: 'b640c6b3-9bea-4994-8176-bc35501a7e2c', filename: 'hce-dp126lb-spec.pdf' },
  // DP158
  { uuid: '6154c7ff-b1c4-4796-9333-14705bd4f241', filename: 'hce-dp158lc-spec.pdf' },
  // DP222
  { uuid: 'b947adc8-56d3-40c5-a34e-f3bfd165bd2c', filename: 'hce-dp222lb-spec.pdf' },
  { uuid: '295abc20-fc03-4040-8134-8927bb09da23', filename: 'hce-dx22-dp222cc-spec.pdf' },
]

const pdfEngineMap = [
  {
    file: 'hce-engine-brochure-2025.pdf',
    label: 'HCE Engine Product Brochure (2025)',
    type: 'brochure',
    slugs: [
      'hyundai-dp023cap', 'hyundai-dp023cav',
      'hyundai-dp024cap', 'hyundai-dp024cav',
      'hyundai-dp034cap', 'hyundai-dp034ccp', 'hyundai-dp034cav', 'hyundai-dp034ccv',
      'hyundai-dp054cak', 'hyundai-dp054cbk',
      'hyundai-dp054cap', 'hyundai-dp054cbp', 'hyundai-dp054ccp',
      'hyundai-dp054cav', 'hyundai-dp054cbv', 'hyundai-dp054ccv',
      'hyundai-dp086cak', 'hyundai-dp086cbk', 'hyundai-dp086cck',
      'hyundai-dp086cbp', 'hyundai-dp086ccp', 'hyundai-dp086cdp',
      'hyundai-dp086cbv', 'hyundai-dp086ccv', 'hyundai-dp086cdv',
      'hyundai-dp126cak', 'hyundai-dp126cbk', 'hyundai-dp126cck',
      'hyundai-dp158cak', 'hyundai-dp158cbk', 'hyundai-dp158ccs', 'hyundai-dp158cds',
      'hyundai-dp222cas', 'hyundai-dp222cbs', 'hyundai-dp222ccs',
    ],
  },
  {
    file: 'hce-dx-series-power-generation.pdf',
    label: 'Hyundai DX Series for Power Generation',
    type: 'brochure',
    slugs: [
      'hyundai-dp054cak', 'hyundai-dp054cbk',
      'hyundai-dp054cap', 'hyundai-dp054cbp', 'hyundai-dp054ccp',
      'hyundai-dp054cav', 'hyundai-dp054cbv', 'hyundai-dp054ccv',
      'hyundai-dp086cak', 'hyundai-dp086cbk', 'hyundai-dp086cck',
      'hyundai-dp086cbp', 'hyundai-dp086ccp', 'hyundai-dp086cdp',
      'hyundai-dp086cbv', 'hyundai-dp086ccv', 'hyundai-dp086cdv',
      'hyundai-dp126cak', 'hyundai-dp126cbk', 'hyundai-dp126cck',
      'hyundai-dp158cak', 'hyundai-dp158cbk', 'hyundai-dp158ccs', 'hyundai-dp158cds',
      'hyundai-dp222cas', 'hyundai-dp222cbs', 'hyundai-dp222ccs',
    ],
  },
  // Individual spec sheets
  { file: 'hce-dm01-dp023cap-spec.pdf', label: 'DM01 (DP023CAP) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp023cap'] },
  { file: 'hce-dm01-dp023cav-spec.pdf', label: 'DM01 (DP023CAV) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp023cav'] },
  { file: 'hce-dm02-dp024cap-spec.pdf', label: 'DM02 (DP024) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp024cap', 'hyundai-dp024cav'] },
  { file: 'hce-dm03-dp034cap-spec.pdf', label: 'DM03 (DP034CA) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp034cap', 'hyundai-dp034cav'] },
  { file: 'hce-dm03-dp034ccp-spec.pdf', label: 'DM03 (DP034CC) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp034ccp', 'hyundai-dp034ccv'] },
  { file: 'hce-dx05-dp054cbk-spec.pdf', label: 'DX05 (DP054CBK) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp054cak', 'hyundai-dp054cbk'] },
  { file: 'hce-dx05-dp054cav-spec.pdf', label: 'DX05 (DP054CA) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp054cap', 'hyundai-dp054cav'] },
  { file: 'hce-dx05-dp054ccv-spec.pdf', label: 'DX05 (DP054CB/CC) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp054cbp', 'hyundai-dp054ccp', 'hyundai-dp054cbv', 'hyundai-dp054ccv'] },
  { file: 'hce-dp086la-spec.pdf', label: 'DP086LA Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp086cak', 'hyundai-dp086cbk', 'hyundai-dp086cck'] },
  { file: 'hce-dx08-dp086ccv-spec.pdf', label: 'DX08 (DP086) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp086cbp', 'hyundai-dp086ccp', 'hyundai-dp086cdp', 'hyundai-dp086cbv', 'hyundai-dp086ccv', 'hyundai-dp086cdv'] },
  { file: 'hce-dp126la-spec.pdf', label: 'DP126LA Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp126cak'] },
  { file: 'hce-dp126lb-spec.pdf', label: 'DP126LB Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp126cbk', 'hyundai-dp126cck'] },
  { file: 'hce-dp158lc-spec.pdf', label: 'DP158LC Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp158cak', 'hyundai-dp158cbk', 'hyundai-dp158ccs', 'hyundai-dp158cds'] },
  { file: 'hce-dp222lb-spec.pdf', label: 'DP222LB Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp222cas', 'hyundai-dp222cbs'] },
  { file: 'hce-dx22-dp222cc-spec.pdf', label: 'DX22 (DP222CC) Specification Sheet', type: 'datasheet', slugs: ['hyundai-dp222ccs'] },
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

// Step 1: Download all PDFs
console.log('=== Downloading PDFs ===\n')
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
const allSlugs = [...new Set(pdfEngineMap.flatMap(p => p.slugs))]
const { data: engines, error: engErr } = await supabase.from('engines').select('id, slug').in('slug', allSlugs)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`\nFound ${engines.length} / ${allSlugs.length} engine records\n`)

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
