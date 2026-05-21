// Uploads the Perkins unregulated engine selection chart PDF to Supabase
// and links it to all Perkins unregulated engine slugs in engine_pdfs table.

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import os from 'os'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const STORAGE_PATH = 'perkins/selection-charts/2026-perkins-unregulated.pdf'
const LOCAL_PDF = '/Users/ziqianhuang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/aassdfg684_5b6a/msg/file/2026-05/2026年珀金斯发动机选型表-无排放.pdf'
const LABEL = 'Perkins Unregulated Engine Selection Chart (2026)'

const SLUGS = [
  'perkins-403d-11g', 'perkins-403d-15g', 'perkins-403a-15g2',
  'perkins-404d-22g', 'perkins-404d-22tg',
  'perkins-1103a-33g', 'perkins-1103a-33tg1', 'perkins-1103a-33tg2',
  'perkins-1104a-44tg1', 'perkins-1104a-44tg2', 'perkins-1104c-44tag2',
  'perkins-1106a-70tg1', 'perkins-1106a-70tag2', 'perkins-1106a-70tag3', 'perkins-1106a-70tag4',
  'perkins-1206a-e70ttag1', 'perkins-1206a-e70ttag2', 'perkins-1206a-e70ttag3',
  'perkins-1706a-e93tag1', 'perkins-1706a-e93tag2',
  'perkins-2206c-e13tag2', 'perkins-2206c-e13tag3', 'perkins-2206c-e13tag5', 'perkins-2206a-e13tag6',
  'perkins-2506c-e15tag1', 'perkins-2506c-e15tag2', 'perkins-2506c-e15tag3', 'perkins-2506c-e15tag4',
  'perkins-2806c-e18tag1a', 'perkins-2806a-e18tag2', 'perkins-2806a-e18tag3',
  'perkins-2806a-e18ttag4', 'perkins-2806a-e18ttag5', 'perkins-2806a-e18ttag6', 'perkins-2806a-e18ttag7',
  'perkins-4006-23tag2a', 'perkins-4006-23tag3a',
  'perkins-4008tag1a', 'perkins-4008tag2a', 'perkins-4008tag2', 'perkins-4008-30tag3',
  'perkins-4012-46twg2a', 'perkins-4012-46twg3a', 'perkins-4012-46tag2a', 'perkins-4012-46tag3a',
  'perkins-4016tag1a', 'perkins-4016-61trg1', 'perkins-4016-61trg2',
  'perkins-4016tag2a', 'perkins-4016-61trg3', 'perkins-4016-61trg3x',
]

// Fetch engine IDs
const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', SLUGS)
if (engErr) { console.error('DB error:', engErr.message); process.exit(1) }

const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${SLUGS.length} engine records`)

const missing = SLUGS.filter(s => !slugToId[s])
if (missing.length) console.warn('Missing slugs:', missing)

// Upload PDF
console.log(`\nUploading PDF...`)
const fileStat = fs.statSync(LOCAL_PDF)
console.log(`  File size: ${Math.round(fileStat.size / 1024)}KB`)

const { ok, skipped } = await uploadPdf(supabase, BUCKET, LOCAL_PDF, STORAGE_PATH)
if (!ok) { console.error('Upload failed'); process.exit(1) }
console.log(skipped ? '  Already in storage (skipped re-upload)' : '  Uploaded successfully')

// Link to all engines
const fileSize = fileStat.size
let linked = 0, failed = 0

for (const slug of SLUGS) {
  const engineId = slugToId[slug]
  if (!engineId) continue

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
