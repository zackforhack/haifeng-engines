// Fill the missing nodes in Generac's current 4.5 L industrial gaseous range.
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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-22')
const base =
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
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA Stationary Emergency',
  ],
  cylinders: 4,
  displacement_l: 4.5,
  rpm_rated: 1800,
  rpm_max: 1800,
}

const records = [
  {
    ...common,
    slug: 'generac-sg035-4-5l',
    model: 'SG035',
    configuration: 'Inline-4 Naturally Aspirated',
    prime_power_kwe_60hz: 32,
    prime_power_kva_60hz: 39,
    standby_power_kwe_60hz: 35,
    standby_power_kva_60hz: 43.8,
    description:
      'Generac SG035 is a 35 kWe, 60 Hz industrial gaseous standby '
      + 'generator using the naturally aspirated 4.5 L inline-four engine. '
      + 'Generac publishes 32 kWe prime output and EPA stationary '
      + 'emergency certification. Natural-gas ratings are used here.',
  },
  {
    ...common,
    slug: 'generac-sg050na-4-5l',
    model: 'SG050NA',
    configuration: 'Inline-4 Naturally Aspirated',
    standby_power_kwe_60hz: 50,
    standby_power_kva_60hz: 62.5,
    description:
      'Generac SG050NA is the naturally aspirated 50 kWe node in the '
      + '4.5 L inline-four industrial gaseous generator family. The '
      + 'official specification publishes 60 Hz standby ratings for '
      + 'natural gas and propane and EPA stationary emergency certification.',
  },
  {
    ...common,
    slug: 'generac-sg050t-4-5l',
    model: 'SG050T',
    configuration: 'Inline-4 Turbocharged',
    standby_power_kwe_60hz: 50,
    standby_power_kva_60hz: 62.5,
    description:
      'Generac SG050T is the turbocharged 50 kWe node in the 4.5 L '
      + 'inline-four industrial gaseous generator family. The official '
      + 'specification publishes the 1800 RPM natural-gas rating and '
      + '82 hp at rated output, with EPA stationary emergency certification.',
  },
  {
    ...common,
    slug: 'generac-sg070-4-5l',
    model: 'SG070',
    configuration: 'Inline-4 Turbocharged',
    standby_power_kwe_60hz: 70,
    standby_power_kva_60hz: 87.5,
    description:
      'Generac SG070 is a 70 kWe, 60 Hz industrial gaseous standby '
      + 'generator using the turbocharged 4.5 L inline-four engine at '
      + '1800 RPM. Generac publishes 113 hp at rated output and EPA '
      + 'stationary emergency certification. Natural-gas ratings are used.',
  },
]

const documents = [
  ['generac-sg035-4-5l', 'sg035-35kw-industrial-gaseous-generator-specsheet.pdf'],
  ['generac-sg050na-4-5l', 'sg050na-50kw-industrial-gaseous-generator-specsheet.pdf'],
  ['generac-sg050t-4-5l', 'sg050t-50kw-industrial-gaseous-generator-specsheet.pdf'],
  ['generac-sg070-4-5l', 'sg070-70kw-industrial-gaseous-generator-specsheet.pdf'],
].map(([slug, filename]) => ({
  slug,
  source: base + filename,
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

console.log(`Applied ${records.length} Generac 4.5 L generator records.`)
