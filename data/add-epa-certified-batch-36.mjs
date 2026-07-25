// Resolve Lion China constant-speed EPA generator-engine certifications.
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
  { model: 'LN490DZL', power_kw: 36 },
  { model: 'LN490DZL-1', power_kw: 30 },
  { model: 'LN490DZL-2', power_kw: 25 },
  { model: 'LN490DZL-3', power_kw: 20 },
]

const records = variants.map(({ model, power_kw }) => ({
  slug: `lion-${model.toLowerCase()}`,
  brand: 'Lion',
  model,
  series: 'LN490 Series',
  status: 'active',
  origin: 'China',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  cylinders: 4,
  configuration: 'L4 Turbocharged Aftercooled',
  displacement_l: 2.672,
  rpm_rated: 1800,
  power_kw,
  emissions_standard: 'U.S. EPA Interim Tier 4',
  certifications: ['U.S. EPA Interim Tier 4'],
  description:
    `Lion ${model} is a 2.672 L inline-4 turbocharged and air-aftercooled `
    + `diesel generator engine. EPA annual certification data lists `
    + `${power_kw} kWm at 1800 RPM under Interim Tier 4 for model years `
    + `2011 and 2012, with passive oxidation-catalyst and DPF aftertreatment.`,
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

console.log(`Saved ${records.length} Lion EPA generator-engine records.`)
