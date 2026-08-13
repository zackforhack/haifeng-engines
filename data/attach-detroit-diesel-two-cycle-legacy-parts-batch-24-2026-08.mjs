// Attach a validated Detroit Diesel two-cycle legacy parts catalog to matching
// discontinued 53/71/92/149 Series rows.
//
// Dry run:
//   node data/attach-detroit-diesel-two-cycle-legacy-parts-batch-24-2026-08.mjs
// Apply:
//   node data/attach-detroit-diesel-two-cycle-legacy-parts-batch-24-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-doc-attachments-2026-08-11-batch-24-detroit-diesel.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-detroit-diesel-two-cycle-batch-24-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyDetroitDieselProbe/1.0; +https://engines.haifengmachinery.com)'

const SOURCE_PAGE = 'https://www.truck-manuals.net/detroit-diesel/'
const DOCUMENT = {
  sourceUrl:
    'https://www.truck-manuals.net/app/download/15601902922/Detroit+Diesel+53%2C+71%2C+92%2C+149+series+2-+Cycle+Replacement+Parts+Catalog.pdf?t=1609933513',
  sourcePage: SOURCE_PAGE,
  sourcePageNeedle:
    '/app/download/15601902922/Detroit+Diesel+53%2C+71%2C+92%2C+149+series+2-+Cycle+Replacement+Parts+Catalog.pdf',
  storagePath: 'detroit-diesel/legacy/detroit-diesel-53-71-92-149-two-cycle-replacement-parts-catalog.pdf',
  label: 'Detroit Diesel 53/71/92/149 Two-Cycle Replacement Parts Catalog',
  type: 'manual',
  requiredTokens: [
    'Detroit Diesel',
    '53, 71, V71, 92 and 149 Series',
    '149 SERIES',
  ],
  slugs: [
    'detroit-diesel-2-53',
    'detroit-diesel-3-53',
    'detroit-diesel-4-53',
    'detroit-diesel-4v-53',
    'detroit-diesel-6-53',
    'detroit-diesel-6v-53',
    'detroit-diesel-4-71',
    'detroit-diesel-6v-71',
    'detroit-diesel-8v-71',
    'detroit-diesel-12v-71',
    'detroit-diesel-16v-71',
    'detroit-diesel-6v-92',
    'detroit-diesel-8v-92',
    'detroit-diesel-12v-92',
    'detroit-diesel-16v-92',
  ],
}

const SOURCE_URLS = [
  DOCUMENT.sourcePage,
  DOCUMENT.sourceUrl,
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
    maxBuffer: 10 * 1024 * 1024,
  })
}

function downloadAndVerifyPdf(document) {
  const pageHtml = downloadText(document.sourcePage)
  if (!pageHtml.includes(document.sourcePageNeedle)) {
    throw new Error(`${document.sourcePage}: expected Detroit Diesel catalog download link was not found`)
  }

  const localPath = path.join(TMP_DIR, path.basename(document.storagePath))
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
    '300',
    '--user-agent',
    USER_AGENT,
    '--referer',
    document.sourcePage,
    '--output',
    localPath,
    document.sourceUrl,
  ], {
    maxBuffer: 50 * 1024 * 1024,
  })

  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 100_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.sourceUrl}: response is not a usable PDF`)
  }

  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  })

  const missing = document.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${document.storagePath}: missing required token(s): ${missing.join(', ')}`)
  }

  return {
    localPath,
    fileSizeBytes: buffer.length,
  }
}

function buildReport({ verifiedDoc, linkedCount, skippedCount, missingEngines, afterCount, legacyWithPdf, legacyCount }) {
  return `# Legacy Engine Document Attachments - Batch 24 Detroit Diesel

Date: 2026-08-11

## Result

- Validated Detroit Diesel legacy support document reviewed: \`1\`
- Datasheet/manual links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
${afterCount == null ? '' : `- Engine count after attachment: \`${afterCount}\`\n`}${legacyCount == null ? '' : `- Legacy PDF/manual coverage after attachment: \`${legacyWithPdf}/${legacyCount}\`\n`}
## Document Attachment

| Document | Source | Storage path | Linked rows |
| --- | --- | --- | ---: |
| ${verifiedDoc.label} | ${verifiedDoc.sourceUrl} | ${verifiedDoc.storagePath} | ${verifiedDoc.slugs.length} |

## Linked Engine Rows

${verifiedDoc.slugs.map((slug) => `- \`${slug}\``).join('\n')}

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- Truck-Manuals lists the Detroit Diesel 53/71/92/149 two-cycle replacement parts catalog on its Detroit Diesel manual archive page.
- The downloaded PDF was verified by PDF header, file size and extracted text tokens for Detroit Diesel, 53/71/V71/92/149 Series coverage.
- The catalog is linked only to existing discontinued Detroit Diesel 53, 71 and 92 family rows that were uncovered before this pass.
- The 8.2L Fuel Pincher row is intentionally excluded because it is not part of the covered two-cycle 53/71/92/149 catalog family.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Detroit Diesel two-cycle legacy document attachment`)

const verifiedDoc = {
  ...DOCUMENT,
  ...downloadAndVerifyPdf(DOCUMENT),
}
console.log(`Verified ${verifiedDoc.label}: ${Math.round(verifiedDoc.fileSizeBytes / 1024)}KB`)

const { data: engineRows, error: engineError } = await supabase
  .from('engines')
  .select('id, slug, brand, model, status')
  .in('slug', verifiedDoc.slugs)
if (engineError) throw engineError

const enginesBySlug = new Map(engineRows.map((engine) => [engine.slug, engine]))
const missingEngines = verifiedDoc.slugs.filter((slug) => !enginesBySlug.has(slug))
if (missingEngines.length) {
  console.warn(`Missing engine rows: ${missingEngines.join(', ')}`)
}

for (const engine of engineRows) {
  const coveredFamily = /^(?:\d+V?-)?(?:53|71|92)$/i.test(engine.model)
  if (
    engine.brand !== 'Detroit Diesel'
    || engine.status !== 'discontinued'
    || !coveredFamily
    || engine.slug.includes('8-2l')
  ) {
    throw new Error(`Unexpected engine row for Detroit Diesel two-cycle catalog: ${engine.slug} (${engine.brand}, ${engine.model}, ${engine.status})`)
  }
}

let linkedCount = 0
let skippedCount = 0

if (APPLY) {
  const upload = await uploadPdf(supabase, BUCKET, verifiedDoc.localPath, verifiedDoc.storagePath)
  if (!upload.ok) throw new Error(`Upload failed: ${verifiedDoc.storagePath}`)

  for (const slug of verifiedDoc.slugs) {
    const engine = enginesBySlug.get(slug)
    if (!engine) continue

    const { data: existingLinks, error: existingError } = await supabase
      .from('engine_pdfs')
      .select('engine_id')
      .eq('engine_id', engine.id)
      .eq('storage_path', verifiedDoc.storagePath)
    if (existingError) throw existingError

    if (existingLinks?.length) {
      skippedCount += 1
      continue
    }

    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: verifiedDoc.type,
      label: verifiedDoc.label,
      storage_path: verifiedDoc.storagePath,
      file_size_bytes: upload.uploadedSizeBytes ?? verifiedDoc.fileSizeBytes,
    })
    if (insertError) throw insertError
    linkedCount += 1
    console.log(`Linked ${slug} -> ${verifiedDoc.storagePath}`)
  }
} else {
  linkedCount = verifiedDoc.slugs.length - missingEngines.length
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

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
const legacyWithPdf = legacyRows.filter((engine) => (engine.pdfs ?? []).length > 0).length

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({
  verifiedDoc,
  linkedCount,
  skippedCount,
  missingEngines,
  afterCount: APPLY ? afterCount : null,
  legacyWithPdf: APPLY ? legacyWithPdf : null,
  legacyCount: APPLY ? legacyRows.length : null,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${legacyWithPdf}/${legacyRows.length}.`)
console.log(`Wrote ${REPORT_PATH}`)
