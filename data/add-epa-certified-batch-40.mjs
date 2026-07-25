// Resolve the final unmapped constant-speed EPA records: Kipor and ENER-G Rudox.
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

const kipor = ['KD488ZA', 'KD488ZAG'].map((model) => ({
  slug: `kipor-${model.toLowerCase()}`,
  brand: 'Kipor',
  model,
  series: 'KD Series',
  status: 'active',
  origin: 'China',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  cylinders: 4,
  configuration: 'L4 Turbocharged',
  displacement_l: 2.19,
  rpm_rated: 1800,
  power_kw: 27,
  emissions_standard: 'U.S. EPA Interim Tier 4',
  certifications: ['U.S. EPA Interim Tier 4'],
  description:
    `Kipor ${model} is a 2.190 L inline-4 turbocharged diesel generator `
    + `engine. EPA annual certification data lists 27 kWm at 1800 RPM under `
    + `Interim Tier 4 for model years 2011 and 2012.`,
}))

const rudoxMitsubishi = {
  slug: 'mitsubishi-s16r-y2ptaw2-1-rudox-tier4f',
  brand: 'Mitsubishi',
  model: 'S16R-Y2PTAW2-1',
  series: 'S16R Series',
  status: 'active',
  origin: 'Japan',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  cylinders: 16,
  configuration: 'V16 Turbocharged Aftercooled',
  displacement_l: 65.37,
  rpm_rated: 1800,
  power_kw: 2180,
  emissions_standard: 'U.S. EPA Final Tier 4',
  certifications: ['U.S. EPA Tier 4 Final'],
  description:
    'Mitsubishi S16R-Y2PTAW2-1 is a 65.37 L V16 turbocharged and '
    + 'liquid-aftercooled diesel generator engine. This page represents the '
    + 'specific ENER-G Rudox configuration certified by EPA at 2180 kWm and '
    + '1800 RPM under Tier 4 Final for model year 2021. Standard Mitsubishi '
    + 'versions of this engine carry different emissions certification.',
}

const records = [...kipor, rudoxMitsubishi]
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

console.log(`Saved ${records.length} final unmapped EPA engine records.`)
