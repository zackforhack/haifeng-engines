// Remove the Volvo Penta marine legacy rows from the mistaken batch-06 import.
//
// Dry run:
//   set -a; source .env.local; node data/remove-incorrect-volvo-marine-archive-batch-06-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/remove-incorrect-volvo-marine-archive-batch-06-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const SLUGS = [
  'volvo-penta-d3-110',
  'volvo-penta-d3-150',
  'volvo-penta-d3-170',
  'volvo-penta-d3-200',
  'volvo-penta-d3-220',
  'volvo-penta-d9-500',
  'volvo-penta-d9-575',
  'volvo-penta-d12-615',
  'volvo-penta-d12-675',
  'volvo-penta-d12-700',
  'volvo-penta-d12-715',
  'volvo-penta-d12-800',
  'volvo-penta-kad32p',
  'volvo-penta-kad42p-a',
  'volvo-penta-kad43p-a',
  'volvo-penta-kad43p-b',
  'volvo-penta-kad44p-b',
  'volvo-penta-kad44p-c',
]

const { data, error } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .in('slug', SLUGS)

if (error) throw error

console.log(`Marine rows found: ${data?.length ?? 0}`)
for (const row of data ?? []) {
  console.log(`${row.brand}\t${row.model}\t${row.slug}\t${row.status}`)
}

if (APPLY && data?.length) {
  const ids = data.map((row) => row.id)
  const { error: pdfError } = await supabase.from('engine_pdfs').delete().in('engine_id', ids)
  if (pdfError) throw pdfError
  const { error: deleteError } = await supabase.from('engines').delete().in('slug', SLUGS)
  if (deleteError) throw deleteError
  console.log(`Deleted ${data.length} mistaken marine Volvo Penta row(s).`)
}

const { count, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError
console.log(`Engine count is ${count}.`)
