// Add source-validated International/Navistar MaxxForce DT/9/10 legacy rows
// and attach the official International newsroom PDF as model evidence.
//
// Dry run:
//   node data/add-international-maxxforce-i6-legacy-batch-52-2026-08.mjs
// Apply:
//   node data/add-international-maxxforce-i6-legacy-batch-52-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-52-international-maxxforce-i6.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-international-maxxforce-i6-batch-52-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyInternationalMaxxForce/1.0; +https://engines.haifengmachinery.com)'

const INTERNATIONAL_RELEASE = 'https://news.international.com/news?item=61'
const INTERNATIONAL_RELEASE_PDF = 'https://news.international.com/news?item=61&asPDF=1'
const INTERNATIONAL_ENGINE_RESOURCES =
  'https://www.international.com/products/resources/tem-body-builder/engine-resources'
const NAVISTAR_MAXXFORCE_DT_9_MANUAL =
  'https://www.manualslib.com/manual/2368299/Navistar-Maxxforce-Dt-9.html'
const NAVISTAR_END_PRODUCTION =
  'https://www.prnewswire.com/news-releases/navistar-to-end-production-of-proprietary-medium-duty-910-liter-engine-by-2018-300499309.html'

const DOCUMENT = {
  url: INTERNATIONAL_RELEASE_PDF,
  label: 'International MaxxForce DT, 9 and 10 I-6 Family Newsroom PDF',
  storagePath: 'international/legacy/maxxforce-dt-9-10-i6-family-newsroom-2006.pdf',
  tokens: [
    'International Engine Group Introduces I-6 Family of MaxxForce Engines',
    'MaxxForce DT, 9 and 10 Built On Legendary Engine Platform',
    'MaxxForce DT powers',
    'MaxxForce 9 powers',
    'MaxxForce 10 powers',
    're-built in-frame',
  ],
}

const SOURCE_URLS = [
  INTERNATIONAL_RELEASE,
  INTERNATIONAL_RELEASE_PDF,
  INTERNATIONAL_ENGINE_RESOURCES,
  NAVISTAR_MAXXFORCE_DT_9_MANUAL,
  NAVISTAR_END_PRODUCTION,
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

function hpToKw(hp) {
  return Math.round(hp * 0.7457 * 10) / 10
}

function record(row) {
  return clean({
    slug: `international-${slugify(row.model)}`,
    brand: 'International',
    model: row.model,
    series: 'International/Navistar MaxxForce I-6',
    status: 'discontinued',
    year_introduced: 2008,
    year_discontinued: 2018,
    origin: 'United States',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: row.emissions_standard,
    certifications: [
      'International 2008 model-year MaxxForce I-6 announcement',
      'International EPA 07/EPA 10 MaxxForce resource archive',
      'Navistar proprietary 9/10-liter production ceased by fiscal Q2 2018',
    ],
    power_kw: row.power_kw,
    power_hp: row.power_hp,
    displacement_l: row.displacement_l,
    cylinders: 6,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    description: row.description,
  })
}

const RECORDS = [
  record({
    model: 'MaxxForce DT',
    power_hp: 300,
    power_kw: hpToKw(300),
    displacement_l: 7.6,
    rpm_rated: 2200,
    emissions_standard: 'EPA 2007/EPA 2010 on-highway legacy',
    configuration: 'Inline-6 wet-sleeve turbocharged diesel',
    description:
      'International MaxxForce DT legacy inline-six diesel for DuraStar, WorkStar, IC bus and related medium-duty applications. International announced the MaxxForce DT for 2008 model-year trucks, lists EPA 07/EPA 10 MaxxForce DT resources in its engine resource archive, and the shared International PDF validates the 210-300 hp range plus in-frame rebuild/service positioning.',
  }),
  record({
    model: 'MaxxForce 9',
    power_hp: 330,
    power_kw: hpToKw(330),
    displacement_l: 9.3,
    rpm_rated: 2200,
    emissions_standard: 'EPA 2007/EPA 2010 on-highway legacy',
    configuration: 'Inline-6 wet-sleeve turbocharged diesel',
    description:
      'International MaxxForce 9 legacy 9.3 L inline-six diesel for Class 7-8 DuraStar, WorkStar and International CXT applications. International source material validates the MaxxForce 9 name, I-6 family, 300-330 hp range, serviceability and rebuild positioning; Navistar later announced production cessation for the proprietary 9/10-liter medium-duty platform by fiscal Q2 2018.',
  }),
  record({
    model: 'MaxxForce 10',
    power_hp: 350,
    power_kw: hpToKw(350),
    displacement_l: 9.3,
    rpm_rated: 2200,
    emissions_standard: 'EPA 2007/EPA 2010 on-highway legacy',
    configuration: 'Inline-6 wet-sleeve turbocharged diesel',
    description:
      'International MaxxForce 10 legacy 9.3 L inline-six diesel for WorkStar and TranStar applications. International source material validates the MaxxForce 10 name, I-6 family, 310-350 hp range and in-frame rebuild context; Navistar later announced production cessation for the proprietary 9/10-liter medium-duty platform by fiscal Q2 2018.',
  }),
]

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
}

function verifyPdf() {
  const localPath = path.join(TMP_DIR, path.basename(DOCUMENT.storagePath))
  download(DOCUMENT.url, localPath, {
    cachedPath: '/tmp/international-maxxforce-i6-release.pdf',
    maxTime: 180,
  })
  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 10_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${DOCUMENT.url}: response is not a usable PDF`)
  }
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const missing = DOCUMENT.tokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${DOCUMENT.storagePath}: missing PDF token(s): ${missing.join(', ')}`)
  return { localPath, fileSizeBytes: buffer.length }
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

function buildReport({ existingCount, missing, linkedCount, skippedCount, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 52 International MaxxForce I-6

Date: 2026-08-12

## Result

- Source-validated International/Navistar MaxxForce I-6 candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Official International PDF documents verified: \`1\`
- PDF/manual links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power hp | Displacement L | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
${missing.map((row) => `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.power_hp ?? ''} | ${row.displacement_l ?? ''} | ${INTERNATIONAL_RELEASE} |`).join('\n')}

## Document Attachments

| Document | Source | Storage path | Target slugs |
| --- | --- | --- | --- |
| ${DOCUMENT.label} | ${DOCUMENT.url} | ${DOCUMENT.storagePath} | ${missing.map((row) => row.slug).join(', ')} |

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- This batch is restricted to the International/Navistar mid-range I-6 MaxxForce DT, 9 and 10 group. MaxxForce 11, 13 and 15 were intentionally deferred for a separate big-bore validation pass.
- International's 2006 newsroom item validates the exact model names, 2008 model-year introduction, I-6 platform, horsepower ranges, vocational applications and in-frame rebuild/service value.
- ManualsLib's Navistar MaxxForce DT 9 operation and maintenance page validates the DT/9/10 manual family, 2010 EPA model-year application, inline-six configuration, serial-code displacement split and maintenance/overhaul context.
- International's current engine resources page preserves EPA 07 and EPA 10 MaxxForce DT/9/10 archive sections, supporting legacy owner-search intent.
- Navistar's 2017 production announcement validates the proprietary 9/10-liter medium-duty platform as ending by fiscal Q2 2018; the row-level descriptions avoid claiming a more precise discontinuation date than the sources support.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: International/Navistar MaxxForce I-6 legacy batch`)

verifyHtml(INTERNATIONAL_RELEASE, 'international-maxxforce-i6-release.html', [
  'International Engine Group Introduces I-6 Family of MaxxForce Engines',
  'MaxxForce DT, 9 and 10 Built On Legendary Engine Platform',
  'The MaxxForce DT powers',
  'The MaxxForce 9 powers',
  'The MaxxForce 10 powers',
], '/tmp/international-maxxforce-i6-release.html')

verifyHtml(INTERNATIONAL_ENGINE_RESOURCES, 'international-engine-resources.html', [
  'EPA 07 MAXXFORCE DT 9 AND 10 SERIES TRUCKS',
  'EPA 10 MAXXFORCE DT, 9 AND 10',
], '/tmp/international-engine-resources.html')

verifyHtml(NAVISTAR_MAXXFORCE_DT_9_MANUAL, 'manualslib-maxxforce-dt9.html', [
  'Navistar MaxxForce DT 9 Operation And Maintenance Manual',
  'MaxxForce DT, 9, and 10 Diesel Engines',
  '2010 EPA Emission Compliant Model Year Truck and Derivative Vehicle Applications',
  '466',
  '570',
], '/tmp/manualslib-maxxforce-dt9.html')

verifyHtml(NAVISTAR_END_PRODUCTION, 'navistar-end-910-production.html', [
  'Navistar To End Production Of Proprietary Medium-Duty 9/10 Liter Engine By 2018',
  'cease all engine production',
  'second quarter of fiscal 2018',
  'N9/10 engine family',
], null)

const pdf = verifyPdf()
console.log(`Verified ${DOCUMENT.label}: ${Math.round(pdf.fileSizeBytes / 1024)}KB`)

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const before = await fetchAllEngines(supabase)
const existingKeys = new Set(before.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
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

const engines = APPLY && missing.length ? await fetchAllEngines(supabase) : before
const bySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let linkedCount = 0
let skippedCount = 0

for (const row of missing) {
  const engine = bySlug.get(row.slug)
  if (!engine && APPLY) throw new Error(`Missing target row: ${row.slug}`)
  if (!engine) {
    linkedCount += 1
    continue
  }

  const { data: existingLinks, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('engine_id', engine.id)
    .eq('storage_path', DOCUMENT.storagePath)
  if (existingError) throw existingError

  if (existingLinks?.length) {
    skippedCount += 1
  } else if (!APPLY) {
    linkedCount += 1
  } else {
    const upload = await uploadPdf(supabase, BUCKET, pdf.localPath, DOCUMENT.storagePath)
    if (!upload.ok) throw new Error(`Upload failed: ${DOCUMENT.storagePath}`)
    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'manual',
      label: DOCUMENT.label,
      storage_path: DOCUMENT.storagePath,
      file_size_bytes: upload.uploadedSizeBytes ?? pdf.fileSizeBytes,
    })
    if (insertError) throw insertError
    linkedCount += 1
  }
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = await countLegacyCoverage(supabase)
await fsp.writeFile(
  REPORT_PATH,
  buildReport({
    existingCount,
    missing,
    linkedCount,
    skippedCount,
    afterCount: APPLY ? afterCount : null,
    coverage: APPLY ? coverage : null,
  }),
)

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
