// Attach validated public Kubota legacy archive PDFs to existing discontinued rows.
//
// Dry run:
//   node data/attach-kubota-legacy-archive-docs-batch-27-2026-08.mjs
// Apply:
//   node data/attach-kubota-legacy-archive-docs-batch-27-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-doc-attachments-2026-08-11-batch-27-kubota-archive.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-kubota-archive-docs-batch-27-2026-08')
const SOURCE_PAGE = 'https://kubotabooks.com/AutoIndex/index.php?dir=Engines/'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyKubotaDocs/1.0; +https://engines.haifengmachinery.com)'

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
    key: '70mm-stroke',
    sourceUrl:
      'https://kubotabooks.com/AutoIndex/index.php?dir=Engines/&file=70mm%20stroke%20enginemanual.pdf',
    sourceNeedle: '70mm%20stroke%20enginemanual.pdf',
    storagePath: 'kubota/legacy/kubota-70mm-stroke-series-workshop-manual.pdf',
    label: 'Kubota 70 mm Stroke Series Workshop Manual',
    type: 'manual',
    minBytes: 1_000_000,
    requiredTokens: [
      '70 mm STROKE SERIES',
      'WORKSHOP MANUAL',
      'Z500-B',
      'Z600-B',
      'ZH600-B',
      'D600-B',
      'D650-B',
      'D750-B',
      'D850-B',
      'D950-B',
      'V1100-B',
      'VH1100-B',
      'V1200-B',
    ],
    slugs: [
      'kubota-z500',
      'kubota-z600',
      'kubota-zh600',
      'kubota-d600',
      'kubota-d650',
      'kubota-d750',
      'kubota-d850',
      'kubota-d950',
      'kubota-v1100',
      'kubota-vh1100',
      'kubota-v1200',
    ],
  },
  {
    key: '02-series-torque',
    sourceUrl:
      'https://kubotabooks.com/AutoIndex/index.php?dir=Engines/&file=Engine-02-TSl.pdf',
    sourceNeedle: 'Engine-02-TSl.pdf',
    storagePath: 'kubota/legacy/kubota-02-series-torque-specifications.pdf',
    label: 'Kubota 02 Series Torque Specifications',
    type: 'datasheet',
    minBytes: 10_000,
    requiredTokens: ['Kubota 02 Series Engines', 'D1102', 'D1302', 'D1402', 'V1502', 'V1702', 'V1902'],
    slugs: [
      'kubota-d1102',
      'kubota-d1302',
      'kubota-d1402',
      'kubota-v1502',
      'kubota-v1702',
      'kubota-v1902',
    ],
  },
]

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
  const missing = DOCUMENTS
    .map((document) => document.sourceNeedle)
    .filter((needle) => !text.includes(needle))
  if (missing.length) {
    throw new Error(`${SOURCE_PAGE}: missing expected PDF link(s): ${missing.join(', ')}`)
  }
  console.log('Verified Kubotabooks public engine PDF index')
}

function downloadAndVerifyPdf(document) {
  const localPath = path.join(TMP_DIR, path.basename(document.storagePath))
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
    document.sourceUrl,
  ], {
    maxBuffer: 80 * 1024 * 1024,
  })

  const buffer = fs.readFileSync(localPath)
  if (buffer.length < document.minBytes || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.sourceUrl}: response is not a usable PDF`)
  }

  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 80 * 1024 * 1024,
  })

  const missingTokens = document.requiredTokens.filter((token) => !hasToken(text, token))
  if (missingTokens.length) {
    throw new Error(`${document.storagePath}: missing required token(s): ${missingTokens.join(', ')}`)
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

function buildReport({ verifiedDocs, linkedCount, skippedCount, missingEngines, afterCount, coverage }) {
  return `# Legacy Engine Document Attachments - Batch 27 Kubota Archive

Date: 2026-08-11

## Result

- Validated public Kubota archive documents reviewed: \`${DOCUMENTS.length}\`
- Datasheet/manual links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
${afterCount == null ? '' : `- Engine count after attachment: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after attachment: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## Document Attachments

| Document | Source | Storage path | Linked rows |
| --- | --- | --- | ---: |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.sourceUrl} | ${doc.storagePath} | ${doc.slugs.length} |`).join('\n')}

## Linked Engine Rows

| Document | Engine slugs |
| --- | --- |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.slugs.join('<br>')} |`).join('\n')}

## Validation Sources

- Kubotabooks public engine PDF index: ${SOURCE_PAGE}
${DOCUMENTS.map((doc) => `- ${doc.label}: ${doc.sourceUrl}`).join('\n')}

## Notes

- This is a document-coverage batch only; no new engine rows or specifications were inserted.
- The 70 mm Stroke Series manual is an original Kubota workshop-manual scan with exact model-family tokens in the extracted text.
- The 02 Series torque-specification PDF is linked only to the exact six 02-series rows named in the document title text.
- Broader Kubota tractor-engine specification compilations were reviewed but not used in this batch because these two documents are stronger exact-family evidence.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Kubota legacy archive document attachments`)
verifySourcePage()

const verifiedDocs = DOCUMENTS.map((document) => {
  const verified = downloadAndVerifyPdf(document)
  console.log(`Verified ${document.label}: ${Math.round(verified.fileSizeBytes / 1024)}KB`)
  return { ...document, ...verified }
})

const slugs = [...new Set(DOCUMENTS.flatMap((document) => document.slugs))]
const { data: engineRows, error: engineError } = await supabase
  .from('engines')
  .select('id, slug, brand, model, status')
  .in('slug', slugs)
if (engineError) throw engineError

const enginesBySlug = new Map((engineRows ?? []).map((engine) => [engine.slug, engine]))
const missingEngines = slugs.filter((slug) => !enginesBySlug.has(slug))
if (missingEngines.length) {
  console.warn(`Missing engine rows: ${missingEngines.join(', ')}`)
}

for (const engine of engineRows ?? []) {
  if (engine.brand !== 'Kubota' || engine.status !== 'discontinued') {
    throw new Error(`Unexpected Kubota document target: ${engine.slug} (${engine.brand}, ${engine.status})`)
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

const coverage = await countLegacyCoverage(supabase)

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({
  verifiedDocs,
  linkedCount,
  skippedCount,
  missingEngines,
  afterCount: APPLY ? afterCount : null,
  coverage: APPLY ? coverage : null,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
