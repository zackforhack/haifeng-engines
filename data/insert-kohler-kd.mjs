import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Kohler KD Series — Kohler's own G-Drive diesel engines (co-developed with
// Liebherr), powering the Rehlko/Kohler KD800–KD4000 industrial generators.
// These are the only Rehlko diesels NOT sourced from another maker (the
// traditional REOZ line uses John Deere / Volvo / Mitsubishi / MTU, all
// already in the DB).
//
// Sources: Kohler KD Series engine + generator brochures.
//   135-series (135mm bore): KD27V12 (27L), KD36V16 (36L), KD45V20 (45L)
//   175-series (175mm bore): KD62V12 (62.4L), KD83V16 (82.7L), KD103V20 (103.4L)
//   Generator model number = standby kW (KD800=800kW … KD4000=4000kW),
//   which sets the standby ekW per engine. KD3000 = 3000/2720 confirmed.
// EPA Tier 2 (stationary emergency). Genset ratings electrical (ekW).

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)

// [model, disp_l, cyls, config, prime50, standby50, prime60, standby60, gensets]
const rows = [
  ['KD27V12',   27.0,  12, 'V12, Turbocharged Aftercooled, Common Rail',  820,  900,  910, 1000, 'KD800–KD1000'],
  ['KD36V16',   36.0,  16, 'V16, Turbocharged Aftercooled, Common Rail', 1360, 1500, 1225, 1350, 'KD1250–KD1500'],
  ['KD45V20',   45.0,  20, 'V20, Turbocharged Aftercooled, Common Rail', 1590, 1750, 1590, 1750, 'KD1250–KD1750'],
  ['KD62V12',   62.4,  12, 'V12, Turbocharged Aftercooled, Common Rail', 2050, 2250, 2250, 2500, 'KD2000–KD2500'],
  ['KD83V16',   82.72, 16, 'V16, Turbocharged Aftercooled, Common Rail', 3180, 3500, 2950, 3250, 'KD2800–KD3500'],
  ['KD103V20', 103.4,  20, 'V20, Turbocharged Aftercooled, Common Rail', 3180, 3500, 3640, 4000, 'up to KD4000'],
]

const records = rows.map(([model, displacement_l, cylinders, configuration,
                           p50, s50, p60, s60, gensets]) => ({
  slug:                    `kohler-${model.toLowerCase()}`,
  brand:                   'Kohler',
  model,
  series:                  'KD Series',
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'France',
  emissions_standard:      'U.S. EPA Tier 2',
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
  description: `Kohler ${model} ${displacement_l}L ${cylinders}-cylinder G-Drive diesel engine for generator sets (${gensets}). ${s60} ekW standby at 60Hz / ${s50} ekW standby at 50Hz. EPA Tier 2.`,
}))

console.log(`Inserting ${records.length} Kohler KD Series engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
