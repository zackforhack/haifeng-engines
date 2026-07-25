// Add exact Cummins EPA generator models and attach public manufacturer documents.
// Dry-run by default. Use --apply to update Supabase.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-11')

const common = {
  brand: 'Cummins',
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  origin: 'United States',
}

const variants = [
  ['cummins-4bt33g4', '4BT3.3G4', 'B3.3 Series', 4, 'L4 Turbocharged', 3.261, 46, 'U.S. EPA Tier 3 / U.S. EPA Interim Tier 4', 2026],
  ['cummins-4bt33g5', '4BT3.3G5', 'B3.3 Series', 4, 'L4 Turbocharged', 3.261, 51, 'U.S. EPA Tier 3 / U.S. EPA Interim Tier 4', 2026],
  ['cummins-4btaa33g7', '4BTAA3.3G7', 'B3.3 Series', 4, 'L4 Turbocharged Intercooled', 3.261, 74, 'U.S. EPA Tier 3', 2026],
  ['cummins-4btaa33g12', '4BTAA3.3G12', 'B3.3 Series', 4, 'L4 Turbocharged Intercooled', 3.261, 74, 'U.S. EPA Tier 3', 2026],
  ['cummins-4btaa33g17', '4BTAA3.3G17', 'B3.3 Series', 4, 'L4 Turbocharged Intercooled', 3.261, 65, 'U.S. EPA Tier 3', 2026],
  ['cummins-4btaa33g18', '4BTAA3.3G18', 'B3.3 Series', 4, 'L4 Turbocharged Intercooled', 3.261, 53, 'U.S. EPA Tier 3', 2026],
  ['cummins-kd05l04t-6dds', 'KD05L04T-6DDS', 'KD Series', 4, 'L4 Turbocharged', 4.46, 154, 'U.S. EPA Tier 3', 2026],
  ['cummins-kd07l06t-6dds', 'KD07L06T-6DDS', 'KD Series', 6, 'L6 Turbocharged', 6.69, 242, 'U.S. EPA Tier 3', 2026],
  ['cummins-kd09l06t-6dds', 'KD09L06T-6DDS', 'KD Series', 6, 'L6 Turbocharged', 8.88, 346, 'U.S. EPA Tier 3', 2026],
  ['cummins-qsb7-g4', 'QSB7-G4', 'QSB Series', 6, 'L6 Turbocharged', 6.69, 214, 'U.S. EPA Tier 3', 2026],
  ['cummins-qsk23-g7-nr2', 'QSK23-G7 NR2', 'QSK Series', 6, 'L6 Turbocharged Intercooled', 23.152, 910, 'U.S. EPA Tier 2', 2026],
  ['cummins-qsk38-g16', 'QSK38-G16', 'QSK Series', 12, 'V12 Turbocharged', 37.885, 1129, 'U.S. EPA Tier 2', 2026],
  ['cummins-qsk50-g22', 'QSK50-G22', 'QSK Series', 16, 'V16 Turbocharged', 50.513, 1682, 'U.S. EPA Tier 2', 2026],
  ['cummins-qsk50-g23', 'QSK50-G23', 'QSK Series', 16, 'V16 Turbocharged', 50.513, 1947, 'U.S. EPA Tier 2', 2026],
  ['cummins-qsk78-g10', 'QSK78-G10', 'QSK Series', 18, 'V18 Turbocharged', 77.627, 2760, 'U.S. EPA Tier 2', 2026],
  ['cummins-qsz13-g9', 'QSZ13-G9', 'QSZ Series', 6, 'L6 Turbocharged', 12.981, 500, 'U.S. EPA Tier 3', 2024],
]

const records = variants.map(([
  slug,
  model,
  series,
  cylinders,
  configuration,
  displacement_l,
  certifiedPower,
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
  emissions_standard,
  certifications: emissions_standard.split(' / '),
  description:
    `Cummins ${model} ${displacement_l} L ${configuration} diesel engine for `
    + `60 Hz generator applications. The ${certificationYear} EPA record `
    + `certifies up to ${certifiedPower} kWm at 1800 RPM. ${emissions_standard}.`,
}))

Object.assign(
  records.find((record) => record.slug === 'cummins-4btaa33g12'),
  {
    prime_power_kw_60hz: 67,
    standby_power_kw_60hz: 74,
    description:
      'Cummins 4BTAA3.3G12 3.261 L L4 turbocharged and charge-air-cooled '
      + 'diesel engine for generator sets. Cummins publishes 67 kWm prime and '
      + '74 kWm standby at 1800 RPM. U.S. EPA Tier 3.',
  },
)
Object.assign(
  records.find((record) => record.slug === 'cummins-qsk23-g7-nr2'),
  {
    prime_power_kw_60hz: 809,
    standby_power_kw_60hz: 910,
    description:
      'Cummins QSK23-G7 NR2 23.152 L L6 turbocharged and aftercooled diesel '
      + 'engine for generator sets. Cummins publishes 809 kWm prime and '
      + '910 kWm standby at 1800 RPM. U.S. EPA Tier 2.',
  },
)

const documents = [
  {
    source: 'https://www.cummins.com/sites/default/files/2019-11/4BTAA3.3-G12.pdf',
    storagePath: 'cummins/spec-sheets/4btaa3.3-g12-60hz.pdf',
    label: 'Cummins 4BTAA3.3-G12 60 Hz Specification Sheet',
    type: 'datasheet',
    slugs: ['cummins-4btaa33g12'],
  },
  {
    source: 'https://www.cummins.com/sites/default/files/2019-06/QSK23G7.pdf',
    storagePath: 'cummins/spec-sheets/qsk23-g7-60hz-epa-tier-2.pdf',
    label: 'Cummins QSK23-G7 60 Hz EPA Tier 2 Specification Sheet',
    type: 'datasheet',
    slugs: ['cummins-qsk23-g7-nr2'],
  },
  {
    source:
      'https://www.cummins.com/sites/default/files/2022-07/'
      + 'centum-qsk38-specification-sheet-revd.pdf',
    storagePath: 'cummins/spec-sheets/centum-qsk38.pdf',
    label: 'Cummins Centum QSK38 Specification Sheet',
    type: 'datasheet',
    slugs: ['cummins-qsk38-g16'],
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
  `Saved ${records.length} Cummins records and ensured ${documents.length} official document sets.`,
)
