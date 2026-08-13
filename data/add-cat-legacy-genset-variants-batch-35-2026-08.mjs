// Add source-validated Caterpillar non-current generator-set engine variants
// and attach exact official Cat spec sheets.
//
// Dry run:
//   node data/add-cat-legacy-genset-variants-batch-35-2026-08.mjs
// Apply:
//   node data/add-cat-legacy-genset-variants-batch-35-2026-08.mjs --apply

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
  'reports/legacy-engine-model-discovery-2026-08-11-batch-35-cat-legacy-genset-variants.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-cat-genset-variants-batch-35-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyCatGensets/1.0; +https://engines.haifengmachinery.com)'

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
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
    certifications: ['Caterpillar Non-Current product page', ...input.certifications],
    power_kw: input.powerKw,
    power_hp: kwToHp(input.powerKw),
    displacement_l: input.displacement,
    cylinders: input.cylinders,
    configuration: input.configuration,
    rpm_rated: input.rpm,
    rpm_max: input.rpm,
    compression_ratio: input.compressionRatio,
    description:
      `Caterpillar ${input.model} discontinued/non-current diesel generator-set variant. ` +
      `Cat H-CPC marks the source page as Non-Current and links the official ${input.docCode} ` +
      `Cat spec sheet validating the ${input.ratingText} rating.`,
  })
}

const ENTRIES = [
  entry({
    key: 'c4-4-60hz',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000028996&nc=1',
    pageTokens: ['Non-Current', 'Cat C4.4 (60 Hz) Diesel Generator Sets', 'C4.4, In-line 4, 4-cycle diesel'],
    docUrl: 'https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1049-',
    docCode: 'LEHE1049-05',
    docTokens: ['Cat® C4.4', 'Diesel Generator Sets', 'D60-4LC', '60 ekW', 'LEHE1049'],
    storagePath: 'caterpillar/legacy/cat-c4-4-60hz-lehe1049-spec-sheet.pdf',
    label: 'Cat C4.4 D60-4LC 60 Hz Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'C4.4 60 Hz Legacy Genset',
      series: 'C4.4',
      powerKw: 60,
      displacement: 4.4,
      cylinders: 4,
      rpm: 1800,
      compressionRatio: '18.2:1',
      configuration: 'Inline-4 four-cycle turbocharged diesel generator-set engine',
      emissions: 'U.S. EPA Tier 3',
      certifications: ['U.S. EPA Tier 3'],
      docCode: 'LEHE1049-05',
      ratingText: '60 ekW standby',
    }),
  }),
  entry({
    key: 'c7-1-tier4-60hz',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=15970441&nc=1',
    pageTokens: ['Non-Current', 'Cat C7.1 Tier 4 (60 Hz) Diesel Generator Sets', 'C7.1  I-6, 4-Cycle Diesel'],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20160906-11220-17609',
    docCode: 'CM20160906-11220-17609',
    docTokens: ['Cat C7.1', 'DIESEL GENERATOR SETS', 'DE200E0', '175 ekW', 'Engine Model'],
    storagePath: 'caterpillar/legacy/cat-c7-1-tier4-60hz-de200e0-spec-sheet.pdf',
    label: 'Cat C7.1 DE200E0 60 Hz Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'C7.1 Tier 4 60 Hz Legacy Genset',
      series: 'C7.1',
      powerKw: 200,
      displacement: 7.01,
      cylinders: 6,
      rpm: 1800,
      configuration: 'Inline-6 four-cycle turbocharged air-to-air aftercooled diesel generator-set engine',
      emissions: 'U.S. EPA Tier 3 / Tier 4 product-page lineage',
      certifications: ['U.S. EPA certified product-page lineage'],
      docCode: 'CM20160906-11220-17609',
      ratingText: '114-200 ekW product-page range / DE200E0 175 ekW sheet',
    }),
  }),
  entry({
    key: 'c9-60hz',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000029523&nc=1',
    pageTokens: ['Non-Current', 'Cat C9 (60 Hz) Diesel Generator Sets', 'C9 ATAAC, I-6, 4-Stroke Water-Cooled Diesel'],
    docUrl: 'https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1717-',
    docCode: 'LEHE1717-07',
    docTokens: ['Cat® C9', '200 ekW – 300 ekW', 'DE300SE0', 'Engine Model', 'LEHE1717'],
    storagePath: 'caterpillar/legacy/cat-c9-60hz-lehe1717-spec-sheet.pdf',
    label: 'Cat C9 60 Hz 200-300 ekW Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'C9 60 Hz Legacy Genset',
      series: 'C9',
      powerKw: 300,
      displacement: 8.8,
      cylinders: 6,
      rpm: 1800,
      compressionRatio: '16.1:1',
      configuration: 'Inline-6 ATAAC four-stroke water-cooled diesel generator-set engine',
      emissions: 'Non-certified / EU Stage III options in Cat non-current literature',
      certifications: ['Caterpillar non-current generator-set literature'],
      docCode: 'LEHE1717-07',
      ratingText: '200-300 ekW',
    }),
  }),
  entry({
    key: 'c15-60hz',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000028984&nc=1',
    pageTokens: ['Non-Current', 'Cat C15 (60 Hz) Diesel Generator Sets', 'C15  ATAAC, I-6, 4-Stroke Water-Cooled Diesel'],
    docUrl: 'https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1724-',
    docCode: 'LEHE1724-02',
    docTokens: ['Cat® C15', 'Diesel Generator Set', '500 ekW', '455 ekW', 'LEHE1724'],
    storagePath: 'caterpillar/legacy/cat-c15-60hz-lehe1724-spec-sheet.pdf',
    label: 'Cat C15 60 Hz 500 ekW Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'C15 60 Hz Legacy Genset',
      series: 'C15',
      powerKw: 500,
      displacement: 15.2,
      cylinders: 6,
      rpm: 1800,
      compressionRatio: '16.1:1',
      configuration: 'Inline-6 ATAAC four-stroke water-cooled diesel generator-set engine',
      emissions: 'Low fuel consumption',
      certifications: ['Low BSFC Cat non-current literature'],
      docCode: 'LEHE1724-02',
      ratingText: '500 ekW standby / 455 ekW prime',
    }),
  }),
  entry({
    key: 'c18-60hz',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000028985&nc=1',
    pageTokens: ['Non-Current', 'Cat C18 (60 Hz) Diesel Generator Sets', 'C18 ATAAC, I-6, 4-Stroke Water-Cooled Diesel'],
    docUrl: 'https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1662-',
    docCode: 'LEHE1662-03',
    docTokens: ['Cat C18', 'Engine Model', 'DE600SE0', '600 ekW', '545 ekW', 'LEHE1662'],
    storagePath: 'caterpillar/legacy/cat-c18-60hz-lehe1662-spec-sheet.pdf',
    label: 'Cat C18 DE600SE0 60 Hz Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'C18 60 Hz Legacy Genset',
      series: 'C18',
      powerKw: 600,
      displacement: 18.1,
      cylinders: 6,
      rpm: 1800,
      compressionRatio: '14.5:1',
      configuration: 'Inline-6 ATAAC four-stroke water-cooled diesel generator-set engine',
      emissions: 'Non-certified emissions',
      certifications: ['Non-certified emissions Cat non-current literature'],
      docCode: 'LEHE1662-03',
      ratingText: '600 ekW standby / 545 ekW prime',
    }),
  }),
  entry({
    key: 'c27-emergency-60hz',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=18500311&nc=1',
    pageTokens: ['Non-Current', 'Cat C27  (60 Hz) Tier 4 Interim Diesel Generator Sets', 'C27 ATAAC, V-12, 4-Stroke'],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20170815-12040-00839',
    docCode: 'LEHE1213-04',
    docTokens: ['Cat® C27', 'Diesel Generator Sets', '800 (1000)', '725 (906)', 'LEHE1213'],
    storagePath: 'caterpillar/legacy/cat-c27-60hz-emergency-stationary-lehe1213-spec-sheet.pdf',
    label: 'Cat C27 60 Hz Emergency Stationary Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'C27 60 Hz Emergency Stationary Legacy Genset',
      series: 'C27',
      powerKw: 800,
      displacement: 27.03,
      cylinders: 12,
      rpm: 1800,
      compressionRatio: '16.5:1',
      configuration: 'V-12 ATAAC four-stroke water-cooled diesel generator-set engine',
      emissions: 'U.S. EPA Emergency Stationary Use Only (Tier 2)',
      certifications: ['U.S. EPA Emergency Stationary Use Only'],
      docCode: 'LEHE1213-04',
      ratingText: '800 ekW standby / 725 ekW prime',
    }),
  }),
]

function entry(input) {
  return {
    ...input,
    slug: input.row.slug,
  }
}

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

function normalize(value) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
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
  return localPath
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
    maxBuffer: 25 * 1024 * 1024,
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
  return `# Legacy Engine Model Discovery - Batch 35 Cat Legacy Genset Variants

Date: 2026-08-11

## Result

- Official Cat non-current generator-set candidates reviewed: \`${ENTRIES.length}\`
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

${ENTRIES.map((entryItem) => `- ${entryItem.row.model} non-current product page: ${entryItem.pageUrl}`).join('\n')}
${ENTRIES.map((entryItem) => `- ${entryItem.label}: ${entryItem.docUrl}`).join('\n')}

## Notes

- This batch uses Caterpillar official H-CPC pages that are explicitly marked \`Non-Current\`.
- Rows are product/application-specific legacy generator-set variants, so generic active engine rows such as \`C15\` and \`C18\` remain untouched.
- The C27 row is labeled as an emergency-stationary legacy genset because the linked Cat PDF validates the C27 emergency-stationary ratings, even though the H-CPC product page title carries the Tier 4 Interim family label.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Cat legacy genset variant batch`)
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
  console.log(`Inserted ${missing.length} Cat legacy generator-set rows`)
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
