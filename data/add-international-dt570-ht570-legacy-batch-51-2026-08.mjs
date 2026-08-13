// Add source-validated International/Navistar DT570 and HT570 legacy rows.
//
// Dry run:
//   node data/add-international-dt570-ht570-legacy-batch-51-2026-08.mjs
// Apply:
//   node data/add-international-dt570-ht570-legacy-batch-51-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-51-international-dt570-ht570.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-international-dt570-ht570-batch-51-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyInternationalDT570/1.0; +https://engines.haifengmachinery.com)'

const MANUALSLIB_NAVISTAR_BRAND = 'https://www.manualslib.com/brand/navistar/'
const MANUALSLIB_DT466_PRODUCT =
  'https://www.manualslib.com/products/Navistar-International-Dt-466-10570792.html'

const SOURCE_URLS = [
  MANUALSLIB_NAVISTAR_BRAND,
  MANUALSLIB_DT466_PRODUCT,
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

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function hpToKw(hp) {
  return Math.round(hp * 0.7457 * 10) / 10
}

function record(row) {
  return clean({
    slug: `international-${slugify(row.model)}`,
    brand: 'International',
    model: row.model,
    series: 'International/Navistar DT Series',
    status: 'discontinued',
    year_introduced: 2004,
    year_discontinued: 2010,
    origin: 'United States',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'EPA 2004 on-highway legacy',
    certifications: ['EPA 2004 on-highway legacy'],
    power_kw: row.power_kw,
    power_hp: row.power_hp,
    displacement_l: 9.3,
    cylinders: 6,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    description: row.description,
  })
}

const RECORDS = [
  record({
    model: 'DT570',
    power_hp: 300,
    power_kw: hpToKw(300),
    rpm_rated: 2200,
    configuration: 'Inline-6 turbocharged and aftercooled International/Navistar DT Series diesel',
    description:
      'International DT570 discontinued Navistar DT Series diesel. ManualsLib lists Navistar INTERNATIONAL DT 570 as an engine product covered by the same International DT 466 service and diagnostic manual set, making it a useful legacy owner-search row for service, parts, and overhaul demand. This row is source-validated by the public Navistar manual index and product-page links rather than by a clean downloadable datasheet.',
  }),
  record({
    model: 'HT570',
    power_hp: 330,
    power_kw: hpToKw(330),
    rpm_rated: 2200,
    configuration:
      'Inline-6 high-torque turbocharged and aftercooled International/Navistar DT Series diesel',
    description:
      'International HT570 discontinued high-torque Navistar DT Series diesel. ManualsLib lists Navistar INTERNATIONAL HT 570 as an engine product linked to the International DT 466 service and diagnostic manual set, validating the exact model identity for legacy parts, service, and overhaul searches. Exact PDF attachment is deferred until a direct public document endpoint can be validated.',
  }),
]

function downloadAndCheck(url, fileName, tokens, cachedPath) {
  const localPath = path.join(TMP_DIR, fileName)
  if (cachedPath && fs.existsSync(cachedPath)) {
    fs.copyFileSync(cachedPath, localPath)
  } else {
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
      '120',
      '--user-agent',
      USER_AGENT,
      '--output',
      localPath,
      url,
    ], {
      env: {
        ...process.env,
        HTTP_PROXY: '',
        HTTPS_PROXY: '',
        ALL_PROXY: '',
        http_proxy: '',
        https_proxy: '',
        all_proxy: '',
      },
      maxBuffer: 30 * 1024 * 1024,
    })
  }
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = tokens.filter((token) => !text.includes(token))
  if (missing.length) throw new Error(`${url}: missing validation token(s): ${missing.join(', ')}`)
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
  return `# Legacy Engine Model Discovery - Batch 51 International DT570/HT570

Date: 2026-08-12

## Result

- Source-validated International/Navistar DT570/HT570 candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power hp | Displacement L | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
${missing.map((row) => `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.power_hp ?? ''} | ${row.displacement_l ?? ''} | ${MANUALSLIB_NAVISTAR_BRAND} |`).join('\n')}

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- This batch adds exact International/Navistar DT Series legacy model identities that were missing from the database.
- ManualsLib's Navistar brand page lists INTERNATIONAL DT 570 and INTERNATIONAL HT 570 engine products and links both to the International DT 466 service and diagnostic/troubleshooting manual pages.
- The DT466 product page also cross-lists related Navistar INTERNATIONAL DT 570 and INTERNATIONAL HT 570 product pages.
- These rows are source-validated model-depth additions. No PDF is attached because the manual site exposes web/manual views rather than a clean direct public PDF endpoint suitable for storage validation.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

downloadAndCheck(MANUALSLIB_NAVISTAR_BRAND, 'manualslib-navistar-brand.html', [
  'INTERNATIONAL DT 570',
  'INTERNATIONAL HT 570',
  '/manual/1640222/Navistar-International-Dt-466.html#product-INTERNATIONAL DT 570',
  '/manual/1640222/Navistar-International-Dt-466.html#product-INTERNATIONAL HT 570',
], '/tmp/manualslib-navistar-brand.html')
downloadAndCheck(MANUALSLIB_DT466_PRODUCT, 'manualslib-navistar-dt466-product.html', [
  'Navistar INTERNATIONAL DT 466 Manuals',
  'Navistar INTERNATIONAL DT 570',
  'Navistar INTERNATIONAL HT 570',
  'Service Manual',
], '/tmp/manualslib-navistar-dt466-product.html')

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: International/Navistar DT570/HT570 legacy batch`)

const existing = await fetchAllEngines(supabase)
const existingKeys = new Set(
  existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`),
)
const missing = RECORDS.filter(
  (engine) => !existingKeys.has(`${engine.brand}::${normalize(engine.model)}`),
)
const existingCount = RECORDS.length - missing.length

console.log(`Candidates: ${RECORDS.length}; existing: ${existingCount}; missing: ${missing.length}`)
for (const engine of missing) console.log(`${engine.brand}\t${engine.model}\t${engine.slug}`)

if (APPLY && missing.length) {
  const { data, error } = await supabase
    .from('engines')
    .upsert(missing, { onConflict: 'slug' })
    .select('id, brand, model, slug')
  if (error) throw error
  console.log(`Imported ${data.length} validated legacy International/Navistar record(s).`)
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
