// Add the non-MTU 2016 constant-speed EPA review tier.
// Dry-run by default. Use --apply to update Supabase and attach Hatz documents.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-23')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const records = [
  {
    slug: 'hatz-1d81',
    brand: 'Hatz',
    model: '1D81',
    series: 'D Series',
    cylinders: 1,
    configuration: 'L1 Naturally Aspirated',
    displacement_l: 0.668,
    power_kw: 7,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    cooling_method: 'Air-Cooled',
    origin: 'Germany',
    description:
      'Hatz 1D81 is a 0.668 L single-cylinder naturally aspirated air-cooled '
      + 'diesel engine. EPA annual certification records list 6 to 7 kWm at '
      + '1800 RPM under Tier 4 Final for the 1D81 S/Z/T/U configurations. '
      + 'Hatz documentation identifies 1D81 separately from the 1D81C.',
  },
  {
    slug: 'hatz-3l43c',
    brand: 'Hatz',
    model: '3L43C',
    series: 'L Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 2.574,
    power_kw: 26,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    cooling_method: 'Air-Cooled',
    origin: 'Germany',
    description:
      'Hatz 3L43C is a 2.574 L inline-3 naturally aspirated air-cooled diesel '
      + 'engine. Hatz EPA documentation and annual certification records list '
      + '26 kWm at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'hatz-3m43',
    brand: 'Hatz',
    model: '3M43',
    series: 'M Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 2.574,
    power_kw: 28,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    cooling_method: 'Air-Cooled',
    origin: 'Germany',
    description:
      'Hatz 3M43 is a 2.574 L inline-3 naturally aspirated air-cooled diesel '
      + 'engine. Hatz EPA documentation and annual certification records list '
      + '28 kWm at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'hatz-3m43z',
    brand: 'Hatz',
    model: '3M43Z',
    series: 'M Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 2.574,
    power_kw: 28,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    cooling_method: 'Air-Cooled',
    origin: 'Germany',
    description:
      'Hatz 3M43Z is a 2.574 L inline-3 naturally aspirated air-cooled diesel '
      + 'engine. Hatz EPA documentation and annual certification records list '
      + '28 kWm at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'hatz-4l43c',
    brand: 'Hatz',
    model: '4L43C',
    series: 'L Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 3.432,
    power_kw: 35,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    cooling_method: 'Air-Cooled',
    origin: 'Germany',
    description:
      'Hatz 4L43C is a 3.432 L inline-4 naturally aspirated air-cooled diesel '
      + 'engine. Hatz EPA documentation and annual certification records list '
      + '35 kWm at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'hatz-4m43',
    brand: 'Hatz',
    model: '4M43',
    series: 'M Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 3.432,
    power_kw: 37,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    cooling_method: 'Air-Cooled',
    origin: 'Germany',
    description:
      'Hatz 4M43 is a 3.432 L inline-4 naturally aspirated air-cooled diesel '
      + 'engine. Hatz EPA documentation and annual certification records list '
      + '37 kWm at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'hatz-4m43z',
    brand: 'Hatz',
    model: '4M43Z',
    series: 'M Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 3.432,
    power_kw: 37,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    cooling_method: 'Air-Cooled',
    origin: 'Germany',
    description:
      'Hatz 4M43Z is a 3.432 L inline-4 naturally aspirated air-cooled diesel '
      + 'engine. Hatz EPA documentation and annual certification records list '
      + '37 kWm at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'perkins-3362-1800',
    brand: 'Perkins',
    model: '3362/1800',
    series: 'C4.4 EPA Certification',
    cylinders: 4,
    configuration: 'L4',
    displacement_l: 4.399,
    power_kw: 117,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    cooling_method: 'Liquid-Cooled',
    origin: 'United Kingdom',
    description:
      'Perkins 3362/1800 is a 4.399 L inline-4 diesel engine configuration '
      + 'identified in EPA annual certification data. The records list '
      + '117 kWm at 1800 RPM under Tier 3 for model years 2012 through 2016. '
      + 'The EPA designation is retained because no verified commercial-model '
      + 'cross-reference was found.',
  },
  {
    slug: 'perkins-3366-1800',
    brand: 'Perkins',
    model: '3366/1800',
    series: 'C4.4 EPA Certification',
    cylinders: 4,
    configuration: 'L4',
    displacement_l: 4.399,
    power_kw: 97,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    cooling_method: 'Liquid-Cooled',
    origin: 'United Kingdom',
    description:
      'Perkins 3366/1800 is a 4.399 L inline-4 diesel engine configuration '
      + 'identified in EPA annual certification data. The records list '
      + '97 kWm at 1800 RPM under Tier 3 for model years 2012 through 2016. '
      + 'The EPA designation is retained because no verified commercial-model '
      + 'cross-reference was found.',
  },
  {
    slug: 'perkins-3468-1800',
    brand: 'Perkins',
    model: '3468/1800',
    series: 'C4.4 EPA Certification',
    cylinders: 4,
    configuration: 'L4',
    displacement_l: 4.399,
    power_kw: 73,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    cooling_method: 'Liquid-Cooled',
    origin: 'United Kingdom',
    description:
      'Perkins 3468/1800 is a 4.399 L inline-4 diesel engine configuration '
      + 'identified in EPA annual certification data. The records list '
      + '73 kWm at 1800 RPM under Tier 3 for model years 2012 through 2016. '
      + 'The EPA designation is retained because no verified commercial-model '
      + 'cross-reference was found.',
  },
].map((record) => ({
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  rpm_rated: 1800,
  ...record,
}))

const documents = [
  {
    source:
      'https://www.hatz.com/images/downloads/downloadcenter/anleitungen/'
      + 'd-serie/ebook_BA_1D_EN.pdf',
    storagePath: 'hatz/manuals/hatz-1d-series-epa-operator-manual.pdf',
    label: 'Hatz 1D Series EPA Operator Manual',
    type: 'manual',
    slugs: ['hatz-1d81'],
  },
  {
    source:
      'https://www.hatz.com/images/downloads/downloadcenter/cert/3M43_4M43/'
      + 'EPA_CARB%20constant%20speed-FHZXL2.57C43.pdf',
    storagePath: 'hatz/certifications/3l43c-3m43-epa-tier-4-constant-speed.pdf',
    label: 'Hatz 3L43C / 3M43 EPA Tier 4 Constant-Speed Certification',
    type: 'datasheet',
    slugs: ['hatz-3l43c', 'hatz-3m43', 'hatz-3m43z'],
  },
  {
    source:
      'https://www.hatz.com/images/downloads/downloadcenter/cert/3L43C/'
      + 'EPA_CARB%20constant%20speed_FHZXL3.43C43.pdf',
    storagePath: 'hatz/certifications/4l43c-4m43-epa-tier-4-constant-speed.pdf',
    label: 'Hatz 4L43C / 4M43 EPA Tier 4 Constant-Speed Certification',
    type: 'datasheet',
    slugs: ['hatz-4l43c', 'hatz-4m43', 'hatz-4m43z'],
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
  console.log(`${documents.length} official Hatz documents will be uploaded and linked.`)
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
  `Saved ${records.length} exact EPA records and ensured `
  + `${documents.length} official Hatz document sets.`,
)
