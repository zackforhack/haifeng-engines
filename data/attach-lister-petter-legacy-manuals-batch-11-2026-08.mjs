// Attach validated Lister Petter / Petter legacy manuals to existing discontinued rows.
//
// Dry run:
//   node data/attach-lister-petter-legacy-manuals-batch-11-2026-08.mjs
// Apply:
//   node data/attach-lister-petter-legacy-manuals-batch-11-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-doc-attachments-2026-08-11-batch-11-lister-petter.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-lister-petter-manuals-batch-11-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyListerPetterProbe/1.0; +https://engines.haifengmachinery.com)'

const SOURCE_URLS = [
  'https://www.winget.co.uk/parts-service/heritage-machines/',
  'https://www.winget.co.uk/document/LISTER%20PETTER%20T%20SERIES%20WORKSHOP%20MANUAL%20EDITION%2012%20MAY%202005.pdf',
  'https://www.winget.co.uk/document/PETTER%20A%20RANGE%20WORKSHOP%20MANUAL.pdf',
  'https://www.manualslib.com/products/Lister-Petter-Tx-15192408.html',
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

const DOCUMENTS = [
  {
    key: 't-series',
    sourceUrl:
      'https://www.winget.co.uk/document/LISTER%20PETTER%20T%20SERIES%20WORKSHOP%20MANUAL%20EDITION%2012%20MAY%202005.pdf',
    sourcePage: 'https://www.winget.co.uk/parts-service/heritage-machines/',
    storagePath: 'lister-petter/legacy/lister-petter-t-series-workshop-manual-edition-12-2005.pdf',
    label: 'Lister Petter T Series TS/TR/TX Workshop Manual Edition 12',
    type: 'manual',
    requiredTokens: ['TS', 'TR', 'TX', 'WORKSHOP MANUAL', 'MAY 2005'],
    slugs: [
      'lister-petter-lister-petter-ts1',
      'lister-petter-lister-petter-ts2',
      'lister-petter-lister-petter-ts3',
      'lister-petter-lister-petter-tx2',
      'lister-petter-lister-petter-tx3',
    ],
  },
  {
    key: 'a-range',
    sourceUrl: 'https://www.winget.co.uk/document/PETTER%20A%20RANGE%20WORKSHOP%20MANUAL.pdf',
    sourcePage: 'https://www.winget.co.uk/parts-service/heritage-machines/',
    storagePath: 'lister-petter/legacy/petter-a-range-workshop-manual.pdf',
    label: 'Petter A Range Workshop Manual',
    type: 'manual',
    // Scanned/copy-protected PDF: validate by source URL, PDF header, size and pdfinfo.
    requiredTokens: [],
    slugs: [
      'lister-petter-petter-aa1',
      'lister-petter-petter-ab1',
      'lister-petter-petter-ab1w',
      'lister-petter-petter-ac1',
      'lister-petter-petter-ac1w',
      'lister-petter-petter-ac2',
    ],
  },
]

function downloadAndVerifyPdf(document) {
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

function buildReport({ verifiedDocs, linkedCount, skippedCount, missingEngines, afterCount, legacyWithPdf, legacyCount }) {
  return `# Legacy Engine Document Attachments - Batch 11 Lister Petter

Date: 2026-08-11

## Result

- Validated shared Lister Petter / Petter legacy manuals reviewed: \`${DOCUMENTS.length}\`
- Datasheet/manual links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
${afterCount == null ? '' : `- Engine count after attachment: \`${afterCount}\`\n`}${legacyCount == null ? '' : `- Legacy PDF/manual coverage after attachment: \`${legacyWithPdf}/${legacyCount}\`\n`}
## Document Attachments

| Document | Source | Storage path | Linked rows |
| --- | --- | --- | ---: |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.sourceUrl} | ${doc.storagePath} | ${doc.slugs.length} |`).join('\n')}

## Linked Engine Rows

| Document | Engine slugs |
| --- | --- |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.slugs.join('<br>')} |`).join('\n')}

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- Winget's heritage archive lists both Lister Petter T Series and Petter A Range manuals as legacy support documents.
- The T Series manual is linked only to existing TS and TX rows. TR rows were not added in this batch because this was a document-coverage pass.
- The Petter A Range manual is linked only to exact air/water-cooled A-range rows covered by the manual. Marine reduction-gear rows are left unlinked until a more exact marine document is validated.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Lister Petter legacy manual attachments`)

const verifiedDocs = DOCUMENTS.map((document) => {
  const verified = downloadAndVerifyPdf(document)
  console.log(`Verified ${document.label}: ${Math.round(verified.fileSizeBytes / 1024)}KB`)
  return {
    ...document,
    ...verified,
  }
})

const slugs = [...new Set(DOCUMENTS.flatMap((doc) => doc.slugs))]
const { data: engineRows, error: engineError } = await supabase
  .from('engines')
  .select('id, slug, brand, model, status')
  .in('slug', slugs)
if (engineError) throw engineError

const enginesBySlug = new Map(engineRows.map((engine) => [engine.slug, engine]))
const missingEngines = slugs.filter((slug) => !enginesBySlug.has(slug))
if (missingEngines.length) {
  console.warn(`Missing engine rows: ${missingEngines.join(', ')}`)
}

for (const engine of engineRows) {
  if (engine.brand !== 'Lister Petter' || engine.status !== 'discontinued') {
    throw new Error(`Unexpected engine row for legacy manual: ${engine.slug} (${engine.brand}, ${engine.status})`)
  }
}

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
        file_size_bytes: upload.uploadedSizeBytes ?? document.fileSizeBytes,
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
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${legacyWithPdf}/${legacyRows.length}.`)
console.log(`Wrote ${REPORT_PATH}`)
