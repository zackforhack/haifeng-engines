// Resolve six recent EPA spark-ignited 1800 RPM coverage actions:
// DNGV Q11.6, Tecogen/Origin, Generac 2.4 L, and MAN E3262 E302.
// Dry-run by default. Use --apply to update Supabase and attach documents.

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(url, key)
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-05')
const common = {
  status: 'active',
  origin: 'United States',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  emissions_standard: 'U.S. EPA Stationary',
}

const records = [
  {
    ...common,
    slug: 'dngv-q11-6-na',
    brand: 'DNGV',
    model: 'Q11.6 NA',
    series: 'Q11.6',
    origin: 'South Korea',
    cylinders: 6,
    configuration: 'L6 Naturally Aspirated',
    displacement_l: 11.6,
    power_kw: 116,
    prime_power_kw_50hz: 97,
    prime_power_kw_60hz: 116,
    certifications: ['U.S. EPA Stationary'],
    description:
      'DNGV Q11.6 NA is an 11.6 L inline-6 naturally aspirated gas '
      + 'engine based on a Hyundai Motors industrial platform. DNGV '
      + 'lists 97 kWm at 1500 RPM and 116 kWm at 1800 RPM for natural '
      + 'gas, LPG, biogas or syngas generator and CHP applications. '
      + 'The 2026 EPA annual data includes a 130 kW certification node.',
  },
  {
    ...common,
    slug: 'dngv-q11-6-tci',
    brand: 'DNGV',
    model: 'Q11.6 TCI',
    series: 'Q11.6',
    origin: 'South Korea',
    cylinders: 6,
    configuration: 'L6 Turbocharged Intercooled',
    displacement_l: 11.6,
    power_kw: 212,
    prime_power_kw_50hz: 176,
    prime_power_kw_60hz: 212,
    certifications: ['U.S. EPA Stationary'],
    description:
      'DNGV Q11.6 TCI is an 11.6 L inline-6 turbocharged and intercooled '
      + 'gas engine based on a Hyundai Motors industrial platform. DNGV '
      + 'lists 176 kWm at 1500 RPM and 212 kWm at 1800 RPM for natural '
      + 'gas, LPG, biogas or syngas generator and CHP applications. '
      + 'The 2026 EPA annual data includes a 215 kW certification node.',
  },
  {
    ...common,
    slug: 'tecogen-tecodrive-7400',
    brand: 'Tecogen',
    model: 'TecoDrive 7400',
    series: 'TecoDrive',
    cylinders: 8,
    configuration: 'V8 Spark Ignition',
    displacement_l: 7.4,
    power_kw: 77,
    certifications: ['U.S. EPA Stationary', 'CARB Distributed Generation'],
    description:
      'Tecogen TecoDrive 7400 is a 7.4 L V8 natural-gas engine developed '
      + 'from a GM-supplied platform for Tecogen CHP and chiller systems. '
      + 'Tecogen identifies it as the legacy engine used across its '
      + 'cogeneration products, while EPA annual certification data '
      + 'contains a 77 kW node in the current 7.4/8.0 L lineage.',
  },
  {
    ...common,
    slug: 'origin-engines-8-0l',
    brand: 'Origin Engines',
    model: '8.0L',
    series: 'Origin Big Block',
    cylinders: 8,
    configuration: 'V8 Naturally Aspirated',
    displacement_l: 8,
    compression_ratio: '10.5:1',
    power_kw: 80.5,
    certifications: ['U.S. EPA Stationary', 'CARB'],
    description:
      'Origin Engines 8.0L is an 8.0 L naturally aspirated V8 industrial '
      + 'engine with 107.95 x 107.95 mm bore and stroke, available for '
      + 'natural gas. Origin lists 212 hp peak and '
      + '426 lb-ft at 1800 RPM, with EPA- and CARB-certified packages. '
      + 'Tecogen has used Origin engines in InVerde e+ products since '
      + '2017; EPA annual data lists an 80.5 kW node in that lineage.',
  },
  {
    ...common,
    slug: 'generac-qt025a',
    brand: 'Generac',
    model: 'QT025A',
    series: 'QuietSource',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 2.4,
    compression_ratio: '9.5:1',
    power_kw: 38.6,
    standby_power_kwe_60hz: 25,
    standby_power_kva_60hz: 31.25,
    certifications: ['U.S. EPA Stationary Emergency'],
    description:
      'Generac QT025A is a 2.4 L inline-4 naturally aspirated gaseous '
      + 'engine generator rated 25 kWe standby at 1800 RPM on natural '
      + 'gas or propane vapor. Generac lists EPA stationary-emergency '
      + 'certification, and EPA annual data lists a 38.6 kWm node. The '
      + '6.8 L displacement shown on one 2024 EPA row is a source error.',
  },
  {
    ...common,
    slug: 'man-e-3262-e302',
    brand: 'MAN',
    model: 'E 3262 E302',
    series: 'E3262',
    origin: 'Germany',
    cylinders: 12,
    configuration: 'V12 Naturally Aspirated',
    displacement_l: 25.8,
    power_kw: 275,
    prime_power_kw_50hz: 275,
    prime_power_kw_60hz: 300,
    certifications: ['U.S. EPA Stationary'],
    description:
      'MAN E 3262 E302 is a 25.8 L naturally aspirated V12 '
      + 'stoichiometric natural-gas engine. MAN lists 275 kWm at 1500 '
      + 'RPM and 300 kWm at 1800 RPM. The 2026 Scale Microgrid EPA '
      + 'stationary family TSM2B26.0MAN lists a matching 301 kW node.',
  },
]

const documents = [
  {
    source:
      'https://www.navalmotor.com/mediaserver/web/vortec/downloads/'
      + 'Origin_Engines_8.0L.pdf',
    storagePath: 'origin-engines/spec-sheets/origin-engines-8-0l.pdf',
    label: 'Origin Engines 8.0L Specification Sheet',
    slugs: ['origin-engines-8-0l'],
  },
  {
    source:
      'https://d1io3yog0oux5.cloudfront.net/'
      + '_f3d9d9bcb7cdb07b49c65334c8b08351/tecogen/db/271/835/pdf/'
      + 'InVerde_e_UlteraDataSheet%2875-100-125%29.pdf',
    storagePath: 'tecogen/spec-sheets/inverde-e-plus-ultera.pdf',
    label: 'Tecogen InVerde e+ and Ultera Specification Sheet',
    slugs: ['tecogen-tecodrive-7400', 'origin-engines-8-0l'],
  },
  {
    source:
      'https://legacy.genconnect.generac.com/Media/vwDoc.axd'
      + '?d=0f574581-3cd7-4402-82c7-38fbb64f18c0',
    storagePath: 'generac/spec-sheets/qt025a-2-4l.pdf',
    label: 'Generac QT025A 2.4L Specification Sheet',
    slugs: ['generac-qt025a'],
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

const slugs = records.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (existingError) throw existingError
const existingSlugs = new Set(existing.map((engine) => engine.slug))

console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  brand: record.brand,
  model: record.model,
  displacement_l: record.displacement_l,
  power_kw: record.power_kw,
})))

if (!apply) {
  console.log(
    `Dry run: ${existing.length} updates, `
    + `${records.length - existing.length} inserts.`,
  )
  process.exit(0)
}

fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
  document.localPath = path.join(tempDir, path.basename(document.storagePath))
  await downloadPdf(document.source, document.localPath)
  console.log(`Validated ${document.label}`)
}

for (const record of records) {
  const query = existingSlugs.has(record.slug)
    ? supabase.from('engines').update(record).eq('slug', record.slug)
    : supabase.from('engines').insert(record)
  const { error } = await query
  if (error) throw error
}

const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (savedError) throw savedError
if (saved.length !== records.length) {
  throw new Error(`Expected ${records.length} saved records; found ${saved.length}`)
}
const engineBySlug = new Map(saved.map((engine) => [engine.slug, engine]))

for (const document of documents) {
  const uploaded = await uploadPdf(
    supabase,
    'engine-pdfs',
    document.localPath,
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
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(document.localPath).size,
    }))
  if (links.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
    if (linkError) throw linkError
  }
}

console.log(
  `Saved ${records.length} EPA SI records and ensured `
  + `${documents.length} document sets.`,
)
