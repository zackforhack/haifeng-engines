// Close the 2018 constant-speed EPA review tier and correct one Yanmar record.
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
    slug: 'fawde-4dw93-45dt4',
    brand: 'FAWDE',
    model: '4DW93-45DT4',
    series: '4DW Series',
    cylinders: 4,
    configuration: 'L4',
    displacement_l: 2.545,
    power_kw: 33,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    origin: 'China',
    description:
      'FAWDE 4DW93-45DT4 2.545 L inline-4 diesel engine. EPA annual '
      + 'certification records list 33 kWm at 1800 RPM under Tier 4 Final '
      + 'for model years 2016 through 2018.',
  },
  {
    slug: 'isuzu-kv-4le1',
    brand: 'Isuzu',
    model: 'KV-4LE1',
    series: 'LE Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 2.179,
    power_kw: 26,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Japan',
    description:
      'Isuzu KV-4LE1 2.179 L inline-4 naturally aspirated diesel engine. '
      + 'EPA annual certification records list 26 kWm at 1800 RPM under '
      + 'Interim Tier 4. It is distinct from the turbocharged KV-4LE1T.',
  },
  {
    slug: 'yanmar-3tnv82a-cl',
    brand: 'Yanmar',
    model: '3TNV82A-CL',
    series: 'TNV Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.331,
    power_kw: 14,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    origin: 'Japan',
    description:
      'Yanmar 3TNV82A-CL 1.331 L inline-3 naturally aspirated water-cooled '
      + 'diesel engine. EPA annual certification records list 14 kWm at '
      + '1800 RPM under Tier 4 Final. Yanmar documentation confirms the '
      + '3TNV82A displacement, cylinder count and naturally aspirated design.',
  },
].map((record) => ({
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  ...record,
}))

const correction = {
  slug: 'yanmar-3tnv82a-gge',
  displacement_l: 1.331,
  configuration: 'L3 Naturally Aspirated',
  description:
    'Yanmar 3TNV82A-GGE is a 1.331 L inline-3 naturally aspirated '
    + 'diesel generator-drive engine in the TNV Series. The stored generator '
    + 'ratings are 9.9 kWe standby at 1500 RPM and 11.9 kWe standby at '
    + '1800 RPM. U.S. EPA Tier 2.',
}

const storedDocuments = [
  {
    storagePath: 'fawde/brochures/fawde-genset-engine-catalog.pdf',
    label: 'FAWDE Generator Engine Catalog',
    type: 'brochure',
    slugs: ['fawde-4dw93-45dt4'],
  },
  {
    storagePath: 'yanmar/brochures/yanmar-industrial-engine-product-guide.pdf',
    label: 'Yanmar Industrial Engine Product Guide',
    type: 'brochure',
    slugs: ['yanmar-3tnv82a-cl'],
  },
]

async function linkStoredDocument(document, engineBySlug) {
  const { data: existingFile, error: existingFileError } = await supabase
    .from('engine_pdfs')
    .select('file_size_bytes')
    .eq('storage_path', document.storagePath)
    .limit(1)
    .maybeSingle()
  if (existingFileError) throw existingFileError
  if (!existingFile) {
    throw new Error(`Stored document not found: ${document.storagePath}`)
  }

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
      file_size_bytes: existingFile.file_size_bytes,
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
  .in('slug', [...slugs, correction.slug])
if (existingError) throw existingError

const existingSlugs = new Set(existing.map((engine) => engine.slug))
console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  brand: record.brand,
  model: record.model,
  certified_kwm: record.power_kw,
  emissions: record.emissions_standard,
})))
console.log(
  `${existingSlugs.has(correction.slug) ? 'update' : 'missing'} `
  + `${correction.slug}: displacement 1.642 -> 1.331 L`,
)

if (!existingSlugs.has(correction.slug)) {
  throw new Error(`Correction target not found: ${correction.slug}`)
}

if (!apply) {
  console.log(
    `\nDry run: ${records.filter((record) => existingSlugs.has(record.slug)).length} `
    + `records will be updated and `
    + `${records.filter((record) => !existingSlugs.has(record.slug)).length} inserted.`,
  )
  console.log('One existing Yanmar page will receive a targeted data correction.')
  process.exit(0)
}

const { error: upsertError } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
if (upsertError) throw upsertError

const { error: correctionError } = await supabase
  .from('engines')
  .update({
    displacement_l: correction.displacement_l,
    configuration: correction.configuration,
    description: correction.description,
  })
  .eq('slug', correction.slug)
if (correctionError) throw correctionError

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
  await linkStoredDocument(document, engineBySlug)
}

console.log(
  `Saved ${records.length} exact EPA records, corrected ${correction.slug}, `
  + `and ensured ${storedDocuments.length} stored document sets.`,
)
