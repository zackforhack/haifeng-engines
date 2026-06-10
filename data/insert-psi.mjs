import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// PSI (Power Solutions International) — 60Hz / 1800 RPM diesel engines
// Source: PSI 60Hz Engines 1800RPM spec sheet
// All ratings: Standby application, EPA Tier 3, Diesel fuel
// Origin: USA (Wood Dale, Illinois)

// Columns: [model, displacement_l, standby_kwe, standby_kwm]
const rows = [
  ['PSI 20L-D',  19.6,   600,  670],
  ['PSI 20L-D',  19.6,   650,  726],
  ['PSI 26L-D',  26.1,   700,  800],
  ['PSI 26L-D',  26.1,   840,  946],
  ['PSI 40L-D',  39.2,  1000, 1120],
  ['PSI 40L-D',  39.2,  1300, 1420],
  ['PSI 53L-D',  52.3,  1500, 1680],
  ['PSI 53L-D',  52.3,  1750, 1893],
  ['PSI 65L-D',  65.4,  2000, 2230],
  ['PSI 66L-D',  65.65, 2300, 2500],
  ['PSI 66L-D',  65.65, 2500, 2700],
  ['PSI 88L-D',  87.5,  2800, 3150],
  ['PSI 88L-D',  87.5,  3000, 3350],
  ['PSI 88L-D',  87.5,  3300, 3600],
]

const records = rows.map(([model, displacement_l, standby_kwe, standby_kwm]) => {
  const slug = `psi-${model.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${standby_kwe}kwe`
  return {
    slug,
    brand:                    'PSI',
    model,
    status:                   'active',
    fuel_type:                'Diesel',
    origin:                   'USA',
    emissions_standard:       'U.S. EPA Tier 3',
    displacement_l,
    rpm_rated:                1800,
    standby_power_kwe_60hz:   standby_kwe,
    standby_power_kw_60hz:    standby_kwm,
    description:              `PSI ${model} ${displacement_l}L diesel engine for generator sets. ${standby_kwe} kWe standby at 60Hz/1800RPM. EPA Tier 3.`,
  }
})

console.log(`Inserting ${records.length} PSI engines…`)

const { data, error } = await supabase.from('engines').insert(records).select('id, model, standby_power_kwe_60hz')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}  ${r.standby_power_kwe_60hz} kWe`))
console.log(`✓ Done — ${data.length} records inserted`)
