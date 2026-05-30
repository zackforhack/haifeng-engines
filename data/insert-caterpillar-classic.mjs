import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Caterpillar classic / legacy genset engines — ubiquitous on the used market
// (Depco, React Power, etc.) but missing from the DB, which only had the
// modern C-series + 3512C/3516C.
//
// Sources: React Power / Power Generation Enterprises / Cat genset spec pages.
//   3306  I-6 10.5L  (638 in3):  60Hz standby 250 / prime 225 ekW
//   3406C I-6 14.6L  (893 in3):  60Hz standby 400 / prime 365 ekW
//   3408  V8 18.0L  (1099 in3):  60Hz standby 440 / prime 400 ekW
//   3412C V12 27.0L:             60Hz standby 800 / prime 727 ekW
//   3508  V8 34.5L:              60Hz standby 910 / prime 820 ekW
//   C6.6  I-6 6.6L (ACERT):      60Hz standby 150 / prime 136 ekW
// Genset ratings electrical (ekW); kVA = ekW/0.8, kWm = ekW/0.9.

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)

// [model, disp_l, cyls, config, emissions, prime50, standby50, prime60, standby60]
const rows = [
  ['C6.6', 6.6,  6,  'In-line 6, Turbocharged Aftercooled (ACERT)', 'U.S. EPA Tier 3', 113, 125, 136, 150],
  ['3306', 10.5, 6,  'In-line 6, Turbocharged Aftercooled',         'U.S. EPA Tier 2', 180, 200, 225, 250],
  ['3406', 14.6, 6,  'In-line 6, Turbocharged Aftercooled',         'U.S. EPA Tier 2', 290, 320, 365, 400],
  ['3408', 18.0, 8,  'V8, Turbocharged Aftercooled',                'U.S. EPA Tier 2', 330, 365, 400, 440],
  ['3412', 27.0, 12, 'V12, Turbocharged Aftercooled',               'U.S. EPA Tier 2', 580, 640, 727, 800],
  ['3508', 34.5, 8,  'V8, Turbocharged Aftercooled',                'U.S. EPA Tier 2', 660, 730, 820, 910],
]

const records = rows.map(([model, displacement_l, cylinders, configuration, emissions_standard,
                           p50, s50, p60, s60]) => ({
  slug:                    `caterpillar-${model.toLowerCase().replace(/\./g,'-')}`,
  brand:                   'Caterpillar',
  model,
  series:                  model.startsWith('C') ? 'C Series' : '3500 Series'.replace('3500', model.slice(0,2) + '00'),
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'USA',
  emissions_standard,
  displacement_l,
  cylinders,
  configuration,
  rpm_rated:               1800,
  prime_power_kwe_50hz:    p50, prime_power_kva_50hz:   r1(p50/0.8), prime_power_kw_50hz:   r1(p50/0.9),
  standby_power_kwe_50hz:  s50, standby_power_kva_50hz: r1(s50/0.8), standby_power_kw_50hz: r1(s50/0.9),
  prime_power_kwe_60hz:    p60, prime_power_kva_60hz:   r1(p60/0.8), prime_power_kw_60hz:   r1(p60/0.9),
  standby_power_kwe_60hz:  s60, standby_power_kva_60hz: r1(s60/0.8), standby_power_kw_60hz: r1(s60/0.9),
  description: `Caterpillar ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${s60} ekW standby at 60Hz. ${emissions_standard}.`,
}))

console.log(`Inserting ${records.length} classic Caterpillar engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
