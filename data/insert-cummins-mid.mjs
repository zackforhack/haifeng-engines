import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Cummins mid-range G-Drive engines for generator sets
// Sources: Cummins official spec sheets (QSB7-G5, QSL9-G3/G5/G7, QSZ13-G7/G11)
// All engines: Inline-6, Turbocharged Intercooled, Common Rail fuel system
// Origin: USA (Cummins Inc., Columbus Indiana)

const engines = [
  // ── QSB7 (6.7L) ──────────────────────────────────────────────────────────
  // Source: Cummins QSB7-G5 spec sheet — EPA Tier 3 / Euro Stage IIIA
  {
    slug:                     'cummins-qsb7-g5',
    model:                    'QSB7-G5',
    series:                   'QSB7',
    displacement_l:           6.7,
    cylinders:                6,
    emissions_standard:       'U.S. EPA Tier 3',
    prime_power_kwe_50hz:     160, prime_power_kva_50hz:  200,
    standby_power_kwe_50hz:   176, standby_power_kva_50hz: 220,
    prime_power_kwe_60hz:     180, prime_power_kva_60hz:  225,
    standby_power_kwe_60hz:   200, standby_power_kva_60hz: 250,
    description: 'Cummins QSB7-G5 6.7L 6-cylinder diesel engine for generator sets. 200 kWe prime / 250 kWe standby at 60Hz. EPA Tier 3.',
  },

  // ── QSL9 (8.8L) ──────────────────────────────────────────────────────────
  // Source: Cummins QSL9-G3 spec sheet — EPA Tier 2 / Tier 3 compatible
  {
    slug:                     'cummins-qsl9-g3',
    model:                    'QSL9-G3',
    series:                   'QSL9',
    displacement_l:           8.8,
    cylinders:                6,
    emissions_standard:       'U.S. EPA Tier 3',
    prime_power_kwe_50hz:     200, prime_power_kva_50hz:  250,
    standby_power_kwe_50hz:   220, standby_power_kva_50hz: 275,
    prime_power_kwe_60hz:     225, prime_power_kva_60hz:  281,
    standby_power_kwe_60hz:   250, standby_power_kva_60hz: 313,
    description: 'Cummins QSL9-G3 8.8L 6-cylinder diesel engine for generator sets. 225 kWe prime / 250 kWe standby at 60Hz. EPA Tier 3.',
  },
  // Source: Cummins QSL9-G5 spec sheet — EPA Tier 3
  {
    slug:                     'cummins-qsl9-g5',
    model:                    'QSL9-G5',
    series:                   'QSL9',
    displacement_l:           8.8,
    cylinders:                6,
    emissions_standard:       'U.S. EPA Tier 3',
    prime_power_kwe_50hz:     220, prime_power_kva_50hz:  275,
    standby_power_kwe_50hz:   240, standby_power_kva_50hz: 300,
    prime_power_kwe_60hz:     250, prime_power_kva_60hz:  313,
    standby_power_kwe_60hz:   275, standby_power_kva_60hz: 344,
    description: 'Cummins QSL9-G5 8.8L 6-cylinder diesel engine for generator sets. 250 kWe prime / 275 kWe standby at 60Hz. EPA Tier 3.',
  },
  // Source: Cummins QSL9-G7 spec sheet — EPA Tier 3
  {
    slug:                     'cummins-qsl9-g7',
    model:                    'QSL9-G7',
    series:                   'QSL9',
    displacement_l:           8.8,
    cylinders:                6,
    emissions_standard:       'U.S. EPA Tier 3',
    prime_power_kwe_50hz:     240, prime_power_kva_50hz:  300,
    standby_power_kwe_50hz:   264, standby_power_kva_50hz: 330,
    prime_power_kwe_60hz:     275, prime_power_kva_60hz:  344,
    standby_power_kwe_60hz:   300, standby_power_kva_60hz: 375,
    description: 'Cummins QSL9-G7 8.8L 6-cylinder diesel engine for generator sets. 275 kWe prime / 300 kWe standby at 60Hz. EPA Tier 3.',
  },

  // ── QSZ13 (12.9L) ────────────────────────────────────────────────────────
  // Source: Cummins QSZ13-G7 spec sheet — EPA Tier 3
  {
    slug:                     'cummins-qsz13-g7',
    model:                    'QSZ13-G7',
    series:                   'QSZ13',
    displacement_l:           12.9,
    cylinders:                6,
    emissions_standard:       'U.S. EPA Tier 3',
    prime_power_kwe_50hz:     320, prime_power_kva_50hz:  400,
    standby_power_kwe_50hz:   360, standby_power_kva_50hz: 450,
    prime_power_kwe_60hz:     400, prime_power_kva_60hz:  500,
    standby_power_kwe_60hz:   440, standby_power_kva_60hz: 550,
    description: 'Cummins QSZ13-G7 12.9L 6-cylinder diesel engine for generator sets. 400 kWe prime / 440 kWe standby at 60Hz. EPA Tier 3.',
  },
  // Source: Cummins QSZ13-G11 spec sheet — EPA Tier 3 / Stage IIIA
  {
    slug:                     'cummins-qsz13-g11',
    model:                    'QSZ13-G11',
    series:                   'QSZ13',
    displacement_l:           12.9,
    cylinders:                6,
    emissions_standard:       'U.S. EPA Tier 3',
    prime_power_kwe_50hz:     400, prime_power_kva_50hz:  500,
    standby_power_kwe_50hz:   440, standby_power_kva_50hz: 550,
    prime_power_kwe_60hz:     440, prime_power_kva_60hz:  550,
    standby_power_kwe_60hz:   500, standby_power_kva_60hz: 625,
    description: 'Cummins QSZ13-G11 12.9L 6-cylinder diesel engine for generator sets. 440 kWe prime / 500 kWe standby at 60Hz. EPA Tier 3.',
  },
]

const records = engines.map((e) => ({
  ...e,
  brand:            'Cummins',
  status:           'active',
  fuel_type:        'Diesel',
  origin:           'USA',
  configuration:    'Turbocharged, Intercooled',
  rpm_rated:        1800,
}))

console.log(`Inserting ${records.length} Cummins mid-range engines…`)

const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
