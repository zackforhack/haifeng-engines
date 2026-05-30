import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Detroit Diesel classic generator engines (Series 60 & Series 92).
// Note: the modern Detroit Diesel/MTU Series 2000 & 4000 are already in the
// DB under the MTU brand. This adds the classic DDC engines common on the
// North American used-genset market.
//
// Sources:
//   Series 92 (8V-92TA): Spectrum 400DS spec sheet M5-100 (exact ekW)
//   Series 60 12.7L / 14.0L: Kohler REOZD / Spectrum genset ratings, EPA Tier 3
//
// Genset ratings are electrical (ekW): kVA = ekW/0.8, kWm = ekW/0.9.

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)

// [model, disp_l, cyls, config, emissions,
//  prime50_ekw, standby50_ekw, prime60_ekw, standby60_ekw]
const rows = [
  ['Series 60 12.7L', 12.7, 6, 'In-line 6, Turbocharged Aftercooled',          'U.S. EPA Tier 3', 320, 350, 360, 400],
  ['Series 60 14.0L', 14.0, 6, 'In-line 6, Turbocharged Aftercooled',          'U.S. EPA Tier 3', 364, 400, 410, 450],
  ['8V-92TA',         12.1, 8, 'V8, 2-cycle, Turbocharged Aftercooled',        'Unregulated',     304, 336, 370, 410],
]

const records = rows.map(([model, displacement_l, cylinders, configuration, emissions_standard,
                           p50, s50, p60, s60]) => ({
  slug:                    `detroit-diesel-${model.toLowerCase().replace(/[\s.()]+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'')}`,
  brand:                   'Detroit Diesel',
  model,
  series:                  model.startsWith('Series 60') ? 'Series 60' : 'Series 92',
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'USA',
  emissions_standard,
  displacement_l,
  cylinders,
  configuration,
  rpm_rated:               1800,
  prime_power_kwe_50hz:    p50,
  prime_power_kva_50hz:    r1(p50 / 0.8),
  prime_power_kw_50hz:     r1(p50 / 0.9),
  standby_power_kwe_50hz:  s50,
  standby_power_kva_50hz:  r1(s50 / 0.8),
  standby_power_kw_50hz:   r1(s50 / 0.9),
  prime_power_kwe_60hz:    p60,
  prime_power_kva_60hz:    r1(p60 / 0.8),
  prime_power_kw_60hz:     r1(p60 / 0.9),
  standby_power_kwe_60hz:  s60,
  standby_power_kva_60hz:  r1(s60 / 0.8),
  standby_power_kw_60hz:   r1(s60 / 0.9),
  description: `Detroit Diesel ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${s60} ekW standby at 60Hz / ${s50} ekW standby at 50Hz. ${emissions_standard}.`,
}))

console.log(`Inserting ${records.length} Detroit Diesel engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
