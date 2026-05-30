import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Detroit Diesel classic 2-stroke V-series (71 & 149) — legacy genset engines
// common on the used market (Depco stocks the 12V71, etc.). The DB had only
// Series 60 + 8V-92TA.
//
// Displacement is exact (71 cu-in/cyl = 1.163 L; 149 cu-in/cyl = 2.442 L).
// 2-stroke genset power ratings vary widely by tune (N/T/TA/TI); values here
// are REPRESENTATIVE turbocharged genset ratings for each frame, not a single
// spec sheet. Electrical ekW; kVA = ekW/0.8, kWm = ekW/0.9.

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)

// [model, disp_l, cyls, config, prime50, standby50, prime60, standby60]
const rows = [
  ['6V71',  7.0,  6,  'V6, 2-cycle, Turbocharged',         80,  88,  95, 105],
  ['8V71',  9.3,  8,  'V8, 2-cycle, Turbocharged',        113, 125, 135, 150],
  ['12V71', 14.0, 12, 'V12, 2-cycle, Turbocharged',       190, 210, 225, 250],
  ['16V71', 18.6, 16, 'V16, 2-cycle, Turbocharged',       265, 290, 320, 350],
  ['12V149', 29.3, 12, 'V12, 2-cycle, Turbocharged',      525, 580, 635, 700],
  ['16V149', 39.1, 16, 'V16, 2-cycle, Turbocharged',      750, 830, 910, 1000],
]

const records = rows.map(([model, displacement_l, cylinders, configuration, p50, s50, p60, s60]) => ({
  slug:                    `detroit-diesel-${model.toLowerCase()}`,
  brand:                   'Detroit Diesel',
  model,
  series:                  model.includes('149') ? 'Series 149' : 'Series 71',
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'USA',
  emissions_standard:      'Unregulated',
  displacement_l,
  cylinders,
  configuration,
  rpm_rated:               1800,
  prime_power_kwe_50hz:    p50, prime_power_kva_50hz:   r1(p50/0.8), prime_power_kw_50hz:   r1(p50/0.9),
  standby_power_kwe_50hz:  s50, standby_power_kva_50hz: r1(s50/0.8), standby_power_kw_50hz: r1(s50/0.9),
  prime_power_kwe_60hz:    p60, prime_power_kva_60hz:   r1(p60/0.8), prime_power_kw_60hz:   r1(p60/0.9),
  standby_power_kwe_60hz:  s60, standby_power_kva_60hz: r1(s60/0.8), standby_power_kw_60hz: r1(s60/0.9),
  description: `Detroit Diesel ${model} ${displacement_l}L ${cylinders}-cylinder 2-stroke diesel engine for generator sets. ~${s60} ekW standby at 60Hz (representative turbocharged rating). Classic 2-stroke, unregulated.`,
}))

console.log(`Inserting ${records.length} Detroit Diesel 2-stroke engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
