// Add manufacturer-verified Rehlko/Kohler and Caterpillar models from the EPA audit.
// Dry-run by default. Use --apply to upsert engines and attach official PDFs.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-02')

const records = [
  {
    slug: 'kohler-kdi1903m',
    brand: 'Kohler',
    model: 'KDI1903M',
    series: 'KDI Mechanical',
    status: 'active',
    year_introduced: 2014,
    fuel_type: 'Diesel/HVO',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800,
    cylinders: 3,
    configuration: 'L3',
    displacement_l: 1.861,
    compression_ratio: '18:1',
    power_kw: 21,
    prime_power_kwe_60hz: 15,
    prime_power_kva_60hz: 18.8,
    standby_power_kwe_60hz: 17,
    standby_power_kva_60hz: 21.3,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final', 'EPA Stationary Emergency'],
    origin: 'Italy',
    description:
      'Rehlko/Kohler KDI1903M 1.861 L naturally aspirated inline-3 diesel engine for '
      + '60 Hz stationary emergency generator sets. The official 15REOZK specification '
      + 'publishes up to 15 kWe prime and 17 kWe standby at 1800 RPM. EPA annual '
      + 'certification data identifies current Tier 4 Final KDI1903M families.',
  },
  {
    slug: 'kohler-kdi2504esm',
    brand: 'Kohler',
    model: 'KDI2504ESM',
    series: 'KDI Mechanical',
    status: 'active',
    year_introduced: 2014,
    fuel_type: 'Diesel/HVO',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800,
    cylinders: 4,
    configuration: 'L4',
    displacement_l: 2.482,
    compression_ratio: '18:1',
    power_kw: 29.5,
    prime_power_kwe_60hz: 21,
    prime_power_kva_60hz: 26.3,
    standby_power_kwe_60hz: 24,
    standby_power_kva_60hz: 30,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final', 'EPA Stationary Emergency'],
    origin: 'Italy',
    description:
      'Rehlko/Kohler KDI2504ESM 2.482 L naturally aspirated inline-4 diesel engine '
      + 'for 60 Hz stationary emergency generator sets. The official 20REOZK '
      + 'specification publishes up to 21 kWe prime and 24 kWe standby at 1800 RPM. '
      + 'EPA annual data includes current Tier 4 Final families; older certification '
      + 'families must not be assumed to share the same emissions configuration.',
  },
  {
    slug: 'kohler-kdi2504tm',
    brand: 'Kohler',
    model: 'KDI2504TM',
    series: 'KDI Mechanical',
    status: 'active',
    year_introduced: 2014,
    fuel_type: 'Diesel/HVO',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800,
    cylinders: 4,
    configuration: 'L4',
    displacement_l: 2.482,
    compression_ratio: '18:1',
    weight_kg: 300,
    power_kw: 36.4,
    prime_power_kwe_60hz: 28,
    prime_power_kva_60hz: 35,
    standby_power_kwe_60hz: 31,
    standby_power_kva_60hz: 39,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2', 'EPA Stationary Emergency'],
    origin: 'Italy',
    description:
      'Rehlko/Kohler KDI2504TM 2.482 L turbocharged inline-4 diesel engine for '
      + '60 Hz stationary emergency generator sets. The official 30REOZK specification '
      + 'publishes up to 28 kWe prime and 31 kWe standby at 1800 RPM. EPA certification '
      + 'records use slash-suffixed trims such as KDI 2504TM/G18 for this base engine.',
  },
  {
    slug: 'kohler-kdi3404tm',
    brand: 'Kohler',
    model: 'KDI3404TM',
    series: 'KDI Mechanical',
    status: 'active',
    year_introduced: 2014,
    fuel_type: 'Diesel/HVO',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800,
    cylinders: 4,
    configuration: 'L4',
    displacement_l: 3.4,
    compression_ratio: '18.5:1',
    power_kw: 70,
    prime_power_kwe_60hz: 54,
    prime_power_kva_60hz: 67,
    standby_power_kwe_60hz: 60,
    standby_power_kva_60hz: 75,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3', 'EPA Stationary Emergency'],
    origin: 'Italy',
    description:
      'Rehlko/Kohler KDI3404TM 3.4 L turbocharged inline-4 diesel engine for '
      + '49-state 60 Hz stationary emergency generator sets. The official 60REOZK '
      + 'specification publishes up to 54 kWe prime and 60 kWe standby at 1800 RPM. '
      + 'EPA records use G18, G18A and G18B certification trims of this Tier 3 base engine.',
  },
  {
    slug: 'caterpillar-c32b',
    brand: 'Caterpillar',
    model: 'C32B',
    series: 'C-Series High-Speed Industrial',
    status: 'active',
    year_introduced: 2025,
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800,
    cylinders: 12,
    configuration: 'V12',
    displacement_l: 32.1,
    compression_ratio: '15.0:1',
    weight_kg: 3055,
    length_mm: 1874,
    width_mm: 1600,
    height_mm: 1370,
    power_kw: 895,
    emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
    certifications: ['EU Stage V', 'U.S. EPA Tier 4 Final'],
    origin: 'United States',
    description:
      'Caterpillar C32B 32.1 L twin-turbocharged aftercooled V12 industrial diesel '
      + 'engine rated up to 895 kW at 1800 RPM for U.S. EPA Tier 4 Final and up to '
      + '839 kW for EU Stage V. Cat specifies maintenance-free DOC aftertreatment. '
      + 'Generator-set electrical output depends on the selected package and is not '
      + 'inferred from the industrial mechanical rating.',
  },
]

const documents = [
  {
    source: 'https://techcomm.rehlko.com/techcomm/pdf/g5434.pdf',
    storagePath: 'kohler/kdi1903m-15reozk-specification.pdf',
    label: 'Rehlko 15REOZK / KDI1903M Specification',
    type: 'datasheet',
    slugs: ['kohler-kdi1903m'],
  },
  {
    source: 'https://techcomm.rehlko.com/techcomm/pdf/g5435.pdf',
    storagePath: 'kohler/kdi2504esm-20reozk-specification.pdf',
    label: 'Rehlko 20REOZK / KDI2504ESM Specification',
    type: 'datasheet',
    slugs: ['kohler-kdi2504esm'],
  },
  {
    source: 'https://techcomm.rehlko.com/techcomm/pdf/g5436.pdf',
    storagePath: 'kohler/kdi2504tm-30reozk-specification.pdf',
    label: 'Rehlko 30REOZK / KDI2504TM Specification',
    type: 'datasheet',
    slugs: ['kohler-kdi2504tm'],
  },
  {
    source: 'https://techcomm.rehlko.com/techcomm/pdf/tp6970.pdf',
    storagePath: 'kohler/kdi2504tm-owner-manual.pdf',
    label: 'Rehlko KDI2504TM Owner Manual',
    type: 'manual',
    slugs: ['kohler-kdi2504tm'],
  },
  {
    source: 'https://techcomm.rehlko.com/techcomm/pdf/g5439.pdf',
    storagePath: 'kohler/kdi3404tm-60reozk-specification.pdf',
    label: 'Rehlko 60REOZK / KDI3404TM Specification',
    type: 'datasheet',
    slugs: ['kohler-kdi3404tm'],
  },
  {
    source: 'https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE20248-',
    storagePath: 'caterpillar/c32b-generator-application-brochure.pdf',
    label: 'Cat C32B Generator Set Application Brochure',
    type: 'brochure',
    slugs: ['caterpillar-c32b'],
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
  emissions: record.emissions_standard,
})))

if (!apply) {
  console.log(`\nDry run: ${records.length} qualified EPA-certified records.`)
  console.log('Re-run with --apply to upsert records and attach official documents.')
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
const enginesBySlug = new Map(engines.map((engine) => [engine.slug, engine]))

fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
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

  const engineIds = document.slugs.map((slug) => {
    const engine = enginesBySlug.get(slug)
    if (!engine) throw new Error(`Missing engine after upsert: ${slug}`)
    return engine.id
  })
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
}

console.log(`Upserted ${records.length} EPA-certified engines and linked ${documents.length} official documents.`)
