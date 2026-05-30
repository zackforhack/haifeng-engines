import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Caterpillar (CAT) diesel generator engines — C-series and 3500-series
// Sources: Cat Electric Power spec sheets (LEHE series) + Cat Electric Power
//          Ratings Guide. CAT publishes electrical output (ekW), so:
//            kWe = published ekW
//            kVA = kWe / 0.8   (0.8 power factor)
//            kWm = kWe / 0.9   (mechanical, 90% alternator efficiency)
// Origin: USA (Caterpillar Inc.)
//
// Exact spec-sheet values: C4.4 60Hz (LEHE0874), C15 50Hz (LEHE1637),
// C18 50Hz (LEHE1844). Others are CAT's representative published genset ratings.

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)

// [model, disp_l, cyls, config, emissions,
//  prime50_ekw, standby50_ekw, prime60_ekw, standby60_ekw]
const rows = [
  ['C4.4',  4.4,   4,  'In-line 4, Turbocharged',                  'U.S. EPA Tier 3',          40,   45,   45,   50],
  ['C7.1',  7.01,  6,  'In-line 6, Turbocharged Aftercooled',      'U.S. EPA Tier 3',         150,  165,  175,  200],
  ['C9',    8.8,   6,  'In-line 6, Turbocharged Aftercooled',      'U.S. EPA Tier 3',         200,  250,  250,  300],
  ['C13',   12.5,  6,  'In-line 6, Turbocharged Aftercooled',      'U.S. EPA Tier 3',         320,  365,  365,  400],
  ['C15',   15.2,  6,  'In-line 6, Turbocharged Air-to-Air',       'U.S. EPA Tier 2',         360,  400,  455,  500],
  ['C18',   18.13, 6,  'In-line 6, Turbocharged Air-to-Air',       'U.S. EPA Tier 2',         564,  624,  635,  750],
  ['C27',   27.03, 12, 'V12, Turbocharged Aftercooled',            'U.S. EPA Tier 2',         600,  680,  680,  800],
  ['C32',   32.1,  12, 'V12, Turbocharged Aftercooled',            'U.S. EPA Tier 2',         800, 1000, 1000, 1250],
  ['3512C', 51.8,  12, 'V12, Turbocharged Aftercooled',            'U.S. EPA Tier 2',        1000, 1100, 1200, 1400],
  ['3516C', 78.0,  16, 'V16, Turbocharged Aftercooled',            'U.S. EPA Tier 2',        1600, 1750, 2000, 2250],
]

const records = rows.map(([model, displacement_l, cylinders, configuration, emissions_standard,
                           p50, s50, p60, s60]) => ({
  slug:                    `caterpillar-${model.toLowerCase().replace(/\./g,'-').replace(/[^a-z0-9-]/g,'')}`,
  brand:                   'Caterpillar',
  model,
  series:                  model.startsWith('35') ? '3500 Series' : 'C Series',
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'USA',
  emissions_standard,
  displacement_l,
  cylinders,
  configuration,
  rpm_rated:               1500,
  // 50Hz
  prime_power_kwe_50hz:    p50,
  prime_power_kva_50hz:    r1(p50 / 0.8),
  prime_power_kw_50hz:     r1(p50 / 0.9),
  standby_power_kwe_50hz:  s50,
  standby_power_kva_50hz:  r1(s50 / 0.8),
  standby_power_kw_50hz:   r1(s50 / 0.9),
  // 60Hz
  prime_power_kwe_60hz:    p60,
  prime_power_kva_60hz:    r1(p60 / 0.8),
  prime_power_kw_60hz:     r1(p60 / 0.9),
  standby_power_kwe_60hz:  s60,
  standby_power_kva_60hz:  r1(s60 / 0.8),
  standby_power_kw_60hz:   r1(s60 / 0.9),
  description: `Caterpillar ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${s60} ekW standby at 60Hz / ${s50} ekW standby at 50Hz. ${emissions_standard}.`,
}))

console.log(`Inserting ${records.length} Caterpillar engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
