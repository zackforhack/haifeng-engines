// Close the 2012 constant-speed EPA review tier.
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
    slug: 'caterpillar-3516c-hd',
    brand: 'Caterpillar',
    model: '3516C-HD',
    series: '3500 Series',
    cylinders: 16,
    configuration: 'V16 Turbocharged Aftercooled',
    displacement_l: 78.081,
    power_kw: 2760,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'United States',
    description:
      'Caterpillar 3516C-HD is a 78.081 L V16 turbocharged and aftercooled '
      + 'diesel engine. EPA annual certification data lists constant-speed '
      + 'configurations from 2,285 to 2,760 kWm at 1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'john-deere-6068h',
    brand: 'John Deere',
    model: '6068H',
    series: '6068 Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 6.788,
    power_kw: 235,
    emissions_standard: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
    origin: 'United States',
    description:
      'John Deere 6068H is a 6.788 L inline-6 turbocharged and aftercooled '
      + 'diesel engine family. EPA annual certification data lists '
      + 'constant-speed configurations from 147 to 235 kWm at 1800 RPM '
      + 'under Tier 3.',
  },
  {
    slug: 'deutz-d914l03',
    brand: 'Deutz',
    model: 'D914L03',
    series: '914 Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    cooling_method: 'Air-Cooled',
    displacement_l: 3.236,
    power_kw: 36,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Germany',
    description:
      'Deutz D914L03 is a 3.236 L inline-3 naturally aspirated air-cooled '
      + 'diesel engine. EPA annual certification data lists 36 kWm at '
      + '1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'kohler-kdw1603ge-1800rpm',
    brand: 'Kohler',
    model: 'KDW1603GE (1800 RPM)',
    series: 'KDW Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.649,
    power_kw: 18,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    origin: 'Italy',
    description:
      'Kohler KDW1603GE is a 1.649 L inline-3 naturally aspirated diesel '
      + 'generator engine. EPA annual certification data lists 18 kWm at '
      + '1800 RPM under Tier 4 Final. The equivalent historical Lombardini '
      + 'LDW1603GE certification name maps to this engine.',
  },
  {
    slug: 'kohler-kdw2204tge',
    brand: 'Kohler',
    model: 'KDW2204TGE',
    series: 'KDW Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 2.199,
    power_kw: 31,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Italy',
    description:
      'Kohler KDW2204TGE is a 2.199 L inline-4 turbocharged diesel generator '
      + 'engine. EPA annual certification data lists 31 kWm at 1800 RPM '
      + 'under Interim Tier 4. The equivalent historical Lombardini '
      + 'LDW2204TGE certification name maps to this engine.',
  },
  {
    slug: 'isuzu-bu-4jj1t',
    brand: 'Isuzu',
    model: 'BU-4JJ1T',
    series: '4JJ1 Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 2.999,
    power_kw: 50,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Japan',
    description:
      'Isuzu BU-4JJ1T is a 2.999 L inline-4 turbocharged diesel engine '
      + 'configuration. EPA annual certification data lists 50 kWm at '
      + '1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'kubota-v2003-m-bg-et',
    brand: 'Kubota',
    model: 'V2003-M-BG-ET',
    series: 'V2003 Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 2,
    power_kw: 25,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Japan',
    description:
      'Kubota V2003-M-BG-ET is a 2.000 L inline-4 naturally aspirated '
      + 'generator-drive diesel engine. EPA annual certification data lists '
      + '24 to 25 kWm at 1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'kubota-v2003-m-t-bg-et',
    brand: 'Kubota',
    model: 'V2003-M-T-BG-ET',
    series: 'V2003 Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 2,
    power_kw: 32,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Japan',
    description:
      'Kubota V2003-M-T-BG-ET is a 2.000 L inline-4 turbocharged '
      + 'generator-drive diesel engine. EPA annual certification data lists '
      + '31 to 32 kWm at 1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'kubota-v2403-m-bg-et',
    brand: 'Kubota',
    model: 'V2403-M-BG-ET',
    series: 'V2403 Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 2.435,
    power_kw: 31,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Japan',
    description:
      'Kubota V2403-M-BG-ET is a 2.435 L inline-4 naturally aspirated '
      + 'generator-drive diesel engine. EPA annual certification data lists '
      + '30 to 31 kWm at 1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'lister-petter-lpws2',
    brand: 'Lister Petter',
    model: 'LPWS2',
    series: 'Alpha LPW Series',
    cylinders: 2,
    configuration: 'L2 Naturally Aspirated',
    displacement_l: 0.929,
    power_kw: 10,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'United Kingdom',
    description:
      'Lister Petter LPWS2 is a 0.929 L inline-2 naturally aspirated '
      + 'water-cooled diesel engine. EPA annual certification data lists '
      + '10 kWm at 1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'lister-petter-lpws3',
    brand: 'Lister Petter',
    model: 'LPWS3',
    series: 'Alpha LPW Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.394,
    power_kw: 15,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'United Kingdom',
    description:
      'Lister Petter LPWS3 is a 1.394 L inline-3 naturally aspirated '
      + 'water-cooled diesel engine. EPA annual certification data lists '
      + '15 kWm at 1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'lister-petter-lpws4',
    brand: 'Lister Petter',
    model: 'LPWS4',
    series: 'Alpha LPW Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 1.859,
    power_kw: 20,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'United Kingdom',
    description:
      'Lister Petter LPWS4 is a 1.859 L inline-4 naturally aspirated '
      + 'water-cooled diesel engine. EPA annual certification data lists '
      + '20 kWm at 1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'lister-petter-lpwst4',
    brand: 'Lister Petter',
    model: 'LPWST4',
    series: 'Alpha LPW Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 1.859,
    power_kw: 24,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'United Kingdom',
    description:
      'Lister Petter LPWST4 is a 1.859 L inline-4 turbocharged water-cooled '
      + 'diesel engine. EPA annual certification data lists 24 kWm at '
      + '1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'hatz-3m41z',
    brand: 'Hatz',
    model: '3M41Z',
    series: 'M Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    cooling_method: 'Air-Cooled',
    displacement_l: 2.574,
    power_kw: 31,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Germany',
    description:
      'Hatz 3M41Z is a 2.574 L inline-3 naturally aspirated air-cooled '
      + 'diesel engine. EPA annual certification data lists 31 kWm at '
      + '1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'hatz-4m41z',
    brand: 'Hatz',
    model: '4M41Z',
    series: 'M Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    cooling_method: 'Air-Cooled',
    displacement_l: 3.432,
    power_kw: 37,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Germany',
    description:
      'Hatz 4M41Z is a 3.432 L inline-4 naturally aspirated air-cooled '
      + 'diesel engine. EPA annual certification data lists 37 kWm at '
      + '1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'hatz-4m42',
    brand: 'Hatz',
    model: '4M42',
    series: 'M Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    cooling_method: 'Air-Cooled',
    displacement_l: 3.432,
    power_kw: 39,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Germany',
    description:
      'Hatz 4M42 is a 3.432 L inline-4 naturally aspirated air-cooled '
      + 'diesel engine. EPA annual certification data lists 39 kWm at '
      + '1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'hatz-4m42z',
    brand: 'Hatz',
    model: '4M42Z',
    series: 'M Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    cooling_method: 'Air-Cooled',
    displacement_l: 3.432,
    power_kw: 38,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Germany',
    description:
      'Hatz 4M42Z is a 3.432 L inline-4 naturally aspirated air-cooled '
      + 'diesel engine. EPA annual certification data lists 38 kWm at '
      + '1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'yanmar-3ca1-g',
    brand: 'Yanmar',
    model: '3CA1-G',
    series: 'EPA Certification',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 0.854,
    power_kw: 8,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    origin: 'Japan',
    description:
      'Yanmar 3CA1-G is a 0.854 L inline-3 naturally aspirated diesel '
      + 'engine configuration. EPA annual certification data lists 8 kWm '
      + 'at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'yanmar-3tnm72-g',
    brand: 'Yanmar',
    model: '3TNM72-G',
    series: 'TNM Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 0.904,
    power_kw: 9,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    origin: 'Japan',
    description:
      'Yanmar 3TNM72-G is a 0.904 L inline-3 naturally aspirated diesel '
      + 'engine configuration. EPA annual certification data lists 9 kWm '
      + 'at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'xinchai-a498bzd1',
    brand: 'Xinchai',
    model: 'A498BZD1',
    series: 'A498 Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 3.168,
    power_kw: 32,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'China',
    description:
      'Xinchai A498BZD1 is a 3.168 L inline-4 turbocharged diesel engine '
      + 'configuration. EPA annual certification data lists 32 kWm at '
      + '1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'xinchai-a498bzd2',
    brand: 'Xinchai',
    model: 'A498BZD2',
    series: 'A498 Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 3.168,
    power_kw: 27,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'China',
    description:
      'Xinchai A498BZD2 is a 3.168 L inline-4 turbocharged diesel engine '
      + 'configuration. EPA annual certification data lists 27 kWm at '
      + '1800 RPM under Interim Tier 4.',
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

console.log(`Saved ${records.length} exact 2012-tier EPA engine records.`)
