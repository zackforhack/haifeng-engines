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
const inchBoreStrokeToL = (cylinders, boreIn, strokeIn) =>
  round1(cuInToL(cylinders * Math.PI * (boreIn / 2) ** 2 * strokeIn))
const mmBoreStrokeToL = (cylinders, boreMm, strokeMm) =>
  round1(cylinders * Math.PI * (boreMm / 2000) ** 2 * (strokeMm / 1000) * 1000)

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

const listerInch = (
  model,
  series,
  cylinders,
  boreIn,
  strokeIn,
  power_hp,
  rpm_rated,
  cooling_method,
  weight_kg,
  year_introduced,
  year_discontinued,
  configuration,
) => legacy({
  brand: 'Lister Petter',
  model,
  series,
  origin: 'United Kingdom',
  displacement_l: inchBoreStrokeToL(cylinders, boreIn, strokeIn),
  cylinders,
  configuration: configuration ?? (cylinders === 1 ? 'Single-cylinder, naturally aspirated diesel' : `L${cylinders}, naturally aspirated diesel`),
  power_kw: hpToKw(power_hp),
  power_hp,
  rpm_rated,
  cooling_method,
  weight_kg,
  year_introduced,
  year_discontinued,
  use: 'Source-validated Lister/Petter discontinued stationary or industrial diesel from published production-date and technical-data tables, valuable for off-grid, pump, genset, marine auxiliary, and restoration searches.',
})

const listerMm = (
  model,
  series,
  cylinders,
  boreMm,
  strokeMm,
  power_hp,
  rpm_rated,
  cooling_method,
  weight_kg,
  year_introduced,
  year_discontinued,
  configuration,
) => legacy({
  brand: 'Lister Petter',
  model,
  series,
  origin: 'United Kingdom',
  displacement_l: mmBoreStrokeToL(cylinders, boreMm, strokeMm),
  cylinders,
  configuration: configuration ?? `L${cylinders}, naturally aspirated diesel`,
  power_kw: hpToKw(power_hp),
  power_hp,
  rpm_rated,
  cooling_method,
  weight_kg,
  year_introduced,
  year_discontinued,
  use: 'Source-validated Lister Petter discontinued industrial diesel from published production-date and technical-data tables, valuable for rebuild, parts, generator, and equipment-owner searches.',
})

const man = (model, series, cylinders, displacement_l, configuration, extras = {}) => legacy({
  brand: 'MAN',
  model,
  series,
  origin: 'Germany',
  cylinders,
  displacement_l,
  configuration,
  cooling_method: 'Liquid-Cooled',
  use: 'Source-validated legacy MAN D-Series industrial, marine, or generator-set diesel from MAN operating instructions and legacy D-Series parts references.',
  ...extras,
})

const wartsila = (model, series, cylinders, displacement_l, configuration, extras = {}) => legacy({
  slug: `wartsila-${slugify(model)}`,
  brand: 'Wärtsilä',
  model,
  series,
  origin: 'Finland',
  cylinders,
  displacement_l,
  configuration,
  cooling_method: 'Liquid-Cooled',
  fuel_type: 'Diesel / HFO',
  use: 'Source-validated ageing Wärtsilä Vasa legacy installation with upgrade and service demand for operators searching exact engine designations.',
  ...extras,
})

const LISTER_PETTER = [
  listerInch('Petter AA1M', 'A Series', 1, 2.75, 2.25, 3, 3000, 'Air-Cooled', 68, 1965, 1968),
  listerInch('Petter AB1W', 'A Series', 1, 3, 2.25, 5.5, 3600, 'Water-Cooled', 46, 1967, 1971),
  listerInch('Petter AC1MGR Marine', 'A Series', 1, 3, 2.625, 6, 3000, 'Air-Cooled', 71, 1970, 1985),
  listerInch('Petter AC2MGR Marine', 'A Series', 2, 3, 2.625, 12, 3000, 'Air-Cooled', 124, 1970, 1985),
  listerInch('Petter AC1W', 'A Series', 1, 3, 2.625, 6.5, 3600, 'Water-Cooled', 85, 1970, 1985),
  listerMm('Lister Petter CR3', 'CR Series', 3, 112, 107, 41.5, 2100, 'Water-Cooled', 405, 1986, 1991),
  listerMm('Lister Petter CRK3', 'CR Series', 3, 112, 107, 48.8, 2100, 'Water-Cooled', 410, 1986, 1999),
  listerInch('Lister Petter CS4', 'CS Series', 4, 4.2, 4.524, 72.4, 2600, 'Water-Cooled', 460, 1986, 1999),
  listerInch('Lister Petter CS6', 'CS Series', 6, 4.2, 4.524, 108.6, 2600, 'Water-Cooled', 590, 1986, 1992),
  listerInch('Lister Petter CST6', 'CS Series', 6, 4.2, 4.524, 132, 2400, 'Water-Cooled', 610, 1986, 1992, 'L6, turbocharged diesel'),
  listerInch('Lister CS 3/1', 'CS Cold Start Series', 1, 3.75, 5.5, 3, 600, 'Water-Cooled', 340, 1933),
  listerInch('Lister CS 5/1', 'CS Cold Start Series', 1, 4.5, 5.5, 5, 600, 'Water-Cooled', 345, 1930),
  listerInch('Lister CS 10/2', 'CS Cold Start Series', 2, 4.5, 5.5, 10, 600, 'Water-Cooled', 510, 1930),
  listerInch('Lister CS 3.5/1', 'CS Cold Start Series', 1, 3.75, 5.5, 3.5, 650, 'Water-Cooled', 340, 1940, 1969),
  listerInch('Lister CS 6/1', 'CS Cold Start Series', 1, 4.5, 5.5, 6, 650, 'Water-Cooled', 345, 1940, 1975),
  listerInch('Lister CS 12/2', 'CS Cold Start Series', 2, 4.5, 5.5, 12, 650, 'Water-Cooled', 510, 1940, 1975),
  listerInch('Lister CS 8/1', 'CS Cold Start Series', 1, 4.5, 5.5, 8, 850, 'Water-Cooled', 352, 1958, 1987),
  listerInch('Lister CS 16/2', 'CS Cold Start Series', 2, 4.5, 5.5, 16, 850, 'Water-Cooled', 505, 1958, 1987),
  listerInch('Lister FR1', 'FR Series', 1, 3.75, 4.5, 9, 1800, 'Water-Cooled', 340, 1954, 1964),
  listerInch('Lister FR2', 'FR Series', 2, 3.75, 4.5, 18, 1800, 'Water-Cooled', 440, 1954, 1964),
  listerInch('Lister FR3', 'FR Series', 3, 3.75, 4.5, 27, 1800, 'Water-Cooled', 499, 1954, 1964),
  listerInch('Lister FR4', 'FR Series', 4, 3.75, 4.5, 36, 1800, 'Water-Cooled', 577, 1954, 1964),
  listerInch('Lister FR6', 'FR Series', 6, 3.75, 4.5, 54, 1800, 'Water-Cooled', 722, 1954, 1964),
]

const MAN = [
  man('D2848 LE201', 'D2848 Industrial Diesel', 8, 14.62, 'V8 90-degree, turbocharged charge-air-cooled diesel', { rpm_rated: 1500, compression_ratio: '15.5:1', weight_kg: 1250 }),
  man('D2848 LE203', 'D2848 Industrial Diesel', 8, 14.62, 'V8 90-degree, turbocharged charge-air-cooled diesel', { rpm_rated: 1800, compression_ratio: '15.5:1', weight_kg: 1250 }),
  man('D2848 LE211', 'D2848 Industrial Diesel', 8, 14.62, 'V8 90-degree, turbocharged charge-air-cooled diesel', { rpm_rated: 1500, compression_ratio: '15.5:1', weight_kg: 1250 }),
  man('D2848 LE213', 'D2848 Industrial Diesel', 8, 14.62, 'V8 90-degree, turbocharged charge-air-cooled diesel', { rpm_rated: 1800, compression_ratio: '15.5:1', weight_kg: 1250 }),
  man('D2840 LE201', 'D2840 Industrial Diesel', 10, 18.27, 'V10 90-degree, turbocharged charge-air-cooled diesel', { rpm_rated: 1500, compression_ratio: '15.5:1', weight_kg: 1480 }),
  man('D2840 LE203', 'D2840 Industrial Diesel', 10, 18.27, 'V10 90-degree, turbocharged charge-air-cooled diesel', { rpm_rated: 1800, compression_ratio: '15.5:1', weight_kg: 1480 }),
  man('D2840 LE211', 'D2840 Industrial Diesel', 10, 18.27, 'V10 90-degree, turbocharged charge-air-cooled diesel', { rpm_rated: 1500, compression_ratio: '15.5:1', weight_kg: 1480 }),
  man('D2840 LE213', 'D2840 Industrial Diesel', 10, 18.27, 'V10 90-degree, turbocharged charge-air-cooled diesel', { rpm_rated: 1800, compression_ratio: '15.5:1', weight_kg: 1480 }),
  man('D2842 LE201', 'D2842 Industrial Diesel', 12, 21.93, 'V12 90-degree, turbocharged charge-air-cooled diesel', { rpm_rated: 1500, compression_ratio: '15.5:1', weight_kg: 1770 }),
  man('D2842 LE203', 'D2842 Industrial Diesel', 12, 21.93, 'V12 90-degree, turbocharged charge-air-cooled diesel', { rpm_rated: 1800, compression_ratio: '15.5:1', weight_kg: 1770 }),
  man('D2842 LE211', 'D2842 Industrial Diesel', 12, 21.93, 'V12 90-degree, turbocharged charge-air-cooled diesel', { rpm_rated: 1500, compression_ratio: '15.5:1', weight_kg: 1770 }),
  man('D2842 LE213', 'D2842 Industrial Diesel', 12, 21.93, 'V12 90-degree, turbocharged charge-air-cooled diesel', { rpm_rated: 1800, compression_ratio: '15.5:1', weight_kg: 1770 }),
  man('D2866', 'D2866 Industrial Diesel', 6, 11.967, 'L6, turbocharged charge-air-cooled diesel', { power_kw: 228, power_hp: 310, rpm_rated: 1800, compression_ratio: '17.0:1', weight_kg: 1180 }),
  man('D2866 LE201', 'D2866 Generator Diesel', 6, 11.967, 'L6, turbocharged charge-air-cooled generator-drive diesel', { rpm_rated: 1500, compression_ratio: '17.0:1' }),
  man('D2866 LE203', 'D2866 Generator Diesel', 6, 11.967, 'L6, turbocharged charge-air-cooled generator-drive diesel', { rpm_rated: 1800, compression_ratio: '17.0:1' }),
  man('D2876 LE201', 'D2876 Generator Diesel', 6, 12.82, 'L6, turbocharged charge-air-cooled generator-drive diesel', { rpm_rated: 1500 }),
  man('D2876 LE202', 'D2876 Generator Diesel', 6, 12.82, 'L6, turbocharged charge-air-cooled generator-drive diesel', { rpm_rated: 1500 }),
  man('D2876 LE203', 'D2876 Generator Diesel', 6, 12.82, 'L6, turbocharged charge-air-cooled generator-drive diesel', { rpm_rated: 1800 }),
]

const WARTSILA = [
  wartsila('Vasa 6R32', 'Vasa 32', 6, 48.3, 'L6 medium-speed diesel', { rpm_rated: 720, year_introduced: 1980 }),
  wartsila('Vasa 12V32', 'Vasa 32', 12, 96.5, 'V12 medium-speed diesel', { rpm_rated: 720, year_introduced: 1980 }),
]

const candidates = [
  ...LISTER_PETTER,
  ...MAN,
  ...WARTSILA,
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
