// Add the first manufacturer-verified models from the EPA 1800 RPM audit.
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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-01')

const records = [
  {
    slug: 'hatz-3h50ticd',
    brand: 'Hatz',
    model: '3H50TICD',
    series: 'H50 Series',
    status: 'active',
    year_introduced: 2020,
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800,
    cylinders: 3,
    configuration: 'L3',
    displacement_l: 1.464,
    compression_ratio: '17.5:1',
    standby_power_kw_50hz: 25.5,
    standby_power_kw_60hz: 31.3,
    power_kw: 31.3,
    emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
    certifications: ['EU Stage V', 'U.S. EPA Tier 4 Final'],
    origin: 'Germany',
    description:
      'Hatz 3H50TICD 1.464 L inline-3 diesel engine with cooled EGR, DOC and DPF aftertreatment. '
      + 'The official Hatz H-Series datasheet publishes constant-speed ISO fuel-stop output of '
      + '25.5 kWm at 1500 RPM and 31.3 kWm at 1800 RPM. EPA certification data lists the model '
      + 'at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'hatz-4h50ticd',
    brand: 'Hatz',
    model: '4H50TICD',
    series: 'H50 Series',
    status: 'active',
    year_introduced: 2020,
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800,
    cylinders: 4,
    configuration: 'L4',
    displacement_l: 1.952,
    compression_ratio: '17.5:1',
    standby_power_kw_50hz: 35,
    standby_power_kw_60hz: 41,
    power_kw: 41,
    emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
    certifications: ['EU Stage V', 'U.S. EPA Tier 4 Final'],
    origin: 'Germany',
    description:
      'Hatz 4H50TICD 1.952 L inline-4 diesel engine with cooled EGR, DOC and DPF aftertreatment. '
      + 'The official Hatz H-Series datasheet publishes constant-speed ISO fuel-stop output of '
      + '35.0 kWm at 1500 RPM and 41.0 kWm at 1800 RPM. EPA certification data lists the model '
      + 'at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'volvo-penta-twd1643ge',
    brand: 'Volvo Penta',
    model: 'TWD1643GE',
    series: '16 Litre Series',
    status: 'active',
    year_introduced: 2006,
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500,
    cylinders: 6,
    configuration: 'L6',
    displacement_l: 16.1,
    weight_kg: 1700,
    prime_power_kva_50hz: 630,
    standby_power_kwe_60hz: 605,
    power_kw: 674,
    emissions_standard: 'U.S. EPA Tier 2 / Euro Stage II',
    certifications: ['U.S. EPA Tier 2', 'EU Stage II'],
    origin: 'Sweden',
    description:
      'Volvo Penta TWD1643GE 16.1 L inline-6 dual-speed diesel generator engine. Volvo Penta '
      + 'publishes 630 kVA prime output at 50 Hz and 605 kWe standby output at 60 Hz, with '
      + 'operation at both 1500 and 1800 RPM. EPA certification data lists 674 kW mechanical '
      + 'output at 1800 RPM under Tier 2.',
  },
  {
    slug: 'caterpillar-c9-3b',
    brand: 'Caterpillar',
    model: 'C9.3B',
    series: 'C-Series High-Speed Industrial',
    status: 'active',
    year_introduced: 2019,
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800,
    rpm_max: 2200,
    cylinders: 6,
    configuration: 'L6',
    displacement_l: 9.3,
    compression_ratio: '17.0:1',
    weight_kg: 865,
    length_mm: 1125,
    width_mm: 791,
    height_mm: 1068,
    power_kw: 340,
    emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
    certifications: ['EU Stage V', 'U.S. EPA Tier 4 Final'],
    origin: 'United States',
    description:
      'Caterpillar C9.3B 9.3 L inline-6 high-speed industrial diesel engine rated from '
      + '250 to 340 kW at 1800-2200 RPM. Cat documents DOC, DPF and SCR aftertreatment and '
      + 'EU Stage V / U.S. EPA Tier 4 Final compliance. EPA data confirms constant-speed '
      + '1800 RPM configurations; generator-package electrical output must be engineered separately.',
  },
  {
    slug: 'caterpillar-c13b',
    brand: 'Caterpillar',
    model: 'C13B',
    series: 'C-Series High-Speed Industrial',
    status: 'active',
    year_introduced: 2020,
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800,
    rpm_max: 2100,
    cylinders: 6,
    configuration: 'L6',
    displacement_l: 12.5,
    compression_ratio: '15.8:1',
    weight_kg: 1125,
    length_mm: 1274,
    width_mm: 994,
    height_mm: 1134,
    power_kw: 430,
    emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
    certifications: ['EU Stage V', 'U.S. EPA Tier 4 Final'],
    origin: 'United States',
    description:
      'Caterpillar C13B 12.5 L inline-6 high-speed industrial diesel engine rated from '
      + '340 to 430 kW at 1800-2100 RPM. Cat documents DOC, DPF and SCR aftertreatment and '
      + 'EU Stage V / U.S. EPA Tier 4 Final compliance. EPA data confirms constant-speed '
      + '1800 RPM configurations; generator-package electrical output must be engineered separately.',
  },
]

const documents = [
  {
    source:
      'https://www.hatz.com/images/downloads/downloadcenter/datasheets/Hatz_data_sheet_H-series_2022-10_en_70257173.pdf',
    storagePath: 'hatz/h-series-3h50ticd-4h50ticd-datasheet.pdf',
    label: 'Hatz H-Series 3H50TICD / 4H50TICD Datasheet',
    type: 'datasheet',
    slugs: ['hatz-3h50ticd', 'hatz-4h50ticd'],
  },
  {
    source:
      'https://www.volvopenta.com/-/media/volvopenta/home/pdfs-with-external-links-to-them/d16-power-gen-eng.pdf?v=nQpRPw',
    storagePath: 'volvo/d16-power-generation-engine-brochure.pdf',
    label: 'Volvo Penta D16 Power Generation Engine Brochure',
    type: 'brochure',
    slugs: ['volvo-penta-twd1643ge'],
  },
  {
    source:
      'https://emc.cat.com/n/api/pubdirect?media_string_id=MSS-IND-1000022860-004.pdf',
    storagePath: 'caterpillar/c9-3b-industrial-diesel-engine.pdf',
    label: 'Cat C9.3B Industrial Diesel Engine Datasheet',
    type: 'datasheet',
    slugs: ['caterpillar-c9-3b'],
  },
  {
    source:
      'https://emc.cat.com/pubdirect.ashx?media_string_id=LEHH0599-00.pdf',
    storagePath: 'caterpillar/c13b-industrial-diesel-engine.pdf',
    label: 'Cat C13B Industrial Diesel Engine Datasheet',
    type: 'datasheet',
    slugs: ['caterpillar-c13b'],
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
  const rows = engineIds
    .filter((engineId) => !linkedIds.has(engineId))
    .map((engineId) => ({
      engine_id: engineId,
      type: document.type,
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(localPath).size,
    }))
  if (rows.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(rows)
    if (linkError) throw linkError
  }
}

console.log(`Upserted ${records.length} EPA-certified engines and linked ${documents.length} official documents.`)
