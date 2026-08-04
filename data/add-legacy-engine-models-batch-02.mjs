import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

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

function legacy(row) {
  const fuelType = row.fuel_type ?? 'Diesel'
  return {
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
    cooling_method: row.cooling_method,
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
  }
}

const PERKINS = [
  {
    model: 'A4.236',
    series: '4.236 Series',
    year_introduced: 1964,
    year_discontinued: 1989,
    displacement_l: 3.86,
    cylinders: 4,
    configuration: 'L4, naturally aspirated',
    power_kw: 60,
    power_hp: 81,
    rpm_rated: 2800,
    compression_ratio: '15.5:1',
    use: 'Perkins 4.236 family workhorse used in tractors, forklifts, generators, construction equipment, and stationary power.',
  },
  {
    model: 'T4.236',
    series: '4.236 Series',
    year_discontinued: 1989,
    displacement_l: 3.86,
    cylinders: 4,
    configuration: 'L4, turbocharged',
    power_kw: 76,
    power_hp: 102,
    rpm_rated: 2600,
    compression_ratio: '15.5:1',
    use: 'Turbocharged 4.236 derivative for higher-output industrial and agricultural applications.',
  },
  {
    model: 'A4.248',
    series: '4.236 Series',
    year_discontinued: 1989,
    displacement_l: 4.06,
    cylinders: 4,
    configuration: 'L4, naturally aspirated',
    power_kw: 62,
    power_hp: 84,
    rpm_rated: 2500,
    compression_ratio: '15.5:1',
    use: 'Larger 4-cylinder Perkins derivative used in Massey Ferguson, Landini, industrial, and agricultural equipment.',
  },
  {
    model: '6.354',
    series: '6.354 Series',
    year_introduced: 1961,
    year_discontinued: 1996,
    displacement_l: 5.8,
    cylinders: 6,
    configuration: 'L6, naturally aspirated',
    power_kw: hpToKw(120),
    power_hp: 120,
    rpm_rated: 2800,
    use: 'Classic six-cylinder Perkins diesel for trucks, tractors, industrial equipment, marine, and generator service.',
  },
  {
    model: 'T6.354',
    series: '6.354 Series',
    year_discontinued: 1996,
    displacement_l: 5.8,
    cylinders: 6,
    configuration: 'L6, turbocharged',
    power_kw: hpToKw(155),
    power_hp: 155,
    rpm_rated: 2600,
    use: 'Turbocharged 6.354 variant widely used in heavy trucks, industrial equipment, and marine repower packages.',
  },
  {
    model: '6.3544',
    series: '6.354 Series',
    year_discontinued: 1996,
    displacement_l: 5.8,
    cylinders: 6,
    configuration: 'L6, naturally aspirated',
    power_kw: 96,
    power_hp: 128,
    rpm_rated: 2800,
    use: 'Late dot-series 6.354 redesign with revised block/head architecture before the 1000 Series took over.',
  },
  {
    model: 'T6.3544',
    series: '6.354 Series',
    year_discontinued: 1996,
    displacement_l: 5.8,
    cylinders: 6,
    configuration: 'L6, turbocharged charge-cooled',
    power_kw: 118.5,
    power_hp: 159,
    rpm_rated: 2600,
    use: 'Turbocharged and charge-cooled late 6.354 family engine used by UK and export vehicle manufacturers.',
  },
  {
    model: '1004-40',
    series: '1000 Series',
    year_introduced: 1985,
    year_discontinued: 2014,
    displacement_l: 3.99,
    cylinders: 4,
    configuration: 'L4, naturally aspirated',
    power_kw: 55,
    power_hp: 74.3,
    rpm_rated: 2200,
    compression_ratio: '17.3:1',
    use: 'Discontinued Perkins 1000 Series four-cylinder industrial engine that superseded earlier 4.236 family applications.',
  },
  {
    model: '1004-40T',
    series: '1000 Series',
    year_introduced: 1985,
    year_discontinued: 2014,
    displacement_l: 4,
    cylinders: 4,
    configuration: 'L4, turbocharged with wastegate',
    power_kw: 71.5,
    power_hp: 95.9,
    rpm_rated: 2200,
    compression_ratio: '17.25:1',
    use: 'Turbocharged 1000 Series industrial engine used in backhoe loaders and compact construction equipment.',
  },
  {
    model: '1004-4T',
    series: '1000 Series',
    year_introduced: 1985,
    year_discontinued: 2014,
    displacement_l: 4,
    cylinders: 4,
    configuration: 'L4, turbocharged',
    power_kw: 83,
    power_hp: 111,
    rpm_rated: 2600,
    compression_ratio: '16:1',
    use: 'High-output 1000 Series turbo diesel for compressors, handlers, forklifts, agriculture, and construction machines.',
  },
  {
    model: '1006-6',
    series: '1000 Series',
    year_introduced: 1985,
    year_discontinued: 2014,
    displacement_l: 5.99,
    cylinders: 6,
    configuration: 'L6, naturally aspirated',
    power_kw: 96.5,
    power_hp: 129.5,
    rpm_rated: 2600,
    compression_ratio: '17.3:1',
    use: 'Six-cylinder 1000 Series diesel used in trucks, buses, forklifts, industrial equipment, and unregulated generator sets.',
  },
  {
    model: '1006-6T',
    series: '1000 Series',
    year_introduced: 1985,
    year_discontinued: 2014,
    displacement_l: 5.99,
    cylinders: 6,
    configuration: 'L6, turbocharged',
    power_kw: 123,
    power_hp: 166.1,
    rpm_rated: 2300,
    compression_ratio: '17.3:1',
    use: 'Turbocharged 1006 six-cylinder legacy engine with strong aftermarket parts and rebuild demand.',
  },
].map((row) => legacy({
  brand: 'Perkins',
  origin: 'United Kingdom',
  cooling_method: 'Liquid-Cooled',
  ...row,
}))

const LISTER_PETTER = [
  ['Lister 9/1 (JP1)', 'JP Series', 1, 87.5, hpToKw(9), 9, 1000, 'Water-Cooled', 1929, 1952],
  ['Lister 21/2 (JP2)', 'JP Series', 2, 175, hpToKw(21), 21, 1200, 'Water-Cooled', 1930, 1952],
  ['Lister 30/3 (JP3)', 'JP Series', 3, 262.5, hpToKw(30), 30, 1200, 'Water-Cooled', 1931, 1952],
  ['Lister 40/4 (JP4)', 'JP Series', 4, 350, hpToKw(40), 40, 1200, 'Water-Cooled', 1931, 1952],
  ['Lister 616 (JP6)', 'JP Series', 6, 525, hpToKw(70), 70, 1200, 'Water-Cooled', 1952, 1971],
  ['Petter AA1', 'A Series', 1, 13.4, hpToKw(3.5), 3.5, 3600, 'Air-Cooled', 1964, 1992],
  ['Petter AB1', 'A Series', 1, 15.9, hpToKw(5), 5, 3600, 'Air-Cooled', 1967, 1986],
  ['Petter AC1', 'A Series', 1, 18.6, hpToKw(6.5), 6.5, 3600, 'Air-Cooled', 1970, 1985],
  ['Petter AC2', 'A Series', 2, 37.1, hpToKw(13), 13, 3600, 'Air-Cooled', 1970, 1987],
  ['Lister Petter TS1', 'TS Series', 1, 38.7, hpToKw(10.5), 10.5, 3000, 'Air-Cooled', 1983, 1999],
  ['Lister Petter TS2', 'TS Series', 2, 77.3, hpToKw(22), 22, 3000, 'Air-Cooled', 1983, 1999],
  ['Lister Petter TS3', 'TS Series', 3, 116, hpToKw(33), 33, 3000, 'Air-Cooled', 1983, 1999],
  ['Lister Petter TX2', 'TX Series', 2, 97.4, hpToKw(29), 29, 2800, 'Air-Cooled', 1987, 2001],
  ['Lister Petter TX3', 'TX Series', 3, 146.1, hpToKw(43.5), 43.5, 2800, 'Air-Cooled', 1987, 2001],
].map(([model, series, cylinders, displacementCuIn, power_kw, power_hp, rpm_rated, cooling_method, year_introduced, year_discontinued]) => legacy({
  brand: 'Lister Petter',
  model,
  series,
  origin: 'United Kingdom',
  displacement_l: cuInToL(displacementCuIn),
  cylinders,
  configuration: cylinders === 1 ? 'Single-cylinder, naturally aspirated' : `L${cylinders}, naturally aspirated`,
  power_kw,
  power_hp,
  rpm_rated,
  cooling_method,
  year_introduced,
  year_discontinued,
  use: 'Small legacy Lister/Petter diesel with continuing owner searches for parts, manuals, and off-grid or marine auxiliary service.',
}))

const JAPANESE_INDUSTRIAL = [
  {
    brand: 'Isuzu',
    model: '6BB1',
    series: 'B Series',
    origin: 'Japan',
    year_introduced: 1972,
    displacement_l: 5.393,
    cylinders: 6,
    configuration: 'L6, naturally aspirated',
    power_kw: 107,
    power_hp: 145,
    rpm_rated: 3200,
    compression_ratio: '17.5:1',
    cooling_method: 'Liquid-Cooled',
    use: 'Early Isuzu direct-injection medium-duty diesel used in Forward trucks and buses.',
  },
  {
    brand: 'Isuzu',
    model: '4BD1',
    series: 'B Series',
    origin: 'Japan',
    displacement_l: 3.856,
    cylinders: 4,
    configuration: 'L4, naturally aspirated',
    power_kw: 70.6,
    power_hp: 96,
    rpm_rated: 2800,
    compression_ratio: '17.5:1',
    cooling_method: 'Liquid-Cooled',
    use: 'Mechanical Isuzu B-series diesel known for trucks, military vehicles, marine conversions, and stationary powerplants.',
  },
  {
    brand: 'Isuzu',
    model: '4BD1T',
    series: 'B Series',
    origin: 'Japan',
    year_introduced: 1986,
    year_discontinued: 1991,
    displacement_l: 3.856,
    cylinders: 4,
    configuration: 'L4, turbocharged',
    power_kw: hpToKw(135),
    power_hp: 135,
    rpm_rated: 3000,
    compression_ratio: '17.5:1',
    cooling_method: 'Liquid-Cooled',
    use: 'Turbocharged 4BD1 derivative used in NPR/W-series trucks and global industrial applications.',
  },
  {
    brand: 'Isuzu',
    model: '6BD1',
    series: 'B Series',
    origin: 'Japan',
    year_introduced: 1976,
    displacement_l: 5.785,
    cylinders: 6,
    configuration: 'L6, naturally aspirated',
    power_kw: hpToKw(142),
    power_hp: 142,
    rpm_rated: 2800,
    compression_ratio: '17.5:1',
    cooling_method: 'Liquid-Cooled',
    use: 'Heavy-duty mechanical Isuzu six-cylinder used in trucks, marine engines, and industrial equipment.',
  },
  {
    brand: 'Hino',
    model: 'H06C',
    series: 'H Series',
    origin: 'Japan',
    displacement_l: 6.485,
    cylinders: 6,
    configuration: 'L6, naturally aspirated / turbocharged variants',
    cooling_method: 'Liquid-Cooled',
    use: 'Older Hino 6.5L diesel family used in trucks, heavy equipment, forklifts, generators, power units, and marine applications.',
  },
  {
    brand: 'Hino',
    model: 'H07C',
    series: 'H Series',
    origin: 'Japan',
    displacement_l: 6.728,
    cylinders: 6,
    configuration: 'L6, naturally aspirated / turbocharged variants',
    cooling_method: 'Liquid-Cooled',
    use: 'Legacy Hino 6.7L diesel family with ongoing rebuild and parts demand in equipment and truck service.',
  },
  {
    brand: 'Hino',
    model: 'H07D',
    series: 'H Series',
    origin: 'Japan',
    displacement_l: 7.412,
    cylinders: 6,
    configuration: 'L6, naturally aspirated / turbocharged variants',
    cooling_method: 'Liquid-Cooled',
    use: 'Larger-displacement Hino H07 family diesel used in older medium and heavy equipment applications.',
  },
  {
    brand: 'Komatsu',
    model: '6D95L-1',
    series: '95 Series',
    origin: 'Japan',
    displacement_l: 4.89,
    cylinders: 6,
    configuration: 'L6, naturally aspirated',
    power_kw: 59.7,
    power_hp: 80,
    rpm_rated: 2500,
    cooling_method: 'Liquid-Cooled',
    use: 'Mechanical Komatsu 95 Series diesel for older dozers, loaders, and compact equipment.',
  },
  {
    brand: 'Komatsu',
    model: 'S6D95L-1',
    series: '95 Series',
    origin: 'Japan',
    displacement_l: 4.89,
    cylinders: 6,
    configuration: 'L6, generator-drive / industrial',
    power_kw: 74,
    power_hp: 99.6,
    rpm_rated: 1800,
    cooling_method: 'Liquid-Cooled',
    use: 'Older Komatsu 95 Series six-cylinder engine with documented 50/60 Hz fixed-speed ratings.',
  },
  {
    brand: 'Komatsu',
    model: 'S6D105-1',
    series: '105 Series',
    origin: 'Japan',
    displacement_l: 6.49,
    cylinders: 6,
    configuration: 'L6, naturally aspirated',
    power_kw: 122,
    power_hp: 164,
    rpm_rated: 2500,
    cooling_method: 'Liquid-Cooled',
    use: 'Legacy Komatsu 105 Series engine used in graders and construction machinery.',
  },
  {
    brand: 'Komatsu',
    model: 'S6D125-1',
    series: '125 Series',
    origin: 'Japan',
    displacement_l: 11.04,
    cylinders: 6,
    configuration: 'L6, naturally aspirated',
    power_kw: hpToKw(219),
    power_hp: 219,
    rpm_rated: 2000,
    cooling_method: 'Liquid-Cooled',
    use: 'Older Komatsu 125 Series mechanical diesel used in dozers and heavy construction equipment.',
  },
].map(legacy)

const WAUKESHA = [
  {
    brand: 'Waukesha',
    model: 'F817G',
    series: 'Legacy Gas',
    origin: 'United States',
    fuel_type: 'Natural Gas',
    displacement_l: 13.31,
    cylinders: 6,
    configuration: 'L6, naturally aspirated gas',
    power_kw: hpToKw(190),
    power_hp: 190,
    rpm_rated: 2000,
    compression_ratio: '9:1',
    cooling_method: 'Liquid-Cooled',
    use: 'Older Waukesha gas engine still serviced by rebuilders for industrial, irrigation, and field power applications.',
  },
  {
    brand: 'Waukesha',
    model: 'F1197G',
    series: 'Legacy Gas',
    origin: 'United States',
    fuel_type: 'Natural Gas',
    displacement_l: 20,
    cylinders: 6,
    configuration: 'L6, naturally aspirated gas',
    power_kw: hpToKw(255),
    power_hp: 255,
    rpm_rated: 1800,
    compression_ratio: '9:1',
    cooling_method: 'Liquid-Cooled',
    weight_kg: 1907,
    use: 'Discontinued Waukesha natural-gas engine with active used-engine, rebuild, and generator-set owner demand; 7:1 and 9:1 variants are documented.',
  },
].map(legacy)

const records = [
  ...PERKINS,
  ...LISTER_PETTER,
  ...JAPANESE_INDUSTRIAL,
  ...WAUKESHA,
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

console.log(`Upserted ${data.length} discontinued legacy engine records (${inserts} inserts, ${updates} updates)`)
for (const row of data.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`))) {
  console.log(`${row.brand}\t${row.model}\t${row.slug}`)
}
