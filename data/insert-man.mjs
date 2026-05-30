import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// MAN Engines (MAN Truck & Bus / MAN Energy Solutions, Germany) — D-series
// high-speed diesel engines for power generation. New brand.
//
// Source: MAN "POWER — Diesel Engines for Power Generation" brochure, product
// range table. Values are ENGINE mechanical kW per ISO 8528 duty (ESP=standby,
// PRP=prime), at 1500rpm/50Hz. Genset electrical kWe derived = kWm x 0.96
// (alternator efficiency) — flagged estimated on the detail page. kVA = kWe/0.8.
// Using top-of-range ESP/PRP figures from the brochure.

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const kwe = (kwm) => (kwm == null ? null : r1(kwm * 0.96))
const kva = (kwm) => (kwm == null ? null : r1((kwm * 0.96) / 0.8))

// [model, cyls, config, disp_l, emissions, prime_kwm(PRP), standby_kwm(ESP)]
const rows = [
  ['D2676', 6,  'In-line 6, Turbocharged Intercooled', 12.4, 'Euro Stage IIIA', 377,  440],
  ['D2840', 10, 'V10 90°, Turbocharged Intercooled',   18.3, 'Euro Stage II',   565,  660],
  ['D2842', 12, 'V12 90°, Turbocharged Intercooled',   21.9, 'Euro Stage II',   695,  800],
  ['D2862', 12, 'V12 90°, Turbocharged Intercooled',   24.2, 'Euro Stage II',   836, 1117],
]

const records = rows.map(([model, cylinders, configuration, displacement_l, emissions_standard, prp, esp]) => ({
  slug:                    `man-${model.toLowerCase()}`,
  brand:                   'MAN',
  model,
  series:                  'D-Series',
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'Germany',
  emissions_standard,
  displacement_l,
  cylinders,
  configuration,
  rpm_rated:               1500,
  // 50Hz / 1500 rpm; kW column = engine mechanical (kWm), kWe derived
  prime_power_kw_50hz:     prp,       prime_power_kwe_50hz:   kwe(prp), prime_power_kva_50hz:   kva(prp),
  standby_power_kw_50hz:   esp,       standby_power_kwe_50hz: kwe(esp), standby_power_kva_50hz: kva(esp),
  description: `MAN ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${esp} kWm emergency-standby / ${prp} kWm prime at 1500rpm. ${emissions_standard}. kWe estimated at 96% alternator efficiency.`,
}))

console.log(`Inserting ${records.length} MAN engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
