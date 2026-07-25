// Resolve Daedong constant-speed EPA certifications as exact engine pages.
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
    slug: 'daedong-3a165lfg',
    model: '3A165LFG',
    series: 'A Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.648,
    power_kw: 18,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Daedong 3A165LFG is a 1.648 L inline-3 naturally aspirated diesel '
      + 'engine. EPA annual certification data lists 18 kWm at 1800 RPM '
      + 'under Tier 4 Final from 2016 through 2026.',
  },
  {
    slug: 'daedong-3c100g',
    model: '3C100G',
    series: 'C Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.007,
    power_kw: 10,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Daedong 3C100G is a 1.007 L inline-3 naturally aspirated diesel '
      + 'engine. EPA annual certification data lists 10 kWm at 1800 RPM '
      + 'under Tier 4 Final from 2012 through 2026.',
  },
  {
    slug: 'daedong-3l123g',
    model: '3L123G',
    series: 'L Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.233,
    power_kw: 12,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Daedong 3L123G is a 1.233 L inline-3 naturally aspirated diesel '
      + 'engine. EPA annual certification data lists 9 and 12 kWm '
      + 'constant-speed calibrations at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'daedong-3a165g',
    model: '3A165G',
    series: 'A Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.648,
    power_kw: 18,
    emissions_standard: 'U.S. EPA Interim Tier 4 / U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Interim Tier 4', 'U.S. EPA Tier 4 Final'],
    description:
      'Daedong 3A165G is a 1.648 L inline-3 naturally aspirated diesel '
      + 'engine. EPA annual certification data lists 18 kWm at 1800 RPM '
      + 'under Interim Tier 4 and Tier 4 Final families from 2012 through 2023.',
  },
  {
    slug: 'daedong-3ftg',
    model: '3FTG',
    series: 'F Series',
    cylinders: 3,
    configuration: 'L3 Turbocharged',
    displacement_l: 1.826,
    power_kw: 25,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Daedong 3FTG is a 1.826 L inline-3 turbocharged diesel engine. EPA '
      + 'annual certification data lists 25 kWm at 1800 RPM under Tier 4 '
      + 'Final for model years 2018 and 2019.',
  },
  {
    slug: 'daedong-4ftg',
    model: '4FTG',
    series: 'F Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 2.435,
    power_kw: 37,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Daedong 4FTG is a 2.435 L inline-4 turbocharged diesel engine. EPA '
      + 'annual certification data lists 37 kWm at 1800 RPM under Tier 4 '
      + 'Final for model years 2018 and 2019.',
  },
  {
    slug: 'daedong-3c093g',
    model: '3C093G',
    series: 'C Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 0.928,
    power_kw: 9,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Daedong 3C093G is a 0.928 L inline-3 naturally aspirated diesel '
      + 'engine. EPA annual certification data lists 9 kWm at 1800 RPM '
      + 'under Tier 4 Final for model year 2012.',
  },
  {
    slug: 'daedong-4a220g',
    model: '4A220G',
    series: 'A Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 2.197,
    power_kw: 24,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Daedong 4A220G is a 2.197 L inline-4 naturally aspirated diesel '
      + 'engine. EPA annual certification data lists 24 kWm at 1800 RPM '
      + 'under Interim Tier 4 for model year 2012.',
  },
  {
    slug: 'daedong-4a220tg',
    model: '4A220TG',
    series: 'A Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 2.197,
    power_kw: 30,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Daedong 4A220TG is a 2.197 L inline-4 turbocharged diesel engine. '
      + 'EPA annual certification data lists 30 kWm at 1800 RPM under '
      + 'Interim Tier 4 for model year 2012.',
  },
].map((record) => ({
  brand: 'Daedong',
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

console.log(`Saved ${records.length} Daedong EPA engine records.`)
