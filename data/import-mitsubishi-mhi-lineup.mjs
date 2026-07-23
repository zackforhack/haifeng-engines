// Import the missing public MHI industrial constant-speed diesel lineup.
//
// Sources:
//   https://engine-genset.mhi.com/industrial-engines-constant-speed
//   Individual official product pages under that catalog.
//
// Rating convention:
//   - Mechanical kW uses MHI's "output without fan" value.
//   - Electrical kVA uses MHI's published value for the same rating basis.
//   - kWe is derived from the published kVA at 0.8 power factor.
//
// Run without --apply to preview. Use --apply to upsert into Supabase.

import { createClient } from '@supabase/supabase-js'

const CATALOG_BASE = 'https://engine-genset.mhi.com/industrial-engines-constant-speed'
const apply = process.argv.includes('--apply')
const round1 = (value) => Math.round(value * 10) / 10

const targets = [
  // Compact unregulated and EU Stage V models below 100 kWm.
  'l2e-61sdh-np2',
  'l2e-z562sdh',
  'l3e-61sd-np2',
  'l3e-61sdh-np2',
  'l3e-z562sd',
  'l3e-z562sdh',
  's3l2-61sd-np2',
  's3l2-61sdh-np2',
  's3l2-z562sd',
  's3l2-z562sdh',
  's4l2-61sd-np2',
  's4l2-61sdh-np2',
  's4l2-t61sd',
  's4l2-z562sd',
  's4l2-z5t61sd',
  's4q2-61sdb',
  's4s-61sdb',
  's4s-dt61sdb',
  // High-speed, unregulated and regulated models above 100 kWm.
  's6b3-pta',
  's6a3-pta',
  's6a3-ptaa',
  's6r-pta',
  's6r-a2ptaw',
  's6r-y2ptaw',
  's6r2-a2ptaw2',
  's12a2-pta',
  's12a2-pta2',
  's12h-pta',
  's12h-pta-switshable',
  's12r-pta-d',
  's12r-a2ptaw',
  's12r-a2ptaw2',
  's12r-f1ptaw2',
  's16r-a2ptaw',
  's16r-a2ptaw2',
  's16r-f1ptaw2',
  's16r-y2ptaw2',
  's16r2-a2ptaw',
  's16r2-f1ptaw',
  's16r2-ptaw',
  's16r2-ptaw-e',
  's16r2-ptaw2-e',
  // Medium-speed models.
  's6u-pta',
  's6u2-pta',
  's8u-pta',
  's12u-pta',
  's16u-pta',
]

const manualRatings = {
  // The current product page has empty output cells; values are from MHI's
  // official "Power Generation Engines" overview brochure.
  'l3e-z562sd': [
    { application: 'Prime', frequency: 50, mechanical_kw: 6.4, electrical_kva: 6.8, rpm: 1485, emissions: 'EU Stage V' },
    { application: 'Standby', frequency: 50, mechanical_kw: 7.4, electrical_kva: 7.9, rpm: 1485, emissions: 'EU Stage V' },
  ],
  // MHI's HTML page omits this table; values are from its linked official
  // "Mitsubishi Diesel Engine - S12H-PTA Switchable" specification sheet.
  's12h-pta-switshable': [
    { application: 'Prime', frequency: 50, mechanical_kw: 930, electrical_kva: 1104, rpm: 1500, emissions: 'Not regulated' },
    { application: 'Prime', frequency: 60, mechanical_kw: 990, electrical_kva: 1176, rpm: 1800, emissions: 'Not regulated' },
    { application: 'Standby', frequency: 50, mechanical_kw: 1020, electrical_kva: 1211, rpm: 1500, emissions: 'Not regulated' },
    { application: 'Standby', frequency: 60, mechanical_kw: 1120, electrical_kva: 1330, rpm: 1800, emissions: 'Not regulated' },
  ],
  // The product page represents both speeds in one "Switchable" row.
  's12r-pta-d': [
    { application: 'Prime', frequency: 50, mechanical_kw: 1110, electrical_kva: 1318, rpm: 1500, emissions: 'Not regulated' },
    { application: 'Prime', frequency: 60, mechanical_kw: 1010, electrical_kva: 1199, rpm: 1800, emissions: 'Not regulated' },
  ],
}

const decodeHtml = (value) => value
  .replace(/&quot;/g, '"')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ')
  .replace(/<[^>]+>/g, '')
  .trim()

function extractParameter(html, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(
    `<strong>${escaped}<\\/strong>[\\s\\S]*?class="parameter-value"><div[^>]*>([\\s\\S]*?)<\\/div>`,
    'i',
  )
  const match = html.match(pattern)
  return match ? decodeHtml(match[1]) : null
}

function extractModel(html, path) {
  const match = html.match(
    /<h1[^>]*>Mitsubishi Engine - Industrial - Constant Speed ([^<]+)<\/h1>/i,
  )
  const model = match ? decodeHtml(match[1]) : path.toUpperCase()
  return path === 's12h-pta-switshable' ? 'S12H-PTA Switchable' : model
}

function extractRatings(html) {
  const marker = '<div role="listitem" class="table2_item w-dyn-item">'
  const starts = [...html.matchAll(new RegExp(marker, 'g'))]
  const rows = starts.map((match, index) => {
    const start = match.index + marker.length
    const end = starts[index + 1]?.index ?? html.indexOf('</header>', start)
    return html.slice(start, end === -1 ? undefined : end)
  })

  return rows.map((row) => {
    const field = (name) => {
      const pattern = new RegExp(
        `fs-cmssort-field="${name}"(?: fs-cmssort-type="number")?>([^<]*)<`,
        'i',
      )
      const match = row.match(pattern)
      return match ? decodeHtml(match[1]) : null
    }
    const numeric = (name) => {
      const value = field(name)
      if (!value || value === '-') return null
      const parsed = Number(value.replace(/,/g, ''))
      return Number.isFinite(parsed) ? parsed : null
    }

    return {
      application: field('app'),
      frequency: numeric('frequency'),
      mechanical_kw: numeric('outputwithoutkwm'),
      electrical_kva: numeric('outputwithoutkva'),
      rpm: numeric('speed'),
      emissions: field('emissions'),
    }
  }).filter((row) => row.application && row.frequency)
}

function normalizeEmissions(ratings) {
  const values = [...new Set(ratings.map((row) => row.emissions).filter(Boolean))]
  const normalized = values.map((value) => {
    if (/not regulated/i.test(value)) return 'Unregulated'
    if (/EPA Tier II/i.test(value)) return 'U.S. EPA Tier 2'
    if (/EU Stage V/i.test(value)) return 'Euro Stage V'
    return value
  })

  // Keep the record-level value facet-friendly. Duty-specific differences are
  // preserved in the description below.
  if (normalized.includes('U.S. EPA Tier 2')) return 'U.S. EPA Tier 2'
  if (normalized.includes('2g NOx TA Luft')) return '2g NOx TA Luft'
  if (normalized.length === 1) return normalized[0]
  return normalized.join('; ')
}

function emissionsForModel(model, ratings) {
  if (/(?:A2|Y2)PTAW/i.test(model)) return 'U.S. EPA Tier 2'
  if (/F1PTAW/i.test(model)) return '2g NOx TA Luft'
  return normalizeEmissions(ratings)
}

function describeEmissions(ratings) {
  const byApplication = new Map()
  for (const row of ratings) {
    if (!row.application || !row.emissions) continue
    const emission = /not regulated/i.test(row.emissions)
      ? 'Unregulated'
      : /EPA Tier II/i.test(row.emissions)
        ? 'U.S. EPA Tier 2'
        : /EU Stage V/i.test(row.emissions)
          ? 'Euro Stage V'
        : row.emissions
    byApplication.set(row.application, emission)
  }

  const values = [...new Set(byApplication.values())]
  if (values.length === 1) return values[0]
  return [...byApplication].map(([application, emission]) =>
    `${emission} (${application.toLowerCase()})`
  ).join('; ')
}

function configurationFrom(value) {
  if (!value) return null
  const cylinders = Number(value.match(/\d+/)?.[0])
  if (!cylinders) return null
  return /in-line/i.test(value) ? `L${cylinders}` : `V${cylinders}`
}

function configurationFromModel(model) {
  const cylinders = Number(model.match(/^[SL](\d+)/i)?.[1])
  if (!cylinders) return null
  return cylinders <= 6 ? `L${cylinders}` : `V${cylinders}`
}

function seriesFrom(model) {
  const base = model.match(/^([SL]\d+(?:[A-Z]\d?|R2|U2)?)/)?.[1]
  return base ? `${base} Series` : null
}

function selectRating(ratings, application, frequency) {
  const candidates = ratings.filter((row) =>
    row.application?.toLowerCase() === application &&
    row.frequency === frequency &&
    row.mechanical_kw != null
  )
  if (!candidates.length) return null

  // Some medium-speed models publish 60 Hz ratings at both 900 and 1200 rpm.
  // Keep the highest-output option in structured fields and disclose all
  // alternatives in the description.
  return candidates.sort((a, b) => b.mechanical_kw - a.mechanical_kw)[0]
}

function ratingFields(ratings) {
  const fields = {}
  for (const frequency of [50, 60]) {
    for (const application of ['prime', 'standby']) {
      const rating = selectRating(ratings, application, frequency)
      if (!rating) continue
      const prefix = `${application}_power`
      fields[`${prefix}_kw_${frequency}hz`] = rating.mechanical_kw
      fields[`${prefix}_kva_${frequency}hz`] = rating.electrical_kva
      fields[`${prefix}_kwe_${frequency}hz`] = rating.electrical_kva == null
        ? round1(rating.mechanical_kw * 0.95)
        : round1(rating.electrical_kva * 0.8)
    }
  }
  return fields
}

function describeRatings(ratings) {
  const groups = []
  for (const frequency of [50, 60]) {
    const rows = ratings
      .filter((row) => row.frequency === frequency && row.mechanical_kw != null)
      .sort((a, b) => (a.rpm ?? 0) - (b.rpm ?? 0))
    if (!rows.length) continue

    const details = rows.map((row) =>
      `${row.application.toLowerCase()} ${row.mechanical_kw} kWm at ${row.rpm} rpm`
    )
    groups.push(`${frequency} Hz: ${details.join(', ')}`)
  }
  return groups.join('; ')
}

async function fetchRecord(path) {
  const url = `${CATALOG_BASE}/${path}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`)
  const html = await response.text()
  const model = extractModel(html, path)
  const cylinderConfiguration = extractParameter(html, 'Cylinder configuration')
  const configuration = configurationFrom(cylinderConfiguration) ?? configurationFromModel(model)
  const cylinders = configuration ? Number(configuration.match(/\d+/)[0]) : null
  const dimensions = extractParameter(html, 'Dimensions - L x W x H (mm)')
    ?.match(/([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)/i)
  const pageRatings = extractRatings(html)
  const ratings = pageRatings.some((rating) => rating.mechanical_kw != null)
    ? pageRatings
    : manualRatings[path] ?? []

  if (!ratings.length) {
    throw new Error(`${model}: no ratings parsed from official product page`)
  }

  const record = {
    slug: `mitsubishi-${path.replace('switshable', 'switchable')}`,
    brand: 'Mitsubishi',
    model,
    series: seriesFrom(model),
    status: 'active',
    origin: 'Japan',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    configuration,
    cylinders,
    displacement_l: Number(extractParameter(html, 'Total displacement (l)')),
    rpm_rated: Math.min(...ratings.map((row) => row.rpm).filter(Boolean)),
    emissions_standard: emissionsForModel(model, ratings),
    weight_kg: Number(extractParameter(html, 'Dry weight (kg)')) || null,
    length_mm: dimensions ? Number(dimensions[1]) : null,
    width_mm: dimensions ? Number(dimensions[2]) : null,
    height_mm: dimensions ? Number(dimensions[3]) : null,
    ...ratingFields(ratings),
    description: `Mitsubishi ${model} ${extractParameter(html, 'Total displacement (l)')}L ${configuration} constant-speed diesel engine for generator applications. Official MHI output without fan - ${describeRatings(ratings)}. Emissions: ${describeEmissions(ratings)}.`,
  }

  return { record, ratings, url }
}

async function mapWithConcurrency(items, concurrency, callback) {
  const results = new Array(items.length)
  let next = 0

  async function worker() {
    while (next < items.length) {
      const index = next++
      results[index] = await callback(items[index])
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  return results
}

const fetched = await mapWithConcurrency(targets, 5, fetchRecord)
const records = fetched.map(({ record }) => record)
const requiredFields = [
  'slug',
  'model',
  'series',
  'configuration',
  'cylinders',
  'displacement_l',
  'rpm_rated',
  'emissions_standard',
  'weight_kg',
]
const invalid = records.flatMap((record) =>
  requiredFields
    .filter((field) => record[field] == null || record[field] === '')
    .map((field) => `${record.model}: missing ${field}`)
)
const duplicateSlugs = records
  .map((record) => record.slug)
  .filter((slug, index, values) => values.indexOf(slug) !== index)
const cylinderMismatches = records.flatMap((record) => {
  const expected = Number(record.model.match(/^[SL](\d+)/i)?.[1])
  return expected && expected !== record.cylinders
    ? [`${record.model}: parsed ${record.cylinders} cylinders; expected ${expected}`]
    : []
})
const missingRatings = records
  .filter((record) => !Object.entries(record).some(([field, value]) =>
    /^prime_power_kw_|^standby_power_kw_/.test(field) && value != null
  ))
  .map((record) => `${record.model}: no usable power rating`)
if (invalid.length || duplicateSlugs.length || cylinderMismatches.length || missingRatings.length) {
  throw new Error([
    ...invalid,
    ...duplicateSlugs.map((slug) => `Duplicate slug: ${slug}`),
    ...cylinderMismatches,
    ...missingRatings,
  ].join('\n'))
}

console.table(records.map((record) => ({
  model: record.model,
  displacement_l: record.displacement_l,
  emissions: record.emissions_standard,
  prime_50_kwm: record.prime_power_kw_50hz ?? null,
  standby_50_kwm: record.standby_power_kw_50hz ?? null,
  prime_60_kwm: record.prime_power_kw_60hz ?? null,
  standby_60_kwm: record.standby_power_kw_60hz ?? null,
})))

if (!apply) {
  console.log(`\nDry run only. Parsed ${records.length} official MHI models.`)
  console.log('Re-run with --apply to update Supabase.')
  process.exit(0)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY
if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)
const { error } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
if (error) throw error

console.log(`Upserted ${records.length} official MHI diesel engines.`)
