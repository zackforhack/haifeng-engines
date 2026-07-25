// Close the 2016 MTU Series 2000 constant-speed EPA review tier.
// Dry-run by default. Use --apply to update Supabase and attach MTU documents.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-24')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

function mtuRecord({
  slug,
  model,
  cylinders,
  displacement,
  power,
  description,
}) {
  return {
    slug,
    brand: 'MTU',
    model,
    series: '2000 Series',
    status: 'active',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    cylinders,
    configuration: `V${cylinders} Turbocharged Intercooled`,
    displacement_l: displacement,
    power_kw: power,
    rpm_rated: 1800,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'Germany',
    description,
  }
}

const records = [
  mtuRecord({
    slug: 'mtu-12v2000-g44',
    model: 'MTU 12V2000 G44',
    cylinders: 12,
    displacement: 23.892,
    power: 735,
    description:
      'MTU 12V2000 G44 is a 23.892 L V12 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists 3B and 3D '
      + 'constant-speed configurations at 668 and 735 kWm respectively, '
      + 'both at 1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-16v2000-g44',
    model: 'MTU 16V2000 G44',
    cylinders: 16,
    displacement: 31.856,
    power: 1010,
    description:
      'MTU 16V2000 G44 is a 31.856 L V16 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists 3B and 3D '
      + 'constant-speed configurations at 915 and 1010 kWm respectively, '
      + 'both at 1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-12v2000-g84',
    model: 'MTU 12V2000 G84',
    cylinders: 12,
    displacement: 23.892,
    power: 835,
    description:
      'MTU 12V2000 G84 is a 23.892 L V12 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists 3B and 3D '
      + 'constant-speed configurations at 761 and 835 kWm respectively, '
      + 'both at 1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-12v2000-g84l',
    model: 'MTU 12V2000 G84L',
    cylinders: 12,
    displacement: 23.892,
    power: 920,
    description:
      'MTU 12V2000 G84L is a 23.892 L V12 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists a 920 kWm '
      + 'constant-speed configuration at 1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-16v2000-g84',
    model: 'MTU 16V2000 G84',
    cylinders: 16,
    displacement: 31.856,
    power: 1115,
    description:
      'MTU 16V2000 G84 is a 31.856 L V16 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists 3B and 3D '
      + 'constant-speed configurations at 1010 and 1115 kWm respectively, '
      + 'both at 1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-12v2000-p12',
    model: 'MTU 12V2000 P12',
    cylinders: 12,
    displacement: 23.892,
    power: 600,
    description:
      'MTU 12V2000 P12 is a 23.892 L V12 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists 600 kWm at '
      + '1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-16v2000-p12',
    model: 'MTU 16V2000 P12',
    cylinders: 16,
    displacement: 31.856,
    power: 800,
    description:
      'MTU 16V2000 P12 is a 31.856 L V16 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists 800 kWm at '
      + '1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-12v2000-p82',
    model: 'MTU 12V2000 P82',
    cylinders: 12,
    displacement: 23.892,
    power: 695,
    description:
      'MTU 12V2000 P82 is a 23.892 L V12 turbocharged and intercooled '
      + 'GenDrive diesel engine. MTU publishes 600 kWm continuous and '
      + '695 kWm prime ratings at 1800 RPM. EPA Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-16v2000-p82',
    model: 'MTU 16V2000 P82',
    cylinders: 16,
    displacement: 31.856,
    power: 930,
    description:
      'MTU 16V2000 P82 is a 31.856 L V16 turbocharged and intercooled '
      + 'GenDrive diesel engine. MTU publishes 800 kWm continuous and '
      + '930 kWm prime ratings at 1800 RPM. EPA Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-12v2000-p92r',
    model: 'MTU 12V2000 P92R',
    cylinders: 12,
    displacement: 23.892,
    power: 675,
    description:
      'MTU 12V2000 P92R is a 23.892 L V12 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists 675 kWm at '
      + '1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-16v2000-p92r',
    model: 'MTU 16V2000 P92R',
    cylinders: 16,
    displacement: 31.856,
    power: 900,
    description:
      'MTU 16V2000 P92R is a 31.856 L V16 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists 900 kWm at '
      + '1800 RPM under Tier 2.',
  }),
]

const corrections = [
  mtuRecord({
    slug: 'mtu-12v2000-g45',
    model: 'MTU 12V2000 G45',
    cylinders: 12,
    displacement: 23.892,
    power: 780,
    description:
      'MTU 12V2000 G45 is a 23.892 L V12 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists TB and TD '
      + '3B/3D constant-speed configurations from 710 to 780 kWm at '
      + '1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-16v2000-g45',
    model: 'MTU 16V2000 G45',
    cylinders: 16,
    displacement: 31.856,
    power: 1010,
    description:
      'MTU 16V2000 G45 is a 31.856 L V16 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists TB and TD '
      + '3B/3D constant-speed configurations from 915 to 1010 kWm at '
      + '1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-12v2000-g85',
    model: 'MTU 12V2000 G85',
    cylinders: 12,
    displacement: 23.892,
    power: 890,
    description:
      'MTU 12V2000 G85 is a 23.892 L V12 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists TB and TD '
      + '3B/3D constant-speed configurations from 809 to 890 kWm at '
      + '1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-16v2000-g85',
    model: 'MTU 16V2000 G85',
    cylinders: 16,
    displacement: 31.856,
    power: 1115,
    description:
      'MTU 16V2000 G85 is a 31.856 L V16 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists TB and TD '
      + '3B/3D constant-speed configurations from 1010 to 1115 kWm at '
      + '1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-18v2000-g85',
    model: 'MTU 18V2000 G85',
    cylinders: 18,
    displacement: 35.838,
    power: 1310,
    description:
      'MTU 18V2000 G85 is a 35.838 L V18 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data and MTU application '
      + 'material list TB and TD 3B/3D configurations from 1191 to 1310 kWm '
      + 'at 1800 RPM under Tier 2.',
  }),
]

const documents = [
  {
    source:
      'https://www.mtu-solutions.com/content/dam/mtu/products/'
      + 'commercial-marine/offshore-exploration---production/'
      + 'engines-and-gensets-for-power-generation/mtu-series-2000/'
      + '3232091_OG_spec_2000P_gendrive.pdf/_jcr_content/renditions/'
      + 'original./3232091_OG_spec_2000P_gendrive.pdf',
    storagePath: 'mtu/datasheets/series-2000-p-gendrive-oil-gas.pdf',
    label: 'MTU Series 2000 P GenDrive Specification',
    type: 'datasheet',
    slugs: ['mtu-12v2000-p82', 'mtu-16v2000-p82'],
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

const allRecords = [...records, ...corrections]
const slugs = allRecords.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug, model, displacement_l')
  .in('slug', slugs)
if (existingError) throw existingError

const existingBySlug = new Map(existing.map((engine) => [engine.slug, engine]))
console.table(allRecords.map((record) => ({
  action: existingBySlug.has(record.slug) ? 'update' : 'insert',
  model: record.model,
  displacement_l: record.displacement_l,
  certified_kwm: record.power_kw,
})))

for (const correction of corrections) {
  if (!existingBySlug.has(correction.slug)) {
    throw new Error(`Correction target not found: ${correction.slug}`)
  }
}

if (!apply) {
  console.log(
    `\nDry run: ${records.filter((record) => existingBySlug.has(record.slug)).length} `
    + `new-base records will be updated and `
    + `${records.filter((record) => !existingBySlug.has(record.slug)).length} inserted.`,
  )
  console.log(`${corrections.length} existing MTU pages will be normalized.`)
  console.log(`${documents.length} official MTU documents will be uploaded and linked.`)
  process.exit(0)
}

const { error: upsertError } = await supabase
  .from('engines')
  .upsert(allRecords, { onConflict: 'slug' })
if (upsertError) throw upsertError

const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (savedError) throw savedError
if (saved.length !== allRecords.length) {
  throw new Error(`Expected ${allRecords.length} saved records; found ${saved.length}`)
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
  `Saved ${allRecords.length} MTU base records and ensured `
  + `${documents.length} official document sets.`,
)
