// Add source-validated Volvo Penta legacy genset engines from RAAD pages whose
// linked product bulletin PDFs are no longer downloadable.
//
// Dry run:
//   node data/add-volvo-raad-orphan-legacy-gensets-batch-43-2026-08.mjs
// Apply:
//   node data/add-volvo-raad-orphan-legacy-gensets-batch-43-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-43-volvo-raad-orphan-gensets.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-volvo-raad-orphan-gensets-batch-43-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyVolvoRaadOrphanGenset/1.0; +https://engines.haifengmachinery.com)'
const RAAD_BASE = 'https://www.raad-eng.com/techdata/volvo'
const RAAD_INDEX = `${RAAD_BASE}/engines/`

const CANDIDATES = [
  candidate({
    page: 'tad740ge',
    model: 'TAD740GE',
    series: 'D7 Power Generation',
    displacement_l: 7.15,
    cylinders: 6,
    emissions_standard: 'EPA/CARB Tier 1 and TA-luft',
    tokens: ['VOLVO PENTA GENSET ENGINE', 'TAD740GE', '1 500rpm, 242 kW', '1 800rpm, 251 kW'],
  }),
  candidate({
    page: 'tad741ge',
    model: 'TAD741GE',
    series: 'D7 Power Generation',
    displacement_l: 7.15,
    cylinders: 6,
    emissions_standard: 'EPA/CARB Tier 2 and TA-luft',
    tokens: ['VOLVO PENTA GENSET ENGINE', 'TAD741GE', '1 800rpm, 228 kW'],
  }),
  candidate({
    page: 'td710ge',
    model: 'TD710G',
    series: 'Early D7 Power Generation',
    displacement_l: 6.73,
    cylinders: 6,
    emissions_standard: 'Legacy Volvo Penta archived genset literature',
    aftercooled: false,
    tokens: ['VOLVO PENTA GENSET ENGINE', 'TD710G', '1500 rpm, 156 kW', '1800 rpm, 168 kW'],
  }),
]

function candidate(input) {
  return {
    ...input,
    slug: `volvo-penta-${slugify(input.model)}`,
    pageUrl: `${RAAD_BASE}/engines/${input.page}.html`,
  }
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

function kwToHp(kw) {
  return Math.round((kw / 0.7457) * 10) / 10
}

function download(url, outputPath, options = {}) {
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '2',
    '--connect-timeout',
    '30',
    '--max-time',
    String(options.maxTime ?? 120),
    '--user-agent',
    USER_AGENT,
    '--output',
    outputPath,
    url,
  ], {
    maxBuffer: 10 * 1024 * 1024,
  })
}

function verifyIndex() {
  const indexPath = path.join(TMP_DIR, 'raad-volvo-engines-index.html')
  download(RAAD_INDEX, indexPath)
  const text = fs.readFileSync(indexPath, 'utf8')
  const missing = CANDIDATES
    .map((item) => `${item.page}.html`)
    .filter((token) => !text.includes(token))
  if (missing.length) throw new Error(`${RAAD_INDEX}: missing archived page(s): ${missing.join(', ')}`)
}

function parsePage(entry) {
  const pagePath = path.join(TMP_DIR, `${entry.page}.html`)
  download(entry.pageUrl, pagePath)
  const html = fs.readFileSync(pagePath, 'latin1')
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const missing = entry.tokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${entry.pageUrl}: missing page token(s): ${missing.join(', ')}`)

  const kwMatches = [...text.matchAll(/(?:1\s*)?(?:500|800)\s*rpm,\s*([0-9]+)\s*kW/gi)]
  const kwValues = kwMatches.map((match) => Number(match[1])).filter(Number.isFinite)
  const rpmMatches = [...text.matchAll(/((?:1\s*)?(?:500|800))\s*rpm,\s*([0-9]+)\s*kW/gi)]
  const rpmValues = rpmMatches
    .map((match) => Number(match[1].replace(/\s/g, '')))
    .filter(Number.isFinite)

  return {
    ...entry,
    pageText: text,
    power_kw: kwValues.length ? Math.max(...kwValues) : undefined,
    rpm_rated: rpmValues.length ? Math.max(...rpmValues) : undefined,
  }
}

function buildRecord(entry) {
  const aftercooled = entry.aftercooled !== false && /^TA|^TWD/i.test(entry.model)
  return clean({
    slug: entry.slug,
    brand: 'Volvo Penta',
    model: entry.model,
    series: entry.series,
    status: 'discontinued',
    origin: 'Sweden',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: entry.emissions_standard,
    certifications: ['RAAD archived Volvo Penta technical library'],
    power_kw: entry.power_kw,
    power_hp: entry.power_kw ? kwToHp(entry.power_kw) : undefined,
    displacement_l: entry.displacement_l,
    cylinders: entry.cylinders,
    configuration: `Inline-${entry.cylinders} ${aftercooled ? 'turbocharged aftercooled' : 'turbocharged'} diesel generator-drive engine`,
    rpm_rated: entry.rpm_rated,
    description:
      `Volvo Penta ${entry.model} discontinued legacy generator-drive diesel. ` +
      `RAAD's archived Volvo Penta technical library lists an exact ${entry.model} genset page with rated output ` +
      `data, but the page's linked Product Bulletin/Technical Data PDFs are no longer downloadable from the archive.`,
  })
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

function buildReport({ existingCount, missing, parsedEntries, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 43 Volvo RAAD Orphan Archived Gensets

Date: 2026-08-12

## Result

- RAAD archived Volvo Penta genset pages reviewed: \`${parsedEntries.length}\`
- New legacy rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Already present before import: \`${existingCount}\`
- Datasheet/Product Bulletin PDFs attached: \`0\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Max kW from RAAD page | RPM | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
${missing.map((row) => {
  const source = parsedEntries.find((item) => item.slug === row.slug)
  return `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.power_kw ?? ''} | ${row.rpm_rated ?? ''} | ${source?.pageUrl ?? ''} |`
}).join('\n')}

## Validation Sources

- RAAD archived Volvo Penta engines index: ${RAAD_INDEX}
${parsedEntries.map((item) => `- ${item.model} archived page: ${item.pageUrl}`).join('\n')}

## Rejected/Unavailable Documents

- ${RAAD_BASE}/prodbull/tad740ge.pdf returned 404 during probing.
- ${RAAD_BASE}/prodbull/TAD741GE_rgb.pdf is linked from the archived page but is not listed in the surviving Product Bulletin index.
- ${RAAD_BASE}/prodbull/td710g.pdf returned 404 during probing.
- The related Technical Data folder URLs returned 404 during probing, so no datasheet/manual link was attached in this batch.

## Notes

- This batch is limited to archived Volvo Penta genset pages under RAAD's Volvo technical library; marine-only Volvo rows are intentionally excluded.
- New records use conservative metadata from the archived page text only. Rows with dead document links are intentionally kept without PDFs until a surviving exact Product Bulletin or Technical Data PDF can be validated.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Volvo RAAD orphan archived gensets batch`)
verifyIndex()
const parsedEntries = CANDIDATES.map((item) => parsePage(item))

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const existing = await fetchAllEngines(supabase)
const existingByBrandModel = new Set(existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const targetRecords = parsedEntries.map((item) => buildRecord(item))
const missing = targetRecords.filter(
  (row) => !existingByBrandModel.has(`${row.brand}::${normalize(row.model)}`),
)
const existingCount = targetRecords.length - missing.length

console.log(`New-row candidates: ${targetRecords.length}; existing: ${existingCount}; missing: ${missing.length}`)
for (const row of missing) console.log(`Candidate: ${row.brand} ${row.model} (${row.slug})`)

if (APPLY && missing.length) {
  const { error } = await supabase.from('engines').insert(missing)
  if (error) throw error
  console.log(`Inserted ${missing.length} Volvo Penta orphan archived genset rows`)
}

const refreshed = APPLY ? await fetchAllEngines(supabase) : existing
const afterCount = APPLY ? refreshed.length : null
const coverage = APPLY ? await countLegacyCoverage(supabase) : null
const report = buildReport({
  existingCount,
  missing,
  parsedEntries,
  afterCount,
  coverage,
})
await fsp.writeFile(REPORT_PATH, report)
console.log(`Wrote ${REPORT_PATH}`)
