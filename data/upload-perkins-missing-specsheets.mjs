// Uploads the 4 manually-sourced Perkins regulated engine spec sheets
// and links them to their respective engine records in engine_pdfs.

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const PREFIX = 'perkins/spec-sheets'
const DL = '/Users/ziqianhuang/Downloads'

// [localPath, storageFilename, label, slugs[]]
const UPLOADS = [
  [`${DL}/904J-E36TAG1.pdf`, '904J-E36TAG1.pdf',
    'Perkins 904J-E36TAG Electric Power Engines (TAG1)',
    ['perkins-904j-e36tag1']],

  [`${DL}/904J-E36TAG3.pdf`, '904J-E36TAG3.pdf',
    'Perkins 904J-E36TAG Electric Power Engines (TAG3)',
    ['perkins-904j-e36tag3']],

  [`${DL}/1103D-33G2.pdf`, '1103D-33G2.pdf',
    'Perkins 1103D-33 G2 Diesel Engine ElectropaK Spec Sheet',
    ['perkins-1103d-33g2']],

  [`${DL}/2406J-E13TAG3.pdf`, '2406J-E13TAG3.pdf',
    'Perkins 2406J-E13TAG3 Electric Power Engines',
    ['perkins-2406j-e13tag3']],
]

const allSlugs = UPLOADS.flatMap(([,,, slugs]) => slugs)
const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', allSlugs)
if (engErr) { console.error('DB error:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${allSlugs.length} engine records\n`)

let uploaded = 0, skipped = 0, failed = 0

for (const [localPath, filename, label, slugs] of UPLOADS) {
  const storagePath = `${PREFIX}/${filename}`
  process.stdout.write(`📤 ${filename} ... `)

  const { ok, skipped: wasSkipped } = await uploadPdf(supabase, BUCKET, localPath, storagePath)
  if (!ok) { console.log('Upload failed'); failed++; continue }
  if (wasSkipped) { console.log('already in storage'); skipped++ }
  else { console.log('uploaded'); uploaded++ }

  const fileSize = fs.statSync(localPath).size
  for (const slug of slugs) {
    const engineId = slugToId[slug]
    if (!engineId) { console.warn(`  ⚠️  Not in DB: ${slug}`); continue }

    await supabase.from('engine_pdfs').delete()
      .eq('engine_id', engineId).eq('storage_path', storagePath)

    const { error } = await supabase.from('engine_pdfs').insert({
      engine_id: engineId,
      type: 'datasheet',
      label,
      storage_path: storagePath,
      file_size_bytes: fileSize,
    })
    if (error) console.warn(`  ⚠️  DB insert failed for ${slug}: ${error.message}`)
    else console.log(`  → ${slug}`)
  }
}

console.log(`\n=== DONE ===`)
console.log(`Uploaded: ${uploaded} | Skipped (already exists): ${skipped} | Failed: ${failed}`)
