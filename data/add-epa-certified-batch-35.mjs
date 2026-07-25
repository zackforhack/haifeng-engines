// Resolve International Motors/Navistar constant-speed EPA certifications.
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

const variants = [
  { model: 'GCB275', power_kw: 254 },
  { model: 'GCB300', power_kw: 280 },
  { model: 'GCB330', power_kw: 309 },
  { model: 'GCB360', power_kw: 309 },
  { model: 'GCB390', power_kw: 309 },
]

const records = variants.map(({ model, power_kw }) => ({
  slug: `international-${model.toLowerCase()}`,
  brand: 'International',
  model,
  series: 'GCB Series',
  status: 'active',
  origin: 'United States',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  cylinders: 6,
  configuration: 'L6 Turbocharged Aftercooled',
  displacement_l: 9.354,
  rpm_rated: 1800,
  power_kw,
  emissions_standard: 'U.S. EPA Tier 3',
  certifications: ['U.S. EPA Tier 3'],
  description:
    `International ${model} is a 9.354 L inline-6 turbocharged and `
    + `air-aftercooled diesel generator engine from the International/Navistar `
    + `engine lineage. EPA annual certification data lists ${power_kw} kWm at `
    + `1800 RPM under Tier 3 for model years 2013 and 2014.`,
}))

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
  displacement_l: record.displacement_l,
  certified_kwm: record.power_kw,
})))

if (!apply) {
  console.log(
    `\nDry run: ${existing.length} records will be updated and `
    + `${records.length - existing.length} inserted.`,
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

console.log(`Saved ${records.length} International EPA generator-engine records.`)
