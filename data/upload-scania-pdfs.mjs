import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const PDF_DIR = '/Users/ziqianhuang/haifeng-engines/data/scania-pdfs'

const ALL_SLUGS = [
  // DC13 505A — EU Stage V
  'scania-dc13-505a-300', 'scania-dc13-505a-350', 'scania-dc13-505a-400',
  'scania-dc13-505a-450', 'scania-dc13-505a-500',
  // DC13 506A — China IV
  'scania-dc13-506a-300', 'scania-dc13-506a-350', 'scania-dc13-506a-400',
  'scania-dc13-506a-450', 'scania-dc13-506a-500',
  // DC13 507A — Unregulated
  'scania-dc13-507a-300', 'scania-dc13-507a-350', 'scania-dc13-507a-400',
  'scania-dc13-507a-450', 'scania-dc13-507a-500', 'scania-dc13-507a-550',
  'scania-dc13-507a-600',
  // DC16 320A — EU Stage V
  'scania-dc16-320a-02-61', 'scania-dc16-320a-02-62', 'scania-dc16-320a-02-63',
  // DC16 084A — US Tier 4f
  'scania-dc16-084a-01-01a', 'scania-dc16-084a-01-01b', 'scania-dc16-084a-01-01c',
  // DC16 071A — EU Stage IIIA
  'scania-dc16-071a-02-01', 'scania-dc16-071a-02-02',
  // DC16 093A — Fuel Optimised
  'scania-dc16-093a-02-51', 'scania-dc16-093a-02-52',
  'scania-dc16-093a-02-53', 'scania-dc16-093a-02-54',
  // DC16 078A — Fuel Optimised
  'scania-dc16-078a-02-41', 'scania-dc16-078a-02-42', 'scania-dc16-078a-02-43',
  'scania-dc16-078a-02-44', 'scania-dc16-078a-02-45',
  // OC16 071A — Gas engine
  'scania-oc16-071a-02-81', 'scania-oc16-071a-02-82',
  'scania-oc16-071a-02-83', 'scania-oc16-071a-02-91',
]

const pdfEngineMap = [
  {
    file: 'scania-power-gen-handbook-2025.pdf',
    label: 'Scania Power Generation Engine Handbook (2025)',
    type: 'brochure',
    slugs: ALL_SLUGS,
  },
]

// Fetch engine IDs
const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', ALL_SLUGS)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${ALL_SLUGS.length} engine records\n`)

let uploaded = 0, failed = 0

for (const entry of pdfEngineMap) {
  const filePath = path.join(PDF_DIR, entry.file)
  if (!fs.existsSync(filePath)) { console.warn(`⚠️  Missing: ${entry.file}`); failed++; continue }

  const storagePath = `scania/${entry.file}`
  const fileSize = fs.statSync(filePath).size

  console.log(`📄 ${entry.file} (${Math.round(fileSize / 1024)}KB)`)
  const { ok } = await uploadPdf(supabase, BUCKET, filePath, storagePath)
  if (!ok) { failed++; continue }
  console.log(`✅ Ready: ${entry.file}`)

  for (const slug of entry.slugs) {
    const engineId = slugToId[slug]
    if (!engineId) { console.warn(`   ⚠️  Not in DB: ${slug}`); continue }

    await supabase.from('engine_pdfs').delete()
      .eq('engine_id', engineId).eq('storage_path', storagePath)

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
