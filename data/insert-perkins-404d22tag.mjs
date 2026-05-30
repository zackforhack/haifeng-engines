import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Perkins 404D-22TAG — 400 Series, missing variant alongside existing
// 404D-22G / 404D-22TG / 404J-22G / 404J-E22TAG.
// Source: Perkins data sheet TPD1711E (404D-22TAG @ 1800 rpm), as used in
// Bluestar PD30-01IT4 genset. Exact 60Hz electrical ratings from sheet.
//   Prime:   29.2 kWe / 36.5 kVA (33.1 kWm gross)
//   Standby: 32.1 kWe / 40.2 kVA (36.4 kWm gross)
//   4-cyl, 2.216L, 84x100mm, EU Stage IIIA / EPA Interim Tier 4, 90% alt eff.
// Sheet is 60Hz/1800rpm only; no 50Hz rating published for this variant.

const record = {
  slug:                    'perkins-404d-22tag',
  brand:                   'Perkins',
  model:                   '404D-22TAG',
  series:                  '400 Series',
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'UK',
  emissions_standard:      'Euro Stage IIIA / U.S. EPA Tier 4 Interim',
  displacement_l:          2.216,
  cylinders:               4,
  configuration:           'In-line 4, Turbocharged Air-to-Air Charge Cooled',
  rpm_rated:               1800,
  // 60Hz / 1800 rpm (only frequency published on the data sheet)
  prime_power_kwe_60hz:    29.2,
  prime_power_kva_60hz:    36.5,
  prime_power_kw_60hz:     33.1,   // gross kWm
  standby_power_kwe_60hz:  32.1,
  standby_power_kva_60hz:  40.2,
  standby_power_kw_60hz:   36.4,   // gross kWm
  description: 'Perkins 404D-22TAG 2.2L 4-cylinder turbocharged air-to-air charge-cooled diesel engine for generator sets. 32.1 kWe standby / 29.2 kWe prime at 60Hz/1800RPM. EU Stage IIIA / EPA Interim Tier 4.',
}

console.log('Inserting Perkins 404D-22TAG…')
const { data, error } = await supabase.from('engines').upsert(record, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log('✓ Done')
