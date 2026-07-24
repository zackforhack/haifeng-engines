import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// FPT Industrial (Iveco FPT) diesel engines for power generation
// Sources:
//   FPT_Power_Generation_Brochure_EN.pdf — Tier III, 60Hz ratings
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
// Manufacturer-published 60Hz/1800rpm values. Do not derive kWe or kVA.
// Columns:
// [model, cylinders, config, displacement_l,
//  prime_kwm, prime_kwe, prime_kva, standby_kwm, standby_kwe, standby_kva]
const tierIII = [
  ['NEF45SM1X',  4, 'Turbocharged',              4.5,  52,  47,  59,  57,  52,  65],
  ['NEF45SM2X',  4, 'Turbocharged',              4.5,  61,  55,  69,  67,  61,  76],
  ['NEF45 TE1P', 4, 'Turbocharged, Intercooled', 4.5,  79,  72,  90,  87,  79,  99],
  ['NEF45 TE2P', 4, 'Turbocharged, Intercooled', 4.5, 111, 102, 128, 122, 112, 141],
  ['NEF67 TM1X', 6, 'Turbocharged, Intercooled', 6.7, 128, 117, 147, 141, 129, 162],
  ['NEF67 TE1PV',6, 'Turbocharged, Intercooled', 6.7, 141, 130, 163, 156, 144, 180],
  ['NEF67 TE2PV',6, 'Turbocharged, Intercooled', 6.7, 182, 170, 212, 201, 187, 234],
  ['NEF67 TE3PV',6, 'Turbocharged, Intercooled', 6.7, 191, 178, 223, 211, 197, 246],
  ['C87 TE3F',   6, 'Turbocharged, Intercooled', 8.7, 251, 233, 292, 280, 260, 326],
  ['C87 TE1PV',  6, 'Turbocharged, Intercooled', 8.7, 291, 271, 338, 321, 299, 373],
  ['C13 TE2F',   6, 'Turbocharged, Intercooled',12.9, 301, 286, 357, 334, 317, 397],
]

const tierIIIRecords = tierIII.map(([
  model,
  cylinders,
  config,
  disp,
  prime_kwm,
  prime_kwe,
  prime_kva,
  standby_kwm,
  standby_kwe,
  standby_kva,
]) => ({
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
  power_kw:                  standby_kwm,
  prime_power_kw_60hz:       prime_kwm,
  prime_power_kwe_60hz:      prime_kwe,
  prime_power_kva_60hz:      prime_kva,
  standby_power_kw_60hz:     standby_kwm,
  standby_power_kwe_60hz:    standby_kwe,
  standby_power_kva_60hz:    standby_kva,
  certifications:            ['U.S. EPA Tier 3'],
  description: `FPT ${model} ${cylinders}-cylinder ${disp} L diesel engine for generator sets. At 60 Hz and 1800 RPM, FPT publishes ${prime_kwm} kWm / ${prime_kwe} kWe prime and ${standby_kwm} kWm / ${standby_kwe} kWe standby. U.S. EPA Tier 3.`,
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
  const { data, error } = await supabase
    .from('engines')
    .upsert(batch, { onConflict: 'slug' })
    .select('id, model, emissions_standard')
  if (error) { console.error('Error:', error.message); process.exit(1) }
  data.forEach(r => console.log(`  ${r.id}  ${r.model}  [${r.emissions_standard}]`))
}

console.log(`✓ Done — ${records.length} FPT records inserted`)
