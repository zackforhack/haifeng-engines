// Add five documented legacy Generac gaseous engine platforms that cover
// 25 historical stationary EPA SI lineages. Dry-run by default.

import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(url, key)
const common = {
  brand: 'Generac',
  series: 'Legacy Liquid-Cooled Gas',
  status: 'discontinued',
  origin: 'United States',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA NSPS Subpart JJJJ',
  ],
}

const records = [
  {
    ...common,
    slug: 'generac-legacy-4-2l-v6-gas',
    model: '4.2L V6 Gas',
    cylinders: 6,
    configuration: 'V6 Naturally Aspirated',
    displacement_l: 4.2,
    power_kw: 55.4,
    year_introduced: 2011,
    year_discontinued: 2012,
    description:
      'Generac 4.2L V6 Gas is a legacy naturally aspirated, '
      + 'liquid-cooled spark-ignited engine used in QT commercial '
      + 'standby generator sets including 35-48 kW nodes. EPA '
      + 'families rooted at AGNXB04.22L1 through AGNXB04.22NN '
      + 'record 49.3-55.4 kWm natural-gas and propane calibrations '
      + 'at the 1800 RPM certification test speed.',
  },
  {
    ...common,
    slug: 'generac-legacy-5-4l-v8-gas',
    model: '5.4L V8 Gas',
    cylinders: 8,
    configuration: 'V8 Naturally Aspirated',
    displacement_l: 5.4,
    power_kw: 61.7,
    year_introduced: 2012,
    year_discontinued: 2020,
    description:
      'Generac 5.4L V8 Gas is a legacy naturally aspirated, '
      + 'liquid-cooled spark-ignited engine used in QT generator '
      + 'sets such as the QT08054 family. EPA stationary lineages '
      + 'from AGNXB05.42NL through JGNXB05.42N2 record natural-gas '
      + 'nodes from 57.44 kWm to 61.7 kWm at 1800 RPM.',
  },
  {
    ...common,
    slug: 'generac-legacy-6-8l-v10-gas',
    model: '6.8L V10 Gas',
    cylinders: 10,
    configuration: 'V10 Naturally Aspirated',
    displacement_l: 6.8,
    power_kw: 83.5,
    year_introduced: 2011,
    year_discontinued: 2022,
    description:
      'Generac 6.8L V10 Gas is a legacy naturally aspirated, '
      + 'liquid-cooled spark-ignited platform used in QT gaseous '
      + 'generator sets including QT10068 configurations. Generac '
      + 'documents the 6.8 L V10 at 1800 RPM, and its stationary '
      + 'EPA lineages cover natural-gas calibrations from 71.67 '
      + 'kWm to 83.5 kWm through model year 2022.',
  },
  {
    ...common,
    slug: 'generac-legacy-g12-9l-g20',
    model: 'G12.9L G20',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 12.9,
    power_kw: 229.58,
    year_introduced: 2012,
    year_discontinued: 2022,
    description:
      'Generac G12.9L G20 is a legacy 12.9 L inline-six '
      + 'spark-ignited industrial generator engine used across '
      + 'historical SG and MG 150-300 kW gaseous generator sets. '
      + 'EPA families CGNXB12.92C1, CGNXB12.92C2, CGNXB12.92N1 '
      + 'and DGNXB12.92C4 record matching stationary 1800 RPM '
      + 'configurations at approximately 226-230 kWm.',
  },
  {
    ...common,
    slug: 'generac-legacy-13-3l-hino-gas',
    model: '13.3L Hino Gas',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 13.3,
    power_kw: 230.6,
    year_introduced: 2011,
    year_discontinued: 2014,
    description:
      'Generac 13.3L Hino Gas is a legacy inline-six '
      + 'spark-ignited industrial generator engine used in '
      + 'approximately 200-250 kW gaseous generator sets. EPA '
      + 'family AGNXB13.32C6 records the matching 13.3 L, '
      + '230.6 kWm stationary configuration at 1800 RPM.',
  },
]

const slugs = records.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (existingError) throw existingError
const existingSlugs = new Set(existing.map((engine) => engine.slug))

console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  model: record.model,
  displacement_l: record.displacement_l,
  cylinders: record.cylinders,
  power_kw: record.power_kw,
})))

if (!apply) {
  console.log(
    `Dry run: ${existing.length} updates, `
    + `${records.length - existing.length} inserts.`,
  )
  process.exit(0)
}

for (const record of records) {
  const query = existingSlugs.has(record.slug)
    ? supabase.from('engines').update(record).eq('slug', record.slug)
    : supabase.from('engines').insert(record)
  const { error } = await query
  if (error) throw error
}

const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (savedError) throw savedError
if (saved.length !== records.length) {
  throw new Error(`Expected ${records.length} saved records; found ${saved.length}`)
}

console.log(`Saved ${records.length} legacy Generac EPA SI platforms.`)
