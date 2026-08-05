// Import GenProBase-discovered generator-drive engine model candidates.
//
// Dry run by default:
//   set -a; source .env.local; node data/add-genprobase-engine-models-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/add-genprobase-engine-models-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const APPLY = process.argv.includes('--apply')
const SOURCE_URL =
  'https://www.genprobase.com/api/products?all=1&page=1&pageSize=10000'
const REPORT_PATH = 'reports/genprobase-import-2026-08-05.md'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const brandMap = new Map([
  ['康明斯', 'Cummins'],
  ['博杜安', 'Baudouin'],
  ['上柴', 'SDEC'],
  ['珀金斯', 'Perkins'],
  ['沃尔沃', 'Volvo Penta'],
  ['斯堪尼亚', 'Scania'],
  ['上海菱重', 'Mitsubishi'],
  ['菲亚特', 'FPT'],
])

const brandOriginDefaults = new Map([
  ['Baudouin', 'France'],
  ['Cummins', 'United States'],
  ['FPT', 'Italy'],
  ['Mitsubishi', 'Japan'],
  ['Perkins', 'United Kingdom'],
  ['Scania', 'Sweden'],
  ['SDEC', 'China'],
  ['Volvo Penta', 'Sweden'],
])

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalize(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function clean(row) {
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== undefined),
  )
}

function round1(value) {
  if (value == null || !Number.isFinite(value)) return undefined
  return Math.round(value * 10) / 10
}

function kwToHp(kw) {
  return round1(kw / 0.7457)
}

function parseRpm(speed) {
  const match = String(speed ?? '').match(/(\d+)/)
  return match ? Number(match[1]) : undefined
}

function parseCylinders(value) {
  const match = String(value ?? '').match(/(\d+)/)
  return match ? Number(match[1]) : undefined
}

function parseConfiguration(cylindersText, intakeText) {
  const raw = String(cylindersText ?? '').trim()
  const layout = /^v/i.test(raw)
    ? raw.toUpperCase()
    : raw
      ? `L${parseCylinders(raw) ?? raw.replace(/[^0-9]/g, '')}`
      : undefined
  const intake = translateIntake(intakeText)
  return [layout, intake].filter(Boolean).join(', ') || undefined
}

function translateCooling(value) {
  if (value === '水冷') return 'Liquid-Cooled'
  return value || undefined
}

function translateIntake(value) {
  if (value === '自然吸气') return 'naturally aspirated'
  if (value === '涡轮增压') return 'turbocharged'
  if (value === '增压中冷') return 'turbocharged aftercooled'
  return value || undefined
}

function translateOrigin(value, brand) {
  const source = String(value ?? '').replace(/；/g, ';')
  const parts = source
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
  const translated = parts.map((part) => {
    if (part === '中国') return 'China'
    if (part === '美国') return 'United States'
    if (part === '英国') return 'United Kingdom'
    if (part === '法国') return 'France'
    if (part === '德国') return 'Germany'
    if (part === '瑞典') return 'Sweden'
    if (part === '印度') return 'India'
    if (part === '巴西') return 'Brazil'
    return part
  })
  return translated.length
    ? [...new Set(translated)].join(' / ')
    : brandOriginDefaults.get(brand)
}

function translateEmissionToken(token) {
  const value = token.trim()
  if (!value || value === '无') return 'Unregulated'
  if (value === '国二') return 'China II'
  if (value === '国三') return 'China III'
  if (value === '国四') return 'China IV'
  if (value === 'EU SII') return 'EU Stage II'
  if (value === 'EU SIIIA') return 'EU Stage IIIA'
  if (value === 'EU V') return 'EU Stage V'
  if (value === 'EPA T2') return 'U.S. EPA Tier 2'
  if (value === 'EPA T3') return 'U.S. EPA Tier 3'
  if (value === 'EPA T4F') return 'U.S. EPA Final Tier 4'
  return value
}

function translateEmissions(value) {
  const parts = String(value ?? '')
    .replace(/；/g, ';')
    .split(/[;/]/)
    .map(translateEmissionToken)
    .filter(Boolean)
  const unique = [...new Set(parts)]
  return unique.length ? unique.join(' / ') : 'Unregulated'
}

function seriesFor(brand, model) {
  const value = String(model)
  if (brand === 'Baudouin') return value.match(/^\d+M\d+/)?.[0]
  if (brand === 'Cummins') {
    if (/^QSB/i.test(value)) return 'QSB Series'
    if (/^QSL/i.test(value)) return 'QSL Series'
    if (/^QSK/i.test(value)) return 'QSK Series'
    if (/^KTA/i.test(value)) return 'KTA Series'
    if (/^KTAA/i.test(value)) return 'KTAA Series'
    if (/^B/i.test(value)) return 'B Series'
    if (/^L/i.test(value)) return 'L Series'
  }
  if (brand === 'Perkins') return value.slice(0, 4).replace(/[^0-9]/g, '') + ' Series'
  if (brand === 'FPT') return value.startsWith('F3') ? 'Cursor Series' : 'NEF Series'
  if (brand === 'Mitsubishi') return value.match(/^S\d+R2?/)?.[0] ?? 'S Series'
  if (brand === 'SDEC') return value.match(/^SC\d+G/)?.[0] ?? 'SC Series'
  if (brand === 'Scania') return value.match(/^DC\d+/)?.[0] ?? 'DC Series'
  if (brand === 'Volvo Penta') return value.match(/^[A-Z]+[0-9]+/)?.[0] ?? 'Generator Drive'
  return undefined
}

function fetchSourceRows() {
  const buffer = execFileSync(
    'curl',
    [
      '-L',
      '--fail',
      '--silent',
      '--show-error',
      '--max-time',
      '60',
      '-A',
      'Mozilla/5.0 (compatible; HaifengGenProBaseProbe/1.0)',
      SOURCE_URL,
    ],
    { maxBuffer: 20 * 1024 * 1024 },
  )
  const payload = JSON.parse(buffer.toString('utf8'))
  return payload.list ?? payload.items ?? []
}

function rowToGroupKey(row) {
  const brand = brandMap.get(row.brand) ?? row.brand
  return `${brand}::${normalize(row.model)}`
}

function sourceGroupToRecord(group) {
  const row = group.rows[0]
  const brand = group.brand
  const model = row.model.trim()
  const slug = `${slugify(brand)}-${slugify(model)}`
  const rpmValues = [...new Set(group.rows.map((item) => parseRpm(item.speed)).filter(Boolean))]
  const rpmRated = rpmValues.length === 1 ? rpmValues[0] : undefined
  const maxKwm = Math.max(
    ...group.rows
      .flatMap((item) => [item.standby_kwm, item.prime_kwm, item.continuous_kwm])
      .filter((value) => typeof value === 'number'),
  )
  const maxKwe = Math.max(
    ...group.rows
      .flatMap((item) => [item.standby_kwe, item.prime_kwe, item.continuous_kwe])
      .filter((value) => typeof value === 'number'),
  )
  const powerKw = Number.isFinite(maxKwm) ? maxKwm : maxKwe

  const byFreq = new Map()
  for (const item of group.rows) byFreq.set(item.frequency, item)

  const record = {
    slug,
    brand,
    model,
    series: seriesFor(brand, model),
    status: row.sale_status === '正常' ? 'active' : 'active',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: translateCooling(row.cooling),
    emissions_standard: translateEmissions(row.emission),
    certifications: translateEmissions(row.emission)
      .split(' / ')
      .filter((value) => value && value !== 'Unregulated'),
    power_kw: round1(powerKw),
    power_hp: kwToHp(powerKw),
    displacement_l: row.displacement,
    cylinders: parseCylinders(row.cylinders),
    configuration: parseConfiguration(row.cylinders, row.intake),
    rpm_rated: rpmRated,
    origin: translateOrigin(row.origin, brand),
    prime_power_kw_50hz: byFreq.get('50Hz')?.prime_kwm ?? undefined,
    prime_power_kwe_50hz: byFreq.get('50Hz')?.prime_kwe ?? undefined,
    standby_power_kw_50hz: byFreq.get('50Hz')?.standby_kwm ?? undefined,
    standby_power_kwe_50hz: byFreq.get('50Hz')?.standby_kwe ?? undefined,
    prime_power_kw_60hz: byFreq.get('60Hz')?.prime_kwm ?? undefined,
    prime_power_kwe_60hz: byFreq.get('60Hz')?.prime_kwe ?? undefined,
    standby_power_kw_60hz: byFreq.get('60Hz')?.standby_kwm ?? undefined,
    standby_power_kwe_60hz: byFreq.get('60Hz')?.standby_kwe ?? undefined,
    description:
      `${brand} ${model} generator-drive diesel engine discovered in the GenProBase public selector. `
      + `GenProBase lists ${group.rows.length} row(s) across ${[...new Set(group.rows.map((item) => item.frequency))].join(', ')} `
      + `with ${row.displacement} L displacement, ${row.cylinders} cylinders, `
      + `${translateCooling(row.cooling)?.toLowerCase()} cooling, and ${translateEmissions(row.emission)} emissions labeling. `
      + 'Treat this row as source-discovered and prioritize OEM datasheet attachment in a follow-up pass.',
  }

  return clean(record)
}

async function fetchAllEngines() {
  const engines = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('brand, model, slug')
      .range(from, from + 999)
    if (error) throw error
    engines.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return engines
}

function summarizeByBrand(records) {
  return [...records.reduce((map, record) => {
    map.set(record.brand, (map.get(record.brand) ?? 0) + 1)
    return map
  }, new Map())].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

function buildReport({ sourceRows, sourceGroups, existingCount, missing, skippedExisting, afterCount }) {
  const byBrand = summarizeByBrand(missing)
  const sample = missing.slice(0, 80)
  return `# GenProBase Engine Model Import

Date: 2026-08-05

Source: ${SOURCE_URL}

## Result

- Source rows fetched: \`${sourceRows.length}\`
- Unique normalized GenProBase brand/model groups: \`${sourceGroups.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}
## New Rows By Brand

${byBrand.map(([brand, count]) => `- ${brand}: \`${count}\``).join('\n')}

## Notes

- GenProBase is an online discovery source, not an OEM datasheet source.
- Rows are marked as active generator-drive diesel models.
- Descriptions include GenProBase provenance and should be followed by OEM datasheet attachment where available.
- Import logic compares normalized \`brand + model\` against the live database and skips existing rows.

## Sample Of ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Power kW | RPM | Emissions |
| --- | --- | ---: | ---: | --- |
${sample.map((record) => `| ${record.brand} | ${record.model} | ${record.power_kw ?? ''} | ${record.rpm_rated ?? ''} | ${record.emissions_standard ?? ''} |`).join('\n')}

## Existing Rows Skipped

\`${skippedExisting.length}\`
`
}

const sourceRows = fetchSourceRows()
const grouped = new Map()
for (const row of sourceRows) {
  if (!row.brand || !row.model) continue
  const brand = brandMap.get(row.brand) ?? row.brand
  const key = rowToGroupKey(row)
  if (!grouped.has(key)) grouped.set(key, { brand, rows: [] })
  grouped.get(key).rows.push(row)
}

const sourceGroups = [...grouped.values()]
const sourceRecords = sourceGroups.map(sourceGroupToRecord)
const candidateSlugCounts = new Map()
for (const record of sourceRecords) {
  candidateSlugCounts.set(record.slug, (candidateSlugCounts.get(record.slug) ?? 0) + 1)
}
const duplicateSlugs = [...candidateSlugCounts].filter(([, count]) => count > 1)
if (duplicateSlugs.length) {
  console.error(`Duplicate generated slugs: ${duplicateSlugs.map(([slug]) => slug).join(', ')}`)
  process.exit(1)
}

const existingEngines = await fetchAllEngines()
const existingKeys = new Set(
  existingEngines.map((engine) => `${engine.brand}::${normalize(engine.model)}`),
)
const missing = sourceRecords.filter(
  (record) => !existingKeys.has(`${record.brand}::${normalize(record.model)}`),
)
const skippedExisting = sourceRecords.filter(
  (record) => existingKeys.has(`${record.brand}::${normalize(record.model)}`),
)

console.log(`Source rows: ${sourceRows.length}`)
console.log(`Unique brand/model groups: ${sourceGroups.length}`)
console.log(`Already present: ${skippedExisting.length}`)
console.log(`Missing/new: ${missing.length}`)
console.log('Missing by brand:')
for (const [brand, count] of summarizeByBrand(missing)) console.log(`${brand}\t${count}`)

if (!APPLY) {
  console.log('\nDry run only. Re-run with --apply to insert missing rows.')
  for (const record of missing) console.log(`${record.brand}\t${record.model}\t${record.slug}`)
  const report = buildReport({
    sourceRows,
    sourceGroups,
    existingCount: skippedExisting.length,
    missing,
    skippedExisting,
    afterCount: null,
  })
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, report)
  console.log(`Wrote ${REPORT_PATH}`)
  process.exit(0)
}

if (missing.length) {
  const { data, error } = await supabase
    .from('engines')
    .upsert(missing, { onConflict: 'slug' })
    .select('brand, model, slug')
  if (error) throw error
  console.log(`Imported ${data.length} GenProBase-discovered engine records.`)
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const report = buildReport({
  sourceRows,
  sourceGroups,
  existingCount: skippedExisting.length,
  missing,
  skippedExisting,
  afterCount,
})
fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, report)

console.log(`Engine count is now ${afterCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
