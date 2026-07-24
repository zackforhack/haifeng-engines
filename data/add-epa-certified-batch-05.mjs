// Add verified Liebherr D96/D98 commercial families found in the EPA audit.
// Dry-run by default. Use --apply to upsert engines and attach the official PDF.

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import os from 'os'
import path from 'path'

const apply = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)
const bucket = 'engine-pdfs'
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-05')

const common = {
  brand: 'Liebherr',
  status: 'active',
  fuel_type: 'Diesel/HVO',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
}

const variants = [
  {
    slug: 'liebherr-d9612',
    model: 'D9612',
    series: 'D96 V Series',
    cylinders: 12,
    configuration: 'V12',
    displacement_l: 27,
    rpm_rated: 1800,
    power_kw: 1114,
    emissions_standard:
      'Euro Stage V / U.S. EPA Tier 2 / U.S. EPA Final Tier 4',
    certifications: [
      'EU Stage V',
      'U.S. EPA Tier 2',
      'U.S. EPA Tier 4 Final',
    ],
    origin: 'Switzerland',
  },
  {
    slug: 'liebherr-d9616',
    model: 'D9616',
    series: 'D96 V Series',
    cylinders: 16,
    configuration: 'V16',
    displacement_l: 36,
    rpm_rated: 1800,
    power_kw: 1450,
    emissions_standard: 'U.S. EPA Tier 2 / U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 2', 'U.S. EPA Tier 4 Final'],
    origin: 'Switzerland',
  },
  {
    slug: 'liebherr-d9620',
    model: 'D9620',
    series: 'D96 V Series',
    cylinders: 20,
    configuration: 'V20',
    displacement_l: 45,
    rpm_rated: 1800,
    rpm_max: 2100,
    power_kw: 1910,
    emissions_standard: 'U.S. EPA Tier 2 / U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 2', 'U.S. EPA Tier 4 Final'],
    origin: 'Switzerland',
  },
  {
    slug: 'liebherr-d976',
    model: 'D976',
    series: 'D97 In-line Series',
    cylinders: 6,
    configuration: 'L6',
    displacement_l: 18,
    rpm_rated: 1800,
    rpm_max: 2000,
    power_kw: 850,
    emissions_standard: 'Euro Stage V / U.S. EPA Tier 2',
    certifications: ['EU Stage V', 'U.S. EPA Tier 2'],
    origin: 'Switzerland',
  },
  {
    slug: 'liebherr-d9812',
    model: 'D9812',
    series: 'D98 V Series',
    cylinders: 12,
    configuration: 'V12',
    displacement_l: 62,
    rpm_rated: 1800,
    power_kw: 2700,
    emissions_standard: 'U.S. EPA Tier 2 / U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 2', 'U.S. EPA Tier 4 Final'],
    origin: 'France',
  },
  {
    slug: 'liebherr-d9816',
    model: 'D9816',
    series: 'D98 V Series',
    cylinders: 16,
    configuration: 'V16',
    displacement_l: 82.7,
    rpm_rated: 1800,
    power_kw: 3490,
    emissions_standard: 'U.S. EPA Tier 2 / U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 2', 'U.S. EPA Tier 4 Final'],
    origin: 'France',
  },
  {
    slug: 'liebherr-d9820',
    model: 'D9820',
    series: 'D98 V Series',
    cylinders: 20,
    configuration: 'V20',
    displacement_l: 103.4,
    rpm_rated: 1800,
    power_kw: 4290,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'France',
  },
]

const records = variants.map((record) => ({
  ...common,
  ...record,
  description:
    `Liebherr ${record.model} ${record.displacement_l} L `
    + `${record.configuration} diesel/HVO engine for industrial and power-generation `
    + `applications. Liebherr publishes a maximum mechanical power of `
    + `${record.power_kw.toLocaleString()} kW across its application range. `
    + 'EPA annual certification data lists 1800 RPM constant-speed configurations '
    + 'and supports the U.S. EPA certifications shown. Electrical kWe and kVA depend on the '
    + 'selected generator package and are not inferred here.',
}))

const document = {
  source:
    'https://www.liebherr.com/shared/media/components/documents/'
    + 'combustion-engines/liebherr-combustion-engines-product-line-brochure-en-web.pdf',
  storagePath: 'liebherr/brochures/combustion-engines-product-line.pdf',
  label: 'Liebherr Combustion Engines Product Line',
  type: 'brochure',
}

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

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const slugs = records.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .in('slug', slugs)
if (existingError) throw existingError

const existingBySlug = new Map(existing.map((engine) => [engine.slug, engine]))
console.table(records.map((record) => ({
  action: existingBySlug.has(record.slug) ? 'update' : 'insert',
  slug: record.slug,
  model: record.model,
  rpm: record.rpm_rated,
  power_kw: record.power_kw,
  emissions: record.emissions_standard,
})))

if (!apply) {
  console.log(`\nDry run: ${records.length} qualified Liebherr records.`)
  console.log('Re-run with --apply to upsert records and attach the official brochure.')
  process.exit(0)
}

const { error: upsertError } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
if (upsertError) throw upsertError

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (enginesError) throw enginesError

fs.mkdirSync(tempDir, { recursive: true })
const localPath = path.join(tempDir, path.basename(document.storagePath))
await downloadPdf(document.source, localPath)
const uploaded = await uploadPdf(
  supabase,
  bucket,
  localPath,
  document.storagePath,
)
if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)

const storageDirectory = path.dirname(document.storagePath)
const storageFilename = path.basename(document.storagePath)
const { data: storedFiles, error: storageError } = await supabase.storage
  .from(bucket)
  .list(storageDirectory, { search: storageFilename })
if (storageError) throw storageError
const storedFile = storedFiles.find((file) => file.name === storageFilename)
const storedFileSize = storedFile?.metadata?.size ?? fs.statSync(localPath).size
const engineIds = engines.map((engine) => engine.id)

const { data: linked, error: linkedError } = await supabase
  .from('engine_pdfs')
  .select('engine_id')
  .eq('storage_path', document.storagePath)
  .in('engine_id', engineIds)
if (linkedError) throw linkedError
const linkedIds = new Set(linked.map((row) => row.engine_id))
if (linkedIds.size) {
  const { error: sizeError } = await supabase
    .from('engine_pdfs')
    .update({ file_size_bytes: storedFileSize })
    .eq('storage_path', document.storagePath)
    .in('engine_id', [...linkedIds])
  if (sizeError) throw sizeError
}

const rows = engineIds
  .filter((engineId) => !linkedIds.has(engineId))
  .map((engineId) => ({
    engine_id: engineId,
    type: document.type,
    label: document.label,
    storage_path: document.storagePath,
    file_size_bytes: storedFileSize,
  }))
if (rows.length) {
  const { error: linkError } = await supabase.from('engine_pdfs').insert(rows)
  if (linkError) throw linkError
}

console.log(`Upserted ${records.length} Liebherr engines and linked the official brochure.`)
