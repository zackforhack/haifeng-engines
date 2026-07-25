// Add exact MTU 1800 RPM EPA-certified generator engine models.
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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-10')

const common = {
  brand: 'MTU',
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  origin: 'Germany',
}

// ratingType identifies where the EPA-certified mechanical output belongs when
// MTU's model/application designation makes prime or standby explicit.
const variants = [
  ['mtu-6r1600g10s-3b', '6R1600G10S 3B', 'Series 1600', 6, 'L6 Turbocharged', 10.521, 284, 'prime', 'U.S. EPA Tier 3', 2024],
  ['mtu-6r1600g20s-3b', '6R1600G20S 3B', 'Series 1600', 6, 'L6 Turbocharged', 10.521, 312, 'prime', 'U.S. EPA Tier 3', 2024],
  ['mtu-6r1600g70s-3d', '6R1600G70S 3D', 'Series 1600', 6, 'L6 Turbocharged', 10.521, 312, 'standby', 'U.S. EPA Tier 3', 2024],
  ['mtu-6r1600g80s-3d', '6R1600G80S 3D', 'Series 1600', 6, 'L6 Turbocharged', 10.521, 343, 'standby', 'U.S. EPA Tier 3', 2024],
  ['mtu-8v1600g10s-3b', '8V1600G10S 3B', 'Series 1600', 8, 'V8 Turbocharged', 14.028, 371, 'prime', 'U.S. EPA Tier 3', 2024],
  ['mtu-8v1600g20s-3b', '8V1600G20S 3B', 'Series 1600', 8, 'V8 Turbocharged', 14.028, 408, 'prime', 'U.S. EPA Tier 3', 2024],
  ['mtu-8v1600g70s-3d', '8V1600G70S 3D', 'Series 1600', 8, 'V8 Turbocharged', 14.028, 408, 'standby', 'U.S. EPA Tier 3', 2024],
  ['mtu-8v1600g80s-3d', '8V1600G80S 3D', 'Series 1600', 8, 'V8 Turbocharged', 14.028, 448, 'standby', 'U.S. EPA Tier 3', 2024],
  ['mtu-10v1600g20s', '10V1600G20S', 'Series 1600', 10, 'V10 Turbocharged', 17.535, 511, 'prime', 'U.S. EPA Tier 2', 2024],
  ['mtu-10v1600g70s-3d', '10V1600G70S 3D', 'Series 1600', 10, 'V10 Turbocharged', 17.535, 511, 'standby', 'U.S. EPA Tier 3', 2024],
  ['mtu-10v1600g80s', '10V1600G80S', 'Series 1600', 10, 'V10 Turbocharged', 17.535, 561, 'standby', 'U.S. EPA Tier 2', 2024],
  ['mtu-12v1600g10s', '12V1600G10S', 'Series 1600', 12, 'V12 Turbocharged', 21.042, 561, 'prime', 'U.S. EPA Tier 2', 2026],
  ['mtu-12v1600g20s', '12V1600G20S', 'Series 1600', 12, 'V12 Turbocharged', 21.042, 608, 'prime', 'U.S. EPA Tier 2', 2026],
  ['mtu-12v1600g30s', '12V1600G30S', 'Series 1600', 12, 'V12 Turbocharged', 21.042, 668, null, 'U.S. EPA Tier 2', 2025],
  ['mtu-12v1600g70s', '12V1600G70S', 'Series 1600', 12, 'V12 Turbocharged', 21.042, 613, 'standby', 'U.S. EPA Tier 2', 2026],
  ['mtu-12v1600g80s', '12V1600G80S', 'Series 1600', 12, 'V12 Turbocharged', 21.042, 668, 'standby', 'U.S. EPA Tier 2', 2026],
  ['mtu-12v1600g90s', '12V1600G90S', 'Series 1600', 12, 'V12 Turbocharged', 21.042, 730, null, 'U.S. EPA Tier 2', 2025],
  ['mtu-12v2000g26s', '12V2000G26S', 'Series 2000', 12, 'V12 Turbocharged', 26.796, 810, 'prime', 'U.S. EPA Tier 2', 2026],
  ['mtu-12v2000g76s', '12V2000G76S', 'Series 2000', 12, 'V12 Turbocharged', 26.796, 890, 'standby', 'U.S. EPA Tier 2', 2026],
  ['mtu-12v2000g86s', '12V2000G86S', 'Series 2000', 12, 'V12 Turbocharged', 26.796, 987, 'standby', 'U.S. EPA Tier 2', 2026],
  ['mtu-16v2000g26s', '16V2000G26S', 'Series 2000', 16, 'V16 Turbocharged', 35.727, 998, 'prime', 'U.S. EPA Tier 2', 2026],
  ['mtu-16v2000g76s', '16V2000G76S', 'Series 2000', 16, 'V16 Turbocharged', 35.727, 1097, 'standby', 'U.S. EPA Tier 2', 2026],
  ['mtu-16v2000g86s', '16V2000G86S', 'Series 2000', 16, 'V16 Turbocharged', 35.727, 1371, 'standby', 'U.S. EPA Tier 2', 2026],
  ['mtu-18v2000g76s', '18V2000G76S', 'Series 2000', 18, 'V18 Turbocharged', 40.193, 1371, 'standby', 'U.S. EPA Tier 2', 2026],
  ['mtu-12v4000g15s', '12V4000G15S', 'Series 4000', 12, 'V12 Turbocharged', 57.199, 1489, 'prime', 'U.S. EPA Tier 2', 2024],
  ['mtu-12v4000g25s', '12V4000G25S', 'Series 4000', 12, 'V12 Turbocharged', 57.199, 1745, 'prime', 'U.S. EPA Tier 2', 2024],
  ['mtu-12v4000g74s', '12V4000G74S', 'Series 4000', 12, 'V12 Turbocharged', 57.199, 1736, 'standby', 'U.S. EPA Tier 2', 2026],
  ['mtu-12v4000g75s', '12V4000G75S', 'Series 4000', 12, 'V12 Turbocharged', 57.199, 1638, 'standby', 'U.S. EPA Tier 2', 2024],
  ['mtu-12v4000g85s', '12V4000G85S', 'Series 4000', 12, 'V12 Turbocharged', 57.199, 1919, 'standby', 'U.S. EPA Tier 2', 2024],
]

const records = variants.map(([
  slug,
  model,
  series,
  cylinders,
  configuration,
  displacement_l,
  certifiedPower,
  ratingType,
  emissions_standard,
  certificationYear,
]) => ({
  ...common,
  slug,
  model,
  series,
  cylinders,
  configuration,
  displacement_l,
  power_kw: certifiedPower,
  ...(ratingType === 'prime'
    ? { prime_power_kw_60hz: certifiedPower }
    : {}),
  ...(ratingType === 'standby'
    ? { standby_power_kw_60hz: certifiedPower }
    : {}),
  emissions_standard,
  certifications: [emissions_standard],
  description:
    `MTU ${model} ${displacement_l} L ${configuration} diesel engine for `
    + `60 Hz generator applications. The ${certificationYear} EPA record `
    + `certifies ${certifiedPower} kWm at 1800 RPM. ${emissions_standard}.`,
}))

const documents = [
  {
    source:
      'https://www.mtu-solutions.com/content/dam/mtu/technical-information/'
      + 'operating-instructions/diesel/mtu-series-1600/powergen/MS15022_04E.pdf/'
      + '_jcr_content/renditions/original./MS15022_04E.pdf',
    storagePath: 'mtu/manuals/series-1600-6r-powergen-operating-instructions.pdf',
    label: 'MTU Series 1600 6R Power Generation Operating Instructions',
    type: 'manual',
    slugs: [
      'mtu-6r1600g10s-3b',
      'mtu-6r1600g20s-3b',
      'mtu-6r1600g70s-3d',
      'mtu-6r1600g80s-3d',
    ],
  },
  {
    source:
      'https://www.mtu-solutions.com/content/dam/mtu/products/power-generation/'
      + 'powergeneration-product-list-latest/'
      + '3239101_MTU_Gendrive_spec_12V1600Gx0_Gx1_3D_3E_3F_A2A.pdf/'
      + '_jcr_content/renditions/original./'
      + '3239101_MTU_Gendrive_spec_12V1600Gx0_Gx1_3D_3E_3F_A2A.pdf',
    storagePath: 'mtu/spec-sheets/12v1600-gx0-gx1-60hz.pdf',
    label: 'MTU 12V1600 Gx0/Gx1 60 Hz Gendrive Specification',
    type: 'datasheet',
    slugs: [
      'mtu-12v1600g10s',
      'mtu-12v1600g20s',
      'mtu-12v1600g70s',
      'mtu-12v1600g80s',
    ],
  },
  {
    source:
      'https://www.mtu-solutions.com/content/dam/mtu/products/power-generation/'
      + 'powergeneration-product-list-latest/'
      + '32310311_MTU_Gendrive_spec_16V2000Gx6_3D_3F_W2A.pdf/'
      + '_jcr_content/renditions/original./'
      + '32310311_MTU_Gendrive_spec_16V2000Gx6_3D_3F_W2A.pdf',
    storagePath: 'mtu/spec-sheets/16v2000-gx6-60hz.pdf',
    label: 'MTU 16V2000 Gx6 60 Hz Gendrive Specification',
    type: 'datasheet',
    slugs: [
      'mtu-16v2000g26s',
      'mtu-16v2000g76s',
      'mtu-16v2000g86s',
    ],
  },
  {
    source:
      'https://www.mtu-solutions.com/content/dam/mtu/products/power-generation/'
      + 'powergeneration-product-list-latest/'
      + '23947_PG_Spec_18V2000DS1250_1250kW_3D_T2_SCAQMD_60Hz.pdf/'
      + '_jcr_content/renditions/original./'
      + '23947_PG_Spec_18V2000DS1250_1250kW_3D_T2_SCAQMD_60Hz.pdf',
    storagePath: 'mtu/spec-sheets/18v2000-g76s-60hz.pdf',
    label: 'MTU 18V2000G76S 60 Hz Generator Set Specification',
    type: 'datasheet',
    slugs: ['mtu-18v2000g76s'],
  },
  {
    source:
      'https://www.mtu-solutions.com/content/dam/mtu/products/power-generation/'
      + 'powergeneration-product-list-latest/'
      + '32311361_MTU_Gendrive_spec_12V16V20V4000Gx4_3D_3E_3F_W2A.pdf/'
      + '_jcr_content/renditions/original./'
      + '32311361_MTU_Gendrive_spec_12V16V20V4000Gx4_3D_3E_3F_W2A.pdf',
    storagePath: 'mtu/spec-sheets/series-4000-gx4-60hz.pdf',
    label: 'MTU Series 4000 Gx4 60 Hz Gendrive Specification',
    type: 'datasheet',
    slugs: ['mtu-12v4000g74s'],
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
  `Saved ${records.length} MTU records and ensured ${documents.length} official document sets.`,
)
