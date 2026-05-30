import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// DEUTZ AG (Cologne, Germany) — major diesel engine maker, common in European
// and mobile gensets. New brand. Core genset engine families across air-,
// oil- and water-cooled lines.
//
// Source: Deutz genset spec table (mittronik), 50Hz/1500rpm electrical kVA/kW.
// 50Hz standby is documented; 60Hz is ESTIMATED (~1.15x, standard 1500->1800
// genset scaling) and noted as such. Displacement from Deutz series geometry
// (2011: 0.78 L/cyl; 914: 1.02; 1013/2013: 1.19; 1015: 1.98 L/cyl V).
// kVA = kWe/0.8, kWm = kWe/0.9.

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const kva = (k) => (k == null ? null : r1(k / 0.8))
const kwm = (k) => (k == null ? null : r1(k / 0.9))

// [model, disp_l, cyls, config, emissions, standby50_kwe]
const rows = [
  ['F3L2011',   2.33, 3, 'In-line 3, Air-cooled',                    'Euro Stage IIIA', 18],
  ['F4L2011',   3.1,  4, 'In-line 4, Air-cooled',                    'Euro Stage IIIA', 26],
  ['BF4L2011',  3.1,  4, 'In-line 4, Air-cooled, Turbocharged',      'Euro Stage IIIA', 34],
  ['F6L914',    6.1,  6, 'In-line 6, Air-cooled',                    'Euro Stage II',   48],
  ['BF4M2011',  3.1,  4, 'In-line 4, Oil-cooled, Turbocharged',      'Euro Stage IIIA', 48],
  ['BF4M1013',  4.76, 4, 'In-line 4, Turbocharged Intercooled',      'Euro Stage II',  120],
  ['BF6M1013',  7.15, 6, 'In-line 6, Turbocharged Intercooled',      'Euro Stage II',  200],
  ['TCD2013L6', 7.15, 6, 'In-line 6, Turbocharged Intercooled',      'Euro Stage IIIA', 240],
  ['BF6M1015',  11.9, 6, 'V6, Turbocharged Intercooled',             'Euro Stage II',  304],
  ['BF8M1015',  15.9, 8, 'V8, Turbocharged Intercooled',             'Euro Stage II',  400],
]

const records = rows.map(([model, displacement_l, cylinders, configuration, emissions_standard, s50]) => {
  const p50 = r1(s50 * 0.9)
  const s60 = r1(s50 * 1.15)   // estimated 60Hz
  const p60 = r1(s60 * 0.9)
  return {
    slug:                    `deutz-${model.toLowerCase()}`,
    brand:                   'Deutz',
    model,
    series:                  model.includes('2011') ? '2011 Series'
                           : model.includes('914')  ? '914 Series'
                           : model.includes('1013') || model.includes('2013') ? '1013 Series'
                           : '1015 Series',
    status:                  'active',
    fuel_type:               'Diesel',
    origin:                  'Germany',
    emissions_standard,
    displacement_l,
    cylinders,
    configuration,
    rpm_rated:               1500,
    prime_power_kwe_50hz:    p50, prime_power_kva_50hz:   kva(p50), prime_power_kw_50hz:   kwm(p50),
    standby_power_kwe_50hz:  s50, standby_power_kva_50hz: kva(s50), standby_power_kw_50hz: kwm(s50),
    prime_power_kwe_60hz:    p60, prime_power_kva_60hz:   kva(p60), prime_power_kw_60hz:   kwm(p60),
    standby_power_kwe_60hz:  s60, standby_power_kva_60hz: kva(s60), standby_power_kw_60hz: kwm(s60),
    description: `Deutz ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${s50} kWe standby at 50Hz (60Hz estimated). ${emissions_standard}.`,
  }
})

console.log(`Inserting ${records.length} Deutz engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
