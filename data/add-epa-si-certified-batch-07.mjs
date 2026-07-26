// Add the official KEM stationary 5.7 L natural-gas engine and documents.
// Dry-run by default. Use --apply to update Supabase.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-07')

const records = [
  {
    slug: 'kem-stationary-5-7l',
    brand: 'KEM',
    model: 'Stationary 5.7L',
    series: 'Industrial Stationary',
    status: 'active',
    origin: 'United States',
    fuel_type: 'Natural Gas',
    ignition_type: 'Spark Ignition',
    cooling_method: 'Liquid-Cooled',
    cylinders: 8,
    configuration: 'V8 Naturally Aspirated',
    displacement_l: 5.736,
    compression_ratio: '9.4:1',
    rpm_rated: 1800,
    power_kw: 79.8,
    power_hp: 107,
    weight_kg: 197,
    length_mm: 747,
    width_mm: 510,
    height_mm: 559,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: [
      'U.S. EPA Stationary',
      'U.S. EPA NSPS Subpart JJJJ',
      'CARB',
    ],
    description:
      'KEM Stationary 5.7L is a naturally aspirated 5.736 L V8 '
      + 'spark-ignited industrial engine offered for natural gas, '
      + 'including generator applications. KEM publishes 107 bhp '
      + '(79.8 kWm) continuous and 130 bhp (96.9 kWm) intermittent '
      + 'output at 1800 RPM and identifies EPA- and CARB-certified '
      + 'packages as available. EPA family AKEMB05.7EN0 records a '
      + 'matching 5.7 L V8 stationary certification configuration.',
  },
]

const documents = [
  {
    source:
      'https://kemequipment.com/PDFs/'
      + 'PC10567-5.7L-4.3L-Stationary-MEFI-6-REV-A.pdf',
    storagePath: 'kem/manuals/kem-5-7l-stationary-mefi-6.pdf',
    label: 'KEM 5.7L Stationary LPG/CNG Operations Manual',
  },
  {
    source:
      'https://kemequipment.com/PDFs/'
      + 'powercurve-industrial-stationary-57L-ng.pdf',
    storagePath: 'kem/spec-sheets/kem-5-7l-natural-gas-power-curve.pdf',
    label: 'KEM 5.7L Natural Gas Power Curve',
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
  brand: record.brand,
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

const engine = saved[0]
for (const document of documents) {
  const uploaded = await uploadPdf(
    supabase,
    'engine-pdfs',
    document.localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)
  const { data: linked, error: linkedError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('storage_path', document.storagePath)
    .eq('engine_id', engine.id)
  if (linkedError) throw linkedError
  if (!linked.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(document.localPath).size,
    })
    if (linkError) throw linkError
  }
}

console.log('Saved the KEM EPA SI record and ensured two official documents.')
