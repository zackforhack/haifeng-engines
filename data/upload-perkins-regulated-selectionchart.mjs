// Uploads the Perkins regulated engine selection chart PDF to Supabase
// and links it to all 47 Perkins regulated engine slugs in engine_pdfs table.

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const STORAGE_PATH = 'perkins/selection-charts/2026-perkins-regulated.pdf'
const LOCAL_PDF = '/Users/ziqianhuang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/aassdfg684_5b6a/msg/file/2026-05/2026年珀金斯发动机选型表-有排放.pdf'
const LABEL = 'Perkins Regulated Engine Selection Chart (2026)'

const SLUGS = [
  // 400 Series
  'perkins-403j-07g', 'perkins-403d-11g', 'perkins-403j-11g',
  'perkins-403d-15g', 'perkins-404d-22g', 'perkins-404j-22g',
  'perkins-404j-e22tag',
  // 400 Series 60Hz-only
  'perkins-402d-05g', 'perkins-403d-07g', 'perkins-403f-11g',
  'perkins-404d-22tg',
  // 900 Series
  'perkins-904j-e36tag1', 'perkins-904j-e36tag3',
  // 1100 Series
  'perkins-1103d-33g2',
  'perkins-1104d-44tg1', 'perkins-1104d-e44tg1',
  'perkins-1104d-44tg2', 'perkins-1104d-e44tag1', 'perkins-1104d-e44tag2',
  'perkins-1106d-e70tag2', 'perkins-1106d-e70tag3', 'perkins-1106d-e70tag4',
  'perkins-1106j-e70tag3', 'perkins-1106d-e70tag5',
  // 1200 Series
  'perkins-1204j-e44tag1', 'perkins-1204j-e44ttag2',
  'perkins-1206d-e70ttag1', 'perkins-1206d-e70ttag2', 'perkins-1206d-e70ttag3',
  'perkins-1206j-e70ttag3', 'perkins-1206j-e70ttag4',
  // 1700 Series
  'perkins-1706j-e93tag1', 'perkins-1706j-e93tag2',
  'perkins-1706d-e93tag1', 'perkins-1706d-e93tag2',
  // 2200 Series
  'perkins-2206d-e13tag2', 'perkins-2206d-e13tag3',
  // 2400 Series
  'perkins-2406j-e13tag3',
  // 2500 Series
  'perkins-2506c-e15tag2', 'perkins-2506d-e15tag1',
  'perkins-2506c-e15tag3', 'perkins-2506c-e15tag4',
  // 2800 Series
  'perkins-2806j-e18tag1', 'perkins-2806f-e18tag1',
  'perkins-2806c-e18tag3', 'perkins-2806c-e18ttag6', 'perkins-2806c-e18ttag7',
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
