import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Kohler KDI series — Kohler's SMALL diesel engine line (Lombardini-built,
// Italy), distinct from the large KD Series already in the DB. Used in compact
// gensets (SDMO K-series, Kohler REOZK) in the ~17-60 kW range.
//
// Sources / genset rating anchors:
//   KDI1903TCR (1.9L, 3-cyl): SDMO K20U = 19 kW genset
//   KDI2504TCR (2.5L, 4-cyl): SDMO K30UM = 30 kW genset
//   KDI3404TCR (3.4L, 4-cyl): Kohler 40-60REOZK = 40-60 kW genset
//   Engine data: Kohler KDI Power Pack brochure (Tier 4 Final / Stage V,
//   common rail, no DPF on TCR via EGR+DOC). Genset ratings are electrical.
// kVA = kWe/0.8, kWm = kWe/0.9.

const r1 = (n) => Math.round(n * 10) / 10

// [model, disp_l, cyls, prime50, standby50, prime60, standby60]
const rows = [
  ['KDI1903TCR', 1.9, 3, 16, 17, 18, 20],
  ['KDI2504TCR', 2.5, 4, 24, 26, 27, 30],
  ['KDI3404TCR', 3.4, 4, 45, 50, 54, 60],
]

const records = rows.map(([model, displacement_l, cylinders, p50, s50, p60, s60]) => ({
  slug:                    `kohler-${model.toLowerCase()}`,
  brand:                   'Kohler',
  model,
  series:                  'KDI Series',
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'Italy',
  emissions_standard:      'U.S. EPA Final Tier 4',
  displacement_l,
  cylinders,
  configuration:           `In-line ${cylinders}, Turbocharged, Common Rail`,
  rpm_rated:               1800,
  prime_power_kwe_50hz:    p50,  prime_power_kva_50hz:   r1(p50/0.8), prime_power_kw_50hz:   r1(p50/0.9),
  standby_power_kwe_50hz:  s50,  standby_power_kva_50hz: r1(s50/0.8), standby_power_kw_50hz: r1(s50/0.9),
  prime_power_kwe_60hz:    p60,  prime_power_kva_60hz:   r1(p60/0.8), prime_power_kw_60hz:   r1(p60/0.9),
  standby_power_kwe_60hz:  s60,  standby_power_kva_60hz: r1(s60/0.8), standby_power_kw_60hz: r1(s60/0.9),
  description: `Kohler ${model} ${displacement_l}L ${cylinders}-cylinder common-rail diesel engine for compact generator sets. ${s60} kWe standby at 60Hz. EPA Tier 4 Final. Kohler's small-diesel (Lombardini) line, distinct from the large KD Series.`,
}))

console.log(`Inserting ${records.length} Kohler KDI engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
