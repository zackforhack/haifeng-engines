// Attach exact IHC large D/DT diesel service-manual reference page to existing legacy rows.
//
// Dry run:
//   node data/attach-international-large-dt-manuals-batch-64-2026-08.mjs
// Apply:
//   node data/attach-international-large-dt-manuals-batch-64-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-64-international-large-dt.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-international-large-dt-batch-64-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyInternationalLargeDT/1.0; +https://engines.haifengmachinery.com)'

const SOURCE_URL =
  'https://www.auto-repair-manuals.com/IHC-Tractor-D312-D360-DT360-D414-DT414-D436-DT436-D466-DT466-DT466B-DTI466B-Diesel-Engine-Service-Manual.html'

const DOCUMENT = {
  label: 'IHC Tractor D312/D360/DT360/D414/DT414/D436/DT436/D466/DT466/DT466B/DTI466B Service Manual Page',
  storagePath: SOURCE_URL,
  type: 'manual',
}

const DOCUMENT_TARGET_MODELS = [
  'D-312',
  'D-360',
  'DT360',
  'D-414',
  'DT-414',
  'D-436',
  'DT-436',
  'D-466',
  'DT466',
  'DT-466B',
  'DTI-466B',
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
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function download(url, outputPath, cachedPath) {
  if (cachedPath && fs.existsSync(cachedPath)) {
    fs.copyFileSync(cachedPath, outputPath)
    return
  }

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
    maxBuffer: 50 * 1024 * 1024,
  })
}

function verifySource() {
  const localPath = path.join(TMP_DIR, 'autorepairmanuals-ih-large-dt.html')
  download(SOURCE_URL, localPath, '/tmp/autorepairmanuals-ih-large-current.html')
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = [
    'IHC Tractor D312 D/DT360 D/DT414 D/DT436 D/DT466 DT466B DTI466B Diesel Engine Service Manual',
    'Repair',
    'Service information for International Tractor',
    'Combine',
    'Diesel Engines',
    'D312',
    'D360',
    'DT360',
    'D414',
    'DT414',
    'D436',
    'DT436',
    'D466',
    'DT466',
    'DT466B',
    'DTI466B',
    'published in 1982',
    'engines up to 1982',
  ].filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${SOURCE_URL}: missing validation token(s): ${missing.join(', ')}`)
  return {
    localPath,
    fileSizeBytes: Buffer.byteLength(text, 'utf8'),
  }
}

async function fetchAllEngines(supabase) {
  const engines = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, brand, model, slug, status')
      .range(from, from + 999)
    if (error) throw error
    engines.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return engines
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

function buildReport({ linkedRows, skippedRows, missingTargets, afterCount, coverage }) {
  return `# Legacy Engine Document Attachments - Batch 64 International Large D/DT

Date: 2026-08-12

## Result

- Exact International large D/DT legacy targets reviewed: \`${DOCUMENT_TARGET_MODELS.length}\`
- Manual/reference links ${APPLY ? 'inserted' : 'planned'}: \`${linkedRows.length}\`
- Links skipped as existing: \`${skippedRows.length}\`
- Missing/rejected targets: \`${missingTargets.length}\`
${afterCount == null ? '' : `- Engine count after attachments: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after attachments: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## Manual Attachments

| Document | Source | Target slug |
| --- | --- | --- |
${linkedRows.map((row) => `| ${row.label} | ${row.storagePath} | ${row.slug} |`).join('\n') || '| - | - | - |'}

## Existing Links Skipped

${skippedRows.map((row) => `- ${row.slug}: ${row.label}`).join('\n') || '- None'}

## Missing/Rejected Targets

${missingTargets.map((row) => `- ${row.model}: ${row.reason}`).join('\n') || '- None'}

## Validation Source

- ${SOURCE_URL}

## Evidence Notes

- The source page validates exact \`IHC Tractor D312 D/DT360 D/DT414 D/DT436 D/DT466 DT466B DTI466B Diesel Engine Service Manual\` identity.
- The page states the manual provides repair and service information for International tractor/combine diesel engines and lists exact covered models: \`D312\`, \`D360 / DT360\`, \`D414 / DT414\`, \`D436 / DT436\`, \`D466 / DT466\`, \`DT466B\`, and \`DTI466B\`.
- It also states the paperback service manual was published in 1982 and covers out-of-chassis overhaul procedures for engines up to 1982.
- This is a document-coverage batch only. It does not add \`DT-414B\` or \`DT-436B\` because this source does not name those variants.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const verified = verifySource()
const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: International large D/DT manual attachment batch`)

const engines = await fetchAllEngines(supabase)
const linkedRows = []
const skippedRows = []
const missingTargets = []

for (const model of DOCUMENT_TARGET_MODELS) {
  const engine = engines.find(
    (row) => row.brand === 'International' && normalize(row.model) === normalize(model),
  )

  if (!engine) {
    missingTargets.push({ model, reason: 'No matching International row exists.' })
    continue
  }

  if (engine.status !== 'discontinued') {
    missingTargets.push({ model, reason: `Engine row exists but status is ${engine.status}.` })
    continue
  }

  const { data: existingLinks, error: existingLinksError } = await supabase
    .from('engine_pdfs')
    .select('id')
    .eq('engine_id', engine.id)
    .eq('storage_path', DOCUMENT.storagePath)
  if (existingLinksError) throw existingLinksError

  const row = {
    model,
    slug: engine.slug,
    label: DOCUMENT.label,
    storagePath: DOCUMENT.storagePath,
  }

  if (existingLinks?.length) {
    skippedRows.push(row)
    continue
  }

  if (APPLY) {
    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: DOCUMENT.type,
      label: DOCUMENT.label,
      storage_path: DOCUMENT.storagePath,
      file_size_bytes: verified.fileSizeBytes,
    })
    if (insertError) throw insertError
  }

  linkedRows.push(row)
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = await countLegacyCoverage(supabase)
await fsp.writeFile(
  REPORT_PATH,
  buildReport({
    linkedRows,
    skippedRows,
    missingTargets,
    afterCount: APPLY ? afterCount : null,
    coverage: APPLY ? coverage : null,
  }),
)

console.log(`${APPLY ? 'Linked' : 'Planned'} manual/reference links: ${linkedRows.length}.`)
console.log(`Existing links skipped: ${skippedRows.length}.`)
console.log(`Missing/rejected targets: ${missingTargets.length}.`)
console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
