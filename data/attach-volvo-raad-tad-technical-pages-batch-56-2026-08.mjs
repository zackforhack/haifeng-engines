// Attach exact RAAD archived Volvo Penta TAD technical reference pages where
// the engine rows already exist but surviving Product Bulletin PDFs are absent.
//
// Dry run:
//   node data/attach-volvo-raad-tad-technical-pages-batch-56-2026-08.mjs
// Apply:
//   node data/attach-volvo-raad-tad-technical-pages-batch-56-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-56-volvo-raad-tad-reference-pages.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-volvo-raad-tad-reference-pages-batch-56-2026-08')
const RAAD_BASE = 'https://www.raad-eng.com/techdata/volvo'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyVolvoRaadReferenceProbe/1.0; +https://engines.haifengmachinery.com)'

const DOCUMENTS = [
  referencePage('TAD1030GE', '1500rpm, 266 kW', '1800rpm, 282 kW'),
  referencePage('TAD1031GE', '1800rpm, 285 kW'),
  referencePage('TAD1032GE', '1500rpm, 292 kW', '1800rpm,  287 kW'),
  referencePage('TAD1630GE', '1500rpm, 440 kW', '1800rpm, 482 kW'),
  referencePage('TAD1631GE', '1500rpm, 478 kW', '1800rpm, 558 kW'),
]

function referencePage(model, ...ratingTokens) {
  const pageName = model.toLowerCase()
  return {
    model,
    sourceUrl: `${RAAD_BASE}/engines/${pageName}.html`,
    cachedPath: `/tmp/raad-${pageName}.html`,
    fileName: `raad-${pageName}.html`,
    label: `Volvo Penta ${model} RAAD Archived Technical Reference`,
    storagePath: `${RAAD_BASE}/engines/${pageName}.html`,
    type: 'other',
    requiredTokens: [
      'VOLVO PENTA GENSET ENGINE',
      model,
      ...ratingTokens,
      `${model} is a powerful, reliable and economical Generating Set diesel`,
      'EPA/CARB tier 1',
    ],
  }
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

function download(url, outputPath) {
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
    '120',
    '--user-agent',
    USER_AGENT,
    '--output',
    outputPath,
    url,
  ], {
    env: {
      ...process.env,
      HTTP_PROXY: '',
      HTTPS_PROXY: '',
      ALL_PROXY: '',
      http_proxy: '',
      https_proxy: '',
      all_proxy: '',
    },
    maxBuffer: 20 * 1024 * 1024,
  })
}

function verifyDocument(document) {
  const localPath = path.join(TMP_DIR, document.fileName)
  if (document.cachedPath && fs.existsSync(document.cachedPath)) {
    fs.copyFileSync(document.cachedPath, localPath)
  } else {
    download(document.sourceUrl, localPath)
  }

  const html = fs.readFileSync(localPath, 'latin1')
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const missing = document.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${document.sourceUrl}: missing validation token(s): ${missing.join(', ')}`)
  }

  return {
    ...document,
    localPath,
    fileSizeBytes: Buffer.byteLength(html, 'latin1'),
  }
}

async function countLegacyCoverage(supabase) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, status, pdfs:engine_pdfs(id)')
      .eq('status', 'discontinued')
      .range(from, from + 999)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return {
    legacyCount: rows.length,
    legacyWithPdf: rows.filter((engine) => (engine.pdfs ?? []).length > 0).length,
  }
}

function buildReport({ verifiedDocs, actionRows, skippedRows, missingRows, afterCount, coverage }) {
  return `# Legacy Engine Document Attachments - Batch 56 Volvo RAAD TAD Reference Pages

Date: 2026-08-12

## Result

- Exact RAAD Volvo Penta TAD reference pages reviewed: \`${verifiedDocs.length}\`
- Reference links ${APPLY ? 'inserted' : 'planned'}: \`${actionRows.length}\`
- Links skipped as existing: \`${skippedRows.length}\`
- Missing target engine rows: \`${missingRows.length}\`
${afterCount == null ? '' : `- Engine count after attachment: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after attachment: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## Reference Attachments

| Model | Source | Link type | Verification |
| --- | --- | --- | --- |
${verifiedDocs.map((doc) => `| ${doc.model} | ${doc.sourceUrl} | Technical reference page | Exact model, Volvo Penta genset heading, rpm/kW rating, and EPA/CARB tier 1 text verified. |`).join('\n')}

## Linked Engine Rows

| Model | Slug | Document | Status |
| --- | --- | --- | --- |
${actionRows.map((row) => `| ${row.model} | ${row.slug} | ${row.label} | ${APPLY ? 'linked' : 'planned'} |`).join('\n')}

## Missing Rows

${missingRows.length ? missingRows.map((row) => `- ${row.model}: ${row.reason}`).join('\n') : '- None.'}

## Notes

- These RAAD pages are archived technical reference pages, not surviving Product Bulletin PDFs. They are stored as external URLs and rendered directly by the frontend.
- The batch intentionally links only existing Volvo Penta rows already marked \`discontinued\`; no marine models are included.
- The corresponding Product Bulletin links were previously probed and were unavailable, so these exact source pages preserve useful owner-search evidence without fabricating datasheets.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const verifiedDocs = DOCUMENTS.map(verifyDocument)
const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const models = verifiedDocs.map((doc) => doc.model)
const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .eq('brand', 'Volvo Penta')
  .in('model', models)
if (enginesError) throw enginesError

const enginesByModel = new Map((engines ?? []).map((engine) => [normalize(engine.model), engine]))
const actionRows = []
const skippedRows = []
const missingRows = []

for (const document of verifiedDocs) {
  const engine = enginesByModel.get(normalize(document.model))
  if (!engine) {
    missingRows.push({ model: document.model, reason: 'No matching Volvo Penta engine row exists.' })
    continue
  }
  if (engine.status !== 'discontinued') {
    missingRows.push({ model: document.model, reason: `Engine row exists but status is ${engine.status}.` })
    continue
  }

  const { data: existingLinks, error: existingLinksError } = await supabase
    .from('engine_pdfs')
    .select('id')
    .eq('engine_id', engine.id)
    .eq('storage_path', document.storagePath)
  if (existingLinksError) throw existingLinksError

  const reportRow = {
    model: engine.model,
    slug: engine.slug,
    label: document.label,
  }

  if (existingLinks?.length) {
    skippedRows.push(reportRow)
    continue
  }

  if (APPLY) {
    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: document.type,
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: document.fileSizeBytes,
    })
    if (insertError) throw insertError
  }
  actionRows.push(reportRow)
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = await countLegacyCoverage(supabase)
await fsp.writeFile(
  REPORT_PATH,
  buildReport({
    verifiedDocs,
    actionRows,
    skippedRows,
    missingRows,
    afterCount: APPLY ? afterCount : null,
    coverage: APPLY ? coverage : null,
  }),
)

console.log(`Validated RAAD reference pages: ${verifiedDocs.length}.`)
console.log(`${APPLY ? 'Linked' : 'Planned'} reference links: ${actionRows.length}.`)
console.log(`Skipped existing links: ${skippedRows.length}.`)
console.log(`Missing target rows: ${missingRows.length}.`)
console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
