// Attach exact Lister CS / JP / FR legacy manual reference pages to existing discontinued rows.
//
// Dry run:
//   node data/attach-lister-cs-jp-fr-manuals-batch-66-2026-08.mjs
// Apply:
//   node data/attach-lister-cs-jp-fr-manuals-batch-66-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-66-lister-cs-jp-fr.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-lister-cs-jp-fr-batch-66-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyListerDocs/1.0; +https://engines.haifengmachinery.com)'

const LISTER_CS_MANUAL =
  'https://www.stationaryengineparts.com/Lister-CS-Instruction-Book-Workshop-Manual.html'
const LISTER_JP_INDUSTRIAL_MANUAL =
  'https://mpsvintagediesels.co.uk/index.php/store/lister/product/jp-js-jk-2-3-4-cyl-industrial-manual'
const LISTER_FR_MANUAL =
  'https://www.agrimanuals.com/lister-diesel-engine-fr-range-types-fr1-fr2-fr3-fr4--fr6-operators-manual-with-parts-list-8782-p.asp'

const DOCUMENTS = [
  {
    key: 'listerCs',
    label: 'Lister CS Instruction Book / Workshop Manual Reference Page',
    storagePath: LISTER_CS_MANUAL,
    type: 'manual',
    models: [
      'Lister CS 3/1',
      'Lister CS 3.5/1',
      'Lister CS 5/1',
      'Lister CS 6/1',
      'Lister CS 8/1',
      'Lister CS 12/2',
      'Lister CS 16/2',
    ],
  },
  {
    key: 'listerJp',
    label: 'Lister JP, JS & JK 2/3/4-Cylinder Industrial Manual Reference Page',
    storagePath: LISTER_JP_INDUSTRIAL_MANUAL,
    type: 'manual',
    models: [
      'Lister 21/2 (JP2)',
      'Lister 30/3 (JP3)',
      'Lister 40/4 (JP4)',
    ],
  },
  {
    key: 'listerFr',
    label: 'Lister FR Range Operators Manual with Parts List Reference Page',
    storagePath: LISTER_FR_MANUAL,
    type: 'manual',
    models: [
      'Lister FR1',
      'Lister FR2',
      'Lister FR3',
      'Lister FR4',
      'Lister FR6',
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
  const targetCount = DOCUMENTS.reduce((sum, document) => sum + document.models.length, 0)
  return `# Legacy Engine Document Attachments - Batch 66 Lister CS / JP / FR

Date: 2026-08-12

## Result

- Exact Lister legacy targets reviewed: \`${targetCount}\`
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

- ${LISTER_CS_MANUAL}
- ${LISTER_JP_INDUSTRIAL_MANUAL}
- ${LISTER_FR_MANUAL}

## Evidence Notes

- Stationary Engine Parts validates a \`Lister CS Instruction Book / Workshop Manual\` covering \`3/1\`, \`3.5/1\`, \`5/1\`, \`6/1\`, \`8/1\`, \`12/2\`, and \`16/2\`. This batch intentionally skips \`Lister CS 10/2\` because the accessible source page does not name it.
- MPS Vintage Diesels validates a \`JP, JS & JK 2, 3 & 4 Cyl Industrial Manual\` for the Lister JP industrial range in 2-, 3-, and 4-cylinder variants. This batch maps that evidence only to \`JP2\`, \`JP3\`, and \`JP4\`, not \`JP1\` or \`JP6\`.
- Agrimanuals validates \`Lister Diesel Engine FR Range Types FR1 FR2 FR3 FR4 & FR6 Operators Manual with Parts List\`.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const verifiedFiles = {
  listerCs: verifyHtml({
    url: LISTER_CS_MANUAL,
    fileName: 'stationaryengineparts-lister-cs.html',
    cachedPath: '/tmp/stationaryengineparts-lister-cs-current.html',
    requiredTokens: [
      'Lister CS Instruction Book / Workshop Manual',
      'CS diesel engine instruction book',
      '3/1',
      '3.5/1',
      '5/1',
      '6/1',
      '8/1',
      '12/2',
      '16/2',
    ],
  }),
  listerJp: verifyHtml({
    url: LISTER_JP_INDUSTRIAL_MANUAL,
    fileName: 'mps-lister-jp-industrial.html',
    cachedPath: '/tmp/marinepowerservices-lister-jp-current.html',
    requiredTokens: [
      'JP, JS & JK 2, 3 & 4 Cyl Industrial Manual',
      'Lister JP, JS and JK Industrial range of engines',
      '2, 3 and 4 cylinder variants',
      'Operation, Maintenance, Overhaul, Installation and Spare parts',
      'Lister Publication No 106/161',
    ],
  }),
  listerFr: verifyHtml({
    url: LISTER_FR_MANUAL,
    fileName: 'agrimanuals-lister-fr.html',
    cachedPath: '/tmp/agrimanuals-lister-fr-current.html',
    requiredTokens: [
      'Lister Diesel Engine FR Range Types FR1 FR2 FR3 FR4 & FR6 Operators Manual with Parts List',
      'FR1',
      'FR2',
      'FR3',
      'FR4',
      'FR6',
      'Operators Manual',
      'Parts List',
    ],
  }),
}

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Lister CS / JP / FR exact manual attachment batch`)

const engines = await fetchAllEngines(supabase)
const linkedRows = []
const skippedRows = []
const missingTargets = []

for (const document of DOCUMENTS) {
  for (const model of document.models) {
    const engine = engines.find(
      (row) => row.brand === 'Lister Petter' && normalize(row.model) === normalize(model),
    )

    if (!engine) {
      missingTargets.push({ model, reason: 'No matching Lister Petter row exists.' })
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
