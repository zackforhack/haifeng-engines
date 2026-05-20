import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const PDF_DIR = '/Users/ziqianhuang/haifeng-engines/data/yanmar-pdfs'

const pdfEngineMap = [
  // Individual spec sheet — 3TNV88-GGE and same-platform variants
  {
    file: '3tnv88-gge.pdf',
    label: 'Engine Specification Sheet',
    type: 'datasheet',
    slugs: ['yanmar-3tnv88-gge', 'yanmar-3tnv88-gghwc'],
  },
  // Sales sheet — 4TNV98C common rail (covers Tier 4 and Stage V variants)
  {
    file: '4tnv98c-gge.pdf',
    label: 'Product Sales Sheet (4TNV98C Series)',
    type: 'datasheet',
    slugs: ['yanmar-4tnv98c-gge', 'yanmar-4tnv98ct-gge', 'yanmar-4tnv98c-iye', 'yanmar-4tnv98ct-iye'],
  },
  // Parts catalog — 4TNV84T-GGE
  {
    file: '4tnv84t-gge.pdf',
    label: 'Engine Parts Catalog',
    type: 'manual',
    slugs: ['yanmar-4tnv84t-gge', 'yanmar-4tnv84t-bgges', 'yanmar-4tnv84t-ggfc'],
  },
  // General TNV range brochure — linked to all remaining standard models
  {
    file: 'tnv-series-brochure.pdf',
    label: 'TNV Series Product Brochure',
    type: 'brochure',
    slugs: [
      'yanmar-2tnv70-hge',
      'yanmar-2tnv70-wlye',
      'yanmar-3tnm68-hge',
      'yanmar-3tnm68-gge',
      'yanmar-3tnm74f-ngge',
      'yanmar-3tnm74f-ng6ge',
      'yanmar-3tnv70-gge',
      'yanmar-3tnv70-hge',
      'yanmar-3tnv76-gge',
      'yanmar-3tnv76-hge',
      'yanmar-3tnv80f-ngge',
      'yanmar-3tnv80f-ng6ge',
      'yanmar-3tnv82a-gge',
      'yanmar-3tnv84t-gge',
      'yanmar-3tnv88f-ugge',
      'yanmar-3tnv88f-ug6ge',
      'yanmar-4tnv88-gge',
      'yanmar-4tnv88-bgges',
      'yanmar-4tnv88-ggecc',
      'yanmar-4tnv88-bige',
      'yanmar-4tnv98-gge',
      'yanmar-4tnv98-zgges',
      'yanmar-4tnv98-ggecc',
      'yanmar-4tnv98t-gge',
      'yanmar-4tnv98t-zgges',
      'yanmar-4tnv98t-ggecc',
      'yanmar-4tnv106-gge',
      'yanmar-4tnv106t-gge',
    ],
  },
]

const allSlugs = [...new Set(pdfEngineMap.flatMap(p => p.slugs))]
const { data: engines, error: engErr } = await supabase.from('engines').select('id, slug').in('slug', allSlugs)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }

const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${allSlugs.length} engine records\n`)

let uploaded = 0, failed = 0

for (const entry of pdfEngineMap) {
  const filePath = path.join(PDF_DIR, entry.file)
  const storagePath = `yanmar/${entry.file}`
  const fileSize = fs.statSync(filePath).size

  const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(
    storagePath, fs.readFileSync(filePath),
    { contentType: 'application/pdf', upsert: true }
  )

  if (uploadErr) { console.error(`❌ Upload failed ${entry.file}: ${uploadErr.message}`); failed++; continue }
  console.log(`✅ Uploaded: ${entry.file}`)

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
