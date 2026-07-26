// Resolve EPA spark-ignited 1800 RPM coverage for 2G, Origin, and Zenith.
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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-02')

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
    slug: '2g-agenitor-404',
    brand: '2G',
    model: 'agenitor 404',
    series: 'agenitor',
    origin: 'Germany',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 6.6,
    power_kw: 62,
    certifications: ['U.S. EPA Stationary Part 1048'],
    description:
      '2G agenitor 404 6.6 L inline-4 natural-gas engine platform. '
      + 'EPA annual certification data identifies a naturally aspirated '
      + '62 kWm calibration at 1800 RPM; the official 2G product range '
      + 'lists the agenitor 404 for CHP applications.',
  },
  {
    ...gasCommon,
    slug: '2g-agenitor-406',
    brand: '2G',
    model: 'agenitor 406',
    series: 'agenitor',
    origin: 'Germany',
    cylinders: 6,
    configuration: 'L6 Naturally Aspirated',
    displacement_l: 11.9,
    power_kw: 262,
    certifications: ['U.S. EPA Stationary Part 1048'],
    description:
      '2G agenitor 406 11.9 L inline-6 natural-gas engine platform. '
      + 'EPA annual certification data identifies a 262 kWm calibration '
      + 'at 1800 RPM; the official 2G product range lists the agenitor '
      + '406 for CHP applications.',
  },
  {
    ...gasCommon,
    slug: '2g-agenitor-408',
    brand: '2G',
    model: 'agenitor 408',
    series: 'agenitor',
    origin: 'Germany',
    cylinders: 8,
    configuration: 'V8 Naturally Aspirated',
    displacement_l: 16.7,
    power_kw: 376,
    certifications: ['U.S. EPA Stationary Part 1048'],
    description:
      '2G agenitor 408 16.7 L V8 natural-gas engine platform. EPA annual '
      + 'certification data identifies a 376 kWm calibration at 1800 RPM; '
      + 'the official 2G product range lists the agenitor 408 for CHP '
      + 'applications.',
  },
  {
    ...gasCommon,
    slug: '2g-agenitor-412',
    brand: '2G',
    model: 'agenitor 412',
    series: 'agenitor',
    origin: 'Germany',
    cylinders: 12,
    configuration: 'V12 Naturally Aspirated',
    displacement_l: 25,
    power_kw: 574,
    certifications: ['U.S. EPA Stationary Part 1048'],
    description:
      '2G agenitor 412 25.0 L V12 natural-gas engine platform. EPA annual '
      + 'certification data identifies a 574 kWm calibration at 1800 RPM; '
      + 'the official 2G product range lists the agenitor 412 for CHP '
      + 'applications.',
  },
  {
    ...gasCommon,
    slug: 'origin-engines-3-6l-na',
    brand: 'Origin Engines',
    model: '3.6L Naturally Aspirated',
    series: 'Origin Industrial',
    origin: 'United States',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 3.6,
    power_kw: 63,
    certifications: ['U.S. EPA Stationary Part 1048'],
    description:
      'Origin Engines 3.6L Naturally Aspirated is an inline-4 industrial '
      + 'engine for natural gas power generation. Origin lists 1800 RPM '
      + '60 Hz generator configurations, while EPA annual certification '
      + 'data includes 43 and 63 kWm naturally aspirated calibrations.',
  },
  {
    ...gasCommon,
    slug: 'origin-engines-3-6l-turbo',
    brand: 'Origin Engines',
    model: '3.6L Turbo',
    series: 'Origin Industrial',
    origin: 'United States',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 3.6,
    power_kw: 95,
    certifications: ['U.S. EPA Stationary Part 1048'],
    description:
      'Origin Engines 3.6L Turbo is an inline-4 industrial engine for '
      + 'natural gas power generation. Origin lists 1800 RPM 60 Hz '
      + 'generator configurations, while EPA annual certification data '
      + 'includes 75 and 95 kWm turbocharged calibrations.',
  },
  {
    ...gasCommon,
    slug: 'origin-engines-4-3l',
    brand: 'Origin Engines',
    model: '4.3L',
    series: 'Origin Industrial',
    origin: 'United States',
    cylinders: 6,
    configuration: 'V6 Naturally Aspirated',
    displacement_l: 4.3,
    power_kw: 54,
    standby_power_kwe_60hz: 48,
    standby_power_kva_60hz: 60,
    certifications: ['U.S. EPA Stationary Part 1048', 'U.S. EPA Certified 2020'],
    description:
      'Origin Engines 4.3L is a V6 naturally aspirated natural-gas engine. '
      + 'The official technical sheet lists emergency standby power '
      + 'generation, EPA 2020 certification and 48 kWe at 1800 RPM; EPA '
      + 'annual certification data lists a 54 kWm family.',
  },
  {
    ...gasCommon,
    slug: 'origin-engines-6-2l-na',
    brand: 'Origin Engines',
    model: '6.2L Naturally Aspirated',
    series: 'Origin Industrial',
    origin: 'United States',
    cylinders: 8,
    configuration: 'V8 Naturally Aspirated',
    displacement_l: 6.2,
    power_kw: 91,
    certifications: ['U.S. EPA Stationary Part 1048'],
    description:
      'Origin Engines 6.2L Naturally Aspirated is a V8 industrial engine for '
      + 'natural gas power generation. Origin publishes 50 and 60 Hz '
      + 'generator configurations; EPA annual certification data includes '
      + '78 and 91 kWm naturally aspirated calibrations at 1800 RPM.',
  },
  {
    ...gasCommon,
    slug: 'origin-engines-6-2l-turbo',
    brand: 'Origin Engines',
    model: '6.2L Turbo',
    series: 'Origin Industrial',
    origin: 'United States',
    cylinders: 8,
    configuration: 'V8 Turbocharged',
    displacement_l: 6.2,
    power_kw: 157,
    certifications: ['U.S. EPA Stationary Part 1048'],
    description:
      'Origin Engines 6.2L Turbo is a V8 industrial engine for natural '
      + 'gas power generation. Origin publishes 50 and 60 Hz generator '
      + 'configurations; EPA annual certification data lists 157 kWm at '
      + '1800 RPM.',
  },
  {
    ...gasCommon,
    slug: 'origin-engines-9-1l-turbo',
    brand: 'Origin Engines',
    model: '9.1L Turbo',
    series: 'Origin Big Block',
    origin: 'United States',
    cylinders: 8,
    configuration: 'V8 Turbocharged',
    displacement_l: 9.1,
    power_kw: 157,
    certifications: ['U.S. EPA Stationary Part 1048'],
    description:
      'Origin Engines 9.1L Turbo is a V8 natural-gas industrial engine '
      + 'for power generation. Origin publishes 1800 RPM 60 Hz electrical '
      + 'configurations, and EPA annual certification data covers the '
      + '9.1/10.3 L turbocharged family.',
  },
  {
    ...gasCommon,
    slug: 'origin-engines-10-3l-turbo',
    brand: 'Origin Engines',
    model: '10.3L Turbo',
    series: 'Origin Big Block',
    origin: 'United States',
    cylinders: 8,
    configuration: 'V8 Turbocharged',
    displacement_l: 10.3,
    power_kw: 245,
    certifications: ['U.S. EPA Stationary Part 1048'],
    description:
      'Origin Engines 10.3L Turbo is a V8 natural-gas industrial '
      + 'engine for power generation. Origin publishes 1800 RPM 60 Hz '
      + 'configurations up to 200 kWe, and EPA annual certification data '
      + 'lists up to 245 kWm for the 9.1/10.3 L family.',
  },
  {
    ...gasCommon,
    slug: 'zenith-power-products-ta690',
    brand: 'Zenith Power Products',
    model: 'TA690',
    series: 'Zenith Power 690',
    origin: 'United States',
    cylinders: 6,
    configuration: 'L6 Turbocharged',
    displacement_l: 8.83,
    power_kw: 211,
    compression_ratio: '10.5:1',
    certifications: ['U.S. EPA Stationary Part 1048'],
    description:
      'Zenith Power Products TA690 8.83 L inline-6 turbocharged, '
      + 'water-cooled natural-gas engine. Zenith identifies the 690 as '
      + 'EPA certified for stationary constant-speed use, and EPA annual '
      + 'certification data lists 211 kWm at 1800 RPM on natural gas.',
  },
  {
    ...gasCommon,
    slug: 'zenith-power-products-ta6120',
    brand: 'Zenith Power Products',
    model: 'TA6120',
    series: 'Zenith Power 6120',
    origin: 'United States',
    cylinders: 6,
    configuration: 'L6 Turbocharged',
    displacement_l: 11.8,
    power_kw: 335,
    compression_ratio: '11.1:1',
    certifications: ['U.S. EPA Stationary Part 1048'],
    description:
      'Zenith Power Products TA6120 11.8 L inline-6 turbocharged, '
      + 'water-cooled natural-gas engine. Zenith identifies the TA6120 '
      + 'prime engine as EPA certified for stationary and constant-speed '
      + 'use; EPA annual data lists up to 335 kWm at 1800 RPM.',
  },
  {
    ...gasCommon,
    slug: 'zenith-power-products-ta6120r',
    brand: 'Zenith Power Products',
    model: 'TA6120R',
    series: 'Zenith Power 6120',
    origin: 'United States',
    cylinders: 6,
    configuration: 'L6 Turbocharged Emergency Standby',
    displacement_l: 11.8,
    power_kw: 267,
    compression_ratio: '11.1:1',
    certifications: ['U.S. EPA Stationary Emergency'],
    description:
      'Zenith Power Products TA6120R 11.8 L inline-6 turbocharged, '
      + 'water-cooled natural-gas emergency standby engine. Zenith states '
      + 'that the TA6120R is EPA certified for stationary applications; '
      + 'EPA annual certification data lists 267 kWm at 1800 RPM.',
  },
]

const documents = [
  {
    source:
      'https://2-g.com/downloads/en/Media%20%26%20Downloads/'
      + '2g_product_range.pdf',
    storagePath: '2g/brochures/2g-product-range.pdf',
    label: '2G Product Range',
    slugs: [
      '2g-agenitor-404',
      '2g-agenitor-406',
      '2g-agenitor-408',
      '2g-agenitor-412',
    ],
  },
  {
    source:
      'https://originengines.com/wp-content/uploads/2023/01/'
      + 'Origin-4.3L-Spec-Sheet.pdf',
    storagePath: 'origin-engines/spec-sheets/origin-4.3l.pdf',
    label: 'Origin Engines 4.3L Technical Sheet',
    slugs: ['origin-engines-4-3l'],
  },
  {
    source:
      'https://zenithpp.com/wp-content/uploads/sites/105/'
      + '202892-Heavy-Duty-Engine-Operator-Manual-P65-rev-16.pdf',
    storagePath: 'zenith-power-products/manuals/heavy-duty-665-690-6120.pdf',
    label: 'Zenith Heavy Duty Engine Operator and Emissions Manual',
    slugs: [
      'zenith-power-products-ta690',
      'zenith-power-products-ta6120',
      'zenith-power-products-ta6120r',
    ],
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
