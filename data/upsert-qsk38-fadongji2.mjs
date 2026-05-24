// Upsert QSK38 models from baifapower fadongji2 PDFs
//
// Inserts 6 missing models: G5A, G9, G10, G11, G12, G15
// Fixes incorrect emission_standard/origin on G6, G8, G19
//   (DB had China CS III; official PDFs confirm G6/G8=EPA Tier 2, G19=Non-Certified)
//
// G5A:        CCEC (Chongqing), China CS III, MCRS, 37.7L, 1500rpm
// G6, G8:     CCIE, EPA Tier 2, MCRS, 37.7L, 1500rpm
// G9-G12,G15: CCEC (Chongqing), China CS III, YZ fuel system, 37.8L, 1500rpm
// G19:        CCIE, Non-Certified, MCRS, 37.7L, 1500rpm

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const BASE = {
  brand: 'Cummins', series: 'QSK38 Series', status: 'active',
  cylinders: 12, configuration: 'V12',
  fuel_type: 'Diesel', ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
  rpm_rated: 1500,
  prime_power_kw_60hz: null, standby_power_kw_60hz: null,
  prime_power_kwe_50hz: null, prime_power_kva_50hz: null,
  standby_power_kwe_50hz: null, standby_power_kva_50hz: null,
  prime_power_kwe_60hz: null, prime_power_kva_60hz: null,
  standby_power_kwe_60hz: null, standby_power_kva_60hz: null,
}

const records = [
  // ── G5A: CCEC, China CS III, 37.7L, 1500rpm ──────────────────────────────
  {
    ...BASE, model: 'QSK38-G5A', slug: 'cummins-qsk38-g5a',
    displacement_l: 37.7,
    emissions_standard: 'China Nonroad Stage III', origin: 'China',
    prime_power_kw_50hz: 1212, standby_power_kw_50hz: 1334,
  },

  // ── G6: CCIE, EPA Tier 2, MCRS, 37.7L, 1500rpm (fix: was wrong China CS III in DB)
  {
    ...BASE, model: 'QSK38-G6', slug: 'cummins-qsk38-g6',
    displacement_l: 37.7,
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz: 791, standby_power_kw_50hz: 878,
  },

  // ── G8: CCIE, EPA Tier 2, MCRS, 37.7L, 1500rpm (fix: was wrong China CS III in DB)
  {
    ...BASE, model: 'QSK38-G8', slug: 'cummins-qsk38-g8',
    displacement_l: 37.7,
    emissions_standard: 'U.S. EPA Tier 2', origin: null,
    prime_power_kw_50hz: 657, standby_power_kw_50hz: 730,
  },

  // ── G9: CCEC, China CS III, YZ fuel system, 37.8L, 1500rpm ───────────────
  {
    ...BASE, model: 'QSK38-G9', slug: 'cummins-qsk38-g9',
    displacement_l: 37.8,
    emissions_standard: 'China Nonroad Stage III', origin: 'China',
    prime_power_kw_50hz: 826, standby_power_kw_50hz: 911,
  },

  // ── G10: CCEC, China CS III, YZ fuel system, 37.8L, 1500rpm ──────────────
  {
    ...BASE, model: 'QSK38-G10', slug: 'cummins-qsk38-g10',
    displacement_l: 37.8,
    emissions_standard: 'China Nonroad Stage III', origin: 'China',
    prime_power_kw_50hz: 903, standby_power_kw_50hz: 997,
  },

  // ── G11: CCEC, China CS III, YZ fuel system, 37.8L, 1500rpm ──────────────
  {
    ...BASE, model: 'QSK38-G11', slug: 'cummins-qsk38-g11',
    displacement_l: 37.8,
    emissions_standard: 'China Nonroad Stage III', origin: 'China',
    prime_power_kw_50hz: 1022, standby_power_kw_50hz: 1130,
  },

  // ── G12: CCEC, China CS III, YZ fuel system, 37.8L, 1500rpm ──────────────
  {
    ...BASE, model: 'QSK38-G12', slug: 'cummins-qsk38-g12',
    displacement_l: 37.8,
    emissions_standard: 'China Nonroad Stage III', origin: 'China',
    prime_power_kw_50hz: 1134, standby_power_kw_50hz: 1254,
  },

  // ── G15: CCEC, China CS III, YZ fuel system, 37.8L, 1500rpm ──────────────
  {
    ...BASE, model: 'QSK38-G15', slug: 'cummins-qsk38-g15',
    displacement_l: 37.8,
    emissions_standard: 'China Nonroad Stage III', origin: 'China',
    prime_power_kw_50hz: 1399, standby_power_kw_50hz: 1548,
  },

  // ── G19: CCIE, Non-Certified, MCRS, 37.7L, 1500rpm (fix: was wrong China CS III in DB)
  {
    ...BASE, model: 'QSK38-G19', slug: 'cummins-qsk38-g19',
    displacement_l: 37.7,
    emissions_standard: 'Non-Certified', origin: null,
    prime_power_kw_50hz: 1183, standby_power_kw_50hz: 1333,
  },
]

console.log(`Upserting ${records.length} QSK38 records (6 new + 3 corrections)...`)
const { error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' })
if (error) { console.error('Upsert failed:', error.message); process.exit(1) }

console.log('Done:')
records.forEach(r => {
  console.log(`  ${r.model} | standby ${r.standby_power_kw_50hz}kWm / prime ${r.prime_power_kw_50hz}kWm @1500rpm | ${r.emissions_standard} | origin=${r.origin}`)
})
