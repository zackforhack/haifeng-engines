// Attach source-validated Volvo industrial TAD legacy manual references.
//
// Dry run:
//   node data/attach-volvo-tad-industrial-manuals-batch-55-2026-08.mjs
// Apply:
//   node data/attach-volvo-tad-industrial-manuals-batch-55-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-55-volvo-tad-industrial-manuals.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-volvo-tad-industrial-manuals-batch-55-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyVolvoTadDocProbe/1.0; +https://engines.haifengmachinery.com)'

const DOCUMENTS = [
  {
    key: 'tad560ve-operator',
    sourceUrl: 'https://www.manualslib.com/manual/3022152/Volvo-Penta-Tad560ve.html',
    cachedPath: '/tmp/manualslib-volvo-tad560ve.html',
    fileName: 'manualslib-volvo-tad560ve.html',
    label: 'Volvo Penta TAD560/TAD761 Industrial Operator Manual',
    storagePath: 'https://www.manualslib.com/manual/3022152/Volvo-Penta-Tad560ve.html',
    type: 'manual',
    models: ['TAD560VE', 'TAD561VE', 'TAD761VE', 'TAD762VE', 'TAD763VE', 'TAD764VE', 'TAD765VE'],
    requiredTokens: [
      'Volvo Penta TAD560VE Operator',
      'TAD560VE, TAD561VE',
      'TAD761VE, TAD762VE, TAD763VE, TAD764VE, TAD765VE',
      'industrial engines',
      'common rail fuel injection',
    ],
    verification:
      'ManualsLib page title/meta and manual text list exact TAD560VE/TAD561VE/TAD761VE-TAD765VE industrial engine coverage.',
  },
  {
    key: 'tad650ve-workshop',
    sourceUrl: 'https://www.manualslib.com/manual/1622503/Volvo-Tad650ve.html',
    cachedPath: '/tmp/manualslib-volvo-tad650ve.html',
    fileName: 'manualslib-volvo-tad650ve.html',
    label: 'Volvo TAD650/TAD660/TAD734/TAD750/TAD760 Industrial Workshop Manual',
    storagePath: 'https://www.manualslib.com/manual/1622503/Volvo-Tad650ve.html',
    type: 'manual',
    models: ['TAD660VE', 'TAD750VE', 'TAD760VE'],
    requiredTokens: [
      'Volvo TAD650VE Workshop Manual',
      'Industrial Engines',
      'TAD650VE, TAD660VE',
      'TAD734GE, TAD750VE, TAD760VE',
      'Engine protection TAD 650, 660, 750, 760 VE',
    ],
    verification:
      'ManualsLib page title/meta and manual text list exact TAD660VE/TAD750VE/TAD760VE industrial workshop-manual coverage.',
  },
]

const REVIEWED_DEFERRED = [
  {
    model: 'TAD650VE',
    reason:
      'The workshop-manual source validates the exact industrial model, but no independent production-ended/discontinued source was found in this pass.',
  },
  {
    model: 'TAD734GE',
    reason:
      'Already has two linked legacy datasheets in the database, so this broad workshop manual was not added as a duplicate-depth link.',
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
    '2',
    '--connect-timeout',
    '30',
    '--max-time',
    '180',
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

function verifyDocument(document) {
  const localPath = path.join(TMP_DIR, document.fileName)
  if (document.cachedPath && fs.existsSync(document.cachedPath)) {
    fs.copyFileSync(document.cachedPath, localPath)
  } else {
    download(document.sourceUrl, localPath)
  }

  const text = fs.readFileSync(localPath, 'utf8')
  const missing = document.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${document.sourceUrl}: missing validation token(s): ${missing.join(', ')}`)
  }

  return {
    ...document,
    localPath,
    fileSizeBytes: Buffer.byteLength(text, 'utf8'),
  }
}

async function fetchAllEngines(supabase) {
  const engines = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, brand, model, slug, status, pdfs:engine_pdfs(id,label,storage_path,type)')
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

function buildReport({
  verifiedDocs,
  linkedRows,
  plannedRows,
  skippedRows,
  missingRows,
  afterCount,
  coverage,
}) {
  const actionRows = APPLY ? linkedRows : plannedRows
  return `# Legacy Engine Document Attachments - Batch 55 Volvo TAD Industrial Manuals

Date: 2026-08-12

## Result

- Validated Volvo industrial manual sources reviewed: \`${verifiedDocs.length}\`
- Manual links ${APPLY ? 'inserted' : 'planned'}: \`${actionRows.length}\`
- Links skipped as existing: \`${skippedRows.length}\`
- Missing target engine rows: \`${missingRows.length}\`
${afterCount == null ? '' : `- Engine count after attachment: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after attachment: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## Document Attachments

| Document | Source | Storage path | Target models | Verification |
| --- | --- | --- | --- | --- |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.sourceUrl} | ${doc.storagePath} | ${doc.models.join(', ')} | ${doc.verification} |`).join('\n')}

## Linked Engine Rows

| Model | Slug | Document | Status |
| --- | --- | --- | --- |
${actionRows.map((row) => `| ${row.model} | ${row.slug} | ${row.label} | ${APPLY ? 'linked' : 'planned'} |`).join('\n')}

## Validation Sources

${verifiedDocs.map((doc) => `- ${doc.sourceUrl}`).join('\n')}

## Reviewed But Deferred

${REVIEWED_DEFERRED.map((item) => `- ${item.model}: ${item.reason}`).join('\n')}
${missingRows.length ? `\n## Missing Rows\n\n${missingRows.map((row) => `- ${row.model}: ${row.reason}`).join('\n')}\n` : ''}
## Notes

- This batch links manual references to existing Volvo Penta rows already marked \`discontinued\`; it does not add any marine models.
- The linked sources are manual pages, not official Volvo datasheet PDFs. They improve owner-service depth for legacy SEO while preserving document-type labeling as \`manual\`.
- TAD650VE remains outside the engine table until a reliable source confirms discontinued production status, even though the workshop manual validates the exact model name.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const verifiedDocs = DOCUMENTS.map(verifyDocument)
const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const engines = await fetchAllEngines(supabase)
const enginesByModel = new Map(
  engines
    .filter((engine) => engine.brand === 'Volvo Penta')
    .map((engine) => [normalize(engine.model), engine]),
)

const plannedRows = []
const linkedRows = []
const skippedRows = []
const missingRows = []

for (const document of verifiedDocs) {
  const { data: existingLinks, error: existingLinksError } = await supabase
    .from('engine_pdfs')
    .select('engine_id, storage_path')
    .eq('storage_path', document.storagePath)
  if (existingLinksError) throw existingLinksError
  const alreadyLinked = new Set((existingLinks ?? []).map((link) => link.engine_id))

  for (const model of document.models) {
    const engine = enginesByModel.get(normalize(model))
    if (!engine) {
      missingRows.push({ model, reason: 'No matching Volvo Penta engine row exists.' })
      continue
    }
    if (engine.status !== 'discontinued') {
      missingRows.push({ model, reason: `Engine row exists but status is ${engine.status}.` })
      continue
    }

    const row = {
      engine_id: engine.id,
      type: document.type,
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: document.fileSizeBytes,
    }
    const reportRow = {
      model: engine.model,
      slug: engine.slug,
      label: document.label,
    }

    if (alreadyLinked.has(engine.id)) {
      skippedRows.push(reportRow)
    } else if (APPLY) {
      const { error: insertError } = await supabase.from('engine_pdfs').insert(row)
      if (insertError) throw insertError
      linkedRows.push(reportRow)
    } else {
      plannedRows.push(reportRow)
    }
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
    verifiedDocs,
    linkedRows,
    plannedRows,
    skippedRows,
    missingRows,
    afterCount: APPLY ? afterCount : null,
    coverage: APPLY ? coverage : null,
  }),
)

console.log(`Validated document sources: ${verifiedDocs.length}.`)
console.log(`${APPLY ? 'Linked' : 'Planned'} manual links: ${APPLY ? linkedRows.length : plannedRows.length}.`)
console.log(`Skipped existing links: ${skippedRows.length}.`)
console.log(`Missing/deferred target rows: ${missingRows.length}.`)
console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
