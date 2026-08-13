// Add source-validated Lister Petter TR Series legacy rows and attach
// matching public T Series workshop/manual data-sheet documents.
//
// Dry run:
//   node data/add-lister-petter-tr-legacy-batch-30-2026-08.mjs
// Apply:
//   node data/add-lister-petter-tr-legacy-batch-30-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-30-lister-petter-tr.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-lister-petter-tr-batch-30-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyListerPetterTR/1.0; +https://engines.haifengmachinery.com)'

const SOURCE_PAGES = [
  {
    url: 'https://engine.od.ua/lister',
    requiredTokens: ['LISTER-PETTER-TR1-TR2-TR3-TR-Series-TDS.pdf'],
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

function listerTR(row) {
  return clean({
    slug: `lister-petter-${slugify(row.model)}`,
    brand: 'Lister Petter',
    model: row.model,
    series: 'TR Series',
    status: 'discontinued',
    origin: 'United Kingdom',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Air-Cooled',
    emissions_standard: 'Legacy pre-current industrial emissions',
    certifications: ['Winget heritage archive', 'Engine.od.ua Lister Petter TR Series TDS'],
    cylinders: row.cylinders,
    configuration: row.configuration,
    description: row.description,
  })
}

const RECORDS = [
  listerTR({
    model: 'Lister Petter TR1',
    cylinders: 1,
    configuration: 'Single-cylinder naturally aspirated air-cooled direct-injection diesel',
    description:
      'Lister Petter TR1 discontinued legacy T Series diesel. Winget hosts the Lister Petter TS/TR/TX workshop manual, whose text identifies TS and TR one-, two- and three-cylinder naturally aspirated flywheel-fan air-cooled direct-injection engines; Engine.od.ua also hosts a TR1/TR2/TR3 TR Series technical data sheet.',
  }),
  listerTR({
    model: 'Lister Petter TR2',
    cylinders: 2,
    configuration: 'Twin-cylinder naturally aspirated air-cooled direct-injection diesel',
    description:
      'Lister Petter TR2 discontinued legacy T Series diesel. Winget hosts the Lister Petter TS/TR/TX workshop manual, whose text identifies TS and TR one-, two- and three-cylinder naturally aspirated flywheel-fan air-cooled direct-injection engines; Engine.od.ua also hosts a TR1/TR2/TR3 TR Series technical data sheet.',
  }),
  listerTR({
    model: 'Lister Petter TR3',
    cylinders: 3,
    configuration: 'Three-cylinder naturally aspirated air-cooled direct-injection diesel',
    description:
      'Lister Petter TR3 discontinued legacy T Series diesel. Winget hosts the Lister Petter TS/TR/TX workshop manual, whose text identifies TS and TR one-, two- and three-cylinder naturally aspirated flywheel-fan air-cooled direct-injection engines; Engine.od.ua also hosts a TR1/TR2/TR3 TR Series technical data sheet.',
  }),
]

const DOCUMENTS = [
  {
    key: 't-series-workshop',
    sourceUrl:
      'https://www.winget.co.uk/document/LISTER%20PETTER%20T%20SERIES%20WORKSHOP%20MANUAL%20EDITION%2012%20MAY%202005.pdf',
    sourcePage: 'https://www.winget.co.uk/parts-service/heritage-machines/',
    storagePath: 'lister-petter/legacy/lister-petter-t-series-workshop-manual-edition-12-2005.pdf',
    label: 'Lister Petter T Series TS/TR/TX Workshop Manual Edition 12',
    type: 'manual',
    minBytes: 1_000_000,
    requiredTokens: ['TS, TR, TX', 'Workshop Manual', 'May 2005', 'TS/TR1', 'TS/TR2', 'TS/TR3'],
    slugs: [
      'lister-petter-lister-petter-tr1',
      'lister-petter-lister-petter-tr2',
      'lister-petter-lister-petter-tr3',
    ],
  },
  {
    key: 'tr-series-tds',
    sourceUrl: 'https://engine.od.ua/ufiles/LISTER-PETTER-TR1-TR2-TR3-TR-Series-TDS.pdf',
    sourcePage: 'https://engine.od.ua/lister',
    storagePath: 'lister-petter/legacy/lister-petter-tr1-tr2-tr3-tr-series-tds.pdf',
    label: 'Lister Petter TR1/TR2/TR3 TR Series Technical Data Sheet',
    type: 'datasheet',
    minBytes: 100_000,
    requiredTokens: [],
    visualProof:
      'Scanned/image PDF from Engine.od.ua Lister page; source filename explicitly identifies TR1, TR2 and TR3 TR Series TDS.',
    slugs: [
      'lister-petter-lister-petter-tr1',
      'lister-petter-lister-petter-tr2',
      'lister-petter-lister-petter-tr3',
    ],
  },
]

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
    console.log(`Verified source page: ${sourcePage.url}`)
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
    maxBuffer: 50 * 1024 * 1024,
  })

  const buffer = fs.readFileSync(localPath)
  if (buffer.length < document.minBytes || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.sourceUrl}: response is not a usable PDF`)
  }

  if (document.requiredTokens.length) {
    const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
    })
    const missing = document.requiredTokens.filter((token) => !hasToken(text, token))
    if (missing.length) {
      throw new Error(`${document.storagePath}: missing required token(s): ${missing.join(', ')}`)
    }
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
  return `# Legacy Engine Model Discovery - Batch 30 Lister Petter TR Series

Date: 2026-08-11

## Result

- Source-validated Lister Petter TR candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- TR Series PDF documents reviewed: \`${DOCUMENTS.length}\`
- Datasheet/manual links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedLinks}\`
- Missing document target rows: \`${missingDocumentEngines.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Cyl | Cooling | Configuration |
| --- | --- | --- | --- | ---: | --- | --- |
${missing.map((row) =>
  `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.cylinders ?? ''} | ${row.cooling_method ?? ''} | ${row.configuration ?? ''} |`
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

${SOURCE_PAGES.map((page) => `- ${page.url}`).join('\n')}
${DOCUMENTS.map((doc) => `- ${doc.label}: ${doc.sourceUrl}`).join('\n')}

## Notes

- This batch adds only the missing TR rows. Existing TS/TX rows already had T Series manual coverage from batch 11.
- The Winget-hosted workshop manual PDF text explicitly identifies \`TS, TR, TX\`, \`TS/TR1\`, \`TS/TR2\`, and \`TS/TR3\`, and describes TS/TR engines as one-, two- and three-cylinder naturally aspirated flywheel-fan air-cooled direct-injection engines.
- The Engine.od.ua TR Series technical data sheet is a scanned/image PDF; it is validated by the source page link, PDF header, size, and exact filename rather than copied OCR text.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Lister Petter TR Series legacy batch`)
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
  console.log(`Inserted ${missing.length} Lister Petter TR rows`)
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
  if (engine.brand !== 'Lister Petter' || engine.status !== 'discontinued') {
    throw new Error(`Unexpected Lister Petter document target: ${engine.slug} (${engine.brand}, ${engine.status})`)
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
  linkedCount = documentSlugs.length * DOCUMENTS.length - missingDocumentEngines.length
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
