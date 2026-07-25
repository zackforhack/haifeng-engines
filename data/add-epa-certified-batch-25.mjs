// Close the 2015 constant-speed EPA review tier.
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

function dieselRecord(record) {
  return {
    status: 'active',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800,
    ...record,
  }
}

function perkinsRecord({
  code,
  displacement,
  cylinders,
  powerMin,
  powerMax,
  emissions,
  certifications,
}) {
  const powerText = powerMin === powerMax
    ? `${powerMax} kWm`
    : `${powerMin} to ${powerMax} kWm`
  return dieselRecord({
    slug: `perkins-${code.replace('/', '-')}`,
    brand: 'Perkins',
    model: code,
    series: `${displacement.toFixed(1)} L EPA Certification`,
    cylinders,
    configuration: `L${cylinders}`,
    displacement_l: displacement,
    power_kw: powerMax,
    emissions_standard: emissions,
    certifications,
    origin: 'United Kingdom',
    description:
      `Perkins ${code} is a ${displacement.toFixed(3)} L inline-${cylinders} `
      + 'diesel engine configuration identified in EPA annual certification '
      + `data. The records list ${powerText} at 1800 RPM under ${emissions} `
      + 'for model years 2012 through 2015. The EPA designation is retained '
      + 'because no verified commercial-model cross-reference was found.',
  })
}

function mtuRecord({
  slug,
  model,
  cylinders,
  displacement,
  power,
  description,
}) {
  return dieselRecord({
    slug,
    brand: 'MTU',
    model,
    series: cylinders === 10 ? '1600 Series' : '4000 Series',
    cylinders,
    configuration: `V${cylinders} Turbocharged Intercooled`,
    displacement_l: displacement,
    power_kw: power,
    emissions_standard: cylinders === 10
      ? 'U.S. EPA Tier 3'
      : 'U.S. EPA Tier 2',
    certifications: [
      cylinders === 10 ? 'U.S. EPA Tier 3' : 'U.S. EPA Tier 2',
    ],
    origin: 'Germany',
    description,
  })
}

const records = [
  dieselRecord({
    slug: 'komatsu-saa6d170e2-3',
    brand: 'Komatsu',
    model: 'SAA6D170E2-3',
    series: '170 Series',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 23.152,
    power_kw: 910,
    emissions_standard: 'U.S. EPA Tier 2',
    certifications: ['U.S. EPA Tier 2'],
    origin: 'Japan',
    description:
      'Komatsu SAA6D170E2-3 is a 23.152 L inline-6 turbocharged and '
      + 'aftercooled diesel engine. EPA annual certification data lists '
      + 'constant-speed configurations from 567 to 910 kWm at 1800 RPM '
      + 'under Tier 2 for model years 2012 through 2015.',
  }),
  perkinsRecord({
    code: '2682/1800',
    displacement: 6.598,
    cylinders: 6,
    powerMin: 135,
    powerMax: 172,
    emissions: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
  }),
  perkinsRecord({
    code: '2690/1800',
    displacement: 6.598,
    cylinders: 6,
    powerMin: 139,
    powerMax: 162,
    emissions: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
  }),
  perkinsRecord({
    code: '2694/1800',
    displacement: 6.598,
    cylinders: 6,
    powerMin: 205,
    powerMax: 205,
    emissions: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
  }),
  perkinsRecord({
    code: '3036/1800',
    displacement: 6.598,
    cylinders: 6,
    powerMin: 151,
    powerMax: 151,
    emissions: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
  }),
  perkinsRecord({
    code: '3318/1800',
    displacement: 6.598,
    cylinders: 6,
    powerMin: 151,
    powerMax: 151,
    emissions: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
  }),
  perkinsRecord({
    code: '3454/1800',
    displacement: 4.399,
    cylinders: 4,
    powerMin: 64,
    powerMax: 64,
    emissions: 'U.S. EPA Tier 3',
    certifications: ['U.S. EPA Tier 3'],
  }),
  perkinsRecord({
    code: '3688/1800',
    displacement: 7.014,
    cylinders: 6,
    powerMin: 180,
    powerMax: 180,
    emissions: 'U.S. EPA Tier 3 / U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Tier 3', 'U.S. EPA Interim Tier 4'],
  }),
  perkinsRecord({
    code: '3690/1800',
    displacement: 7.014,
    cylinders: 6,
    powerMin: 152,
    powerMax: 152,
    emissions: 'U.S. EPA Tier 3 / U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Tier 3', 'U.S. EPA Interim Tier 4'],
  }),
  perkinsRecord({
    code: '3728/1800',
    displacement: 7.014,
    cylinders: 6,
    powerMin: 184,
    powerMax: 184,
    emissions: 'U.S. EPA Tier 3 / U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Tier 3', 'U.S. EPA Interim Tier 4'],
  }),
  perkinsRecord({
    code: '3730/1800',
    displacement: 7.014,
    cylinders: 6,
    powerMin: 239,
    powerMax: 239,
    emissions: 'U.S. EPA Tier 3 / U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Tier 3', 'U.S. EPA Interim Tier 4'],
  }),
  mtuRecord({
    slug: 'mtu-12v4000-p83',
    model: 'MTU 12V4000 P83',
    cylinders: 12,
    displacement: 57.199,
    power: 1848,
    description:
      'MTU 12V4000 P83 is a 57.199 L V12 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists 1848 kWm at '
      + '1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-16v4000-p83',
    model: 'MTU 16V4000 P83',
    cylinders: 16,
    displacement: 76.265,
    power: 2464,
    description:
      'MTU 16V4000 P83 is a 76.265 L V16 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists 2464 kWm at '
      + '1800 RPM under Tier 2.',
  }),
]

const corrections = [
  mtuRecord({
    slug: 'mtu-10v1600g70s-3d',
    model: '10V1600G70S',
    cylinders: 10,
    displacement: 17.535,
    power: 511,
    description:
      'MTU 10V1600G70S is a 17.535 L V10 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists both 3B and '
      + '3D constant-speed configurations at 511 kWm and 1800 RPM under '
      + 'Tier 3.',
  }),
  mtuRecord({
    slug: 'mtu-12v4000-g43',
    model: 'MTU 12V4000 G43',
    cylinders: 12,
    displacement: 57.199,
    power: 1736,
    description:
      'MTU 12V4000 G43 is a 57.199 L V12 diesel engine. EPA records list '
      + '3B, 3D and 3F configurations from 1520 to 1736 kWm at 1800 RPM '
      + 'under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-12v4000-g83',
    model: 'MTU 12V4000 G83',
    cylinders: 12,
    displacement: 57.199,
    power: 1910,
    description:
      'MTU 12V4000 G83 is a 57.199 L V12 diesel engine. EPA records list '
      + '3B, 3D and 3F configurations from 1736 to 1910 kWm at 1800 RPM '
      + 'under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-16v4000-g43',
    model: 'MTU 16V4000 G43',
    cylinders: 16,
    displacement: 76.265,
    power: 2280,
    description:
      'MTU 16V4000 G43 is a 76.265 L V16 diesel engine. EPA records list '
      + '3B, 3D and 3F configurations from 2020 to 2280 kWm at 1800 RPM '
      + 'under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-16v4000-g83',
    model: 'MTU 16V4000 G83',
    cylinders: 16,
    displacement: 76.265,
    power: 2500,
    description:
      'MTU 16V4000 G83 is a 76.265 L V16 diesel engine. EPA records list '
      + '3B, 3D and 3F configurations from 2280 to 2500 kWm at 1800 RPM '
      + 'under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-16v4000-g83l',
    model: 'MTU 16V4000 G83L',
    cylinders: 16,
    displacement: 76.265,
    power: 2740,
    description:
      'MTU 16V4000 G83L is a 76.265 L V16 diesel engine. EPA annual '
      + 'certification data lists the 3D configuration at 2740 kWm and '
      + '1800 RPM under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-20v4000-g43',
    model: 'MTU 20V4000 G43',
    cylinders: 20,
    displacement: 95.332,
    power: 2740,
    description:
      'MTU 20V4000 G43 is a 95.332 L V20 diesel engine. EPA records list '
      + '3B, 3D and 3F configurations from 2490 to 2740 kWm at 1800 RPM '
      + 'under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-20v4000-g83',
    model: 'MTU 20V4000 G83',
    cylinders: 20,
    displacement: 95.332,
    power: 3010,
    description:
      'MTU 20V4000 G83 is a 95.332 L V20 diesel engine. EPA records list '
      + '3B, 3D and 3F configurations from 2740 to 3010 kWm at 1800 RPM '
      + 'under Tier 2.',
  }),
  mtuRecord({
    slug: 'mtu-20v4000-g83l',
    model: 'MTU 20V4000 G83L',
    cylinders: 20,
    displacement: 95.332,
    power: 3490,
    description:
      'MTU 20V4000 G83L is a 95.332 L V20 diesel engine. EPA records list '
      + '3B, 3D and 3F configurations from 3010 to 3490 kWm at 1800 RPM '
      + 'under Tier 2.',
  }),
]

const allRecords = [...records, ...corrections]
const slugs = allRecords.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .in('slug', slugs)
if (existingError) throw existingError

const existingBySlug = new Map(existing.map((engine) => [engine.slug, engine]))
console.table(allRecords.map((record) => ({
  action: existingBySlug.has(record.slug) ? 'update' : 'insert',
  brand: record.brand,
  model: record.model,
  displacement_l: record.displacement_l,
  certified_kwm: record.power_kw,
})))

for (const correction of corrections) {
  if (!existingBySlug.has(correction.slug)) {
    throw new Error(`Correction target not found: ${correction.slug}`)
  }
}

if (!apply) {
  console.log(
    `\nDry run: ${records.filter((record) => existingBySlug.has(record.slug)).length} `
    + `new records will be updated and `
    + `${records.filter((record) => !existingBySlug.has(record.slug)).length} inserted.`,
  )
  console.log(`${corrections.length} existing MTU pages will be normalized.`)
  process.exit(0)
}

const { error: upsertError } = await supabase
  .from('engines')
  .upsert(allRecords, { onConflict: 'slug' })
if (upsertError) throw upsertError

const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (savedError) throw savedError
if (saved.length !== allRecords.length) {
  throw new Error(`Expected ${allRecords.length} saved records; found ${saved.length}`)
}

console.log(`Saved ${allRecords.length} reviewed 2015-tier records.`)
