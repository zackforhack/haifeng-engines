// Add reviewed Kubota EPA generator variants and correct current Kubota/Yanmar pages.
// Dry-run by default. Use --apply to update Supabase and attach official documents.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-09')

const kubotaCommon = {
  brand: 'Kubota',
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  origin: 'Japan',
}

const kubotaVariants = [
  ['kubota-d1005-e4bg1-sae-2', 'D1005-E4BG1-SAE-2', 'D Series', 3, 'L3', 1.001, 8.7, 9.8, 'Euro Stage V / U.S. EPA Final Tier 4'],
  ['kubota-d1105-e4bg1-sae-2x', 'D1105-E4BG1-SAE-2X', 'D Series', 3, 'L3', 1.123, 10.1, 11.5, 'Euro Stage V / U.S. EPA Final Tier 4'],
  ['kubota-d1305-e4bg1-chn-1', 'D1305-E4BG1-CHN-1', 'D Series', 3, 'L3', 1.261, 11.6, 13.1, 'Euro Stage V / U.S. EPA Final Tier 4'],
  ['kubota-v1505-e4bg1-sae-2x', 'V1505-E4BG1-SAE-2X', 'V Series', 4, 'L4', 1.498, 13.4, 15.1, 'Euro Stage V / U.S. EPA Final Tier 4'],
  ['kubota-d1503-m-e4-bg', 'D1503-M-E4-BG', 'D Series', 3, 'L3', 1.499, 15.1, 16.2, 'U.S. EPA Final Tier 4'],
  ['kubota-d1703-m-e3-bg', 'D1703-M-E3-BG', 'D Series', 3, 'L3', 1.647, 15.1, 18.1, 'U.S. EPA Interim Tier 4'],
  ['kubota-d1803-cr-ti-e4-bg', 'D1803-CR-TI-E4-BG', 'D Series', 3, 'L3 Turbocharged Intercooled', 1.826, 20.2, 24.2, 'U.S. EPA Final Tier 4'],
  ['kubota-v2203-m-e3-bg', 'V2203-M-E3-BG', 'V Series', 4, 'L4', 2.197, 20.2, 24.2, 'U.S. EPA Interim Tier 4'],
  ['kubota-v2403-cr-ti-e4-bg', 'V2403-CR-TI-E4-BG', 'V Series', 4, 'L4 Turbocharged Intercooled', 2.434, 30.6, 33.6, 'U.S. EPA Final Tier 4'],
  ['kubota-v3300-e3-bg', 'V3300-E3-BG', 'V Series', 4, 'L4', 3.318, 30.6, 33.6, 'U.S. EPA Interim Tier 4'],
  ['kubota-v3600-t-e3-bg', 'V3600-T-E3-BG', 'V Series', 4, 'L4 Turbocharged', 3.62, 39.2, 43.1, 'U.S. EPA Interim Tier 4'],
  ['kubota-v3800di-t-e3-bg', 'V3800DI-T-E3-BG', 'V Series', 4, 'L4 Turbocharged', 3.769, 47.5, 52.3, 'U.S. EPA Tier 3'],
]

const kubotaRecords = kubotaVariants.map(([
  slug,
  model,
  series,
  cylinders,
  configuration,
  displacement_l,
  continuousPower,
  standbyPower,
  emissions_standard,
]) => ({
  ...kubotaCommon,
  slug,
  model,
  series,
  cylinders,
  configuration,
  displacement_l,
  power_kw: standbyPower,
  prime_power_kw_60hz: continuousPower,
  standby_power_kw_60hz: standbyPower,
  emissions_standard,
  certifications: emissions_standard.split(' / '),
  description:
    `Kubota ${model} ${displacement_l} L ${configuration} diesel engine for `
    + `generator sets. Kubota publishes ${continuousPower} kWm continuous and `
    + `${standbyPower} kWm standby at 1800 RPM. ${emissions_standard}.`,
}))

const yanmarRecords = [
  {
    slug: 'yanmar-3tnv88f-ug6ge',
    brand: 'Yanmar',
    model: '3TNV88F-UG6GE',
    series: 'TNV F Series',
    status: 'active',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    origin: 'Japan',
    cylinders: 3,
    configuration: 'L3',
    displacement_l: 1.642,
    rpm_rated: 1800,
    power_kw: 15.7,
    standby_power_kw_60hz: 15.7,
    standby_power_kwe_60hz: 14.1,
    standby_power_kva_60hz: 17.6,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Final Tier 4'],
    description:
      'Yanmar 3TNV88F-UG6GE 1.642 L L3 diesel engine for 60 Hz generator sets. '
      + 'At 1800 RPM, the reviewed generator rating is 15.7 kWm / 14.1 kWe '
      + 'standby. U.S. EPA Final Tier 4.',
  },
  {
    slug: 'yanmar-4tnv98c-gge',
    brand: 'Yanmar',
    model: '4TNV98C-GGE',
    series: 'TNV Common Rail Series',
    status: 'active',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    origin: 'Japan',
    cylinders: 4,
    configuration: 'L4',
    displacement_l: 3.319,
    rpm_rated: 1800,
    power_kw: 41.6,
    prime_power_kw_60hz: 37.7,
    prime_power_kwe_60hz: 34.1,
    prime_power_kva_60hz: 42.6,
    standby_power_kw_60hz: 41.6,
    standby_power_kwe_60hz: 37.5,
    standby_power_kva_60hz: 46.9,
    emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
    certifications: ['Euro Stage V', 'U.S. EPA Final Tier 4'],
    description:
      'Yanmar 4TNV98C-GGE 3.319 L naturally aspirated common-rail diesel engine '
      + 'for generator sets. At 1800 RPM, Yanmar publishes 34.1 kWe prime and '
      + '37.5 kWe standby. Euro Stage V and U.S. EPA Final Tier 4.',
  },
  {
    slug: 'yanmar-4tnv98ct-gge',
    brand: 'Yanmar',
    model: '4TNV98CT-GGE',
    series: 'TNV Common Rail Series',
    status: 'active',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    origin: 'Japan',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 3.319,
    rpm_rated: 1800,
    power_kw: 51,
    standby_power_kw_60hz: 51,
    standby_power_kwe_60hz: 45.9,
    standby_power_kva_60hz: 57.4,
    emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
    certifications: ['Euro Stage V', 'U.S. EPA Final Tier 4'],
    description:
      'Yanmar 4TNV98CT-GGE 3.319 L turbocharged common-rail diesel engine for '
      + '60 Hz generator sets. The reviewed standby rating is 51 kWm / 45.9 kWe '
      + 'at 1800 RPM. Euro Stage V and U.S. EPA Final Tier 4.',
  },
]

const records = [...kubotaRecords, ...yanmarRecords]
const documents = [
  {
    source: 'https://engine.kubota.com/en/products/img/bg_10032017.pdf',
    storagePath: 'kubota/brochures/kubota-bg-engine-catalog.pdf',
    label: 'Kubota BG Generator Engine Catalog',
    type: 'brochure',
    slugs: kubotaRecords.map((record) => record.slug),
  },
  {
    source:
      'https://www.yanmar.com/media/news/2020/08/18043449/product_guide.pdf',
    storagePath: 'yanmar/brochures/yanmar-industrial-engine-product-guide.pdf',
    label: 'Yanmar Industrial Engine Product Guide',
    type: 'brochure',
    slugs: yanmarRecords.map((record) => record.slug),
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

const existingSlugs = new Set(existing.map((engine) => engine.slug))
console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  slug: record.slug,
  model: record.model,
  displacement_l: record.displacement_l,
  standby_kwm_60hz: record.standby_power_kw_60hz,
  emissions: record.emissions_standard,
})))

if (!apply) {
  console.log(
    `\nDry run: ${existing.length} records will be updated and `
    + `${records.length - existing.length} records will be inserted.`,
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

  const engineIds = document.slugs.map((slug) => engineBySlug.get(slug).id)
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
      file_size_bytes: fs.statSync(localPath).size,
    }))
  if (links.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
    if (linkError) throw linkError
  }
}

console.log(
  `Saved ${records.length} records and ensured ${documents.length} official document sets.`,
)
