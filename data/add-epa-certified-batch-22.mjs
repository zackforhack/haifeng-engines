// Close the 2017 constant-speed EPA review tier.
// Dry-run by default. Use --apply to update the existing Detroit Diesel page.

import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const correction = {
  slug: 'detroit-diesel-series-60-14-0l',
  power_kw: 567,
  emissions_standard: 'U.S. EPA Tier 2 / U.S. EPA Tier 3',
  certifications: ['U.S. EPA Tier 2', 'U.S. EPA Tier 3'],
  description:
    'Detroit Diesel Series 60 14.0L is a 14.004 L inline-6 turbocharged '
    + 'and intercooled diesel engine for constant-speed industrial and '
    + 'generator applications. EPA annual certification records list '
    + '310 to 567 kWm at 1800 RPM across Tier 2 and Tier 3 families.',
}

const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug, model, power_kw, emissions_standard')
  .eq('slug', correction.slug)
  .maybeSingle()
if (existingError) throw existingError
if (!existing) throw new Error(`Correction target not found: ${correction.slug}`)

console.table([{
  action: 'update',
  model: existing.model,
  power_kw: `${existing.power_kw ?? 'null'} -> ${correction.power_kw}`,
  emissions: `${existing.emissions_standard} -> ${correction.emissions_standard}`,
}])

if (!apply) {
  console.log(
    '\nDry run: one Detroit Diesel page will be updated; '
    + 'six MTU and two Detroit EPA names are handled by reviewed aliases.',
  )
  process.exit(0)
}

const { error: correctionError } = await supabase
  .from('engines')
  .update({
    power_kw: correction.power_kw,
    emissions_standard: correction.emissions_standard,
    certifications: correction.certifications,
    description: correction.description,
  })
  .eq('slug', correction.slug)
if (correctionError) throw correctionError

console.log(`Updated ${correction.slug} with its complete EPA certification history.`)
