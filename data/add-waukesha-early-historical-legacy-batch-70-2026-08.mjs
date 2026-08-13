// Add source-validated early Waukesha historical legacy engine model-series rows
// and correct the Batch 69 VRG gas-fuel classification.
//
// Dry run:
//   node data/add-waukesha-early-historical-legacy-batch-70-2026-08.mjs
// Apply:
//   node data/add-waukesha-early-historical-legacy-batch-70-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-70-waukesha-early-historical.md'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyWaukeshaEarlyHistorical/1.0; +https://engines.haifengmachinery.com)'

const SOURCES = {
  '1906-1931': {
    url: 'https://www.wehs.net/when_was_it_made.html',
    label: 'Waukesha Engine Historical Society Production Table 1906-1931',
    expected: ['6A', '6LRO', 'DWL', 'XAK'],
  },
  '1932-1944': {
    url: 'https://www.wehs.net/when_was_it_made-2.html',
    label: 'Waukesha Engine Historical Society Production Table 1932-1944',
    expected: ['140G', '6D-100', '6WAK', 'XAKH'],
  },
  designations: {
    url: 'https://www.wehs.net/model_designations.html',
    label: 'Waukesha Engine Historical Society Model Designations',
    expected: ['Model 6A', 'Model 4-80', 'Model 6D-125', 'G = carbureted'],
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

function inferCylinders(model) {
  if (/^4-/i.test(model)) return 4
  if (/^6/i.test(model)) return 6
  if (/^[A-Z]/i.test(model)) return 4
  return undefined
}

function fuelFor(model) {
  if (/^6D-/.test(model) || model === 'DWL') return 'Diesel'
  if (/G/.test(model)) return 'Natural Gas'
  return 'Gasoline'
}

function ignitionFor(fuelType) {
  return fuelType === 'Diesel' ? 'Compression Ignition' : 'Spark Ignition'
}

function configurationFor(model, fuelType) {
  const cylinders = inferCylinders(model)
  const cylinderText = cylinders ? `Inline-${cylinders}` : 'Legacy'
  if (/^4-|^6-/.test(model)) return `${cylinderText} F-head ${fuelType.toLowerCase()} engine model series`
  return `${cylinderText} ${fuelType.toLowerCase()} engine model series`
}

function row(model, start, end, sourceKey, note = '') {
  const fuelType = fuelFor(model)
  const source = SOURCES[sourceKey]
  return clean({
    slug: `waukesha-${slugify(model)}`,
    brand: 'Waukesha',
    model,
    series: 'Early Historical Waukesha Model Series',
    status: 'discontinued',
    year_introduced: start,
    year_discontinued: end,
    origin: 'United States',
    fuel_type: fuelType,
    ignition_type: ignitionFor(fuelType),
    cooling_method: 'Liquid-Cooled',
    emissions_standard: `Historical production ended ${end}`,
    certifications: [
      'Waukesha Engine Historical Society production table',
      'Waukesha Engine Historical Society model-designation guide',
    ],
    cylinders: inferCylinders(model),
    configuration: configurationFor(model, fuelType),
    description:
      `Waukesha ${model} discontinued early historical engine model series. ` +
      `The Waukesha Engine Historical Society production table lists this model series from ${start} to ${end}; ` +
      'its model-designation guide explains the early letter, six-cylinder, and F-head naming schemes used by these rows. ' +
      `This supports a source-validated legacy page for owners searching parts, service, restoration, and overhaul information. ${note}`.trim(),
    source_url: source.url,
  })
}

const RECORDS = [
  row('4-95', 1931, 1943, '1906-1931'),
  row('6A', 1924, 1942, '1906-1931'),
  row('6H', 1925, 1933, '1906-1931'),
  row('6K', 1926, 1935, '1906-1931'),
  row('6LK', 1930, 1940, '1906-1931'),
  row('6LRO', 1930, 1963, '1906-1931'),
  row('6LS', 1930, 1938, '1906-1931'),
  row('6MK', 1930, 1947, '1906-1931'),
  row('6ML', 1930, 1938, '1906-1931'),
  row('6MS', 1930, 1936, '1906-1931'),
  row('6MZ', 1930, 1960, '1906-1931'),
  row('6Q', 1925, 1928, '1906-1931'),
  row('6R', 1924, 1942, '1906-1931'),
  row('6SRK', 1930, 1958, '1906-1931'),
  row('6SRL', 1929, 1944, '1906-1931'),
  row('6SRS', 1930, 1937, '1906-1931'),
  row('6TL', 1929, 1936, '1906-1931'),
  row('6TS', 1929, 1932, '1906-1931'),
  row('6X', 1927, 1937, '1906-1931'),
  row('6ZK', 1931, 1943, '1906-1931'),
  row('BD', 1931, 1945, '1906-1931'),
  row('CHK', 1931, 1944, '1906-1931'),
  row('CHS', 1930, 1941, '1906-1931'),
  row('DWF', 1930, 1932, '1906-1931'),
  row('DWL', 1930, 1932, '1906-1931', 'WEHS firsts identify Model DWL as Waukesha first diesel.'),
  row('FDB', 1931, 1937, '1906-1931'),
  row('FEB', 1931, 1943, '1906-1931'),
  row('FK', 1931, 1937, '1906-1931'),
  row('FL', 1931, 1937, '1906-1931'),
  row('HL', 1928, 1941, '1906-1931'),
  row('HS', 1928, 1936, '1906-1931'),
  row('JK', 1927, 1938, '1906-1931'),
  row('JL', 1926, 1937, '1906-1931'),
  row('JS', 1926, 1936, '1906-1931'),
  row('JZ', 1931, 1934, '1906-1931'),
  row('UM', 1931, 1936, '1906-1931'),
  row('VIL', 1930, 1938, '1906-1931'),
  row('VIM', 1930, 1948, '1906-1931'),
  row('VIS', 1930, 1948, '1906-1931'),
  row('WK', 1926, 1941, '1906-1931'),
  row('WL', 1924, 1940, '1906-1931'),
  row('WOK', 1931, 1941, '1906-1931'),
  row('WS', 1924, 1937, '1906-1931'),
  row('XAH', 1930, 1964, '1906-1931'),
  row('XAK', 1929, 1938, '1906-1931'),
  row('130G', 1940, 1951, '1932-1944'),
  row('140G', 1939, 1965, '1932-1944'),
  row('140GZ', 1941, 1965, '1932-1944'),
  row('140H', 1940, 1949, '1932-1944'),
  row('145G', 1940, 1964, '1932-1944'),
  row('145GZ', 1942, 1965, '1932-1944'),
  row('150', 1938, 1944, '1932-1944'),
  row('151', 1939, 1942, '1932-1944'),
  row('152', 1941, 1941, '1932-1944'),
  row('160', 1940, 1954, '1932-1944'),
  row('165', 1941, 1941, '1932-1944'),
  row('175GL', 1943, 1944, '1932-1944'),
  row('180KL', 1944, 1951, '1932-1944'),
  row('185KL', 1944, 1952, '1932-1944'),
  row('190G', 1944, 1958, '1932-1944'),
  row('4-115', 1932, 1941, '1932-1944'),
  row('4-48', 1933, 1933, '1932-1944'),
  row('4-55', 1932, 1937, '1932-1944'),
  row('4-80', 1933, 1937, '1932-1944'),
  row('6-110', 1933, 1942, '1932-1944'),
  row('6-125', 1932, 1939, '1932-1944'),
  row('6-90', 1932, 1936, '1932-1944'),
  row('6BA', 1934, 1936, '1932-1944'),
  row('6BK', 1933, 1945, '1932-1944'),
  row('6BKH', 1933, 1945, '1932-1944'),
  row('6BL', 1933, 1946, '1932-1944'),
  row('6BM', 1935, 1948, '1932-1944'),
  row('6BZ', 1937, 1957, '1932-1944'),
  row('6D-100', 1934, 1938, '1932-1944'),
  row('6D-125', 1934, 1936, '1932-1944'),
  row('6D-140', 1936, 1938, '1932-1944'),
  row('6DA-100', 1934, 1938, '1932-1944'),
  row('6DA-140', 1936, 1938, '1932-1944'),
  row('6EK', 1936, 1945, '1932-1944'),
  row('6EL', 1934, 1942, '1932-1944'),
]

const VRG_FIX_MODELS = ['VRG155', 'VRG220', 'VRG265', 'VRG283', 'VRG310', 'VRG330']

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
  return normalize(html).includes(normalize(model))
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
    const source = verified.get(record.source_url === SOURCES['1906-1931'].url ? '1906-1931' : '1932-1944')
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
      .select('id, brand, model, slug, status, fuel_type, ignition_type, configuration')
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

function buildReport({ existingCount, missing, linkedCount, skippedLinks, fixedVrgRows, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 70 Waukesha Early Historical

Date: 2026-08-12

## Result

- Source-validated Waukesha early historical candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Evidence links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Evidence links skipped as existing: \`${skippedLinks}\`
- Batch 69 VRG fuel rows ${APPLY ? 'corrected' : 'planned for correction'}: \`${fixedVrgRows.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy document/reference coverage after import: \`${coverage.legacyWithDocs}/${coverage.legacyCount}\` (${(coverage.legacyWithDocs / coverage.legacyCount * 100).toFixed(1)}%)\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Fuel | Cyl | Production | Source |
| --- | --- | --- | ---: | --- | --- |
${missing.map((record) => `| ${record.brand} | ${record.model} | ${record.fuel_type} | ${record.cylinders ?? ''} | ${record.year_introduced}-${record.year_discontinued} | ${record.source_url} |`).join('\n')}

## Fuel Corrections

${fixedVrgRows.map((row) => `- ${row.model}: ${row.previousFuel}/${row.previousIgnition} -> Natural Gas/Spark Ignition`).join('\n') || '- None'}

## Validation Sources

${Object.values(SOURCES).map((source) => `- ${source.label}: ${source.url}`).join('\n')}

## Notes

- These rows are historical model-series SEO targets. WEHS explicitly says the production tables are by model series, not individual subvariant.
- The model-designation source validates the early naming rules used for conservative cylinder and fuel classification: first four-cylinder letter models, six-cylinder \`6...\` models, F-head \`4-\` and \`6-\` models, \`6D-\` diesel examples, and \`G\` for carbureted gasoline/gaseous fuel.
- Each imported row receives an \`engine_pdfs\` evidence link of type \`other\` to the matching WEHS production table. These are source-reference links, not datasheet PDFs.
- Marine-only or non-engine rows from the source tables were excluded.
`
}

await loadEnv()
const verifiedSources = verifySources()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Waukesha early historical legacy batch`)

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
  console.log(`Inserted ${missing.length} Waukesha early historical rows`)
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
    throw new Error(`Unexpected Waukesha evidence target: ${engine.slug}`)
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

const fixedVrgRows = []
for (const model of VRG_FIX_MODELS) {
  const engine = existing.find((row) => row.brand === 'Waukesha' && normalize(row.model) === normalize(model))
  if (!engine) continue
  if (engine.fuel_type === 'Natural Gas' && engine.ignition_type === 'Spark Ignition') continue

  fixedVrgRows.push({
    model,
    slug: engine.slug,
    previousFuel: engine.fuel_type,
    previousIgnition: engine.ignition_type,
  })

  if (APPLY) {
    const { error } = await supabase
      .from('engines')
      .update({
        fuel_type: 'Natural Gas',
        ignition_type: 'Spark Ignition',
        configuration: 'Legacy stationary spark-ignited gas engine model series',
      })
      .eq('id', engine.id)
    if (error) throw error
    console.log(`Corrected ${model} fuel classification to Natural Gas / Spark Ignition`)
  }
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
  fixedVrgRows,
  afterCount: APPLY ? afterCount : null,
  coverage: APPLY ? coverage : null,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with documents/references: ${coverage.legacyWithDocs}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
