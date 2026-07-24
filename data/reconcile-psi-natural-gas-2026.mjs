// Reconcile PSI natural-gas generator ratings against the official PSI Power Systems
// product brochure (Y24) and current product pages on psiengines.com (reviewed 2026-07-24).
// Propane/LPG columns are intentionally excluded. Standard and High Output (HO) ratings
// are separate records because the engine schema supports one standby rating per frequency.
//
// Dry run: node data/reconcile-psi-natural-gas-2026.mjs
// Apply:   node data/reconcile-psi-natural-gas-2026.mjs --apply
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY,
)
const round1 = (value) => Math.round(value * 10) / 10
const kva = (kwe) => kwe == null ? null : round1(kwe / 0.8)

// Ratings: [electrical kWe, mechanical kWm]. Null means PSI does not publish that duty.
const RATINGS = {
  'psi-gas-2-4l':       { p50: null,       s50: [20, 26],   p60: null,       s60: [25, 32] },
  'psi-gas-2-4l-t':     { p50: null,       s50: null,       p60: null,       s60: [40, 50] },
  'psi-gas-4-3l':       { p50: [35, 43],   s50: [40, 48],   p60: [40, 52],   s60: [50, 58] },
  'psi-gas-4-5l':       { p50: [35, 43],   s50: [39, 43],   p60: [40, 49],   s60: [45, 59] },
  'psi-gas-5-7l':       { p50: [50, 58],   s50: [55, 65],   p60: [55, 70],   s60: [60, 78] },
  'psi-gas-5-7l-t':     { p50: null,       s50: [65, 75],   p60: null,       s60: [80, 97] },
  'psi-gas-5-7l-tcac':  { p50: null,       s50: [85, 100],  p60: null,       s60: [100, 122] },
  'psi-gas-6-7l':       { p50: [55, 66],   s50: [58, 66],   p60: [70, 80],   s60: [70, 80] },
  'psi-gas-6-7l-t':     { p50: [90, 106],  s50: [100, 120], p60: [100, 120], s60: [125, 145] },
  'psi-gas-8-1l':       { p50: [55, 67],   s50: [60, 74],   p60: [75, 88],   s60: [85, 100] },
  'psi-gas-8-1l-t':     { p50: [110, 131], s50: [125, 145], p60: [125, 150], s60: [155, 176] },
  'psi-gas-8-8l':       { p50: [75, 91],   s50: [85, 101],  p60: [80, 109],  s60: [100, 121] },
  'psi-gas-8-8l-t':     { p50: null,       s50: [100, 122], p60: null,       s60: [125, 147] },
  'psi-gas-8-8l-tcac':  { p50: null,       s50: [125, 162], p60: null,       s60: [150, 195] },
  'psi-gas-10l':        { p50: [85, 100],  s50: [85, 100],  p60: [100, 118], s60: [100, 118] },
  'psi-gas-10l-t':      { p50: [180, 200], s50: [200, 230], p60: [170, 200], s60: [204, 236] },
  'psi-gas-11l':        { p50: [150, 180], s50: [175, 200], p60: [175, 200], s60: [200, 235] },
  'psi-gas-13l':        { p50: [202, 230], s50: [221, 250], p60: [200, 240], s60: [257, 299] },
  'psi-gas-14l':        { p50: [210, 248], s50: [240, 275], p60: [250, 291], s60: [300, 340] },
  'psi-gas-17l':        { p50: [275, 320], s50: [275, 320], p60: [350, 420], s60: [400, 460] },
  'psi-gas-18l':        { p50: null,       s50: [270, 320], p60: null,       s60: [350, 422] },
  'psi-gas-20l':        { p50: [365, 414], s50: [400, 460], p60: [400, 450], s60: [500, 570] },
  'psi-gas-22l':        { p50: [280, 340], s50: [320, 378], p60: [375, 434], s60: [450, 510] },
  'psi-gas-32l':        { p50: [450, 510], s50: [525, 600], p60: [525, 600], s60: [650, 720] },
  'psi-gas-40l':        { p50: [585, 666], s50: [650, 740], p60: [725, 828], s60: [800, 920] },
  'psi-gas-53l':        { p50: [780, 888], s50: [870, 987], p60: [925, 1067], s60: [1050, 1185] },
}

const HIGH_OUTPUT = [
  {
    base: 'psi-gas-8-8l-tcac',
    slug: 'psi-gas-8-8l-tcac-ho',
    model: '8.8L TCAC HO',
    ratings: { p50: null, s50: [125, 162], p60: null, s60: [200, 232] },
    source: 'PSI Power Systems Y24 brochure, natural-gas columns',
  },
  {
    base: 'psi-gas-13l',
    slug: 'psi-gas-13l-ho',
    model: '13L HO',
    ratings: { p50: null, s50: [269, 300], p60: null, s60: [311, 350] },
    source: 'current official PSI 13 Liter product page',
  },
  {
    base: 'psi-gas-14l',
    slug: 'psi-gas-14l-ho',
    model: '14L HO',
    ratings: { p50: null, s50: null, p60: null, s60: [350, 400] },
    source: 'PSI Power Systems Y24 brochure, natural-gas columns',
  },
  {
    base: 'psi-gas-22l',
    slug: 'psi-gas-22l-ho',
    model: '22L HO',
    ratings: { p50: null, s50: null, p60: null, s60: [500, 570] },
    source: 'PSI Power Systems Y24 brochure, natural-gas columns',
  },
  {
    base: 'psi-gas-53l',
    slug: 'psi-gas-53l-ho',
    model: '53L HO',
    ratings: { p50: null, s50: null, p60: null, s60: [1250, 1436] },
    source: 'current official PSI 53 Liter product page and Y24 brochure',
  },
]

const columns = {
  p50: ['prime_power_kwe_50hz', 'prime_power_kw_50hz', 'prime_power_kva_50hz'],
  s50: ['standby_power_kwe_50hz', 'standby_power_kw_50hz', 'standby_power_kva_50hz'],
  p60: ['prime_power_kwe_60hz', 'prime_power_kw_60hz', 'prime_power_kva_60hz'],
  s60: ['standby_power_kwe_60hz', 'standby_power_kw_60hz', 'standby_power_kva_60hz'],
}

function ratingFields(ratings) {
  const fields = {}
  for (const [duty, names] of Object.entries(columns)) {
    const rating = ratings[duty]
    fields[names[0]] = rating?.[0] ?? null
    fields[names[1]] = rating?.[1] ?? null
    fields[names[2]] = rating ? kva(rating[0]) : null
  }
  const representative = ratings.p50 ?? ratings.p60 ?? ratings.s50 ?? ratings.s60
  fields.power_kw = representative?.[1] ?? null
  return fields
}

function validate(slug, ratings) {
  for (const [duty, rating] of Object.entries(ratings)) {
    if (!rating) continue
    const [electrical, mechanical] = rating
    if (electrical <= 0 || mechanical <= 0 || electrical > mechanical) {
      throw new Error(`${slug} ${duty}: invalid ${electrical} kWe / ${mechanical} kWm`)
    }
  }
}

function description(engine, ratings, source = 'official PSI natural-gas rating tables') {
  const values = []
  for (const [duty, label] of [['p50', '50 Hz prime'], ['s50', '50 Hz standby'], ['p60', '60 Hz prime'], ['s60', '60 Hz standby']]) {
    if (ratings[duty]) values.push(`${label} ${ratings[duty][0]} kWe / ${ratings[duty][1]} kWm`)
  }
  const identity = [
    engine.displacement_l ? `${engine.displacement_l} L` : null,
    engine.configuration,
    'spark-ignition natural-gas generator engine',
  ].filter(Boolean).join(' ')
  const article = /^[aeiou8]/i.test(identity) ? 'an' : 'a'
  return `PSI ${engine.model} is ${article} ${identity}. Natural-gas ratings: ${values.join('; ')}. `
    + `Ratings exclude propane/LPG data and were verified from ${source}.`
}

const { data: engines, error: engineError } = await supabase
  .from('engines')
  .select('*')
  .eq('brand', 'PSI')
  .eq('fuel_type', 'Natural Gas')
if (engineError) throw engineError

const bySlug = new Map(engines.map((engine) => [engine.slug, engine]))
const missing = Object.keys(RATINGS).filter((slug) => !bySlug.has(slug))
if (missing.length) throw new Error(`Missing PSI base rows: ${missing.join(', ')}`)

let changed = 0
for (const [slug, ratings] of Object.entries(RATINGS)) {
  validate(slug, ratings)
  const current = bySlug.get(slug)
  const next = {
    ...ratingFields(ratings),
    description: description(current, ratings),
  }
  const diff = Object.entries(next).filter(([key, value]) => current[key] !== value)
  if (!diff.length) continue
  changed++
  console.log(`UPDATE ${slug}`)
  for (const [key, value] of diff) console.log(`  ${key}: ${current[key] ?? 'null'} -> ${value ?? 'null'}`)
  if (APPLY) {
    const { error } = await supabase.from('engines').update(next).eq('id', current.id)
    if (error) throw error
  }
}

let inserted = 0
for (const variant of HIGH_OUTPUT) {
  validate(variant.slug, variant.ratings)
  const base = bySlug.get(variant.base)
  const existing = bySlug.get(variant.slug)
  const fields = {
    ...ratingFields(variant.ratings),
    model: variant.model,
    description: description({ ...base, model: variant.model }, variant.ratings, variant.source),
  }
  if (existing) {
    const diff = Object.entries(fields).filter(([key, value]) => existing[key] !== value)
    if (!diff.length) continue
    changed++
    console.log(`UPDATE ${variant.slug}`)
    if (APPLY) {
      const { error } = await supabase.from('engines').update(fields).eq('id', existing.id)
      if (error) throw error
    }
    continue
  }

  inserted++
  console.log(`INSERT ${variant.slug}`)
  if (!APPLY) continue

  const {
    id: _id,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...baseFields
  } = base
  const { data: created, error: insertError } = await supabase
    .from('engines')
    .insert({ ...baseFields, ...fields, slug: variant.slug })
    .select('id')
    .single()
  if (insertError) throw insertError

  const { data: documents, error: documentError } = await supabase
    .from('engine_pdfs')
    .select('type,label,storage_path,file_size_bytes')
    .eq('engine_id', base.id)
  if (documentError) throw documentError
  if (documents.length) {
    const links = documents.map((document) => ({ ...document, engine_id: created.id }))
    const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
    if (linkError) throw linkError
  }
}

console.log(`\n${APPLY ? 'Applied' : 'Dry run'}: ${changed} updates, ${inserted} inserts.`)
if (!APPLY) console.log('Re-run with --apply to update Supabase.')
