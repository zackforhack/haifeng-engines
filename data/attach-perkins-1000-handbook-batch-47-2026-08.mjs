// Attach a validated Perkins 1000 Series handbook to uncovered legacy 1004 rows.
//
// Dry run:
//   node data/attach-perkins-1000-handbook-batch-47-2026-08.mjs
// Apply:
//   node data/attach-perkins-1000-handbook-batch-47-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-doc-attachments-2026-08-12-batch-47-perkins-1000.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-perkins-1000-batch-47-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyPerkins1000Probe/1.0; +https://engines.haifengmachinery.com)'

const SOURCE_PAGE = 'https://www.boatfreemanuals.com/motors/perkins/'
const DOCUMENT = {
  sourceUrl:
    'https://www.boatfreemanuals.com/app/download/11674303691/Perkins+1000+Series+Handbook_compressed.pdf?t=1631007179',
  sourceNeedle: '/app/download/11674303691/Perkins+1000+Series+Handbook_compressed.pdf',
  storagePath: 'perkins/legacy/perkins-1000-series-handbook.pdf',
  label: 'Perkins 1000 Series Handbook',
  type: 'manual',
  minBytes: 1_000_000,
  requiredTokens: [
    'Perkins 1000 Series',
    'industrial and agricultural',
    '1000 Series consists',
    'Engines used for generator sets',
    '1006',
    'Turbocharged',
  ],
  slugs: [
    'perkins-1004-40',
    'perkins-1004-40t',
    'perkins-1004-4t',
  ],
}

const REJECTED = [
  {
    document: 'Perkins 4.236 marine handbook',
    reason:
      'Downloaded PDF is real, but the extracted text is scan/OCR-poor and the document is marine-specific; not attached to industrial/genset legacy rows in this batch.',
  },
  {
    document: 'Perkins 4.108/6.354 marine operator manual',
    reason:
      'Downloaded PDF is real, but the extracted text layer is effectively empty; not attached without stronger exact model-token validation.',
  },
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

function download(url, args = []) {
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
    '180',
    '--user-agent',
    USER_AGENT,
    ...args,
    url,
  ], {
    maxBuffer: 50 * 1024 * 1024,
  })
}

function downloadText(url) {
  return download(url).toString('utf8')
}

function verifySourcePage() {
  const html = downloadText(SOURCE_PAGE)
  if (!html.includes(DOCUMENT.sourceNeedle)) {
    throw new Error(`${SOURCE_PAGE}: missing expected Perkins 1000 Series PDF link`)
  }
}

function downloadAndVerifyPdf() {
  const localPath = path.join(TMP_DIR, path.basename(DOCUMENT.storagePath))
  download(DOCUMENT.sourceUrl, ['--referer', SOURCE_PAGE, '--output', localPath])

  const buffer = fs.readFileSync(localPath)
  if (buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error(`${DOCUMENT.sourceUrl}: downloaded file is not a PDF`)
  }
  if (buffer.length < DOCUMENT.minBytes) {
    throw new Error(`${DOCUMENT.sourceUrl}: PDF too small (${buffer.length} bytes)`)
  }

  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
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

async function fetchEngines(supabase, slugs) {
  const { data, error } = await supabase
    .from('engines')
    .select('id, slug, brand, model, status, pdfs:engine_pdfs(id, storage_path)')
    .in('slug', slugs)
  if (error) throw error
  return data ?? []
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

function buildReport({ linked, skipped, missing, afterCount, coverage }) {
  return `# Legacy Engine Document Attachments - Batch 47 Perkins 1000

Date: 2026-08-12

## Result

- Validated Perkins legacy documents reviewed: \`1\`
- Datasheet/manual links ${APPLY ? 'inserted' : 'planned'}: \`${linked.length}\`
- Links skipped as existing: \`${skipped.length}\`
- Missing target engines: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after attachment: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after attachment: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## Document Attachment

| Document | Source | Storage path | Target rows |
| --- | --- | --- | ---: |
| ${DOCUMENT.label} | ${DOCUMENT.sourceUrl} | ${DOCUMENT.storagePath} | ${DOCUMENT.slugs.length} |

## Linked Engine Rows

| Engine slug | Status |
| --- | --- |
${linked.map((slug) => `| ${slug} | linked |`).join('\n')}
${skipped.map((slug) => `| ${slug} | existing |`).join('\n')}
${missing.map((slug) => `| ${slug} | missing |`).join('\n')}

## Rejected / Deferred Perkins Documents

| Candidate | Reason |
| --- | --- |
${REJECTED.map((item) => `| ${item.document} | ${item.reason} |`).join('\n')}

## Validation Sources

- BoatFreeManuals Perkins page: ${SOURCE_PAGE}
- Perkins 1000 Series Handbook direct PDF: ${DOCUMENT.sourceUrl}

## Notes

- This is a document-coverage batch only; no new engine rows or specifications were inserted.
- The handbook text explicitly describes the Perkins 1000 Series as industrial and agricultural engines and names generator-set numbering conventions, so it is suitable for the uncovered 1004 legacy industrial rows.
- Marine-only Perkins PDFs found on the same source page were not linked because they did not pass the same exact text-validation threshold for these industrial/genset rows.
`
}

await loadEnv()
await fsp.mkdir(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Perkins 1000 legacy handbook attachment`)
verifySourcePage()
const verified = downloadAndVerifyPdf()
console.log(`Verified ${DOCUMENT.label}: ${Math.round(verified.fileSizeBytes / 1024)}KB`)

const engines = await fetchEngines(supabase, DOCUMENT.slugs)
const enginesBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
const missing = DOCUMENT.slugs.filter((slug) => !enginesBySlug.has(slug))
for (const engine of engines) {
  if (engine.brand !== 'Perkins' || engine.status !== 'discontinued') {
    throw new Error(`Unexpected Perkins target: ${engine.slug} (${engine.brand}, ${engine.status})`)
  }
}

const linked = []
const skipped = []

if (APPLY) {
  const upload = await uploadPdf(supabase, BUCKET, verified.localPath, DOCUMENT.storagePath)
  if (!upload.ok) throw new Error(`Upload failed: ${DOCUMENT.storagePath}`)

  for (const slug of DOCUMENT.slugs) {
    const engine = enginesBySlug.get(slug)
    if (!engine) continue
    const exists = (engine.pdfs ?? []).some((pdf) => pdf.storage_path === DOCUMENT.storagePath)
    if (exists) {
      skipped.push(slug)
      continue
    }
    const { error } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: DOCUMENT.type,
      label: DOCUMENT.label,
      storage_path: DOCUMENT.storagePath,
      file_size_bytes: upload.uploadedSizeBytes ?? verified.fileSizeBytes,
    })
    if (error) throw error
    linked.push(slug)
    console.log(`Linked ${slug} -> ${DOCUMENT.storagePath}`)
  }
} else {
  for (const slug of DOCUMENT.slugs) {
    const engine = enginesBySlug.get(slug)
    if (!engine) continue
    const exists = (engine.pdfs ?? []).some((pdf) => pdf.storage_path === DOCUMENT.storagePath)
    if (exists) skipped.push(slug)
    else linked.push(slug)
  }
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError
const coverage = APPLY ? await countLegacyCoverage(supabase) : null

await fsp.writeFile(REPORT_PATH, buildReport({ linked, skipped, missing, afterCount, coverage }))

console.log(`Planned/linked: ${linked.join(', ')}`)
console.log(`Skipped existing: ${skipped.join(', ')}`)
console.log(`Missing: ${missing.join(', ')}`)
console.log(`Report: ${REPORT_PATH}`)
