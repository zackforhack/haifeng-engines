// Add a consolidated set of exact 1800 RPM EPA-certified engine models.
// Dry-run by default. Use --apply to update Supabase and link stored documents.

import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)

const brandDefaults = {
  FPT: { origin: 'Italy' },
  Perkins: { origin: 'United Kingdom' },
  Isuzu: { origin: 'Japan' },
  Deutz: { origin: 'Germany' },
  Yanmar: { origin: 'Japan' },
}

const variants = [
  // FPT: one ambiguous F4HE9685B*J record is intentionally deferred.
  ['FPT', 'F2CE9685E*E', 'Cursor 9', 6, 'L6 Turbocharged Intercooled', 8.709, 230, 'U.S. EPA Tier 3'],
  ['FPT', 'F4GE9485A*J', 'NEF 4.5', 4, 'L4 Turbocharged', 4.485, 98, 'U.S. EPA Tier 3'],
  ['FPT', 'F4HE9685A*J', 'NEF 6.7', 6, 'L6 Turbocharged Intercooled', 6.728, 208, 'U.S. EPA Tier 3'],
  ['FPT', 'F4HGE415A*V', 'NEF 4.5', 4, 'L4 Turbocharged Intercooled', 4.485, 125, 'U.S. EPA Final Tier 4'],
  ['FPT', 'F4HGE613Z*V', 'NEF 6.7', 6, 'L6 Turbocharged Intercooled', 6.728, 124, 'U.S. EPA Final Tier 4'],
  ['FPT', 'F4HGE615C*V', 'NEF 6.7', 6, 'L6 Turbocharged Intercooled', 6.728, 175, 'U.S. EPA Final Tier 4'],
  ['FPT', 'F4HGE615D*V', 'NEF 6.7', 6, 'L6 Turbocharged Intercooled', 6.728, 230, 'U.S. EPA Final Tier 4'],
  ['FPT', 'F5HGL415A*X', 'F34', 4, 'L4 Turbocharged Intercooled', 3.387, 55, 'U.S. EPA Final Tier 4'],
  ['FPT', 'F5MGL415A*V', 'F36', 4, 'L4 Turbocharged Intercooled', 3.595, 105, 'U.S. EPA Final Tier 4'],
  ['FPT', 'F5MGL415B*V', 'F36', 4, 'L4 Turbocharged Intercooled', 3.595, 94, 'U.S. EPA Final Tier 4'],
  ['FPT', 'F5MGL415C*V', 'F36', 4, 'L4 Turbocharged Intercooled', 3.595, 71, 'U.S. EPA Final Tier 4'],

  // Perkins: the parenthetical 403F-15(C1.5) name is represented by an alias.
  ['Perkins', '1206F-E70TA(C7.1)', '1200 Series', 6, 'L6 Turbocharged Aftercooled', 7.014, 122, 'U.S. EPA Final Tier 4'],
  ['Perkins', '1206F-E70TTA(C7.1)', '1200 Series', 6, 'L6 Twin-Turbocharged Aftercooled', 7.014, 239, 'U.S. EPA Final Tier 4'],
  ['Perkins', '402F-05(C0.5)', '400 Series', 2, 'L2 Naturally Aspirated', 0.508, 4, 'U.S. EPA Final Tier 4'],
  ['Perkins', '403F-07(C0.7)', '400 Series', 3, 'L3 Naturally Aspirated', 0.762, 7, 'U.S. EPA Final Tier 4'],
  ['Perkins', '403F-15', '400 Series', 3, 'L3 Naturally Aspirated', 1.496, 15, 'U.S. EPA Final Tier 4'],
  ['Perkins', '1204F-E44TTAN(C4.4)', '1200 Series', 4, 'L4 Twin-Turbocharged Aftercooled', 4.399, 129, 'U.S. EPA Final Tier 4'],
  ['Perkins', 'S773L-F', '400 Series', 3, 'L3 Naturally Aspirated', 1.132, 11, 'U.S. EPA Final Tier 4'],

  // Isuzu certification prefixes distinguish emissions families and power nodes.
  ['Isuzu', 'BP-4LE2X', 'LE Series', 4, 'L4 Turbocharged', 2.179, 49, 'U.S. EPA Final Tier 4'],
  ['Isuzu', 'BQ-6HK1X', 'H Series', 6, 'L6 Turbocharged Intercooled', 7.79, 194, 'U.S. EPA Final Tier 4'],
  ['Isuzu', 'BQ-6WG1X', 'W Series', 6, 'L6 Turbocharged Intercooled', 15.682, 382, 'U.S. EPA Final Tier 4'],
  ['Isuzu', 'BR-4HK1X', 'H Series', 4, 'L4 Turbocharged Intercooled', 5.193, 127, 'U.S. EPA Final Tier 4'],
  ['Isuzu', 'BR-4JJ1X', 'J Series', 4, 'L4 Turbocharged Intercooled', 2.999, 71, 'U.S. EPA Final Tier 4'],
  ['Isuzu', 'BZ-4LE2T', 'LE Series', 4, 'L4 Turbocharged', 2.179, 30, 'U.S. EPA Final Tier 4'],
  ['Isuzu', 'KH-6HK1X', 'H Series', 6, 'L6 Turbocharged Intercooled', 7.79, 198, 'U.S. EPA Tier 3'],
  ['Isuzu', 'KI-4HK1X', 'H Series', 4, 'L4 Turbocharged Intercooled', 5.193, 129, 'U.S. EPA Tier 3'],
  ['Isuzu', 'KJ-4JJ1X', 'J Series', 4, 'L4 Turbocharged Intercooled', 2.999, 73, 'U.S. EPA Tier 3'],
  ['Isuzu', 'KV-4LE1T', 'LE Series', 4, 'L4 Turbocharged', 2.179, 35, 'U.S. EPA Interim Tier 4'],
  ['Isuzu', 'LV-4LE2', 'LE Series', 4, 'L4 Naturally Aspirated', 2.179, 26, 'U.S. EPA Interim Tier 4'],

  // Deutz commercial TAD names and their TCD 2013 certification families.
  ['Deutz', 'TCD2013L04 2V', 'TCD 2013', 4, 'L4 Turbocharged Intercooled', 4.764, 114, 'U.S. EPA Tier 3'],
  ['Deutz', 'TCD2013L06 2V', 'TCD 2013', 6, 'L6 Turbocharged Intercooled', 7.145, 180, 'U.S. EPA Tier 3'],
  ['Deutz', 'TCD2013L06 4V', 'TCD 2013', 6, 'L6 Turbocharged Intercooled', 7.145, 260, 'U.S. EPA Tier 3'],
  ['Deutz', 'TAD550GE', 'TAD 500', 4, 'L4 Turbocharged Intercooled', 4.764, 98, 'U.S. EPA Tier 3'],
  ['Deutz', 'TAD551GE', 'TAD 500', 4, 'L4 Turbocharged Intercooled', 4.764, 114, 'U.S. EPA Tier 3'],
  ['Deutz', 'TAD750GE', 'TAD 700', 6, 'L6 Turbocharged Intercooled', 7.145, 150, 'U.S. EPA Tier 3'],
  ['Deutz', 'TAD751GE', 'TAD 700', 6, 'L6 Turbocharged Intercooled', 7.145, 174, 'U.S. EPA Tier 3'],
  ['Deutz', 'TAD752GE', 'TAD 700', 6, 'L6 Turbocharged Intercooled', 7.145, 212, 'U.S. EPA Tier 3'],
  ['Deutz', 'TAD753GE', 'TAD 700', 6, 'L6 Turbocharged Intercooled', 7.145, 233, 'U.S. EPA Tier 3'],
  ['Deutz', 'TAD754GE', 'TAD 700', 6, 'L6 Turbocharged Intercooled', 7.145, 260, 'U.S. EPA Tier 3'],

  // Exact Yanmar commercial names; opaque EPA-only configuration codes are deferred.
  ['Yanmar', '3TNV76-CL', 'TNV Series', 3, 'L3 Naturally Aspirated', 1.116, 12, 'U.S. EPA Final Tier 4'],
  ['Yanmar', '4TNV88-CL', 'TNV Series', 4, 'L4 Naturally Aspirated', 2.19, 24, 'U.S. EPA Final Tier 4 / U.S. EPA Interim Tier 4'],
]

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const records = variants.map(([
  brand,
  model,
  series,
  cylinders,
  configuration,
  displacement_l,
  power_kw,
  emissions_standard,
]) => ({
  brand,
  model,
  slug: `${slugify(brand)}-${slugify(model)}`,
  series,
  cylinders,
  configuration,
  displacement_l,
  power_kw,
  emissions_standard,
  certifications: emissions_standard.split(' / '),
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  origin: brandDefaults[brand].origin,
  description:
    `${brand} ${model} ${displacement_l} L ${configuration} diesel engine. `
    + `The latest EPA certification record lists up to ${power_kw} kWm at `
    + `1800 RPM. ${emissions_standard}.`,
}))

const slugsByBrand = Object.fromEntries(
  Object.keys(brandDefaults).map((brand) => [
    brand,
    records.filter((record) => record.brand === brand).map((record) => record.slug),
  ]),
)

const documents = [
  {
    label: 'FPT G-Drive Power Generation Line-Up 2025',
    type: 'brochure',
    storage_path: 'fpt/brochures/g-drive-powergen-lineup-2025.pdf',
    file_size_bytes: 78426,
    slugs: slugsByBrand.FPT,
  },
  {
    label: 'Perkins Regulated Engine Selection Chart (2026)',
    type: 'datasheet',
    storage_path: 'perkins/selection-charts/2026-perkins-regulated.pdf',
    file_size_bytes: 1191326,
    slugs: slugsByBrand.Perkins,
  },
  {
    label: 'Isuzu Engines & Power Units Product Line-up 2026',
    type: 'brochure',
    storage_path:
      'isuzu/spec-sheets/'
      + 'isuzu-engines-and-power-units-product-line-up-brochure-2026-web.pdf',
    file_size_bytes: 1802342,
    slugs: slugsByBrand.Isuzu,
  },
  {
    label: 'Deutz TCD2013L06 Engine Datasheet',
    type: 'datasheet',
    storage_path: 'deutz/spec-sheets/motordatenblatt-deutz-tcd2013l06.pdf',
    file_size_bytes: 20534,
    slugs: [
      'deutz-tcd2013l06-2v',
      'deutz-tcd2013l06-4v',
      'deutz-tad750ge',
      'deutz-tad751ge',
      'deutz-tad752ge',
      'deutz-tad753ge',
      'deutz-tad754ge',
    ],
  },
  {
    label: 'Yanmar TNV Series Product Brochure',
    type: 'brochure',
    storage_path: 'yanmar/tnv-series-brochure.pdf',
    file_size_bytes: 2663397,
    slugs: slugsByBrand.Yanmar,
  },
]

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
  brand: record.brand,
  model: record.model,
  certified_kwm: record.power_kw,
  emissions: record.emissions_standard,
})))

if (!apply) {
  const counts = Object.fromEntries(
    Object.keys(brandDefaults).map((brand) => [
      brand,
      records.filter((record) => record.brand === brand).length,
    ]),
  )
  console.log('\nBrand counts:', counts)
  console.log(
    `Dry run: ${existing.length} records will be updated and `
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

for (const document of documents) {
  const engineIds = document.slugs.map((slug) => engineBySlug.get(slug).id)
  const { data: linked, error: linkedError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('storage_path', document.storage_path)
    .in('engine_id', engineIds)
  if (linkedError) throw linkedError

  const linkedIds = new Set(linked.map((row) => row.engine_id))
  const links = engineIds
    .filter((engineId) => !linkedIds.has(engineId))
    .map((engineId) => ({
      engine_id: engineId,
      type: document.type,
      label: document.label,
      storage_path: document.storage_path,
      file_size_bytes: document.file_size_bytes,
    }))
  if (links.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
    if (linkError) throw linkError
  }
}

console.log(
  `Saved ${records.length} exact EPA records and ensured `
  + `${documents.length} shared official document sets.`,
)
