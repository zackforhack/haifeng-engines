// Resolve the final 2024+ constant-speed EPA priority records as exact
// certification-model pages. Dry-run by default; pass --apply to save.

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import { execFileSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

const apply = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)
const bucket = 'engine-pdfs'
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-17')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const records = [
  {
    slug: 'fpt-f4he9685b-j',
    brand: 'FPT',
    model: 'F4HE9685B*J',
    series: 'NEF 6.7',
    cylinders: 6,
    configuration: 'L6 Turbocharged Intercooled',
    displacement_l: 6.728,
    power_kw: 172,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    origin: 'Italy',
    description:
      'FPT F4HE9685B*J 6.728 L inline-6 turbocharged and intercooled diesel '
      + 'engine. EPA annual certification records from 2017 through 2026 '
      + 'consistently list 172 kWm at 1800 RPM under Tier 3. Four-cylinder '
      + 'values in earlier rows conflict with the model family and later records.',
  },
  {
    slug: 'yanmar-3mtgag',
    brand: 'Yanmar',
    model: '3MTGAG',
    series: 'EPA 2.0 L Certification Family',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 1.995,
    power_kw: 28,
    emissions_standard: 'U.S. EPA Interim Tier 4 / U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Interim Tier 4', 'U.S. EPA Tier 4 Final'],
    origin: 'Japan',
    description:
      'Yanmar 3MTGAG 1.995 L inline-4 turbocharged diesel certification model. '
      + 'EPA annual records list 84 x 90 mm bore and stroke, 28 kWm at 1800 RPM, '
      + 'and Interim Tier 4 or Tier 4 Final certification depending on model year.',
  },
  {
    slug: 'yanmar-3mtgp',
    brand: 'Yanmar',
    model: '3MTGP',
    series: 'EPA 2.0 L Certification Family',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 1.995,
    power_kw: 28,
    emissions_standard: 'U.S. EPA Interim Tier 4 / U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Interim Tier 4', 'U.S. EPA Tier 4 Final'],
    origin: 'Japan',
    description:
      'Yanmar 3MTGP 1.995 L inline-4 turbocharged diesel certification model. '
      + 'EPA annual records list 84 x 90 mm bore and stroke, 28 kWm at 1800 RPM, '
      + 'and Interim Tier 4 or Tier 4 Final certification depending on model year.',
  },
].map((record) => ({
  ...record,
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
}))

const storedDocuments = [
  {
    label: 'FPT G-Drive Power Generation Line-Up 2025',
    type: 'brochure',
    storagePath: 'fpt/brochures/g-drive-powergen-lineup-2025.pdf',
    fileSizeBytes: 78426,
    slugs: ['fpt-f4he9685b-j'],
  },
]

const downloadedDocuments = [
  {
    source:
      'https://ww2.arb.ca.gov/sites/default/files/classic/msprog/nvepb/'
      + 'executive_orders/EO%20Web%20Files/OFCI/2016/0003/'
      + 'ofci_ofci_ur-28-715__sdt--20150727.pdf',
    storagePath: 'yanmar/certifications/2016-3mtgp-carb-executive-order.pdf',
    label: 'CARB 2016 Yanmar 3MTGP Certification Executive Order',
    type: 'datasheet',
    slugs: ['yanmar-3mtgp'],
  },
]

async function downloadPdf(source, destination) {
  let buffer
  try {
    const response = await fetch(source, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
          + 'AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(60000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    buffer = Buffer.from(await response.arrayBuffer())
  } catch {
    execFileSync(
      'curl',
      [
        '-L',
        '--fail',
        '--retry',
        '2',
        '-A',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
          + 'AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
        '-o',
        destination,
        source,
      ],
      { timeout: 120000 },
    )
    buffer = fs.readFileSync(destination)
  }
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${source}: response is not a PDF`)
  }
  fs.writeFileSync(destination, buffer)
}

async function linkDocument(document, engineBySlug) {
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
      file_size_bytes: document.fileSizeBytes,
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
  cylinders: record.cylinders,
  displacement_l: record.displacement_l,
  certified_kwm: record.power_kw,
  emissions: record.emissions_standard,
})))

if (!apply) {
  console.log(
    `\nDry run: ${existing.length} records will be updated and `
    + `${records.length - existing.length} records will be inserted.`,
  )
  console.log(
    `${storedDocuments.length} stored document and `
    + `${downloadedDocuments.length} downloaded certificate will be linked.`,
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

for (const document of storedDocuments) {
  await linkDocument(document, engineBySlug)
}

fs.mkdirSync(tempDir, { recursive: true })
for (const document of downloadedDocuments) {
  const localPath = path.join(tempDir, path.basename(document.storagePath))
  await downloadPdf(document.source, localPath)
  const uploaded = await uploadPdf(
    supabase,
    bucket,
    localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)
  await linkDocument(
    {
      ...document,
      fileSizeBytes: fs.statSync(localPath).size,
    },
    engineBySlug,
  )
}

console.log(
  `Saved ${records.length} exact EPA records and linked `
  + `${storedDocuments.length + downloadedDocuments.length} official documents.`,
)
