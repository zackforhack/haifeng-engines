// Resolve Shandong Huayuan Laidong constant-speed EPA certifications.
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
    slug: 'laidong-4l22d',
    model: '4L22D',
    series: '4L Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 2.156,
    power_kw: 24,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Laidong 4L22D is a 2.156 L inline-4 naturally aspirated diesel '
      + 'generator engine. EPA annual certification data lists 24 kWm at '
      + '1800 RPM under Interim Tier 4 for model years 2011 and 2012.',
  },
  {
    slug: 'laidong-4l22d1',
    model: '4L22D1',
    series: '4L Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 2.156,
    power_kw: 21,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Laidong 4L22D1 is a 2.156 L inline-4 naturally aspirated diesel '
      + 'generator engine. EPA annual certification data lists 21 kWm at '
      + '1800 RPM under Interim Tier 4 for model years 2011 and 2012.',
  },
  {
    slug: 'laidong-4l22d2',
    model: '4L22D2',
    series: '4L Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 2.156,
    power_kw: 29,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Laidong 4L22D2 is a 2.156 L inline-4 naturally aspirated diesel '
      + 'generator engine. EPA annual certification data lists 29 kWm at '
      + '1800 RPM under Interim Tier 4 for model years 2011 and 2012.',
  },
  {
    slug: 'laidong-km385d',
    model: 'KM385D',
    series: 'KM Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.532,
    power_kw: 17,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Laidong KM385D is a 1.532 L inline-3 naturally aspirated diesel '
      + 'generator engine. EPA annual certification data lists 17 kWm at '
      + '1800 RPM under Tier 4 Final for model years 2011 and 2012.',
  },
  {
    slug: 'laidong-ll380d',
    model: 'LL380D',
    series: 'LL Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.357,
    power_kw: 13,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Laidong LL380D is a 1.357 L inline-3 naturally aspirated diesel '
      + 'generator engine. EPA annual certification data lists 13 kWm at '
      + '1800 RPM under Tier 4 Final for model years 2011 and 2012.',
  },
  {
    slug: 'laidong-ll380d-1',
    model: 'LL380D-1',
    series: 'LL Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.357,
    power_kw: 18,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Laidong LL380D-1 is a 1.357 L inline-3 naturally aspirated diesel '
      + 'generator engine. EPA annual certification data lists 18 kWm at '
      + '1800 RPM under Tier 4 Final for model years 2011 and 2012.',
  },
].map((record) => ({
  brand: 'Laidong',
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  origin: 'China',
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

console.log(`Saved ${records.length} Laidong EPA generator-engine records.`)
