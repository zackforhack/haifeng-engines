// Correct the Caterpillar 78.1 L EPA stationary crosswalk.
// Dry-run by default; pass --apply to update Supabase.

import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(url, key)
const records = [
  {
    slug: 'caterpillar-g3516',
    displacement_l: 78.1,
    cylinders: 16,
    configuration: 'V16 Turbocharged Aftercooled',
    rpm_rated: 1800,
    rpm_max: 1800,
    power_kw: 1688,
    power_hp: 2264,
    standby_power_kw_60hz: 1688,
    standby_power_kwe_60hz: 1500,
    standby_power_kva_60hz: 1875,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: [
      'U.S. EPA Stationary',
      'U.S. EPA NSPS Subpart JJJJ',
    ],
    description:
      'Caterpillar G3516 is a 78.1 L V16 turbocharged natural-gas '
      + 'generator engine. Caterpillar publishes the EPA-certified Fast '
      + 'Response generator set at 1500 ekW standby, 60 Hz and 1800 RPM. '
      + 'EPA large spark-ignited certification lineages report the matching '
      + '78.1 L V16 configuration at a 1688 kWm maximum power node.',
  },
  {
    slug: 'caterpillar-g3516h',
    displacement_l: 78.1,
    cylinders: 16,
    configuration: 'V16 Turbocharged Aftercooled',
    rpm_max: 1800,
    description:
      'Caterpillar G3516H is a 78.1 L V16 turbocharged natural-gas '
      + 'generator engine. Caterpillar publishes continuous generator-set '
      + 'ratings up to 2027 ekW at 1500 RPM, while the XGC1900 package '
      + 'documents a separate 1900 ekW, 60 Hz and 1800 RPM configuration. '
      + 'The G3516H is distinct from the EPA-certified 1500 ekW G3516 '
      + 'Fast Response platform.',
  },
]

const slugs = records.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('slug, model, displacement_l, rpm_rated, rpm_max, power_kw')
  .in('slug', slugs)
if (existingError) throw existingError

console.table(existing)
console.table(records.map((record) => ({
  slug: record.slug,
  displacement_l: record.displacement_l,
  rpm_rated: record.rpm_rated || '(preserve)',
  rpm_max: record.rpm_max,
  power_kw: record.power_kw || '(preserve)',
  standby_kwe_60hz: record.standby_power_kwe_60hz || '(preserve)',
})))

if (!apply) {
  console.log(`Dry run: ${records.length} Caterpillar updates.`)
  process.exit(0)
}

for (const record of records) {
  const { data, error } = await supabase
    .from('engines')
    .update(record)
    .eq('slug', record.slug)
    .select('slug')
    .single()
  if (error) throw error
  console.log(`Updated ${data.slug}`)
}
