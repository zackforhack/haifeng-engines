// Add and enrich source-validated Volvo Penta archived genset engines from RAAD's
// legacy Volvo Penta technical library.
//
// Dry run:
//   node data/add-volvo-raad-archived-genset-batch-32-2026-08.mjs
// Apply:
//   node data/add-volvo-raad-archived-genset-batch-32-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-32-volvo-raad-archived-gensets.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-volvo-raad-archived-genset-batch-32-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyVolvoRaadGenset/1.0; +https://engines.haifengmachinery.com)'
const RAAD_BASE = 'https://www.raad-eng.com/techdata/volvo'
const RAAD_INDEX = `${RAAD_BASE}/engines/`
const RAAD_PRODBULL_INDEX = `${RAAD_BASE}/prodbull/`

const ATTACHMENT_ENTRIES = [
  entry({ page: 'tad730ge', model: 'TAD730GE', series: 'Early D7 Power Generation', displacement: 7.15, cylinders: 6, noPage: true }),
  entry({ page: 'tad721ge', model: 'TAD721GE', series: 'Early D7 Power Generation', displacement: 7.15, cylinders: 6 }),
  entry({ page: 'tad722ge', model: 'TAD722GE', series: 'Early D7 Power Generation', displacement: 7.15, cylinders: 6 }),
  entry({ page: 'tad940ge', model: 'TAD940GE', series: 'D9 Power Generation', displacement: 9.36, cylinders: 6, addRow: true }),
  entry({ page: 'tad941ge', model: 'TAD941GE', series: 'D9 Power Generation', displacement: 9.36, cylinders: 6, addRow: true }),
  entry({ page: 'tad1240ge', model: 'TAD1240GE', series: 'D12 Power Generation', displacement: 12.13, cylinders: 6 }),
  entry({ page: 'tad1241ge', model: 'TAD1241GE', series: 'D12 Power Generation', displacement: 12.13, cylinders: 6 }),
  entry({ page: 'tad1242ge', model: 'TAD1242GE', series: 'D12 Power Generation', displacement: 12.13, cylinders: 6 }),
  entry({ page: 'tad1640ge', model: 'TAD1640GE', series: 'D16 Power Generation', displacement: 16.12, cylinders: 6, addRow: true }),
  entry({ page: 'tad1641ge', model: 'TAD1641GE', series: 'D16 Power Generation', displacement: 16.12, cylinders: 6, addRow: true }),
  entry({ page: 'tad1642ge', model: 'TAD1642GE', series: 'D16 Power Generation', displacement: 16.12, cylinders: 6, addRow: true }),
  entry({ page: 'td720ge', model: 'TD720GE', series: 'Early D7 Power Generation', displacement: 7.15, cylinders: 6, aftercooled: false }),
]

function entry(input) {
  const sourceModel = input.sourceModel ?? input.model
  const page = input.page
  const pdf = input.pdf ?? page
  return {
    ...input,
    sourceModel,
    slug: `volvo-penta-${slugify(input.model)}`,
    pageUrl: input.noPage ? null : `${RAAD_BASE}/engines/${page}.html`,
    pdfUrl: `${RAAD_BASE}/prodbull/${pdf}.pdf`,
    storagePath: `volvo/legacy/raad-archived-gensets/${pdf}-product-bulletin.pdf`,
    label: `Volvo Penta ${sourceModel} Legacy Genset Product Bulletin`,
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

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalize(value) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function kwToHp(kw) {
  return Math.round((kw / 0.7457) * 10) / 10
}

function download(url, outputPath, options = {}) {
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
    String(options.maxTime ?? 120),
    '--user-agent',
    USER_AGENT,
    ...(options.referer ? ['--referer', options.referer] : []),
    '--output',
    outputPath,
    url,
  ], {
    maxBuffer: 50 * 1024 * 1024,
  })
}

function verifyIndex() {
  const indexPath = path.join(TMP_DIR, 'raad-volvo-engines-index.html')
  download(RAAD_INDEX, indexPath)
  const text = fs.readFileSync(indexPath, 'utf8')
  const missing = ATTACHMENT_ENTRIES
    .filter((item) => !item.noPage)
    .map((item) => `${item.page}.html`)
    .filter((token) => !text.includes(token))
  if (missing.length) {
    throw new Error(`${RAAD_INDEX}: missing archived page(s): ${missing.join(', ')}`)
  }
  const prodbullPath = path.join(TMP_DIR, 'raad-volvo-prodbull-index.html')
  download(RAAD_PRODBULL_INDEX, prodbullPath)
  const prodbull = fs.readFileSync(prodbullPath, 'utf8')
  const missingPdfs = ATTACHMENT_ENTRIES
    .map((item) => path.basename(item.pdfUrl))
    .filter((token) => !prodbull.includes(token))
  if (missingPdfs.length) {
    throw new Error(`${RAAD_PRODBULL_INDEX}: missing Product Bulletin PDF(s): ${missingPdfs.join(', ')}`)
  }
  console.log(`Verified RAAD Volvo indexes: ${ATTACHMENT_ENTRIES.length} pages and PDFs`)
}

function parsePage(entryItem) {
  if (entryItem.noPage) {
    return {
      ...entryItem,
      pageText: '',
    }
  }
  const pagePath = path.join(TMP_DIR, `${entryItem.page}.html`)
  download(entryItem.pageUrl, pagePath)
  const html = fs.readFileSync(pagePath, 'latin1')
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const missing = [
    'VOLVO PENTA GENSET ENGINE',
    entryItem.sourceModel,
    'Product Bulletin',
  ].filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${entryItem.pageUrl}: missing token(s): ${missing.join(', ')}`)
  }

  const kwMatches = [...text.matchAll(/(?:1\s*)?(?:500|800)\s*rpm,\s*([0-9]+)\s*kW/gi)]
  const kwValues = kwMatches.map((match) => Number(match[1])).filter(Number.isFinite)
  const powerKw = kwValues.length ? Math.max(...kwValues) : undefined
  return {
    ...entryItem,
    pagePath,
    pageText: text,
    power_kw: powerKw,
    rpm_rated: kwValues.length > 1 ? 1800 : undefined,
  }
}

function downloadAndVerifyPdf(entryItem) {
  const localPath = path.join(TMP_DIR, `${entryItem.page}-product-bulletin.pdf`)
  download(entryItem.pdfUrl, localPath, {
    referer: entryItem.pageUrl ?? RAAD_PRODBULL_INDEX,
    maxTime: 300,
  })

  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 10_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${entryItem.pdfUrl}: response is not a usable PDF`)
  }

  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const missing = ['VOLVO PENTA', entryItem.sourceModel]
    .filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${entryItem.storagePath}: missing required token(s): ${missing.join(', ')}`)
  }

  return {
    ...entryItem,
    localPath,
    fileSizeBytes: buffer.length,
  }
}

function buildRecord(entryItem) {
  const aftercooled = entryItem.aftercooled !== false && /^TA|^TWD/i.test(entryItem.model)
  return clean({
    slug: entryItem.slug,
    brand: 'Volvo Penta',
    model: entryItem.model,
    series: entryItem.series,
    status: 'discontinued',
    origin: 'Sweden',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'Legacy Volvo Penta archived genset literature',
    certifications: ['RAAD archived Volvo Penta technical library'],
    power_kw: entryItem.power_kw,
    power_hp: entryItem.power_kw ? kwToHp(entryItem.power_kw) : undefined,
    displacement_l: entryItem.displacement,
    cylinders: entryItem.cylinders,
    configuration: `Inline-${entryItem.cylinders} ${aftercooled ? 'turbocharged aftercooled' : 'turbocharged'} diesel generator-drive engine`,
    rpm_rated: entryItem.rpm_rated,
    description:
      `Volvo Penta ${entryItem.model} discontinued legacy generator-drive diesel. ` +
      `RAAD's archived Volvo Penta technical library lists an exact ${entryItem.sourceModel} genset page and a downloadable Product Bulletin PDF for the model.`,
  })
}

async function fetchAllEngines(supabase) {
  const engines = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, brand, model, slug, status, pdfs:engine_pdfs(id)')
      .range(from, from + 999)
    if (error) throw error
    engines.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return engines
}

async function countLegacyCoverage(supabase) {
  let legacyRows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, status, pdfs:engine_pdfs(id)')
      .eq('status', 'discontinued')
      .range(from, from + 999)
    if (error) throw error
    legacyRows = legacyRows.concat(data ?? [])
    if (!data || data.length < 1000) break
  }
  return {
    legacyCount: legacyRows.length,
    legacyWithPdf: legacyRows.filter((engine) => (engine.pdfs ?? []).length > 0).length,
  }
}

function buildReport({ existingCount, missing, verifiedDocs, linkedCount, skippedCount, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 32 Volvo RAAD Archived Gensets

Date: 2026-08-11

## Result

- RAAD archived Volvo Penta genset pages reviewed: \`${ATTACHMENT_ENTRIES.length}\`
- New legacy rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Already present before import: \`${existingCount}\`
- Product Bulletin PDFs verified: \`${verifiedDocs.length}\`
- PDF links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- PDF links skipped as existing: \`${skippedCount}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Max kW from RAAD page | PDF |
| --- | --- | --- | --- | ---: | --- |
${missing.map((row) => {
  const doc = ATTACHMENT_ENTRIES.find((item) => item.slug === row.slug)
  return `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.power_kw ?? ''} | ${doc?.pdfUrl ?? ''} |`
}).join('\n')}

## Document Attachments

| Target model | Source model text | Source page | Product Bulletin |
| --- | --- | --- | --- |
${verifiedDocs.map((doc) => `| ${doc.model} | ${doc.sourceModel} | ${doc.pageUrl ?? RAAD_PRODBULL_INDEX} | ${doc.pdfUrl} |`).join('\n')}

## Validation Sources

- RAAD archived Volvo Penta engines index: ${RAAD_INDEX}
${ATTACHMENT_ENTRIES.map((item) => `- ${item.sourceModel} archived page: ${item.pageUrl}`).join('\n')}

## Notes

- This batch is limited to archived Volvo Penta genset pages under RAAD's Volvo technical library; marine-only Volvo rows are intentionally excluded.
- New records use conservative metadata from the archived page/PDF plus known Volvo displacement family context. Exact Product Bulletin PDFs are attached to every target row in this batch.
- RAAD pages with dead Product Bulletin links, including TAD740GE/TAD741GE and several older TWD pages, were excluded from this batch until a downloadable exact PDF is found.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Volvo RAAD archived genset batch`)
verifyIndex()

const parsedEntries = ATTACHMENT_ENTRIES.map((item) => parsePage(item))
const verifiedDocs = parsedEntries.map((item) => {
  const verified = downloadAndVerifyPdf(item)
  console.log(`Verified ${verified.sourceModel} Product Bulletin: ${Math.round(verified.fileSizeBytes / 1024)}KB`)
  return verified
})

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const existing = await fetchAllEngines(supabase)
const existingByBrandModel = new Set(existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const targetRecords = parsedEntries
  .filter((item) => item.addRow)
  .map((item) => buildRecord(item))
const missing = targetRecords.filter(
  (row) => !existingByBrandModel.has(`${row.brand}::${normalize(row.model)}`),
)
const existingCount = targetRecords.length - missing.length

console.log(`New-row candidates: ${targetRecords.length}; existing: ${existingCount}; missing: ${missing.length}`)
for (const row of missing) console.log(`Candidate: ${row.brand} ${row.model} (${row.slug})`)

if (APPLY && missing.length) {
  const { error } = await supabase.from('engines').insert(missing)
  if (error) throw error
  console.log(`Inserted ${missing.length} Volvo Penta archived genset rows`)
}

const refreshed = await fetchAllEngines(supabase)
const enginesBySlug = new Map(refreshed.map((engine) => [engine.slug, engine]))

let linkedCount = 0
let skippedCount = 0

for (const document of verifiedDocs) {
  const engine = enginesBySlug.get(document.slug)
  if (!engine) {
    console.warn(`Missing target engine row for ${document.slug}; skipping link`)
    continue
  }
  if (engine.brand !== 'Volvo Penta') {
    throw new Error(`Unexpected target brand for ${document.slug}: ${engine.brand}`)
  }
  if (normalize(engine.model) !== normalize(document.model)) {
    throw new Error(`Target model mismatch for ${document.slug}: ${engine.model} !== ${document.model}`)
  }

  const { data: existingLinks, error: existingLinkError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('engine_id', engine.id)
    .eq('storage_path', document.storagePath)
  if (existingLinkError) throw existingLinkError

  if (existingLinks?.length) {
    skippedCount += 1
    continue
  }

  if (!APPLY) {
    linkedCount += 1
    continue
  }

  const upload = await uploadPdf(supabase, BUCKET, document.localPath, document.storagePath)
  if (!upload.ok) throw new Error(`Upload failed: ${document.storagePath}`)

  const { error: insertLinkError } = await supabase.from('engine_pdfs').insert({
    engine_id: engine.id,
    type: 'datasheet',
    label: document.label,
    storage_path: document.storagePath,
    file_size_bytes: upload.uploadedSizeBytes ?? document.fileSizeBytes,
  })
  if (insertLinkError) throw insertLinkError
  linkedCount += 1
}

const afterCount = APPLY ? refreshed.length : null
const coverage = APPLY ? await countLegacyCoverage(supabase) : null
const report = buildReport({
  existingCount,
  missing,
  verifiedDocs,
  linkedCount,
  skippedCount,
  afterCount,
  coverage,
})
await fsp.writeFile(REPORT_PATH, report)
console.log(`Wrote ${REPORT_PATH}`)
