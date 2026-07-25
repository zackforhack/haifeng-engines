// Add exact 1800 RPM EPA-certified models that are not represented by an
// existing commercial model page. Dry-run by default; pass --apply to save.

import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const brandDefaults = {
  Baudouin: { origin: 'France' },
  Caterpillar: { origin: 'United States' },
  Hyundai: { origin: 'South Korea' },
  'John Deere': { origin: 'United States' },
  Kirloskar: { origin: 'India' },
  Kohler: { origin: 'France' },
  Liebherr: { origin: 'Switzerland' },
}

const variants = [
  // Hyundai certification names are distinct from the DP commercial names.
  ['Hyundai', 'DM02AP', 'DM Series', 4, 'L4 Turbocharged', 2.392, 55, 55, 'U.S. EPA Tier 3'],
  ['Hyundai', 'DX05G', 'DX Series', 4, 'L4 Turbocharged Intercooled', 5.018, 150, 197, 'U.S. EPA Tier 3'],
  ['Hyundai', 'DX05PG', 'DX Series', 4, 'L4 Turbocharged Intercooled', 5.018, 150, 200, 'U.S. EPA Final Tier 4'],
  ['Hyundai', 'DX08G', 'DX Series', 6, 'L6 Turbocharged Intercooled', 7.527, 234, 294, 'U.S. EPA Tier 3'],
  ['Hyundai', 'DX12G', 'DX Series', 8, 'V8 Turbocharged Intercooled', 11.051, 375, 441, 'U.S. EPA Tier 3'],
  ['Hyundai', 'DX15G', 'DX Series', 8, 'V8 Turbocharged Intercooled', 15.133, 618, 662, 'U.S. EPA Tier 2'],
  ['Hyundai', 'DX15GA', 'DX Series', 8, 'V8 Turbocharged Intercooled', 15.133, 522, 560, 'U.S. EPA Tier 3'],
  ['Hyundai', 'DX22', 'DX Series', 12, 'V12 Turbocharged Intercooled', 21.927, 836, 995, 'U.S. EPA Tier 2'],

  // Caterpillar certification model names from annual EPA records.
  ['Caterpillar', '1506', '1500 Series', 6, 'L6 Turbocharged Intercooled', 8.808, 297, 358, 'U.S. EPA Tier 3'],
  ['Caterpillar', '2206F', '2200 Series', 6, 'L6 Turbocharged Intercooled', 12.503, 423, 423, 'U.S. EPA Final Tier 4'],
  ['Caterpillar', '3512E', '3500 Series', 12, 'V12 Turbocharged Intercooled', 58.561, 1120, 1864, 'U.S. EPA Final Tier 4'],
  ['Caterpillar', '3516E', '3500 Series', 16, 'V16 Turbocharged Intercooled', 78.081, 2725, 3372, 'U.S. EPA Tier 2'],
  ['Caterpillar', '5006C', '5000 Series', 6, 'L6 Turbocharged Intercooled', 22.921, 887, 887, 'U.S. EPA Tier 2'],
  ['Caterpillar', '5016C', '5000 Series', 16, 'V16 Turbocharged Intercooled', 61.123, 2015, 2283, 'U.S. EPA Tier 2'],

  // New John Deere families with no existing commercial variant in the catalog.
  ['John Deere', '4039', '4000 Series', 4, 'L4 Turbocharged Intercooled', 3.941, 86, 126, 'U.S. EPA Final Tier 4'],
  ['John Deere', '6135', '6000 Series', 6, 'L6 Turbocharged Intercooled', 13.548, 345, 563, 'U.S. EPA Interim Tier 4 / U.S. EPA Tier 3 / U.S. EPA Final Tier 4'],
  ['John Deere', '6180', '6000 Series', 6, 'L6 Turbocharged Intercooled', 17.96, 600, 710, 'U.S. EPA Tier 3'],

  // Exact Kirloskar certification models.
  ['Kirloskar', '2R550NA1', 'R Series', 2, 'L2 Naturally Aspirated', 1.092, 12, 12, 'U.S. EPA Final Tier 4'],
  ['Kirloskar', '3R550NA1', 'R Series', 3, 'L3 Naturally Aspirated', 1.638, 17, 17, 'U.S. EPA Final Tier 4'],
  ['Kirloskar', '4K1080TA1', 'K Series', 4, 'L4 Turbocharged Aftercooled', 4.33, 115, 115, 'U.S. EPA Tier 3 / U.S. EPA Final Tier 4'],
  ['Kirloskar', '4R810NA1', 'R Series', 4, 'L4 Naturally Aspirated', 3.243, 35, 35, 'U.S. EPA Tier 2 / U.S. EPA Final Tier 4'],
  ['Kirloskar', '4R810TA1', 'R Series', 4, 'L4 Turbocharged Aftercooled', 3.243, 70, 70, 'U.S. EPA Tier 3 / U.S. EPA Final Tier 4'],
  ['Kirloskar', '4R810TA2', 'R Series', 4, 'L4 Turbocharged Aftercooled', 3.243, 48, 48, 'U.S. EPA Tier 3 / U.S. EPA Final Tier 4'],

  // Kohler commercial designations certified under Liebherr's EPA filing.
  ['Kohler', 'KDI1903ESM', 'KDI Series', 3, 'L3 Naturally Aspirated', 1.861, 21, 21, 'U.S. EPA Tier 2 / U.S. EPA Final Tier 4'],
  ['Kohler', 'KD18L06-6AES', 'KD Series', 6, 'L6 Turbocharged Intercooled', 17.96, 670, 670, 'U.S. EPA Tier 2'],
  ['Kohler', 'KD18L06-6BES', 'KD Series', 6, 'L6 Turbocharged Intercooled', 17.96, 785, 785, 'U.S. EPA Tier 2'],
  ['Kohler', 'KD18L06-6CES', 'KD Series', 6, 'L6 Turbocharged Intercooled', 17.96, 820, 820, 'U.S. EPA Tier 2'],
  ['Liebherr', 'D9912G', 'D99 Series', 12, 'V12 Turbocharged Intercooled', 62.056, 2180, 2700, 'U.S. EPA Tier 2'],
  ['Liebherr', 'D9916G', 'D99 Series', 16, 'V16 Turbocharged Intercooled', 82.742, 3010, 3490, 'U.S. EPA Tier 2'],

  // These current Baudouin families have no commercial variants in the catalog.
  ['Baudouin', '20M55', 'M55 Series', 20, 'V20 Turbocharged Intercooled', 109.422, 3905, 4550, 'U.S. EPA Tier 2'],
  ['Baudouin', '20M61', 'M61 Series', 20, 'V20 Turbocharged Intercooled', 121.917, 4850, 5450, 'U.S. EPA Tier 2'],
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
  power_min_kw,
  power_max_kw,
  emissions_standard,
]) => {
  const powerText = power_min_kw === power_max_kw
    ? `${power_max_kw} kWm`
    : `${power_min_kw}-${power_max_kw} kWm`

  return {
    brand,
    model,
    slug: `${slugify(brand)}-${slugify(model)}`,
    series,
    cylinders,
    configuration,
    displacement_l,
    power_kw: power_max_kw,
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
      + `EPA annual certification data lists ${powerText} at 1800 RPM. `
      + `${emissions_standard}.`,
  }
})

const slugsByBrand = Object.fromEntries(
  Object.keys(brandDefaults).map((brand) => [
    brand,
    records.filter((record) => record.brand === brand).map((record) => record.slug),
  ]),
)

const documents = [
  {
    label: 'HCE Engine Product Brochure (2025)',
    type: 'brochure',
    storage_path: 'hyundai/hce-engine-brochure-2025.pdf',
    file_size_bytes: 4072825,
    slugs: slugsByBrand.Hyundai,
  },
  {
    label: 'Hyundai DX Series for Power Generation',
    type: 'brochure',
    storage_path: 'hyundai/hce-dx-series-power-generation.pdf',
    file_size_bytes: 6691089,
    slugs: slugsByBrand.Hyundai.filter((slug) => slug.includes('-dx')),
  },
  {
    label: 'DM02 (DP024) Specification Sheet',
    type: 'datasheet',
    storage_path: 'hyundai/hce-dm02-dp024cap-spec.pdf',
    file_size_bytes: 560132,
    slugs: ['hyundai-dm02ap'],
  },
  {
    label: 'Caterpillar Electric Power Ratings Guide',
    type: 'brochure',
    storage_path: 'caterpillar/brochures/electric-power-ratings-guide.pdf',
    file_size_bytes: 1484020,
    slugs: slugsByBrand.Caterpillar,
  },
  {
    label: 'Rehlko 15REOZK / KDI1903M Specification',
    type: 'datasheet',
    storage_path: 'kohler/kdi1903m-15reozk-specification.pdf',
    file_size_bytes: 654175,
    slugs: ['kohler-kdi1903esm'],
  },
  {
    label: 'Kohler KD Series Generators Brochure',
    type: 'brochure',
    storage_path: 'kohler/brochures/kd-series.pdf',
    file_size_bytes: 7476793,
    slugs: slugsByBrand.Kohler.filter((slug) => slug.includes('-kd18')),
  },
  {
    label: 'Liebherr Combustion Engines Product Line',
    type: 'brochure',
    storage_path: 'liebherr/brochures/combustion-engines-product-line.pdf',
    file_size_bytes: 2455768,
    slugs: slugsByBrand.Liebherr,
  },
]

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
  console.log('\nBrand counts:', Object.fromEntries(
    Object.keys(brandDefaults).map((brand) => [
      brand,
      records.filter((record) => record.brand === brand).length,
    ]),
  ))
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
