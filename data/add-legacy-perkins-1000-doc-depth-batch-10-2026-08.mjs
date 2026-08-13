// Add one missing Perkins 1000 Series legacy row and exact datasheets for existing rows.
//
// Dry run:
//   node data/add-legacy-perkins-1000-doc-depth-batch-10-2026-08.mjs
// Apply:
//   node data/add-legacy-perkins-1000-doc-depth-batch-10-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-10-perkins-1000-doc-depth.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-perkins-1000-doc-depth-batch-10-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyPerkins1000Probe/1.0; +https://engines.haifengmachinery.com)'

const SOURCE_URLS = [
  'https://www.dieselpartsdirect.com/perkins-specification-sheets',
  'https://www.perkins.com/en_GB/company/heritage/products/perkins-1006.html',
  'https://www.perkins.com/en_GB/campaigns/powernews/global-focus/focus-on-perkins-heritage.html',
  'https://www.dieselpartsdirect.com/perkins-1000-series-engines',
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

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function kwToHp(kw) {
  return Math.round((kw / 0.7457) * 10) / 10
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

const RECORDS = [
  clean({
    slug: 'perkins-1004-4',
    brand: 'Perkins',
    model: '1004-4',
    series: '1000 Series',
    status: 'discontinued',
    year_discontinued: 2014,
    origin: 'United Kingdom',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'Unregulated',
    certifications: [],
    power_kw: 63.5,
    power_hp: kwToHp(63.5),
    displacement_l: 3.99,
    cylinders: 4,
    configuration: 'Inline-4, naturally aspirated industrial diesel',
    rpm_rated: 2600,
    compression_ratio: '16:1',
    description:
      'Perkins 1004-4 discontinued 1000 Series four-cylinder industrial diesel. '
      + 'The exact 1004-4 specification sheet is archived by Diesel Parts Direct, while Perkins heritage material documents the 1000 family and the end of 1006 production in 2014. '
      + 'This exact-model row is useful for owners searching older 1000 Series parts, rebuild kits, and engine replacements.',
  }),
]

const DOCUMENTS = [
  {
    slug: 'perkins-1004-4',
    model: '1004-4',
    sourceUrl: 'https://www.dieselpartsdirect.com/documents/perkins/1000-series-63.5kw.pdf',
    sourcePage: 'https://www.dieselpartsdirect.com/perkins-specification-sheets',
    storagePath: 'perkins/legacy/dpd-perkins-1004-4-industrial-63-5kw.pdf',
    label: 'Perkins 1004-4 Industrial 63.5 kW Specification Sheet',
    requiredTokens: [],
  },
  {
    slug: 'perkins-1006-6',
    model: '1006-6',
    sourceUrl: 'https://www.dieselpartsdirect.com/documents/perkins/1000-series-96.5kw.pdf',
    sourcePage: 'https://www.dieselpartsdirect.com/perkins-specification-sheets',
    storagePath: 'perkins/legacy/dpd-perkins-1006-6-industrial-96-5kw.pdf',
    label: 'Perkins 1006-6 Industrial 96.5 kW Specification Sheet',
    requiredTokens: [],
  },
  {
    slug: 'perkins-1006-6t',
    model: '1006-6T',
    sourceUrl: 'https://www.dieselpartsdirect.com/documents/perkins/1000-series-119kw.pdf',
    sourcePage: 'https://www.dieselpartsdirect.com/perkins-specification-sheets',
    storagePath: 'perkins/legacy/dpd-perkins-1006-6t-industrial-119kw.pdf',
    label: 'Perkins 1006-6T Industrial 119 kW Specification Sheet',
    requiredTokens: [],
  },
]

async function fetchAllEngines(supabase) {
  const engines = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, brand, model, slug')
      .range(from, from + 999)
    if (error) throw error
    engines.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return engines
}

function downloadAndVerifyPdf(document) {
  const localPath = path.join(TMP_DIR, path.basename(document.storagePath))
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
    '300',
    '--user-agent',
    USER_AGENT,
    '--referer',
    document.sourcePage,
    '--output',
    localPath,
    document.sourceUrl,
  ], {
    maxBuffer: 20 * 1024 * 1024,
  })

  const buffer = fs.readFileSync(localPath)
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.sourceUrl}: response is not a PDF`)
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

function buildReport({ existingCount, missing, verifiedDocs, linkedCount, skippedCount, afterCount }) {
  return `# Legacy Engine Model Discovery - Batch 10 Perkins 1000 Series Document Depth

Date: 2026-08-11

## Result

- Source-validated Perkins 1000 Series candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Datasheets ${APPLY ? 'linked' : 'verified'}: \`${APPLY ? linkedCount : verifiedDocs.length}\`
${APPLY ? `- Datasheet links skipped as existing: \`${skippedCount}\`\n` : ''}${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Power kW | Displacement L | RPM | Source sheet |
| --- | --- | --- | ---: | ---: | ---: | --- |
${missing.map((row) => {
  const doc = DOCUMENTS.find((item) => item.slug === row.slug)
  return `| ${row.brand} | ${row.model} | ${row.series} | ${row.power_kw ?? ''} | ${row.displacement_l ?? ''} | ${row.rpm_rated ?? ''} | ${doc?.sourceUrl ?? ''} |`
}).join('\n')}

## Datasheet Attachments

| Engine | Source sheet | Storage path |
| --- | --- | --- |
${DOCUMENTS.map((doc) => `| ${doc.model} | ${doc.sourceUrl} | ${doc.storagePath} |`).join('\n')}

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- This batch uses exact Diesel Parts Direct Perkins specification sheets for each attached model.
- \`1004-4\` is added as a distinct exact model rather than merging it into existing \`1004-40\` or \`1004-4T\` rows.
- \`704-30\` was reviewed but intentionally deferred: there is parts/spec support, but I did not find a discontinued-production source strong enough for this legacy import threshold.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Perkins 1000 Series legacy document-depth batch`)

const verifiedDocs = DOCUMENTS.map((document) => {
  const verified = downloadAndVerifyPdf(document)
  console.log(`Verified ${document.model} PDF: ${Math.round(verified.fileSizeBytes / 1024)}KB`)
  return {
    ...document,
    ...verified,
  }
})

const existing = await fetchAllEngines(supabase)
const existingKeys = new Set(
  existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`),
)
const missing = RECORDS.filter(
  (engine) => !existingKeys.has(`${engine.brand}::${normalize(engine.model)}`),
)

console.log(`Candidates: ${RECORDS.length}`)
console.log(`Already present: ${RECORDS.length - missing.length}`)
console.log(`Missing/new: ${missing.length}`)
for (const engine of missing) console.log(`${engine.brand}\t${engine.model}\t${engine.slug}`)

if (APPLY && missing.length) {
  const { data, error } = await supabase
    .from('engines')
    .upsert(missing, { onConflict: 'slug' })
    .select('id, brand, model, slug')
  if (error) throw error
  console.log(`Imported ${data.length} validated legacy Perkins record(s).`)
}

let linkedCount = 0
let skippedCount = 0

if (APPLY) {
  const { data: engineRows, error: engineError } = await supabase
    .from('engines')
    .select('id, slug, brand, model')
    .in('slug', DOCUMENTS.map((doc) => doc.slug))
  if (engineError) throw engineError

  const enginesBySlug = new Map(engineRows.map((engine) => [engine.slug, engine]))

  for (const document of verifiedDocs) {
    const engine = enginesBySlug.get(document.slug)
    if (!engine) throw new Error(`Missing engine row for document: ${document.slug}`)
    if (engine.brand !== 'Perkins' || normalize(engine.model) !== normalize(document.model)) {
      throw new Error(`Engine mismatch for ${document.slug}: ${engine.brand} ${engine.model}`)
    }

    const upload = await uploadPdf(supabase, BUCKET, document.localPath, document.storagePath)
    if (!upload.ok) throw new Error(`Upload failed: ${document.storagePath}`)

    const { data: existingLinks, error: existingError } = await supabase
      .from('engine_pdfs')
      .select('engine_id')
      .eq('engine_id', engine.id)
      .eq('storage_path', document.storagePath)
    if (existingError) throw existingError

    if (existingLinks?.length) {
      skippedCount += 1
      console.log(`Already linked ${document.storagePath}`)
      continue
    }

    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: document.fileSizeBytes,
    })
    if (insertError) throw insertError
    linkedCount += 1
    console.log(`Linked ${document.storagePath}`)
  }
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({
  existingCount: RECORDS.length - missing.length,
  missing,
  verifiedDocs,
  linkedCount,
  skippedCount,
  afterCount: APPLY ? afterCount : null,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
