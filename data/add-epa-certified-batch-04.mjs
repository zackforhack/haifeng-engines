// Add the manufacturer-verified MTU 12V1600 Gx1 60 Hz range found in the EPA audit.
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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-04')

const common = {
  brand: 'MTU',
  series: 'Series 1600 Gx1',
  status: 'active',
  year_introduced: 2024,
  fuel_type: 'Diesel/HVO',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  cylinders: 12,
  configuration: 'V12',
  displacement_l: 22.444,
  rpm_rated: 1800,
  emissions_standard: 'U.S. EPA Tier 2',
  certifications: ['U.S. EPA Tier 2'],
  origin: 'Germany',
}

const variants = [
  ['G01S', 664, 'data center continuous'],
  ['G11S', 712, 'data center continuous'],
  ['G21S', 760, 'data center continuous'],
  ['G31S', 809, 'data center continuous'],
  ['G41S', 905, 'data center continuous'],
  ['G51S', 730, 'standby'],
  ['G61S', 783, 'standby'],
  ['G71S', 836, 'standby'],
  ['G81S', 890, 'standby'],
  ['G91S', 996, 'standby'],
]

const records = variants.map(([suffix, grossPowerKw, application]) => {
  const model = `12V1600 ${suffix}`
  const slug = `mtu-${model.toLowerCase().replaceAll(' ', '')}`
  const ratingField = application === 'standby'
    ? { standby_power_kw_60hz: grossPowerKw }
    : { prime_power_kw_60hz: grossPowerKw }
  return {
    ...common,
    ...ratingField,
    slug,
    model,
    power_kw: grossPowerKw,
    description:
      `MTU ${model} 22.4 L V12 diesel/HVO gendrive engine with a 126 x 150 mm `
      + 'bore and stroke, rated at '
      + `${grossPowerKw} kWm gross mechanical power at 1800 RPM for 60 Hz `
      + `${application} service. MTU lists the Series 1600 Gx1 with an EPA `
      + 'Tier 2 calibration. Electrical kWe and kVA depend on the selected '
      + 'generator package and alternator and are not inferred here.',
  }
})

const document = {
  source:
    'https://www.mtu-solutions.com/content/dam/mtu/download/applications/'
    + 'power-generation/gen-drice-engine-series-1600/'
    + '16120981_Flyer_Gendrive1600GX1.pdf/_jcr_content/renditions/'
    + 'original.media_file.download_attachment.file/16120981_Flyer_Gendrive1600GX1.pdf',
  storagePath: 'mtu/series-1600-gx1-gendrive-flyer.pdf',
  label: 'MTU Series 1600 Gx1 Gendrive Datasheet',
  type: 'datasheet',
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
  console.log(`\nDry run: ${records.length} qualified MTU Series 1600 Gx1 records.`)
  console.log('Re-run with --apply to upsert records and attach the official datasheet.')
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

console.log(`Upserted ${records.length} MTU engines and linked the official datasheet to each.`)
