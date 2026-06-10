import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'

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
]

const allSlugs = [...new Set(pdfEngineMap.flatMap(p => p.slugs))]
const { data: engines, error } = await supabase.from('engines').select('id, slug').in('slug', allSlugs)
if (error) { console.error(error.message); process.exit(1) }

const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${allSlugs.length} engines in DB\n`)

let linked = 0
for (const entry of pdfEngineMap) {
  const storagePath = `volvo/${entry.file}`
  const { data: fileInfo } = await supabase.storage.from(BUCKET).list('volvo', { search: entry.file })
  const fileSize = fileInfo?.[0]?.metadata?.size ?? null

  for (const slug of entry.slugs) {
    const engineId = slugToId[slug]
    if (!engineId) { console.warn(`⚠️  Not in DB: ${slug}`); continue }

    await supabase.from('engine_pdfs').delete().eq('engine_id', engineId).eq('storage_path', storagePath)
    const { error: insertErr } = await supabase.from('engine_pdfs').insert({
      engine_id: engineId,
      type: entry.type,
      label: entry.label,
      storage_path: storagePath,
      file_size_bytes: fileSize,
    })

    if (insertErr) console.warn(`⚠️  Insert failed for ${slug}: ${insertErr.message}`)
    else { console.log(`✅ Linked ${entry.file} → ${slug}`); linked++ }
  }
}

console.log(`\nDone. ${linked} PDF links created in engine_pdfs table.`)
