import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Hino and Komatsu — two major Japanese diesel makers used by Denyo (and other
// Japanese genset builders) but missing from the DB. New brands.
//
// Displacement & cylinder counts are confirmed (LECTURA / engine refs).
// Genset POWER ratings are REPRESENTATIVE (scaled from displacement and known
// applications; Komatsu SAA6D140 anchored to the SAA6D140-P580 = 504 kWm prime).
// Electrical ekW; kVA = ekW/0.8, kWm = ekW/0.9. 60Hz estimated (~1.2x).

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const kva = (k) => (k == null ? null : r1(k / 0.8))
const kwm = (k) => (k == null ? null : r1(k / 0.9))

// [brand, model, series, disp_l, cyls, config, standby50_kwe]
const rows = [
  // ── Hino ─────────────────────────────────────────────────────────────────
  ['Hino', 'W04D', 'W Series', 4.0,  4, 'In-line 4, Turbocharged',            32],
  ['Hino', 'J05E', 'J Series', 5.1,  4, 'In-line 4, Turbocharged Intercooled', 44],
  ['Hino', 'W06E', 'W Series', 6.0,  6, 'In-line 6, Turbocharged',            60],
  ['Hino', 'J08E', 'J Series', 7.7,  6, 'In-line 6, Turbocharged Intercooled', 104],
  ['Hino', 'P11C', 'P Series', 10.5, 6, 'In-line 6, Turbocharged Intercooled', 200],
  // ── Komatsu ──────────────────────────────────────────────────────────────
  ['Komatsu', 'SAA4D95LE', '95 Series',  3.26, 4, 'In-line 4, Turbocharged Aftercooled',  35],
  ['Komatsu', 'SAA6D107E', '107 Series', 6.69, 6, 'In-line 6, Turbocharged Aftercooled', 120],
  ['Komatsu', 'SAA6D114E', '114 Series', 8.27, 6, 'In-line 6, Turbocharged Aftercooled', 200],
  ['Komatsu', 'SAA6D125E', '125 Series', 11.04, 6, 'In-line 6, Turbocharged Aftercooled', 320],
  ['Komatsu', 'SAA6D140E', '140 Series', 15.24, 6, 'In-line 6, Turbocharged Aftercooled', 504],
]

const records = rows.map(([brand, model, series, displacement_l, cylinders, configuration, s50]) => {
  const p50 = r1(s50 * 0.9)
  const s60 = r1(s50 * 1.2)
  const p60 = r1(s60 * 0.9)
  return {
    slug:                    `${brand.toLowerCase()}-${model.toLowerCase()}`,
    brand,
    model,
    series,
    status:                  'active',
    fuel_type:               'Diesel',
    origin:                  'Japan',
    emissions_standard:      'Unregulated',
    displacement_l,
    cylinders,
    configuration,
    rpm_rated:               1500,
    prime_power_kwe_50hz:    p50, prime_power_kva_50hz:   kva(p50), prime_power_kw_50hz:   kwm(p50),
    standby_power_kwe_50hz:  s50, standby_power_kva_50hz: kva(s50), standby_power_kw_50hz: kwm(s50),
    prime_power_kwe_60hz:    p60, prime_power_kva_60hz:   kva(p60), prime_power_kw_60hz:   kwm(p60),
    standby_power_kwe_60hz:  s60, standby_power_kva_60hz: kva(s60), standby_power_kw_60hz: kwm(s60),
    description: `${brand} ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ~${s50} kWe standby at 50Hz (representative rating). ${brand === 'Komatsu' ? 'Air-to-air aftercooled.' : ''} Unregulated.`,
  }
})

console.log(`Inserting ${records.length} Hino/Komatsu engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, brand, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.brand} ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
