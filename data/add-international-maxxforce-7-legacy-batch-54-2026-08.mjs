// Add source-validated International/Navistar MaxxForce 7 legacy row.
//
// Dry run:
//   node data/add-international-maxxforce-7-legacy-batch-54-2026-08.mjs
// Apply:
//   node data/add-international-maxxforce-7-legacy-batch-54-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-54-international-maxxforce-7.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-international-maxxforce-7-batch-54-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyInternationalMaxxForce7/1.0; +https://engines.haifengmachinery.com)'

const INTERNATIONAL_ENGINE_RESOURCES =
  'https://www.international.com/products/resources/tem-body-builder/engine-resources'
const MANUALSLIB_NAVISTAR_BRAND = 'https://www.manualslib.com/brand/navistar/'
const MANUALSLIB_MAXXFORCE_7 =
  'https://www.manualslib.com/manual/3016167/Navistar-Maxxforce-7.html'

const SOURCE_URLS = [
  INTERNATIONAL_ENGINE_RESOURCES,
  MANUALSLIB_NAVISTAR_BRAND,
  MANUALSLIB_MAXXFORCE_7,
]

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

function normalize(value) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function hpToKw(hp) {
  return Math.round(hp * 0.7457 * 10) / 10
}

const RECORD = {
  slug: 'international-maxxforce-7',
  brand: 'International',
  model: 'MaxxForce 7',
  series: 'International/Navistar MaxxForce',
  status: 'discontinued',
  year_introduced: 2008,
  origin: 'United States',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'EPA 2007/EPA 2010 on-highway legacy',
  certifications: [
    'International current engine resources LEGACY ENGINES archive',
    'ManualsLib Navistar MaxxForce 7 operation and maintenance manual',
  ],
  power_kw: hpToKw(300),
  power_hp: 300,
  displacement_l: 6.4,
  cylinders: 8,
  configuration: '6.4 L V8 diesel with two-stage turbocharger',
  rpm_rated: 2600,
  description:
    'International MaxxForce 7 legacy 6.4 L V8 diesel. International keeps EPA 07 and EPA 10 MaxxForce 7 materials in its current LEGACY ENGINES resource archive, and the Navistar operation and maintenance manual validates the MaxxForce 7 name, 6.4 L V8 configuration, 220-300 hp example rating range, maintenance schedule and owner-service intent.',
}

const DOCUMENT = {
  label: 'Navistar MaxxForce 7 Operation and Maintenance Manual',
  storagePath: MANUALSLIB_MAXXFORCE_7,
}

function download(url, outputPath, options = {}) {
  if (options.cachedPath && fs.existsSync(options.cachedPath)) {
    fs.copyFileSync(options.cachedPath, outputPath)
    return
  }
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
    String(options.maxTime ?? 180),
    '--user-agent',
    USER_AGENT,
    '--output',
    outputPath,
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
    maxBuffer: 50 * 1024 * 1024,
  })
}

function verifyHtml(url, fileName, tokens, cachedPath) {
  const localPath = path.join(TMP_DIR, fileName)
  download(url, localPath, { cachedPath })
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = tokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${url}: missing validation token(s): ${missing.join(', ')}`)
  return { localPath, fileSizeBytes: Buffer.byteLength(text, 'utf8') }
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
    legacyWithPdf: rows.filter((engine) => (engine.pdfs ?? []).length > 0).length,
  }
}

function buildReport({ missing, existingCount, linkedCount, skippedCount, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 54 International MaxxForce 7

Date: 2026-08-12

## Result

- Source-validated International/Navistar MaxxForce 7 candidates reviewed: \`1\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing ? 1 : 0}\`
- Manual/resource links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power hp | Displacement L | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
${missing ? `| ${RECORD.brand} | ${RECORD.model} | ${RECORD.series} | ${RECORD.status} | ${RECORD.power_hp} | ${RECORD.displacement_l} | ${MANUALSLIB_MAXXFORCE_7} |` : ''}

## Document Attachments

| Document | Source | Storage path | Target slug |
| --- | --- | --- | --- |
| ${DOCUMENT.label} | ${MANUALSLIB_MAXXFORCE_7} | ${DOCUMENT.storagePath} | ${RECORD.slug} |

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- International's current Engine Resources page contains a \`LEGACY ENGINES\` section with exact \`EPA 07 MAXXFORCE 7 SERIES TRUCKS\` and \`EPA 10 MAXXFORCE 7 SERIES TRUCKS\` archive headings.
- ManualsLib's Navistar brand page lists MaxxForce 7 and links a 110-page operation and maintenance manual.
- The MaxxForce 7 manual page validates 6.4 L V8 configuration, diesel fuel/maintenance context, service intervals and example ratings from 220 hp to 300 hp at 2600 rpm.
- MaxxForce 5 was reviewed but not imported in this batch because the current International legacy resource page did not expose an equally clean MaxxForce 5 archive section.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: International/Navistar MaxxForce 7 legacy batch`)

verifyHtml(INTERNATIONAL_ENGINE_RESOURCES, 'international-engine-resources.html', [
  'LEGACY ENGINES',
  'EPA 07 MAXXFORCE 7 SERIES TRUCKS',
  'EPA 10 MAXXFORCE 7 SERIES TRUCKS',
], '/tmp/international-engine-resources.html')

verifyHtml(MANUALSLIB_NAVISTAR_BRAND, 'manualslib-navistar-brand.html', [
  'MaxxForce 7',
  '/manual/3016167/Navistar-Maxxforce-7.html',
], '/tmp/manualslib-navistar-brand.html')

const manual = verifyHtml(MANUALSLIB_MAXXFORCE_7, 'manualslib-maxxforce-7.html', [
  'Navistar MaxxForce 7 Operation And Maintenance Manual',
  'MaxxForce 7 engine pdf manual download',
  'Engine Specifications',
  'Displacement 6.4 L',
  '4 stroke, V8 diesel',
  '220 HP',
  '300 HP',
], '/tmp/manualslib-maxxforce-7.html')

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const before = await fetchAllEngines(supabase)
const existingKeys = new Set(before.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const missing = !existingKeys.has(`${RECORD.brand}::${normalize(RECORD.model)}`)
const existingCount = missing ? 0 : 1

console.log(`Candidates: 1; existing: ${existingCount}; missing: ${missing ? 1 : 0}`)
if (missing) console.log(`${RECORD.brand}\t${RECORD.model}\t${RECORD.slug}`)

if (APPLY && missing) {
  const { error } = await supabase.from('engines').upsert([RECORD], { onConflict: 'slug' })
  if (error) throw error
  console.log('Imported 1 validated legacy International/Navistar MaxxForce 7 record.')
}

const engines = APPLY && missing ? await fetchAllEngines(supabase) : before
const engine = engines.find((row) => row.slug === RECORD.slug)
let linkedCount = 0
let skippedCount = 0

if (engine) {
  const { data: existingLinks, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('engine_id', engine.id)
    .eq('storage_path', DOCUMENT.storagePath)
  if (existingError) throw existingError

  if (existingLinks?.length) {
    skippedCount = 1
  } else if (!APPLY) {
    linkedCount = 1
  } else {
    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'manual',
      label: DOCUMENT.label,
      storage_path: DOCUMENT.storagePath,
      file_size_bytes: manual.fileSizeBytes,
    })
    if (insertError) throw insertError
    linkedCount = 1
  }
} else if (APPLY) {
  throw new Error(`Missing target row: ${RECORD.slug}`)
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = await countLegacyCoverage(supabase)
await fsp.writeFile(
  REPORT_PATH,
  buildReport({
    missing,
    existingCount,
    linkedCount,
    skippedCount,
    afterCount: APPLY ? afterCount : null,
    coverage: APPLY ? coverage : null,
  }),
)

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
