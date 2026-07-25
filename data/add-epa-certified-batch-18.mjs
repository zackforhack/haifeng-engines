// Add the 2023 constant-speed EPA review tier.
// Dry-run by default. Use --apply to update Supabase and attach official PDFs.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-18')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const common = {
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
}

const records = [
  {
    slug: 'cummins-qsf28',
    brand: 'Cummins',
    model: 'QSF2.8',
    series: 'QSF Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 2.776,
    power_kw: 54,
    emissions_standard: 'U.S. EPA Final Tier 4 / Euro Stage IV',
    certifications: ['U.S. EPA Tier 4 Final', 'Euro Stage IV'],
    origin: 'United States',
    description:
      'Cummins QSF2.8 2.776 L inline-4 turbocharged diesel engine. '
      + 'EPA annual certification records list 54 kWm at 1800 RPM from 2020 through 2023. '
      + 'Cummins identifies the QSF2.8 as U.S. EPA Tier 4 Final and Euro Stage IV.',
  },
  {
    slug: 'cummins-qsk23-g5',
    brand: 'Cummins',
    model: 'QSK23-G5',
    series: 'QSK23 Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Intercooled',
    displacement_l: 23.152,
    power_kw: 746,
    prime_power_kw_60hz: 656,
    prime_power_kwe_60hz: 592,
    prime_power_kva_60hz: 740,
    standby_power_kw_60hz: 746,
    standby_power_kwe_60hz: 670,
    standby_power_kva_60hz: 838,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'United States',
    description:
      'Cummins QSK23-G5 23.152 L inline-6 turbocharged and charge-air-cooled '
      + 'diesel generator engine. Cummins publishes 656 kWm prime and 746 kWm '
      + 'standby at 1800 RPM, with typical outputs of 592 and 670 kWe. U.S. EPA Tier 2.',
  },
  {
    slug: 'cummins-qsk23-g5-nr2',
    brand: 'Cummins',
    model: 'QSK23-G5 NR2',
    series: 'QSK23 Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Intercooled',
    displacement_l: 23.152,
    power_kw: 746,
    prime_power_kw_60hz: 656,
    prime_power_kwe_60hz: 592,
    prime_power_kva_60hz: 740,
    standby_power_kw_60hz: 746,
    standby_power_kwe_60hz: 670,
    standby_power_kva_60hz: 838,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'United States',
    description:
      'Cummins QSK23-G5 NR2 is the EPA certification-name variant of the '
      + '23.152 L QSK23-G5 generator engine. EPA records list 746 kWm at '
      + '1800 RPM under Tier 2; the Cummins G5 rating sheet publishes 656 kWm '
      + 'prime and 746 kWm standby.',
  },
  {
    slug: 'cummins-qsk23-g6-nr2',
    brand: 'Cummins',
    model: 'QSK23-G6 NR2',
    series: 'QSK23 Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Intercooled',
    displacement_l: 23.152,
    power_kw: 854,
    prime_power_kw_60hz: 768,
    prime_power_kwe_60hz: 698,
    prime_power_kva_60hz: 872,
    standby_power_kw_60hz: 854,
    standby_power_kwe_60hz: 771,
    standby_power_kva_60hz: 963,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'United States',
    description:
      'Cummins QSK23-G6 NR2 is the EPA certification-name variant of the '
      + '23.152 L QSK23-G6 generator engine. Cummins publishes 768 kWm prime '
      + 'and 854 kWm standby at 1800 RPM, with typical outputs of 698 and '
      + '771 kWe. U.S. EPA Tier 2.',
  },
  {
    slug: 'cummins-qst30-c',
    brand: 'Cummins',
    model: 'QST30-C',
    series: 'QST30 Series',
    cylinders: 12,
    configuration: 'V12 Turbocharged Aftercooled',
    displacement_l: 30.48,
    power_kw: 783,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'United States',
    description:
      'Cummins QST30-C 30.48 L V12 turbocharged and aftercooled diesel engine. '
      + 'EPA annual certification records list constant-speed configurations '
      + 'from 634 to 783 kWm at 1800 RPM under Tier 2.',
  },
  {
    slug: 'kubota-v2403-cr-nt-bg-ew',
    brand: 'Kubota',
    model: 'V2403-CR-NT-BG-EW',
    series: 'V2403 Series',
    cylinders: 4,
    configuration: 'L4 Common-Rail',
    displacement_l: 2.435,
    power_kw: 36,
    emissions_standard: 'U.S. EPA Final Tier 4 / Euro Stage V',
    certifications: ['U.S. EPA Tier 4 Final', 'Euro Stage V'],
    origin: 'Japan',
    description:
      'Kubota V2403-CR-NT-BG-EW 2.435 L inline-4 common-rail diesel engine. '
      + 'EPA annual certification records list 36 kWm at 1800 RPM under Tier 4 Final. '
      + 'Kubota identifies this EW configuration as the Stage V generator model.',
  },
  {
    slug: 'kubota-v2403-cr-t-bg-ef',
    brand: 'Kubota',
    model: 'V2403-CR-T-BG-EF',
    series: 'V2403 Series',
    cylinders: 4,
    configuration: 'L4 Common-Rail Turbocharged',
    displacement_l: 2.435,
    power_kw: 36,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    origin: 'Japan',
    description:
      'Kubota V2403-CR-T-BG-EF 2.435 L inline-4 common-rail turbocharged '
      + 'diesel engine. EPA annual certification records list 36 kWm at '
      + '1800 RPM under Tier 4 Final, and Kubota lists the exact EF model '
      + 'in its official emissions certificate lookup.',
  },
  {
    slug: 'kubota-v3800-cr-nt-bg-ew',
    brand: 'Kubota',
    model: 'V3800-CR-NT-BG-EW',
    series: 'V3800 Series',
    cylinders: 4,
    configuration: 'L4 Common-Rail',
    displacement_l: 3.77,
    power_kw: 55,
    emissions_standard: 'U.S. EPA Final Tier 4 / Euro Stage V',
    certifications: ['U.S. EPA Tier 4 Final', 'Euro Stage V'],
    origin: 'Japan',
    description:
      'Kubota V3800-CR-NT-BG-EW 3.77 L inline-4 common-rail diesel engine. '
      + 'EPA annual certification records list 55 kWm at 1800 RPM under Tier 4 Final. '
      + 'Kubota identifies this EW configuration as the Stage V generator model.',
  },
].map((record) => ({ ...common, ...record }))

const downloadableDocuments = [
  {
    source: 'https://mart.cummins.com/imagelibrary/data/assetfiles/0070411.pdf',
    storagePath: 'cummins/brochures/qsf2.8-tier-4-final.pdf',
    label: 'Cummins QSF2.8 Tier 4 Final Brochure',
    type: 'brochure',
    slugs: ['cummins-qsf28'],
  },
  {
    source: 'https://mart.cummins.com/imagelibrary/data/assetfiles/0070595.pdf',
    storagePath: 'cummins/spec-sheets/qsk23-g5-60hz-epa-tier-2.pdf',
    label: 'Cummins QSK23-G5 60 Hz EPA Tier 2 Specification Sheet',
    type: 'datasheet',
    slugs: ['cummins-qsk23-g5', 'cummins-qsk23-g5-nr2'],
  },
  {
    source: 'https://mart.cummins.com/imagelibrary/data/assetfiles/0070596.pdf',
    storagePath: 'cummins/spec-sheets/qsk23-g6-60hz-epa-tier-2.pdf',
    label: 'Cummins QSK23-G6 60 Hz EPA Tier 2 Specification Sheet',
    type: 'datasheet',
    slugs: ['cummins-qsk23-g6-nr2'],
  },
]

const storedDocuments = [
  {
    storagePath: 'kubota/brochures/kubota-bg-engine-catalog.pdf',
    label: 'Kubota BG Generator Engine Catalog',
    type: 'brochure',
    slugs: records
      .filter((record) => record.brand === 'Kubota')
      .map((record) => record.slug),
  },
]

async function downloadPdf(source, destination) {
  const response = await fetch(source, {
    headers: { 'User-Agent': 'Mozilla/5.0 HaifengEngineDatabase/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(120000),
  })
  if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${source}: response is not a PDF`)
  }
  fs.writeFileSync(destination, buffer)
}

async function linkDocument(document, engineBySlug, fileSize) {
  const engineIds = document.slugs.map((slug) => {
    const engine = engineBySlug.get(slug)
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
  const links = engineIds
    .filter((engineId) => !linkedIds.has(engineId))
    .map((engineId) => ({
      engine_id: engineId,
      type: document.type,
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fileSize,
    }))
  if (links.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
    if (linkError) throw linkError
  }
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
  certified_kwm: record.power_kw,
  emissions: record.emissions_standard,
})))

if (!apply) {
  console.log(
    `\nDry run: ${existing.length} records will be updated and `
    + `${records.length - existing.length} records will be inserted.`,
  )
  console.log(
    `${downloadableDocuments.length} official PDFs will be uploaded; `
    + `${storedDocuments.length} stored document will be reused.`,
  )
  process.exit(0)
}

const { error: upsertError } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
if (upsertError) throw upsertError

const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (savedError) throw savedError
if (saved.length !== records.length) {
  throw new Error(`Expected ${records.length} saved records; found ${saved.length}`)
}
const engineBySlug = new Map(saved.map((engine) => [engine.slug, engine]))

fs.mkdirSync(tempDir, { recursive: true })
for (const document of downloadableDocuments) {
  const localPath = path.join(tempDir, path.basename(document.storagePath))
  await downloadPdf(document.source, localPath)
  const uploaded = await uploadPdf(
    supabase,
    bucket,
    localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)
  await linkDocument(document, engineBySlug, fs.statSync(localPath).size)
}

for (const document of storedDocuments) {
  const { data: existingFile, error: existingFileError } = await supabase
    .from('engine_pdfs')
    .select('file_size_bytes')
    .eq('storage_path', document.storagePath)
    .limit(1)
    .maybeSingle()
  if (existingFileError) throw existingFileError
  if (!existingFile) {
    throw new Error(`Stored document not found: ${document.storagePath}`)
  }
  await linkDocument(document, engineBySlug, existingFile.file_size_bytes)
}

console.log(
  `Saved ${records.length} exact EPA records and ensured `
  + `${downloadableDocuments.length + storedDocuments.length} official document sets.`,
)
