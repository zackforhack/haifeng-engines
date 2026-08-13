// Add source-validated Volvo Penta TAD560/TAD761 industrial legacy rows.
//
// Dry run:
//   node data/add-volvo-tad560-761-industrial-legacy-batch-50-2026-08.mjs
// Apply:
//   node data/add-volvo-tad560-761-industrial-legacy-batch-50-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-50-volvo-tad560-761-industrial.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-volvo-tad560-761-batch-50-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyVolvoTAD560761/1.0; +https://engines.haifengmachinery.com)'

const MANUALSLIB_BRAND_INDEX = 'https://www.manualslib.com/brand/volvo-penta/engine.html'
const MANUALSLIB_TAD560_MANUAL =
  'https://www.manualslib.com/manual/3022152/Volvo-Penta-Tad560ve.html'
const VOLVO_CURRENT_OFFROAD =
  'https://www.volvopenta.com/industrial/industrial-engines/off-road-engine-range/'
const VOLVO_ARCHIVE =
  'https://www.volvopenta.com/industrial/industrial-engines/off-road-engine-range/off-road-product-archive/'

const SOURCE_URLS = [
  MANUALSLIB_BRAND_INDEX,
  MANUALSLIB_TAD560_MANUAL,
  VOLVO_CURRENT_OFFROAD,
  VOLVO_ARCHIVE,
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

function kwToHp(kw) {
  return Math.round((kw / 0.7457) * 10) / 10
}

function record(row) {
  return clean({
    slug: `volvo-penta-${slugify(row.model)}`,
    brand: 'Volvo Penta',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    year_introduced: 2012,
    origin: 'Sweden',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'EPA/CARB industrial EATS legacy',
    certifications: ['EPA/CARB industrial EATS'],
    power_kw: row.power_kw,
    power_hp: row.power_kw ? kwToHp(row.power_kw) : undefined,
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    rpm_rated: 2200,
    description: row.description,
  })
}

const RECORDS = [
  record({
    model: 'TAD560VE',
    series: 'D5 Industrial VE',
    power_kw: 105,
    displacement_l: 5.1,
    cylinders: 4,
    configuration: 'Inline-4 common-rail turbocharged aftercooled Volvo Penta industrial diesel',
    description:
      'Volvo Penta TAD560VE legacy industrial diesel. The Volvo Penta operator-manual index identifies TAD560VE as an industrial engine in the same manual family as TAD561VE and TAD761VE-TAD765VE, with common-rail fuel injection, EMS 2 engine management, turbocharging, thermostatically controlled cooling, and electronic speed control. This row is added for legacy owner-search coverage because the current Volvo Penta off-highway range no longer lists the TAD560/TAD761 industrial generation.',
  }),
  record({
    model: 'TAD561VE',
    series: 'D5 Industrial VE',
    power_kw: 129,
    displacement_l: 5.1,
    cylinders: 4,
    configuration: 'Inline-4 common-rail turbocharged aftercooled Volvo Penta industrial diesel',
    description:
      'Volvo Penta TAD561VE legacy industrial diesel. ManualsLib indexes it as covered by the Volvo Penta TAD560VE operator manual, and that manual explicitly lists TAD560VE, TAD561VE, TAD761VE, TAD762VE, TAD763VE, TAD764VE, and TAD765VE as industrial engines. It is treated as a discontinued owner-search row because Volvo Penta current off-highway listings use later D5/D8 designations.',
  }),
  record({
    model: 'TAD761VE',
    series: 'D8 Industrial VE',
    power_kw: 160,
    displacement_l: 7.7,
    cylinders: 6,
    configuration: 'Inline-6 common-rail turbocharged aftercooled Volvo Penta industrial diesel',
    description:
      'Volvo Penta TAD761VE legacy industrial diesel. The Volvo Penta operator-manual page identifies TAD761VE as one of the industrial engines covered by the TAD560VE/TAD761VE manual set, alongside TAD762VE, TAD763VE, TAD764VE, and TAD765VE. It is not present in Volvo Penta current off-highway engine listings, making it a useful discontinued-model owner-search target.',
  }),
  record({
    model: 'TAD762VE',
    series: 'D8 Industrial VE',
    power_kw: 175,
    displacement_l: 7.7,
    cylinders: 6,
    configuration: 'Inline-6 common-rail turbocharged aftercooled Volvo Penta industrial diesel',
    description:
      'Volvo Penta TAD762VE legacy industrial diesel. ManualsLib lists TAD762VE under the same Volvo Penta TAD560VE operator manual, and the manual text identifies it as an in-line direct-injected industrial engine with EMS 2 controls, turbocharging, and electronic speed control. This row is marked discontinued because the current Volvo Penta off-highway range no longer includes this TAD762VE designation.',
  }),
  record({
    model: 'TAD763VE',
    series: 'D8 Industrial VE',
    power_kw: 190,
    displacement_l: 7.7,
    cylinders: 6,
    configuration: 'Inline-6 common-rail turbocharged aftercooled Volvo Penta industrial diesel',
    description:
      'Volvo Penta TAD763VE legacy industrial diesel. The TAD560VE operator manual page explicitly covers TAD763VE in the Volvo Penta industrial engine family. It is added as a conservative legacy model row for parts, overhaul, and replacement searches; exact rating-sheet attachment is deferred until a direct public Volvo PDF is validated.',
  }),
  record({
    model: 'TAD764VE',
    series: 'D8 Industrial VE',
    power_kw: 205,
    displacement_l: 7.7,
    cylinders: 6,
    configuration: 'Inline-6 common-rail turbocharged aftercooled Volvo Penta industrial diesel',
    description:
      'Volvo Penta TAD764VE legacy industrial diesel. The public Volvo Penta manual mirror names TAD764VE as part of the TAD560VE/TAD761VE industrial engine manual set, and the current Volvo Penta off-highway page lists later active D5/D8/D11/D13/D16 product families instead. It is added without a PDF until an exact downloadable datasheet is found.',
  }),
  record({
    model: 'TAD765VE',
    series: 'D8 Industrial VE',
    power_kw: 235,
    displacement_l: 7.7,
    cylinders: 6,
    configuration: 'Inline-6 common-rail turbocharged aftercooled Volvo Penta industrial diesel',
    description:
      'Volvo Penta TAD765VE legacy industrial diesel. ManualsLib indexes TAD765VE under the Volvo Penta TAD560VE 108-page operator manual, whose text lists TAD765VE with the TAD560VE/TAD561VE and TAD761VE-TAD764VE industrial engines. It is a discontinued-model SEO row for legacy owners seeking parts, service, and overhaul information.',
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
  return text
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
  return `# Legacy Engine Model Discovery - Batch 50 Volvo TAD560/TAD761 Industrial

Date: 2026-08-12

## Result

- Source-validated Volvo Penta TAD560/TAD761 industrial candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power kW | Displacement L | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
${missing.map((row) => `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.power_kw ?? ''} | ${row.displacement_l ?? ''} | ${MANUALSLIB_TAD560_MANUAL} |`).join('\n')}

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- This batch is limited to Volvo Penta industrial/off-highway VE rows, not marine TAMD/TMD/AQAD rows.
- ManualsLib's Volvo Penta engine index lists exact product pages for TAD560VE, TAD561VE, TAD761VE, TAD762VE, TAD763VE, TAD764VE, and TAD765VE.
- The TAD560VE operator manual page states that the manual refers to TAD560VE, TAD561VE, TAD761VE, TAD762VE, TAD763VE, TAD764VE, and TAD765VE industrial engines, and describes them as in-line, direct-injected diesel engines with common-rail fuel injection, EMS 2, turbocharging, controlled cooling, and electronic speed control.
- Volvo Penta's current off-highway range page lists current 5, 8, 11, 13, and 16 liter product families but does not expose these older TAD560/TAD761 designations. Its official product archive is limited to older D9/D12 families, so these rows are marked discontinued as legacy owner-search targets.
- No datasheet PDF is attached in this batch. DirectIndustry blocks automated access, and the manual mirror exposes a print/manual view rather than a clean public PDF URL suitable for storage validation.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

downloadAndCheck(MANUALSLIB_BRAND_INDEX, 'manualslib-volvo-penta-engine-index.html', [
  'TAD560VE',
  'TAD561VE',
  'TAD761VE',
  'TAD762VE',
  'TAD763VE',
  'TAD764VE',
  'TAD765VE',
], '/tmp/manualslib-volvo-engine.html')
downloadAndCheck(MANUALSLIB_TAD560_MANUAL, 'manualslib-tad560ve-operator.html', [
  'TAD560VE, TAD561VE',
  'TAD761VE, TAD762VE, TAD763VE, TAD764VE, TAD765VE',
  'industrial engines',
  'common rail fuel injection systems',
], '/tmp/manualslib-tad560ve.html')
downloadAndCheck(VOLVO_CURRENT_OFFROAD, 'volvo-current-offroad-range.html', [
  'Off-highway engine range',
  '5 liter series',
  '8 liter series',
], '/tmp/volvo-current-offroad.html')
downloadAndCheck(VOLVO_ARCHIVE, 'volvo-offroad-product-archive.html', [
  'Industrial off-road product archive',
  'Manufacturing years',
], '/tmp/volvo-offroad-archive.html')

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Volvo Penta TAD560/TAD761 industrial legacy batch`)

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
  console.log(`Imported ${data.length} validated legacy Volvo Penta record(s).`)
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
