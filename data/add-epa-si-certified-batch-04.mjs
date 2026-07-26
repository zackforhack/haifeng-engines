// Add official Arrow models resolving two current EPA SI 1800 RPM lineages.
// Dry-run by default. Use --apply to update Supabase and attach official PDFs.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-04')
const common = {
  status: 'active',
  brand: 'Arrow',
  series: 'Arrow Gaseous Engines',
  origin: 'United States',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA Nonroad Mobile',
    'U.S. EPA Emergency Standby',
  ],
}

const records = [
  {
    ...common,
    slug: 'arrow-a54e',
    model: 'A54E',
    cylinders: 6,
    configuration: 'L6 Naturally Aspirated',
    displacement_l: 5.4,
    compression_ratio: '8:1',
    power_kw: 53,
    prime_power_kw_60hz: 48,
    standby_power_kw_60hz: 53,
    prime_power_kwe_60hz: 43,
    standby_power_kwe_60hz: 48,
    prime_power_kva_60hz: 53.75,
    standby_power_kva_60hz: 60,
    description:
      'Arrow A54E is a 5.4 L inline-6 naturally aspirated, spark-ignited '
      + 'gaseous engine. Arrow lists 48 kWm prime and 53 kWm standby '
      + 'natural-gas ratings at 1800 RPM, with EPA stationary, nonroad '
      + 'mobile and emergency-standby certification. EPA annual data '
      + 'contains a 62.5 kW maximum certification node for this family.',
  },
  {
    ...common,
    slug: 'arrow-kp6',
    model: 'KP6',
    cylinders: 6,
    configuration: 'L6 Naturally Aspirated',
    displacement_l: 6.5,
    compression_ratio: '9:1',
    power_kw: 70,
    prime_power_kw_60hz: 63,
    standby_power_kw_60hz: 70,
    prime_power_kwe_60hz: 57,
    standby_power_kwe_60hz: 63,
    prime_power_kva_60hz: 71.25,
    standby_power_kva_60hz: 78.75,
    description:
      'Arrow KP6 is a 6.5 L inline-6 naturally aspirated, spark-ignited '
      + 'gaseous engine. Arrow lists 63 kWm prime and 70 kWm standby '
      + 'natural-gas ratings at 1800 RPM, with EPA stationary, nonroad '
      + 'mobile and emergency-standby certification. EPA annual data '
      + 'contains a 79 kW maximum certification node for this family.',
  },
]

const documents = [
  {
    source:
      'https://www.arrowengine.com/literature/engines/a-series/'
      + '232-a54e-spec-sheet',
    storagePath: 'arrow/spec-sheets/a54e.pdf',
    label: 'Arrow A54E Specification Sheet',
    slug: 'arrow-a54e',
  },
  {
    source:
      'https://www.arrowengine.com/literature/engines/kp-series/'
      + '228-kp6-spec-sheet/file',
    storagePath: 'arrow/spec-sheets/kp6.pdf',
    label: 'Arrow KP6 Specification Sheet',
    slug: 'arrow-kp6',
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
  .select('id, slug')
  .in('slug', slugs)
if (existingError) throw existingError
const existingSlugs = new Set(existing.map((engine) => engine.slug))

console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  model: record.model,
  displacement_l: record.displacement_l,
  power_kw: record.power_kw,
})))

if (!apply) {
  console.log(
    `Dry run: ${existing.length} updates, `
    + `${records.length - existing.length} inserts.`,
  )
  process.exit(0)
}

fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
  document.localPath = path.join(tempDir, path.basename(document.storagePath))
  await downloadPdf(document.source, document.localPath)
  console.log(`Validated ${document.label}`)
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

for (const document of documents) {
  const uploaded = await uploadPdf(
    supabase,
    'engine-pdfs',
    document.localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)

  const engineId = engineBySlug.get(document.slug).id
  const { data: existingLink, error: linkReadError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('engine_id', engineId)
    .eq('storage_path', document.storagePath)
    .maybeSingle()
  if (linkReadError) throw linkReadError
  if (!existingLink) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert({
      engine_id: engineId,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(document.localPath).size,
    })
    if (linkError) throw linkError
  }
}

console.log('Saved 2 Arrow EPA SI records and ensured 2 official PDFs.')
