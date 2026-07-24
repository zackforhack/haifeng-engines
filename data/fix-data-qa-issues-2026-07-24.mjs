// Resolve the 2026-07-24 data QA findings:
// - enrich 88 Lister Petter rows with official family specifications;
// - fix two Baudouin 4M08 rows whose PRP kVA values were imported as kWe.
//
// Lister Petter sources were reviewed model-by-model at listerpetter.com. Models that
// share the same base code use the same engine block specification. SA315G1 is covered
// by the Lister Petter Starlite data sheet and distributor technical listing.
// Baudouin source: March 2024 Diesel 50 Hz PowerKit rating card.
//
// Dry run: node data/fix-data-qa-issues-2026-07-24.mjs
// Apply:   node data/fix-data-qa-issues-2026-07-24.mjs --apply
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)

const FAMILY_SPECS = new Map([
  ['SA315', { displacement_l: 1.5, cylinders: 3, configuration: 'L3', compression_ratio: '18:1' }],
  ['SA423', { displacement_l: 2.3, cylinders: 4, configuration: 'L4', compression_ratio: '18:1' }],
  ['SA427', { displacement_l: 2.7, cylinders: 4, configuration: 'L4', compression_ratio: '18.5:1' }],
  ['SA430', { displacement_l: 3.0, cylinders: 4, configuration: 'L4', compression_ratio: '18.5:1' }],
  ['SA432', { displacement_l: 3.2, cylinders: 4, configuration: 'L4', compression_ratio: '18.5:1' }],
  ['SA435', { displacement_l: 3.5, cylinders: 4, configuration: 'L4', compression_ratio: '18.5:1' }],
  ['SA441', { displacement_l: 4.1, cylinders: 4, configuration: 'L4', compression_ratio: '18:1' }],
  ['LP311', { displacement_l: 1.1, cylinders: 3, configuration: 'L3', compression_ratio: '18:1' }],
  ['LP322', { displacement_l: 2.2, cylinders: 3, configuration: 'L3' }],
  ['LP429', { displacement_l: 2.9, cylinders: 4, configuration: 'L4', compression_ratio: '17:1' }],
  ['LP430', { displacement_l: 3.0, cylinders: 4, configuration: 'L4', compression_ratio: '17.5:1' }],
  ['LP432', { displacement_l: 3.2, cylinders: 4, configuration: 'L4', compression_ratio: '18.5:1' }],
  ['LP435', { displacement_l: 3.5, cylinders: 4, configuration: 'L4', compression_ratio: '18.5:1' }],
  ['LP441', { displacement_l: 4.1, cylinders: 4, configuration: 'L4' }],
  ['LP443', { displacement_l: 4.3, cylinders: 4, configuration: 'L4' }],
  ['LP665', { displacement_l: 6.5, cylinders: 6, configuration: 'L6', compression_ratio: '16:1' }],
  ['LP689', { displacement_l: 8.9, cylinders: 6, configuration: 'L6' }],
  ['LP612', { displacement_l: 11.8, cylinders: 6, configuration: 'L6', compression_ratio: '17:1' }],
  ['LP613', { displacement_l: 12.8, cylinders: 6, configuration: 'L6', compression_ratio: '17:1' }],
  ['LP617', { displacement_l: 16.7, cylinders: 6, configuration: 'L6' }],
  ['LP625', { displacement_l: 25.18, cylinders: 6, configuration: 'L6', compression_ratio: '14.5:1' }],
  ['LP2041', { displacement_l: 40.7, cylinders: 20, configuration: 'V20', compression_ratio: '15.5:1' }],
  ['LP1054', { displacement_l: 53.8, cylinders: 10, configuration: 'V10', compression_ratio: '15:1' }],
  ['LP1265', { displacement_l: 64.5, cylinders: 12, configuration: 'V12', compression_ratio: '15:1' }],
  ['LP1686', { displacement_l: 86.02, cylinders: 16, configuration: 'V16', compression_ratio: '15:1' }],
])

const MODEL_OVERRIDES = new Map([
  ['LP322EVG1', { compression_ratio: '18:1' }],
  ['LP322EVG2', { compression_ratio: '17.5:1' }],
  ['LP443G1', { compression_ratio: '17.3:1' }],
  ['LP443G2', { compression_ratio: '17.3:1' }],
  ['LP443G3', { compression_ratio: '17.3:1' }],
  ['LP443G4', { compression_ratio: '16:1' }],
  ['LP443G5', { compression_ratio: '16:1' }],
  ['LP443G6', { compression_ratio: '16:1' }],
  ['LP443EG3', { compression_ratio: '16:1' }],
  ['LP443EG4', { compression_ratio: '16:1' }],
  ['LP443EG5', { compression_ratio: '16:1' }],
  ['LP443EG6', { compression_ratio: '16:1' }],
  ['LP689G1', { compression_ratio: '18:1' }],
  ['LP689G2', { compression_ratio: '18:1' }],
  ['LP689G3', { compression_ratio: '16.5:1' }],
  ['LP689EG1', { compression_ratio: '16.5:1' }],
  ['LP689EG2', { compression_ratio: '16.5:1' }],
  ['LP689EG3', { compression_ratio: '16.5:1' }],
  ['LP689EG4', { compression_ratio: '16.5:1' }],
])

function familyKey(model) {
  return [...FAMILY_SPECS.keys()]
    .sort((a, b) => b.length - a.length)
    .find((prefix) => model.startsWith(prefix))
}

function differs(current, next) {
  return Object.entries(next).filter(([key, value]) => current[key] !== value)
}

const { data: listerRows, error: listerError } = await supabase
  .from('engines')
  .select('id,slug,model,displacement_l,cylinders,configuration,cooling_method,compression_ratio')
  .eq('brand', 'Lister Petter')
if (listerError) throw listerError

let listerUpdates = 0
for (const engine of listerRows) {
  const key = familyKey(engine.model)
  if (!key) throw new Error(`No Lister Petter family mapping for ${engine.model}`)
  const next = {
    ...FAMILY_SPECS.get(key),
    ...MODEL_OVERRIDES.get(engine.model),
    cooling_method: 'Liquid-Cooled',
  }
  const diff = differs(engine, next)
  if (!diff.length) continue
  listerUpdates++
  console.log(`LISTER ${engine.model}: ${diff.map(([field, value]) => `${field}=${value}`).join(', ')}`)
  if (APPLY) {
    const { error } = await supabase.from('engines').update(next).eq('id', engine.id)
    if (error) throw error
  }
}

const BAUDOUIN_FIXES = [
  {
    slug: 'baudouin-4m08g4d3-5',
    fields: {
      prime_power_kw_50hz: 25,
      standby_power_kw_50hz: 28,
      prime_power_kwe_50hz: 16,
      prime_power_kva_50hz: 20,
      standby_power_kwe_50hz: 18,
      standby_power_kva_50hz: 22.5,
    },
  },
  {
    slug: 'baudouin-4m08g6d3-5',
    fields: {
      prime_power_kw_50hz: 30,
      standby_power_kw_50hz: 33,
      prime_power_kwe_50hz: 20,
      prime_power_kva_50hz: 25,
      standby_power_kwe_50hz: 24,
      standby_power_kva_50hz: 30,
    },
  },
]

let baudouinUpdates = 0
for (const fix of BAUDOUIN_FIXES) {
  const { data: engine, error } = await supabase
    .from('engines')
    .select('id,slug,prime_power_kw_50hz,standby_power_kw_50hz,prime_power_kwe_50hz,prime_power_kva_50hz,standby_power_kwe_50hz,standby_power_kva_50hz')
    .eq('slug', fix.slug)
    .single()
  if (error) throw error
  const diff = differs(engine, fix.fields)
  if (!diff.length) continue
  baudouinUpdates++
  console.log(`BAUDOUIN ${fix.slug}: ${diff.map(([field, value]) => `${field}=${value}`).join(', ')}`)
  if (APPLY) {
    const { error: updateError } = await supabase.from('engines').update(fix.fields).eq('id', engine.id)
    if (updateError) throw updateError
  }
}

console.log(`\n${APPLY ? 'Applied' : 'Dry run'}: ${listerUpdates} Lister Petter updates, ${baudouinUpdates} Baudouin updates.`)
if (!APPLY) console.log('Re-run with --apply to update Supabase.')
