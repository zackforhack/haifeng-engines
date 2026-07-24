// Reconcile SDEC generator-drive engine ratings with the supplied 2026 price
// workbook: 2026年度电站价格表（20260315含殴五）.xlsx.
//
// The workbook publishes exact mechanical kW values. Most electrical values
// are derived using the same 90% alternator-efficiency convention as the
// original SDEC import; the Euro V sheet's explicit genset kW values take
// precedence. Dry-run by default; pass --apply to write.

import fs from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const SOURCE_FILE = new URL('./sdec-2026-ratings.json', import.meta.url)
const source = JSON.parse(await fs.readFile(SOURCE_FILE, 'utf8'))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY
if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
}

const supabase = createClient(supabaseUrl, serviceKey)
const { data: existing, error: readError } = await supabase
  .from('engines')
  .select('*')
  .eq('brand', 'SDEC')
if (readError) throw readError

const byModel = new Map(existing.map((engine) => [engine.model, engine]))
const round1 = (value) => Math.round(value * 10) / 10
const electrical = (rating, duty) =>
  rating[`${duty}_kwe`] ?? Math.round(rating[`${duty}_kwm`] * 0.9)
const kva = (kwe) => round1(kwe / 0.8)
const slugOf = (model) =>
  `sdec-${model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`

function powerFields(ratings) {
  const fields = {}
  for (const hz of [50, 60]) {
    const rating = ratings[String(hz)]
    if (!rating) continue

    for (const duty of ['prime', 'standby']) {
      const kwe = electrical(rating, duty)
      fields[`${duty}_power_kw_${hz}hz`] = rating[`${duty}_kwm`]
      fields[`${duty}_power_kwe_${hz}hz`] = kwe
      fields[`${duty}_power_kva_${hz}hz`] = kva(kwe)
    }
  }
  return fields
}

function metadata(model, ratings) {
  let series
  let displacement_l
  let cylinders

  const large = model.match(/^(\d+)([GKWT])T?A+A?(\d+)/)
  const sc = model.match(/^SC(\d+)([A-Z])/)
  if (large) {
    cylinders = Number(large[1])
    series = `${large[2]} Series`
    displacement_l = Number(large[3])
  } else if (sc) {
    displacement_l = Number(sc[1])
    series = `${sc[2]} Series`
    cylinders = displacement_l <= 4 ? 4 : 6
  } else {
    throw new Error(`Cannot infer metadata for new SDEC model ${model}`)
  }

  const sourceSheets = ratings.sources.map((entry) => entry.split('!')[0])
  const emissions_standard = sourceSheets.includes('国三')
    ? 'China National Stage III / Unregulated'
    : 'China National Stage II / Unregulated'
  const fields = powerFields(ratings)
  const p50 = fields.prime_power_kw_50hz
  const s50 = fields.standby_power_kw_50hz

  return {
    slug: slugOf(model),
    brand: 'SDEC',
    model,
    series,
    status: 'active',
    origin: 'China',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    displacement_l,
    cylinders,
    configuration: cylinders > 6 ? `V${cylinders}` : `L${cylinders}`,
    rpm_rated: 1500,
    emissions_standard,
    description:
      `SDEC ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine ` +
      `for generator sets. ${p50} kWm prime / ${s50} kWm standby at 50Hz/1500RPM.`,
    ...fields,
  }
}

const updates = []
const inserts = []
const excludedNonSdec = []

for (const [model, ratings] of Object.entries(source)) {
  const current = byModel.get(model)
  if (current) {
    const fields = powerFields(ratings)
    const changed = Object.entries(fields).some(
      ([field, value]) => Number(current[field]) !== Number(value),
    )
    if (changed) updates.push({ model, slug: current.slug, fields })
    continue
  }

  // 上菲红 is a separate SAIC Fiat Powertrain product line included in the
  // commercial workbook; do not misattribute those engines to SDEC.
  if (ratings.sources.every((entry) => entry.startsWith('上菲红!'))) {
    excludedNonSdec.push(model)
    continue
  }
  inserts.push(metadata(model, ratings))
}

const sourceModels = new Set(Object.keys(source))
const retainedLegacy = existing.filter((engine) => !sourceModels.has(engine.model))

console.log(`Workbook source models: ${sourceModels.size}`)
console.log(`Current SDEC rows: ${existing.length}`)
console.log(`Rows requiring rating updates: ${updates.length}`)
console.log(`Missing SDEC rows to insert: ${inserts.length}`)
console.log(`Non-SDEC 上菲红 rows excluded: ${excludedNonSdec.length}`)
console.log(`Legacy SDEC rows retained: ${retainedLegacy.length}`)

const target = updates.find((record) => record.model === '4Z2.3-G21')
if (target) console.log('\n4Z2.3-G21 correction:', target.fields)

console.log('\nNew SDEC models:', inserts.map((record) => record.model).join(', '))
console.log('Excluded 上菲红 models:', excludedNonSdec.join(', '))
console.log('Retained legacy models:', retainedLegacy.map((record) => record.model).join(', '))

if (!APPLY) {
  console.log('\nDry run only. Re-run with --apply to update Supabase.')
  process.exit(0)
}

let updated = 0
for (const record of updates) {
  const { error } = await supabase
    .from('engines')
    .update(record.fields)
    .eq('slug', record.slug)
  if (error) throw new Error(`Failed to update ${record.model}: ${error.message}`)
  updated++
}

for (let i = 0; i < inserts.length; i += 50) {
  const batch = inserts.slice(i, i + 50)
  const { error } = await supabase.from('engines').insert(batch)
  if (error) throw new Error(`Failed to insert SDEC batch: ${error.message}`)
}

console.log(`\nUpdated ${updated} rows and inserted ${inserts.length} rows.`)
