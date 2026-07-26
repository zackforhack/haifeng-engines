// Add source-backed gaseous generator configurations that fill the remaining
// Waukesha, Generac and Cummins 1800 RPM coverage gaps.
// Dry-run by default; pass --apply to write and link official publications.

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(url, key)
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-20')

const common = {
  status: 'active',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'U.S. EPA Stationary',
  rpm_rated: 1800,
  rpm_max: 1800,
}

const records = [
  {
    ...common,
    slug: 'waukesha-vgf-h24se',
    brand: 'Waukesha',
    model: 'VGF24SE (H24SE)',
    series: 'VGF',
    origin: 'United States',
    cylinders: 8,
    configuration: 'L8 Turbocharged Intercooled',
    displacement_l: 24,
    compression_ratio: '8.6:1',
    power_kw: 400,
    power_hp: 530,
    prime_power_kw_60hz: 400,
    prime_power_kwe_60hz: 375,
    prime_power_kva_60hz: 468.8,
    standby_power_kwe_60hz: 410,
    standby_power_kva_60hz: 512.5,
    certifications: [
      'U.S. EPA Stationary',
      'U.S. EPA NSPS Subpart JJJJ',
    ],
    description:
      'Waukesha VGF24SE is the remote-radiator generator package using '
      + 'the 24 L H24SE inline-eight natural-gas engine. INNIO publishes '
      + '400 kWb continuous engine output at 1800 RPM, with 375 kWe '
      + 'continuous and 410 kWe standby package ratings at 60 Hz. INNIO '
      + 'also publishes an EPA-certified H24SE-EPA configuration.',
  },
  {
    ...common,
    slug: 'waukesha-vgf-p48se',
    brand: 'Waukesha',
    model: 'VGF48SE (P48SE)',
    series: 'VGF',
    origin: 'United States',
    year_introduced: 2021,
    cylinders: 16,
    configuration: 'V16 Turbocharged Intercooled',
    displacement_l: 48,
    compression_ratio: '8.6:1',
    power_kw: 1065,
    power_hp: 1428,
    prime_power_kw_60hz: 1065,
    prime_power_kwe_60hz: 760,
    prime_power_kva_60hz: 950,
    standby_power_kwe_60hz: 1050,
    standby_power_kva_60hz: 1312.5,
    certifications: [
      'U.S. EPA Stationary',
      'U.S. EPA NSPS Subpart JJJJ',
    ],
    description:
      'Waukesha VGF48SE is the remote-radiator generator package using '
      + 'the 48 L P48SE V16 natural-gas engine. INNIO publishes 1065 kWb '
      + 'continuous engine output at 1800 RPM, with 760 kWe continuous '
      + 'and 1050 kWe standby package ratings at 60 Hz. EPA annual '
      + 'certification data records matching 48 L V16 stationary lineages.',
  },
  {
    ...common,
    slug: 'generac-rg04845',
    brand: 'Generac',
    model: 'RG04845',
    series: 'Protector',
    origin: 'United States',
    cylinders: 4,
    configuration: 'Inline-4 Naturally Aspirated',
    displacement_l: 4.5,
    compression_ratio: '9.9:1',
    power_kw: 64.4,
    standby_power_kwe_60hz: 48,
    standby_power_kva_60hz: 60,
    certifications: [
      'U.S. EPA Stationary',
      'U.S. EPA Stationary Emergency',
    ],
    description:
      'Generac RG04845 is a 48 kWe, 60 Hz emergency-standby generator '
      + 'using a 4.5 L inline-four naturally aspirated gaseous engine at '
      + '1800 RPM. Generac publishes both natural-gas and propane ratings; '
      + 'this database uses the 48 kWe natural-gas rating. EPA annual '
      + 'certification data lists a matching 4.4 L naturally aspirated '
      + 'family with a 64.4 kW maximum certification power node.',
  },
  ...[
    ['cummins-c125n6', 'C125N6', 'QSJ8.9G-G2', 125, 156],
    ['cummins-c150n6', 'C150N6', 'QSJ8.9G-G2', 150, 188],
    ['cummins-c175n6b', 'C175N6B', 'QSJ8.9G-G3', 175, 218],
    ['cummins-c200n6b', 'C200N6B', 'QSJ8.9G-G3', 200, 250],
  ].map(([slug, model, engineModel, kwe, kva]) => ({
    ...common,
    slug,
    brand: 'Cummins',
    model,
    series: 'QSJ8.9G Genset',
    origin: 'United States',
    year_introduced: model === 'C175N6B' || model === 'C200N6B' ? 2023 : null,
    cylinders: 6,
    configuration: 'Inline-6 Turbocharged',
    displacement_l: 8.9,
    standby_power_kwe_60hz: kwe,
    standby_power_kva_60hz: kva,
    certifications: [
      'U.S. EPA Stationary',
      'U.S. EPA NSPS',
      'U.S. EPA Stationary Emergency',
    ],
    description:
      `Cummins ${model} is a ${kwe} kWe, 60 Hz natural-gas standby `
      + `generator set powered by the 8.9 L inline-six ${engineModel} `
      + 'spark-ignition engine. Cummins publishes the QSJ8.9G 125-200 kW '
      + 'range as EPA NSPS emergency-standby certified and identifies an '
      + 'upgraded turbocharger for high power density.',
  })),
]

const documents = [
  {
    source:
      'https://www.generac.com/globalassets/products/residential/'
      + 'standby-generators/spec-sheets/'
      + '48kw-protector-standby-generator-specsheet.pdf',
    storagePath:
      'generac/residential/4-5l-protector-generator-spec-sheet.pdf',
    label: 'Generac 4.5L Protector Generator Specification',
    slugs: ['generac-rg04845'],
  },
  {
    source:
      'https://mart.cummins.com/imagelibrary/data/assetfiles/0075811.pdf',
    storagePath:
      'cummins/gas/qsj8-9g-125-200kw-gaseous-generators.pdf',
    label: 'Cummins QSJ8.9G 125-200 kW Gaseous Generators',
    slugs: [
      'cummins-c125n6',
      'cummins-c150n6',
      'cummins-c175n6b',
      'cummins-c200n6b',
    ],
  },
]

const existingWaukeshaDocument = {
  storagePath: 'waukesha/guides/innio-waukesha-power-ratings-2023.pdf',
  label: 'INNIO Waukesha Power Ratings 2023',
  slugs: ['waukesha-vgf-h24se', 'waukesha-vgf-p48se'],
}

const slugs = records.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (existingError) throw existingError
const existingSlugs = new Set(existing.map((engine) => engine.slug))

console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  slug: record.slug,
  model: record.model,
  standby_kwe_60hz: record.standby_power_kwe_60hz,
})))

if (!apply) {
  console.log(
    `Dry run: ${existing.length} updates, ${records.length - existing.length} `
    + `inserts and ${documents.length + 1} official document link sets.`,
  )
  process.exit(0)
}

fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
  document.localPath = path.join(tempDir, path.basename(document.storagePath))
  const response = await fetch(document.source, {
    headers: { 'User-Agent': 'Mozilla/5.0 HaifengEngineDatabase/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${document.source}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.source}: response is not a PDF`)
  }
  fs.writeFileSync(document.localPath, buffer)
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
const engineBySlug = new Map(saved.map((engine) => [engine.slug, engine]))

async function linkDocument(document, fileSizeBytes) {
  const engineIds = document.slugs.map((slug) => engineBySlug.get(slug).id)
  const { data: linked, error: linkedError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('storage_path', document.storagePath)
    .in('engine_id', engineIds)
  if (linkedError) throw linkedError
  const linkedIds = new Set(linked.map((row) => row.engine_id))
  const rows = engineIds
    .filter((engineId) => !linkedIds.has(engineId))
    .map((engineId) => ({
      engine_id: engineId,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fileSizeBytes,
    }))
  if (rows.length) {
    const { error } = await supabase.from('engine_pdfs').insert(rows)
    if (error) throw error
  }
}

for (const document of documents) {
  const uploaded = await uploadPdf(
    supabase,
    'engine-pdfs',
    document.localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)
  await linkDocument(document, fs.statSync(document.localPath).size)
}

const { data: waukeshaSource, error: waukeshaSourceError } = await supabase
  .from('engine_pdfs')
  .select('file_size_bytes')
  .eq('storage_path', existingWaukeshaDocument.storagePath)
  .limit(1)
  .single()
if (waukeshaSourceError) throw waukeshaSourceError
await linkDocument(
  existingWaukeshaDocument,
  waukeshaSource.file_size_bytes,
)

console.log(
  `Applied ${records.length} records and linked three official `
  + 'manufacturer publication sets.',
)
