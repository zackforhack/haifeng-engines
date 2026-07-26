// Add the legacy Generac-powered Magnum MGG100M configuration documented by
// multiple field inventory records carrying EPA family EGNXB08.92C5.
// Dry-run by default; pass --apply to write to Supabase.

import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) throw new Error('Supabase credentials are required')

const supabase = createClient(url, key)
const record = {
  slug: 'generac-mgg100m',
  brand: 'Generac',
  model: 'MGG100M',
  series: 'Magnum Mobile Gaseous',
  status: 'discontinued',
  year_introduced: 2014,
  origin: 'United States',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  cylinders: 8,
  displacement_l: 8.9,
  configuration: 'V8 Naturally Aspirated',
  power_kw: 111.9,
  power_hp: 150,
  rpm_rated: 1800,
  rpm_max: 1800,
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'EPA Engine Family EGNXB08.92C5',
  ],
  description:
    'Generac MGG100M is a legacy mobile gaseous generator package using '
    + 'an 8.9 L naturally aspirated V8 rated 150 hp at 1800 RPM. '
    + 'Multiple independent equipment records identify the installed '
    + 'engine as EPA family EGNXB08.92C5 and the package as a 100 kW, '
    + '60 Hz Magnum/Generac MGG100M for natural gas or wellhead gas.',
}

const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .eq('slug', record.slug)
  .maybeSingle()
if (existingError) throw existingError

console.table([{
  action: existing ? 'update' : 'insert',
  slug: record.slug,
  mechanical_kw: record.power_kw,
  epa_family: 'EGNXB08.92C5',
}])
if (!apply) {
  console.log('Dry run: one documented legacy configuration.')
  process.exit(0)
}

const query = existing
  ? supabase.from('engines').update(record).eq('id', existing.id)
  : supabase.from('engines').insert(record)
const { error } = await query
if (error) throw error

console.log('Applied the Generac MGG100M legacy configuration.')
