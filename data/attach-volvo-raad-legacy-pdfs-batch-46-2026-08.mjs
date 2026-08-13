// Attach exact RAAD archived Volvo Penta legacy Product Bulletin PDFs and add
// missing source-validated archive rows where the exact model is absent.
//
// Dry run:
//   node data/attach-volvo-raad-legacy-pdfs-batch-46-2026-08.mjs
// Apply:
//   node data/attach-volvo-raad-legacy-pdfs-batch-46-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-46-volvo-raad-archive.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-volvo-raad-pdfs-batch-46-2026-08')
const RAAD_BASE = 'https://www.raad-eng.com/techdata/volvo'
const RAAD_ENGINES_INDEX = `${RAAD_BASE}/engines/`
const RAAD_PRODBULL_INDEX = `${RAAD_BASE}/prodbull/`
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengVolvoRaadPdfProbe/1.0; +https://engines.haifengmachinery.com)'

const ROW_CANDIDATES = []

const PDF_ATTACHMENTS = [
  pdfTarget('TAD530GE', 'tad530ge.pdf'),
  pdfTarget('TAD531GE', 'tad531ge.pdf'),
  pdfTarget('TAD532GE', 'tad532ge.pdf'),
  pdfTarget('TD720GE', 'td720ge.pdf'),
  pdfTarget('TAD730GE', 'tad730ge.pdf'),
  pdfTarget('TAD731GE', 'tad731ge.pdf'),
  pdfTarget('TAD732GE', 'tad732ge.pdf'),
  pdfTarget('TAD733GE', 'tad733ge.pdf'),
  pdfTarget('TAD734GE', 'tad734ge.pdf'),
  pdfTarget('TAD1240GE', 'tad1240ge.pdf'),
  pdfTarget('TAD1241GE', 'tad1241ge.pdf'),
  pdfTarget('TAD1242GE', 'tad1242ge.pdf'),
  pdfTarget('TAD1640GE', 'tad1640ge.pdf'),
  pdfTarget('TAD1641GE', 'tad1641ge.pdf'),
  pdfTarget('TAD1642GE', 'tad1642ge.pdf'),
  pdfTarget('TWD1643GE', 'twd1643ge.pdf'),
]

const REJECTED = [
  {
    model: 'TWD1643GE',
    reason:
      'The RAAD PDF is exact, but the archived HTML page is a TWD1630G page and does not itself validate TWD1643GE, so Batch 46 only links the PDF if the exact live row already exists.',
  },
  {
    model: 'TAD1030GE',
    reason:
      'Archived page is exact, but no surviving RAAD Product Bulletin PDF is present in the Product Bulletin index.',
  },
  {
    model: 'TAD1031GE',
    reason:
      'Archived page is exact, but no surviving RAAD Product Bulletin PDF is present in the Product Bulletin index.',
  },
  {
    model: 'TAD1032GE',
    reason:
      'Archived page is exact, but no surviving RAAD Product Bulletin PDF is present in the Product Bulletin index.',
  },
  {
    model: 'TAD1630GE',
    reason:
      'Archived page is exact, but no surviving RAAD Product Bulletin PDF is present in the Product Bulletin index.',
  },
  {
    model: 'TAD1631GE',
    reason:
      'Archived page is exact, but no surviving RAAD Product Bulletin PDF is present in the Product Bulletin index.',
  },
  {
    model: 'TAD740GE',
    reason:
      'Archived page is exact, but the linked TAD740GE Product Bulletin PDF is not present in the surviving RAAD Product Bulletin index.',
  },
  {
    model: 'TAD741GE',
    reason:
      'Archived page is exact, but the linked TAD741GE RGB Product Bulletin PDF is not present in the surviving RAAD Product Bulletin index.',
  },
  {
    model: 'TWD710G',
    reason:
      'Archived page is exact, but no surviving RAAD Product Bulletin PDF is available in the index.',
  },
  {
    model: 'TWD740GE',
    reason:
      'Archived page is exact, but no surviving RAAD Product Bulletin PDF is available in the index.',
  },
  {
    model: 'TWD1630G',
    reason:
      'Archived page exists, but the surviving PDF under that page is for the distinct TWD1643GE model.',
  },
]

function archiveRow(input) {
  return {
    ...input,
    slug: `volvo-penta-${slugify(input.model)}`,
    pageUrl: `${RAAD_BASE}/engines/${input.page}.html`,
    pdfUrl: `${RAAD_BASE}/prodbull/${input.pdf}`,
  }
}

function pdfTarget(model, fileName, requiredTokens = [model]) {
  return {
    model,
    fileName,
    sourceUrl: `${RAAD_BASE}/prodbull/${fileName}`,
    label: `Volvo Penta ${model} RAAD Archived Product Bulletin`,
    storagePath: `volvo/legacy/raad-batch-46/${fileName}`,
    requiredTokens,
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

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function kwToHp(kw) {
  return Math.round((kw / 0.7457) * 10) / 10
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
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
    '--output',
    outputPath,
    url,
  ], {
    maxBuffer: 20 * 1024 * 1024,
  })
}

function pdftotext(pdfPath) {
  const output = execFileSync('pdftotext', ['-layout', pdfPath, '-'], {
    maxBuffer: 20 * 1024 * 1024,
  })
  return output.toString('utf8')
}

function assertPdf(localPath, requiredTokens, sourceUrl) {
  const buffer = fs.readFileSync(localPath)
  if (buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error(`${sourceUrl}: downloaded file is not a PDF`)
  }
  if (buffer.length < 40_000) throw new Error(`${sourceUrl}: PDF too small (${buffer.length} bytes)`)
  const text = pdftotext(localPath)
  const missing = requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${sourceUrl}: missing PDF token(s): ${missing.join(', ')}`)
  const hasVolvoHeader =
    hasToken(text, 'VOLVO PENTA GENSET ENGINE') ||
    (hasToken(text, 'VOLVO PENTA') && hasToken(text, 'INDUSTRIAL DIESEL'))
  if (!hasVolvoHeader) {
    throw new Error(`${sourceUrl}: missing Volvo Penta genset/industrial header`)
  }
  return { buffer, text }
}

function verifyIndex(text, expectedFiles, label) {
  const missing = expectedFiles.filter((file) => !text.includes(file))
  if (missing.length) throw new Error(`${label}: missing index file(s): ${missing.join(', ')}`)
}

function parseRaadPage(entry) {
  const pagePath = path.join(TMP_DIR, `${entry.page}.html`)
  download(entry.pageUrl, pagePath)
  const html = fs.readFileSync(pagePath, 'latin1')
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const missing = entry.tokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${entry.pageUrl}: missing page token(s): ${missing.join(', ')}`)
  return text
}

function buildRecord(row) {
  return clean({
    slug: row.slug,
    brand: 'Volvo Penta',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    origin: 'Sweden',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: row.emissions_standard,
    certifications: ['RAAD archived Volvo Penta technical library'],
    power_kw: row.power_kw,
    power_hp: row.power_kw ? kwToHp(row.power_kw) : undefined,
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: `Inline-${row.cylinders} turbocharged water-cooled diesel generator-drive engine`,
    rpm_rated: row.rpm_rated,
    description:
      `Volvo Penta ${row.model} discontinued legacy generator-drive diesel. ` +
      `${row.note} RAAD's archived Volvo Penta technical library validates the exact Product Bulletin PDF and model code for legacy parts, overhaul, and replacement-engine searches.`,
  })
}

async function fetchAllEngines(supabase) {
  const engines = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, brand, model, slug, status, pdfs:engine_pdfs(id, label, storage_path)')
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

async function linkPdf(supabase, engine, target, localPath, buffer) {
  if (!APPLY) return { action: 'planned' }

  const upload = await uploadPdf(supabase, BUCKET, localPath, target.storagePath)
  if (!upload.ok) throw new Error(`Upload failed: ${target.storagePath}`)

  const { error: deleteError } = await supabase
    .from('engine_pdfs')
    .delete()
    .eq('engine_id', engine.id)
    .eq('storage_path', target.storagePath)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('engine_pdfs').insert({
    engine_id: engine.id,
    type: 'datasheet',
    label: target.label,
    storage_path: target.storagePath,
    file_size_bytes: upload.uploadedSizeBytes ?? buffer.length,
  })
  if (insertError) throw insertError

  return { action: 'linked' }
}

function buildReport({ rowResults, pdfResults, afterCount, coverage }) {
  return `# Legacy Engine Doc Attachments - Batch 46 Volvo RAAD Archive

Date: 2026-08-12

## Result

- RAAD archived engine pages validated: \`${ROW_CANDIDATES.length}\`
- RAAD Product Bulletin PDFs validated: \`${pdfResults.filter((item) => item.status !== 'missing-engine').length}\`
- New legacy rows ${APPLY ? 'inserted' : 'planned'}: \`${rowResults.filter((item) => item.action === 'inserted' || item.action === 'planned-insert').length}\`
- PDF links ${APPLY ? 'attached' : 'planned'}: \`${pdfResults.filter((item) => item.status === 'linked' || item.status === 'planned').length}\`
- Existing PDF links skipped: \`${pdfResults.filter((item) => item.status === 'existing').length}\`
- Missing target engines skipped: \`${pdfResults.filter((item) => item.status === 'missing-engine').length}\`
${afterCount == null ? '' : `- Engine count after batch: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after batch: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## Row Imports

| Brand | Model | Status | Action | Source page | Source PDF |
| --- | --- | --- | --- | --- | --- |
${rowResults.map((item) =>
  `| Volvo Penta | ${item.model} | discontinued | ${item.action} | ${item.pageUrl} | ${item.pdfUrl} |`
).join('\n')}

## PDF Attachments

| Engine | Source PDF | Storage path | Status |
| --- | --- | --- | --- |
${pdfResults.map((item) =>
  `| ${item.model} | ${item.sourceUrl} | ${item.storagePath} | ${item.status} |`
).join('\n')}

## Rejected / Deferred Volvo Archive Items

| Model | Reason |
| --- | --- |
${REJECTED.map((item) => `| ${item.model} | ${item.reason} |`).join('\n')}

## Validation Sources

- RAAD archived Volvo Penta engines index: ${RAAD_ENGINES_INDEX}
- RAAD archived Volvo Penta Product Bulletin index: ${RAAD_PRODBULL_INDEX}

## Notes

- This batch is limited to Volvo Penta industrial and power-generation Product Bulletin material. Marine-only Volvo Penta rows are intentionally excluded.
- Each PDF was downloaded as a complete PDF and checked with \`pdftotext\` for exact model tokens before linking.
- Existing rows are not duplicated; PDF links are attached to the matching live engine row by exact Volvo Penta model code.
`
}

await loadEnv()
const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  requireEnv('SUPABASE_SERVICE_KEY'),
)

await fsp.mkdir(TMP_DIR, { recursive: true })

const engineIndexPath = path.join(TMP_DIR, 'raad-engines-index.html')
const prodbullIndexPath = path.join(TMP_DIR, 'raad-prodbull-index.html')
download(RAAD_ENGINES_INDEX, engineIndexPath)
download(RAAD_PRODBULL_INDEX, prodbullIndexPath)
const engineIndexText = fs.readFileSync(engineIndexPath, 'utf8')
const prodbullIndexText = fs.readFileSync(prodbullIndexPath, 'utf8')
verifyIndex(engineIndexText, ROW_CANDIDATES.map((item) => `${item.page}.html`), RAAD_ENGINES_INDEX)
verifyIndex(prodbullIndexText, PDF_ATTACHMENTS.map((item) => item.fileName), RAAD_PRODBULL_INDEX)

const verifiedPdfs = new Map()
for (const target of PDF_ATTACHMENTS) {
  const localPath = path.join(TMP_DIR, target.fileName)
  console.log(`Validating PDF ${target.fileName} for ${target.model}`)
  download(target.sourceUrl, localPath, { maxTime: 45 })
  const { buffer } = assertPdf(localPath, target.requiredTokens, target.sourceUrl)
  verifiedPdfs.set(target.fileName, { localPath, buffer })
}

for (const candidate of ROW_CANDIDATES) {
  console.log(`Validating archived page ${candidate.page}.html for ${candidate.model}`)
  parseRaadPage(candidate)
}

const engines = await fetchAllEngines(supabase)
const engineByModel = new Map(
  engines
    .filter((engine) => engine.brand === 'Volvo Penta')
    .map((engine) => [normalize(engine.model), engine]),
)

const rowResults = []
for (const candidate of ROW_CANDIDATES) {
  const existing = engineByModel.get(normalize(candidate.model))
  if (existing) {
    rowResults.push({
      ...candidate,
      action: 'already-present',
    })
    continue
  }

  const record = buildRecord(candidate)
  if (APPLY) {
    const { data, error } = await supabase
      .from('engines')
      .upsert(record, { onConflict: 'slug' })
      .select('id, brand, model, slug, status, pdfs:engine_pdfs(id, label, storage_path)')
      .single()
    if (error) throw error
    engineByModel.set(normalize(data.model), data)
    rowResults.push({ ...candidate, action: 'inserted' })
  } else {
    rowResults.push({ ...candidate, action: 'planned-insert' })
  }
}

const pdfResults = []
for (const target of PDF_ATTACHMENTS) {
  const engine = engineByModel.get(normalize(target.model))
  if (!engine) {
    pdfResults.push({ ...target, status: 'missing-engine' })
    continue
  }
  const existing = (engine.pdfs ?? []).some((pdf) => pdf.storage_path === target.storagePath)
  if (existing) {
    pdfResults.push({ ...target, status: 'existing' })
    continue
  }
  const verified = verifiedPdfs.get(target.fileName)
  const result = await linkPdf(supabase, engine, target, verified.localPath, verified.buffer)
  pdfResults.push({ ...target, status: result.action === 'linked' ? 'linked' : 'planned' })
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = APPLY ? await countLegacyCoverage(supabase) : null
await fsp.writeFile(REPORT_PATH, buildReport({ rowResults, pdfResults, afterCount, coverage }))

console.log(`Rows: ${rowResults.map((item) => `${item.model}:${item.action}`).join(', ')}`)
console.log(`PDFs: ${pdfResults.map((item) => `${item.model}:${item.status}`).join(', ')}`)
console.log(`Report: ${REPORT_PATH}`)
