// Add source-validated Caterpillar non-current C18 Tier III generator-set package row
// and attach the exact official Cat spec sheet.
//
// Dry run:
//   node data/add-cat-c18-tier3-package-legacy-batch-42-2026-08.mjs
// Apply:
//   node data/add-cat-c18-tier3-package-legacy-batch-42-2026-08.mjs --apply

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
  'reports/legacy-engine-model-discovery-2026-08-12-batch-42-cat-c18-tier3-package-legacy.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-cat-c18-tier3-package-genset-batch-42-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyCatC18Tier3/1.0; +https://engines.haifengmachinery.com)'

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

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function kwToHp(kw) {
  return Math.round((kw / 0.7457) * 10) / 10
}

const ENTRY = {
  key: 'c18-60hz-550-750-tier3',
  pageUrl:
    'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=15970077&nc=1',
  pageTokens: [
    'Non-Current',
    'C18 (60 Hz)',
    'C18, 60 Hz, 550-750 ekW Standby, 500-680 ekW Prime, EPA TIER III Spec Sheet',
  ],
  docUrl: 'https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1773-',
  docCode: 'LEHE1773-09',
  docTokens: ['Cat C18', 'DIESEL GENERATOR SETS', '550 ekW', '750 ekW', 'EPA TIER II', 'LEHE1773'],
  storagePath: 'caterpillar/legacy/cat-c18-60hz-550-750ekw-tier3-lehe1773-spec-sheet.pdf',
  label: 'Cat C18 60 Hz 550-750 ekW EPA Tier III Spec Sheet',
  row: {
    slug: 'caterpillar-c18-60-hz-550-750-ekw-tier-iii-legacy-genset',
    brand: 'Caterpillar',
    model: 'C18 60 Hz 550-750 ekW Tier III Legacy Genset',
    series: 'C18',
    status: 'discontinued',
    origin: 'United States',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'EPA Tier III',
    certifications: ['Caterpillar Non-Current product page', 'Official Caterpillar spec sheet'],
    power_kw: 750,
    power_hp: kwToHp(750),
    displacement_l: 18.1,
    cylinders: 6,
    configuration: 'C18 ACERT inline-6 four-cycle diesel generator-set package',
    rpm_rated: 1800,
    rpm_max: 1800,
    compression_ratio: '14.5:1 / 14.0:1',
    description:
      'Caterpillar C18 60 Hz 550-750 ekW Tier III discontinued/non-current diesel generator-set package. ' +
      'Cat H-CPC marks the source page as Non-Current and links the official LEHE1773-09 Cat spec sheet ' +
      'validating the 550-750 ekW standby and 500-680 ekW prime package range.',
  },
}

function download(url, outputPath, options = {}) {
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '4',
    '--retry-all-errors',
    '--connect-timeout',
    '30',
    '--max-time',
    String(options.maxTime ?? 180),
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

function verifyPage() {
  const localPath = path.join(TMP_DIR, `${ENTRY.key}.html`)
  download(ENTRY.pageUrl, localPath)
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = ENTRY.pageTokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${ENTRY.pageUrl}: missing page token(s): ${missing.join(', ')}`)
}

function verifyPdf() {
  const localPath = path.join(TMP_DIR, path.basename(ENTRY.storagePath))
  download(ENTRY.docUrl, localPath, { referer: ENTRY.pageUrl, maxTime: 300 })
  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 100_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${ENTRY.docUrl}: response is not a usable PDF`)
  }
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const missing = ENTRY.docTokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${ENTRY.storagePath}: missing PDF token(s): ${missing.join(', ')}`)
  return { localPath, fileSizeBytes: buffer.length }
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

function buildReport({ missing, existingCount, linkedCount, skippedCount, afterCount, coverage }) {
  const rowLines = missing
    ? `| ${ENTRY.row.brand} | ${ENTRY.row.model} | ${ENTRY.row.series} | ${ENTRY.row.status} | ${ENTRY.row.power_kw} | ${ENTRY.row.rpm_rated} | ${ENTRY.pageUrl} |`
    : ''
  return `# Legacy Engine Model Discovery - Batch 42 Cat C18 Tier III Package Legacy Genset

Date: 2026-08-12

## Result

- Official Cat non-current/package candidates reviewed: \`1\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing ? 1 : 0}\`
- Official Cat PDF documents verified: \`1\`
- Datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power kW | RPM | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
${rowLines}

## Document Attachments

| Document | Source | Storage path | Target slug |
| --- | --- | --- | --- |
| ${ENTRY.label} | ${ENTRY.docUrl} | ${ENTRY.storagePath} | ${ENTRY.row.slug} |

## Validation Sources

- ${ENTRY.row.model} non-current source page: ${ENTRY.pageUrl}
- ${ENTRY.label}: ${ENTRY.docUrl}

## Notes

- This batch uses a Caterpillar official H-CPC page marked \`Non-Current\` and an exact Cat spec sheet.
- Individual C18 Tier II sheets from LEHE1580/1581/1758/1771/1772 were rejected because the downloaded exact PDFs are 2025 revisions and need stronger discontinued evidence before import.
- Volvo Penta publication pages for TAD6/TAD7 were probed, but the accepted PDF endpoint timed out before a complete PDF could be validated, so no Volvo PDF was attached in this batch.
- Rows are generator-set package rows, not replacements for generic active engine-family rows.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Cat C18 Tier III package legacy genset batch`)
verifyPage()
const pdf = verifyPdf()
console.log(`Verified ${ENTRY.label}: ${Math.round(pdf.fileSizeBytes / 1024)}KB`)

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const before = await fetchAllEngines(supabase)
const existingKeys = new Set(before.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const missing = !existingKeys.has(`${ENTRY.row.brand}::${normalize(ENTRY.row.model)}`)
const existingCount = missing ? 0 : 1
console.log(`Candidates: 1; existing: ${existingCount}; missing: ${missing ? 1 : 0}`)

if (APPLY && missing) {
  const { error } = await supabase.from('engines').insert([ENTRY.row])
  if (error) throw error
  console.log('Inserted 1 Cat C18 Tier III package legacy genset row')
}

const engines = APPLY && missing ? await fetchAllEngines(supabase) : before
const bySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let linkedCount = 0
let skippedCount = 0
const engine = bySlug.get(ENTRY.row.slug)

if (engine) {
  const { data: existingLinks, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('engine_id', engine.id)
    .eq('storage_path', ENTRY.storagePath)
  if (existingError) throw existingError

  if (existingLinks?.length) {
    skippedCount = 1
  } else if (!APPLY) {
    linkedCount = 1
  } else {
    const upload = await uploadPdf(supabase, BUCKET, pdf.localPath, ENTRY.storagePath)
    if (!upload.ok) throw new Error(`Upload failed: ${ENTRY.storagePath}`)
    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'datasheet',
      label: ENTRY.label,
      storage_path: ENTRY.storagePath,
      file_size_bytes: upload.uploadedSizeBytes ?? pdf.fileSizeBytes,
    })
    if (insertError) throw insertError
    linkedCount = 1
  }
} else if (APPLY) {
  throw new Error(`Missing target row: ${ENTRY.row.slug}`)
}

const afterCount = APPLY ? engines.length : null
const coverage = APPLY ? await countLegacyCoverage(supabase) : null
await fsp.writeFile(
  REPORT_PATH,
  buildReport({ missing, existingCount, linkedCount, skippedCount, afterCount, coverage }),
)
console.log(`Wrote ${REPORT_PATH}`)
