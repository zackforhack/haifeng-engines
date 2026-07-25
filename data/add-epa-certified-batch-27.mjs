// Close the 2013 constant-speed EPA review tier.
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
    slug: 'john-deere-3029t',
    brand: 'John Deere',
    model: '3029T',
    series: '3029 Series',
    cylinders: 3,
    configuration: 'L3 Turbocharged',
    displacement_l: 2.94,
    power_kw: 48,
    emissions_standard: 'U.S. EPA Tier 3 / U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Tier 3', 'U.S. EPA Interim Tier 4'],
    description:
      'John Deere 3029T is a 2.940 L inline-3 turbocharged diesel engine '
      + 'family. EPA annual certification data lists constant-speed '
      + 'configurations from 35 to 48 kWm at 1800 RPM under Tier 3 and '
      + 'Interim Tier 4.',
  },
  {
    slug: 'john-deere-4024h',
    brand: 'John Deere',
    model: '4024H',
    series: '4024 Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged Aftercooled',
    displacement_l: 2.44,
    power_kw: 60,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    description:
      'John Deere 4024H is a 2.440 L inline-4 turbocharged and aftercooled '
      + 'diesel engine family. EPA annual certification data lists 60 kWm '
      + 'at 1800 RPM under Tier 3.',
  },
  {
    slug: 'john-deere-4045h',
    brand: 'John Deere',
    model: '4045H',
    series: '4045 Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged Aftercooled',
    displacement_l: 4.525,
    power_kw: 147,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    description:
      'John Deere 4045H is a 4.525 L inline-4 turbocharged and aftercooled '
      + 'diesel engine family. EPA annual certification data lists '
      + 'constant-speed configurations from 65 to 147 kWm at 1800 RPM '
      + 'under Tier 3.',
  },
  {
    slug: 'john-deere-4045t',
    brand: 'John Deere',
    model: '4045T',
    series: '4045 Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 4.525,
    power_kw: 74,
    emissions_standard:
      'U.S. EPA Tier 3 / U.S. EPA Interim Tier 4 / U.S. EPA Final Tier 4',
    certifications: [
      'U.S. EPA Tier 3',
      'U.S. EPA Interim Tier 4',
      'U.S. EPA Tier 4 Final',
    ],
    description:
      'John Deere 4045T is a 4.525 L inline-4 turbocharged diesel engine '
      + 'family. EPA annual certification data lists constant-speed '
      + 'configurations from 55 to 74 kWm at 1800 RPM across Tier 3, '
      + 'Interim Tier 4 and Tier 4 Final families.',
  },
  {
    slug: 'john-deere-5030h',
    brand: 'John Deere',
    model: '5030H',
    series: '5030 Series',
    cylinders: 5,
    configuration: 'L5 Turbocharged Aftercooled',
    displacement_l: 3.05,
    power_kw: 72,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    description:
      'John Deere 5030H is a 3.050 L inline-5 turbocharged and aftercooled '
      + 'diesel engine family. EPA annual certification data lists 72 kWm '
      + 'at 1800 RPM under Tier 3.',
  },
  {
    slug: 'john-deere-6090h',
    brand: 'John Deere',
    model: '6090H',
    series: '6090 Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 8.984,
    power_kw: 345,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    description:
      'John Deere 6090H is an 8.984 L inline-6 turbocharged and aftercooled '
      + 'diesel engine family. EPA annual certification data lists '
      + 'constant-speed configurations from 229 to 345 kWm at 1800 RPM '
      + 'under Tier 3.',
  },
  {
    slug: 'isuzu-bl-6wg1x',
    brand: 'Isuzu',
    model: 'BL-6WG1X',
    series: '6WG1 Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 15.682,
    power_kw: 397,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Isuzu BL-6WG1X is a 15.682 L inline-6 turbocharged and aftercooled '
      + 'diesel engine configuration. EPA annual certification data lists '
      + '397 kWm at 1800 RPM under Interim Tier 4. It remains separate '
      + 'from later 6WG1X Tier 4 Final configurations.',
  },
  {
    slug: 'perkins-2506d-e15tag0',
    brand: 'Perkins',
    model: '2506D-E15TAG0',
    series: '2500 Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 15.213,
    power_kw: 479,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    description:
      'Perkins 2506D-E15TAG0 is a 15.213 L inline-6 turbocharged and '
      + 'aftercooled diesel engine. EPA annual certification data lists '
      + '479 kWm at 1800 RPM under Tier 3 for model years 2012 and 2013.',
  },
  {
    slug: 'perkins-2506d-e15tagg',
    brand: 'Perkins',
    model: '2506D-E15TAGG',
    series: '2500 Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 15.213,
    power_kw: 407,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    description:
      'Perkins 2506D-E15TAGG is a 15.213 L inline-6 turbocharged and '
      + 'aftercooled diesel engine. EPA annual certification data lists '
      + '407 kWm at 1800 RPM under Tier 3 for model years 2012 and 2013.',
  },
].map((record) => ({
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  origin: record.brand === 'John Deere'
    ? 'United States'
    : record.brand === 'Isuzu'
      ? 'Japan'
      : 'United Kingdom',
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

console.log(`Saved ${records.length} exact 2013-tier EPA records.`)
