// Add source-validated Caterpillar C13 60 Hz EPA stationary emergency legacy
// generator-set package row and attach the linked official Cat ratings guide.
//
// Dry run:
//   node data/add-cat-c13-60hz-ese-legacy-batch-44-2026-08.mjs
// Apply:
//   node data/add-cat-c13-60hz-ese-legacy-batch-44-2026-08.mjs --apply

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
  'reports/legacy-engine-model-discovery-2026-08-12-batch-44-cat-c13-60hz-ese-legacy.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-cat-c13-60hz-ese-batch-44-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyCatC1360HzESE/1.0; +https://engines.haifengmachinery.com)'

const ENTRY = {
  pageUrl:
    'https://h-cpc.cat.com/cmms/v2?cid=402&f=product&gid=18260932&it=product&lid=en&nc=1&pid=1000024715&sc=X350',
  pageTokens: [
    'Non-Current',
    'Cat C13 (60 Hz) Diesel Generator Sets',
    '320 to 400 ekW Generator Set for Standby and Prime applications.',
    'EPA Stat Emergency Use',
    'C13 ACERT In-line 6, 4-cycle diesel',
  ],
  docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20180319-16263-55470',
  docTokens: ['Electric Power Ratings Guide', 'C13', '350', '320', '400', '365', 'ESE', 'EPA Stationary Emergency'],
  storagePath: 'caterpillar/legacy/cat-c13-60hz-ese-electric-power-ratings-guide.pdf',
  label: 'Cat Electric Power Ratings Guide - C13 60 Hz EPA Stationary Emergency',
  row: {
    slug: 'caterpillar-c13-60-hz-epa-stationary-emergency-legacy-genset',
    brand: 'Caterpillar',
    model: 'C13 60 Hz EPA Stationary Emergency Legacy Genset',
    series: 'C13',
    status: 'discontinued',
    origin: 'United States',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'EPA Stationary Emergency Use',
    certifications: ['Caterpillar Non-Current product page', 'Caterpillar Electric Power Ratings Guide'],
    power_kw: 400,
    power_hp: kwToHp(400),
    cylinders: 6,
    configuration: 'C13 ACERT inline-6 four-cycle diesel generator-set package',
    rpm_rated: 1800,
    rpm_max: 1800,
    description:
      'Caterpillar C13 60 Hz discontinued/non-current diesel generator-set package for EPA stationary emergency use. ' +
      'Cat H-CPC marks the C13 60 Hz source page as Non-Current with 320 to 400 ekW ratings, and the linked Cat ' +
      'Electric Power Ratings Guide validates the C13 60 Hz ESE ratings at 350/320 ekW and 400/365 ekW.',
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

function download(url, outputPath, options = {}) {
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
    String(options.maxTime ?? 180),
    '--user-agent',
    USER_AGENT,
    ...(options.referer ? ['--referer', options.referer] : []),
    '--output',
    outputPath,
    url,
  ], {
    maxBuffer: 30 * 1024 * 1024,
  })
}

function verifyPage() {
  const localPath = path.join(TMP_DIR, 'cat-c13-60hz-ese-noncurrent.html')
  download(ENTRY.pageUrl, localPath)
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = ENTRY.pageTokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${ENTRY.pageUrl}: missing page token(s): ${missing.join(', ')}`)
}

function verifyPdf() {
  const localPath = path.join(TMP_DIR, path.basename(ENTRY.storagePath))
  download(ENTRY.docUrl, localPath, { referer: ENTRY.pageUrl, maxTime: 300 })
  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 100_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${ENTRY.docUrl}: response is not a usable PDF`)
  }
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  })
  const missing = ENTRY.docTokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${ENTRY.storagePath}: missing PDF token(s): ${missing.join(', ')}`)
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

function buildReport({ missing, existingCount, linkedCount, skippedCount, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 44 Cat C13 60 Hz ESE Legacy Genset

Date: 2026-08-12

## Result

- Official Cat non-current C13 candidates reviewed: \`1\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing ? 1 : 0}\`
- Official Cat PDF/brochure documents verified: \`1\`
- Datasheet/brochure links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power kW | RPM | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
${missing ? `| ${ENTRY.row.brand} | ${ENTRY.row.model} | ${ENTRY.row.series} | ${ENTRY.row.status} | ${ENTRY.row.power_kw} | ${ENTRY.row.rpm_rated} | ${ENTRY.pageUrl} |` : ''}

## Document Attachments

| Document | Source | Storage path | Target slug |
| --- | --- | --- | --- |
| ${ENTRY.label} | ${ENTRY.docUrl} | ${ENTRY.storagePath} | ${ENTRY.row.slug} |

## Validation Sources

- ${ENTRY.row.model} non-current source page: ${ENTRY.pageUrl}
- ${ENTRY.label}: ${ENTRY.docUrl}

## Notes

- This batch uses a Caterpillar official H-CPC page marked \`Non-Current\` and the linked official Cat Electric Power Ratings Guide.
- The Cat page validates the C13 60 Hz package range as 320 to 400 ekW for standby and prime applications and EPA stationary emergency use.
- The ratings guide validates the C13 60 Hz ESE rows at 350/320 ekW and 400/365 ekW; \`ESE\` is defined in the guide as \`EPA Stationary Emergency\`.
- This row is a package/application-specific discontinued generator-set listing, not a replacement for the generic active C13 family row.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Cat C13 60 Hz ESE legacy genset batch`)
verifyPage()
const pdf = verifyPdf()
console.log(`Verified ${ENTRY.label}: ${Math.round(pdf.fileSizeBytes / 1024)}KB`)

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
  console.log('Inserted 1 Cat C13 60 Hz ESE legacy genset row')
}

let linkedCount = 0
let skippedCount = 0

const refreshed = APPLY && missing ? await fetchAllEngines(supabase) : before
const engine = refreshed.find(
  (row) => row.brand === ENTRY.row.brand && normalize(row.model) === normalize(ENTRY.row.model),
)

if (!APPLY) {
  linkedCount += 1
} else {
  if (!engine) throw new Error(`Missing target engine after import: ${ENTRY.row.slug}`)

  const { data: existingLinks, error: existingLinkError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('engine_id', engine.id)
    .eq('storage_path', ENTRY.storagePath)
  if (existingLinkError) throw existingLinkError

  if (existingLinks?.length) {
    skippedCount += 1
  } else {
    const upload = await uploadPdf(supabase, BUCKET, pdf.localPath, ENTRY.storagePath)
    if (!upload.ok) throw new Error(`Upload failed: ${ENTRY.storagePath}`)
    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'datasheet',
      label: ENTRY.label,
      storage_path: ENTRY.storagePath,
      file_size_bytes: upload.uploadedSizeBytes ?? pdf.fileSizeBytes,
    })
    if (insertError) throw insertError
    linkedCount += 1
  }
}

const afterCount = APPLY ? refreshed.length : null
const coverage = APPLY ? await countLegacyCoverage(supabase) : null
const report = buildReport({
  missing,
  existingCount,
  linkedCount,
  skippedCount,
  afterCount,
  coverage,
})
await fsp.writeFile(REPORT_PATH, report)
console.log(`Wrote ${REPORT_PATH}`)
