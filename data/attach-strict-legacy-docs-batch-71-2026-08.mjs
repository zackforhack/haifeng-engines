// Attach strict datasheet/brochure references to source-validated legacy rows.
//
// Dry run:
//   node data/attach-strict-legacy-docs-batch-71-2026-08.mjs
// Apply:
//   node data/attach-strict-legacy-docs-batch-71-2026-08.mjs --apply

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
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-71-strict-spec-brochure.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-strict-docs-batch-71-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyStrictDocs/1.0; +https://engines.haifengmachinery.com)'

const HINO_J08_URL =
  'https://web.archive.org/web/20210417214453id_/https://www.barringtondieselclub.co.za/hino/j08/hino-j08c-j08e-spec-sheet.pdf'
const DETROIT_1979_INDEX =
  'https://oldcarmanualproject.com/brochures/Detroit%20Diesel/1979/Engine%20Specs/'

const DOCUMENTS = [
  {
    key: 'hino-j08c-j08e',
    mode: 'pdf',
    sourceUrl: HINO_J08_URL,
    storagePath: 'hino/spec-sheets/j08c-j08e.pdf',
    label: 'Hino J08C/J08E Engine Spec Sheet',
    type: 'datasheet',
    requiredTokens: ['HINO J08', 'J08C', 'J08E', 'Engine specifications', 'Displacement'],
    slugs: ['hino-j08c'],
  },
  {
    key: 'detroit-71-92-1979',
    mode: 'external-page',
    sourceUrl: DETROIT_1979_INDEX,
    storagePath: DETROIT_1979_INDEX,
    label: 'Detroit Diesel 1979 Series 71/92 Engine Specs Brochure',
    type: 'brochure',
    requiredTokens: [
      'Detroit Diesel Engine Specs Brochure - 1979',
      'Brochure detailing Series 71 and 92 Series Detroit Diesels',
      'Detroit Diesel Truck Engines Specs 03-79 Foldout_Page_1',
      'Detroit Diesel Truck Engines Specs 03-79 Foldout_Page_4',
    ],
    slugs: [
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
    notes:
      'Linked to the source-hosted brochure index rather than copying image pages, respecting the source page request not to copy site material without asking.',
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

function download(url, outputPath) {
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
    outputPath,
    url,
  ], {
    maxBuffer: 80 * 1024 * 1024,
  })
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
    maxBuffer: 20 * 1024 * 1024,
  })
}

function verifyPdf(document) {
  const localPath = path.join(TMP_DIR, `${document.key}.pdf`)
  download(document.sourceUrl, localPath)
  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 50_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.sourceUrl}: response is not a usable PDF`)
  }
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
  })
  const missing = document.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${document.sourceUrl}: missing PDF token(s): ${missing.join(', ')}`)
  }
  return {
    localPath,
    fileSizeBytes: buffer.length,
  }
}

function verifyExternalPage(document) {
  const text = fetchText(document.sourceUrl)
  const missing = document.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${document.sourceUrl}: missing page token(s): ${missing.join(', ')}`)
  }
  return {
    localPath: null,
    fileSizeBytes: text.length,
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
  return `# Legacy Engine Document Attachments - Batch 71 Strict Spec/Brochure

Date: 2026-08-12

## Result

- Strict datasheet/brochure documents verified: \`${verifiedDocs.length}\`
- Strict document links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
- Strict legacy coverage before: \`${coverageBefore.strictCount}/${coverageBefore.legacyCount} (${coverageBefore.strictPct}%)\`
${coverageAfter == null ? '' : `- Strict legacy coverage after: \`${coverageAfter.strictCount}/${coverageAfter.legacyCount} (${coverageAfter.strictPct}%)\`\n- Remaining strict links needed for 60%: \`${coverageAfter.strictNeededFor60Percent}\`\n`}
## Document Attachments

| Document | Type | Source | Storage / URL | Linked rows |
| --- | --- | --- | --- | ---: |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.type} | ${doc.sourceUrl} | ${doc.storagePath} | ${doc.slugs.length} |`).join('\n')}

## Linked Engine Rows

| Document | Engine slugs |
| --- | --- |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.slugs.join('<br>')} |`).join('\n')}

## Validation Notes

- Hino J08C/J08E was verified from an archived Barrington Diesel Club PDF by PDF header, file size, extracted text, and exact J08C/J08E/specification tokens.
- Detroit Diesel 1979 Series 71/92 is linked as a source-hosted brochure page. The index page names the 1979 Detroit Diesel Engine Specs brochure and states it covers Series 71 and 92; the page is linked directly rather than copied into our storage.
${verifiedDocs.filter((doc) => doc.notes).map((doc) => `- ${doc.notes}`).join('\n')}
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: strict legacy datasheet/brochure attachments`)

const coverageBefore = await fetchStrictCoverage(supabase)
const verifiedDocs = DOCUMENTS.map((document) => ({
  ...document,
  ...(document.mode === 'pdf' ? verifyPdf(document) : verifyExternalPage(document)),
}))

const slugs = [...new Set(DOCUMENTS.flatMap((document) => document.slugs))]
const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .in('slug', slugs)
if (enginesError) throw enginesError

const enginesBySlug = new Map((engines ?? []).map((engine) => [engine.slug, engine]))
const missingEngines = slugs.filter((slug) => !enginesBySlug.has(slug))
if (missingEngines.length) console.warn(`Missing engine rows: ${missingEngines.join(', ')}`)

for (const engine of engines ?? []) {
  if (engine.status !== 'discontinued') {
    throw new Error(`Refusing to link non-discontinued row: ${engine.slug}`)
  }
}

let linkedCount = 0
let skippedCount = 0

for (const document of verifiedDocs) {
  if (APPLY && document.mode === 'pdf') {
    const upload = await uploadPdf(supabase, BUCKET, document.localPath, document.storagePath)
    if (!upload.ok) throw new Error(`Upload failed: ${document.storagePath}`)
    document.fileSizeBytes = upload.uploadedSizeBytes ?? document.fileSizeBytes
  }

  for (const slug of document.slugs) {
    const engine = enginesBySlug.get(slug)
    if (!engine) continue

    const { data: existing, error: existingError } = await supabase
      .from('engine_pdfs')
      .select('id')
      .eq('engine_id', engine.id)
      .eq('storage_path', document.storagePath)
    if (existingError) throw existingError

    if ((existing ?? []).length > 0) {
      skippedCount += 1
      continue
    }

    linkedCount += 1
    if (!APPLY) continue

    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: document.type,
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
