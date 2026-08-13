// Add source-validated International/Navistar MaxxForce 11/13/15 big-bore legacy rows
// and attach official International newsroom PDFs as model evidence.
//
// Dry run:
//   node data/add-international-maxxforce-big-bore-legacy-batch-53-2026-08.mjs
// Apply:
//   node data/add-international-maxxforce-big-bore-legacy-batch-53-2026-08.mjs --apply

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
  'reports/legacy-engine-model-discovery-2026-08-12-batch-53-international-maxxforce-big-bore.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-international-maxxforce-big-bore-batch-53-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyInternationalMaxxForceBigBore/1.0; +https://engines.haifengmachinery.com)'

const INTERNATIONAL_11_13_RELEASE = 'https://news.international.com/news?item=42'
const INTERNATIONAL_11_13_RELEASE_PDF = 'https://news.international.com/news?item=42&asPDF=1'
const INTERNATIONAL_15_RELEASE = 'https://news.international.com/news?item=472'
const INTERNATIONAL_15_RELEASE_PDF = 'https://news.international.com/news?item=472&asPDF=1'
const INTERNATIONAL_ENGINE_RESOURCES =
  'https://www.international.com/products/resources/tem-body-builder/engine-resources'
const MANUALSLIB_NAVISTAR_BRAND = 'https://www.manualslib.com/brand/navistar/'
const MANUALSLIB_MAXXFORCE_11 =
  'https://www.manualslib.com/manual/3866065/Navistar-Maxxforce-11.html'
const MANUALSLIB_MAXXFORCE_13 =
  'https://www.manualslib.com/manual/3866066/Navistar-Maxxforce-13.html'
const MANUALSLIB_MAXXFORCE_15 =
  'https://www.manualslib.com/manual/1639676/Navistar-Maxxforce-15.html'

const DOCUMENTS = [
  {
    key: 'maxxforce-11-13',
    url: INTERNATIONAL_11_13_RELEASE_PDF,
    label: 'International MaxxForce 11 and 13 Big Bore Ratings Newsroom PDF',
    storagePath: 'international/legacy/maxxforce-11-13-big-bore-ratings-2007.pdf',
    targetModels: ['MaxxForce 11', 'MaxxForce 13'],
    cachedPath: '/tmp/international-maxxforce-11-13-release.pdf',
    tokens: [
      'New Maxxforce Big Bore Engine Ratings Revealed',
      'MaxxForce 11 and MaxxForce 13',
      '330 to 475 horsepower',
      'beginning in late 2007',
      'manufactured at a new International plant in Huntsville',
    ],
  },
  {
    key: 'maxxforce-15',
    url: INTERNATIONAL_15_RELEASE_PDF,
    label: 'International ProStar+ With MaxxForce 15 Newsroom PDF',
    storagePath: 'international/legacy/maxxforce-15-production-availability-2011.pdf',
    targetModels: ['MaxxForce 15'],
    cachedPath: '/tmp/international-maxxforce-15-release.pdf',
    tokens: [
      'Navistar Introduces ProStar+ With Maxxforce 15',
      'production availability',
      'MaxxForce 15',
      'up to 500 horsepower',
      'up to 550 horsepower',
    ],
  },
]

const SOURCE_URLS = [
  INTERNATIONAL_11_13_RELEASE,
  INTERNATIONAL_11_13_RELEASE_PDF,
  INTERNATIONAL_15_RELEASE,
  INTERNATIONAL_15_RELEASE_PDF,
  INTERNATIONAL_ENGINE_RESOURCES,
  MANUALSLIB_NAVISTAR_BRAND,
  MANUALSLIB_MAXXFORCE_11,
  MANUALSLIB_MAXXFORCE_13,
  MANUALSLIB_MAXXFORCE_15,
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
    series: 'International/Navistar MaxxForce Big Bore',
    status: 'discontinued',
    year_introduced: row.year_introduced,
    origin: 'United States',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'EPA 2007/EPA 2010 on-highway legacy',
    certifications: [
      'International official newsroom model announcement',
      'International current engine resources LEGACY ENGINES archive',
      'ManualsLib Navistar engine manual index',
    ],
    power_kw: row.power_kw,
    power_hp: row.power_hp,
    displacement_l: row.displacement_l,
    cylinders: 6,
    configuration: row.configuration,
    rpm_rated: 1800,
    description: row.description,
  })
}

const RECORDS = [
  record({
    model: 'MaxxForce 11',
    year_introduced: 2007,
    power_hp: 475,
    power_kw: hpToKw(475),
    configuration:
      'Big-bore inline-6 diesel with high-pressure common rail and twin-series turbochargers',
    description:
      'International MaxxForce 11 legacy big-bore Class 8 diesel. International revealed MaxxForce 11 and MaxxForce 13 ratings in 2007, describing six big-bore models across 330-475 hp and 1,250-1,700 lb-ft torque for ProStar, TranStar and WorkStar applications. International now groups MaxxForce 11/13 resources under LEGACY ENGINES, and the Navistar manual index validates the MaxxForce 11 diagnostic manual path.',
  }),
  record({
    model: 'MaxxForce 13',
    year_introduced: 2007,
    power_hp: 500,
    power_kw: hpToKw(500),
    configuration:
      'Big-bore inline-6 diesel with high-pressure common rail and twin-series turbochargers',
    description:
      'International MaxxForce 13 legacy big-bore Class 8 diesel. International source material validates the MaxxForce 13 name, MAN collaboration, Huntsville manufacturing plan, ProStar/TranStar/WorkStar applications and later up-to-500 hp availability. International currently places MaxxForce 11/13 resources in its LEGACY ENGINES archive, and ManualsLib validates the MaxxForce 13 diagnostic manual path.',
  }),
  record({
    model: 'MaxxForce 15',
    year_introduced: 2011,
    power_hp: 550,
    power_kw: hpToKw(550),
    displacement_l: 15.2,
    configuration: '15.2 L inline-6 heavy-duty diesel with MaxxForce Advanced EGR',
    description:
      'International MaxxForce 15 legacy 15.2 L heavy-duty diesel. Navistar announced production availability in 2011 for ProStar+ and PayStar applications, with ratings up to 500 hp in ProStar+ and up to 550 hp in PayStar vocational trucks. International now keeps MaxxForce 15 materials in its LEGACY ENGINES resource archive, and the Navistar service manual validates the 15.2 L inline-six engine specification.',
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

function verifyDocument(document) {
  const localPath = path.join(TMP_DIR, path.basename(document.storagePath))
  download(document.url, localPath, {
    cachedPath: document.cachedPath,
    maxTime: 180,
  })
  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 10_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.url}: response is not a usable PDF`)
  }
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const missing = document.tokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${document.storagePath}: missing PDF token(s): ${missing.join(', ')}`)
  return { ...document, localPath, fileSizeBytes: buffer.length }
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

function buildReport({ existingCount, missing, verifiedDocuments, linkedCount, skippedCount, afterCount, coverage }) {
  const attachmentRows = verifiedDocuments.map((document) => {
    const slugs = missing
      .filter((row) => document.targetModels.includes(row.model))
      .map((row) => row.slug)
      .join(', ')
    return `| ${document.label} | ${document.url} | ${document.storagePath} | ${slugs} |`
  })
  return `# Legacy Engine Model Discovery - Batch 53 International MaxxForce Big Bore

Date: 2026-08-12

## Result

- Source-validated International/Navistar MaxxForce big-bore candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Official International PDFs verified: \`${verifiedDocuments.length}\`
- PDF/manual links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power hp | Displacement L | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
${missing.map((row) => `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.power_hp ?? ''} | ${row.displacement_l ?? ''} | ${row.model === 'MaxxForce 15' ? INTERNATIONAL_15_RELEASE : INTERNATIONAL_11_13_RELEASE} |`).join('\n')}

## Document Attachments

| Document | Source | Storage path | Target slugs |
| --- | --- | --- | --- |
${attachmentRows.join('\n')}

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- This batch is restricted to International/Navistar MaxxForce 11, 13 and 15 big-bore legacy engines.
- International's current Engine Resources page contains a \`LEGACY ENGINES\` section and exact archive headings for \`EPA 07 MAXXFORCE 11 AND 13 SERIES TRUCKS\`, \`EPA 10 MAXXFORCE 11 AND 13 SERIES TRUCKS\`, and \`EPA 10 MAXXFORCE 15 SERIES TRUCKS\`.
- The 2007 International newsroom PDF validates MaxxForce 11 and 13 model identity, ratings range, applications, MAN collaboration and late-2007 launch context.
- The 2011 International newsroom PDF validates MaxxForce 15 production availability and ratings up to 500 hp for ProStar+ and 550 hp for PayStar vocational trucks.
- ManualsLib's Navistar brand/manual pages validate owner-service manual demand for MaxxForce 11, MaxxForce 13 and MaxxForce 15. Only MaxxForce 15 receives an exact displacement value here because its service manual page exposes a clean 15.2 L engine specification.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: International/Navistar MaxxForce big-bore legacy batch`)

verifyHtml(INTERNATIONAL_11_13_RELEASE, 'international-maxxforce-11-13-release.html', [
  'MaxxForce 11 and MaxxForce',
  'MaxxForce 13',
  '330 to 475 horsepower',
  'beginning in late 2007',
], '/tmp/international-maxxforce-11-13-release.html')

verifyHtml(INTERNATIONAL_15_RELEASE, 'international-maxxforce-15-release.html', [
  'Navistar Introduces ProStar+ With Maxxforce 15',
  'production availability',
  'up to 500 horsepower',
  'up to 550 horsepower',
], '/tmp/international-maxxforce-15-release.html')

verifyHtml(INTERNATIONAL_ENGINE_RESOURCES, 'international-engine-resources.html', [
  'LEGACY ENGINES',
  'EPA 07 MAXXFORCE 11 AND 13 SERIES TRUCKS',
  'EPA 10 MAXXFORCE 11 AND 13 SERIES TRUCKS',
  'EPA 10 MAXXFORCE 15 SERIES TRUCKS',
], '/tmp/international-engine-resources.html')

verifyHtml(MANUALSLIB_NAVISTAR_BRAND, 'manualslib-navistar-brand.html', [
  'MaxxForce 11',
  'MaxxForce 13',
  'MaxxForce 15',
  '/manual/3866065/Navistar-Maxxforce-11.html',
  '/manual/3866066/Navistar-Maxxforce-13.html',
  '/manual/1639676/Navistar-Maxxforce-15.html',
], '/tmp/manualslib-navistar-brand.html')

verifyHtml(MANUALSLIB_MAXXFORCE_11, 'manualslib-maxxforce-11.html', [
  'Navistar MaxxForce 11 Diagnostic Manual',
  'MaxxForce 11 engine pdf manual download',
], '/tmp/manualslib-maxxforce-11.html')

verifyHtml(MANUALSLIB_MAXXFORCE_13, 'manualslib-maxxforce-13.html', [
  'Navistar MaxxForce 13 Diagnostic Manual',
  'MaxxForce 13 engine pdf manual download',
], '/tmp/manualslib-maxxforce-13.html')

verifyHtml(MANUALSLIB_MAXXFORCE_15, 'manualslib-maxxforce-15.html', [
  'Navistar MaxxForce 15 Service Manual',
  'MaxxForce 15 engine pdf manual download',
  '15L Diesel Engine',
  'Displacement 15.2 L',
], '/tmp/manualslib-maxxforce-15.html')

const verifiedDocuments = DOCUMENTS.map(verifyDocument)
for (const document of verifiedDocuments) {
  console.log(`Verified ${document.label}: ${Math.round(document.fileSizeBytes / 1024)}KB`)
}

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

for (const document of verifiedDocuments) {
  for (const row of missing.filter((engine) => document.targetModels.includes(engine.model))) {
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
      .eq('storage_path', document.storagePath)
    if (existingError) throw existingError

    if (existingLinks?.length) {
      skippedCount += 1
    } else if (!APPLY) {
      linkedCount += 1
    } else {
      const upload = await uploadPdf(supabase, BUCKET, document.localPath, document.storagePath)
      if (!upload.ok) throw new Error(`Upload failed: ${document.storagePath}`)
      const { error: insertError } = await supabase.from('engine_pdfs').insert({
        engine_id: engine.id,
        type: 'manual',
        label: document.label,
        storage_path: document.storagePath,
        file_size_bytes: upload.uploadedSizeBytes ?? document.fileSizeBytes,
      })
      if (insertError) throw insertError
      linkedCount += 1
    }
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
    verifiedDocuments,
    linkedCount,
    skippedCount,
    afterCount: APPLY ? afterCount : null,
    coverage: APPLY ? coverage : null,
  }),
)

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
