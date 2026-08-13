// Add source-validated International/IH Neuss D/DT legacy rows and attach exact manual pages.
//
// Dry run:
//   node data/add-international-neuss-dt360-legacy-batch-63-2026-08.mjs
// Apply:
//   node data/add-international-neuss-dt360-legacy-batch-63-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-63-international-neuss-dt360.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-international-neuss-dt360-batch-63-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyInternationalNeussDT360/1.0; +https://engines.haifengmachinery.com)'

const IH_NEUSS_MANUAL = 'https://hadleyfarm.co.uk/product/neuss-engine/'
const DT360_MANUAL =
  'https://equipmanual.com/dl/international-dt-360-dta-360-engine-shop-manual/'

const DOCUMENTS = [
  {
    key: 'ihNeuss',
    label: 'IH Neuss Diesel Engine D & DT Series Service Manual Page',
    storagePath: IH_NEUSS_MANUAL,
    type: 'manual',
    models: ['D-155', 'D-179', 'D-206', 'D-239', 'D-246', 'D-268', 'D-310', 'D-358', 'DT-239', 'DT-358', 'DT-402'],
  },
  {
    key: 'dt360',
    label: 'International DT360/DTA360 Engine Shop Manual Page',
    storagePath: DT360_MANUAL,
    type: 'manual',
    models: ['DT360', 'DTA360'],
  },
]

const RECORDS = [
  ...[
    ['D-155', 4, 'Naturally aspirated four-cylinder diesel'],
    ['D-179', 4, 'Naturally aspirated four-cylinder diesel'],
    ['D-206', 4, 'Naturally aspirated four-cylinder diesel'],
    ['D-239', 4, 'Naturally aspirated four-cylinder diesel'],
    ['D-246', 4, 'Naturally aspirated four-cylinder diesel'],
    ['D-268', 4, 'Naturally aspirated four-cylinder diesel'],
  ].map(([model, cylinders, configuration]) => internationalNeuss({
    model,
    cylinders,
    configuration,
    description:
      `International Harvester ${model} legacy German-built Neuss diesel engine. The International Harvester Club of Great Britain parts-counter page validates this exact model in its IH Neuss Diesel Engine D & DT Series service manual coverage list.`,
  })),
  internationalDT360({
    model: 'DTA360',
    configuration: 'Inline-6 turbocharged aftercooled diesel',
    description:
      'International DTA360 discontinued legacy diesel. EquipManual validates exact DT-360 and DTA-360 coverage in a 448-page International engine shop manual for truck applications and overhaul specifications.',
  }),
]

function internationalNeuss(row) {
  return clean({
    slug: `international-${slugify(row.model)}`,
    brand: 'International',
    model: row.model,
    series: 'IH Neuss D/DT Series',
    status: 'discontinued',
    origin: 'Germany',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'Legacy pre-electronic mechanical diesel',
    certifications: ['IH Neuss D & DT Series service manual coverage'],
    cylinders: row.cylinders,
    configuration: row.configuration,
    description: row.description,
  })
}

function internationalDT360(row) {
  return clean({
    slug: `international-${slugify(row.model)}`,
    brand: 'International',
    model: row.model,
    series: 'International 300/360 Series',
    status: 'discontinued',
    origin: 'United States',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'Legacy pre-electronic mechanical diesel',
    certifications: ['International DT360/DTA360 engine shop manual coverage'],
    displacement_l: 5.9,
    cylinders: 6,
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

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalize(value) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
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

function buildReport({
  existingCount,
  missingRows,
  linkedRows,
  skippedRows,
  missingDocumentTargets,
  afterCount,
  coverage,
}) {
  return `# Legacy Engine Model Discovery - Batch 63 International Neuss / DT360

Date: 2026-08-12

## Result

- Source-validated International/IH candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missingRows.length}\`
- Manual/reference links ${APPLY ? 'inserted' : 'planned'}: \`${linkedRows.length}\`
- Links skipped as existing: \`${skippedRows.length}\`
- Missing/rejected attachment targets: \`${missingDocumentTargets.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Source |
| --- | --- | --- | --- | --- |
${missingRows.map((row) => `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.model === 'DTA360' ? DT360_MANUAL : IH_NEUSS_MANUAL} |`).join('\n') || '| - | - | - | - | - |'}

## Manual Attachments

| Document | Source | Target slug |
| --- | --- | --- |
${linkedRows.map((row) => `| ${row.label} | ${row.storagePath} | ${row.slug} |`).join('\n') || '| - | - | - |'}

## Existing Links Skipped

${skippedRows.map((row) => `- ${row.slug}: ${row.label}`).join('\n') || '- None'}

## Missing/Rejected Attachment Targets

${missingDocumentTargets.map((row) => `- ${row.model}: ${row.reason}`).join('\n') || '- None'}

## Validation Sources

- ${IH_NEUSS_MANUAL}
- ${DT360_MANUAL}

## Evidence Notes

- The International Harvester Club of Great Britain page validates an \`IH Neuss Diesel Engine D & DT Series Service Manual\`, a 108-page original service manual, and exact model coverage for \`D-155\`, \`D-179\`, \`D206\`, \`D239\`, \`D246\`, \`D268\`, \`D310\`, \`D358\`, \`DT239\`, \`DT358\`, and \`DT402\`.
- EquipManual validates exact \`International DT360, DTA360 Engine Shop Manual\` identity, all-years truck application coverage, 448 pages, and mechanical service/overhaul content.
- This batch stores external manual/reference pages only; it does not redistribute paid PDFs.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const verifiedFiles = {
  ihNeuss: verifyHtml({
    url: IH_NEUSS_MANUAL,
    fileName: 'hadleyfarm-ih-neuss.html',
    cachedPath: '/tmp/hadleyfarm-ih-neuss-current.html',
    requiredTokens: [
      'IH Neuss Diesel Engine D',
      'DT Series Service Manual',
      'Download this 108 page PDF of the ORIGINAL Service Manual',
      'D-155',
      'D-179',
      'D206',
      'D239',
      'D246',
      'D268',
      'D310',
      'D358',
      'DT239',
      'DT358',
      'DT402',
      'International Harvester Club of Great Britain Parts Counter',
    ],
  }),
  dt360: verifyHtml({
    url: DT360_MANUAL,
    fileName: 'equipmanual-international-dt360.html',
    cachedPath: '/tmp/equipmanual-international-dt360-current.html',
    requiredTokens: [
      'International DT360, DTA360 Engine Shop Manual',
      'International DT-360, DTA-360 Diesel Engines',
      'All Years, Truck Applications',
      '448',
      'overhaul',
    ],
  }),
}

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: International Neuss / DT360 legacy batch`)

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
  console.log(`Imported ${data.length} validated International legacy record(s).`)
}

const afterEngines = APPLY && missingRows.length ? await fetchAllEngines(supabase) : before
const linkedRows = []
const skippedRows = []
const missingDocumentTargets = []

for (const document of DOCUMENTS) {
  for (const model of document.models) {
    const engine = afterEngines.find(
      (row) => row.brand === 'International' && normalize(row.model) === normalize(model),
    )

    if (!engine) {
      missingDocumentTargets.push({ model, reason: 'No matching International row exists.' })
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
console.log(`Missing/rejected attachment targets: ${missingDocumentTargets.length}.`)
console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
