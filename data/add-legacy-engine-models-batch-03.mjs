import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const APPLY = process.argv.includes('--apply')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const hpToKw = (hp) => round1(hp * 0.7457)
const cuInToL = (cuIn) => round1(cuIn * 0.0163871)

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function legacy(row) {
  const fuelType = row.fuel_type ?? 'Diesel'
  return clean({
    slug: row.slug ?? `${slugify(row.brand)}-${slugify(row.model)}`,
    brand: row.brand,
    model: row.model,
    series: row.series,
    status: 'discontinued',
    year_introduced: row.year_introduced,
    year_discontinued: row.year_discontinued,
    origin: row.origin,
    fuel_type: fuelType,
    ignition_type: /gas|propane|lpg/i.test(fuelType) ? 'Spark Ignition' : 'Compression Ignition',
    cooling_method: row.cooling_method ?? 'Liquid-Cooled',
    emissions_standard: row.emissions_standard ?? 'Unregulated',
    power_kw: row.power_kw,
    power_hp: row.power_hp,
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    compression_ratio: row.compression_ratio,
    weight_kg: row.weight_kg,
    length_mm: row.length_mm,
    width_mm: row.width_mm,
    height_mm: row.height_mm,
    description: row.description ?? `${row.brand} ${row.model} discontinued legacy engine. ${row.use}`,
  })
}

const ford = (model, series, cylinders, displacement_l, configuration, extras = {}) => legacy({
  brand: 'Ford',
  model,
  series,
  origin: 'United Kingdom',
  cylinders,
  displacement_l,
  configuration,
  cooling_method: 'Liquid-Cooled',
  use: 'Source-validated Ford Dorset/Dover industrial and marine diesel with continuing owner demand for manuals, rebuild parts, marinized engines, and repower equivalents.',
  ...extras,
})

const international = (model, series, cylinders, displacementCuIn, configuration, extras = {}) => legacy({
  brand: 'International',
  model,
  series,
  origin: 'United States',
  cylinders,
  displacement_l: cuInToL(displacementCuIn),
  configuration,
  cooling_method: 'Liquid-Cooled',
  use: 'Source-validated International Harvester legacy diesel from Case IH parts catalogs and engine service references, retained for tractor, power-unit, and parts-search demand.',
  ...extras,
})

const hino = (model, series, cylinders, displacement_l, configuration, extras = {}) => legacy({
  brand: 'Hino',
  model,
  series,
  origin: 'Japan',
  cylinders,
  displacement_l,
  configuration,
  cooling_method: 'Liquid-Cooled',
  use: 'Source-validated Hino legacy diesel model used in older trucks, buses, construction equipment, generators, power units, and marine conversions.',
  ...extras,
})

const komatsu = (model, series, cylinders, displacement_l, configuration, extras = {}) => legacy({
  brand: 'Komatsu',
  model,
  series,
  origin: 'Japan',
  cylinders,
  displacement_l,
  configuration,
  cooling_method: 'Liquid-Cooled',
  use: 'Source-validated Komatsu 95 Series legacy diesel engine from workshop-manual model coverage, useful for construction equipment, generator, and rebuild searches.',
  ...extras,
})

const FORD = [
  ford('2701E', '2700 Dorset Series', 4, 3.964, 'L4, naturally aspirated industrial diesel'),
  ford('2703E', '2700 Dorset Series', 6, 5.416, 'L6, naturally aspirated industrial diesel'),
  ford('2704E', '2700 Dorset Series', 6, 5.945, 'L6, naturally aspirated industrial diesel'),
  ford('2701C', '2700 Dorset Series', 4, 4.15, 'L4, naturally aspirated industrial diesel'),
  ford('2711E', '2700 Dorset Series', 4, 4.15, 'L4, naturally aspirated industrial diesel', { year_introduced: 1964, year_discontinued: 1984 }),
  ford('2712E', '2700 Dorset Series', 4, 4.15, 'L4, naturally aspirated marine/industrial diesel', { year_introduced: 1968, year_discontinued: 1982, power_kw: hpToKw(80), power_hp: 80 }),
  ford('2713E', '2700 Dorset Series', 6, 5.95, 'L6, naturally aspirated industrial diesel', { year_introduced: 1964, year_discontinued: 1984 }),
  ford('2714E', '2700 Dorset Series', 6, 6.22, 'L6, naturally aspirated industrial diesel', { year_introduced: 1964, year_discontinued: 1984 }),
  ford('2723', '2720 Dover Series', 6, 5.95, 'L6, naturally aspirated industrial or marine diesel', { year_introduced: 1982, year_discontinued: 1994 }),
  ford('2725', '2720 Dover Series', 6, 6.22, 'L6, naturally aspirated marine/industrial diesel', { year_introduced: 1982, year_discontinued: 2010, power_kw: hpToKw(135), power_hp: 135 }),
  ford('2726T', '2720 Dover Series', 6, 5.95, 'L6, turbocharged industrial or marine diesel', { year_introduced: 1982, year_discontinued: 2010, power_kw: hpToKw(160), power_hp: 160 }),
  ford('2728T', '2720 Dover Series', 6, 5.95, 'L6, turbocharged and intercooled industrial or marine diesel', { year_introduced: 1982, year_discontinued: 2010, power_kw: hpToKw(230), power_hp: 230 }),
]

const INTERNATIONAL = [
  international('D-236', 'IH 6-Cylinder Diesel', 6, 236, 'L6, naturally aspirated diesel', { year_introduced: 1958, year_discontinued: 1978 }),
  international('D-282', 'IH 6-Cylinder Diesel', 6, 282, 'L6, naturally aspirated diesel', { year_introduced: 1958, year_discontinued: 1973 }),
  international('D-301', 'IH 6-Cylinder Diesel', 6, 301, 'L6, naturally aspirated diesel', { year_introduced: 1962, year_discontinued: 1980 }),
  international('D-310', 'IH 6-Cylinder Diesel', 6, 310, 'L6, naturally aspirated diesel', { year_introduced: 1971, year_discontinued: 1989, power_kw: hpToKw(90), power_hp: 90 }),
  international('D-312', 'IH 400 Series Diesel', 6, 312, 'L6, naturally aspirated diesel', { year_introduced: 1972, year_discontinued: 1980 }),
  international('D-358', 'IH 6-Cylinder Diesel', 6, 358, 'L6, naturally aspirated diesel', { year_introduced: 1969, year_discontinued: 1988, power_kw: hpToKw(100), power_hp: 100 }),
  international('D-360', 'IH 400 Series Diesel', 6, 360, 'L6, naturally aspirated diesel', { year_introduced: 1971, year_discontinued: 1981 }),
  international('D-361', 'IH 361/407 Series', 6, 361, 'L6, naturally aspirated diesel', { year_introduced: 1963, year_discontinued: 1976 }),
  international('D-407', 'IH 361/407 Series', 6, 407, 'L6, naturally aspirated diesel', { year_introduced: 1967, year_discontinued: 1971 }),
  international('D-414', 'IH 400 Series Diesel', 6, 414, 'L6, naturally aspirated diesel', { year_introduced: 1968, year_discontinued: 1981 }),
  international('D-436', 'IH 400 Series Diesel', 6, 436, 'L6, naturally aspirated diesel', { year_introduced: 1972, year_discontinued: 1989 }),
  international('D-466', 'IH 400 Series Diesel', 6, 466, 'L6, naturally aspirated diesel', { year_introduced: 1981, year_discontinued: 1989 }),
  international('DT-239', 'IH Turbo Diesel', 4, 239, 'L4, turbocharged diesel', { year_introduced: 1971, year_discontinued: 1973, power_kw: hpToKw(85), power_hp: 85 }),
  international('DT-358', 'IH Turbo Diesel', 6, 358, 'L6, turbocharged diesel', { year_introduced: 1979, year_discontinued: 1985 }),
  international('DT-361', 'IH Turbo Diesel', 6, 361, 'L6, turbocharged diesel', { year_introduced: 1965, year_discontinued: 1985 }),
  international('DT-402', 'IH Turbo Diesel', 6, 402, 'L6, turbocharged diesel', { year_introduced: 1985, year_discontinued: 1996 }),
  international('DT-407', 'IH Turbo Diesel', 6, 407, 'L6, turbocharged diesel', { year_introduced: 1967, year_discontinued: 1971 }),
  international('DT-414', 'IH Turbo Diesel', 6, 414, 'L6, turbocharged diesel', { year_introduced: 1969, year_discontinued: 1981 }),
  international('DT-429', 'IH Turbo Diesel', 6, 429, 'L6, turbocharged diesel', { year_introduced: 1966, year_discontinued: 1970 }),
  international('DT-436', 'IH Turbo Diesel', 6, 436, 'L6, turbocharged diesel', { year_introduced: 1971, year_discontinued: 1989, power_kw: hpToKw(145), power_hp: 145, rpm_rated: 2600 }),
  international('DT-466B', 'IH Turbo Diesel', 6, 466, 'L6, turbocharged diesel', { year_introduced: 1978, year_discontinued: 1989 }),
  international('DTI-466', 'IH Turbo Diesel', 6, 466, 'L6, turbocharged and intercooled diesel', { year_introduced: 1976, year_discontinued: 1987 }),
  international('DTI-466B', 'IH Turbo Diesel', 6, 466, 'L6, turbocharged and intercooled diesel', { year_introduced: 1976, year_discontinued: 1987 }),
  international('DTI-466C', 'IH Turbo Diesel', 6, 466, 'L6, turbocharged and intercooled diesel', { year_introduced: 1981, year_discontinued: 1987 }),
]

const HINO = [
  hino('H06CT', 'H06 Series', 6, 6.485, 'L6, turbocharged diesel'),
  hino('H07CT', 'H07 Series', 6, 6.728, 'L6, turbocharged diesel'),
  hino('H07DT', 'H07 Series', 6, 6.728, 'L6, turbocharged diesel'),
  hino('W04C', 'W04 Series', 4, 3.84, 'L4, naturally aspirated diesel'),
  hino('W04C-T', 'W04 Series', 4, 3.84, 'L4, turbocharged diesel'),
  hino('W04C-TI', 'W04 Series', 4, 3.84, 'L4, turbocharged and intercooled diesel'),
  hino('W04D-J', 'W04 Series', 4, 3.84, 'L4, naturally aspirated diesel'),
  hino('W06D', 'W06 Series', 6, 5.78, 'L6, naturally aspirated diesel'),
  hino('W06D-TI', 'W06 Series', 6, 5.78, 'L6, turbocharged and intercooled diesel'),
  hino('J05C', 'J Series', 4, 5.307, 'L4, common-rail diesel', { power_kw: 129, power_hp: 175, rpm_rated: 2900 }),
  hino('J08C', 'J Series', 6, 7.961, 'L6, common-rail diesel', { power_kw: 151, power_hp: 205, rpm_rated: 2900, compression_ratio: '19.2:1' }),
]

const KOMATSU = [
  komatsu('3D95S-W-1', '95 Series', 3, 2.44, 'L3, naturally aspirated diesel'),
  komatsu('4D95L-1', '95 Series', 4, 3.26, 'L4, naturally aspirated diesel'),
  komatsu('4D95S-W-1', '95 Series', 4, 3.26, 'L4, naturally aspirated diesel'),
  komatsu('6D95L-1', '95 Series', 6, 4.89, 'L6, naturally aspirated diesel'),
  komatsu('SA6D95L-1', '95 Series', 6, 4.89, 'L6, turbocharged diesel'),
  komatsu('SAA6D95LE-1', '95 Series', 6, 4.89, 'L6, turbocharged aftercooled diesel'),
]

const candidates = [
  ...FORD,
  ...INTERNATIONAL,
  ...HINO,
  ...KOMATSU,
]

const candidateSlugCounts = new Map()
for (const record of candidates) {
  candidateSlugCounts.set(record.slug, (candidateSlugCounts.get(record.slug) ?? 0) + 1)
}
const duplicateCandidateSlugs = [...candidateSlugCounts].filter(([, count]) => count > 1)
if (duplicateCandidateSlugs.length) {
  console.error(`Duplicate slugs in candidate batch: ${duplicateCandidateSlugs.map(([slug]) => slug).join(', ')}`)
  process.exit(1)
}

const candidateSlugs = candidates.map((record) => record.slug)
const existingSlugs = new Set()
for (let i = 0; i < candidateSlugs.length; i += 500) {
  const chunk = candidateSlugs.slice(i, i + 500)
  const { data, error } = await supabase
    .from('engines')
    .select('slug')
    .in('slug', chunk)
  if (error) throw error
  for (const row of data ?? []) existingSlugs.add(row.slug)
}

const missing = candidates.filter((record) => !existingSlugs.has(record.slug))
console.log(`Candidate rows: ${candidates.length}`)
console.log(`Already present: ${candidates.length - missing.length}`)
console.log(`Missing/new: ${missing.length}`)

if (!APPLY) {
  console.log('Dry run only. Re-run with --apply to insert missing rows.')
  for (const row of missing) console.log(`${row.brand}\t${row.model}\t${row.slug}`)
  process.exit(0)
}

if (!missing.length) {
  console.log('No new legacy engine rows to insert.')
  process.exit(0)
}

const { data, error } = await supabase
  .from('engines')
  .upsert(missing, { onConflict: 'slug' })
  .select('id, brand, model, slug')
if (error) throw error

const { count: afterCount, error: afterCountError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (afterCountError) throw afterCountError

console.log(`Imported ${data.length} validated legacy engine records.`)
console.log(`Engine count is now ${afterCount}.`)
for (const row of data) {
  console.log(`${row.brand}\t${row.model}\t${row.slug}`)
}
