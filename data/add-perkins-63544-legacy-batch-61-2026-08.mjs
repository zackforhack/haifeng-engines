// Add source-validated Perkins 6.3544-family legacy coverage and exact workshop manual links.
//
// Dry run:
//   node data/add-perkins-63544-legacy-batch-61-2026-08.mjs
// Apply:
//   node data/add-perkins-63544-legacy-batch-61-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-61-perkins-63544-family.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-perkins-63544-batch-61-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyPerkins63544/1.0; +https://engines.haifengmachinery.com)'

const MANUALSLIB_T63544 = 'https://www.manualslib.com/manual/1013291/Perkins-T6-3544.html'

const DOCUMENT = {
  label: 'Perkins T6.3544 Workshop Manual',
  storagePath: MANUALSLIB_T63544,
  type: 'manual',
}

const RECORDS = [
  {
    slug: 'perkins-6-3724',
    brand: 'Perkins',
    model: '6.3724',
    series: '6.354 Series',
    status: 'discontinued',
    origin: 'United Kingdom',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'Legacy pre-electronic mechanical diesel',
    certifications: ['Perkins T6.3544 workshop manual also-for model listing'],
    cylinders: 6,
    configuration: 'Inline-6 diesel',
    description:
      'Perkins 6.3724 legacy six-cylinder diesel validated as an exact also-for model on the public Perkins T6.3544 workshop manual. Added as a conservative legacy model row for owners searching older 6.354-family parts, service, and overhaul information.',
  },
]

const DOCUMENT_TARGET_MODELS = ['6.3544', 'T6.3544', '6.3724']

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

function verifyManual() {
  const localPath = path.join(TMP_DIR, 'manualslib-perkins-t63544.html')
  download(MANUALSLIB_T63544, localPath, '/tmp/manualslib-perkins-t63544-current.html')
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = [
    'PERKINS T6.3544 WORKSHOP MANUAL',
    'T6.3544 engine pdf manual download',
    'Also for: 6.3544, 6.3724',
    'Diesel',
    'View Of Fuel Pump Side Of 6.3544 Engine',
    'View Of Fuel Pump Side Of T6.3544 Engine',
  ].filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${MANUALSLIB_T63544}: missing validation token(s): ${missing.join(', ')}`)
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
  return `# Legacy Engine Model Discovery - Batch 61 Perkins 6.3544 Family

Date: 2026-08-12

## Result

- Source-validated Perkins 6.3544-family candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missingRows.length}\`
- Manual/reference links ${APPLY ? 'inserted' : 'planned'}: \`${linkedRows.length}\`
- Links skipped as existing: \`${skippedRows.length}\`
- Missing document target rows: \`${missingDocumentTargets.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Source |
| --- | --- | --- | --- | --- |
${missingRows.map((row) => `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${MANUALSLIB_T63544} |`).join('\n') || '| - | - | - | - | - |'}

## Manual Attachments

| Document | Source | Target slug |
| --- | --- | --- |
${linkedRows.map((row) => `| ${row.label} | ${DOCUMENT.storagePath} | ${row.slug} |`).join('\n') || '| - | - | - |'}

## Existing Links Skipped

${skippedRows.map((row) => `- ${row.slug}: ${row.label}`).join('\n') || '- None'}

## Missing/Rejected Attachment Targets

${missingDocumentTargets.map((row) => `- ${row.model}: ${row.reason}`).join('\n') || '- None'}

## Validation Sources

- ${MANUALSLIB_T63544}

## Evidence Notes

- The ManualsLib page title/meta validates exact \`Perkins T6.3544 Workshop Manual\` identity and \`T6.3544 engine pdf manual download\`.
- The same public manual page explicitly lists \`Also for: 6.3544, 6.3724\`, allowing exact attachment to existing \`6.3544\` and \`T6.3544\` rows and a conservative \`6.3724\` legacy row.
- The table of contents includes engine-photo sections for \`6.3544\` and \`T6.3544\`, supporting exact family relevance.
- This batch avoids broader related Perkins models unless separately validated by exact source pages.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const manual = verifyManual()
const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Perkins 6.3544-family legacy batch`)

const before = await fetchAllEngines(supabase)
const existingKeys = new Set(before.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const missingRows = RECORDS.filter((row) => !existingKeys.has(`${row.brand}::${normalize(row.model)}`))
const existingCount = RECORDS.length - missingRows.length

console.log(`Candidates: ${RECORDS.length}; existing: ${existingCount}; missing: ${missingRows.length}`)
for (const engine of missingRows) console.log(`${engine.brand}\t${engine.model}\t${engine.slug}`)

if (APPLY && missingRows.length) {
  const { data, error } = await supabase
    .from('engines')
    .upsert(missingRows, { onConflict: 'slug' })
    .select('id, brand, model, slug')
  if (error) throw error
  console.log(`Imported ${data.length} validated legacy Perkins 6.3544-family record(s).`)
}

const afterEngines = APPLY && missingRows.length ? await fetchAllEngines(supabase) : before
const targetEngines = DOCUMENT_TARGET_MODELS.map((model) => {
  const engine = afterEngines.find(
    (row) => row.brand === 'Perkins' && normalize(row.model) === normalize(model),
  )
  return { model, engine }
})

const linkedRows = []
const skippedRows = []
const missingDocumentTargets = []

for (const { model, engine } of targetEngines) {
  if (!engine) {
    missingDocumentTargets.push({ model, reason: 'No matching Perkins row exists.' })
    continue
  }
  if (engine.status !== 'discontinued') {
    missingDocumentTargets.push({ model, reason: `Engine row exists but status is ${engine.status}.` })
    continue
  }

  const { data: existingLinks, error: existingLinksError } = await supabase
    .from('engine_pdfs')
    .select('id')
    .eq('engine_id', engine.id)
    .eq('storage_path', DOCUMENT.storagePath)
  if (existingLinksError) throw existingLinksError

  const row = { model, slug: engine.slug, label: DOCUMENT.label }
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
      file_size_bytes: manual.fileSizeBytes,
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
    existingCount,
    missingRows,
    linkedRows,
    skippedRows,
    missingDocumentTargets,
    afterCount: APPLY ? afterCount : null,
    coverage: APPLY ? coverage : null,
  }),
)

console.log(`${APPLY ? 'Linked' : 'Planned'} manual/reference links: ${linkedRows.length}.`)
console.log(`Existing links skipped: ${skippedRows.length}.`)
console.log(`Missing document target rows: ${missingDocumentTargets.length}.`)
console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
