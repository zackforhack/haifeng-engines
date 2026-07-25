// Close the 2014 constant-speed EPA review tier.
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
    slug: 'volvo-penta-twd1663ge',
    brand: 'Volvo Penta',
    model: 'TWD1663GE',
    series: 'TWD 16L',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 16.123,
    power_kw: 685,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Sweden',
    description:
      'Volvo Penta TWD1663GE is a 16.123 L inline-6 turbocharged and '
      + 'aftercooled diesel engine. EPA annual certification data lists '
      + '685 kWm at 1800 RPM under Interim Tier 4 for model years '
      + '2012 through 2014.',
  },
  {
    slug: 'hyundai-p180fe',
    brand: 'Hyundai',
    model: 'P180FE',
    series: 'P Series',
    cylinders: 10,
    configuration: 'V10 Turbocharged Intercooled',
    displacement_l: 18.272,
    power_kw: 566,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'South Korea',
    description:
      'Hyundai P180FE is an 18.272 L V10 diesel engine configuration. '
      + 'EPA annual certification data lists 566 kWm at 1800 RPM under '
      + 'Tier 2 for model years 2012 through 2014. The exact historical '
      + 'EPA name is retained rather than merging it with the DP180 series.',
  },
  {
    slug: 'hyundai-p222fe',
    brand: 'Hyundai',
    model: 'P222FE',
    series: 'P Series',
    cylinders: 12,
    configuration: 'V12 Turbocharged Intercooled',
    displacement_l: 21.927,
    power_kw: 711,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'South Korea',
    description:
      'Hyundai P222FE is a 21.927 L V12 diesel engine configuration. '
      + 'EPA annual certification data lists 711 kWm at 1800 RPM under '
      + 'Tier 2 for model years 2012 through 2014. The exact historical '
      + 'EPA name is retained rather than merging it with the DP222 series.',
  },
  {
    slug: 'kubota-v3800-cr-ti-bg-ef',
    brand: 'Kubota',
    model: 'V3800-CR-TI-BG-EF',
    series: 'V3800 Series',
    cylinders: 4,
    configuration: 'L4 Common-Rail Turbocharged Intercooled',
    displacement_l: 3.77,
    power_kw: 67,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Japan',
    description:
      'Kubota V3800-CR-TI-BG-EF is a 3.770 L inline-4 common-rail '
      + 'turbocharged and intercooled generator-drive diesel engine. '
      + 'EPA annual certification data lists 67 kWm at 1800 RPM under '
      + 'Interim Tier 4.',
  },
  {
    slug: 'mtu-16v2000g56s',
    brand: 'MTU',
    model: '16V2000G56S',
    series: '2000 Series',
    cylinders: 16,
    configuration: 'V16 Turbocharged Intercooled',
    displacement_l: 35.727,
    power_kw: 809,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    origin: 'Germany',
    description:
      'MTU 16V2000G56S is a 35.727 L V16 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists 809 kWm at '
      + '1800 RPM under Interim Tier 4.',
  },
  {
    slug: 'yanmar-3jtgp1',
    brand: 'Yanmar',
    model: '3JTGP1',
    series: 'EPA Certification',
    cylinders: 3,
    configuration: 'L3 Turbocharged',
    displacement_l: 1.496,
    power_kw: 18,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    origin: 'Japan',
    description:
      'Yanmar 3JTGP1 is a 1.496 L inline-3 turbocharged diesel engine '
      + 'configuration. EPA annual certification data lists 18 kWm at '
      + '1800 RPM under Tier 4 Final. The exact certification name is '
      + 'retained because no verified commercial-model cross-reference '
      + 'was found.',
  },
].map((record) => ({
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  ...record,
}))

const correction = {
  slug: 'cummins-qsb45',
  emissions_standard:
    'U.S. EPA Tier 3 / U.S. EPA Interim Tier 4 / U.S. EPA Final Tier 4',
  certifications: [
    'U.S. EPA Tier 3',
    'U.S. EPA Interim Tier 4',
    'U.S. EPA Tier 4 Final',
  ],
  description:
    'Cummins QSB4.5 is a 4.46 L inline-4 turbocharged and aftercooled '
    + 'diesel engine. EPA annual certification data lists QSB5-G7, '
    + 'QSB5-G8 and QSB5-G9 generator configurations from 83 to 129 kWm '
    + 'at 1800 RPM under Interim Tier 4. The broader commercial platform '
    + 'also includes Tier 3 and Tier 4 Final configurations up to 155 kWm.',
}

const slugs = [...records.map((record) => record.slug), correction.slug]
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug, model, emissions_standard')
  .in('slug', slugs)
if (existingError) throw existingError

const existingBySlug = new Map(existing.map((engine) => [engine.slug, engine]))
console.table(records.map((record) => ({
  action: existingBySlug.has(record.slug) ? 'update' : 'insert',
  brand: record.brand,
  model: record.model,
  displacement_l: record.displacement_l,
  certified_kwm: record.power_kw,
})))
console.log(
  `${existingBySlug.has(correction.slug) ? 'update' : 'missing'} `
  + `${correction.slug}: add Interim Tier 4 certification history`,
)

if (!existingBySlug.has(correction.slug)) {
  throw new Error(`Correction target not found: ${correction.slug}`)
}

if (!apply) {
  console.log(
    `\nDry run: ${records.filter((record) => existingBySlug.has(record.slug)).length} `
    + `records will be updated and `
    + `${records.filter((record) => !existingBySlug.has(record.slug)).length} inserted.`,
  )
  console.log('One existing Cummins commercial page will be expanded.')
  process.exit(0)
}

const { error: upsertError } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
if (upsertError) throw upsertError

const { error: correctionError } = await supabase
  .from('engines')
  .update({
    emissions_standard: correction.emissions_standard,
    certifications: correction.certifications,
    description: correction.description,
  })
  .eq('slug', correction.slug)
if (correctionError) throw correctionError

console.log(`Saved ${records.length} exact records and updated ${correction.slug}.`)
