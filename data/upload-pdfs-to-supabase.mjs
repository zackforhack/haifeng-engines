import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY env var')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const PDF_DIR = '/Users/ziqianhuang/haifeng-engines/data/volvo-pdfs'

// PDF → engine slug mapping
const pdfEngineMap = [
  { file: 'tad1341ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1341ge-b'] },
  { file: 'tad1342ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1342ge-b'] },
  { file: 'tad1343ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1343ge-b'] },
  { file: 'tad1344ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1344ge-b'] },
  { file: 'tad1345ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1345ge-b'] },
  { file: 'tad1346ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1346ge'] },
  { file: 'tad1352ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1352ge'] },
  { file: 'tad1641ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1641ge-b'] },
  { file: 'tad1642ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1642ge-b'] },
  { file: 'tad880ge-tad881ge-tad882ge.pdf',    label: 'Engine Range Datasheet (TAD880–882GE)', type: 'datasheet', slugs: ['volvo-penta-tad880ge', 'volvo-penta-tad881ge', 'volvo-penta-tad882ge'] },
  { file: 'tad1380ge-tad1381ge-tad1382ge.pdf', label: 'Engine Range Datasheet (TAD1380–1382GE)', type: 'datasheet', slugs: ['volvo-penta-tad1380ge', 'volvo-penta-tad1381ge', 'volvo-penta-tad1382ge'] },
  { file: 'twd1683ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-twd1683ge'] },
  { file: 'twd1744ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-twd1744ge'] },
  // New PDFs
  { file: 'tad580ve-tad581ve-tad582ve.pdf',    label: 'Engine Range Datasheet (TAD580–582VE)', type: 'datasheet', slugs: ['volvo-penta-tad580ve', 'volvo-penta-tad581ve', 'volvo-penta-tad582ve'] },
  { file: 'tad840ge-tad841ge-tad842ge-tad843ge.pdf', label: 'Engine Range Datasheet (TAD840–843GE)', type: 'datasheet', slugs: ['volvo-penta-tad840ge-b', 'volvo-penta-tad841ge', 'volvo-penta-tad842ge', 'volvo-penta-tad843ge'] },
  { file: 'tad851ge-tad852ge-tad853ge.pdf',    label: 'Engine Range Datasheet (TAD851–853GE)', type: 'datasheet', slugs: ['volvo-penta-tad851ge', 'volvo-penta-tad852ge', 'volvo-penta-tad853ge'] },
  { file: 'tad880ve-tad881ve-tad882ve-tad883ve.pdf', label: 'Engine Range Datasheet (TAD880–883VE)', type: 'datasheet', slugs: ['volvo-penta-tad880ve', 'volvo-penta-tad881ve', 'volvo-penta-tad882ve', 'volvo-penta-tad883ve'] },
  { file: 'tad1181ve.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1181ve'] },
  { file: 'tad1350ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1350ge'] },
  { file: 'tad1351ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1351ge'] },
  { file: 'tad1353ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1353ge'] },
  { file: 'tad1354ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1354ge'] },
  { file: 'tad1355ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1355ge'] },
  { file: 'tad1381ve-tad1382ve-tad1383ve-tad1384ve-tad1385ve.pdf', label: 'Engine Range Datasheet (TAD1381–1385VE)', type: 'datasheet', slugs: ['volvo-penta-tad1381ve', 'volvo-penta-tad1382ve', 'volvo-penta-tad1383ve', 'volvo-penta-tad1384ve', 'volvo-penta-tad1385ve'] },
  { file: 'tad1650ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1650ge'] },
  { file: 'tad1651ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-tad1651ge'] },
  { file: 'twd1644ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-twd1644ge'] },
  { file: 'twd1645ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-twd1645ge'] },
  { file: 'twd1652ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-twd1652ge'] },
  { file: 'twd1653ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-twd1653ge'] },
  { file: 'twd1682ge.pdf',                     label: 'Product Datasheet', type: 'datasheet', slugs: ['volvo-penta-twd1682ge'] },
]

// Step 1: Get engine IDs for all slugs
const allSlugs = [...new Set(pdfEngineMap.flatMap(p => p.slugs))]
const { data: engines, error: engErr } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', allSlugs)

if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }

const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${allSlugs.length} engine records in DB\n`)

// Step 2: Upload PDFs + insert engine_pdfs records
let uploaded = 0, skipped = 0, failed = 0

for (const entry of pdfEngineMap) {
  const filePath = path.join(PDF_DIR, entry.file)
  const storagePath = `volvo/${entry.file}`
  const fileSize = fs.statSync(filePath).size

  // Upload to storage
  const fileBuffer = fs.readFileSync(filePath)
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadErr) {
    console.error(`❌ Upload failed for ${entry.file}: ${uploadErr.message}`)
    failed++
    continue
  }

  console.log(`✅ Uploaded: ${entry.file}`)

  // Insert engine_pdfs records for each linked engine
  for (const slug of entry.slugs) {
    const engineId = slugToId[slug]
    if (!engineId) {
      console.warn(`   ⚠️  Engine not found in DB: ${slug}`)
      continue
    }

    // Remove existing record to avoid duplicates (upsert)
    await supabase.from('engine_pdfs').delete()
      .eq('engine_id', engineId)
      .eq('storage_path', storagePath)

    const { error: insertErr } = await supabase.from('engine_pdfs').insert({
      engine_id: engineId,
      type: entry.type,
      label: entry.label,
      storage_path: storagePath,
      file_size_bytes: fileSize,
    })

    if (insertErr) {
      console.warn(`   ⚠️  DB insert failed for ${slug}: ${insertErr.message}`)
    } else {
      console.log(`   → Linked to engine: ${slug}`)
    }
  }

  uploaded++
}

console.log(`\n=== DONE ===`)
console.log(`Uploaded: ${uploaded} PDFs | Failed: ${failed}`)
console.log(`\nPDFs are now live in Supabase Storage under: ${BUCKET}/volvo/`)
