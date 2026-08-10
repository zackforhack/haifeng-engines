// Normalize gas fuel aliases to the catalog's controlled fuel vocabulary.
//
// Dry run:
//   set -a; source .env.local; node data/normalize-gas-fuel-aliases-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/normalize-gas-fuel-aliases-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const mappings = [
  {
    from: 'Natural Gas (CNG/LNG)',
    to: 'Natural Gas',
    reason: 'CNG and LNG are delivery/storage forms of natural gas, not separate engine-fuel categories.',
  },
  {
    from: 'Natural Gas / Biomethane',
    to: 'Natural Gas',
    reason: 'Biomethane/RNG-capable natural-gas engines should live under the Natural Gas canonical filter.',
  },
  {
    from: 'LPG',
    to: 'Propane (LPG)',
    reason: 'Propane is the user-facing name; LPG is retained as the technical/search alias.',
  },
]

let total = 0
for (const mapping of mappings) {
  const { data, error } = await supabase
    .from('engines')
    .select('id, brand, model, slug, fuel_type')
    .eq('fuel_type', mapping.from)
    .order('brand')
    .order('model')
  if (error) throw error

  console.log(`\n${mapping.from} -> ${mapping.to}`)
  console.log(`Reason: ${mapping.reason}`)
  console.log(`Rows: ${data.length}`)
  for (const row of data) console.log(`  ${row.brand} ${row.model} (${row.slug})`)
  total += data.length

  if (APPLY && data.length) {
    const { error: updateError } = await supabase
      .from('engines')
      .update({ fuel_type: mapping.to })
      .eq('fuel_type', mapping.from)
    if (updateError) throw updateError
  }
}

console.log(`\n${APPLY ? 'Updated' : 'Would update'} ${total} fuel alias row(s).`)
