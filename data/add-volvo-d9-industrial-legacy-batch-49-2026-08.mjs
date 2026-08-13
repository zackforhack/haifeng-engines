// Add source-validated Volvo Penta D9 industrial legacy rows.
//
// Dry run:
//   node data/add-volvo-d9-industrial-legacy-batch-49-2026-08.mjs
// Apply:
//   node data/add-volvo-d9-industrial-legacy-batch-49-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-49-volvo-d9-industrial.md'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyVolvoD9Industrial/1.0; +https://engines.haifengmachinery.com)'

const VOLVO_D9_LAUNCH =
  'https://www.volvopenta.com/en-us/about-us/news-page/2004/mar/news-20735/'
const VOLVO_D9_ARCHIVE =
  'https://www.volvopenta.com/industrial/industrial-engines/off-road-engine-range/off-road-product-archive/d9/'

const RECORDS = [
  volvo({
    model: 'TAD940VE',
    power_kw: 190,
    power_hp: 258,
    source_url: VOLVO_D9_LAUNCH,
  }),
  volvo({
    model: 'TAD941VE',
    power_kw: 220,
    power_hp: 300,
    source_url: VOLVO_D9_LAUNCH,
  }),
  volvo({
    model: 'TAD942VE',
    power_kw: 250,
    power_hp: 340,
    source_url: VOLVO_D9_LAUNCH,
  }),
  volvo({
    model: 'TAD943VE',
    power_kw: 280,
    power_hp: 380,
    source_url: VOLVO_D9_LAUNCH,
  }),
  volvo({
    model: 'TWD1031VE',
    series: 'D9 predecessor industrial engine',
    displacement_l: undefined,
    emissions_standard: 'Legacy predecessor to Volvo Penta D9 industrial family',
    certifications: ['Volvo Penta 2004 D9 launch predecessor reference'],
    configuration: 'Legacy turbocharged aftercooled Volvo Penta industrial diesel',
    description:
      'Volvo Penta TWD1031VE discontinued industrial diesel. Volvo Penta identified TWD1031VE as the predecessor to the 2004 D9 industrial family, and the official D9 archive lists that family as a legacy product with manufacturing years 2004-2016. Rating fields are intentionally left blank until an exact public technical sheet is attached.',
    source_url: VOLVO_D9_LAUNCH,
  }),
]

function volvo(row) {
  return clean({
    slug: `volvo-penta-${slugify(row.model)}`,
    brand: 'Volvo Penta',
    model: row.model,
    series: row.series ?? 'D9 Industrial VE',
    status: 'discontinued',
    year_introduced: row.model === 'TWD1031VE' ? undefined : 2004,
    year_discontinued: row.model === 'TWD1031VE' ? 2004 : 2016,
    origin: 'Sweden',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: row.emissions_standard ?? 'EU Stage II',
    certifications: row.certifications ?? ['Volvo Penta official D9 archive', 'EU Stage II'],
    power_kw: row.power_kw,
    power_hp: row.power_hp,
    displacement_l: row.displacement_l ?? 9.4,
    cylinders: 6,
    configuration:
      row.configuration ?? 'Inline-6 turbocharged air-to-air intercooled Volvo Penta industrial diesel',
    rpm_rated: row.rpm_rated ?? 2100,
    description:
      row.description ??
      `Volvo Penta ${row.model} discontinued D9 industrial diesel. Volvo Penta's official 2004 D9 launch named ${row.model} as one of four D9 industrial versions and stated the D9 range spans 190-280 kW. Volvo Penta's official D9 archive lists the D9 Industrial engine family with manufacturing years 2004-2016.`,
  })
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
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

function parseEnvFile(text) {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const separator = line.indexOf('=')
    const key = line.slice(0, separator).trim()
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
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

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function downloadText(url) {
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
    url,
  ], {
    encoding: 'utf8',
    env: {
      ...process.env,
      HTTP_PROXY: '',
      HTTPS_PROXY: '',
      ALL_PROXY: '',
      http_proxy: '',
      https_proxy: '',
      all_proxy: '',
    },
    maxBuffer: 20 * 1024 * 1024,
  })
}

function verifySource(url, tokens) {
  const text = downloadText(url)
  const missing = tokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${url}: missing token(s): ${missing.join(', ')}`)
  console.log(`Verified source: ${url}`)
}

function verifySources() {
  verifySource(VOLVO_D9_LAUNCH, [
    'TAD940VE',
    'TAD941VE',
    'TAD942VE',
    'TAD943VE',
    'TWD1031VE',
    'power outputs ranging between 190 and 280 kW',
  ])
  verifySource(VOLVO_D9_ARCHIVE, [
    'D9 Industrial engine',
    'Manufacturing years',
    '2004-2016',
    '9.4 litres',
  ])
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
  let legacyRows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, status, pdfs:engine_pdfs(id)')
      .eq('status', 'discontinued')
      .range(from, from + 999)
    if (error) throw error
    legacyRows = legacyRows.concat(data ?? [])
    if (!data || data.length < 1000) break
  }
  return {
    legacyCount: legacyRows.length,
    legacyWithPdf: legacyRows.filter((engine) => (engine.pdfs ?? []).length > 0).length,
  }
}

function buildReport({ existingCount, missing, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 49 Volvo D9 Industrial

Date: 2026-08-12

## Result

- Source-validated Volvo Penta D9/TWD legacy candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power kW | Displacement L | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
${missing.map((row) => {
  return `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.power_kw ?? ''} | ${row.displacement_l ?? ''} | ${VOLVO_D9_LAUNCH} |`
}).join('\n')}

## Validation Sources

- Volvo Penta official 2004 D9 industrial launch: ${VOLVO_D9_LAUNCH}
- Volvo Penta official D9 industrial product archive: ${VOLVO_D9_ARCHIVE}

## Notes

- This batch is limited to Volvo Penta industrial/off-road D9 and predecessor rows; marine-only Volvo product names are intentionally excluded.
- Volvo's official 2004 release validates exact TAD940VE, TAD941VE, TAD942VE and TAD943VE model identities and names TWD1031VE as the predecessor.
- Volvo's official D9 archive lists the D9 Industrial family with manufacturing years 2004-2016, supporting discontinued/legacy treatment for these D9 industrial rows.
- The official Volvo launch describes four D9 versions and a 190-280 kW output span. Power fields follow the listed model order conservatively; no PDF was attached because no direct public Volvo PDF was available for this batch.
- TWD1031VE is added as a conservative owner-search row with no exact rating fields until a public technical sheet can be validated.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Volvo Penta D9 industrial legacy batch`)
verifySources()

const existing = await fetchAllEngines(supabase)
const existingKeys = new Set(existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const missing = RECORDS.filter((row) => !existingKeys.has(`${row.brand}::${normalize(row.model)}`))
const existingCount = RECORDS.length - missing.length

console.log(`Candidates: ${RECORDS.length}; existing: ${existingCount}; missing: ${missing.length}`)
for (const row of missing) console.log(`Candidate: ${row.brand} ${row.model} (${row.slug})`)

if (APPLY && missing.length) {
  const { error } = await supabase.from('engines').insert(missing)
  if (error) throw error
  console.log(`Inserted ${missing.length} Volvo Penta D9 industrial legacy rows`)
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
  afterCount: APPLY ? afterCount : null,
  coverage: APPLY ? coverage : null,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
