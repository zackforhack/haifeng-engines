// Resolve Mercedes-Benz/Daimler Truck constant-speed EPA certifications.
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
    slug: 'mercedes-benz-om924la',
    model: 'OM 924 LA',
    series: 'OM 900 Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged Aftercooled',
    displacement_l: 4.801,
    power_kw: 134,
    description:
      'Mercedes-Benz OM 924 LA is a 4.801 L inline-4 turbocharged and '
      + 'charge-cooled diesel engine. EPA annual certification data lists '
      + 'constant-speed Tier 3 configurations from 88 to 147 kWm at '
      + '1800 RPM from 2015 through 2024; current Daimler Truck filings '
      + 'include 97, 119 and 134 kWm power nodes.',
  },
  {
    slug: 'mercedes-benz-om926la',
    model: 'OM 926 LA',
    series: 'OM 900 Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 7.201,
    power_kw: 224,
    description:
      'Mercedes-Benz OM 926 LA is a 7.201 L inline-6 turbocharged and '
      + 'charge-cooled diesel engine. EPA annual certification data lists '
      + 'constant-speed Tier 3 configurations from 162 to 247 kWm at '
      + '1800 RPM from 2015 through 2024; current Daimler Truck filings '
      + 'include 162, 187, 212 and 224 kWm power nodes.',
  },
].map((record) => ({
  brand: 'Mercedes-Benz',
  status: 'active',
  origin: 'Germany',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  emissions_standard: 'U.S. EPA Tier 3',
  certifications: ['U.S. EPA Tier 3'],
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
  representative_kwm: record.power_kw,
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

console.log(`Saved ${records.length} Mercedes-Benz EPA engine records.`)
