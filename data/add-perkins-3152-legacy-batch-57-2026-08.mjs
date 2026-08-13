// Add source-validated Perkins 3.152 family legacy rows and attach the exact
// public handbook reference to the family variants.
//
// Dry run:
//   node data/add-perkins-3152-legacy-batch-57-2026-08.mjs
// Apply:
//   node data/add-perkins-3152-legacy-batch-57-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-57-perkins-3152-family.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-perkins-3152-batch-57-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyPerkins3152/1.0; +https://engines.haifengmachinery.com)'

const PERKINS_IDENTIFY =
  'https://b2b.perkins.com/support/identify-your-engine'
const MANUALSLIB_3152 =
  'https://www.manualslib.com/manual/3210613/Perkins-3-152-Series.html'

const DOCUMENT = {
  label: 'Perkins 3.152 Series User Handbook',
  storagePath: MANUALSLIB_3152,
  type: 'manual',
}

const RECORDS = [
  perkins3152({
    model: 'D3.152',
    displacement_l: 2.5,
    cylinders: 3,
    configuration: 'Inline-3 naturally aspirated diesel',
    description:
      'Perkins D3.152 legacy 3.152-series diesel. Perkins current engine-identification support lists 3.152 as an engine type/series, and the public 3.152 Series user handbook explicitly covers D3.152 alongside 3.1524 and T3.1524 variants for owner-service use.',
  }),
  perkins3152({
    model: 'T3.1524',
    displacement_l: 2.5,
    cylinders: 3,
    configuration: 'Inline-3 turbocharged diesel',
    description:
      'Perkins T3.1524 legacy turbocharged 3.152-series diesel. Perkins current engine-identification support lists 3.152 as an engine type/series, and the public 3.152 Series user handbook explicitly covers T3.1524, including turbocharged-engine service guidance.',
  }),
]

const DOCUMENT_TARGET_MODELS = ['3.1524', ...RECORDS.map((record) => record.model)]

function perkins3152(row) {
  return clean({
    slug: `perkins-${slugify(row.model)}`,
    brand: 'Perkins',
    model: row.model,
    series: '3.152 Series',
    status: 'discontinued',
    origin: 'United Kingdom',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'Legacy pre-electronic mechanical diesel',
    certifications: ['Perkins current engine-identification support', 'Perkins 3.152 Series user handbook'],
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    description: row.description,
  })
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

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
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
    maxBuffer: 30 * 1024 * 1024,
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

function buildReport({
  existingCount,
  missingRows,
  linkedRows,
  skippedRows,
  missingDocumentTargets,
  afterCount,
  coverage,
}) {
  return `# Legacy Engine Model Discovery - Batch 57 Perkins 3.152 Family

Date: 2026-08-12

## Result

- Source-validated Perkins 3.152 candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missingRows.length}\`
- Manual/reference links ${APPLY ? 'inserted' : 'planned'}: \`${linkedRows.length}\`
- Links skipped as existing: \`${skippedRows.length}\`
- Missing document target rows: \`${missingDocumentTargets.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Cyl | Displacement L | Configuration |
| --- | --- | --- | --- | ---: | ---: | --- |
${missingRows.map((row) => `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.cylinders ?? ''} | ${row.displacement_l ?? ''} | ${row.configuration ?? ''} |`).join('\n')}

## Manual Attachments

| Document | Source | Target models |
| --- | --- | --- |
| ${DOCUMENT.label} | ${DOCUMENT.storagePath} | ${DOCUMENT_TARGET_MODELS.join(', ')} |

## Validation Sources

- Perkins engine-identification support: ${PERKINS_IDENTIFY}
- Perkins 3.152 Series user handbook mirror: ${MANUALSLIB_3152}

## Evidence Notes

- Perkins current engine-identification support lists \`3.152 Series\` in the series selector and \`3.152\` in the older engine-type table.
- The 3.152 Series user handbook page title/meta and manual text explicitly cover \`3.1524\`, \`T3.1524\`, and \`D3.152\`.
- The existing \`3.1524\` row already had a datasheet; this batch adds the handbook reference to connect the sibling variants without replacing that datasheet.
- No 4.108, 4.236, or 6.354 variants are imported in this batch; those families need separate exact-model evidence before insertion.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

verifyHtml({
  url: PERKINS_IDENTIFY,
  fileName: 'perkins-identify-engine.html',
  cachedPath: '/tmp/perkins-identify-engine.html',
  requiredTokens: ['3.152 Series', '3.152', 'Engine type'],
})

const manual = verifyHtml({
  url: MANUALSLIB_3152,
  fileName: 'manualslib-perkins-3152.html',
  cachedPath: '/tmp/manualslib-perkins-3152.html',
  requiredTokens: ['PERKINS 3.152 SERIES USER HANDBOOK', '3.1524', 'T3.1524', 'D3.152'],
})

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const before = await fetchAllEngines(supabase)
const existingKeys = new Set(before.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const missingRows = RECORDS.filter((engine) => !existingKeys.has(`${engine.brand}::${normalize(engine.model)}`))
const existingCount = RECORDS.length - missingRows.length

console.log(`Candidates: ${RECORDS.length}; existing: ${existingCount}; missing: ${missingRows.length}`)
for (const row of missingRows) console.log(`${row.brand}\t${row.model}\t${row.slug}`)

if (APPLY && missingRows.length) {
  const { error } = await supabase.from('engines').upsert(missingRows, { onConflict: 'slug' })
  if (error) throw error
}

const engines = APPLY && missingRows.length ? await fetchAllEngines(supabase) : before
const enginesByModel = new Map(
  engines
    .filter((engine) => engine.brand === 'Perkins')
    .map((engine) => [normalize(engine.model), engine]),
)

const linkedRows = []
const skippedRows = []
const missingDocumentTargets = []
for (const model of DOCUMENT_TARGET_MODELS) {
  const engine = enginesByModel.get(normalize(model))
  if (!engine) {
    missingDocumentTargets.push(model)
    continue
  }

  const { data: existingLinks, error: existingLinkError } = await supabase
    .from('engine_pdfs')
    .select('id')
    .eq('engine_id', engine.id)
    .eq('storage_path', DOCUMENT.storagePath)
  if (existingLinkError) throw existingLinkError

  const reportRow = { model: engine.model, slug: engine.slug }
  if (existingLinks?.length) {
    skippedRows.push(reportRow)
    continue
  }

  if (APPLY) {
    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: DOCUMENT.type,
      label: DOCUMENT.label,
      storage_path: DOCUMENT.storagePath,
      file_size_bytes: manual.fileSizeBytes,
    })
    if (insertError) throw insertError
  }
  linkedRows.push(reportRow)
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = await countLegacyCoverage(supabase)
await fsp.writeFile(
  REPORT_PATH,
  buildReport({
    existingCount,
    missingRows,
    linkedRows,
    skippedRows,
    missingDocumentTargets,
    afterCount: APPLY ? afterCount : null,
    coverage: APPLY ? coverage : null,
  }),
)

console.log(`${APPLY ? 'Linked' : 'Planned'} manual links: ${linkedRows.length}.`)
console.log(`Skipped existing links: ${skippedRows.length}.`)
console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
