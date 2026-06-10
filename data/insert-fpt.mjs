import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// FPT Industrial (Iveco FPT) diesel engines for power generation
// Sources:
//   TierIII_FPT_2023_OCTOBER.pdf  — Tier III, 60Hz, kVA ratings
//   GD_T4B_FPT_2023.pdf           — Tier 4 Final, 60Hz, kWm (mechanical) ratings
// All engines: 60Hz / 1800 RPM, origin Italy

function slug(model) {
  return 'fpt-' + model.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Tier III engines ──────────────────────────────────────────────────────────
// Power ratings in kVA @ 60Hz/1800rpm, 0.8 power factor
// kW = kVA × 0.8
// Columns: [model, cylinders, config, displacement_l, prime_kva, standby_kva]
const tierIII = [
  ['NEF45SM1X',  4, 'Turbocharged',             4.5,  54,  59],
  ['NEF45SM2X',  4, 'Turbocharged',             4.5,  63,  69],
  ['NEF45 TE1P', 4, 'Turbocharged, Intercooled', 4.5,  82,  90],
  ['NEF45 TE2P', 6, 'Turbocharged',             null, 114, 125],
  ['NEF67 TM1X', 6, 'Turbocharged, Intercooled', 6.7, 135, 148],
  ['NEF67 TE1PV',6, 'Turbocharged, Intercooled', 6.7, 150, 165],
  ['NEF67 TE2PV',6, 'Turbocharged, Intercooled', 6.7, 191, 210],
  ['NEF67 TE3PV',6, 'Turbocharged, Intercooled', 6.7, 200, 220],
  ['C87 TE3F',   6, 'Turbocharged, Intercooled', 8.7, 264, 290],
  ['C87 TE1PV',  6, 'Turbocharged, Intercooled', 8.7, 300, 330],
  ['C13 TE2F',   6, 'Turbocharged, Intercooled',12.9, 400, 440],
]

const tierIIIRecords = tierIII.map(([model, cylinders, config, disp, prime_kva, standby_kva]) => ({
  slug:                      slug(model),
  brand:                     'FPT',
  model,
  status:                    'active',
  fuel_type:                 'Diesel',
  origin:                    'Italy',
  emissions_standard:        'U.S. EPA Tier 3',
  cylinders,
  configuration:             config,
  displacement_l:            disp,
  rpm_rated:                 1800,
  prime_power_kva_60hz:      prime_kva,
  prime_power_kw_60hz:       Math.round(prime_kva * 0.8 * 10) / 10,
  standby_power_kva_60hz:    standby_kva,
  standby_power_kw_60hz:     Math.round(standby_kva * 0.8 * 10) / 10,
  description: `FPT ${model} ${cylinders}-cylinder${disp ? ` ${disp}L` : ''} diesel engine for generator sets. ${prime_kva} kVA prime / ${standby_kva} kVA standby at 60Hz. EPA Tier 3.`,
}))

// ── Tier 4 Final engines ──────────────────────────────────────────────────────
// Power ratings in kWm (mechanical shaft power) @ 60Hz/1800rpm
// Columns: [model, cylinders, config, displacement_l, prime_kwm, standby_kwm]
const tierIVF = [
  ['F34TEVP02.00',     4, 'Turbocharged',             null,  34.6,  38.5],
  ['F34TEVP04.00',     4, 'Turbocharged',             null,  44.1,  48.6],
  ['F34TEVP01.00',     4, 'Turbocharged, Intercooled', null,  53.6,  53.6],
  ['F36ETVP03.A85',   4, 'Turbocharged, Intercooled', null,  88.2,  97.6],
  ['F36ETVP03.A94',   4, 'Turbocharged, Intercooled', null,  99.2,  99.2],
  ['N67TEVP06.00',    6, 'Turbocharged, Intercooled', 6.7,  151,   167],
  ['N67TEVP05.00',    6, 'Turbocharged, Intercooled', 6.7,  201,   222],
  ['C87TEVP01.00',    6, 'Turbocharged, Intercooled', 8.7,  258,   285],
  ['C87TEVP04.00',    6, 'Turbocharged, Intercooled', 8.7,  296,   327],
  ['C13ETVP03.A363',  6, 'Turbocharged, Intercooled',12.9,  350,   387],
  ['C13ETVP03.0A395', 6, 'Turbocharged, Intercooled',12.9,  385,   426],
]

const tierIVFRecords = tierIVF.map(([model, cylinders, config, disp, prime_kwm, standby_kwm]) => ({
  slug:                      slug(model),
  brand:                     'FPT',
  model,
  status:                    'active',
  fuel_type:                 'Diesel',
  origin:                    'Italy',
  emissions_standard:        'U.S. EPA Final Tier 4',
  cylinders,
  configuration:             config,
  displacement_l:            disp,
  rpm_rated:                 1800,
  prime_power_kw_60hz:       prime_kwm,
  standby_power_kw_60hz:     standby_kwm,
  description: `FPT ${model} ${cylinders}-cylinder${disp ? ` ${disp}L` : ''} diesel engine for generator sets. ${prime_kwm} kWm prime / ${standby_kwm} kWm standby at 60Hz. EPA Tier 4 Final (DOC+DPF+SCR).`,
}))

const records = [...tierIIIRecords, ...tierIVFRecords]
console.log(`Inserting ${records.length} FPT engines (${tierIIIRecords.length} Tier III + ${tierIVFRecords.length} Tier 4 Final)…`)

const BATCH = 50
for (let i = 0; i < records.length; i += BATCH) {
  const batch = records.slice(i, i + BATCH)
  const { data, error } = await supabase.from('engines').insert(batch).select('id, model, emissions_standard')
  if (error) { console.error('Error:', error.message); process.exit(1) }
  data.forEach(r => console.log(`  ${r.id}  ${r.model}  [${r.emissions_standard}]`))
}

console.log(`✓ Done — ${records.length} FPT records inserted`)
