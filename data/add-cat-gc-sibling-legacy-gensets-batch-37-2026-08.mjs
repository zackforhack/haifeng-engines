// Add source-validated Caterpillar GC sibling generator-set rows
// and attach exact official Cat GC spec sheets.
//
// Dry run:
//   node data/add-cat-gc-sibling-legacy-gensets-batch-37-2026-08.mjs
// Apply:
//   node data/add-cat-gc-sibling-legacy-gensets-batch-37-2026-08.mjs --apply

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
  'reports/legacy-engine-model-discovery-2026-08-11-batch-37-cat-gc-sibling-legacy-gensets.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-cat-gc-sibling-gensets-batch-37-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyCatGCSiblings/1.0; +https://engines.haifengmachinery.com)'

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

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function kwToHp(kw) {
  return Math.round((kw / 0.7457) * 10) / 10
}

function cat(input) {
  return clean({
    slug: `caterpillar-${slugify(input.model)}`,
    brand: 'Caterpillar',
    model: input.model,
    series: 'GC Diesel Generator Sets',
    status: 'discontinued',
    origin: 'United States',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: input.emissions,
    certifications: ['Official Caterpillar GC spec sheet', input.sourceCertification],
    power_kw: input.powerKw,
    power_hp: kwToHp(input.powerKw),
    displacement_l: input.displacement,
    cylinders: 6,
    configuration: input.configuration,
    rpm_rated: 1800,
    rpm_max: 1800,
    compression_ratio: input.compressionRatio,
    description:
      `Caterpillar ${input.model} discontinued/non-current GC diesel generator set. ` +
      `${input.sourceSentence} The official ${input.docCode} Cat GC spec sheet validates the ${input.ratingText} rating.`,
  })
}

const ENTRIES = [
  entry({
    key: 'd300-gc',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=105440&nc=1',
    pageTokens: ['Non-Current', 'Cat D300 GC Diesel Generator Sets', 'D300 GC Spec Sheet'],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20200325-8e87b-4858b',
    docCode: 'LEHE2024-05',
    docTokens: ['Cat® D300 GC', 'Diesel Generator Sets', 'D300 GC', '300 ekW', 'LEHE2024'],
    storagePath: 'caterpillar/legacy/cat-d300-gc-lehe2024-spec-sheet.pdf',
    label: 'Cat D300 GC Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'D300 GC Legacy Genset',
      powerKw: 300,
      displacement: 8.8,
      compressionRatio: '16.1:1',
      configuration: 'C9 inline-6 four-cycle diesel generator-set engine',
      emissions: 'EPA Tier 3 stationary emergency application',
      sourceCertification: 'Caterpillar Non-Current product page',
      sourceSentence: 'Cat H-CPC marks the D300 GC product page as Non-Current.',
      docCode: 'LEHE2024-05',
      ratingText: '300 ekW standby',
    }),
  }),
  entry({
    key: 'd400-gc',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=104660&nc=1',
    pageTokens: ['Non-Current', 'Cat D350 GC Diesel Generator Sets', 'D400 GC Spec Sheet'],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20200325-f250e-3860d',
    docCode: 'LEHE2009-08',
    docTokens: ['Cat® D400 GC', 'Diesel Generator Sets', 'D400 GC', '400 ekW', 'LEHE2009'],
    storagePath: 'caterpillar/legacy/cat-d400-gc-lehe2009-spec-sheet.pdf',
    label: 'Cat D400 GC Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'D400 GC Legacy Genset',
      powerKw: 400,
      displacement: 12.5,
      compressionRatio: '16.3:1',
      configuration: 'C13 inline-6 four-cycle diesel generator-set engine',
      emissions: 'EPA Tier 3 stationary emergency application',
      sourceCertification: 'Caterpillar Non-Current GC page document link',
      sourceSentence: 'Cat links the exact D400 GC spec sheet from the D350 GC Non-Current source page.',
      docCode: 'LEHE2009-08',
      ratingText: '400 ekW standby',
    }),
  }),
  entry({
    key: 'd500-gc',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=104680&nc=1',
    pageTokens: ['Non-Current', 'Cat D450 GC Diesel Generator Sets', 'D500 GC Spec Sheet'],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20200325-5c54d-f7d13',
    docCode: 'LEHE2011-09',
    docTokens: ['Cat® D500 GC', 'Diesel Generator Sets', 'D500 GC', '500 ekW', 'LEHE2011'],
    storagePath: 'caterpillar/legacy/cat-d500-gc-lehe2011-spec-sheet.pdf',
    label: 'Cat D500 GC Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'D500 GC Legacy Genset',
      powerKw: 500,
      displacement: 15.2,
      compressionRatio: '16.1:1',
      configuration: 'C15 inline-6 four-cycle diesel generator-set engine',
      emissions: 'EPA Tier 2 stationary emergency application',
      sourceCertification: 'Caterpillar Non-Current GC page document link',
      sourceSentence: 'Cat links the exact D500 GC spec sheet from the D450 GC Non-Current source page.',
      docCode: 'LEHE2011-09',
      ratingText: '500 ekW standby',
    }),
  }),
  entry({
    key: 'd600-gc',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=104682&nc=1',
    pageTokens: ['Non-Current', 'Cat D550 GC Diesel Generator Sets', 'D600 GC Spec Sheet'],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20200325-ea515-fa1c2',
    docCode: 'LEHE2013-10',
    docTokens: ['Cat® D600 GC', 'Diesel Generator Sets', 'D600 GC', '600 ekW', 'LEHE2013'],
    storagePath: 'caterpillar/legacy/cat-d600-gc-lehe2013-spec-sheet.pdf',
    label: 'Cat D600 GC Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'D600 GC Legacy Genset',
      powerKw: 600,
      displacement: 18.1,
      compressionRatio: '14.5:1',
      configuration: 'C18 inline-6 four-cycle diesel generator-set engine',
      emissions: 'EPA Tier 2 stationary emergency application',
      sourceCertification: 'Caterpillar Non-Current GC page document link',
      sourceSentence: 'Cat links the exact D600 GC spec sheet from the D550 GC Non-Current source page.',
      docCode: 'LEHE2013-10',
      ratingText: '600 ekW standby',
    }),
  }),
]

function entry(input) {
  return { ...input, slug: input.row.slug }
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

function verifyPage(entryItem) {
  const localPath = path.join(TMP_DIR, `${entryItem.key}.html`)
  download(entryItem.pageUrl, localPath)
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = entryItem.pageTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${entryItem.pageUrl}: missing required page token(s): ${missing.join(', ')}`)
  }
}

function verifyPdf(entryItem) {
  const localPath = path.join(TMP_DIR, path.basename(entryItem.storagePath))
  download(entryItem.docUrl, localPath, { referer: entryItem.pageUrl, maxTime: 300 })
  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 100_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${entryItem.docUrl}: response is not a usable PDF`)
  }
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const missing = entryItem.docTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${entryItem.storagePath}: missing required PDF token(s): ${missing.join(', ')}`)
  }
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

function buildReport({ missing, existingCount, verified, linkedCount, skippedCount, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 37 Cat GC Sibling Legacy Gensets

Date: 2026-08-11

## Result

- Official Cat GC candidates reviewed: \`${ENTRIES.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Official Cat PDF documents verified: \`${verified.length}\`
- Datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power kW | RPM | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
${missing.map((row) => {
  const source = ENTRIES.find((entryItem) => entryItem.slug === row.slug)?.pageUrl
  return `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.power_kw} | ${row.rpm_rated} | ${source} |`
}).join('\n')}

## Document Attachments

| Document | Source | Storage path | Target slug |
| --- | --- | --- | --- |
${ENTRIES.map((entryItem) => `| ${entryItem.label} | ${entryItem.docUrl} | ${entryItem.storagePath} | ${entryItem.slug} |`).join('\n')}

## Validation Sources

${ENTRIES.map((entryItem) => `- ${entryItem.row.model} source page: ${entryItem.pageUrl}`).join('\n')}
${ENTRIES.map((entryItem) => `- ${entryItem.label}: ${entryItem.docUrl}`).join('\n')}

## Notes

- D300 GC has its own official Cat H-CPC page marked \`Non-Current\`.
- D400 GC, D500 GC and D600 GC are added from exact official Cat GC spec sheets linked on adjacent Cat H-CPC non-current GC product pages.
- Rows are generator-set package rows, not replacements for generic active engine-family rows.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Cat GC sibling legacy genset batch`)
const verified = []
for (const entryItem of ENTRIES) {
  verifyPage(entryItem)
  const pdf = verifyPdf(entryItem)
  verified.push({ ...entryItem, ...pdf })
  console.log(`Verified ${entryItem.label}: ${Math.round(pdf.fileSizeBytes / 1024)}KB`)
}

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const before = await fetchAllEngines(supabase)
const existingKeys = new Set(before.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const rows = ENTRIES.map((entryItem) => entryItem.row)
const missing = rows.filter((row) => !existingKeys.has(`${row.brand}::${normalize(row.model)}`))
const existingCount = rows.length - missing.length
console.log(`Candidates: ${rows.length}; existing: ${existingCount}; missing: ${missing.length}`)

if (APPLY && missing.length) {
  const { error } = await supabase.from('engines').insert(missing)
  if (error) throw error
  console.log(`Inserted ${missing.length} Cat GC sibling legacy genset rows`)
}

const engines = APPLY && missing.length ? await fetchAllEngines(supabase) : before
const bySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let linkedCount = 0
let skippedCount = 0

for (const entryItem of verified) {
  const engine = bySlug.get(entryItem.slug)
  if (!engine) {
    if (APPLY) throw new Error(`Missing target row: ${entryItem.slug}`)
    continue
  }
  const { data: existingLinks, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('engine_id', engine.id)
    .eq('storage_path', entryItem.storagePath)
  if (existingError) throw existingError

  if (existingLinks?.length) {
    skippedCount += 1
    continue
  }
  if (!APPLY) {
    linkedCount += 1
    continue
  }
  const upload = await uploadPdf(supabase, BUCKET, entryItem.localPath, entryItem.storagePath)
  if (!upload.ok) throw new Error(`Upload failed: ${entryItem.storagePath}`)
  const { error: insertError } = await supabase.from('engine_pdfs').insert({
    engine_id: engine.id,
    type: 'datasheet',
    label: entryItem.label,
    storage_path: entryItem.storagePath,
    file_size_bytes: upload.uploadedSizeBytes ?? entryItem.fileSizeBytes,
  })
  if (insertError) throw insertError
  linkedCount += 1
}

const afterCount = APPLY ? engines.length : null
const coverage = APPLY ? await countLegacyCoverage(supabase) : null
await fsp.writeFile(
  REPORT_PATH,
  buildReport({ missing, existingCount, verified, linkedCount, skippedCount, afterCount, coverage }),
)
console.log(`Wrote ${REPORT_PATH}`)
