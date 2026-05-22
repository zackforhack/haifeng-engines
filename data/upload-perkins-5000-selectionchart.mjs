// Uploads the Perkins 5000S Generator Set Power Selector Chart (2026)
// and links it to all 13 Perkins 5000 series engine records.

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const STORAGE_PATH = 'perkins/selection-charts/2026-perkins-5000.pdf'
const LOCAL_PDF = '/Users/ziqianhuang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/aassdfg684_5b6a/msg/file/2026-05/2026珀金斯发动机选型表-5000系列.pdf'
const LABEL = 'Perkins 5000S Generator Set Power Selector Chart (2026)'

const SLUGS = [
  // EU Stage II / China NR III — 50Hz
  'perkins-5006ac-e23tag1', 'perkins-5006ac-e23tag2',
  'perkins-5008ac-e30tag1', 'perkins-5008ac-e30tag2', 'perkins-5008ac-e30tag3',
  'perkins-5012ac-e46tag1', 'perkins-5012ac-e46tag2', 'perkins-5012ac-e46tag3', 'perkins-5012ac-e46tag4',
  'perkins-5016ac-e61trg0', 'perkins-5016ac-e61trg1', 'perkins-5016ac-e61trg2', 'perkins-5016ac-e61trg3',
  // U.S. EPA Tier 2 — 60Hz
  'perkins-5008c-e30tag4', 'perkins-5008c-e30tag5',
  'perkins-5012c-e46tag5', 'perkins-5012c-e46tag6',
]

const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', SLUGS)
if (engErr) { console.error('DB error:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${SLUGS.length} engine records\n`)

console.log('Uploading PDF...')
const { ok, skipped } = await uploadPdf(supabase, BUCKET, LOCAL_PDF, STORAGE_PATH)
if (!ok) { console.error('Upload failed'); process.exit(1) }
console.log(skipped ? '  Already in storage (skipped)' : '  Uploaded successfully')

const fileSize = fs.statSync(LOCAL_PDF).size
let linked = 0, failed = 0

for (const slug of SLUGS) {
  const engineId = slugToId[slug]
  if (!engineId) { console.warn(`  ⚠️  Not in DB: ${slug}`); continue }

  await supabase.from('engine_pdfs').delete()
    .eq('engine_id', engineId).eq('storage_path', STORAGE_PATH)

  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: engineId,
    type: 'datasheet',
    label: LABEL,
    storage_path: STORAGE_PATH,
    file_size_bytes: fileSize,
  })
  if (error) { console.warn(`  ⚠️  ${slug}: ${error.message}`); failed++ }
  else { console.log(`  → ${slug}`); linked++ }
}

console.log(`\n=== DONE ===`)
console.log(`Linked: ${linked} | Failed: ${failed}`)
