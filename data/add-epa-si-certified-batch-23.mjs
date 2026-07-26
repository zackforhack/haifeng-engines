// Complete the missing nodes in Generac's current 8.8-33.9 L gaseous range.
// Dry-run by default; pass --apply to write and link official spec sheets.

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) throw new Error('Supabase credentials are required')

const supabase = createClient(url, key)
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-23')
const staticBase =
  'https://www.generac.com/globalassets/products/business/'
  + 'stationary-generators/gaseous-industrial-generators/spec-sheets/'

const common = {
  brand: 'Generac',
  series: 'Industrial Gaseous',
  status: 'active',
  origin: 'United States',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'U.S. EPA Stationary',
  rpm_rated: 1800,
  rpm_max: 1800,
}

const emergencyOnly = [
  'U.S. EPA Stationary',
  'U.S. EPA Stationary Emergency',
]
const emergencyAndNonEmergency = [
  ...emergencyOnly,
  'U.S. EPA Stationary Non-Emergency',
]

const records = [
  {
    ...common,
    slug: 'generac-sg100-8-8l',
    model: 'SG100 (8.8L)',
    cylinders: 8,
    displacement_l: 8.8,
    configuration: 'V8 Turbocharged Aftercooled',
    certifications: emergencyOnly,
    standby_power_kwe_60hz: 100,
    standby_power_kva_60hz: 125,
    description:
      'Generac SG100 is the 100 kWe node in the current 8.8 L V8 '
      + 'industrial gaseous generator family. The PSI engine is '
      + 'turbocharged and aftercooled, operates at 1800 RPM, and is EPA '
      + 'certified for stationary emergency service.',
  },
  {
    ...common,
    slug: 'generac-sg130-8-8l',
    model: 'SG130 (8.8L)',
    cylinders: 8,
    displacement_l: 8.8,
    configuration: 'V8 Turbocharged Aftercooled',
    certifications: emergencyOnly,
    standby_power_kwe_60hz: 130,
    standby_power_kva_60hz: 162.5,
    description:
      'Generac SG130 is the 130 kWe node in the current 8.8 L V8 '
      + 'industrial gaseous generator family. The turbocharged and '
      + 'aftercooled engine runs at 1800 RPM and carries EPA stationary '
      + 'emergency certification.',
  },
  {
    ...common,
    slug: 'generac-sg150',
    model: 'SG150',
    cylinders: 8,
    displacement_l: 8.8,
    configuration: 'V8 Turbocharged Aftercooled',
    certifications: emergencyOnly,
    prime_power_kwe_60hz: null,
    prime_power_kva_60hz: null,
    standby_power_kwe_60hz: 150,
    standby_power_kva_60hz: 187.5,
    description:
      'Generac SG150 is the 150 kWe node in the current 8.8 L V8 '
      + 'industrial gaseous generator family. The official specification '
      + 'identifies a turbocharged and aftercooled engine at 1800 RPM and '
      + 'EPA stationary emergency certification.',
  },
  {
    ...common,
    slug: 'generac-sg175',
    model: 'SG175',
    cylinders: 6,
    displacement_l: 14.2,
    configuration: 'Inline-6 Turbocharged Aftercooled',
    certifications: emergencyAndNonEmergency,
    prime_power_kwe_60hz: 158,
    prime_power_kva_60hz: 197.5,
    standby_power_kwe_60hz: 175,
    standby_power_kva_60hz: 218.8,
    description:
      'Generac SG175 is a 175 kWe standby and 158 kWe prime industrial '
      + 'gaseous generator using the 14.2 L inline-six platform at '
      + '1800 RPM. Generac certifies it for EPA stationary emergency and '
      + 'non-emergency applications.',
  },
  {
    ...common,
    slug: 'generac-sg200',
    model: 'SG200',
    cylinders: 6,
    displacement_l: 14.2,
    configuration: 'Inline-6 Turbocharged Aftercooled',
    certifications: emergencyAndNonEmergency,
    prime_power_kwe_60hz: 180,
    prime_power_kva_60hz: 225,
    standby_power_kwe_60hz: 200,
    standby_power_kva_60hz: 250,
    description:
      'Generac SG200 is a 200 kWe standby and 180 kWe prime industrial '
      + 'gaseous generator using the 14.2 L inline-six platform at '
      + '1800 RPM. It is EPA certified for stationary emergency and '
      + 'non-emergency service.',
  },
  {
    ...common,
    slug: 'generac-sg230',
    model: 'SG230',
    cylinders: 6,
    displacement_l: 14.2,
    configuration: 'Inline-6 Turbocharged Aftercooled',
    certifications: emergencyAndNonEmergency,
    prime_power_kwe_60hz: 207,
    prime_power_kva_60hz: 258.8,
    standby_power_kwe_60hz: 230,
    standby_power_kva_60hz: 287.5,
    description:
      'Generac SG230 is a 230 kWe standby and 207 kWe prime industrial '
      + 'gaseous generator using the 14.2 L inline-six platform at '
      + '1800 RPM. It is EPA certified for stationary emergency and '
      + 'non-emergency service.',
  },
  {
    ...common,
    slug: 'generac-sg350',
    model: 'SG350',
    cylinders: 12,
    displacement_l: 21.9,
    configuration: 'V12 Turbocharged Aftercooled',
    certifications: emergencyAndNonEmergency,
    standby_power_kwe_60hz: 350,
    standby_power_kva_60hz: 437.5,
    description:
      'Generac SG350 is a 350 kWe industrial gaseous generator using '
      + 'the 21.9 L V12 platform at 1800 RPM. The official specification '
      + 'covers natural-gas operation and EPA stationary emergency and '
      + 'non-emergency certification.',
  },
  {
    ...common,
    slug: 'generac-sg400',
    model: 'SG400',
    cylinders: 12,
    displacement_l: 21.9,
    configuration: 'V12 Turbocharged Aftercooled',
    certifications: emergencyAndNonEmergency,
    prime_power_kwe_60hz: 360,
    prime_power_kva_60hz: 450,
    standby_power_kwe_60hz: 400,
    standby_power_kva_60hz: 500,
    description:
      'Generac SG400 is a 400 kWe standby and 360 kWe prime industrial '
      + 'gaseous generator using the 21.9 L V12 platform at 1800 RPM. '
      + 'It is EPA certified for stationary emergency and non-emergency '
      + 'service.',
  },
  {
    ...common,
    slug: 'generac-sg625',
    model: 'SG625',
    cylinders: 12,
    displacement_l: 33.9,
    configuration: 'V12 Turbocharged Aftercooled',
    certifications: emergencyAndNonEmergency,
    standby_power_kwe_60hz: 625,
    standby_power_kva_60hz: 781.3,
    description:
      'Generac SG625 is a 625 kWe industrial gaseous generator using '
      + 'the 33.9 L V12 platform at 1800 RPM. The official specification '
      + 'covers natural-gas operation and EPA stationary emergency and '
      + 'non-emergency certification.',
  },
]

const documents = [
  [
    'generac-sg100-8-8l',
    'https://legacy.genconnect.generac.com/Media/vwDoc.axd?d=3217f6a8-e981-4d33-a9c3-eeb31de94f77',
    'sg100-8-8l-specification.pdf',
  ],
  [
    'generac-sg130-8-8l',
    'https://legacy.genconnect.generac.com/Media/vwDoc.axd?d=cc3dfc16-1450-4db0-ae4e-d77351d3c3e8',
    'sg130-8-8l-specification.pdf',
  ],
  [
    'generac-sg150',
    'https://legacy.genconnect.generac.com/Media/vwDoc.axd?d=360d71ae-c585-4dfe-9d30-41d61414db4a',
    'sg150-8-8l-specification.pdf',
  ],
  ...[
    ['generac-sg175', 'sg175-175kw-industrial-gaseous-generator-specsheet.pdf'],
    ['generac-sg200', 'sg200-200kw-industrial-gaseous-generator-specsheet.pdf'],
    ['generac-sg230', 'sg230-230kw-industrial-gaseous-generator-specsheet.pdf'],
    ['generac-sg350', 'sg350-350kw-industrial-gaseous-generator-specsheet.pdf'],
    ['generac-sg400', 'sg400-400kw-industrial-gaseous-generator-specsheet.pdf'],
    ['generac-sg625', 'sg625-625kw-industrial-gaseous-generator-specsheet.pdf'],
  ].map(([slug, filename]) => [slug, staticBase + filename, filename]),
].map(([slug, source, filename]) => ({
  slug,
  source,
  storagePath: `generac/industrial/${filename}`,
  label: `Generac ${records.find((record) => record.slug === slug).model} Specification`,
}))

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
  displacement_l: record.displacement_l,
  configuration: record.configuration,
  standby_kwe_60hz: record.standby_power_kwe_60hz,
})))
if (!apply) {
  console.log(
    `Dry run: ${existing.length} updates and `
    + `${records.length - existing.length} inserts.`,
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
const engineBySlug = new Map(saved.map((engine) => [engine.slug, engine]))
if (saved.length !== records.length) {
  throw new Error(`Expected ${records.length} records; found ${saved.length}`)
}

for (const document of documents) {
  const uploaded = await uploadPdf(
    supabase,
    'engine-pdfs',
    document.localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)
  const engineId = engineBySlug.get(document.slug).id
  const { data: linked, error: linkedError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('engine_id', engineId)
    .eq('storage_path', document.storagePath)
  if (linkedError) throw linkedError
  if (!linked.length) {
    const { error } = await supabase.from('engine_pdfs').insert({
      engine_id: engineId,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(document.localPath).size,
    })
    if (error) throw error
  }
}

console.log(`Applied ${records.length} Generac gaseous generator records.`)
