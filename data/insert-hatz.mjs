import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Hatz H-Series diesel engines for generator sets
// Source: Hatz product pages, Westquip WQ30T4H / WQ40T4H genset specs
// Both models: EPA Tier 4 Final, liquid cooled, common rail
// Origin: Germany (Motorenfabrik Hatz GmbH, Ruhstorf)

function round1(n) { return Math.round(n * 10) / 10 }

// [model, disp_l, cyls, prime_kw_60hz, standby_kw_60hz, prime_kw_50hz, standby_kw_50hz]
const rows = [
  // 3H50TIC — 3-cyl, EPA Tier 4 Final (used in Westquip WQ30T4H genset)
  ['3H50TIC', 1.47, 3, 27, 30, 22, 25],
  // 4H50TIC — 4-cyl, EPA Tier 4 Final (used in Westquip WQ40T4H genset)
  ['4H50TIC', 1.952, 4, 36, 40, 30, 33],
]

const records = rows.map(([model, displacement_l, cylinders, prime60, sb60, prime50, sb50]) => ({
  slug:                    `hatz-${model.toLowerCase()}`,
  brand:                   'Hatz',
  model,
  series:                  'H50 Series',
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'Germany',
  emissions_standard:      'U.S. EPA Final Tier 4',
  displacement_l,
  cylinders,
  configuration:           'Turbocharged, Intercooled',
  rpm_rated:               1800,
  prime_power_kw_50hz:     prime50,
  prime_power_kva_50hz:    round1(prime50 / 0.8),
  standby_power_kw_50hz:   sb50,
  standby_power_kva_50hz:  round1(sb50 / 0.8),
  prime_power_kw_60hz:     prime60,
  prime_power_kva_60hz:    round1(prime60 / 0.8),
  standby_power_kw_60hz:   sb60,
  standby_power_kva_60hz:  round1(sb60 / 0.8),
  description: `Hatz ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${prime60} kW prime / ${sb60} kW standby at 60Hz. EPA Tier 4 Final.`,
}))

console.log(`Inserting ${records.length} Hatz engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
