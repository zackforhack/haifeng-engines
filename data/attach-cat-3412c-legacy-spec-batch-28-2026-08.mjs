// Attach an official Caterpillar 3412C non-current spec sheet to the existing
// discontinued Caterpillar 3412C row.
//
// Dry run:
//   node data/attach-cat-3412c-legacy-spec-batch-28-2026-08.mjs
// Apply:
//   node data/attach-cat-3412c-legacy-spec-batch-28-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-doc-attachments-2026-08-11-batch-28-cat-3412c.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-cat-3412c-batch-28-2026-08')
const SOURCE_PAGE =
  'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000029404&nc=1'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyCat3412C/1.0; +https://engines.haifengmachinery.com)'

const DOCUMENT = {
  sourceUrl: 'https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE21655-',
  storagePath: 'caterpillar/legacy/cat-3412c-60hz-low-fuel-consumption-spec-sheet.pdf',
  label: 'Cat 3412C 60 Hz Low Fuel Consumption Spec Sheet',
  type: 'datasheet',
  minBytes: 100_000,
  requiredTokens: ['Cat 3412', 'Diesel Generator Sets', '700 ekW', '725 ekW'],
  slug: 'caterpillar-3412c',
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

function verifySourcePage() {
  const text = downloadText(SOURCE_PAGE)
  const required = [
    'Non-Current',
    'Cat 3412C (60 Hz) Diesel Generator Sets',
    '3412C TA, V-12, 4-Stroke Water-Cooled Diesel',
    'LEHE21655-',
  ]
  const missing = required.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${SOURCE_PAGE}: missing required source-page token(s): ${missing.join(', ')}`)
  }
  console.log('Verified Caterpillar 3412C non-current source page')
}

function downloadAndVerifyPdf() {
  const localPath = path.join(TMP_DIR, path.basename(DOCUMENT.storagePath))
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
    '300',
    '--user-agent',
    USER_AGENT,
    '--referer',
    SOURCE_PAGE,
    '--output',
    localPath,
    DOCUMENT.sourceUrl,
  ], {
    maxBuffer: 20 * 1024 * 1024,
  })

  const buffer = fs.readFileSync(localPath)
  if (buffer.length < DOCUMENT.minBytes || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${DOCUMENT.sourceUrl}: response is not a usable PDF`)
  }

  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const missingTokens = DOCUMENT.requiredTokens.filter((token) => !hasToken(text, token))
  if (missingTokens.length) {
    throw new Error(`${DOCUMENT.storagePath}: missing required token(s): ${missingTokens.join(', ')}`)
  }

  return {
    localPath,
    fileSizeBytes: buffer.length,
  }
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

function buildReport({ linkedCount, skippedCount, missingEngine, afterCount, coverage }) {
  return `# Legacy Engine Document Attachments - Batch 28 Cat 3412C

Date: 2026-08-11

## Result

- Validated Caterpillar non-current documents reviewed: \`1\`
- Datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine row: \`${missingEngine ? 'yes' : 'no'}\`
${afterCount == null ? '' : `- Engine count after attachment: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after attachment: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## Document Attachment

| Document | Source | Storage path | Linked row |
| --- | --- | --- | --- |
| ${DOCUMENT.label} | ${DOCUMENT.sourceUrl} | ${DOCUMENT.storagePath} | ${DOCUMENT.slug} |

## Validation Sources

- Caterpillar 3412C non-current product page: ${SOURCE_PAGE}
- Caterpillar publication endpoint: ${DOCUMENT.sourceUrl}

## Notes

- The Cat product page is marked Non-Current and lists Engine Model \`3412C TA, V-12, 4-Stroke Water-Cooled Diesel\`.
- The PDF internally titles the publication \`Cat 3412 Diesel Generator Sets\`; it is attached to the 3412C row because Caterpillar's own 3412C product page links this exact spec sheet.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Caterpillar 3412C legacy spec attachment`)
verifySourcePage()
const verified = downloadAndVerifyPdf()
console.log(`Verified ${DOCUMENT.label}: ${Math.round(verified.fileSizeBytes / 1024)}KB`)

const { data: engine, error: engineError } = await supabase
  .from('engines')
  .select('id, slug, brand, model, status')
  .eq('slug', DOCUMENT.slug)
  .maybeSingle()
if (engineError) throw engineError

const missingEngine = !engine
if (engine && (engine.brand !== 'Caterpillar' || engine.status !== 'discontinued')) {
  throw new Error(`Unexpected Cat document target: ${engine.slug} (${engine.brand}, ${engine.status})`)
}

let linkedCount = 0
let skippedCount = 0

if (APPLY && engine) {
  const upload = await uploadPdf(supabase, BUCKET, verified.localPath, DOCUMENT.storagePath)
  if (!upload.ok) throw new Error(`Upload failed: ${DOCUMENT.storagePath}`)

  const { data: existingLinks, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('engine_id', engine.id)
    .eq('storage_path', DOCUMENT.storagePath)
  if (existingError) throw existingError

  if (existingLinks?.length) {
    skippedCount += 1
  } else {
    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: DOCUMENT.type,
      label: DOCUMENT.label,
      storage_path: DOCUMENT.storagePath,
      file_size_bytes: upload.uploadedSizeBytes ?? verified.fileSizeBytes,
    })
    if (insertError) throw insertError
    linkedCount += 1
    console.log(`Linked ${DOCUMENT.slug} -> ${DOCUMENT.storagePath}`)
  }
} else if (engine) {
  linkedCount = 1
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = await countLegacyCoverage(supabase)

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({
  linkedCount,
  skippedCount,
  missingEngine,
  afterCount: APPLY ? afterCount : null,
  coverage: APPLY ? coverage : null,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
