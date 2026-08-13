// Add a source-validated Caterpillar 3406C non-current fire-pump engine row
// and attach the official Cat fire-pump spec sheet.
//
// Dry run:
//   node data/add-cat-3406c-fire-pump-legacy-batch-33-2026-08.mjs
// Apply:
//   node data/add-cat-3406c-fire-pump-legacy-batch-33-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-33-cat-3406c-fire-pump.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-cat-3406c-fire-pump-batch-33-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyCat3406CFirePump/1.0; +https://engines.haifengmachinery.com)'

const SOURCE_PAGE =
  'https://h-cpc.cat.com/cmms/v2?cid=402&f=product&gid=18378906&it=product&lid=en&nc=1&pid=18457196&sc=US'
const DOCUMENT = {
  sourceUrl: 'https://emc.cat.com/pubdirect.ashx?media_string_id=LEHW0129-',
  storagePath: 'caterpillar/legacy/cat-3406c-fire-pump-spec-sheet.pdf',
  label: 'Cat 3406C Firepump Spec Sheet',
  type: 'datasheet',
  minBytes: 100_000,
  requiredTokens: ['3406C', 'Fire Pump', '217-359 bkW', 'FM/UL/NFPA 20', 'LEHW0129'],
  slug: 'caterpillar-3406c-fire-pump',
}

const RECORD = {
  slug: 'caterpillar-3406c-fire-pump',
  brand: 'Caterpillar',
  model: '3406C Fire Pump',
  series: '3400 Series',
  status: 'discontinued',
  origin: 'United States',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'Non-certified; available for global non-regulated areas',
  certifications: ['Caterpillar Non-Current product page', 'FM Approved', 'UL Listed', 'NFPA 20'],
  power_kw: 359,
  power_hp: 482,
  cylinders: 6,
  configuration: 'Inline-6 four-stroke diesel fire-pump engine',
  rpm_max: 2300,
  description:
    'Caterpillar 3406C Fire Pump discontinued/non-current 3400-series industrial diesel fire-pump engine. Cat H-CPC marks the 3406C fire-pump page as Non-Current and links the LEHW0129 3406C Firepump Spec Sheet with 217-359 bkW / 292-482 bhp ratings.',
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
    String(options.maxTime ?? 120),
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

function verifySourcePage() {
  const localPath = path.join(TMP_DIR, 'cat-3406c-fire-pump.html')
  download(SOURCE_PAGE, localPath)
  const text = fs.readFileSync(localPath, 'utf8')
  const required = [
    'Non-Current',
    '3406C Fire Pump Engine',
    'Cat 3406C Diesel Fire Pump Engine',
    '3406C Firepump Spec Sheet',
    'LEHW0129-',
  ]
  const missing = required.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${SOURCE_PAGE}: missing required token(s): ${missing.join(', ')}`)
  }
  console.log('Verified Cat 3406C non-current fire-pump source page')
}

function downloadAndVerifyPdf() {
  const localPath = path.join(TMP_DIR, path.basename(DOCUMENT.storagePath))
  download(DOCUMENT.sourceUrl, localPath, { referer: SOURCE_PAGE, maxTime: 300 })

  const buffer = fs.readFileSync(localPath)
  if (buffer.length < DOCUMENT.minBytes || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${DOCUMENT.sourceUrl}: response is not a usable PDF`)
  }

  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const missing = DOCUMENT.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${DOCUMENT.storagePath}: missing required token(s): ${missing.join(', ')}`)
  }

  return {
    localPath,
    fileSizeBytes: buffer.length,
  }
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

function buildReport({ existing, linkedCount, skippedCount, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 33 Cat 3406C Fire Pump

Date: 2026-08-11

## Result

- Source-validated Caterpillar 3406C fire-pump candidates reviewed: \`1\`
- Already present before import: \`${existing ? 1 : 0}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${existing ? 0 : 1}\`
- Official Cat PDF documents verified: \`1\`
- Datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${existing ? 'Existing' : APPLY ? 'Inserted' : 'Planned'} Row

| Brand | Model | Series | Status | Power kW | Power hp | RPM max | Source |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| ${RECORD.brand} | ${RECORD.model} | ${RECORD.series} | ${RECORD.status} | ${RECORD.power_kw} | ${RECORD.power_hp} | ${RECORD.rpm_max} | ${SOURCE_PAGE} |

## Document Attachment

| Document | Source | Storage path | Target slug |
| --- | --- | --- | --- |
| ${DOCUMENT.label} | ${DOCUMENT.sourceUrl} | ${DOCUMENT.storagePath} | ${DOCUMENT.slug} |

## Validation Sources

- Cat 3406C Fire Pump non-current product page: ${SOURCE_PAGE}
- Cat 3406C Firepump Spec Sheet: ${DOCUMENT.sourceUrl}

## Notes

- This batch uses Caterpillar's official H-CPC non-current product page for discontinued/legacy status.
- The row is intentionally model-specific (\`3406C Fire Pump\`) rather than attaching the 3406C sheet to generic \`3406\`, \`3406 Industrial\`, or \`3406 Marine\` rows.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Cat 3406C fire-pump legacy batch`)
verifySourcePage()
const verifiedDoc = downloadAndVerifyPdf()
console.log(`Verified ${DOCUMENT.label}: ${Math.round(verifiedDoc.fileSizeBytes / 1024)}KB`)

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const enginesBefore = await fetchAllEngines(supabase)
const existing = enginesBefore.some(
  (engine) => engine.brand === RECORD.brand && normalize(engine.model) === normalize(RECORD.model),
)

if (APPLY && !existing) {
  const { error } = await supabase.from('engines').insert(RECORD)
  if (error) throw error
  console.log(`Inserted ${RECORD.brand} ${RECORD.model}`)
}

const engines = APPLY && !existing ? await fetchAllEngines(supabase) : enginesBefore
const engine = engines.find((row) => row.slug === RECORD.slug)
if (!engine && APPLY) {
  throw new Error(`Missing target row after insert: ${RECORD.slug}`)
}

let linkedCount = 0
let skippedCount = 0

if (engine) {
  const { data: existingLinks, error: existingLinkError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('engine_id', engine.id)
    .eq('storage_path', DOCUMENT.storagePath)
  if (existingLinkError) throw existingLinkError

  if (existingLinks?.length) {
    skippedCount += 1
  } else if (APPLY) {
    const upload = await uploadPdf(supabase, BUCKET, verifiedDoc.localPath, DOCUMENT.storagePath)
    if (!upload.ok) throw new Error(`Upload failed: ${DOCUMENT.storagePath}`)
    const { error: insertLinkError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: DOCUMENT.type,
      label: DOCUMENT.label,
      storage_path: DOCUMENT.storagePath,
      file_size_bytes: upload.uploadedSizeBytes ?? verifiedDoc.fileSizeBytes,
    })
    if (insertLinkError) throw insertLinkError
    linkedCount += 1
  } else {
    linkedCount += 1
  }
}

const afterCount = APPLY ? engines.length : null
const coverage = APPLY ? await countLegacyCoverage(supabase) : null
await fsp.writeFile(REPORT_PATH, buildReport({ existing, linkedCount, skippedCount, afterCount, coverage }))
console.log(`Wrote ${REPORT_PATH}`)
