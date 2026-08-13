// Attach source-validated Lister Petter technical data sheets to legacy rows.
//
// Dry run:
//   node data/attach-lister-strict-tds-batch-72-2026-08.mjs
// Apply:
//   node data/attach-lister-strict-tds-batch-72-2026-08.mjs --apply

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
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-72-lister-strict-tds.md'
const TMP_DIR = path.join(os.tmpdir(), 'lister-strict-tds-batch-72-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengListerStrictTDS/1.0; +https://engines.haifengmachinery.com)'
const SOURCE_PAGE = 'https://engine.od.ua/lister'

const DOCUMENTS = [
  {
    key: 'lt-lv-l-series-tds',
    sourceUrl: 'https://engine.od.ua/ufiles/LISTER-PETTER-LT-LV-L-Series-Engines-TDS.pdf',
    sourceNeedle: 'LISTER-PETTER-LT-LV-L-Series-Engines-TDS.pdf',
    storagePath: 'lister-petter/legacy/lister-petter-lt-lv-l-series-engines-tds.pdf',
    label: 'Lister Petter LT/LV L Series Engines Technical Data Sheet',
    type: 'datasheet',
    minBytes: 80_000,
    pageLabel: 'LT, LV',
    slugs: [
      'lister-petter-lt1',
      'lister-petter-lt2',
      'lister-petter-lv1',
      'lister-petter-lv2',
    ],
  },
  {
    key: 'ac-ad-tds',
    sourceUrl: 'https://engine.od.ua/ufiles/LISTER-PETTER-AC-AD-Engines-TDS.pdf',
    sourceNeedle: 'LISTER-PETTER-AC-AD-Engines-TDS.pdf',
    storagePath: 'lister-petter/legacy/lister-petter-ac-ad-engines-tds.pdf',
    label: 'Lister Petter AC/AD Engines Technical Data Sheet',
    type: 'datasheet',
    minBytes: 80_000,
    pageLabel: 'AC1, AD1',
    slugs: [
      'lister-petter-petter-ac1',
    ],
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

function curlArgs(url) {
  return [
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
    url,
  ]
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
  return execFileSync('curl', curlArgs(url), {
    encoding: 'utf8',
    env: curlEnv(),
    maxBuffer: 20 * 1024 * 1024,
  })
}

function verifySourcePage() {
  const text = fetchText(SOURCE_PAGE)
  const missing = []
  for (const document of DOCUMENTS) {
    if (!text.includes(document.sourceNeedle)) missing.push(document.sourceNeedle)
    if (!hasToken(text, document.pageLabel)) missing.push(document.pageLabel)
  }
  if (missing.length) {
    throw new Error(`${SOURCE_PAGE}: missing expected TDS listing token(s): ${missing.join(', ')}`)
  }
  console.log('Verified Engine.od.ua Lister datasheet index')
}

function downloadAndVerifyPdf(document) {
  const localPath = path.join(TMP_DIR, `${document.key}.pdf`)
  execFileSync('curl', [
    ...curlArgs(document.sourceUrl).slice(0, -1),
    '--referer',
    SOURCE_PAGE,
    '--output',
    localPath,
    document.sourceUrl,
  ], {
    env: curlEnv(),
    maxBuffer: 50 * 1024 * 1024,
  })

  const buffer = fs.readFileSync(localPath)
  if (buffer.length < document.minBytes || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.sourceUrl}: response is not a usable PDF`)
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
  return `# Legacy Engine Document Attachments - Batch 72 Lister Strict TDS

Date: 2026-08-12

## Result

- Lister Petter technical data sheets verified: \`${verifiedDocs.length}\`
- Strict datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
- Strict legacy coverage before: \`${coverageBefore.strictCount}/${coverageBefore.legacyCount} (${coverageBefore.strictPct}%)\`
${coverageAfter == null ? '' : `- Strict legacy coverage after: \`${coverageAfter.strictCount}/${coverageAfter.legacyCount} (${coverageAfter.strictPct}%)\`\n- Remaining strict links needed for 60%: \`${coverageAfter.strictNeededFor60Percent}\`\n`}
## Document Attachments

| Document | Source | Storage path | Linked rows |
| --- | --- | --- | ---: |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.sourceUrl} | ${doc.storagePath} | ${doc.slugs.length} |`).join('\n')}

## Linked Engine Rows

| Document | Engine slugs |
| --- | --- |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.slugs.join('<br>')} |`).join('\n')}

## Validation Sources

- ${SOURCE_PAGE}
${verifiedDocs.map((doc) => `- ${doc.label}: ${doc.sourceUrl}`).join('\n')}

## Notes

- Engine.od.ua's Lister page has a separate \`Datasheets\` section and lists the LT/LV and AC/AD TDS files used here.
- The PDF files were validated by source-page listing, PDF header and file-size checks. These Engine.od.ua technical data sheets are image/scanned PDFs, so the exact source-page filename and model listing are used as the primary model validation.
- The AC/AD TDS is linked only to the exact legacy Petter AC1 row in this pass; AC1W/AC2 rows are left untouched until a document naming those water-cooled/twin variants is validated.
- LPWS2/LPWS3/LPWS4 rows are active in the current database, so their LPWS Alpha TDS was intentionally excluded from this legacy-only strict coverage batch.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Lister Petter strict TDS attachments`)
const coverageBefore = await fetchStrictCoverage(supabase)
verifySourcePage()
const verifiedDocs = DOCUMENTS.map(downloadAndVerifyPdf)
for (const doc of verifiedDocs) {
  console.log(`Verified ${doc.label}: ${Math.round(doc.fileSizeBytes / 1024)}KB`)
}

const slugs = [...new Set(DOCUMENTS.flatMap((doc) => doc.slugs))]
const { data: engines, error: engineError } = await supabase
  .from('engines')
  .select('id, slug, brand, model, status')
  .in('slug', slugs)
if (engineError) throw engineError

const engineBySlug = new Map((engines ?? []).map((engine) => [engine.slug, engine]))
const missingEngines = slugs.filter((slug) => !engineBySlug.has(slug))
if (missingEngines.length) console.warn(`Missing engine rows: ${missingEngines.join(', ')}`)

for (const engine of engines ?? []) {
  if (engine.brand !== 'Lister Petter' || engine.status !== 'discontinued') {
    throw new Error(`Refusing to link unexpected row: ${engine.slug} (${engine.brand}, ${engine.status})`)
  }
}

let linkedCount = 0
let skippedCount = 0

for (const doc of verifiedDocs) {
  if (APPLY) {
    const upload = await uploadPdf(supabase, BUCKET, doc.localPath, doc.storagePath)
    if (!upload.ok) throw new Error(`Upload failed: ${doc.storagePath}`)
    doc.fileSizeBytes = upload.uploadedSizeBytes ?? doc.fileSizeBytes
  }

  for (const slug of doc.slugs) {
    const engine = engineBySlug.get(slug)
    if (!engine) continue
    const { data: existing, error: existingError } = await supabase
      .from('engine_pdfs')
      .select('id')
      .eq('engine_id', engine.id)
      .eq('storage_path', doc.storagePath)
    if (existingError) throw existingError
    if ((existing ?? []).length > 0) {
      skippedCount += 1
      continue
    }
    linkedCount += 1
    if (!APPLY) continue
    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: doc.type,
      label: doc.label,
      storage_path: doc.storagePath,
      file_size_bytes: doc.fileSizeBytes,
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
