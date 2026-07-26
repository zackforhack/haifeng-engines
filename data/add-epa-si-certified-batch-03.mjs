// Resolve high-confidence EPA spark-ignited 1800 RPM coverage for
// Caterpillar, Cummins, Kohler/Rehlko, and mtu.
// Dry-run by default. Use --apply to update Supabase and attach official PDFs.

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const apply = process.argv.includes('--apply')
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !serviceKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(supabaseUrl, serviceKey)
const bucket = 'engine-pdfs'
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-03')

const gasCommon = {
  status: 'active',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  emissions_standard: 'U.S. EPA Stationary',
}

const records = [
  {
    ...gasCommon,
    slug: 'caterpillar-cg18',
    brand: 'Caterpillar',
    model: 'CG18',
    series: 'CG',
    origin: 'United States',
    cylinders: 6,
    configuration: 'L6 Turbocharged Air-to-Air Aftercooled',
    displacement_l: 18.1,
    compression_ratio: '10.5:1',
    power_kw: 567,
    standby_power_kwe_60hz: 500,
    standby_power_kva_60hz: 625,
    certifications: [
      'U.S. EPA Stationary Emergency',
      'U.S. EPA Stationary Non-Emergency',
    ],
    description:
      'Caterpillar CG18 is an 18.1 L inline-6 turbocharged and air-to-air '
      + 'aftercooled natural-gas engine for 60 Hz generator sets. The '
      + 'official Cat DG500 specification lists 500 kWe standby at 1800 '
      + 'RPM and EPA stationary emergency and non-emergency compliance; '
      + 'EPA annual certification data lists 567 kWm.',
  },
  {
    ...gasCommon,
    slug: 'cummins-qsj2-4g',
    brand: 'Cummins',
    model: 'QSJ2.4G',
    series: 'QSJ',
    origin: 'United States',
    cylinders: 4,
    configuration: 'L4 Spark Ignition',
    displacement_l: 2.4,
    power_kw: 52.2,
    standby_power_kwe_60hz: 40,
    standby_power_kva_60hz: 50,
    certifications: ['U.S. EPA NSPS'],
    description:
      'Cummins QSJ2.4G is a 2.4 L inline-4 spark-ignited engine for '
      + 'natural-gas generator sets. Cummins lists the platform in '
      + 'EPA NSPS-certified 60 Hz sets through 40 kWe, while EPA annual '
      + 'certification data lists a current 52.2 kWm calibration.',
  },
  {
    ...gasCommon,
    slug: 'cummins-qsj5-9g',
    brand: 'Cummins',
    model: 'QSJ5.9G',
    series: 'QSJ',
    origin: 'United States',
    cylinders: 6,
    configuration: 'L6 Turbocharged Spark Ignition',
    displacement_l: 5.9,
    power_kw: 123.8,
    standby_power_kwe_60hz: 100,
    standby_power_kva_60hz: 125,
    certifications: ['U.S. EPA NSPS'],
    description:
      'Cummins QSJ5.9G is a 5.9 L inline-6 spark-ignited natural-gas '
      + 'generator engine. Cummins lists G1, G2 and G3 ratings in EPA '
      + 'NSPS-certified 60 Hz sets from 45 to 100 kWe; EPA annual '
      + 'certification data lists up to 123.8 kWm at 1800 RPM.',
  },
  {
    ...gasCommon,
    slug: 'cummins-kta38gcslb',
    brand: 'Cummins',
    model: 'KTA38GCSLB',
    series: 'KTA38GC',
    origin: 'United States',
    cylinders: 12,
    configuration: 'V12 Turbocharged Aftercooled',
    displacement_l: 37.7,
    compression_ratio: '8.5:1',
    power_kw: 634,
    certifications: ['U.S. EPA Stationary - Site Validation Required'],
    description:
      'Cummins KTA38GCSLB is a 37.7 L V12 turbocharged and aftercooled '
      + 'natural-gas engine for stationary gas-compression applications. '
      + 'Cummins lists 634 kW at 1800 RPM, matching the 633 kW EPA family '
      + 'within rounding. Cummins requires site validation and notes that '
      + 'this rating does not meet revised non-emergency SI NSPS limits.',
  },
  {
    ...gasCommon,
    slug: 'kohler-kg6208thd',
    brand: 'Kohler',
    model: 'KG6208THD',
    series: 'KG',
    origin: 'United States',
    cylinders: 8,
    configuration: 'V8 Turbocharged Aftercooled',
    displacement_l: 6.2,
    compression_ratio: '9.8:1',
    power_kw: 152,
    standby_power_kwe_60hz: 125,
    standby_power_kva_60hz: 156,
    certifications: ['U.S. EPA NSPS Stationary Spark-Ignited'],
    description:
      'Kohler KG6208THD is a 6.2 L V8 turbocharged and aftercooled '
      + 'natural-gas engine used in the KG125R generator set. The official '
      + 'Kohler specification lists 152 kWm and 125 kWe standby at 1800 '
      + 'RPM with EPA NSPS stationary spark-ignited certification.',
  },
  {
    ...gasCommon,
    slug: 'kohler-kg10v08t-6cgs',
    brand: 'Kohler',
    model: 'KG10V08T-6CGS',
    series: 'KG',
    origin: 'United States',
    cylinders: 8,
    configuration: 'V8 Turbocharged Aftercooled',
    displacement_l: 10.3,
    compression_ratio: '9.3:1',
    power_kw: 174,
    standby_power_kwe_60hz: 150,
    standby_power_kva_60hz: 188,
    certifications: ['U.S. EPA Stationary Emergency'],
    description:
      'Kohler KG10V08T-6CGS is a 10.3 L V8 turbocharged and aftercooled '
      + 'natural-gas engine used in the KG150 generator set. The official '
      + 'Rehlko specification lists 174 kWm on natural gas, up to 150 kWe '
      + 'standby at 1800 RPM and EPA stationary emergency certification.',
  },
  {
    ...gasCommon,
    slug: 'mtu-12v1600l80s',
    brand: 'MTU',
    model: '12V1600L80S',
    series: 'Series 1600',
    origin: 'Germany',
    cylinders: 12,
    configuration: 'V12 Turbocharged Intercooled',
    displacement_l: 21,
    compression_ratio: '11:1',
    power_kw: 565,
    standby_power_kwe_60hz: 450,
    standby_power_kva_60hz: 562.5,
    certifications: ['U.S. EPA Stationary'],
    description:
      'MTU 12V1600L80S is a 21.0 L V12 turbocharged and intercooled '
      + 'natural-gas engine. The official mtu 12V1600 GS450 specification '
      + 'lists 565 kWm maximum engine power and 450 kWe standby at 1800 '
      + 'RPM; EPA annual certification data covers 522 and 565 kWm '
      + 'stationary calibrations.',
  },
]

const documents = [
  {
    source: 'https://emc.cat.com/pubdirect.ashx?media_string_id=LEHE20517-',
    storagePath: 'caterpillar/spec-sheets/dg500-cg18-lehe20517.pdf',
    label: 'Cat DG500 CG18 Specification Sheet',
    slugs: ['caterpillar-cg18'],
  },
  {
    source:
      'https://www.cummins.com/sites/default/files/2025-09/'
      + 'north-america-60-model-range-2025.pdf',
    storagePath:
      'cummins/rating-guides/north-america-gaseous-60hz-2025.pdf',
    label: 'Cummins North America Gaseous 60 Hz Model Range',
    slugs: ['cummins-qsj2-4g', 'cummins-qsj5-9g'],
  },
  {
    source:
      'https://mart.cummins.com/imagelibrary/data/assetfiles/0032335.pdf',
    storagePath: 'cummins/brochures/cummins-power-products-4087018.pdf',
    label: 'Cummins Power Products KTA38GC Brochure',
    slugs: ['cummins-kta38gcslb'],
  },
  {
    source: 'https://techcomm.rehlko.com/techcomm/pdf/g4290.pdf',
    storagePath: 'kohler/spec-sheets/kg125r-kg6208thd-g4290.pdf',
    label: 'Kohler KG125R / KG6208THD Specification Sheet',
    slugs: ['kohler-kg6208thd'],
  },
  {
    source: 'https://techcomm.rehlko.com/techcomm/pdf/g4293.pdf',
    storagePath: 'kohler/spec-sheets/kg150-kg10v08t-6cgs-g4293.pdf',
    label: 'Rehlko KG150 / KG10V08T-6CGS Specification Sheet',
    slugs: ['kohler-kg10v08t-6cgs'],
  },
  {
    source:
      'https://www.mtu-solutions.com/content/dam/mtu/products/'
      + 'power-generation/powergeneration-product-list-latest/'
      + '231297_PG_Spec_12V1600GS450_450kW_3D_60Hz.pdf/'
      + '_jcr_content/renditions/original./'
      + '231297_PG_Spec_12V1600GS450_450kW_3D_60Hz.pdf',
    storagePath: 'mtu/spec-sheets/12v1600-gs450-60hz-231297.pdf',
    label: 'mtu 12V1600 GS450 / 12V1600L80S Specification Sheet',
    slugs: ['mtu-12v1600l80s'],
  },
]

async function downloadPdf(source, destination) {
  const response = await fetch(source, {
    headers: { 'User-Agent': 'Mozilla/5.0 HaifengEngineDatabase/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${source}: response is not a PDF`)
  }
  fs.writeFileSync(destination, buffer)
}

const slugs = records.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .in('slug', slugs)
if (existingError) throw existingError

const existingSlugs = new Set(existing.map((engine) => engine.slug))
console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  brand: record.brand,
  model: record.model,
  displacement_l: record.displacement_l,
  cylinders: record.cylinders,
})))

if (!apply) {
  console.log(
    `\nDry run: ${existing.length} records will be updated and `
    + `${records.length - existing.length} records will be inserted.`,
  )
  process.exit(0)
}

fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
  const localPath = path.join(tempDir, path.basename(document.storagePath))
  await downloadPdf(document.source, localPath)
  document.localPath = localPath
  console.log(`Validated ${document.label}`)
}

for (const record of records) {
  if (existingSlugs.has(record.slug)) {
    const { error } = await supabase
      .from('engines')
      .update(record)
      .eq('slug', record.slug)
    if (error) throw error
  } else {
    const { error } = await supabase.from('engines').insert(record)
    if (error) throw error
  }
}

const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (savedError) throw savedError
if (saved.length !== records.length) {
  throw new Error(`Expected ${records.length} saved records; found ${saved.length}`)
}
const engineBySlug = new Map(saved.map((engine) => [engine.slug, engine]))

for (const document of documents) {
  const uploaded = await uploadPdf(
    supabase,
    bucket,
    document.localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)

  const engineIds = document.slugs.map((slug) => engineBySlug.get(slug).id)
  const { data: linked, error: linkedError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('storage_path', document.storagePath)
    .in('engine_id', engineIds)
  if (linkedError) throw linkedError

  const linkedIds = new Set(linked.map((row) => row.engine_id))
  const links = engineIds
    .filter((engineId) => !linkedIds.has(engineId))
    .map((engineId) => ({
      engine_id: engineId,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(document.localPath).size,
    }))
  if (links.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
    if (linkError) throw linkError
  }
}

console.log(
  `Saved ${records.length} spark-ignited records and ensured `
  + `${documents.length} official document sets.`,
)
