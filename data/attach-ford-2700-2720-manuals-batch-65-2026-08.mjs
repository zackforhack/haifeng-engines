// Attach exact Ford 2700/2720 legacy manual reference pages to existing discontinued rows.
//
// Dry run:
//   node data/attach-ford-2700-2720-manuals-batch-65-2026-08.mjs
// Apply:
//   node data/attach-ford-2700-2720-manuals-batch-65-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-65-ford-2700-2720.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-ford-2700-2720-batch-65-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyFord27002720/1.0; +https://engines.haifengmachinery.com)'

const CLASSIC_MACHINERY_2700 =
  'https://www.classicmachinery.net/forum/app.php/dl_ext/?df_id=711&view=detail'
const MDB_FORD_MANUALS =
  'https://marinedieselbasics.com/diesel-engine-manuals/ford-diesel-engine-manuals/'

const DOCUMENTS = [
  {
    key: 'ford2700',
    label: 'Ford 2700-Series Service Manual Reference Page',
    storagePath: CLASSIC_MACHINERY_2700,
    type: 'manual',
    models: [
      '2701C',
      '2701E',
      '2703E',
      '2704E',
      '2704ET',
      '2711E',
      '2712E',
      '2713E',
      '2714E',
      '2715E',
    ],
  },
  {
    key: 'ford2720',
    label: 'Ford 2720 Range Operator/Service Manual Reference Page',
    storagePath: MDB_FORD_MANUALS,
    type: 'manual',
    models: ['2723', '2725', '2726T', '2728T'],
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

function verifyHtml({ url, fileName, cachedPath, requiredTokens }) {
  const localPath = path.join(TMP_DIR, fileName)
  download(url, localPath, cachedPath)
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${url}: missing validation token(s): ${missing.join(', ')}`)
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
  const targetCount = DOCUMENTS.reduce((sum, document) => sum + document.models.length, 0)
  return `# Legacy Engine Document Attachments - Batch 65 Ford 2700 / 2720

Date: 2026-08-12

## Result

- Exact Ford legacy targets reviewed: \`${targetCount}\`
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

## Validation Sources

- ${CLASSIC_MACHINERY_2700}
- ${MDB_FORD_MANUALS}

## Evidence Notes

- Classic Machinery validates exact \`Ford 2700-Series service manual\` coverage for \`2701E\`, \`2703E\`, \`2704E\`, \`2704ET\`, \`2701C\`, \`2711E\`, \`2712E\`, \`2713E\`, \`2714E\`, and \`2715E\`.
- Marine Diesel Basics validates Ford manual-page coverage for a \`Ford 2720 Diesel Engine Operator Manual\`, \`Operator Handbook / 2720 Range\`, and exact models \`2723\`, \`2725\`, \`2726T\`, and \`2728T\`.
- This batch intentionally leaves \`2722E\` unlinked because the accessible source validates \`2720\` and not the exact \`2722E\` database row.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const verifiedFiles = {
  ford2700: verifyHtml({
    url: CLASSIC_MACHINERY_2700,
    fileName: 'classicmachinery-ford-2700.html',
    cachedPath: '/tmp/classicmachinery-ford-2700-current.html',
    requiredTokens: [
      'Ford 2700-Series service manual',
      'Ford 2701E',
      'Ford 2703E',
      'Ford 2704E',
      'Ford 2704ET',
      'Ford 2701C',
      'Ford 2711E',
      'Ford 2712E',
      'Ford 2713E',
      'Ford 2714E',
      'Ford 2715E',
      'ford_2700-range_dieselengine_workshopmanual',
    ],
  }),
  ford2720: verifyHtml({
    url: MDB_FORD_MANUALS,
    fileName: 'marinedieselbasics-ford-manuals.html',
    cachedPath: '/tmp/marinedieselbasics-ford-manuals-current.html',
    requiredTokens: [
      'Ford Diesel Engine Manuals',
      'Ford 2720 Diesel Engine Operator Manual',
      'Operator Handbook',
      '2720 Range',
      '2723',
      '2725',
      '2726T',
      '2728T',
      'Ford 2720 Diesel Engine Service Manual',
    ],
  }),
}

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Ford 2700/2720 exact manual attachment batch`)

const engines = await fetchAllEngines(supabase)
const linkedRows = []
const skippedRows = []
const missingTargets = []

for (const document of DOCUMENTS) {
  for (const model of document.models) {
    const engine = engines.find(
      (row) => row.brand === 'Ford' && normalize(row.model) === normalize(model),
    )

    if (!engine) {
      missingTargets.push({ model, reason: 'No matching Ford row exists.' })
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
      .eq('storage_path', document.storagePath)
    if (existingLinksError) throw existingLinksError

    const row = {
      model,
      slug: engine.slug,
      label: document.label,
      storagePath: document.storagePath,
    }

    if (existingLinks?.length) {
      skippedRows.push(row)
      continue
    }

    if (APPLY) {
      const { error: insertError } = await supabase.from('engine_pdfs').insert({
        engine_id: engine.id,
        type: document.type,
        label: document.label,
        storage_path: document.storagePath,
        file_size_bytes: verifiedFiles[document.key].fileSizeBytes,
      })
      if (insertError) throw insertError
    }

    linkedRows.push(row)
  }
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
