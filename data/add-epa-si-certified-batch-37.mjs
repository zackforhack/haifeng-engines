// Add the exact ECEXB02.4AAA certification identity to Cummins C20N6.
// A Cummins Power Generation EPA compliance statement identifies the
// C20N6, QSJ2.4 engine and this family directly.
// Dry-run by default; pass --apply to write to Supabase.

import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) throw new Error('Supabase credentials are required')

const supabase = createClient(url, key)
const slug = 'cummins-c20n6'
const values = {
  configuration: 'Inline-4 Naturally Aspirated Spark Ignition',
  compression_ratio: '9.5:1',
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA Stationary Emergency',
    'U.S. EPA NSPS',
    'EPA Engine Family ECEXB02.4AAA',
  ],
  description:
    'Cummins C20N6 is a 20 kWe / 25 kVA, 60 Hz standby generator set '
    + 'using the naturally aspirated 2.4 L inline-four QSJ2.4 '
    + 'spark-ignition engine. A Cummins Power Generation EPA compliance '
    + 'statement identifies the C20N6 and QSJ2.4 directly under engine '
    + 'family ECEXB02.4AAA for natural-gas and propane emergency service.',
}

const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .eq('slug', slug)
  .single()
if (existingError) throw existingError

console.table([{
  action: 'update',
  slug,
  epa_family: 'ECEXB02.4AAA',
}])
if (!apply) {
  console.log('Dry run: one exact Cummins EPA family crosswalk update.')
  process.exit(0)
}

const { error } = await supabase
  .from('engines')
  .update(values)
  .eq('id', existing.id)
if (error) throw error

console.log('Applied the Cummins C20N6 EPA family crosswalk.')
