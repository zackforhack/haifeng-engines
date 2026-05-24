// Inserts 11 Cummins QSK60 series generator drive engine records into Supabase
// All specs confirmed from official Cummins spec sheets
//
// G3, G4, G7:       HPI fuel system (older generation), 2019 spec sheets
// G6, G10–G13:      MCRS fuel system (second generation), 2019–2022 spec sheets
// G8, G21, G23:     MCRS, genset-format spec sheets (Cummins ONAN UK)
//
// All EPA Tier 2; origin=null (manufactured primarily UK/Daventry, some multi-origin)
// Engine: V16, 60.2L, 159×190mm bore×stroke

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const BASE = {
  brand: 'Cummins', series: 'QSK60 Series', status: 'active',
  cylinders: 16, configuration: 'V16', displacement_l: 60.2,
  rpm_rated: 1500, fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
  emissions_standard: 'U.S. EPA Tier 2', origin: null,
}

const records = [
  // ── G3: 50Hz only (HPI, spec sheet confirmed) ─────────────────────────────
  {
    ...BASE, model: 'QSK60-G3', slug: 'cummins-qsk60-g3',
    prime_power_kw_50hz:    1615,  standby_power_kw_50hz:  1790,
    prime_power_kwe_50hz:   1500,  prime_power_kva_50hz:   1875,
    standby_power_kwe_50hz: 1600,  standby_power_kva_50hz: 2000,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },

  // ── G4: 50Hz only, Fuel Optimized (HPI, spec sheet confirmed) ────────────
  {
    ...BASE, model: 'QSK60-G4', slug: 'cummins-qsk60-g4',
    prime_power_kw_50hz:    1730,  standby_power_kw_50hz:  1915,
    prime_power_kwe_50hz:   1636,  prime_power_kva_50hz:   2045,
    standby_power_kwe_50hz: 1800,  standby_power_kva_50hz: 2250,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },

  // ── G6: 60Hz only (MCRS, spec sheet confirmed) ────────────────────────────
  {
    ...BASE, model: 'QSK60-G6', slug: 'cummins-qsk60-g6',
    prime_power_kw_50hz:    null,  standby_power_kw_50hz:  null,
    prime_power_kwe_50hz:   null,  prime_power_kva_50hz:   null,
    standby_power_kwe_50hz: null,  standby_power_kva_50hz: null,
    prime_power_kw_60hz:    1975,  standby_power_kw_60hz:  2180,
    prime_power_kwe_60hz:   1847,  prime_power_kva_60hz:   2308,
    standby_power_kwe_60hz: 2023,  standby_power_kva_60hz: 2528,
  },

  // ── G7: 50Hz + 60Hz, Fuel Optimized (HPI, spec sheet confirmed) ──────────
  {
    ...BASE, model: 'QSK60-G7', slug: 'cummins-qsk60-g7',
    prime_power_kw_50hz:    1615,  standby_power_kw_50hz:  1790,
    prime_power_kwe_50hz:   1517,  prime_power_kva_50hz:   1825,
    standby_power_kwe_50hz: 1825,  standby_power_kva_50hz: 2000,
    prime_power_kw_60hz:    1975,  standby_power_kw_60hz:  2180,
    prime_power_kwe_60hz:   1825,  prime_power_kva_60hz:   2281,
    standby_power_kwe_60hz: 2000,  standby_power_kva_60hz: 2500,
  },

  // ── G8: 50Hz only (MCRS, genset spec — prime kWm not in spec sheet) ───────
  {
    ...BASE, model: 'QSK60-G8', slug: 'cummins-qsk60-g8',
    prime_power_kw_50hz:    null,  standby_power_kw_50hz:  2145,
    prime_power_kwe_50hz:   1800,  prime_power_kva_50hz:   2250,
    standby_power_kwe_50hz: 2000,  standby_power_kva_50hz: 2500,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },

  // ── G10: 50Hz + 60Hz (MCRS, spec sheet confirmed) ─────────────────────────
  {
    ...BASE, model: 'QSK60-G10', slug: 'cummins-qsk60-g10',
    prime_power_kw_50hz:    1470,  standby_power_kw_50hz:  1630,
    prime_power_kwe_50hz:   1360,  prime_power_kva_50hz:   1700,
    standby_power_kwe_50hz: 1500,  standby_power_kva_50hz: 1875,
    prime_power_kw_60hz:    1830,  standby_power_kw_60hz:  2032,
    prime_power_kwe_60hz:   1700,  prime_power_kva_60hz:   2125,
    standby_power_kwe_60hz: 1875,  standby_power_kva_60hz: 2344,
  },

  // ── G11: 50Hz only (MCRS, spec sheet confirmed) ───────────────────────────
  {
    ...BASE, model: 'QSK60-G11', slug: 'cummins-qsk60-g11',
    prime_power_kw_50hz:    1870,  standby_power_kw_50hz:  1955,
    prime_power_kwe_50hz:   1602,  prime_power_kva_50hz:   2002,
    standby_power_kwe_50hz: 1803,  standby_power_kva_50hz: 2254,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },

  // ── G12: 50Hz + 60Hz, Fuel Optimized (MCRS, spec sheet confirmed) ─────────
  {
    ...BASE, model: 'QSK60-G12', slug: 'cummins-qsk60-g12',
    prime_power_kw_50hz:    1575,  standby_power_kw_50hz:  1740,
    prime_power_kwe_50hz:   1460,  prime_power_kva_50hz:   1825,
    standby_power_kwe_50hz: 1600,  standby_power_kva_50hz: 2000,
    prime_power_kw_60hz:    1975,  standby_power_kw_60hz:  2180,
    prime_power_kwe_60hz:   1825,  prime_power_kva_60hz:   2281,
    standby_power_kwe_60hz: 2000,  standby_power_kva_60hz: 2500,
  },

  // ── G13: 50Hz only, Fuel Optimized (MCRS, spec sheet confirmed) ───────────
  {
    ...BASE, model: 'QSK60-G13', slug: 'cummins-qsk60-g13',
    prime_power_kw_50hz:    2077,  standby_power_kw_50hz:  2164,
    prime_power_kwe_50hz:   1603,  prime_power_kva_50hz:   2004,
    standby_power_kwe_50hz: 2004,  standby_power_kva_50hz: 2505,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },

  // ── G21: 50Hz only (MCRS, Cummins ONAN UK genset spec confirmed) ──────────
  {
    ...BASE, model: 'QSK60-G21', slug: 'cummins-qsk60-g21',
    prime_power_kw_50hz:    1936,  standby_power_kw_50hz:  2164,
    prime_power_kwe_50hz:   1800,  prime_power_kva_50hz:   2250,
    standby_power_kwe_50hz: 2000,  standby_power_kva_50hz: 2500,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },

  // ── G23: 50Hz only (MCRS, Cummins ONAN UK genset spec confirmed) ──────────
  {
    ...BASE, model: 'QSK60-G23', slug: 'cummins-qsk60-g23',
    prime_power_kw_50hz:    2157,  standby_power_kw_50hz:  2388,
    prime_power_kwe_50hz:   2000,  prime_power_kva_50hz:   2500,
    standby_power_kwe_50hz: 2200,  standby_power_kva_50hz: 2750,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },
]

console.log(`Upserting ${records.length} QSK60 engine records...`)
const { error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' })
if (error) { console.error('Upsert failed:', error.message); process.exit(1) }

console.log('Done:')
records.forEach(r => {
  const hz50 = r.standby_power_kva_50hz
    ? `50Hz: ${r.standby_power_kwe_50hz}kWe/${r.standby_power_kva_50hz}kVA standby`
    : r.standby_power_kw_50hz ? `50Hz: ${r.standby_power_kw_50hz}kWm standby` : '50Hz: —'
  const hz60 = r.standby_power_kva_60hz
    ? `60Hz: ${r.standby_power_kwe_60hz}kWe/${r.standby_power_kva_60hz}kVA standby`
    : r.standby_power_kw_60hz ? `60Hz: ${r.standby_power_kw_60hz}kWm standby` : '60Hz: —'
  console.log(`  ${r.model} | ${hz50} | ${hz60}`)
})
