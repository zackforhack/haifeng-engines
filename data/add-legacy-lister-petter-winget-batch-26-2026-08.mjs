// Add source-validated Lister/Petter legacy models from Winget's heritage archive
// and attach the matching scanned workshop manuals.
//
// Dry run:
//   node data/add-legacy-lister-petter-winget-batch-26-2026-08.mjs
// Apply:
//   node data/add-legacy-lister-petter-winget-batch-26-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-26-lister-petter-winget.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-lister-petter-winget-batch-26-2026-08')
const SOURCE_PAGE = 'https://www.winget.co.uk/parts-service/heritage-machines/'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyListerPetterWinget/1.0; +https://engines.haifengmachinery.com)'

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

function lister(row) {
  return clean({
    slug: `lister-petter-${slugify(row.model)}`,
    brand: 'Lister Petter',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    origin: 'United Kingdom',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: row.cooling_method,
    emissions_standard: 'Legacy pre-current industrial emissions',
    certifications: [],
    cylinders: row.cylinders,
    configuration: row.configuration,
    description: row.description,
  })
}

const RECORDS = [
  lister({
    model: 'LT1',
    series: 'L Series',
    cylinders: 1,
    cooling_method: 'Air-Cooled',
    configuration: 'Single-cylinder air-cooled diesel',
    description:
      'Lister Petter LT1 discontinued legacy L Series diesel. Winget heritage archive hosts the Lister Petter L Series workshop manual whose cover explicitly lists Types LT1, LT2, LV1 and LV2.',
  }),
  lister({
    model: 'LT2',
    series: 'L Series',
    cylinders: 2,
    cooling_method: 'Air-Cooled',
    configuration: 'Twin-cylinder air-cooled diesel',
    description:
      'Lister Petter LT2 discontinued legacy L Series diesel. Winget heritage archive hosts the Lister Petter L Series workshop manual whose cover explicitly lists Types LT1, LT2, LV1 and LV2.',
  }),
  lister({
    model: 'LV1',
    series: 'L Series',
    cylinders: 1,
    cooling_method: 'Air-Cooled',
    configuration: 'Single-cylinder air-cooled diesel',
    description:
      'Lister Petter LV1 discontinued legacy L Series diesel. Winget heritage archive hosts the Lister Petter L Series workshop manual whose cover explicitly lists Types LT1, LT2, LV1 and LV2.',
  }),
  lister({
    model: 'LV2',
    series: 'L Series',
    cylinders: 2,
    cooling_method: 'Air-Cooled',
    configuration: 'Twin-cylinder air-cooled diesel',
    description:
      'Lister Petter LV2 discontinued legacy L Series diesel. Winget heritage archive hosts the Lister Petter L Series workshop manual whose cover explicitly lists Types LT1, LT2, LV1 and LV2.',
  }),
  lister({
    model: 'HR2',
    series: 'HR/HRW Series',
    cylinders: 2,
    cooling_method: 'Air-Cooled',
    configuration: 'Twin-cylinder industrial diesel',
    description:
      'Lister HR2 discontinued legacy diesel. Winget heritage archive hosts the Lister HR & HRW workshop manual, whose cover identifies HR & HRW industrial/marine diesel engines for 2- and 3-cylinder models.',
  }),
  lister({
    model: 'HR3',
    series: 'HR/HRW Series',
    cylinders: 3,
    cooling_method: 'Air-Cooled',
    configuration: 'Three-cylinder industrial diesel',
    description:
      'Lister HR3 discontinued legacy diesel. Winget heritage archive hosts the Lister HR & HRW workshop manual, whose cover identifies HR & HRW industrial/marine diesel engines for 2- and 3-cylinder models.',
  }),
  lister({
    model: 'HRW2',
    series: 'HR/HRW Series',
    cylinders: 2,
    cooling_method: 'Liquid-Cooled',
    configuration: 'Twin-cylinder water-cooled industrial diesel',
    description:
      'Lister HRW2 discontinued legacy diesel. Winget heritage archive hosts the Lister HR & HRW workshop manual, whose cover identifies HR & HRW industrial/marine diesel engines for 2- and 3-cylinder models.',
  }),
  lister({
    model: 'HRW3',
    series: 'HR/HRW Series',
    cylinders: 3,
    cooling_method: 'Liquid-Cooled',
    configuration: 'Three-cylinder water-cooled industrial diesel',
    description:
      'Lister HRW3 discontinued legacy diesel. Winget heritage archive hosts the Lister HR & HRW workshop manual, whose cover identifies HR & HRW industrial/marine diesel engines for 2- and 3-cylinder models.',
  }),
  lister({
    model: 'Petter PH1',
    series: 'Petter PH Range',
    cylinders: 1,
    cooling_method: 'Air-Cooled',
    configuration: 'Single-cylinder air-cooled diesel',
    description:
      'Petter PH1 discontinued legacy diesel. Winget heritage archive links a Petter PH1/PH2 and PHW1/PHW2 workshop manual, and the scanned cover identifies the PH Range workshop manual.',
  }),
  lister({
    model: 'Petter PH2',
    series: 'Petter PH Range',
    cylinders: 2,
    cooling_method: 'Air-Cooled',
    configuration: 'Twin-cylinder air-cooled diesel',
    description:
      'Petter PH2 discontinued legacy diesel. Winget heritage archive links a Petter PH1/PH2 and PHW1/PHW2 workshop manual, and the scanned cover identifies the PH Range workshop manual.',
  }),
  lister({
    model: 'Petter PHW1',
    series: 'Petter PH Range',
    cylinders: 1,
    cooling_method: 'Liquid-Cooled',
    configuration: 'Single-cylinder water-cooled diesel',
    description:
      'Petter PHW1 discontinued legacy diesel. Winget heritage archive links a Petter PH1/PH2 and PHW1/PHW2 workshop manual, and the scanned cover identifies the PH Range workshop manual.',
  }),
  lister({
    model: 'Petter PHW2',
    series: 'Petter PH Range',
    cylinders: 2,
    cooling_method: 'Liquid-Cooled',
    configuration: 'Twin-cylinder water-cooled diesel',
    description:
      'Petter PHW2 discontinued legacy diesel. Winget heritage archive links a Petter PH1/PH2 and PHW1/PHW2 workshop manual, and the scanned cover identifies the PH Range workshop manual.',
  }),
]

const DOCUMENTS = [
  {
    key: 'l-series',
    sourceUrl: 'https://www.winget.co.uk/wp-content/uploads/2020/12/LISTER-PETTER-L-SERIES-WORKSHOP-MANUAL.pdf',
    storagePath: 'lister-petter/legacy/lister-petter-l-series-lt-lv-workshop-manual.pdf',
    label: 'Lister Petter L Series LT/LV Workshop Manual',
    type: 'manual',
    pageNeedle: 'LISTER-PETTER-L-SERIES-WORKSHOP-MANUAL.pdf',
    minBytes: 1_000_000,
    // Scanned PDF: model names were visually verified on the rendered cover page.
    requiredTokens: [],
    visualProof: 'Cover page reads "Types: LT1, LT2, LV1 and LV2".',
    slugs: ['lister-petter-lt1', 'lister-petter-lt2', 'lister-petter-lv1', 'lister-petter-lv2'],
  },
  {
    key: 'hr-hrw',
    sourceUrl: 'https://www.winget.co.uk/wp-content/uploads/2020/12/R.A.-LISTER-HR3-WORKSHOP-MANUAL.pdf',
    storagePath: 'lister-petter/legacy/lister-hr-hrw-workshop-manual.pdf',
    label: 'Lister HR/HRW Workshop Manual',
    type: 'manual',
    pageNeedle: 'R.A.-LISTER-HR3-WORKSHOP-MANUAL.pdf',
    minBytes: 1_000_000,
    requiredTokens: [],
    visualProof: 'Cover page reads "HR & HRW Industrial - Marine Diesel Engines (2 and 3 Cylinder)".',
    slugs: ['lister-petter-hr2', 'lister-petter-hr3', 'lister-petter-hrw2', 'lister-petter-hrw3'],
  },
  {
    key: 'ph',
    sourceUrl: 'https://www.winget.co.uk/wp-content/uploads/2020/12/PETTER-PH1-2-AND-PHW1-2-WORKSHOP-MANUAL.pdf',
    storagePath: 'lister-petter/legacy/petter-ph1-ph2-phw1-phw2-workshop-manual.pdf',
    label: 'Petter PH1/PH2/PHW1/PHW2 Workshop Manual',
    type: 'manual',
    pageNeedle: 'PETTER-PH1-2-AND-PHW1-2-WORKSHOP-MANUAL.pdf',
    minBytes: 1_000_000,
    requiredTokens: [],
    visualProof: 'Winget link filename names PH1-2 and PHW1-2; cover page reads "PH Range Workshop Manual".',
    slugs: [
      'lister-petter-petter-ph1',
      'lister-petter-petter-ph2',
      'lister-petter-petter-phw1',
      'lister-petter-petter-phw2',
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

function verifySourcePage() {
  const text = downloadText(SOURCE_PAGE)
  const missing = DOCUMENTS
    .map((document) => document.pageNeedle)
    .filter((needle) => !text.includes(needle))
  if (missing.length) {
    throw new Error(`${SOURCE_PAGE}: missing expected Winget PDF link(s): ${missing.join(', ')}`)
  }
  console.log('Verified Winget heritage source page')
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
    '--http1.1',
    '--connect-timeout',
    '30',
    '--max-time',
    '300',
    '--user-agent',
    USER_AGENT,
    '--referer',
    SOURCE_PAGE,
    '--output',
    localPath,
    document.sourceUrl,
  ], {
    maxBuffer: 80 * 1024 * 1024,
  })

  const buffer = fs.readFileSync(localPath)
  if (buffer.length < document.minBytes || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.sourceUrl}: response is not a usable PDF`)
  }

  if (document.requiredTokens.length) {
    const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
      encoding: 'utf8',
      maxBuffer: 80 * 1024 * 1024,
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
  return `# Legacy Engine Model Discovery - Batch 26 Lister/Petter Winget

Date: 2026-08-11

## Result

- Source-validated Lister/Petter legacy candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Winget scanned manuals reviewed: \`${DOCUMENTS.length}\`
- Manual links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedLinks}\`
- Missing document target rows: \`${missingDocumentEngines.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Cylinders | Cooling |
| --- | --- | --- | --- | ---: | --- |
${missing.map((row) => `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.cylinders ?? ''} | ${row.cooling_method ?? ''} |`).join('\n')}

## Document Attachments

| Document | Source | Storage path | Linked rows | Visual proof |
| --- | --- | --- | ---: | --- |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.sourceUrl} | ${doc.storagePath} | ${doc.slugs.length} | ${doc.visualProof} |`).join('\n')}

## Validation Sources

- Winget heritage machines archive: ${SOURCE_PAGE}
${DOCUMENTS.map((doc) => `- ${doc.label}: ${doc.sourceUrl}`).join('\n')}

## Notes

- Winget states the heritage manuals are reproduced for machines and engines that are no longer in production and still in service.
- These manuals are scanned image PDFs, so validation uses the Winget source-page link text, PDF header, file size and rendered-cover visual checks rather than unreliable OCR text extraction.
- ST Range and PJ Range manuals were probed but intentionally excluded from this batch because the verified cover pages did not prove exact submodel identities strongly enough.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Lister/Petter Winget legacy batch`)
verifySourcePage()

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
  console.log(`Inserted ${missing.length} Lister/Petter legacy rows`)
}

const allDocumentSlugs = [...new Set(DOCUMENTS.flatMap((document) => document.slugs))]
const { data: documentEngines, error: documentEngineError } = await supabase
  .from('engines')
  .select('id, slug, brand, model, status')
  .in('slug', allDocumentSlugs)
if (documentEngineError) throw documentEngineError

const enginesBySlug = new Map((documentEngines ?? []).map((engine) => [engine.slug, engine]))
const missingDocumentEngines = allDocumentSlugs.filter((slug) => !enginesBySlug.has(slug))
if (missingDocumentEngines.length) {
  console.warn(`Missing document target rows: ${missingDocumentEngines.join(', ')}`)
}

for (const engine of documentEngines ?? []) {
  if (engine.brand !== 'Lister Petter' || engine.status !== 'discontinued') {
    throw new Error(`Unexpected Lister/Petter document target: ${engine.slug} (${engine.brand}, ${engine.status})`)
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
  linkedCount = allDocumentSlugs.length - missingDocumentEngines.length
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
