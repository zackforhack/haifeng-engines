// Add legacy IMPCO stationary natural-gas certification platforms from
// EPA annual SI data. Propane-only ratings are intentionally excluded.
// Dry-run by default. Use --apply to update Supabase.

import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(url, key)
const common = {
  brand: 'IMPCO',
  series: 'Stationary Certified',
  status: 'active',
  origin: 'United States',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA NSPS Subpart JJJJ',
  ],
}

const records = [
  {
    ...common,
    slug: 'impco-3-0l-natural-gas',
    model: '3.0L Natural Gas',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 3,
    power_kw: 39,
    description:
      'IMPCO 3.0L Natural Gas is a naturally aspirated inline-four '
      + 'spark-ignited stationary engine platform certified at '
      + '1800 RPM. EPA annual certification data records the '
      + 'AZ9XB03.0GCE lineage from model years 2011 through 2015 '
      + 'with 32 kWm and 39 kWm natural-gas power nodes. Propane '
      + 'ratings from the separate GPE lineage are not used here.',
  },
  {
    ...common,
    slug: 'impco-5-7l-natural-gas',
    model: '5.7L Natural Gas',
    cylinders: 8,
    configuration: 'V8 Naturally Aspirated',
    displacement_l: 5.7,
    power_kw: 65,
    description:
      'IMPCO 5.7L Natural Gas is a naturally aspirated V8 '
      + 'spark-ignited stationary engine platform certified at '
      + '1800 RPM. EPA annual certification data records the '
      + 'AZ9XB05.7GCE lineage from model years 2011 through 2015 '
      + 'with natural-gas nodes from 45 kWm to 65 kWm. The family '
      + 'also covers a 5.0 L calibration; propane-only GPE ratings '
      + 'are not used on this page.',
  },
]

const slugs = records.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (existingError) throw existingError
const existingSlugs = new Set(existing.map((engine) => engine.slug))

console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  brand: record.brand,
  model: record.model,
  displacement_l: record.displacement_l,
  power_kw: record.power_kw,
})))

if (!apply) {
  console.log(
    `Dry run: ${existing.length} updates, `
    + `${records.length - existing.length} inserts.`,
  )
  process.exit(0)
}

for (const record of records) {
  const query = existingSlugs.has(record.slug)
    ? supabase.from('engines').update(record).eq('slug', record.slug)
    : supabase.from('engines').insert(record)
  const { error } = await query
  if (error) throw error
}

const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (savedError) throw savedError
if (saved.length !== records.length) {
  throw new Error(`Expected ${records.length} saved records; found ${saved.length}`)
}

console.log(`Saved ${records.length} IMPCO EPA SI natural-gas records.`)
