// Resolve Suzhou Jinding/JDP constant-speed EPA certifications.
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
  { model: 'JDP385D', cylinders: 3, displacement_l: 1.532, power_kw: 14 },
  { model: 'JDP480D', cylinders: 4, displacement_l: 1.91, power_kw: 16 },
  { model: 'JDP485D', cylinders: 4, displacement_l: 2.156, power_kw: 18 },
]

const records = variants.map((record) => ({
  slug: `jdp-${record.model.toLowerCase()}`,
  brand: 'JDP',
  series: 'JDP Series',
  status: 'active',
  origin: 'China',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  configuration: `L${record.cylinders} Naturally Aspirated`,
  rpm_rated: 1800,
  emissions_standard: 'U.S. EPA Final Tier 4',
  certifications: ['U.S. EPA Tier 4 Final'],
  description:
    `JDP ${record.model} is a ${record.displacement_l.toFixed(3)} L inline-`
    + `${record.cylinders} naturally aspirated diesel generator engine. EPA `
    + `annual certification data lists ${record.power_kw} kWm at 1800 RPM `
    + `under Tier 4 Final for model year 2012, with no exhaust `
    + `aftertreatment device listed.`,
  ...record,
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

console.log(`Saved ${records.length} JDP EPA generator-engine records.`)
