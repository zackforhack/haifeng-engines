// Add source-validated Caterpillar C6.6 60 Hz legacy generator-set package row.
// The page links Cat spec/rating resources, but no exact downloadable C6.6 PDF
// was validated for this batch, so this is a model-depth import only.
//
// Dry run:
//   node data/add-cat-c66-60hz-legacy-batch-45-2026-08.mjs
// Apply:
//   node data/add-cat-c66-60hz-legacy-batch-45-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-45-cat-c66-60hz-legacy.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-cat-c66-60hz-batch-45-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyCatC6660Hz/1.0; +https://engines.haifengmachinery.com)'

const ENTRY = {
  pageUrl:
    'https://h-cpc.cat.com/cmms/v2?cid=402&f=product&gid=18260932&it=product&lid=en&nc=1&pid=18488397&sc=K212',
  pageTokens: [
    'Non-Current',
    'Cat C6.6 (60 Hz) Diesel Generator Sets',
    'Producing reliable power from 114 ekW to 158 ekW at 60Hz',
    'Minimum Rating',
    '114 ekW',
    'Maximum Rating',
    '175 ekW',
    'Tier 3 Nonroad Equiv.',
    'C6.6, In-line 6, 4-cycle diesel',
  ],
  row: {
    slug: 'caterpillar-c6-6-60-hz-tier-3-legacy-genset',
    brand: 'Caterpillar',
    model: 'C6.6 60 Hz Tier 3 Legacy Genset',
    series: 'C6.6',
    status: 'discontinued',
    origin: 'United States',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'Tier 3 Nonroad Equivalent',
    certifications: ['Caterpillar Non-Current product page'],
    power_kw: 175,
    power_hp: kwToHp(175),
    cylinders: 6,
    configuration: 'C6.6 inline-6 four-cycle diesel generator-set package',
    rpm_rated: 1800,
    rpm_max: 1800,
    description:
      'Caterpillar C6.6 60 Hz discontinued/non-current diesel generator-set package. ' +
      'Cat H-CPC marks the source page as Non-Current and validates 114-175 ekW ratings, ' +
      '60 Hz operation, Tier 3 Nonroad Equivalent emissions strategy, and the C6.6 inline-6 four-cycle diesel engine model.',
  },
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

function normalize(value) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function kwToHp(kw) {
  return Math.round((kw / 0.7457) * 10) / 10
}

function download(url, outputPath) {
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '4',
    '--retry-all-errors',
    '--connect-timeout',
    '30',
    '--max-time',
    '180',
    '--user-agent',
    USER_AGENT,
    '--output',
    outputPath,
    url,
  ], {
    maxBuffer: 20 * 1024 * 1024,
  })
}

function verifyPage() {
  const localPath = path.join(TMP_DIR, 'cat-c66-60hz-noncurrent.html')
  download(ENTRY.pageUrl, localPath)
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = ENTRY.pageTokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${ENTRY.pageUrl}: missing page token(s): ${missing.join(', ')}`)
}

async function fetchAllEngines(supabase) {
  const engines = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, brand, model, slug, status, pdfs:engine_pdfs(id)')
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

function buildReport({ missing, existingCount, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 45 Cat C6.6 60 Hz Legacy Genset

Date: 2026-08-12

## Result

- Official Cat non-current C6.6 candidates reviewed: \`1\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing ? 1 : 0}\`
- Datasheet/brochure links inserted: \`0\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power kW | RPM | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
${missing ? `| ${ENTRY.row.brand} | ${ENTRY.row.model} | ${ENTRY.row.series} | ${ENTRY.row.status} | ${ENTRY.row.power_kw} | ${ENTRY.row.rpm_rated} | ${ENTRY.pageUrl} |` : ''}

## Validation Sources

- ${ENTRY.row.model} non-current source page: ${ENTRY.pageUrl}

## Rejected/Unavailable Documents

- Cat Electric Power Ratings Guide is linked from the page, but extracted text did not contain exact C6.6 rows, so it was not attached to this row.
- The Cat C6.6 Spec Sheets page request stalled during probing; no exact downloadable PDF was validated for this batch.

## Notes

- This batch uses a Caterpillar official H-CPC page marked \`Non-Current\`.
- The Cat page validates 114-175 ekW ratings, 60 Hz operation, Tier 3 Nonroad Equivalent emissions strategy, and C6.6 inline-6 four-cycle diesel engine identity.
- This row is a package/application-specific discontinued generator-set listing, not a replacement for the generic active C6.6 family row.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Cat C6.6 60 Hz legacy genset batch`)
verifyPage()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const before = await fetchAllEngines(supabase)
const existingKeys = new Set(before.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const missing = !existingKeys.has(`${ENTRY.row.brand}::${normalize(ENTRY.row.model)}`)
const existingCount = missing ? 0 : 1
console.log(`Candidates: 1; existing: ${existingCount}; missing: ${missing ? 1 : 0}`)

if (APPLY && missing) {
  const { error } = await supabase.from('engines').insert([ENTRY.row])
  if (error) throw error
  console.log('Inserted 1 Cat C6.6 60 Hz legacy genset row')
}

const refreshed = APPLY && missing ? await fetchAllEngines(supabase) : before
const afterCount = APPLY ? refreshed.length : null
const coverage = APPLY ? await countLegacyCoverage(supabase) : null
const report = buildReport({
  missing,
  existingCount,
  afterCount,
  coverage,
})
await fsp.writeFile(REPORT_PATH, report)
console.log(`Wrote ${REPORT_PATH}`)
