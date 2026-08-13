// Add source-validated DEUTZ legacy models from the official DEUTZ Engine Data Sheets
// archive and attach the matching official archive datasheets.
//
// Dry run:
//   node data/add-legacy-deutz-official-archive-batch-25-2026-08.mjs
// Apply:
//   node data/add-legacy-deutz-official-archive-batch-25-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-25-deutz-official-archive.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-deutz-official-archive-batch-25-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyDeutzOfficialArchive/1.0; +https://engines.haifengmachinery.com)'

const ARCHIVE_PAGE = 'https://www.deutz.com/germany/en/products/engines-archive/'
const PDF_BASE = 'https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/legacy'

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

function deutz(row) {
  return clean({
    slug: `deutz-${slugify(row.model)}`,
    brand: 'Deutz',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    origin: 'Germany',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: row.cooling_method,
    emissions_standard: 'Official DEUTZ archive legacy engine',
    certifications: [],
    power_kw: row.power_kw,
    power_hp: row.power_hp,
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    description: row.description,
  })
}

function row(model, series, cylinders, displacement_l, cooling_method, configuration, description) {
  return deutz({ model, series, cylinders, displacement_l, cooling_method, configuration, description })
}

const RECORDS = [
  row('BF4M2012', '2012 Series', 4, 4.038, 'Liquid-Cooled', 'Inline-4 turbocharged liquid-cooled diesel', 'DEUTZ BF4M2012 discontinued legacy diesel from the official DEUTZ Engine Data Sheets archive. The official BF 2012 archive datasheet lists BF4M2012, BF4M2012 C and BF6M2012 C variants.'),
  row('BF4M2012 C', '2012 Series', 4, 4.038, 'Liquid-Cooled', 'Inline-4 turbocharged charge-cooled liquid-cooled diesel', 'DEUTZ BF4M2012 C discontinued legacy diesel from the official DEUTZ Engine Data Sheets archive. The official BF 2012 archive datasheet lists BF4M2012 C as an exact variant.'),
  row('BF6M2012 C', '2012 Series', 6, 6.057, 'Liquid-Cooled', 'Inline-6 turbocharged charge-cooled liquid-cooled diesel', 'DEUTZ BF6M2012 C discontinued legacy diesel from the official DEUTZ Engine Data Sheets archive. The official BF 2012 archive datasheet lists BF6M2012 C as an exact variant.'),

  row('BF4M1013 EC', '1013 Series', 4, 4.764, 'Liquid-Cooled', 'Inline-4 turbocharged charge-cooled liquid-cooled diesel', 'DEUTZ BF4M1013 EC discontinued legacy diesel from the official DEUTZ Engine Data Sheets archive. The official BFM 1013 archive datasheet lists BF4M1013 EC and FC variants.'),
  row('BF4M1013 FC', '1013 Series', 4, 4.764, 'Liquid-Cooled', 'Inline-4 turbocharged charge-cooled liquid-cooled diesel', 'DEUTZ BF4M1013 FC discontinued legacy diesel from the official DEUTZ Engine Data Sheets archive. The official BFM 1013 archive datasheet lists BF4M1013 FC as an exact variant.'),
  row('BF6M1013 EC', '1013 Series', 6, 7.146, 'Liquid-Cooled', 'Inline-6 turbocharged charge-cooled liquid-cooled diesel', 'DEUTZ BF6M1013 EC discontinued legacy diesel from the official DEUTZ Engine Data Sheets archive. The official BFM 1013 archive datasheet lists BF6M1013 EC and FC variants.'),
  row('BF6M1013 FC', '1013 Series', 6, 7.146, 'Liquid-Cooled', 'Inline-6 turbocharged charge-cooled liquid-cooled diesel', 'DEUTZ BF6M1013 FC discontinued legacy diesel from the official DEUTZ Engine Data Sheets archive. The official BFM 1013 archive datasheet lists BF6M1013 FC as an exact variant.'),

  row('BF6M1015 C', '1015 Series', 6, 11.906, 'Liquid-Cooled', 'V6 turbocharged charge-cooled liquid-cooled diesel', 'DEUTZ BF6M1015 C discontinued legacy diesel from the official DEUTZ Engine Data Sheets archive. The official BFM 1015 archive datasheet lists BF6M1015 C and CP variants.'),
  row('BF6M1015 CP', '1015 Series', 6, 11.906, 'Liquid-Cooled', 'V6 turbocharged charge-cooled liquid-cooled diesel', 'DEUTZ BF6M1015 CP discontinued legacy diesel from the official DEUTZ Engine Data Sheets archive. The official BFM 1015 archive datasheet lists BF6M1015 CP as an exact variant.'),
  row('BF8M1015 C', '1015 Series', 8, 15.874, 'Liquid-Cooled', 'V8 turbocharged charge-cooled liquid-cooled diesel', 'DEUTZ BF8M1015 C discontinued legacy diesel from the official DEUTZ Engine Data Sheets archive. The official BFM 1015 archive datasheet lists BF8M1015 C and CP variants.'),
  row('BF8M1015 CP', '1015 Series', 8, 15.874, 'Liquid-Cooled', 'V8 turbocharged charge-cooled liquid-cooled diesel', 'DEUTZ BF8M1015 CP discontinued legacy diesel from the official DEUTZ Engine Data Sheets archive. The official BFM 1015 archive datasheet lists BF8M1015 CP as an exact variant.'),

  row('BF4L914', '914 Series', 4, 4.086, 'Air-Cooled', 'Inline-4 turbocharged air-cooled diesel', 'DEUTZ BF4L914 discontinued legacy air-cooled diesel from the official DEUTZ Engine Data Sheets archive. The official B/F 914 archive datasheet lists BF4L914, BF6L914 and BF6L914 C variants.'),
  row('BF6L914', '914 Series', 6, 6.128, 'Air-Cooled', 'Inline-6 turbocharged air-cooled diesel', 'DEUTZ BF6L914 discontinued legacy air-cooled diesel from the official DEUTZ Engine Data Sheets archive. The official B/F 914 archive datasheet lists BF6L914 as an exact variant.'),
  row('BF6L914 C', '914 Series', 6, 6.128, 'Air-Cooled', 'Inline-6 turbocharged charge-cooled air-cooled diesel', 'DEUTZ BF6L914 C discontinued legacy air-cooled diesel from the official DEUTZ Engine Data Sheets archive. The official B/F 914 archive datasheet lists BF6L914 C as an exact variant.'),

  row('D 2011 L04 O', '2011 Series', 4, 3.108, 'Oil-Cooled', 'Inline-4 oil-cooled diesel', 'DEUTZ D 2011 L04 O discontinued legacy diesel from the official DEUTZ Engine Data Sheets archive. The official D/TCD 2011 archive listing names D 2011 L04 O as an exact mobile-machinery variant.'),
  row('D 2011 L04 W', '2011 Series', 4, 3.108, 'Liquid-Cooled', 'Inline-4 liquid-cooled diesel', 'DEUTZ D 2011 L04 W discontinued legacy diesel from the official DEUTZ Engine Data Sheets archive. The official D/TCD 2011 archive listing names D 2011 L04 W as an exact mobile-machinery variant.'),
  row('D914 L04', '914 Series', 4, 4.086, 'Air-Cooled', 'Inline-4 air-cooled diesel', 'DEUTZ D914 L04 discontinued legacy air-cooled diesel from the official DEUTZ Engine Data Sheets archive. The official D 914 archive datasheet lists D914 L04 and D914 L06 variants.'),
  row('D914 L06', '914 Series', 6, 6.128, 'Air-Cooled', 'Inline-6 air-cooled diesel', 'DEUTZ D914 L06 discontinued legacy air-cooled diesel from the official DEUTZ Engine Data Sheets archive. The official D 914 archive datasheet lists D914 L06 as an exact variant.'),
]

const DOCUMENTS = [
  {
    key: 'bf2012',
    sourceUrl: `${PDF_BASE}/bfm_2012_mobile_machinery_en.pdf`,
    storagePath: 'deutz/legacy/deutz-bf-2012-official-archive-datasheet.pdf',
    label: 'DEUTZ BF 2012 Official Archive Datasheet',
    type: 'datasheet',
    requiredTokens: ['BF4M 2012', 'BF4M 2012 C', 'BF6M 2012 C'],
    slugs: ['deutz-bf4m2012', 'deutz-bf4m2012-c', 'deutz-bf6m2012-c'],
  },
  {
    key: 'bfm1013',
    sourceUrl: `${PDF_BASE}/BFM_1013_Mobile_machinery_EN.pdf`,
    storagePath: 'deutz/legacy/deutz-bfm-1013-official-archive-datasheet.pdf',
    label: 'DEUTZ BFM 1013 Official Archive Datasheet',
    type: 'datasheet',
    requiredTokens: ['BF4M1013EC', 'BF4M1013FC', 'BF6M1013EC', 'BF6M1013FC'],
    slugs: ['deutz-bf4m1013-ec', 'deutz-bf4m1013-fc', 'deutz-bf6m1013-ec', 'deutz-bf6m1013-fc'],
  },
  {
    key: 'bfm1015',
    sourceUrl: `${PDF_BASE}/bfm_1015_mobile_machinery_en.pdf`,
    storagePath: 'deutz/legacy/deutz-bfm-1015-official-archive-datasheet.pdf',
    label: 'DEUTZ BFM 1015 Official Archive Datasheet',
    type: 'datasheet',
    requiredTokens: ['BF6M 1015 C', 'BF6M 1015 CP', 'BF8M 1015 C', 'BF8M 1015 CP'],
    slugs: ['deutz-bf6m1015-c', 'deutz-bf6m1015-cp', 'deutz-bf8m1015-c', 'deutz-bf8m1015-cp'],
  },
  {
    key: 'bf914',
    sourceUrl: `${PDF_BASE}/BFL_914_Mobile_machinery_EN.pdf`,
    storagePath: 'deutz/legacy/deutz-bfl-914-official-archive-datasheet.pdf',
    label: 'DEUTZ B/F 914 Official Archive Datasheet',
    type: 'datasheet',
    requiredTokens: ['F4L914', 'BF4L914', 'BF6L914', 'BF6L914 C'],
    slugs: ['deutz-bf4l914', 'deutz-bf6l914', 'deutz-bf6l914-c'],
  },
  {
    key: 'd2011',
    sourceUrl: `${PDF_BASE}/TCD_2011_Mobile_machinery_EN.pdf`,
    storagePath: 'deutz/legacy/deutz-d-tcd-2011-official-archive-datasheet.pdf',
    label: 'DEUTZ D/TCD 2011 Official Archive Datasheet',
    type: 'datasheet',
    requiredTokens: ['D2011L2', 'D2011L3', 'D2011L4 W', 'TD2011L4 W'],
    slugs: [
      'deutz-d-2011-l02',
      'deutz-d-2011-l03',
      'deutz-d-2011-l04',
      'deutz-d-2011-l04-o',
      'deutz-d-2011-l04-w',
    ],
  },
  {
    key: 'bfm2011',
    sourceUrl: `${PDF_BASE}/BFM_2011_Mobile_machinery_EN.pdf`,
    storagePath: 'deutz/legacy/deutz-bfm-2011-official-archive-mobile-datasheet.pdf',
    label: 'DEUTZ BFM 2011 Official Archive Mobile Datasheet',
    type: 'datasheet',
    requiredTokens: ['BF4M 2011', 'BF4M 2011 C', 'Mobile Machinery'],
    slugs: ['deutz-bf-4m-2011', 'deutz-bf-4m-2011-c'],
  },
  {
    key: 'd914',
    sourceUrl: 'https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/mobile_machinery/d_914_mobile_machinery_en.pdf',
    storagePath: 'deutz/legacy/deutz-d914-official-archive-datasheet.pdf',
    label: 'DEUTZ D 914 Official Archive Datasheet',
    type: 'datasheet',
    requiredTokens: ['D 914 L4', 'D 914 L6'],
    slugs: ['deutz-d914-l04', 'deutz-d914-l06'],
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

function verifyArchivePage() {
  const text = downloadText(ARCHIVE_PAGE)
  const requiredTokens = [
    'BF 4M 2012',
    'BF 4M 1013 FC',
    'BFM 1015',
    'D 2011 L04 O',
    'D 914',
    'Engine Data Sheets',
  ]
  const missing = requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${ARCHIVE_PAGE}: missing expected archive token(s): ${missing.join(', ')}`)
  }
  console.log('Verified official DEUTZ engine archive page')
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
    ARCHIVE_PAGE,
    '--output',
    localPath,
    document.sourceUrl,
  ], {
    maxBuffer: 50 * 1024 * 1024,
  })

  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 50_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.sourceUrl}: response is not a usable PDF`)
  }

  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
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
  return `# Legacy Engine Model Discovery - Batch 25 DEUTZ Official Archive

Date: 2026-08-11

## Result

- Source-validated DEUTZ legacy candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Official DEUTZ archive PDFs reviewed: \`${DOCUMENTS.length}\`
- Datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedLinks}\`
- Missing document target rows: \`${missingDocumentEngines.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Displacement L | Cylinders | Cooling |
| --- | --- | --- | --- | ---: | ---: | --- |
${missing.map((item) => `| ${item.brand} | ${item.model} | ${item.series} | ${item.status} | ${item.displacement_l ?? ''} | ${item.cylinders ?? ''} | ${item.cooling_method ?? ''} |`).join('\n')}

## Document Attachments

| Document | Source | Storage path | Linked rows |
| --- | --- | --- | ---: |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.sourceUrl} | ${doc.storagePath} | ${doc.slugs.length} |`).join('\n')}

## Validation Sources

- Official DEUTZ Engine Data Sheets Archive: ${ARCHIVE_PAGE}
${DOCUMENTS.map((doc) => `- ${doc.label}: ${doc.sourceUrl}`).join('\n')}

## Notes

- This batch uses DEUTZ's official legacy datasheet archive rather than reseller listings for the inserted model identities.
- Rows are skipped idempotently when a normalized DEUTZ model identity already exists in the database.
- Exact power ratings are left blank in row data unless already present elsewhere; this pass focuses on model identity, family, displacement and document coverage from official archived datasheets.
- Existing uncovered discontinued DEUTZ rows are included as document targets only when the official PDF explicitly covers the family.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: DEUTZ official archive legacy batch`)
verifyArchivePage()

const verifiedDocs = DOCUMENTS.map((document) => {
  const verified = downloadAndVerifyPdf(document)
  console.log(`Verified ${document.label}: ${Math.round(verified.fileSizeBytes / 1024)}KB`)
  return { ...document, ...verified }
})

const existing = await fetchAllEngines(supabase)
const existingKeys = new Set(existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const missing = RECORDS.filter((item) => !existingKeys.has(`${item.brand}::${normalize(item.model)}`))
const existingCount = RECORDS.length - missing.length

console.log(`Candidates: ${RECORDS.length}; existing: ${existingCount}; missing: ${missing.length}`)

if (APPLY && missing.length) {
  const { error } = await supabase.from('engines').insert(missing)
  if (error) throw error
  console.log(`Inserted ${missing.length} DEUTZ legacy rows`)
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
  if (engine.brand !== 'Deutz' || engine.status !== 'discontinued') {
    throw new Error(`Unexpected DEUTZ document target: ${engine.slug} (${engine.brand}, ${engine.status})`)
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
