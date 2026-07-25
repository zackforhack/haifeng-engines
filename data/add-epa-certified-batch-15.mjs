// Add exact 1800 RPM EPA-certified models that are not represented by an
// existing commercial model page. Dry-run by default; pass --apply to save.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-15')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const records = [
  {
    slug: 'volvo-penta-twd1683ge-b',
    brand: 'Volvo Penta',
    model: 'TWD1683GE-B',
    series: 'D16 Power Generation',
    cylinders: 6,
    configuration: 'L6 Turbocharged Intercooled',
    displacement_l: 16.123,
    power_kw: 685,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'Sweden',
    description:
      'Volvo Penta TWD1683GE-B 16.123 L inline-6 turbocharged and intercooled diesel engine. '
      + 'EPA annual certification data lists 685 kWm at 1800 RPM under Tier 2. '
      + 'This certification variant is distinct from the current Stage V and Tier 4 Final TWD1683GE.',
  },
  {
    slug: 'cummins-qsk19-c',
    brand: 'Cummins',
    model: 'QSK19-C',
    series: 'Quantum Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 18.942,
    power_kw: 567,
    emissions_standard: 'U.S. EPA Tier 2 / U.S. EPA Tier 3 / U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 2', 'U.S. EPA Tier 3', 'U.S. EPA Tier 4 Final'],
    origin: 'United States',
    description:
      'Cummins QSK19-C 18.942 L inline-6 turbocharged and aftercooled diesel engine. '
      + 'EPA annual certification records list certified configurations from 378 to 567 kWm '
      + 'at 1800 RPM across Tier 2, Tier 3 and Tier 4 Final families.',
  },
  {
    slug: 'cummins-s17',
    brand: 'Cummins',
    model: 'S17',
    series: 'S Series',
    cylinders: 6,
    configuration: 'L6 Dual-Turbocharged',
    displacement_l: 16.825,
    power_kw: 1099,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'United States',
    description:
      'Cummins S17 16.825 L inline-6 dual-turbocharged diesel generator engine. '
      + 'EPA annual certification data lists certified configurations from 832 to 1099 kWm '
      + 'at 1800 RPM under Tier 2. Cummins publishes the 60 Hz generator platform for '
      + '600 to 1000 kWe applications.',
  },
  {
    slug: 'cummins-qsk23-c',
    brand: 'Cummins',
    model: 'QSK23-C',
    series: 'Quantum Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 23.152,
    power_kw: 708,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'United States',
    description:
      'Cummins QSK23-C 23.152 L inline-6 turbocharged and aftercooled diesel engine. '
      + 'EPA annual certification data lists certified configurations from 567 to 708 kWm '
      + 'at 1800 RPM under Tier 2.',
  },
  {
    slug: 'cummins-qsm11-c',
    brand: 'Cummins',
    model: 'QSM11-C',
    series: 'Quantum Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 10.824,
    power_kw: 298,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    origin: 'United States',
    description:
      'Cummins QSM11-C 10.824 L inline-6 turbocharged and aftercooled diesel engine. '
      + 'EPA annual certification data lists certified configurations from 254 to 298 kWm '
      + 'at 1800 RPM under Tier 3.',
  },
  {
    slug: 'kubota-v2403-cr-nt-bg-ef',
    brand: 'Kubota',
    model: 'V2403-CR-NT-BG-EF',
    series: 'V2403 Series',
    cylinders: 4,
    configuration: 'L4 Common-Rail',
    displacement_l: 2.435,
    power_kw: 37,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    origin: 'Japan',
    description:
      'Kubota V2403-CR-NT-BG-EF 2.435 L inline-4 common-rail diesel engine. '
      + 'EPA annual certification data lists 36 to 37 kWm at 1800 RPM under Tier 4 Final. '
      + 'Kubota also lists the exact model in its official emissions certification lookup.',
  },
  {
    slug: 'kubota-v2403-cr-nti-bg-ef',
    brand: 'Kubota',
    model: 'V2403-CR-NTI-BG-EF',
    series: 'V2403 Series',
    cylinders: 4,
    configuration: 'L4 Common-Rail Turbocharged Intercooled',
    displacement_l: 2.435,
    power_kw: 54,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    origin: 'Japan',
    description:
      'Kubota V2403-CR-NTI-BG-EF 2.435 L inline-4 common-rail turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists 52 to 54 kWm at 1800 RPM under '
      + 'Tier 4 Final. Kubota also lists the exact model in its official emissions lookup.',
  },
  {
    slug: 'kubota-v3800-cr-ti-bg-et',
    brand: 'Kubota',
    model: 'V3800-CR-TI-BG-ET',
    series: 'V3800 Series',
    cylinders: 4,
    configuration: 'L4 Common-Rail Turbocharged Intercooled',
    displacement_l: 3.77,
    power_kw: 67,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    origin: 'Japan',
    description:
      'Kubota V3800-CR-TI-BG-ET 3.77 L inline-4 common-rail turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists 67 kWm at 1800 RPM under Tier 3. '
      + 'Kubota also lists the exact model in its official emissions certification lookup.',
  },
].map((record) => ({
  ...record,
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
}))

const documents = [
  {
    source: 'https://www.cummins.com/sites/default/files/2025-06/s-6786-spec-sheet.pdf',
    storagePath: 'cummins/spec-sheets/s17-60hz-epa-tier-2.pdf',
    label: 'Cummins S17 60 Hz EPA Tier 2 Generator Set Specification',
    type: 'datasheet',
    slugs: ['cummins-s17'],
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
  console.log(`${documents.length} official document will be uploaded and linked on apply.`)
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
      file_size_bytes: fs.statSync(localPath).size,
    }))
  if (links.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
    if (linkError) throw linkError
  }
}

console.log(
  `Saved ${records.length} exact EPA records and linked `
  + `${documents.length} official document.`,
)
