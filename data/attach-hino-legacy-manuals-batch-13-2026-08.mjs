// Attach validated Hino legacy workshop manuals to existing discontinued rows.
//
// Dry run:
//   node data/attach-hino-legacy-manuals-batch-13-2026-08.mjs
// Apply:
//   node data/attach-hino-legacy-manuals-batch-13-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-doc-attachments-2026-08-11-batch-13-hino.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-hino-manuals-batch-13-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyHinoProbe/1.0; +https://engines.haifengmachinery.com)'

const HINO_INDEX = 'https://www.truck-freeworkshop.com/hino/'
const HINO_H06_PAGE = 'http://hino-h06.com/hino-h06c-h06ct-workshop-manual-.html'
const HINO_H07_PAGE = 'http://hino-h07.com/hino-h07c-engine-parts.html'

const SOURCE_URLS = [
  HINO_INDEX,
  HINO_H06_PAGE,
  HINO_H07_PAGE,
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

const DOCUMENTS = [
  {
    key: 'h06c-h06ct',
    driveFileId: '1r0FiUpbxtXeL-WtWzgNBKwV8TgkJ6tXZ',
    sourcePage: HINO_H06_PAGE,
    sourcePageTokens: ['Hino H06C H06CT Workshop Manual', '1r0FiUpbxtXeL-WtWzgNBKwV8TgkJ6tXZ'],
    storagePath: 'hino/legacy/hino-h06c-h06ct-workshop-manual.pdf',
    label: 'Hino H06C/H06CT Workshop Manual',
    type: 'manual',
    requiredTokens: ['H06C', 'H06CT', 'WORKSHOP MANUAL'],
    slugs: ['hino-h06c', 'hino-h06ct'],
    verification: 'PDF text verified',
  },
  {
    key: 'h07-family',
    driveFileId: '1leK01VKr2w3EE0rgyoHfZIpJyLnRuTlM',
    sourcePage: HINO_H07_PAGE,
    sourcePageTokens: ['Hino H07C', 'Engine Workshop Manual free download', '1leK01VKr2w3EE0rgyoHfZIpJyLnRuTlM'],
    storagePath: 'hino/legacy/hino-h07c-h07ct-h07d-h07dt-workshop-manual.pdf',
    label: 'Hino H07C/H07CT/H07D/H07DT Workshop Manual',
    type: 'manual',
    requiredTokens: ['H07C', 'H07CT', 'H07D', 'H07DT', 'WORKSHOP MANUAL'],
    slugs: ['hino-h07c', 'hino-h07ct', 'hino-h07d', 'hino-h07dt'],
    verification: 'PDF text verified',
  },
  {
    key: 'j08c-tp-tr',
    driveFileId: '1TJqiXt25zJGZWtpXv79XivsXyLZqIidV',
    sourcePage: HINO_INDEX,
    sourcePageTokens: ['Hino J08C-TP and J08C-TR Engine Service Manual', '1TJqiXt25zJGZWtpXv79XivsXyLZqIidV'],
    storagePath: 'hino/legacy/hino-j08c-tp-tr-engine-service-manual.pdf',
    label: 'Hino J08C-TP/J08C-TR Engine Service Manual',
    type: 'manual',
    requiredTokens: ['J08C-TP', 'J08C-TR'],
    slugs: ['hino-j08c'],
    verification: 'PDF text verified',
  },
  {
    key: 'w04c-t',
    driveFileId: '1bqqJxhxmIlOWoYWtyyF_HHj-JQpUxEIa',
    sourcePage: HINO_INDEX,
    sourcePageTokens: ['Hino Motors W04C-T Workshop Manual', '1bqqJxhxmIlOWoYWtyyF_HHj-JQpUxEIa'],
    storagePath: 'hino/legacy/hino-w04c-t-workshop-manual.pdf',
    label: 'Hino W04C-T Workshop Manual',
    type: 'manual',
    requiredTokens: [],
    slugs: ['hino-w04c-t'],
    verification: 'Source-page label and PDF header/size verified; PDF text layer is scanned/watermark-heavy',
  },
  {
    key: 'w04c-ti',
    driveFileId: '1D_YiZl_PZA59I1D4iWEIlJpAps5DNk08',
    sourcePage: HINO_INDEX,
    sourcePageTokens: ['Hino Motors W04C-TI Workshop Manual', '1D_YiZl_PZA59I1D4iWEIlJpAps5DNk08'],
    storagePath: 'hino/legacy/hino-w04c-ti-workshop-manual.pdf',
    label: 'Hino W04C-TI Workshop Manual',
    type: 'manual',
    requiredTokens: [],
    slugs: ['hino-w04c-ti'],
    verification: 'Source-page label and PDF header/size verified; PDF text layer is scanned/watermark-heavy',
  },
  {
    key: 'w04d',
    driveFileId: '1o6iHSy_wF-VZJ5MuUA5FsYCl5aNATBBq',
    sourcePage: HINO_INDEX,
    sourcePageTokens: ['Hino Motors W04D Workshop Manual', '1o6iHSy_wF-VZJ5MuUA5FsYCl5aNATBBq'],
    storagePath: 'hino/legacy/hino-w04d-workshop-manual.pdf',
    label: 'Hino W04D Workshop Manual',
    type: 'manual',
    requiredTokens: [],
    slugs: ['hino-w04d-j'],
    verification: 'Source-page label and PDF header/size verified; linked to existing W04D-J family row',
  },
  {
    key: 'w06d-ti',
    driveFileId: '18yKEd43aYxsJq1T0qIhEQItSK8m9tUu8',
    sourcePage: HINO_INDEX,
    sourcePageTokens: ['Hino Motors W06D-TI Workshop Manual', '18yKEd43aYxsJq1T0qIhEQItSK8m9tUu8'],
    storagePath: 'hino/legacy/hino-w06d-ti-workshop-manual.pdf',
    label: 'Hino W06D-TI Workshop Manual',
    type: 'manual',
    requiredTokens: [],
    slugs: ['hino-w06d-ti'],
    verification: 'Source-page label and PDF header/size verified; PDF text layer is scanned/watermark-heavy',
  },
]

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
  execFileSync('curl', args, { maxBuffer: 50 * 1024 * 1024 })
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

function downloadAndVerifyPdf(document) {
  const localPath = path.join(TMP_DIR, path.basename(document.storagePath))
  download(driveDownloadUrl(document.driveFileId), localPath, document.sourcePage)

  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 100_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${driveViewUrl(document.driveFileId)}: response is not a usable PDF`)
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
    ...document,
    sourceUrl: driveViewUrl(document.driveFileId),
    localPath,
    fileSizeBytes: buffer.length,
  }
}

function buildReport({ verifiedDocs, linkedCount, skippedCount, missingEngines, afterCount, legacyWithPdf, legacyCount }) {
  return `# Legacy Engine Document Attachments - Batch 13 Hino

Date: 2026-08-11

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

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}
${verifiedDocs.map((doc) => `- ${doc.sourceUrl}`).join('\n')}

## Notes

- This batch links documents only to existing Hino rows already marked \`discontinued\`.
- The H07 PDF text explicitly covers H07C, H07CT, H07D, and H07DT, so it is linked across those four legacy rows.
- The J08C document explicitly covers J08C-TP and J08C-TR; it is linked to the current generic J08C row rather than creating unverified subtype rows.
- The W04C-T, W04C-TI, W04D, and W06D-TI PDFs are valid PDFs but have scanned/watermark-heavy text extraction, so their exactness is validated from the public source-page labels and Drive file IDs.
- The broad \`HINO Engine Manual W04_W06\` item was reviewed but not used because the downloaded file is a RAR archive, not a PDF suitable for \`engine_pdfs\`.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const pageTextByUrl = new Map([
  [HINO_INDEX, downloadText(HINO_INDEX, 'hino-index.html')],
  [HINO_H06_PAGE, downloadText(HINO_H06_PAGE, 'hino-h06.html')],
  [HINO_H07_PAGE, downloadText(HINO_H07_PAGE, 'hino-h07.html')],
])

for (const document of DOCUMENTS) {
  verifySourcePage(document, pageTextByUrl.get(document.sourcePage) ?? '')
}

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Hino legacy document attachments`)

const verifiedDocs = DOCUMENTS.map((document) => {
  const verified = downloadAndVerifyPdf(document)
  console.log(`Verified ${document.label}: ${Math.round(verified.fileSizeBytes / 1024)}KB`)
  return verified
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
  if (engine.brand !== 'Hino' || engine.status !== 'discontinued') {
    throw new Error(`Unexpected engine row for Hino legacy document: ${engine.slug} (${engine.brand}, ${engine.status})`)
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
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${legacyWithPdf}/${legacyRows.length}.`)
console.log(`Wrote ${REPORT_PATH}`)
