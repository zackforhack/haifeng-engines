// Close the remaining 2020-2023 constant-speed EPA review queue.
// Dry-run by default. Use --apply to update Supabase.

import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const records = [
  {
    slug: 'yanmar-4tnv86ct',
    brand: 'Yanmar',
    model: '4TNV86CT',
    series: 'TNV Common Rail Series',
    cylinders: 4,
    configuration: 'L4 Common-Rail Turbocharged',
    displacement_l: 2.091,
    power_kw: 29,
    emissions_standard: 'U.S. EPA Final Tier 4 / Euro Stage V',
    certifications: ['U.S. EPA Tier 4 Final', 'Euro Stage V'],
    origin: 'Japan',
    description:
      'Yanmar 4TNV86CT 2.091 L inline-4 common-rail turbocharged diesel engine. '
      + 'EPA annual certification records identify 4RTGAC and 4RTGPC configurations '
      + 'at 28 to 29 kWm and 1800 RPM. Yanmar publishes the commercial 4TNV86CT '
      + 'for fixed-speed generator use under EPA Tier 4 Final and Euro Stage V.',
  },
  {
    slug: 'perkins-404f-e22ta',
    brand: 'Perkins',
    model: '404F-E22TA',
    series: '400 Series',
    cylinders: 4,
    configuration: 'L4 Common-Rail Turbocharged Aftercooled',
    displacement_l: 2.217,
    power_kw: 36,
    emissions_standard: 'U.S. EPA Final Tier 4 / Euro Stage IIIB',
    certifications: ['U.S. EPA Tier 4 Final', 'Euro Stage IIIB'],
    origin: 'United Kingdom',
    description:
      'Perkins 404F-E22TA 2.217 L inline-4 common-rail turbocharged and '
      + 'aftercooled diesel engine. The 2020 EPA constant-speed certification '
      + 'lists a 36 kWm configuration at 1800 RPM under Tier 4 Final. Perkins '
      + 'publishes the 404F-E22TA family for Tier 4 Final and Stage IIIB applications.',
  },
  {
    slug: 'mtu-16v2000g27s',
    brand: 'MTU',
    model: '16V2000G27S',
    series: 'Series 2000',
    cylinders: 16,
    configuration: 'V16 Turbocharged',
    displacement_l: 35.727,
    power_kw: 998,
    prime_power_kw_60hz: 998,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'Germany',
    description:
      'MTU 16V2000G27S 35.727 L V16 turbocharged diesel generator engine. '
      + 'EPA annual certification records list 998 kWm at 1800 RPM under '
      + 'Tier 2 for model years 2018 through 2020.',
  },
  {
    slug: 'mtu-16v2000g77s',
    brand: 'MTU',
    model: '16V2000G77S',
    series: 'Series 2000',
    cylinders: 16,
    configuration: 'V16 Turbocharged',
    displacement_l: 35.727,
    power_kw: 1097,
    standby_power_kw_60hz: 1097,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'Germany',
    description:
      'MTU 16V2000G77S 35.727 L V16 turbocharged diesel generator engine. '
      + 'EPA annual certification records list 1097 kWm at 1800 RPM under '
      + 'Tier 2 for model years 2018 through 2020.',
  },
].map((record) => ({
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  ...record,
}))

const storedDocument = {
  storagePath: 'yanmar/brochures/yanmar-industrial-engine-product-guide.pdf',
  label: 'Yanmar Industrial Engine Product Guide',
  type: 'brochure',
  slugs: ['yanmar-4tnv86ct'],
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

const { data: existingFile, error: existingFileError } = await supabase
  .from('engine_pdfs')
  .select('file_size_bytes')
  .eq('storage_path', storedDocument.storagePath)
  .limit(1)
  .maybeSingle()
if (existingFileError) throw existingFileError
if (!existingFile) {
  throw new Error(`Stored document not found: ${storedDocument.storagePath}`)
}

const engineIds = storedDocument.slugs.map(
  (slug) => engineBySlug.get(slug).id,
)
const { data: linked, error: linkedError } = await supabase
  .from('engine_pdfs')
  .select('engine_id')
  .eq('storage_path', storedDocument.storagePath)
  .in('engine_id', engineIds)
if (linkedError) throw linkedError

const linkedIds = new Set(linked.map((row) => row.engine_id))
const links = engineIds
  .filter((engineId) => !linkedIds.has(engineId))
  .map((engineId) => ({
    engine_id: engineId,
    type: storedDocument.type,
    label: storedDocument.label,
    storage_path: storedDocument.storagePath,
    file_size_bytes: existingFile.file_size_bytes,
  }))
if (links.length) {
  const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
  if (linkError) throw linkError
}

console.log(
  `Saved ${records.length} exact EPA records and linked the Yanmar product guide.`,
)
