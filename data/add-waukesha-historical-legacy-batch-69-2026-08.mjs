// Add source-validated Waukesha historical legacy engine model-series rows.
//
// Dry run:
//   node data/add-waukesha-historical-legacy-batch-69-2026-08.mjs
// Apply:
//   node data/add-waukesha-historical-legacy-batch-69-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-69-waukesha-historical.md'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyWaukeshaHistorical/1.0; +https://engines.haifengmachinery.com)'

const SOURCES = {
  '1945-1965': {
    url: 'https://www.wehs.net/when_was_it_made-3.html',
    label: 'Waukesha Engine Historical Society Production Table 1945-1965',
    expected: ['F1197G', 'F817G', 'VRG283', 'F310G'],
  },
  '1966-1983': {
    url: 'https://www.wehs.net/when_was_it_made-4.html',
    label: 'Waukesha Engine Historical Society Production Table 1966-1983',
    expected: ['VRD155', 'VRG155', 'VRD330', 'VRG330'],
  },
}

function parseEnvFile(text) {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const separator = line.indexOf('=')
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] == null) process.env[key] = value
  }
}

async function loadEnv() {
  for (const envFile of ['.env.local', '.env']) {
    try {
      parseEnvFile(await fsp.readFile(envFile, 'utf8'))
    } catch {
      // Optional local env files.
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalize(value) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function fuelFor(model) {
  if (/^VRG/i.test(model)) return 'Natural Gas'
  if (/D$/i.test(model)) return 'Diesel'
  if (/G$/i.test(model)) return 'Natural Gas'
  return 'Diesel'
}

function ignitionFor(fuelType) {
  return fuelType === 'Natural Gas' ? 'Spark Ignition' : 'Compression Ignition'
}

function row(model, start, end, sourceKey, note = '') {
  const fuelType = fuelFor(model)
  const source = SOURCES[sourceKey]
  return clean({
    slug: `waukesha-${slugify(model)}`,
    brand: 'Waukesha',
    model,
    series: 'Historical Waukesha Model Series',
    status: 'discontinued',
    year_introduced: start,
    year_discontinued: end,
    origin: 'United States',
    fuel_type: fuelType,
    ignition_type: ignitionFor(fuelType),
    cooling_method: 'Liquid-Cooled',
    emissions_standard: `Historical production ended ${end}`,
    certifications: ['Waukesha Engine Historical Society production table'],
    configuration: fuelType === 'Natural Gas'
      ? 'Legacy stationary spark-ignited gas engine model series'
      : 'Legacy stationary diesel engine model series',
    description:
      `Waukesha ${model} discontinued historical industrial/stationary engine model series. ` +
      `The Waukesha Engine Historical Society production table lists this model series from ${start} to ${end}, ` +
      `supporting legacy/discontinued treatment for owners searching parts, service, and overhaul information. ${note}`.trim(),
    source_url: source.url,
  })
}

const RECORDS = [
  row('F1197', 1963, 1973, '1945-1965'),
  row('F1197D', 1963, 1973, '1945-1965'),
  row('F1905D', 1963, 1973, '1945-1965'),
  row('F1905G', 1963, 1975, '1945-1965', 'WEHS lists this as the F1905G series.'),
  row('F231G', 1961, 1975, '1945-1965'),
  row('F232G', 1961, 1975, '1945-1965'),
  row('F248G', 1963, 1964, '1945-1965'),
  row('F265D', 1962, 1964, '1945-1965'),
  row('F265G', 1960, 1977, '1945-1965'),
  row('F283D', 1960, 1981, '1945-1965'),
  row('F283G', 1961, 1981, '1945-1965'),
  row('F2894D', 1963, 1967, '1945-1965'),
  row('F2894G', 1963, 1967, '1945-1965'),
  row('F310D', 1962, 1975, '1945-1965'),
  row('F310G', 1964, 1974, '1945-1965'),
  row('D155D', 1966, 1991, '1966-1983'),
  row('D155G', 1966, 1991, '1966-1983'),
  row('D189D', 1967, 1981, '1966-1983'),
  row('F554', 1966, 1975, '1966-1983'),
  row('F554G', 1966, 1975, '1966-1983'),
  row('H1077D', 1967, 1977, '1966-1983'),
  row('H1077G', 1967, 1977, '1966-1983'),
  row('H2475G', 1966, 1982, '1966-1983'),
  row('H2476G', 1983, 1990, '1966-1983'),
  row('L1616D', 1966, 1977, '1966-1983'),
  row('L1616G', 1966, 1977, '1966-1983'),
  row('L3711G', 1966, 1982, '1966-1983'),
  row('L3712G', 1983, 1990, '1966-1983'),
  row('VRD155', 1975, 1991, '1966-1983'),
  row('VRD220', 1978, 1991, '1966-1983'),
  row('VRD283', 1972, 1981, '1966-1983'),
  row('VRD310', 1973, 1981, '1966-1983'),
  row('VRD330', 1978, 1991, '1966-1983'),
  row('VRG155', 1975, 1991, '1966-1983'),
  row('VRG220', 1979, 1991, '1966-1983'),
  row('VRG265', 1973, 1981, '1966-1983'),
  row('VRG283', 1973, 1981, '1966-1983'),
  row('VRG310', 1973, 1981, '1966-1983'),
  row('VRG330', 1980, 1991, '1966-1983'),
]

function downloadText(source) {
  return execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '2',
    '--connect-timeout',
    '30',
    '--max-time',
    '120',
    '--user-agent',
    USER_AGENT,
    source.url,
  ], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  })
}

function sourceHasModel(html, model) {
  const normalizedHtml = normalize(html)
  return normalizedHtml.includes(normalize(model)) ||
    (model === 'F1905G' && normalizedHtml.includes(normalize('F1905G series')))
}

function verifySources() {
  const verified = new Map()
  for (const [key, source] of Object.entries(SOURCES)) {
    const html = downloadText(source)
    const missing = source.expected.filter((token) => !sourceHasModel(html, token))
    if (missing.length) {
      throw new Error(`${source.url}: missing expected token(s): ${missing.join(', ')}`)
    }
    verified.set(key, {
      ...source,
      fileSizeBytes: Buffer.byteLength(html),
      html,
    })
    console.log(`Verified ${source.label}: ${Math.round(Buffer.byteLength(html) / 1024)}KB`)
  }
  for (const record of RECORDS) {
    const source = verified.get(record.source_url === SOURCES['1945-1965'].url ? '1945-1965' : '1966-1983')
    if (!sourceHasModel(source.html, record.model)) {
      throw new Error(`${source.url}: missing model token ${record.model}`)
    }
  }
  return verified
}

async function fetchAllEngines(supabase) {
  const engines = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, brand, model, slug, status')
      .range(from, from + 999)
    if (error) throw error
    engines.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return engines
}

async function countLegacyCoverage(supabase) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, status, pdfs:engine_pdfs(id)')
      .eq('status', 'discontinued')
      .range(from, from + 999)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return {
    legacyCount: rows.length,
    legacyWithDocs: rows.filter((engine) => (engine.pdfs ?? []).length > 0).length,
  }
}

function buildReport({ existingCount, missing, linkedCount, skippedLinks, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 69 Waukesha Historical

Date: 2026-08-12

## Result

- Source-validated Waukesha historical candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Evidence links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Evidence links skipped as existing: \`${skippedLinks}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy document/reference coverage after import: \`${coverage.legacyWithDocs}/${coverage.legacyCount}\` (${(coverage.legacyWithDocs / coverage.legacyCount * 100).toFixed(1)}%)\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Fuel | Production | Source |
| --- | --- | --- | --- | --- |
${missing.map((record) => `| ${record.brand} | ${record.model} | ${record.fuel_type} | ${record.year_introduced}-${record.year_discontinued} | ${record.source_url} |`).join('\n')}

## Validation Sources

${Object.values(SOURCES).map((source) => `- ${source.label}: ${source.url}`).join('\n')}

## Notes

- The Waukesha Engine Historical Society states these tables are by model series, so each row is stored as a historical model-series SEO target rather than a modern active product.
- Each imported row receives an \`engine_pdfs\` reference link of type \`other\` to the matching historical production table. These are not datasheet PDFs; they are traceable evidence links used to preserve owner-service depth and avoid orphan legacy rows.
- Current/active Waukesha VGF F18/H24 candidates were intentionally rejected from this batch.
`
}

await loadEnv()
const verifiedSources = verifySources()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Waukesha historical legacy batch`)

const existing = await fetchAllEngines(supabase)
const existingKeys = new Set(existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const missing = RECORDS.filter((record) => !existingKeys.has(`${record.brand}::${normalize(record.model)}`))
const existingCount = RECORDS.length - missing.length

console.log(`Candidates: ${RECORDS.length}; existing: ${existingCount}; missing: ${missing.length}`)
for (const record of missing) console.log(`${record.brand}\t${record.model}\t${record.slug}`)

if (APPLY && missing.length) {
  const insertRows = missing.map(({ source_url, ...record }) => record)
  const { error } = await supabase.from('engines').insert(insertRows)
  if (error) throw error
  console.log(`Inserted ${missing.length} Waukesha historical legacy rows`)
}

const slugs = missing.map((record) => record.slug)
const { data: insertedEngines, error: insertedError } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .in('slug', slugs)
if (insertedError) throw insertedError

let linkedCount = 0
let skippedLinks = 0

for (const engine of insertedEngines ?? []) {
  if (engine.brand !== 'Waukesha' || engine.status !== 'discontinued') {
    throw new Error(`Unexpected Waukesha document target: ${engine.slug}`)
  }
  const record = missing.find((candidate) => candidate.slug === engine.slug)
  const sourceEntry = Object.values(SOURCES).find((source) => source.url === record.source_url)
  const verifiedSource = [...verifiedSources.values()].find((source) => source.url === record.source_url)

  const { data: existingLinks, error: existingLinkError } = await supabase
    .from('engine_pdfs')
    .select('id')
    .eq('engine_id', engine.id)
    .eq('storage_path', record.source_url)
  if (existingLinkError) throw existingLinkError

  if (existingLinks?.length) {
    skippedLinks += 1
    continue
  }

  if (APPLY) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'other',
      label: `${sourceEntry.label} - ${record.model}`,
      storage_path: record.source_url,
      file_size_bytes: verifiedSource.fileSizeBytes,
    })
    if (linkError) throw linkError
  }
  linkedCount += 1
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = await countLegacyCoverage(supabase)
fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({
  existingCount,
  missing,
  linkedCount,
  skippedLinks,
  afterCount: APPLY ? afterCount : null,
  coverage: APPLY ? coverage : null,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with documents/references: ${coverage.legacyWithDocs}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
