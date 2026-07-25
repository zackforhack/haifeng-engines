// Resolve KUKJE constant-speed EPA generator-engine certifications.
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
    slug: 'kukje-a1700-gen',
    model: 'A1700-Gen',
    series: 'A Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.715,
    power_kw: 19,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Kukje A1700-Gen is a 1.715 L inline-3 naturally aspirated diesel '
      + 'generator engine. EPA annual certification data lists 19 kWm at '
      + '1800 RPM under Interim Tier 4 from 2013 through 2022.',
  },
  {
    slug: 'kukje-a2300-gen',
    model: 'A2300-Gen',
    series: 'A Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 2.287,
    power_kw: 25,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Kukje A2300-Gen is a 2.287 L inline-4 naturally aspirated diesel '
      + 'generator engine. EPA annual certification data lists 25 kWm at '
      + '1800 RPM under Interim Tier 4 from 2013 through 2022.',
  },
  {
    slug: 'kukje-a2300t-gen',
    model: 'A2300T-Gen',
    series: 'A Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 2.287,
    power_kw: 36,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Kukje A2300T-Gen is a 2.287 L inline-4 turbocharged diesel generator '
      + 'engine. EPA annual certification data lists 36 kWm at 1800 RPM '
      + 'under Interim Tier 4 from 2013 through 2022.',
  },
  {
    slug: 'kukje-a2400t-gen1',
    model: 'A2400T-Gen1',
    series: 'A Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 2.392,
    power_kw: 36,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Kukje A2400T-Gen1 is a 2.392 L inline-4 turbocharged diesel '
      + 'generator engine. EPA annual certification data lists 36 kWm at '
      + '1800 RPM under Interim Tier 4 from 2011 through 2022.',
  },
  {
    slug: 'kukje-d3400t-gen1',
    model: 'D3400T-Gen1',
    series: 'D Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged Aftercooled',
    displacement_l: 3.409,
    power_kw: 64,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    description:
      'Kukje D3400T-Gen1 is a 3.409 L inline-4 turbocharged and aftercooled '
      + 'diesel generator engine. EPA annual certification data lists '
      + '64 kWm at 1800 RPM under Tier 3 from 2012 through 2022.',
  },
  {
    slug: 'kukje-a1100-gen',
    model: 'A1100-Gen',
    series: 'A Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.175,
    power_kw: 13,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Kukje A1100-Gen is a 1.175 L inline-3 naturally aspirated diesel '
      + 'generator engine. EPA annual certification data lists 13 kWm at '
      + '1800 RPM under Tier 4 Final from 2013 through 2019.',
  },
].map((record) => ({
  brand: 'Kukje',
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  origin: 'South Korea',
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

console.log(`Saved ${records.length} Kukje EPA generator-engine records.`)
