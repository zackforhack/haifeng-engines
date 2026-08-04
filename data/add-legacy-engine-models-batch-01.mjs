import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const ekwFromKwm = (kwm) => (kwm == null ? null : round1(kwm * 0.9))
const kvaFromKwe = (kwe) => (kwe == null ? null : round1(kwe / 0.8))

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function withElectricalFromMechanical(record) {
  const next = { ...record }
  for (const hz of ['50hz', '60hz']) {
    const primeKw = next[`prime_power_kw_${hz}`]
    const standbyKw = next[`standby_power_kw_${hz}`]
    if (primeKw != null && next[`prime_power_kwe_${hz}`] == null) {
      next[`prime_power_kwe_${hz}`] = ekwFromKwm(primeKw)
    }
    if (standbyKw != null && next[`standby_power_kwe_${hz}`] == null) {
      next[`standby_power_kwe_${hz}`] = ekwFromKwm(standbyKw)
    }
    if (next[`prime_power_kwe_${hz}`] != null && next[`prime_power_kva_${hz}`] == null) {
      next[`prime_power_kva_${hz}`] = kvaFromKwe(next[`prime_power_kwe_${hz}`])
    }
    if (next[`standby_power_kwe_${hz}`] != null && next[`standby_power_kva_${hz}`] == null) {
      next[`standby_power_kva_${hz}`] = kvaFromKwe(next[`standby_power_kwe_${hz}`])
    }
  }
  return next
}

function base(row) {
  const slug = row.slug ?? `${slugify(row.brand)}-${slugify(row.model)}`
  const record = {
    slug,
    brand: row.brand,
    model: row.model,
    series: row.series,
    status: row.status ?? 'discontinued',
    origin: row.origin,
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: row.cooling_method,
    emissions_standard: row.emissions_standard ?? 'Unregulated',
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    compression_ratio: row.compression_ratio,
    weight_kg: row.weight_kg,
    length_mm: row.length_mm,
    width_mm: row.width_mm,
    height_mm: row.height_mm,
    power_kw: row.power_kw,
    prime_power_kw_50hz: row.prime_power_kw_50hz,
    prime_power_kwe_50hz: row.prime_power_kwe_50hz,
    prime_power_kva_50hz: row.prime_power_kva_50hz,
    standby_power_kw_50hz: row.standby_power_kw_50hz,
    standby_power_kwe_50hz: row.standby_power_kwe_50hz,
    standby_power_kva_50hz: row.standby_power_kva_50hz,
    prime_power_kw_60hz: row.prime_power_kw_60hz,
    prime_power_kwe_60hz: row.prime_power_kwe_60hz,
    prime_power_kva_60hz: row.prime_power_kva_60hz,
    standby_power_kw_60hz: row.standby_power_kw_60hz,
    standby_power_kwe_60hz: row.standby_power_kwe_60hz,
    standby_power_kva_60hz: row.standby_power_kva_60hz,
  }

  record.description = row.description ?? [
    `${row.brand} ${row.model} ${row.series ?? 'legacy'} diesel engine.`,
    row.use ?? 'Legacy industrial/generator-drive model added for catalog depth.',
    row.rating_note,
  ].filter(Boolean).join(' ')

  return withElectricalFromMechanical(record)
}

// Source notes:
// - DEUTZ FL 912/913 generator-drive ratings: DEUTZ 912 Gen brochure and FD Power
//   FL912/FL913 generator application sheet, both listing 1500/1800 rpm power.
// - Doosan DB58/D1146/D1146T/P086TI ratings: Doosan P086TI IOM manual plus
//   50 Hz genset sheets from EMSA and Doosan distributors.
// - Mahindra Powerol 6-cylinder ratings: Mahindra/Powerol distributor tables,
//   ISO 8528 prime kVA and 100/110% engine power.
// - Ashok Leyland ALGP ratings: Ashok Leyland industrial G-drive training deck.
// - Mercedes-Benz, Ford, International: legacy industrial/on-highway engines
//   inserted with mechanical power only where generator electrical ratings were
//   not source-backed.

const DEUTZ = [
  ['F2L912', 'FL 912', 1.88, 2, 'L2, naturally aspirated', 14, 16, 17, 19],
  ['F3L912', 'FL 912', 2.828, 3, 'L3, naturally aspirated', 24, 26, 28, 30],
  ['F3L913', 'FL 913', 3.064, 3, 'L3, naturally aspirated', 25, 27, 31, 33],
  ['F4L912', 'FL 912', 3.77, 4, 'L4, naturally aspirated', 32, 35, 38, 42],
  ['F4L912T', 'FL 912', 3.77, 4, 'L4, turbocharged', 41, 45, 48, 52],
  ['F4L913', 'FL 913', 4.086, 4, 'L4, naturally aspirated', 34, 37, 40, 44],
  ['BF4L913', 'FL 913', 4.086, 4, 'L4, turbocharged', 47, 50, 55, 60],
  ['F6L912', 'FL 912', 5.655, 6, 'L6, naturally aspirated', 48, 52, 55, 62],
  ['F6L912T', 'FL 912', 5.655, 6, 'L6, turbocharged', 61, 65, 72, 77],
  ['F6L913', 'FL 913', 6.128, 6, 'L6, naturally aspirated', 51, 54, 64, 68],
  ['BF6L913', 'FL 913', 6.128, 6, 'L6, turbocharged', 65, 69, 78, 82],
  ['BF6L913C', 'FL 913', 6.128, 6, 'L6, turbocharged aftercooled', 84, 90, 105, 115],
].map(([model, series, displacement_l, cylinders, configuration, p50, s50, p60, s60]) => base({
  brand: 'Deutz',
  model,
  series,
  origin: 'Germany',
  status: 'limited',
  displacement_l,
  cylinders,
  configuration,
  rpm_rated: 1500,
  cooling_method: 'Air-Cooled',
  emissions_standard: 'Unregulated',
  prime_power_kw_50hz: p50,
  standby_power_kw_50hz: s50,
  prime_power_kw_60hz: p60,
  standby_power_kw_60hz: s60,
  use: 'Air-cooled legacy generator-drive model for 50/60 Hz sets.',
  rating_note: `Source-backed mechanical ratings include ${p50}/${s50} kWm at 1500 rpm and ${p60}/${s60} kWm at 1800 rpm.`,
}))

const DOOSAN = [
  ['DB58', 5.8, 'L6, naturally aspirated', 'U.S. EPA Tier 1', 52, 57, 48, null, null, null, null, null],
  ['D1146', 8.071, 'L6, naturally aspirated', 'U.S. EPA Tier 1', 77, 85, 68, null, 96, 105, null, null],
  ['D1146T', 8.071, 'L6, turbocharged', 'U.S. EPA Tier 1', 172, 194, 96, null, null, null, null, null],
  ['DP086TA', 8.071, 'L6, turbocharged', 'Unregulated', 132, 147, 124, null, null, null, null, null],
  ['P086TI-1', 8.071, 'L6, turbocharged intercooled', 'Unregulated', 149, 164, null, null, 174, 191, null, null],
  ['P086TI', 8.071, 'L6, turbocharged intercooled', 'Euro Stage II', 177, 199, 160, 176, 205, 223, null, null],
].map(([model, displacement_l, configuration, emissions_standard, p50, s50, pKwe50, sKwe50, p60, s60, pKwe60, sKwe60]) => base({
  brand: 'Doosan',
  model,
  series: model.startsWith('D') ? 'D Series' : 'P Series',
  origin: 'South Korea',
  status: 'discontinued',
  displacement_l,
  cylinders: 6,
  configuration,
  rpm_rated: 1500,
  cooling_method: 'Liquid-Cooled',
  emissions_standard,
  compression_ratio: model === 'P086TI' ? '16.4:1' : undefined,
  prime_power_kw_50hz: p50,
  standby_power_kw_50hz: s50,
  prime_power_kwe_50hz: pKwe50,
  standby_power_kwe_50hz: sKwe50,
  prime_power_kw_60hz: p60,
  standby_power_kw_60hz: s60,
  prime_power_kwe_60hz: pKwe60,
  standby_power_kwe_60hz: sKwe60,
  use: 'Legacy Doosan generator-drive diesel for standby and prime generator sets.',
}))

const MAHINDRA = [
  ['61145 GM', 77, 84, 66, 82.5],
  ['61375 GM', 92, 101, 80, 100],
  ['61695 GM', 113, 124, 100, 125],
].map(([model, p50, s50, pKwe50, pKva50]) => base({
  brand: 'Mahindra',
  model,
  series: 'Powerol GM',
  origin: 'India',
  status: 'limited',
  displacement_l: 5.86,
  cylinders: 6,
  configuration: model === '61145 GM' ? 'L6, turbocharged' : 'L6, turbocharged aftercooled',
  rpm_rated: 1500,
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'India CPCB',
  compression_ratio: '17.01:1',
  prime_power_kw_50hz: p50,
  standby_power_kw_50hz: s50,
  prime_power_kwe_50hz: pKwe50,
  prime_power_kva_50hz: pKva50,
  use: 'Mahindra Powerol 50 Hz generator-drive engine used in older Indian DG sets.',
}))

const ASHOK_LEYLAND = [
  ['ALGP WO4D', 'ALGP', 24, 30, 4, 3.84, 'L4, naturally aspirated'],
  ['ALGP 400', 'ALGP', 50, 62.5, 6, 6.54, 'L6, naturally aspirated'],
  ['ALGP 402', 'ALGP', 50, 62.5, 6, 6.54, 'L6, naturally aspirated'],
].map(([model, series, pKwe50, pKva50, cylinders, displacement_l, configuration]) => base({
  brand: 'Ashok Leyland',
  model,
  series,
  origin: 'India',
  status: 'discontinued',
  displacement_l,
  cylinders,
  configuration,
  rpm_rated: 1500,
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'Unregulated',
  prime_power_kwe_50hz: pKwe50,
  prime_power_kva_50hz: pKva50,
  use: 'Legacy Ashok Leyland industrial G-drive engine for 50 Hz generator sets.',
}))

const MECHANICAL_LEGACY = [
  {
    brand: 'Mercedes-Benz',
    model: 'OM 352',
    series: 'OM 300 Series',
    origin: 'Germany',
    displacement_l: 5.675,
    cylinders: 6,
    configuration: 'L6, naturally aspirated',
    cooling_method: 'Liquid-Cooled',
    compression_ratio: '17:1',
    power_kw: 96,
    rpm_rated: 2800,
    emissions_standard: 'Unregulated',
    use: 'Classic direct-injection diesel used across vehicles, equipment, and stationary installations.',
  },
  {
    brand: 'Mercedes-Benz',
    model: 'OM 366 A',
    series: 'OM 300 Series',
    origin: 'Germany',
    displacement_l: 5.958,
    cylinders: 6,
    configuration: 'L6, turbocharged',
    cooling_method: 'Liquid-Cooled',
    compression_ratio: '16.5:1',
    power_kw: 125,
    rpm_rated: 2600,
    emissions_standard: 'Euro Stage I',
    use: 'Legacy turbocharged medium-duty diesel with broad industrial and vocational use.',
  },
  {
    brand: 'Mercedes-Benz',
    model: 'OM 366 LA',
    series: 'OM 300 Series',
    origin: 'Germany',
    displacement_l: 5.958,
    cylinders: 6,
    configuration: 'L6, turbocharged charge-cooled',
    cooling_method: 'Liquid-Cooled',
    compression_ratio: '16.5:1',
    power_kw: 150,
    rpm_rated: 2600,
    emissions_standard: 'Euro Stage I',
    use: 'Charge-cooled OM 366 variant documented in Daimler press material and common in export equipment.',
  },
  {
    brand: 'Mercedes-Benz',
    model: 'OM 401',
    series: 'OM 400 Series',
    origin: 'Germany',
    displacement_l: 9.572,
    cylinders: 6,
    configuration: 'V6, turbocharged',
    cooling_method: 'Liquid-Cooled',
    compression_ratio: '16.9:1',
    power_kw: 141,
    rpm_rated: 2500,
    emissions_standard: 'Euro Stage II',
    use: 'First-generation OM 400 V-engine for heavy vocational and industrial applications.',
  },
  {
    brand: 'Ford',
    model: '2715E',
    series: 'Dorset 2700 Series',
    origin: 'United Kingdom',
    displacement_l: 5.95,
    cylinders: 6,
    configuration: 'L6, naturally aspirated',
    cooling_method: 'Liquid-Cooled',
    compression_ratio: '16.5:1',
    power_kw: 89,
    rpm_rated: 2500,
    emissions_standard: 'Unregulated',
    use: 'Ford Dorset six-cylinder industrial diesel used in older marine, pump, and generator packages.',
  },
  {
    brand: 'Ford',
    model: '2704ET',
    series: 'Dorset 2700 Series',
    origin: 'United Kingdom',
    displacement_l: 5.95,
    cylinders: 6,
    configuration: 'L6, turbocharged',
    cooling_method: 'Liquid-Cooled',
    compression_ratio: '15.7:1',
    power_kw: 113,
    rpm_rated: 2400,
    emissions_standard: 'Unregulated',
    use: 'Turbocharged Ford Dorset industrial diesel commonly marinized and repowered into stationary duty.',
  },
  {
    brand: 'Ford',
    model: '2722E',
    series: 'Dover Series',
    origin: 'United Kingdom',
    displacement_l: 4.146,
    cylinders: 4,
    configuration: 'L4, naturally aspirated',
    cooling_method: 'Liquid-Cooled',
    power_kw: 62,
    rpm_rated: 2500,
    emissions_standard: 'Unregulated',
    use: 'Ford Dover four-cylinder diesel from the later Dagenham industrial family.',
  },
  {
    brand: 'International',
    model: 'DT360',
    series: 'DT Series',
    origin: 'United States',
    displacement_l: 5.9,
    cylinders: 6,
    configuration: 'L6, turbocharged',
    cooling_method: 'Liquid-Cooled',
    power_kw: 119,
    rpm_rated: 2700,
    emissions_standard: 'U.S. EPA Tier 0',
    use: 'Mechanical-injection wet-sleeve International/Navistar diesel used in trucks, buses, and vocational equipment.',
  },
  {
    brand: 'International',
    model: 'DT466',
    series: 'DT Series',
    origin: 'United States',
    displacement_l: 7.6,
    cylinders: 6,
    configuration: 'L6, turbocharged',
    cooling_method: 'Liquid-Cooled',
    compression_ratio: '16.4:1',
    power_kw: 130,
    rpm_rated: 2300,
    emissions_standard: 'U.S. EPA Tier 0',
    use: 'Wet-sleeve International/Navistar DT family diesel with strong legacy support in vocational service.',
  },
  {
    brand: 'International',
    model: 'DT530',
    series: 'DT Series',
    origin: 'United States',
    displacement_l: 8.7,
    cylinders: 6,
    configuration: 'L6, turbocharged aftercooled',
    cooling_method: 'Liquid-Cooled',
    compression_ratio: '16.9:1',
    power_kw: 224,
    rpm_rated: 2000,
    emissions_standard: 'U.S. EPA Tier 1',
    use: 'Larger International/Navistar DT wet-sleeve diesel for heavy vocational applications.',
  },
].map(base)

const records = [
  ...DEUTZ,
  ...DOOSAN,
  ...MAHINDRA,
  ...ASHOK_LEYLAND,
  ...MECHANICAL_LEGACY,
]

const slugCounts = new Map()
for (const record of records) slugCounts.set(record.slug, (slugCounts.get(record.slug) ?? 0) + 1)
const duplicateSlugs = [...slugCounts].filter(([, count]) => count > 1)
if (duplicateSlugs.length) {
  console.error(`Duplicate slugs in batch: ${duplicateSlugs.map(([slug]) => slug).join(', ')}`)
  process.exit(1)
}

const { data: existing, error: selectError } = await supabase
  .from('engines')
  .select('slug')
  .in('slug', records.map((record) => record.slug))
if (selectError) {
  console.error(selectError.message)
  process.exit(1)
}

const existingSlugs = new Set((existing ?? []).map((row) => row.slug))
const inserts = records.filter((record) => !existingSlugs.has(record.slug)).length
const updates = records.length - inserts

const { data, error } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
  .select('id, brand, model, slug')

if (error) {
  console.error(error.message)
  process.exit(1)
}

console.log(`Upserted ${data.length} legacy engine records (${inserts} inserts, ${updates} updates)`)
for (const row of data.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`))) {
  console.log(`${row.brand}\t${row.model}\t${row.slug}`)
}
