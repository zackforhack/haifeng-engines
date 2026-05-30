import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Mitsubishi Y2PTAW series — North American EPA Tier 2 stationary-standby
// engines, 60Hz / 1800 rpm only. Used by AKSA APD-ULM and Kohler REOZMD gensets.
//
// Fixes the two existing entries (S12R/S16R) that were mistakenly stored in
// 50Hz columns (these are 60Hz units) and as mechanical kW, and adds the two
// missing smaller-displacement variants (S12A2, S12H) from AKSA datasheets.
//
// Sources:
//   S12A2-Y2PTAW-2: AKSA APD-ULM800 (800 kW standby, 60Hz); S12A2 = 33.93L V12
//   S12H-Y2PTAW-1:  AKSA APD-ULM1000 (1000 kW standby, 60Hz); S12H = 37.11L V12
//   S12R-Y2PTAW-1:  Kohler 1250REOZMD (1250 kW); S12R = 49.03L V12
//   S16R-Y2PTAW-1:  Kohler 1600REOZMD (1600 kW); S16R = 65.37L V16
// Genset standby ratings electrical (ekW); prime ~= 0.9 x standby.
// kVA = ekW/0.8, kWm = ekW/0.9.

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)

// [model, disp_l, cyls, standby60_ekw, prime60_ekw]
const rows = [
  ['S12A2-Y2PTAW-2', 33.93, 12,  800,  727],
  ['S12H-Y2PTAW-1',  37.11, 12, 1000,  900],
  ['S12R-Y2PTAW-1',  49.03, 12, 1250, 1125],
  ['S16R-Y2PTAW-1',  65.37, 16, 1600, 1440],
]

const records = rows.map(([model, displacement_l, cylinders, s60, p60]) => ({
  slug:                    `mitsubishi-${model.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')}`,
  brand:                   'Mitsubishi',
  model,
  series:                  model.startsWith('S12A2') ? 'S12A2 Series'
                         : model.startsWith('S12H')  ? 'S12H Series'
                         : model.startsWith('S12R')  ? 'S12R Series'
                         : 'S16R Series',
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'Japan',
  emissions_standard:      'U.S. EPA Tier 2',
  displacement_l,
  cylinders,
  configuration:           cylinders === 16 ? 'V16, Turbocharged Aftercooled' : 'V12, Turbocharged Aftercooled',
  rpm_rated:               1800,
  // 60Hz only (North American EPA models); clear 50Hz columns
  prime_power_kw_50hz:     null,
  prime_power_kwe_50hz:    null,
  prime_power_kva_50hz:    null,
  standby_power_kw_50hz:   null,
  standby_power_kwe_50hz:  null,
  standby_power_kva_50hz:  null,
  prime_power_kwe_60hz:    p60,
  prime_power_kva_60hz:    r1(p60 / 0.8),
  prime_power_kw_60hz:     r1(p60 / 0.9),
  standby_power_kwe_60hz:  s60,
  standby_power_kva_60hz:  r1(s60 / 0.8),
  standby_power_kw_60hz:   r1(s60 / 0.9),
  description: `Mitsubishi ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${s60} kWe standby / ${p60} kWe prime at 60Hz/1800RPM. EPA Tier 2 stationary standby.`,
}))

console.log(`Upserting ${records.length} Mitsubishi Y2PTAW engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
