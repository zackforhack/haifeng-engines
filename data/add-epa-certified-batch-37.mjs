// Resolve Yangdong constant-speed EPA generator-engine certifications.
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
    slug: 'yangdong-yd385zld',
    model: 'YD385ZLD',
    series: 'YD Series',
    cylinders: 3,
    displacement_l: 1.532,
    power_kw: 16,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Yangdong YD385ZLD is a 1.532 L inline-3 turbocharged and '
      + 'air-aftercooled diesel generator engine. EPA annual certification '
      + 'data lists 16 kWm at 1800 RPM under Tier 4 Final for model years '
      + '2011 and 2012.',
  },
  {
    slug: 'yangdong-yd480zld',
    model: 'YD480ZLD',
    series: 'YD Series',
    cylinders: 4,
    displacement_l: 1.81,
    power_kw: 18,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Yangdong YD480ZLD is a 1.810 L inline-4 turbocharged and '
      + 'air-aftercooled diesel generator engine. EPA annual certification '
      + 'data lists 18 kWm at 1800 RPM under Tier 4 Final for model years '
      + '2011 and 2012.',
  },
  {
    slug: 'yangdong-ynd485zld',
    model: 'YND485ZLD',
    series: 'YND Series',
    cylinders: 4,
    displacement_l: 2.156,
    power_kw: 27,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Yangdong YND485ZLD is an inline-4 turbocharged and air-aftercooled '
      + 'diesel generator engine rated 27 kWm at 1800 RPM under EPA Interim '
      + 'Tier 4. EPA data lists a 2.043 L configuration in 2011 and a '
      + 'revised 2.156 L configuration in 2012; this page uses the latest '
      + 'certified displacement.',
  },
  {
    slug: 'yangdong-ysd490zld',
    model: 'YSD490ZLD',
    series: 'YSD Series',
    cylinders: 4,
    displacement_l: 2.545,
    power_kw: 40,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Yangdong YSD490ZLD is a 2.545 L inline-4 turbocharged and '
      + 'air-aftercooled diesel generator engine. EPA annual certification '
      + 'data lists 40 kWm at 1800 RPM under Interim Tier 4 for model years '
      + '2011 and 2012, with electronic EGR.',
  },
].map((record) => ({
  brand: 'Yangdong',
  status: 'active',
  origin: 'China',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  configuration: `${record.cylinders === 3 ? 'L3' : 'L4'} Turbocharged Aftercooled`,
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

console.log(`Saved ${records.length} Yangdong EPA generator-engine records.`)
