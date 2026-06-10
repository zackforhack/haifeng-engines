import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Volvo Penta TWD D16 series — 60Hz / 1800 RPM engines
// Source: Volvo Penta product pages, Americas Generators, Triton Power
// Tier 4 Final EPA certified, 16.1L inline-6, water-cooled intercooled
// These are 60Hz-specific models (TWD = Turbocharged Water-cooled Diesel)

const engines = [
  // TWD1672GE — 550 kW standby at 60Hz
  {
    slug:                    'volvo-penta-twd1672ge',
    model:                   'TWD1672GE',
    series:                  '16 Litre Series',
    prime_power_kwe_60hz:    500, prime_power_kva_60hz:  625,
    standby_power_kwe_60hz:  550, standby_power_kva_60hz: 688,
    emissions_standard:      'U.S. EPA Final Tier 4',
    description:             'Volvo Penta TWD1672GE 16.1L 6-cylinder diesel engine for generator sets. 500 kWe prime / 550 kWe standby at 60Hz/1800RPM. EPA Tier 4 Final.',
  },
  // TWD1673GE — 625 kW standby at 60Hz
  {
    slug:                    'volvo-penta-twd1673ge',
    model:                   'TWD1673GE',
    series:                  '16 Litre Series',
    prime_power_kwe_60hz:    570, prime_power_kva_60hz:  713,
    standby_power_kwe_60hz:  625, standby_power_kva_60hz: 784,
    emissions_standard:      'U.S. EPA Final Tier 4',
    description:             'Volvo Penta TWD1673GE 16.1L 6-cylinder diesel engine for generator sets. 570 kWe prime / 625 kWe standby at 60Hz/1800RPM. EPA Tier 4 Final.',
  },
]

const records = engines.map((e) => ({
  ...e,
  brand:         'Volvo Penta',
  status:        'active',
  fuel_type:     'Diesel',
  origin:        'Sweden',
  displacement_l: 16.1,
  cylinders:     6,
  configuration: 'Turbocharged, Water-cooled Intercooled',
  rpm_rated:     1800,
}))

console.log(`Inserting ${records.length} Volvo Penta TWD engines…`)

const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
