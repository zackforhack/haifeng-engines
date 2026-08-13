// Attach official Volvo Penta industrial product bulletins to exact legacy VE rows.
//
// Dry run:
//   node data/attach-volvo-tad560-765ve-official-strict-batch-81-2026-08.mjs
// Apply:
//   node data/attach-volvo-tad560-765ve-official-strict-batch-81-2026-08.mjs --apply

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
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-81-volvo-tad560-765ve-official-strict.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-volvo-tad560-765ve-batch-81-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengVolvoTADStrictDocsBatch81/1.0; +https://engines.haifengmachinery.com)'

const DOCUMENTS = [
  {
    key: 'tad560-561ve',
    publicationId: '47709000',
    listingUrl:
      'https://pubs.volvopenta.com/ProdDocs?Appl=VOF&DetailSegm=Industrial+Versatile&SalesModel=TAD561VE&lang=zh-cn',
    sourceUrl: 'https://pubs.volvopenta.com/publications/47709000',
    cachedPath: '/tmp/volvo-tad560-561ve-product-bulletin.pdf',
    storagePath: 'volvo/legacy/official-product-bulletins/tad560-561ve-47709000.pdf',
    label: 'Volvo Penta TAD560-561VE Industrial Product Bulletin',
    slugs: ['volvo-penta-tad560ve', 'volvo-penta-tad561ve'],
    listingTokens: ['Product bulletin TAD560-561VE', 'publication=47709000'],
    pdfTokens: [
      'VOLVO PENTA INDUSTRIAL DIESEL',
      'TAD560-561VE',
      'Engine designation',
      'Displacement, l (in³)',
      '4.76 (291)',
      'TAD560VE',
      '129',
      '175',
      '2300',
      'TAD561VE',
      '155',
      '212',
      '663',
      '816',
      'EU Stage IIIb / EPA Tier 4i',
    ],
  },
  {
    key: 'tad761-765ve',
    publicationId: '47709001',
    listingUrl:
      'https://pubs.volvopenta.com/ProdDocs?Appl=VOF&DetailSegm=Industrial+Versatile&SalesModel=TAD761VE&lang=zh-cn',
    sourceUrl: 'https://pubs.volvopenta.com/publications/47709001',
    cachedPath: '/tmp/volvo-tad761-765ve-product-bulletin.pdf',
    storagePath: 'volvo/legacy/official-product-bulletins/tad761-765ve-47709001.pdf',
    label: 'Volvo Penta TAD761-765VE Industrial Product Bulletin',
    slugs: [
      'volvo-penta-tad761ve',
      'volvo-penta-tad762ve',
      'volvo-penta-tad763ve',
      'volvo-penta-tad764ve',
      'volvo-penta-tad765ve',
    ],
    listingTokens: ['Product bulletin TAD761-765VE', 'publication=47709001'],
    pdfTokens: [
      'VOLVO PENTA INDUSTRIAL DIESEL',
      'TAD761-765VE',
      'Engine designation',
      'Displacement, l (in³)',
      '7.15 (436)',
      'TAD761VE',
      'TAD762VE',
      'TAD763VE',
      'TAD764VE',
      'TAD765VE',
      '160',
      '185',
      '210',
      '225',
      '235',
      'EU Stage IIIb / EPA Tier 4i',
    ],
  },
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

function normalize(value) {
  return String(value ?? '')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ndash;/gi, '-')
    .replace(/–/g, '-')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function curlEnv() {
  return {
    ...process.env,
    HTTP_PROXY: '',
    HTTPS_PROXY: '',
    ALL_PROXY: '',
    http_proxy: '',
    https_proxy: '',
    all_proxy: '',
  }
}

function fetchText(url) {
  return execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '3',
    '--retry-all-errors',
    '--connect-timeout',
    '30',
    '--max-time',
    '120',
    '--user-agent',
    USER_AGENT,
    url,
  ], {
    encoding: 'utf8',
    env: curlEnv(),
    maxBuffer: 20 * 1024 * 1024,
  })
}

function downloadPdf(document) {
  const localPath = path.join(TMP_DIR, `${document.key}.pdf`)
  if (document.cachedPath && fs.existsSync(document.cachedPath)) {
    fs.copyFileSync(document.cachedPath, localPath)
    return localPath
  }
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '3',
    '--retry-all-errors',
    '--connect-timeout',
    '30',
    '--max-time',
    '240',
    '--user-agent',
    USER_AGENT,
    '--output',
    localPath,
    document.sourceUrl,
  ], {
    env: curlEnv(),
    maxBuffer: 80 * 1024 * 1024,
  })
  return localPath
}

function verifyDocument(document) {
  const listingText = fetchText(document.listingUrl)
  const missingListing = document.listingTokens.filter((token) => !hasToken(listingText, token))
  if (missingListing.length) {
    throw new Error(`${document.listingUrl}: missing listing token(s): ${missingListing.join(', ')}`)
  }

  const localPath = downloadPdf(document)
  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 50_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.sourceUrl}: response is not a usable PDF`)
  }
  const pdfText = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
  })
  const missingPdf = document.pdfTokens.filter((token) => !hasToken(pdfText, token))
  if (missingPdf.length) {
    throw new Error(`${document.sourceUrl}: missing PDF token(s): ${missingPdf.join(', ')}`)
  }

  return {
    ...document,
    localPath,
    fileSizeBytes: buffer.length,
  }
}

async function fetchStrictCoverage(supabase) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, status, pdfs:engine_pdfs(id,type)')
      .range(from, from + 999)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  const legacy = rows.filter((row) => row.status === 'discontinued')
  const strict = legacy.filter((row) =>
    (row.pdfs ?? []).some((pdf) => pdf.type === 'datasheet' || pdf.type === 'brochure'),
  )
  return {
    engineCount: rows.length,
    legacyCount: legacy.length,
    strictCount: strict.length,
    strictPct: Number((strict.length / legacy.length * 100).toFixed(1)),
    strictNeededFor60Percent: Math.max(0, Math.ceil(legacy.length * 0.6) - strict.length),
  }
}

function buildReport({ verifiedDocs, linkedCount, skippedCount, missingEngines, coverageBefore, coverageAfter }) {
  return `# Legacy Engine Document Attachments - Batch 81 Volvo TAD560-765VE Official Strict

Date: 2026-08-12

## Result

- Official Volvo Penta product bulletins verified: \`${verifiedDocs.length}\`
- Strict datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing strict rows: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
- Strict legacy coverage before: \`${coverageBefore.strictCount}/${coverageBefore.legacyCount} (${coverageBefore.strictPct}%)\`
${coverageAfter == null ? '' : `- Strict legacy coverage after: \`${coverageAfter.strictCount}/${coverageAfter.legacyCount} (${coverageAfter.strictPct}%)\`\n- Remaining strict links needed for 60%: \`${coverageAfter.strictNeededFor60Percent}\`\n`}
## Document Attachments

| Document | Type | Official publication | Storage path | Linked rows | Bytes |
| --- | --- | --- | --- | ---: | ---: |
${verifiedDocs.map((doc) => `| ${doc.label} | datasheet | ${doc.sourceUrl} | ${doc.storagePath} | ${doc.slugs.length} | ${doc.fileSizeBytes} |`).join('\n')}

## Linked Engine Rows

| Document | Engine slugs |
| --- | --- |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.slugs.join('<br>')} |`).join('\n')}

## Validation Notes

- This batch is limited to Volvo Penta industrial/off-highway VE product bulletins, not marine engine pages.
- Each official publications listing was validated for the expected publication id and product-bulletin title before the PDF was downloaded.
- PDF validation required a PDF header, file size threshold, Volvo Penta industrial heading, exact model-family heading, engine designation, displacement, emissions text, and exact row-model/rating tokens.
- These rows were already validated as discontinued/legacy owner-search targets in prior Volvo industrial batches; this batch improves strict datasheet coverage with official source PDFs.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: official Volvo Penta TAD560-765VE datasheets`)

const coverageBefore = await fetchStrictCoverage(supabase)
const verifiedDocs = DOCUMENTS.map(verifyDocument)

const slugs = [...new Set(verifiedDocs.flatMap((document) => document.slugs))]
const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .in('slug', slugs)
if (enginesError) throw enginesError

const enginesBySlug = new Map((engines ?? []).map((engine) => [engine.slug, engine]))
const missingEngines = slugs.filter((slug) => !enginesBySlug.has(slug))
if (missingEngines.length) console.warn(`Missing engine rows: ${missingEngines.join(', ')}`)

for (const engine of engines ?? []) {
  if (engine.brand !== 'Volvo Penta') throw new Error(`Unexpected brand for ${engine.slug}`)
  if (engine.status !== 'discontinued') {
    throw new Error(`Refusing to link non-discontinued row: ${engine.slug}`)
  }
}

let linkedCount = 0
let skippedCount = 0

for (const document of verifiedDocs) {
  if (APPLY) {
    const upload = await uploadPdf(supabase, BUCKET, document.localPath, document.storagePath)
    if (!upload.ok) throw new Error(`Upload failed: ${document.storagePath}`)
    document.fileSizeBytes = upload.uploadedSizeBytes ?? document.fileSizeBytes
  }

  for (const slug of document.slugs) {
    const engine = enginesBySlug.get(slug)
    if (!engine) continue

    const { data: existing, error: existingError } = await supabase
      .from('engine_pdfs')
      .select('id,type')
      .eq('engine_id', engine.id)
      .eq('storage_path', document.storagePath)
    if (existingError) throw existingError

    if ((existing ?? []).some((row) => row.type === 'datasheet' || row.type === 'brochure')) {
      skippedCount += 1
      continue
    }

    linkedCount += 1
    if (!APPLY) continue

    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: document.fileSizeBytes,
    })
    if (insertError) throw insertError
  }
}

const coverageAfter = APPLY ? await fetchStrictCoverage(supabase) : null
await fsp.writeFile(
  REPORT_PATH,
  buildReport({ verifiedDocs, linkedCount, skippedCount, missingEngines, coverageBefore, coverageAfter }),
)

console.log(
  `${APPLY ? 'Applied' : 'Dry run complete'}: ${verifiedDocs.length} docs, `
  + `${linkedCount} linked/planned, ${skippedCount} skipped.`,
)
if (coverageAfter) {
  console.log(
    `Strict legacy coverage: ${coverageAfter.strictCount}/${coverageAfter.legacyCount} `
    + `(${coverageAfter.strictPct}%), remaining ${coverageAfter.strictNeededFor60Percent}`,
  )
}
console.log(`Wrote ${REPORT_PATH}`)
