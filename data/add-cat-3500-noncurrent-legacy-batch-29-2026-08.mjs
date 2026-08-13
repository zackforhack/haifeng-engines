// Add source-validated Caterpillar 3500-series non-current generator engine rows
// and attach official Cat PDF rating/spec documents.
//
// Dry run:
//   node data/add-cat-3500-noncurrent-legacy-batch-29-2026-08.mjs
// Apply:
//   node data/add-cat-3500-noncurrent-legacy-batch-29-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-29-cat-3500-noncurrent.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-cat-3500-noncurrent-batch-29-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyCat3500/1.0; +https://engines.haifengmachinery.com)'

const SOURCE_PAGES = [
  {
    key: '3512',
    url: 'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000001870&nc=1',
    requiredTokens: [
      'Non-Current',
      'Cat 3512 (50 Hz) with Upgradeable Package Diesel Generator Sets',
      '3512, 50 Hz, 1000-1400 kVA, Low Fuel Consumption Spec Sheet',
    ],
  },
  {
    key: '3512B',
    url: 'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000028970&nc=1',
    requiredTokens: [
      'Non-Current',
      'Cat 3512B Diesel Generator Sets',
      '3512B TA, V-12, 4-Stroke Water-Cooled Diesel',
    ],
  },
  {
    key: '3516B',
    url: 'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=15969841&nc=1',
    requiredTokens: [
      'Non-Current',
      'Cat 3516B (60 Hz) Diesel Generator Sets',
      '3516B TA, V-16, 4-Stroke Water-Cooled Diesel',
    ],
  },
]

function cat(row) {
  return clean({
    slug: `caterpillar-${slugify(row.model)}`,
    brand: 'Caterpillar',
    model: row.model,
    series: '3500 Series',
    status: 'discontinued',
    origin: 'United States',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'Cat non-current generator-set literature',
    certifications: ['Caterpillar Non-Current product page'],
    power_kw: row.power_kw,
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    rpm_max: row.rpm_max,
    compression_ratio: row.compression_ratio,
    description: row.description,
  })
}

const RECORDS = [
  cat({
    model: '3512',
    power_kw: 1120,
    cylinders: 12,
    rpm_rated: 1500,
    configuration: 'V-12 turbocharged-aftercooled diesel generator engine',
    description:
      'Caterpillar 3512 discontinued/non-current 3500-series diesel generator engine. Cat H-CPC marks the 3512 50 Hz upgradeable package as Non-Current and links a Cat 3512 diesel generator set spec sheet.',
  }),
  cat({
    model: '3512B',
    power_kw: 1500,
    displacement_l: 58.56,
    cylinders: 12,
    rpm_max: 1800,
    compression_ratio: '14.0:1 standard / 15.5:1 HD',
    configuration: '3512B TA V-12 four-stroke water-cooled diesel',
    description:
      'Caterpillar 3512B discontinued/non-current 3500-series diesel generator engine. Cat H-CPC marks the 3512B page as Non-Current and lists the engine model as 3512B TA, V-12, 4-stroke water-cooled diesel.',
  }),
  cat({
    model: '3516B',
    power_kw: 2250,
    displacement_l: 78.08,
    cylinders: 16,
    rpm_rated: 1800,
    compression_ratio: '14.0:1 standard / 15.5:1 HD',
    configuration: '3516B TA V-16 four-stroke water-cooled diesel',
    description:
      'Caterpillar 3516B discontinued/non-current 3500-series diesel generator engine. Cat H-CPC marks the 3516B 60 Hz page as Non-Current and lists the engine model as 3516B TA, V-16, 4-stroke water-cooled diesel.',
  }),
]

const DOCUMENTS = [
  {
    key: '3512-spec',
    sourceUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20170816-15296-07801',
    sourcePageKey: '3512',
    storagePath: 'caterpillar/legacy/cat-3512-50hz-low-fuel-consumption-spec-sheet.pdf',
    label: 'Cat 3512 50 Hz Low Fuel Consumption Spec Sheet',
    type: 'datasheet',
    minBytes: 100_000,
    requiredTokens: ['Cat 3512', 'Diesel Generator Sets', '1120 eKW', '1020 eKW', '3512 PGB8'],
    slugs: ['caterpillar-3512'],
  },
  {
    key: 'electric-power-ratings-guide',
    sourceUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20180319-16263-55470',
    sourcePageKey: '3512B',
    storagePath: 'caterpillar/legacy/cat-electric-power-ratings-guide-3500-noncurrent.pdf',
    label: 'Cat Electric Power Ratings Guide - 3500 Non-Current Rows',
    type: 'datasheet',
    minBytes: 100_000,
    requiredTokens: ['3512B', '3516B', 'Low BSFC', 'Low Emissions', '1500', '2250'],
    slugs: ['caterpillar-3512b', 'caterpillar-3516b'],
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

function downloadText(url) {
  return execFileSync('curl', [
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
    url,
  ], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
}

function verifySourcePages() {
  for (const sourcePage of SOURCE_PAGES) {
    const text = downloadText(sourcePage.url)
    const missing = sourcePage.requiredTokens.filter((token) => !hasToken(text, token))
    if (missing.length) {
      throw new Error(`${sourcePage.url}: missing required token(s): ${missing.join(', ')}`)
    }
    console.log(`Verified Cat non-current source page: ${sourcePage.key}`)
  }
}

function downloadAndVerifyPdf(document) {
  const localPath = path.join(TMP_DIR, path.basename(document.storagePath))
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
    '300',
    '--user-agent',
    USER_AGENT,
    '--output',
    localPath,
    document.sourceUrl,
  ], {
    maxBuffer: 20 * 1024 * 1024,
  })

  const buffer = fs.readFileSync(localPath)
  if (buffer.length < document.minBytes || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.sourceUrl}: response is not a usable PDF`)
  }

  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const missing = document.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${document.storagePath}: missing required token(s): ${missing.join(', ')}`)
  }

  return {
    localPath,
    fileSizeBytes: buffer.length,
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

function buildReport({ existingCount, missing, verifiedDocs, linkedCount, skippedLinks, missingDocumentEngines, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 29 Cat 3500 Non-Current

Date: 2026-08-11

## Result

- Source-validated Caterpillar 3500-series non-current candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Cat PDF documents reviewed: \`${DOCUMENTS.length}\`
- Datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedLinks}\`
- Missing document target rows: \`${missingDocumentEngines.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Cyl | Power kW | Displacement L |
| --- | --- | --- | --- | ---: | ---: | ---: |
${missing.map((row) =>
  `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.cylinders ?? ''} | ${row.power_kw ?? ''} | ${row.displacement_l ?? ''} |`
).join('\n')}

## Document Attachments

| Document | Source | Storage path | Linked rows |
| --- | --- | --- | ---: |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.sourceUrl} | ${doc.storagePath} | ${doc.slugs.length} |`).join('\n')}

## Linked Engine Rows

| Document | Engine slugs |
| --- | --- |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.slugs.join('<br>')} |`).join('\n')}

## Validation Sources

${SOURCE_PAGES.map((page) => `- Cat ${page.key} non-current product page: ${page.url}`).join('\n')}
${DOCUMENTS.map((doc) => `- ${doc.label}: ${doc.sourceUrl}`).join('\n')}

## Notes

- Each row is backed by a Caterpillar H-CPC product page marked \`Non-Current\`.
- The 3512 row is attached to the model-specific Cat 3512 spec sheet; the 3512B and 3516B rows are attached to Cat's Electric Power Ratings Guide, which lists exact 3512B and 3516B diesel ratings.
- The Cat 3512 H-CPC page title and linked PDF validate the 3512 generator row. Its embedded engine-spec table contains unrelated C32 text, so this batch uses the page title, non-current status and Cat 3512 PDF for the row rather than copying that table.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Cat 3500 non-current legacy batch`)
verifySourcePages()

const verifiedDocs = DOCUMENTS.map((document) => {
  const verified = downloadAndVerifyPdf(document)
  console.log(`Verified ${document.label}: ${Math.round(verified.fileSizeBytes / 1024)}KB`)
  return { ...document, ...verified }
})

const existing = await fetchAllEngines(supabase)
const existingKeys = new Set(existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const missing = RECORDS.filter((row) => !existingKeys.has(`${row.brand}::${normalize(row.model)}`))
const existingCount = RECORDS.length - missing.length

console.log(`Candidates: ${RECORDS.length}; existing: ${existingCount}; missing: ${missing.length}`)

if (APPLY && missing.length) {
  const { error } = await supabase.from('engines').insert(missing)
  if (error) throw error
  console.log(`Inserted ${missing.length} Caterpillar legacy rows`)
}

const documentSlugs = [...new Set(DOCUMENTS.flatMap((document) => document.slugs))]
const { data: documentEngines, error: documentEngineError } = await supabase
  .from('engines')
  .select('id, slug, brand, model, status')
  .in('slug', documentSlugs)
if (documentEngineError) throw documentEngineError

const enginesBySlug = new Map((documentEngines ?? []).map((engine) => [engine.slug, engine]))
const missingDocumentEngines = documentSlugs.filter((slug) => !enginesBySlug.has(slug))
if (missingDocumentEngines.length) {
  console.warn(`Missing document target rows: ${missingDocumentEngines.join(', ')}`)
}

for (const engine of documentEngines ?? []) {
  if (engine.brand !== 'Caterpillar' || engine.status !== 'discontinued') {
    throw new Error(`Unexpected Cat document target: ${engine.slug} (${engine.brand}, ${engine.status})`)
  }
}

let linkedCount = 0
let skippedLinks = 0

if (APPLY) {
  for (const document of verifiedDocs) {
    const upload = await uploadPdf(supabase, BUCKET, document.localPath, document.storagePath)
    if (!upload.ok) throw new Error(`Upload failed: ${document.storagePath}`)

    for (const slug of document.slugs) {
      const engine = enginesBySlug.get(slug)
      if (!engine) continue

      const { data: existingLinks, error: existingError } = await supabase
        .from('engine_pdfs')
        .select('engine_id')
        .eq('engine_id', engine.id)
        .eq('storage_path', document.storagePath)
      if (existingError) throw existingError

      if (existingLinks?.length) {
        skippedLinks += 1
        continue
      }

      const { error: insertError } = await supabase.from('engine_pdfs').insert({
        engine_id: engine.id,
        type: document.type,
        label: document.label,
        storage_path: document.storagePath,
        file_size_bytes: upload.uploadedSizeBytes ?? document.fileSizeBytes,
      })
      if (insertError) throw insertError
      linkedCount += 1
      console.log(`Linked ${slug} -> ${document.storagePath}`)
    }
  }
} else {
  linkedCount = documentSlugs.length - missingDocumentEngines.length
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = await countLegacyCoverage(supabase)

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({
  existingCount,
  missing,
  verifiedDocs,
  linkedCount,
  skippedLinks,
  missingDocumentEngines,
  afterCount: APPLY ? afterCount : null,
  coverage: APPLY ? coverage : null,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
