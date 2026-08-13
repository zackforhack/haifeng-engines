// Add source-validated Volvo Penta off-road archive legacy rows.
//
// Dry run:
//   node data/add-volvo-offroad-archive-legacy-batch-31-2026-08.mjs
// Apply:
//   node data/add-volvo-offroad-archive-legacy-batch-31-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-31-volvo-offroad-archive.md'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyVolvoOffroadArchive/1.0; +https://engines.haifengmachinery.com)'

const SOURCE_PAGES = [
  {
    key: 'd9',
    url: 'https://www.volvopenta.com/industrial/industrial-engines/off-road-engine-range/off-road-product-archive/d9/',
    requiredTokens: [
      'D9 Industrial engine',
      'variants":["D9-500","D9-575"]',
      'Manufacturing years',
      '2004-2016',
      '9.4 litres',
    ],
  },
  {
    key: 'd12',
    url: 'https://www.volvopenta.com/industrial/industrial-engines/off-road-engine-range/off-road-product-archive/d12/',
    requiredTokens: [
      'D12 Industrial engine',
      'TAD1250VE',
      'TAD1251VE',
      'TAD1252VE',
      'Manufacturing years',
      '2001-2011',
    ],
  },
]

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

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalize(value) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function volvo(row) {
  return clean({
    slug: `volvo-penta-${slugify(row.model)}`,
    brand: 'Volvo Penta',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    origin: 'Sweden',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: row.emissions_standard,
    certifications: ['Volvo Penta official off-road product archive'],
    power_kw: row.power_kw,
    displacement_l: row.displacement_l,
    cylinders: 6,
    configuration: row.configuration,
    description: row.description,
  })
}

const RECORDS = [
  volvo({
    model: 'D9-500',
    series: 'D9 Industrial Off-road',
    power_kw: 373,
    displacement_l: 9.4,
    emissions_standard: 'Volvo Penta off-road product archive 2004-2016',
    configuration: 'Inline-6 off-road diesel industrial engine',
    description:
      'Volvo Penta D9-500 discontinued D9 industrial off-road engine. Volvo Penta official product archive lists D9-500 as a D9 variant, describes the D9 as a 9.4 L inline-six diesel engine, and gives manufacturing years 2004-2016.',
  }),
  volvo({
    model: 'D9-575',
    series: 'D9 Industrial Off-road',
    power_kw: 429,
    displacement_l: 9.4,
    emissions_standard: 'Volvo Penta off-road product archive 2004-2016',
    configuration: 'Inline-6 off-road diesel industrial engine',
    description:
      'Volvo Penta D9-575 discontinued D9 industrial off-road engine. Volvo Penta official product archive lists D9-575 as a D9 variant, describes the D9 as a 9.4 L inline-six diesel engine, and gives manufacturing years 2004-2016.',
  }),
  volvo({
    model: 'TAD1250VE',
    series: 'D12 Industrial VE',
    displacement_l: 12.13,
    emissions_standard: 'Volvo Penta off-road product archive 2001-2011',
    configuration: 'Inline-6 turbocharged industrial diesel with Electronic Diesel Control',
    description:
      'Volvo Penta TAD1250VE discontinued D12 industrial engine. Volvo Penta official off-road product archive lists TAD1250VE in the D12 Industrial engine variants and gives D12 manufacturing years 2001-2011.',
  }),
  volvo({
    model: 'TAD1251VE',
    series: 'D12 Industrial VE',
    displacement_l: 12.13,
    emissions_standard: 'Volvo Penta off-road product archive 2001-2011',
    configuration: 'Inline-6 turbocharged industrial diesel with Electronic Diesel Control',
    description:
      'Volvo Penta TAD1251VE discontinued D12 industrial engine. Volvo Penta official off-road product archive lists TAD1251VE in the D12 Industrial engine variants and gives D12 manufacturing years 2001-2011.',
  }),
  volvo({
    model: 'TAD1252VE',
    series: 'D12 Industrial VE',
    displacement_l: 12.13,
    emissions_standard: 'Volvo Penta off-road product archive 2001-2011',
    configuration: 'Inline-6 turbocharged industrial diesel with Electronic Diesel Control',
    description:
      'Volvo Penta TAD1252VE discontinued D12 industrial engine. Volvo Penta official off-road product archive lists TAD1252VE in the D12 Industrial engine variants and gives D12 manufacturing years 2001-2011.',
  }),
]

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
    maxBuffer: 20 * 1024 * 1024,
  })
}

function verifySourcePages() {
  for (const sourcePage of SOURCE_PAGES) {
    const text = downloadText(sourcePage.url)
    const missing = sourcePage.requiredTokens.filter((token) => !hasToken(text, token))
    if (missing.length) {
      throw new Error(`${sourcePage.url}: missing required token(s): ${missing.join(', ')}`)
    }
    console.log(`Verified Volvo archive source page: ${sourcePage.key}`)
  }
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
  return `# Legacy Engine Model Discovery - Batch 31 Volvo Off-road Archive

Date: 2026-08-11

## Result

- Source-validated Volvo Penta off-road archive candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Cyl | Power kW | Displacement L |
| --- | --- | --- | --- | ---: | ---: | ---: |
${missing.map((row) =>
  `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.cylinders ?? ''} | ${row.power_kw ?? ''} | ${row.displacement_l ?? ''} |`
).join('\n')}

## Validation Sources

${SOURCE_PAGES.map((page) => `- Volvo Penta ${page.key.toUpperCase()} official archive: ${page.url}`).join('\n')}

## Notes

- These are Volvo Penta official archive rows, not marine-only listings.
- D9 rows are added from the official D9 archive variants \`D9-500\` and \`D9-575\`, with the model suffix converted from horsepower to approximate kW for the searchable numeric field.
- TAD1250VE, TAD1251VE and TAD1252VE are added from the official D12 off-road archive variants. Exact per-variant kW fields are intentionally left blank until a first-party or clearly traceable technical sheet is attached.
- This batch improves source-validated model depth. It does not claim new PDF/datasheet coverage because Volvo's archive pages link users to support/manual search rather than a direct public PDF asset on the archive page.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Volvo Penta off-road archive legacy batch`)
verifySourcePages()

const existing = await fetchAllEngines(supabase)
const existingKeys = new Set(existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const missing = RECORDS.filter((row) => !existingKeys.has(`${row.brand}::${normalize(row.model)}`))
const existingCount = RECORDS.length - missing.length

console.log(`Candidates: ${RECORDS.length}; existing: ${existingCount}; missing: ${missing.length}`)

if (APPLY && missing.length) {
  const { error } = await supabase.from('engines').insert(missing)
  if (error) throw error
  console.log(`Inserted ${missing.length} Volvo Penta off-road archive rows`)
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
