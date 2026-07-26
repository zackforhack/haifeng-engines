// Close the last two recent EPA SI 1800 RPM model gaps after certifier
// crosswalks: Mesa/HDI GX12 and Yanmar CP35D1's 3.3 L gas engine.
// Dry-run by default. Use --apply to update Supabase.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-06')
const common = {
  status: 'active',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  emissions_standard: 'U.S. EPA Stationary',
}

const records = [
  {
    ...common,
    slug: 'mesa-gx12',
    brand: 'Mesa',
    model: 'GX12',
    series: 'GX',
    origin: 'South Korea / United States',
    cylinders: 6,
    configuration: 'L6 Turbocharged Intercooled',
    displacement_l: 11.1,
    power_kw: 294,
    certifications: [
      'U.S. EPA Stationary',
      'U.S. EPA Nonroad Mobile',
      'U.S. EPA NSPS Subpart JJJJ',
    ],
    description:
      'Mesa GX12 is an 11.1 L inline-6 turbocharged and intercooled '
      + 'spark-ignited gas engine based on the HD Hyundai GX12P '
      + 'platform. Mesa identifies the GX12 as its four-valve 11.1 L '
      + 'engine, while HD Hyundai lists 294 kW maximum power. The 2026 '
      + 'Mesa EPA family TMSAB11.1XS1 covers a matching 294 kW node at '
      + 'the 1800 RPM certification test speed.',
  },
  {
    ...common,
    slug: 'yanmar-cp35d1-gas-engine',
    brand: 'Yanmar',
    model: 'CP35D1 Gas Engine',
    series: 'CP Micro Cogeneration',
    origin: 'Japan',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated Stoichiometric',
    displacement_l: 3.3,
    power_kw: 40.1,
    prime_power_kwe_60hz: 35,
    prime_power_kva_60hz: 43.75,
    certifications: ['U.S. EPA Stationary'],
    description:
      'The Yanmar CP35D1 uses a 3.3 L inline-4 naturally aspirated '
      + 'stoichiometric natural-gas engine in a 35 kWe micro '
      + 'cogeneration system. Yanmar introduced CP35D1 in 2016 and '
      + 'later confirmed that its 3.3 L gas engine is shared with its '
      + 'large GHP platform. EPA annual data carries the corresponding '
      + '3.3 L, 40.1 kWm stationary lineage from 2016 through 2026.',
  },
]

const documents = [
  {
    source:
      'https://www.hd-hyundaiengine.com/hd-infra-engine/file/down/'
      + 'c79008d5-0a4a-4a6a-ab3e-de3cdd39337c',
    storagePath: 'mesa/spec-sheets/hdi-gx12p-euro6.pdf',
    label: 'HD Hyundai GX12P Specification Sheet',
    slugs: ['mesa-gx12'],
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
  + `${documents.length} document set.`,
)
