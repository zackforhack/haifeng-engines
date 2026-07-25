// Close the 2011 constant-speed EPA review tier.
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
    slug: 'kubota-v3800-di-ti-bg-et',
    brand: 'Kubota',
    model: 'V3800-DI-TI-BG-ET',
    series: 'V3800 Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged Intercooled',
    displacement_l: 3.77,
    power_kw: 68,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    origin: 'Japan',
    description:
      'Kubota V3800-DI-TI-BG-ET is a 3.770 L inline-4 turbocharged and '
      + 'intercooled generator-drive diesel engine. EPA annual certification '
      + 'data lists 68 kWm at 1800 RPM under Tier 3. This direct-injection '
      + 'configuration remains separate from later common-rail V3800 models.',
  },
  {
    slug: 'lovol-d4eta',
    brand: 'Lovol',
    model: 'D4ETA',
    series: 'D Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged Intercooled',
    displacement_l: 3.99,
    power_kw: 96,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    origin: 'China',
    description:
      'Lovol D4ETA is a 3.990 L inline-4 turbocharged and intercooled diesel '
      + 'engine family. EPA annual certification data lists 78, 90 and '
      + '96 kWm constant-speed calibrations at 1800 RPM under Tier 3.',
  },
  {
    slug: 'lovol-d6eta',
    brand: 'Lovol',
    model: 'D6ETA',
    series: 'D Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Intercooled',
    displacement_l: 5.985,
    power_kw: 129,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    origin: 'China',
    description:
      'Lovol D6ETA is a 5.985 L inline-6 turbocharged and intercooled diesel '
      + 'engine family. EPA annual certification data lists 115, 124 and '
      + '129 kWm constant-speed calibrations at 1800 RPM under Tier 3.',
  },
].map((record) => ({
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
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

console.log(`Saved ${records.length} engine records covering the 2011 EPA tier.`)
