// Add the manufacturer-verified Rehlko KSD 1403 family found during the EPA audit.
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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-03')

const common = {
  brand: 'Kohler',
  series: 'KSD Series',
  status: 'active',
  year_introduced: 2023,
  fuel_type: 'Diesel/HVO',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  cylinders: 3,
  configuration: 'L3',
  displacement_l: 1.391,
  emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
  certifications: [
    'EU Stage V',
    'U.S. EPA Tier 4 Final',
    'CARB',
  ],
  origin: 'Italy',
}

const records = [
  {
    ...common,
    slug: 'kohler-ksd1403na',
    model: 'KSD1403NA',
    certifications: [...common.certifications, 'China IV'],
    rpm_rated: 2200,
    rpm_max: 3000,
    weight_kg: 121,
    length_mm: 482,
    width_mm: 418,
    height_mm: 552,
    power_kw: 18.9,
    description:
      'Rehlko/Kohler KSD1403NA 1.391 L naturally aspirated inline-3 diesel '
      + 'engine with electronically managed indirect common-rail injection. '
      + 'Rehlko publishes 18.9 kW Stage V output and 18.4 kW Tier 4 Final '
      + 'output at 3000 RPM. EPA annual certification data separately lists '
      + 'the KSD-NATG 1403/18 generator trim at 17 kW and 1800 RPM; no '
      + 'generator electrical output is inferred from that mechanical rating.',
  },
  {
    ...common,
    slug: 'kohler-ksd1403tc',
    model: 'KSD1403TC',
    certifications: [...common.certifications, 'China IV'],
    rpm_rated: 1800,
    rpm_max: 3000,
    weight_kg: 127,
    length_mm: 482,
    width_mm: 445,
    height_mm: 600,
    power_kw: 18.9,
    description:
      'Rehlko/Kohler KSD1403TC 1.391 L turbocharged inline-3 diesel engine '
      + 'with electronically managed indirect common-rail injection. Rehlko '
      + 'publishes 18.9 kW Stage V and 18.4 kW Tier 4 Final maximum output, '
      + 'with constant-speed operation available from 1800 RPM. Generator '
      + 'electrical ratings depend on the selected package and alternator.',
  },
  {
    ...common,
    slug: 'kohler-ksd1403tca',
    model: 'KSD1403TCA',
    rpm_rated: 1800,
    rpm_max: 3000,
    weight_kg: 126,
    length_mm: 482,
    width_mm: 445,
    height_mm: 600,
    power_kw: 18.9,
    description:
      'Rehlko/Kohler KSD1403TCA 1.391 L turbocharged and aftercooled inline-3 '
      + 'diesel engine with electronically managed indirect common-rail '
      + 'injection. Rehlko publishes 18.9 kW Stage V and 18.4 kW Tier 4 Final '
      + 'maximum output, with constant-speed operation available from 1800 RPM. '
      + 'Generator electrical ratings depend on the selected package and alternator.',
  },
]

const document = {
  source:
    'https://techcomm.rehlko.com/$web/techcomm/pdf/REHLKO_KSD_1403_rev.04_07_26_web.pdf',
  storagePath: 'kohler/ksd-1403-series-diesel-engine-datasheet.pdf',
  label: 'Rehlko KSD 1403 Series Diesel Engine Datasheet',
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
  rpm: `${record.rpm_rated}-${record.rpm_max}`,
  power_kw: record.power_kw,
  emissions: record.emissions_standard,
})))

if (!apply) {
  console.log(`\nDry run: ${records.length} qualified Rehlko KSD records.`)
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

console.log(`Upserted ${records.length} KSD engines and linked the official datasheet to each.`)
