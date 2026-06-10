// Inserts 7 Cummins QSK50 series generator drive engine records into Supabase
// Sources: official Cummins spec sheets (G3/G4/G5/G7/G17) + G-Drive catalog (G2/G6)
// G2-G7: EPA Tier 2, multi-origin (UK/USA/China) → origin NULL
// G17:   China Nonroad Stage III, China-manufactured → origin 'China'

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const BASE = {
  brand: 'Cummins', series: 'QSK50 Series', status: 'active',
  cylinders: 16, configuration: 'V16', displacement_l: 50.3,
  rpm_rated: 1500, fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
}

const records = [
  // ── G2: both 50Hz + 60Hz (catalog data, no kWm available) ─────────────────
  {
    ...BASE, model: 'QSK50-G2', slug: 'cummins-qsk50-g2',
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz:    null,  standby_power_kw_50hz:  null,
    prime_power_kwe_50hz:   1020,  prime_power_kva_50hz:   1275,
    standby_power_kwe_50hz: 1120,  standby_power_kva_50hz: 1400,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   1135,  prime_power_kva_60hz:   1419,
    standby_power_kwe_60hz: 1250,  standby_power_kva_60hz: 1563,
  },

  // ── G3: both 50Hz + 60Hz (spec sheet confirmed) ────────────────────────────
  {
    ...BASE, model: 'QSK50-G3', slug: 'cummins-qsk50-g3',
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz:    1210,  standby_power_kw_50hz:  1400,
    prime_power_kwe_50hz:   1120,  prime_power_kva_50hz:   1400,
    standby_power_kwe_50hz: 1249,  standby_power_kva_50hz: 1562,
    prime_power_kw_60hz:    1394,  standby_power_kw_60hz:  1559,
    prime_power_kwe_60hz:   1280,  prime_power_kva_60hz:   1600,
    standby_power_kwe_60hz: 1422,  standby_power_kva_60hz: 1777,
  },

  // ── G4: both 50Hz + 60Hz (spec sheet confirmed) ────────────────────────────
  {
    ...BASE, model: 'QSK50-G4', slug: 'cummins-qsk50-g4',
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz:    1328,  standby_power_kw_50hz:  1477,
    prime_power_kwe_50hz:   1232,  prime_power_kva_50hz:   1540,
    standby_power_kwe_50hz: 1360,  standby_power_kva_50hz: 1700,
    prime_power_kw_60hz:    1470,  standby_power_kw_60hz:  1656,
    prime_power_kwe_60hz:   1365,  prime_power_kva_60hz:   1706,
    standby_power_kwe_60hz: 1500,  standby_power_kva_60hz: 1875,
  },

  // ── G5: 60Hz only (spec sheet confirmed) ──────────────────────────────────
  {
    ...BASE, model: 'QSK50-G5', slug: 'cummins-qsk50-g5',
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz:    null,  standby_power_kw_50hz:  null,
    prime_power_kwe_50hz:   null,  prime_power_kva_50hz:   null,
    standby_power_kwe_50hz: null,  standby_power_kva_50hz: null,
    prime_power_kw_60hz:    1470,  standby_power_kw_60hz:  1655,
    prime_power_kwe_60hz:   1366,  prime_power_kva_60hz:   1708,
    standby_power_kwe_60hz: 1528,  standby_power_kva_60hz: 1910,
  },

  // ── G6: 60Hz only (catalog data, no kWm available) ────────────────────────
  {
    ...BASE, model: 'QSK50-G6', slug: 'cummins-qsk50-g6',
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz:    null,  standby_power_kw_50hz:  null,
    prime_power_kwe_50hz:   null,  prime_power_kva_50hz:   null,
    standby_power_kwe_50hz: null,  standby_power_kva_50hz: null,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   1455,  prime_power_kva_60hz:   1819,
    standby_power_kwe_60hz: 1600,  standby_power_kva_60hz: 2000,
  },

  // ── G7: 50Hz only (spec sheet confirmed) ──────────────────────────────────
  {
    ...BASE, model: 'QSK50-G7', slug: 'cummins-qsk50-g7',
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz:    1421,  standby_power_kw_50hz:  1581,
    prime_power_kwe_50hz:   1320,  prime_power_kva_50hz:   1650,
    standby_power_kwe_50hz: 1460,  standby_power_kva_50hz: 1825,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },

  // ── G17: 50Hz only, China CSIII (spec sheet confirmed) ────────────────────
  {
    ...BASE, model: 'QSK50-G17', slug: 'cummins-qsk50-g17',
    emissions_standard: 'China Nonroad Stage III', origin: 'China',
    prime_power_kw_50hz:    1784,  standby_power_kw_50hz:  1972,
    prime_power_kwe_50hz:   1636,  prime_power_kva_50hz:   2045,
    standby_power_kwe_50hz: 1800,  standby_power_kva_50hz: 2250,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },
]

console.log(`Upserting ${records.length} QSK50 engine records...`)
const { error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' })
if (error) { console.error('Upsert failed:', error.message); process.exit(1) }

console.log('Done:')
records.forEach(r => {
  const hz50 = r.standby_power_kva_50hz ? `50Hz: ${r.standby_power_kwe_50hz}kWe/${r.standby_power_kva_50hz}kVA standby` : '50Hz: —'
  const hz60 = r.standby_power_kva_60hz ? `60Hz: ${r.standby_power_kwe_60hz}kWe/${r.standby_power_kva_60hz}kVA standby` : '60Hz: —'
  console.log(`  ${r.model} | ${hz50} | ${hz60}`)
})
