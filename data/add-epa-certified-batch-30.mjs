// Resolve IHI Agri-Tech constant-speed certifications into Shibaura engines
// and reviewed Perkins aliases. Dry-run by default; use --apply to save.

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
    slug: 'shibaura-e673l-c',
    model: 'E673L-C',
    series: 'E Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 0.762,
    power_kw: 7,
    emissions_standard: 'U.S. EPA Interim Tier 4 / U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Interim Tier 4', 'U.S. EPA Tier 4 Final'],
    description:
      'Shibaura E673L-C is a 0.762 L inline-3 naturally aspirated diesel '
      + 'engine. EPA annual IHI Agri-Tech certification data lists 7 kWm '
      + 'at 1800 RPM under Interim Tier 4 and Tier 4 Final families from '
      + '2012 through 2017.',
  },
  {
    slug: 'shibaura-e673l-f',
    model: 'E673L-F',
    series: 'E Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 0.762,
    power_kw: 7,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Shibaura E673L-F is a 0.762 L inline-3 naturally aspirated diesel '
      + 'engine. EPA annual IHI Agri-Tech certification data lists 6 and '
      + '7 kWm constant-speed calibrations at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'shibaura-s773l-d',
    model: 'S773L-D',
    series: 'S Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.132,
    power_kw: 11,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Shibaura S773L-D is a 1.132 L inline-3 naturally aspirated diesel '
      + 'engine. EPA annual IHI Agri-Tech certification data lists 11 kWm '
      + 'at 1800 RPM under Tier 4 Final from 2012 through 2016.',
  },
  {
    slug: 'shibaura-s773l-f',
    model: 'S773L-F',
    series: 'S Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.132,
    power_kw: 11,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Shibaura S773L-F is a 1.132 L inline-3 naturally aspirated diesel '
      + 'engine. EPA annual IHI Agri-Tech certification data lists 10 and '
      + '11 kWm constant-speed calibrations at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'shibaura-n843-d',
    model: 'N843-D',
    series: 'N Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.496,
    power_kw: 15,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Shibaura N843-D is a 1.496 L inline-3 naturally aspirated diesel '
      + 'engine. EPA annual IHI Agri-Tech certification data lists 15 kWm '
      + 'at 1800 RPM under Tier 4 Final from 2012 through 2016.',
  },
  {
    slug: 'shibaura-n843-f',
    model: 'N843-F',
    series: 'N Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.496,
    power_kw: 16,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Shibaura N843-F is a 1.496 L inline-3 naturally aspirated diesel '
      + 'engine. EPA annual IHI Agri-Tech certification data lists 15 and '
      + '16 kWm constant-speed calibrations at 1800 RPM under Tier 4 Final.',
  },
  {
    slug: 'shibaura-n844-d',
    model: 'N844-D',
    series: 'N Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 1.995,
    power_kw: 20,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Shibaura N844-D is a 1.995 L inline-4 naturally aspirated diesel '
      + 'engine. EPA annual IHI Agri-Tech certification data lists 20 kWm '
      + 'at 1800 RPM under Interim Tier 4 from 2012 through 2017.',
  },
  {
    slug: 'shibaura-n844l-d',
    model: 'N844L-D',
    series: 'N Series',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 2.217,
    power_kw: 24,
    emissions_standard: 'U.S. EPA Interim Tier 4',
    certifications: ['U.S. EPA Interim Tier 4'],
    description:
      'Shibaura N844L-D is a 2.217 L inline-4 naturally aspirated diesel '
      + 'engine. EPA annual IHI Agri-Tech certification data lists 24 kWm '
      + 'at 1800 RPM under Interim Tier 4 from 2012 through 2016.',
  },
  {
    slug: 'shibaura-n3ldi-t',
    model: 'N3LDI-T',
    series: 'N Series',
    cylinders: 3,
    configuration: 'L3 Turbocharged',
    displacement_l: 1.663,
    power_kw: 20,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Shibaura N3LDI-T is a 1.663 L inline-3 turbocharged diesel engine. '
      + 'EPA annual IHI Agri-Tech certification data lists 20 kWm at '
      + '1800 RPM under Tier 4 Final from 2015 through 2017.',
  },
  {
    slug: 'shibaura-n4ldi-t',
    model: 'N4LDI-T',
    series: 'N Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 2.217,
    power_kw: 30,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Shibaura N4LDI-T is a 2.217 L inline-4 turbocharged diesel engine. '
      + 'EPA annual IHI Agri-Tech certification data lists 30 kWm at '
      + '1800 RPM under Tier 4 Final from 2015 through 2019.',
  },
  {
    slug: 'shibaura-n4ldi-ta',
    model: 'N4LDI-TA',
    series: 'N Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged Aftercooled',
    displacement_l: 2.217,
    power_kw: 36,
    emissions_standard: 'U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Tier 4 Final'],
    description:
      'Shibaura N4LDI-TA is a 2.217 L inline-4 turbocharged and aftercooled '
      + 'diesel engine. EPA annual IHI Agri-Tech certification data lists '
      + '36 kWm at 1800 RPM under Tier 4 Final from 2016 through 2019.',
  },
].map((record) => ({
  brand: 'Shibaura',
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  origin: 'Japan',
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

console.log(`Saved ${records.length} Shibaura EPA engine records.`)
