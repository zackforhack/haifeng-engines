// Add exact Mitsubishi 1800 RPM EPA-certified engine models.
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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-12')

const common = {
  brand: 'Mitsubishi',
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  origin: 'Japan',
}

const variants = [
  {
    slug: 'mitsubishi-d04eg-mech-taa',
    model: 'D04EG-MECH-TAA',
    series: 'EG Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged Intercooled',
    displacement_l: 3.331,
    power_kw: 68,
    emissions_standard: 'U.S. EPA Tier 3',
  },
  {
    slug: 'mitsubishi-d04eg-t',
    model: 'D04EG-T',
    series: 'EG Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 3.331,
    power_kw: 54,
    emissions_standard: 'U.S. EPA Final Tier 4',
  },
  {
    slug: 'mitsubishi-l2e',
    model: 'L2E',
    series: 'L Series',
    cylinders: 2,
    configuration: 'L2 Naturally Aspirated',
    displacement_l: 0.635,
    power_kw: 6,
    prime_power_kw_60hz: 5.1,
    standby_power_kw_60hz: 6,
    emissions_standard: 'U.S. EPA Final Tier 4',
  },
  {
    slug: 'mitsubishi-l3e',
    model: 'L3E',
    series: 'L Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 0.953,
    power_kw: 9,
    prime_power_kw_60hz: 7.8,
    standby_power_kw_60hz: 9.1,
    emissions_standard: 'U.S. EPA Final Tier 4',
  },
  {
    slug: 'mitsubishi-s3l2',
    model: 'S3L2',
    series: 'SL Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.319,
    power_kw: 14,
    prime_power_kw_60hz: 12.2,
    standby_power_kw_60hz: 13.6,
    emissions_standard: 'U.S. EPA Final Tier 4',
  },
  {
    slug: 'mitsubishi-s4l2',
    model: 'S4L2',
    series: 'SL Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 1.758,
    power_kw: 18,
    prime_power_kw_60hz: 16.7,
    standby_power_kw_60hz: 18.1,
    emissions_standard: 'U.S. EPA Final Tier 4',
  },
  {
    slug: 'mitsubishi-s4s',
    model: 'S4S',
    series: 'SS Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 3.331,
    power_kw: 35,
    prime_power_kw_60hz: 31.7,
    standby_power_kw_60hz: 33.5,
    emissions_standard: 'U.S. EPA Tier 3 / U.S. EPA Interim Tier 4',
  },
  {
    slug: 'mitsubishi-s4s-dtb',
    model: 'S4S-DTB',
    series: 'SS Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 3.331,
    power_kw: 45,
    emissions_standard: 'U.S. EPA Tier 3 / U.S. EPA Interim Tier 4',
  },
  {
    slug: 'mitsubishi-d03cj-taa',
    model: 'D03CJ-TAA',
    series: 'CJ Series',
    cylinders: 3,
    configuration: 'L3 Turbocharged Intercooled',
    displacement_l: 1.656,
    power_kw: 35,
    emissions_standard: 'U.S. EPA Final Tier 4',
  },
  {
    slug: 'mitsubishi-d04cj-taa',
    model: 'D04CJ-TAA',
    series: 'CJ Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged Intercooled',
    displacement_l: 2.207,
    power_kw: 55,
    emissions_standard: 'U.S. EPA Final Tier 4',
  },
]

const records = variants.map((variant) => ({
  ...common,
  ...variant,
  certifications: variant.emissions_standard.split(' / '),
  description:
    `Mitsubishi ${variant.model} ${variant.displacement_l} L `
    + `${variant.configuration} diesel engine. The latest EPA certification `
    + `record lists up to ${variant.power_kw} kWm at 1800 RPM. `
    + `${variant.emissions_standard}.`,
}))

const documents = [
  {
    source:
      'https://www.mhi.com/products/industry/engine/pdf/'
      + 'multi_purpose_generators.pdf',
    storagePath:
      'mitsubishi/spec-sheets/multi-purpose-generator-engines.pdf',
    label: 'Mitsubishi Multi-Purpose Generator Engine Specification',
    type: 'datasheet',
    slugs: [
      'mitsubishi-l2e',
      'mitsubishi-l3e',
      'mitsubishi-s3l2',
      'mitsubishi-s4l2',
      'mitsubishi-s4s',
      'mitsubishi-s4s-dtb',
    ],
  },
  {
    source:
      'https://www.mhi.com/products/industry/engine/pdf/cjeg_series.pdf',
    storagePath: 'mitsubishi/spec-sheets/cj-eg-series.pdf',
    label: 'Mitsubishi CJ/EG Series Specification',
    type: 'datasheet',
    slugs: [
      'mitsubishi-d03cj-taa',
      'mitsubishi-d04cj-taa',
      'mitsubishi-d04eg-mech-taa',
      'mitsubishi-d04eg-t',
    ],
  },
  {
    source:
      'https://www.mhi.com/products/industry/engine/pdf/ss_series_s4s.pdf',
    storagePath: 'mitsubishi/spec-sheets/ss-series-s4s.pdf',
    label: 'Mitsubishi SS Series S4S Specification',
    type: 'datasheet',
    slugs: ['mitsubishi-s4s', 'mitsubishi-s4s-dtb'],
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
  certified_kwm: record.power_kw,
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
  `Saved ${records.length} Mitsubishi records and ensured `
  + `${documents.length} official document sets.`,
)
