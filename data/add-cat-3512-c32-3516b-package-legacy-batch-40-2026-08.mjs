// Add source-validated Caterpillar non-current 3512/C32/3516B generator-set rows
// and attach exact official Cat spec sheets.
//
// Dry run:
//   node data/add-cat-3512-c32-3516b-package-legacy-batch-40-2026-08.mjs
// Apply:
//   node data/add-cat-3512-c32-3516b-package-legacy-batch-40-2026-08.mjs --apply

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
  'reports/legacy-engine-model-discovery-2026-08-12-batch-40-cat-3512-c32-3516b-package-legacy.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-cat-3512-c32-3516b-package-gensets-batch-40-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyCat3512C323516B/1.0; +https://engines.haifengmachinery.com)'

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
    series: input.series,
    status: 'discontinued',
    origin: 'United States',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: input.emissions,
    certifications: ['Caterpillar Non-Current product page', 'Official Caterpillar spec sheet'],
    power_kw: input.powerKw,
    power_hp: kwToHp(input.powerKw),
    displacement_l: input.displacement,
    cylinders: input.cylinders,
    configuration: input.configuration,
    rpm_rated: input.rpm,
    rpm_max: input.rpm,
    compression_ratio: input.compressionRatio,
    description:
      `Caterpillar ${input.model} discontinued/non-current diesel generator-set package. ` +
      `Cat H-CPC marks the source page as Non-Current and links the official ${input.docCode} ` +
      `Cat spec sheet validating the ${input.ratingText} rating.`,
  })
}

const ENTRIES = [
  entry({
    key: '3512-50hz-1000-1400kva',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000001870&nc=1',
    pageTokens: [
      'Non-Current',
      '3512 (50 Hz) with Upgradeable Package',
      '3512, 50 Hz, 1000-1400 kVA, Low Fuel Consumption Spec Sheet',
    ],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20170816-15296-07801',
    docCode: 'LEHE1291-06',
    docTokens: ['Cat® 3512', 'Diesel Generator Sets', '1400 (1120)', '1000 (800)', 'LEHE1291'],
    storagePath: 'caterpillar/legacy/cat-3512-50hz-1000-1400kva-lehe1291-spec-sheet.pdf',
    label: 'Cat 3512 50 Hz 1000-1400 kVA Low Fuel Consumption Spec Sheet',
    row: cat({
      model: '3512 50 Hz 1000-1400 kVA Legacy Genset',
      series: '3512',
      powerKw: 1120,
      displacement: 51.8,
      cylinders: 12,
      rpm: 1500,
      compressionRatio: '13.5:1',
      configuration: '3512 V-12 four-stroke water-cooled diesel generator-set engine',
      emissions: 'Low Fuel Consumption',
      docCode: 'LEHE1291-06',
      ratingText: '1400 kVA / 1120 ekW standby and 1000 kVA / 800 ekW continuous',
    }),
  }),
  entry({
    key: 'c32-60hz-830-1000ekw',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000028915&nc=1',
    pageTokens: [
      'Non-Current',
      'C32 (60 Hz) with Upgradeable Package',
      'C32, 60 Hz, 830-1000 ekW, Low Fuel Consumption Spec Sheet',
    ],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20180321-36240-65002',
    docCode: 'LEHE1626-02',
    docTokens: ['Cat® C32', 'Diesel Generator Sets', '1000 ekW', '830 ekW', 'LEHE1626'],
    storagePath: 'caterpillar/legacy/cat-c32-60hz-830-1000ekw-lehe1626-spec-sheet.pdf',
    label: 'Cat C32 60 Hz 830-1000 ekW Low Fuel Consumption Spec Sheet',
    row: cat({
      model: 'C32 60 Hz 830-1000 ekW Legacy Genset',
      series: 'C32',
      powerKw: 1000,
      displacement: 32.1,
      cylinders: 12,
      rpm: 1800,
      compressionRatio: '15.0:1',
      configuration: 'C32 V-12 four-stroke water-cooled diesel generator-set engine',
      emissions: 'Low Fuel Consumption',
      docCode: 'LEHE1626-02',
      ratingText: '1000 ekW standby and 830 ekW continuous',
    }),
  }),
  entry({
    key: '3516b-50hz-1750-2250kva',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000033459&nc=1',
    pageTokens: [
      'Non-Current',
      '3516B (50 Hz)',
      '3516B, 50 Hz, 1750-2250 kVA, Low Fuel Consumption / Low Emissions Spec Sheet',
    ],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20180613-31502-61470',
    docCode: 'LEHE1281-00',
    docTokens: ['Cat® 3516B', 'Diesel Generator Sets', '2250 kVA', '1750 kVA', 'LEHE1281'],
    storagePath: 'caterpillar/legacy/cat-3516b-50hz-1750-2250kva-lehe1281-spec-sheet.pdf',
    label: 'Cat 3516B 50 Hz 1750-2250 kVA Low Fuel/Low Emissions Spec Sheet',
    row: cat({
      model: '3516B 50 Hz 1750-2250 kVA Legacy Genset',
      series: '3516B',
      powerKw: 1800,
      displacement: 69,
      cylinders: 16,
      rpm: 1500,
      compressionRatio: '14.0:1',
      configuration: '3516B V-16 four-stroke water-cooled diesel generator-set engine',
      emissions: 'Low Fuel Consumption or Low Emissions',
      docCode: 'LEHE1281-00',
      ratingText: '2250 kVA / 1800 ekW standby and 1750 kVA / 1400 ekW continuous',
    }),
  }),
  entry({
    key: '3516b-50hz-2000-2500kva',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000033459&nc=1',
    pageTokens: [
      'Non-Current',
      '3516B (50 Hz)',
      '3516B, 50 Hz, 2000-2500 kVA, Low Fuel Consumption / Low Emissions Spec Sheet',
    ],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20180613-31329-22820',
    docCode: 'LEHE1282-00',
    docTokens: ['Cat® 3516B', 'Diesel Generator Sets', '2500 kVA', '2000 kVA', 'LEHE1282'],
    storagePath: 'caterpillar/legacy/cat-3516b-50hz-2000-2500kva-lehe1282-spec-sheet.pdf',
    label: 'Cat 3516B 50 Hz 2000-2500 kVA Low Fuel/Low Emissions Spec Sheet',
    row: cat({
      model: '3516B 50 Hz 2000-2500 kVA Legacy Genset',
      series: '3516B',
      powerKw: 2000,
      displacement: 78.08,
      cylinders: 16,
      rpm: 1500,
      compressionRatio: '15.5:1',
      configuration: '3516B V-16 four-stroke water-cooled diesel generator-set engine',
      emissions: 'Low Fuel Consumption or Low Emissions',
      docCode: 'LEHE1282-00',
      ratingText: '2500 kVA / 2000 ekW standby and 2000 kVA / 1600 ekW continuous',
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
  return `# Legacy Engine Model Discovery - Batch 40 Cat 3512/C32/3516B Package Legacy Gensets

Date: 2026-08-12

## Result

- Official Cat non-current/package candidates reviewed: \`${ENTRIES.length}\`
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

${ENTRIES.map((entryItem) => `- ${entryItem.row.model} non-current source page: ${entryItem.pageUrl}`).join('\n')}
${ENTRIES.map((entryItem) => `- ${entryItem.label}: ${entryItem.docUrl}`).join('\n')}

## Notes

- This batch uses Caterpillar official H-CPC pages marked \`Non-Current\` and exact Cat spec sheets.
- A stale 3516B upgradeable-package Scene7 link was rejected before import because it returned 404.
- Rows are generator-set package rows, not replacements for generic active engine-family rows.
- kVA-only Cat package rows use 0.8 power factor for \`power_kw\`.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Cat 3512/C32/3516B package legacy genset batch`)
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
  console.log(`Inserted ${missing.length} Cat 3512/C32/3516B package legacy genset rows`)
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
