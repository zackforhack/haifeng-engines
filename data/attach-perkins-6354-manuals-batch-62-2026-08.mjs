// Attach exact public manual pages to remaining Perkins 6.354-family legacy rows.
//
// Dry run:
//   node data/attach-perkins-6354-manuals-batch-62-2026-08.mjs
// Apply:
//   node data/attach-perkins-6354-manuals-batch-62-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-62-perkins-6354.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-perkins-6354-batch-62-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyPerkins6354/1.0; +https://engines.haifengmachinery.com)'

const MANUALSLIB_6354 = 'https://www.manualslib.com/manual/3832721/Perkins-6-354.html'
const MANUALSLIB_T6354 = 'https://www.manualslib.com/manual/3832722/Perkins-T6-354.html'
const DPD_6354_SERVICE_MANUAL = 'https://www.dieselpartsdirect.com/sm6354'

const DOCUMENT_TARGETS = [
  {
    model: '6.354',
    documents: [
      {
        label: 'Perkins 6.354 Operator Manual',
        storagePath: MANUALSLIB_6354,
        type: 'manual',
        fileKey: 'manual6354',
      },
      {
        label: 'Perkins 6.354 Service Manual Page',
        storagePath: DPD_6354_SERVICE_MANUAL,
        type: 'manual',
        fileKey: 'serviceManual6354',
      },
    ],
  },
  {
    model: 'T6.354',
    documents: [
      {
        label: 'Perkins T6.354 Operator Manual',
        storagePath: MANUALSLIB_T6354,
        type: 'manual',
        fileKey: 'manualT6354',
      },
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
  return `# Legacy Engine Document Attachments - Batch 62 Perkins 6.354

Date: 2026-08-12

## Result

- Exact Perkins legacy targets reviewed: \`${DOCUMENT_TARGETS.length}\`
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

- ${MANUALSLIB_6354}
- ${MANUALSLIB_T6354}
- ${DPD_6354_SERVICE_MANUAL}

## Evidence Notes

- ManualsLib page title/meta validates exact \`Perkins 6.354 Operator's Manual\` identity and \`6.354 engine pdf manual download\`.
- ManualsLib page title/meta validates exact \`Perkins T6.354 Operator's Manual\` identity and \`T6.354 engine pdf manual download\`.
- Diesel Parts Direct validates an exact \`Perkins 6.354 Service Manual\` page and states it is for \`6.354 Engines\`.
- This batch attaches documents only to existing discontinued rows; no new model rows are inserted.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const verifiedFiles = {
  manual6354: verifyHtml({
    url: MANUALSLIB_6354,
    fileName: 'manualslib-perkins-6354.html',
    cachedPath: '/tmp/manualslib-perkins-6354-current.html',
    requiredTokens: [
      'PERKINS 6.354 OPERATOR',
      '6.354 engine pdf manual download',
      'Perkins 6.354 Operator',
      'Perkins Engine Manuals',
    ],
  }),
  manualT6354: verifyHtml({
    url: MANUALSLIB_T6354,
    fileName: 'manualslib-perkins-t6354.html',
    cachedPath: '/tmp/manualslib-perkins-t6354-current.html',
    requiredTokens: [
      'PERKINS T6.354 OPERATOR',
      'T6.354 engine pdf manual download',
      'Perkins T6.354 Operator',
      'Perkins Engine Manuals',
    ],
  }),
  serviceManual6354: verifyHtml({
    url: DPD_6354_SERVICE_MANUAL,
    fileName: 'dieselpartsdirect-perkins-6354.html',
    cachedPath: '/tmp/dieselpartsdirect-perkins-6354-current.html',
    requiredTokens: [
      'PERKINS 6.354 SERVICE MANUAL',
      'Perkins Service Manual For 6.354 Engines',
      'Diesel Parts Direct',
      'Authorized Perkins Service Dealer',
    ],
  }),
}

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Perkins 6.354 exact manual attachment batch`)

const engines = await fetchAllEngines(supabase)
const linkedRows = []
const skippedRows = []
const missingTargets = []

for (const target of DOCUMENT_TARGETS) {
  const engine = engines.find(
    (row) => row.brand === 'Perkins' && normalize(row.model) === normalize(target.model),
  )

  if (!engine) {
    missingTargets.push({ model: target.model, reason: 'No matching Perkins row exists.' })
    continue
  }

  if (engine.status !== 'discontinued') {
    missingTargets.push({ model: target.model, reason: `Engine row exists but status is ${engine.status}.` })
    continue
  }

  for (const document of target.documents) {
    const { data: existingLinks, error: existingLinksError } = await supabase
      .from('engine_pdfs')
      .select('id')
      .eq('engine_id', engine.id)
      .eq('storage_path', document.storagePath)
    if (existingLinksError) throw existingLinksError

    const row = {
      model: target.model,
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
        file_size_bytes: verifiedFiles[document.fileKey].fileSizeBytes,
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
