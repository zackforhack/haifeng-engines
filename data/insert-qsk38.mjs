// Inserts 8 Cummins QSK38 series generator drive engine records into Supabase
// All specs confirmed from official Cummins spec sheets (machinery.fi + baifapower FADONGJI)
//
// G1–G5: EPA Tier 2, UK-manufactured (Daventry), machinery.fi PDFs (02/23 revision)
// G7:    EPA Tier 2, 50Hz only, engine-only data (no kWe/kVA in spec sheet)
// G13:   China Nonroad Stage III, 50Hz only, Cummins YZ fuel system, origin=China
// G14:   China Nonroad Stage III, 50Hz only, Cummins YZ fuel system, origin=China

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const BASE = {
  brand: 'Cummins', series: 'QSK38 Series', status: 'active',
  cylinders: 12, configuration: 'V12', displacement_l: 37.7,
  rpm_rated: 1500, fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
}

const records = [
  // ── G1: 50Hz only (spec sheet confirmed, EPA Tier 2) ──────────────────────
  {
    ...BASE, model: 'QSK38-G1', slug: 'cummins-qsk38-g1',
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz:    876,   standby_power_kw_50hz:  970,
    prime_power_kwe_50hz:   800,   prime_power_kva_50hz:   1000,
    standby_power_kwe_50hz: 880,   standby_power_kva_50hz: 1101,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },

  // ── G2: 50Hz only (spec sheet confirmed, EPA Tier 2) ──────────────────────
  {
    ...BASE, model: 'QSK38-G2', slug: 'cummins-qsk38-g2',
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz:    989,   standby_power_kw_50hz:  1096,
    prime_power_kwe_50hz:   908,   prime_power_kva_50hz:   1135,
    standby_power_kwe_50hz: 1000,  standby_power_kva_50hz: 1250,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },

  // ── G3: 50Hz only (spec sheet confirmed, EPA Tier 2) ──────────────────────
  {
    ...BASE, model: 'QSK38-G3', slug: 'cummins-qsk38-g3',
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz:    1107,  standby_power_kw_50hz:  1223,
    prime_power_kwe_50hz:   1021,  prime_power_kva_50hz:   1276,
    standby_power_kwe_50hz: 1120,  standby_power_kva_50hz: 1400,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },

  // ── G4: 60Hz only (spec sheet confirmed, EPA Tier 2) ──────────────────────
  {
    ...BASE, model: 'QSK38-G4', slug: 'cummins-qsk38-g4',
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz:    null,  standby_power_kw_50hz:  null,
    prime_power_kwe_50hz:   null,  prime_power_kva_50hz:   null,
    standby_power_kwe_50hz: null,  standby_power_kva_50hz: null,
    prime_power_kw_60hz:    1231,  standby_power_kw_60hz:  1376,
    prime_power_kwe_60hz:   1126,  prime_power_kva_60hz:   1408,
    standby_power_kwe_60hz: 1251,  standby_power_kva_60hz: 1563,
  },

  // ── G5: both 50Hz + 60Hz (spec sheet confirmed, EPA Tier 2) ───────────────
  {
    ...BASE, model: 'QSK38-G5', slug: 'cummins-qsk38-g5',
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz:    1107,  standby_power_kw_50hz:  1224,
    prime_power_kwe_50hz:   1020,  prime_power_kva_50hz:   1276,
    standby_power_kwe_50hz: 1121,  standby_power_kva_50hz: 1401,
    prime_power_kw_60hz:    1063,  standby_power_kw_60hz:  1279,
    prime_power_kwe_60hz:   969,   prime_power_kva_60hz:   1211,
    standby_power_kwe_60hz: 1162,  standby_power_kva_60hz: 1452,
  },

  // ── G7: 50Hz only, engine kWm data only (no kWe/kVA in spec sheet) ────────
  {
    ...BASE, model: 'QSK38-G7', slug: 'cummins-qsk38-g7',
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz:    705,   standby_power_kw_50hz:  783,
    prime_power_kwe_50hz:   null,  prime_power_kva_50hz:   null,
    standby_power_kwe_50hz: null,  standby_power_kva_50hz: null,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },

  // ── G13: 50Hz only, China CS III, Cummins YZ fuel system ─────────────────
  {
    ...BASE, model: 'QSK38-G13', slug: 'cummins-qsk38-g13',
    displacement_l: 37.8,
    emissions_standard: 'China Nonroad Stage III', origin: 'China',
    prime_power_kw_50hz:    1239,  standby_power_kw_50hz:  1371,
    prime_power_kwe_50hz:   null,  prime_power_kva_50hz:   null,
    standby_power_kwe_50hz: null,  standby_power_kva_50hz: null,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },

  // ── G14: 50Hz only, China CS III, Cummins YZ fuel system ─────────────────
  {
    ...BASE, model: 'QSK38-G14', slug: 'cummins-qsk38-g14',
    displacement_l: 37.8,
    emissions_standard: 'China Nonroad Stage III', origin: 'China',
    prime_power_kw_50hz:    1346,  standby_power_kw_50hz:  1489,
    prime_power_kwe_50hz:   null,  prime_power_kva_50hz:   null,
    standby_power_kwe_50hz: null,  standby_power_kva_50hz: null,
    prime_power_kw_60hz:    null,  standby_power_kw_60hz:  null,
    prime_power_kwe_60hz:   null,  prime_power_kva_60hz:   null,
    standby_power_kwe_60hz: null,  standby_power_kva_60hz: null,
  },
]

console.log(`Upserting ${records.length} QSK38 engine records...`)
const { error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' })
if (error) { console.error('Upsert failed:', error.message); process.exit(1) }

console.log('Done:')
records.forEach(r => {
  const hz50 = r.standby_power_kwa_50hz
    ? `50Hz: ${r.standby_power_kwe_50hz}kWe/${r.standby_power_kva_50hz}kVA standby`
    : r.standby_power_kw_50hz
    ? `50Hz: ${r.standby_power_kw_50hz}kWm standby`
    : '50Hz: —'
  const hz60 = r.standby_power_kva_60hz
    ? `60Hz: ${r.standby_power_kwe_60hz}kWe/${r.standby_power_kva_60hz}kVA standby`
    : r.standby_power_kw_60hz
    ? `60Hz: ${r.standby_power_kw_60hz}kWm standby`
    : '60Hz: —'
  console.log(`  ${r.model} | ${hz50} | ${hz60}`)
})
