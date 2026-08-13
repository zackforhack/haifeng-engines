// Attach exact Caterpillar legacy service-manual reference pages to existing discontinued rows.
//
// Dry run:
//   node data/attach-cat-legacy-coverage-crossing-batch-68-2026-08.mjs
// Apply:
//   node data/attach-cat-legacy-coverage-crossing-batch-68-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-68-cat-coverage-crossing.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-cat-coverage-crossing-batch-68-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyCatDocs/1.0; +https://engines.haifengmachinery.com)'

const SOURCES = {
  cat3204:
    'https://qualityservicemanual.com/2257/caterpillar-3204-engines-factory-service-shop-manual',
  catD333c:
    'https://therepairmanual.com/cat/caterpillar-cat-d333c-marine-engine-service-repair-manual-67d00001-and-up/',
  cat3406:
    'https://qualityservicemanual.com/2261/caterpillar-3406-3406b-engines-factory-service-shop-manual',
  cat3408:
    'https://qualityservicemanual.com/1984/caterpillar-3408-3408b-3412-engines-factory-service-shop-manual',
  cat3408c:
    'https://qualityservicemanual.com/2263/caterpillar-3408c-3412c-3412d-engines-factory-service-shop-manual',
}

const SOURCE_VALIDATIONS = [
  {
    key: 'cat3204',
    url: SOURCES.cat3204,
    fileName: 'qualityservice-cat-3204.html',
    requiredTokens: [
      'Caterpillar 3204 Engines Factory Service & Shop Manual',
      '3204',
      'SENR3003 - Specifications (3204 Industrial Engines)',
      'SENR3004 - General Service Information (3204 Industrial Engines)',
    ],
  },
  {
    key: 'catD333c',
    url: SOURCES.catD333c,
    fileName: 'therepairmanual-cat-d333c.html',
    requiredTokens: [
      'Caterpillar CAT D333C Marine Engine Service Repair Manual',
      '67D00001 and up',
      'detailed repair instructions',
      'maintenance procedures',
    ],
  },
  {
    key: 'cat3406',
    url: SOURCES.cat3406,
    fileName: 'qualityservice-cat-3406-3406b.html',
    requiredTokens: [
      'Caterpillar 3406 & 3406B Engines Factory Service & Shop Manual',
      '3406',
      '3406B',
      'SENR4022 - Specifications (3406B Industrial & Marine Engines)',
      'SENR4026 - Disassembly & Assembly (3406B Industrial & Marine Engines)',
    ],
  },
  {
    key: 'cat3408',
    url: SOURCES.cat3408,
    fileName: 'qualityservice-cat-3408-3408b-3412.html',
    requiredTokens: [
      'Caterpillar 3408, 3408B, 3412 Engines Factory Service & Shop Manual',
      '3408B',
      '3408B INDUSTRIAL ENGINE',
      'SENR7382 - Disassembly & Assembly (3408 & 3408B Industrial & Marine Engines)',
    ],
  },
  {
    key: 'cat3408c',
    url: SOURCES.cat3408c,
    fileName: 'qualityservice-cat-3408c-3412c-3412d.html',
    requiredTokens: [
      'Caterpillar 3408C, 3412C, 3412D Engines Factory Service & Shop Manual',
      '3408C',
      'SENR7380 - Specifications (3408B & 3408C Industrial & Marine Engines)',
      'SENR6476 - Systems Operation (3408C ENGINE FOR CATERPILLAR BUILT MACHINES)',
    ],
  },
]

const DOCUMENTS = [
  {
    key: 'cat3204',
    label: 'Caterpillar 3204 Factory Service & Shop Manual Reference Page',
    storagePath: SOURCES.cat3204,
    type: 'manual',
    models: ['3204'],
  },
  {
    key: 'catD333c',
    label: 'Caterpillar D333C Marine Engine Service Repair Manual Reference Page',
    storagePath: SOURCES.catD333c,
    type: 'manual',
    models: ['D333C'],
  },
  {
    key: 'cat3406',
    label: 'Caterpillar 3406 / 3406B Factory Service & Shop Manual Reference Page',
    storagePath: SOURCES.cat3406,
    type: 'manual',
    models: ['3406 Industrial', '3406B'],
  },
  {
    key: 'cat3408',
    label: 'Caterpillar 3408 / 3408B / 3412 Factory Service & Shop Manual Reference Page',
    storagePath: SOURCES.cat3408,
    type: 'manual',
    models: ['3408B'],
  },
  {
    key: 'cat3408c',
    label: 'Caterpillar 3408C / 3412C / 3412D Factory Service & Shop Manual Reference Page',
    storagePath: SOURCES.cat3408c,
    type: 'manual',
    models: ['3408C'],
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
  return String(value ?? '').replace(/&amp;/gi, '&').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function download(url, outputPath) {
  execFileSync('curl', [
    '--http1.1',
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

function verifyHtml({ key, url, fileName, requiredTokens }) {
  const localPath = path.join(TMP_DIR, fileName)
  download(url, localPath)
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${url}: missing validation token(s): ${missing.join(', ')}`)
  return {
    key,
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
  return `# Legacy Engine Document Attachments - Batch 68 Caterpillar Coverage Crossing

Date: 2026-08-12

## Result

- Exact Caterpillar legacy targets reviewed: \`${targetCount}\`
- Manual/reference links ${APPLY ? 'inserted' : 'planned'}: \`${linkedRows.length}\`
- Links skipped as existing: \`${skippedRows.length}\`
- Missing/rejected targets: \`${missingTargets.length}\`
${afterCount == null ? '' : `- Engine count after attachments: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after attachments: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## Manual Attachments

| Model | Document | Source | Target slug |
| --- | --- | --- | --- |
${linkedRows.map((row) => `| ${row.model} | ${row.label} | ${row.storagePath} | ${row.slug} |`).join('\n') || '| - | - | - | - |'}

## Existing Links Skipped

${skippedRows.map((row) => `- ${row.model} (${row.slug}): ${row.label}`).join('\n') || '- None'}

## Missing/Rejected Targets

${missingTargets.map((row) => `- ${row.model}: ${row.reason}`).join('\n') || '- None'}

## Validation Sources

${SOURCE_VALIDATIONS.map((source) => `- ${source.url}`).join('\n')}

## Evidence Notes

- Quality Service Manual validates exact service-manual coverage for \`3204\`, \`3406\`, \`3406B\`, \`3408B\`, and \`3408C\` with explicit model fields and manual file lists.
- The Repair Manual validates exact \`D333C\` service-repair manual coverage for serial range \`67D00001 and up\`.
- This batch intentionally does not infer coverage for unrelated 3412, 3406C, or marine-only rows beyond the exact target rows listed above.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const verifiedFiles = Object.fromEntries(
  SOURCE_VALIDATIONS.map((source) => {
    const verified = verifyHtml(source)
    return [source.key, verified]
  }),
)

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Caterpillar exact legacy manual attachment batch`)

const engines = await fetchAllEngines(supabase)
const linkedRows = []
const skippedRows = []
const missingTargets = []

for (const document of DOCUMENTS) {
  for (const model of document.models) {
    const engine = engines.find(
      (row) => row.brand === 'Caterpillar' && normalize(row.model) === normalize(model),
    )

    if (!engine) {
      missingTargets.push({ model, reason: 'No matching Caterpillar row exists.' })
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
