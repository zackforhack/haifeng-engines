// Attach the broad Hino W04/W06 legacy manual only if the public source and
// downloaded file verify as a usable PDF. Dry-run by default.
//
// Dry run:
//   node data/attach-hino-w04-w06-legacy-manual-batch-48-2026-08.mjs
// Apply:
//   node data/attach-hino-w04-w06-legacy-manual-batch-48-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-doc-attachments-2026-08-12-batch-48-hino-w04-w06.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-hino-w04-w06-batch-48-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyHinoProbe/1.0; +https://engines.haifengmachinery.com)'

const HINO_INDEX = 'https://www.truck-freeworkshop.com/hino/'

const DOCUMENTS = [
  {
    key: 'w04-w06-engine-manual',
    driveFileId: '1MFNmtKopBaS2IchAfLnIABHrbtQEEIL4',
    sourcePage: HINO_INDEX,
    sourcePageTokens: [
      'HINO Engine Manual W04_W06',
      '1MFNmtKopBaS2IchAfLnIABHrbtQEEIL4',
    ],
    storagePath: 'hino/legacy/hino-engine-manual-w04-w06.pdf',
    label: 'HINO Engine Manual W04/W06',
    type: 'manual',
    requiredTokens: ['W04', 'W06'],
    slugs: ['hino-w04c', 'hino-w06d'],
    verification: 'Source-page label, PDF header/size, and W04/W06 text tokens verified',
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

function driveViewUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`
}

function driveDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

function curl(args) {
  execFileSync('curl', args, { maxBuffer: 100 * 1024 * 1024 })
}

function download(url, localPath, referer = null) {
  const args = [
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
  ]
  if (referer) args.push('--referer', referer)
  args.push('--output', localPath, url)
  curl(args)
}

function downloadText(url, fileName) {
  const localPath = path.join(TMP_DIR, fileName)
  download(url, localPath)
  return fs.readFileSync(localPath, 'utf8')
}

function verifySourcePage(document, pageText) {
  const missing = document.sourcePageTokens.filter((token) => !pageText.includes(token))
  if (missing.length) {
    throw new Error(`${document.sourcePage}: missing source-page token(s): ${missing.join(', ')}`)
  }
}

function downloadDriveFile(document) {
  const localPath = path.join(TMP_DIR, path.basename(document.storagePath))
  const cookiePath = path.join(TMP_DIR, `${document.key}.cookies.txt`)
  const firstPath = path.join(TMP_DIR, `${document.key}.first`)

  download(driveDownloadUrl(document.driveFileId), firstPath, document.sourcePage)
  let buffer = fs.readFileSync(firstPath)
  if (buffer.subarray(0, 4).toString() === '%PDF') {
    fs.copyFileSync(firstPath, localPath)
    return localPath
  }

  const firstText = buffer.toString('utf8')
  const confirmMatch = firstText.match(/confirm=([0-9A-Za-z_-]+)/)
  if (!confirmMatch) {
    fs.copyFileSync(firstPath, localPath)
    return localPath
  }

  const args = [
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
    '--cookie-jar',
    cookiePath,
    '--cookie',
    cookiePath,
    '--referer',
    document.sourcePage,
    '--output',
    localPath,
    `${driveDownloadUrl(document.driveFileId)}&confirm=${confirmMatch[1]}`,
  ]
  curl(args)
  return localPath
}

function downloadAndVerifyPdf(document) {
  const localPath = downloadDriveFile(document)
  const buffer = fs.readFileSync(localPath)
  const header = buffer.subarray(0, 8).toString('latin1')

  if (buffer.length < 100_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${driveViewUrl(document.driveFileId)}: response is not a usable PDF (header ${JSON.stringify(header)}, ${buffer.length} bytes)`)
  }

  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024,
  })

  const missing = document.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${document.storagePath}: missing required token(s): ${missing.join(', ')}`)
  }

  return {
    ...document,
    sourceUrl: driveViewUrl(document.driveFileId),
    localPath,
    fileSizeBytes: buffer.length,
  }
}

function buildReport({ verifiedDocs, linkedCount, skippedCount, missingEngines, afterCount, legacyWithPdf, legacyCount, rejectedDocs }) {
  return `# Legacy Engine Document Attachments - Batch 48 Hino W04/W06

Date: 2026-08-12

## Result

- Validated Hino legacy documents reviewed: \`${DOCUMENTS.length}\`
- Datasheet/manual links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
${afterCount == null ? '' : `- Engine count after attachment: \`${afterCount}\`\n`}${legacyCount == null ? '' : `- Legacy PDF/manual coverage after attachment: \`${legacyWithPdf}/${legacyCount}\`\n`}
## Document Attachments

| Document | Source | Storage path | Linked rows | Verification |
| --- | --- | --- | ---: | --- |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.sourceUrl} | ${doc.storagePath} | ${doc.slugs.length} | ${doc.verification} |`).join('\n')}

## Linked Engine Rows

| Document | Engine slugs |
| --- | --- |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.slugs.join('<br>')} |`).join('\n')}

## Validation Sources

- ${HINO_INDEX}
${verifiedDocs.map((doc) => `- ${doc.sourceUrl}`).join('\n')}

## Rejected Or Deferred

${rejectedDocs.length ? rejectedDocs.map((item) => `- ${item}`).join('\n') : '- None.'}

## Notes

- This batch links documents only to existing Hino rows already marked \`discontinued\`.
- The W04/W06 file is attached only if it downloads as a PDF and text extraction confirms both family tokens.
- Exact J05C coverage is still deferred; the public Hino page exposes J05D/J08D and J05D/J08E manuals, but not an exact J05C document.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const pageTextByUrl = new Map([
  [HINO_INDEX, downloadText(HINO_INDEX, 'hino-index.html')],
])

for (const document of DOCUMENTS) {
  verifySourcePage(document, pageTextByUrl.get(document.sourcePage) ?? '')
}

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Hino W04/W06 legacy document attachments`)

const verifiedDocs = []
const rejectedDocs = []
for (const document of DOCUMENTS) {
  try {
    const verified = downloadAndVerifyPdf(document)
    console.log(`Verified ${document.label}: ${Math.round(verified.fileSizeBytes / 1024)}KB`)
    verifiedDocs.push(verified)
  } catch (error) {
    rejectedDocs.push(`${document.label}: ${error.message}`)
    console.warn(`Rejected ${document.label}: ${error.message}`)
  }
}

const slugs = [...new Set(verifiedDocs.flatMap((doc) => doc.slugs))]
let engineRows = []
let missingEngines = []

if (slugs.length) {
  const { data, error: engineError } = await supabase
    .from('engines')
    .select('id, slug, brand, model, status')
    .in('slug', slugs)
  if (engineError) throw engineError

  engineRows = data ?? []
  const enginesBySlug = new Map(engineRows.map((engine) => [engine.slug, engine]))
  missingEngines = slugs.filter((slug) => !enginesBySlug.has(slug))
  if (missingEngines.length) {
    console.warn(`Missing engine rows: ${missingEngines.join(', ')}`)
  }

  for (const engine of engineRows) {
    if (engine.brand !== 'Hino' || engine.status !== 'discontinued') {
      throw new Error(`Unexpected engine row for Hino legacy document: ${engine.slug} (${engine.brand}, ${engine.status})`)
    }
  }
}

const enginesBySlug = new Map(engineRows.map((engine) => [engine.slug, engine]))
let linkedCount = 0
let skippedCount = 0

if (APPLY) {
  for (const document of verifiedDocs) {
    const upload = await uploadPdf(supabase, BUCKET, document.localPath, document.storagePath)
    if (!upload.ok) throw new Error(`Upload failed: ${document.storagePath}`)

    for (const slug of document.slugs) {
      const engine = enginesBySlug.get(slug)
      if (!engine) continue

      const { data: existingLinks, error: existingError } = await supabase
        .from('engine_pdfs')
        .select('engine_id')
        .eq('engine_id', engine.id)
        .eq('storage_path', document.storagePath)
      if (existingError) throw existingError

      if (existingLinks?.length) {
        skippedCount += 1
        continue
      }

      const { error: insertError } = await supabase.from('engine_pdfs').insert({
        engine_id: engine.id,
        type: document.type,
        label: document.label,
        storage_path: document.storagePath,
        file_size_bytes: document.fileSizeBytes,
      })
      if (insertError) throw insertError
      linkedCount += 1
      console.log(`Linked ${slug} -> ${document.storagePath}`)
    }
  }
} else {
  linkedCount = slugs.length - missingEngines.length
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
  verifiedDocs,
  linkedCount,
  skippedCount,
  missingEngines,
  afterCount: APPLY ? afterCount : null,
  legacyWithPdf: APPLY ? legacyWithPdf : null,
  legacyCount: APPLY ? legacyRows.length : null,
  rejectedDocs,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${legacyWithPdf}/${legacyRows.length}.`)
console.log(`Wrote ${REPORT_PATH}`)
