// Add source-validated Caterpillar non-current 50 Hz/package generator-set rows
// and attach exact official Cat spec sheets.
//
// Dry run:
//   node data/add-cat-50hz-package-legacy-gensets-batch-38-2026-08.mjs
// Apply:
//   node data/add-cat-50hz-package-legacy-gensets-batch-38-2026-08.mjs --apply

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
  'reports/legacy-engine-model-discovery-2026-08-11-batch-38-cat-50hz-package-legacy-gensets.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-cat-50hz-package-gensets-batch-38-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyCat50HzPackages/1.0; +https://engines.haifengmachinery.com)'

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
    key: 'd800-gc',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=114081&nc=1',
    pageTokens: ['Non-Current', 'Cat DE800 GC Diesel Generator Sets', 'C27 TA, V-12, 4-Stroke Water-Cooled Diesel'],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20211115-fb785-c4f9a',
    docCode: 'LEHE20272-04',
    docTokens: ['Cat® D800 GC', 'Diesel Generator Sets', 'D800 GC', '800 ekW', 'LEHE20272'],
    storagePath: 'caterpillar/legacy/cat-d800-gc-lehe20272-spec-sheet.pdf',
    label: 'Cat D800 GC Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'D800 GC Legacy Genset',
      series: 'GC Diesel Generator Sets',
      powerKw: 800,
      displacement: 27.03,
      cylinders: 12,
      rpm: 1800,
      compressionRatio: '16.5:1',
      configuration: 'C27 TA V-12 four-stroke water-cooled diesel generator-set engine',
      emissions: 'U.S. EPA Emergency Stationary Use Only (Tier 2)',
      docCode: 'LEHE20272-04',
      ratingText: '800 ekW standby',
    }),
  }),
  entry({
    key: 'c13-400kva-india-50hz',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000027411&nc=1',
    pageTokens: ['Non-Current', 'Cat C13  |  400 kVA (50 Hz) Diesel Generator Sets', 'C13  ATAAC, I-6'],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20180613-09835-43526',
    docCode: 'LEHE1718-06',
    docTokens: ['Cat C13', '400 kVA', 'India CPCB/ MoEF Standards', '50 Hz', 'LEHE1718'],
    storagePath: 'caterpillar/legacy/cat-c13-400kva-50hz-india-lehe1718-spec-sheet.pdf',
    label: 'Cat C13 400 kVA 50 Hz India CPCB/MoEF Spec Sheet',
    row: cat({
      model: 'C13 400 kVA 50 Hz India Legacy Genset',
      series: 'C13',
      powerKw: 320,
      displacement: 12.5,
      cylinders: 6,
      rpm: 1500,
      compressionRatio: '16.6:1',
      configuration: 'C13 ATAAC inline-6 four-stroke water-cooled diesel generator-set engine',
      emissions: 'India CPCB/MoEF Standards',
      docCode: 'LEHE1718-06',
      ratingText: '400 kVA / 320 ekW prime',
    }),
  }),
  entry({
    key: 'c15-500kva-india-50hz',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000027410&nc=1',
    pageTokens: ['Non-Current', 'Cat C15  |  500 kVA (50 Hz) Diesel Generator Sets', 'C15  |  500 kVA'],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20180613-08610-63646',
    docCode: 'LEHE1766-11',
    docTokens: ['Cat C15', '500 kVA', 'India CPCB/ MoEF Standards', '50 Hz', 'LEHE1766'],
    storagePath: 'caterpillar/legacy/cat-c15-500kva-50hz-india-lehe1766-spec-sheet.pdf',
    label: 'Cat C15 500 kVA 50 Hz India CPCB/MoEF Spec Sheet',
    row: cat({
      model: 'C15 500 kVA 50 Hz India Legacy Genset',
      series: 'C15',
      powerKw: 400,
      displacement: 15.2,
      cylinders: 6,
      rpm: 1500,
      configuration: 'C15 inline-6 four-cycle diesel generator-set engine',
      emissions: 'India CPCB/MoEF Standards',
      docCode: 'LEHE1766-11',
      ratingText: '500 kVA / 400 ekW prime',
    }),
  }),
  entry({
    key: 'c18-600kva-india-50hz',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000027412&nc=1',
    pageTokens: ['Non-Current', 'Cat C18 (50 Hz) India Market Only Diesel Generator Sets', 'C18  |  600 KVA'],
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20180613-08777-64587',
    docCode: 'LEHE1767-10',
    docTokens: ['Cat C18', '600 kVA', 'India CPCB/ MoEF Standards', '50 Hz', 'LEHE1767'],
    storagePath: 'caterpillar/legacy/cat-c18-600kva-50hz-india-lehe1767-spec-sheet.pdf',
    label: 'Cat C18 600 kVA 50 Hz India CPCB/MoEF Spec Sheet',
    row: cat({
      model: 'C18 600 kVA 50 Hz India Legacy Genset',
      series: 'C18',
      powerKw: 480,
      displacement: 18.1,
      cylinders: 6,
      rpm: 1500,
      configuration: 'C18 inline-6 four-cycle diesel generator-set engine',
      emissions: 'India CPCB/MoEF Standards',
      docCode: 'LEHE1767-10',
      ratingText: '600 kVA / 480 ekW prime',
    }),
  }),
  entry({
    key: 'c18-de780e0-50hz',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=15970391&nc=1',
    pageTokens: ['Non-Current', 'Cat C18 (50 Hz) Diesel Generator Sets', 'C18, DE780E0'],
    docUrl: 'https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1844-',
    docCode: 'LEHE1844-04',
    docTokens: ['Cat® C18', 'DE780E0', '780 kVA', '706 kVA', 'LEHE1844'],
    storagePath: 'caterpillar/legacy/cat-c18-de780e0-50hz-lehe1844-spec-sheet.pdf',
    label: 'Cat C18 DE780E0 50 Hz Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'C18 DE780E0 50 Hz Legacy Genset',
      series: 'C18',
      powerKw: 624,
      displacement: 18.1,
      cylinders: 6,
      rpm: 1500,
      configuration: 'C18 inline-6 four-cycle diesel generator-set engine',
      emissions: 'Low BSFC',
      docCode: 'LEHE1844-04',
      ratingText: '780 kVA standby / 706 kVA prime',
    }),
  }),
  entry({
    key: 'c18-de850e0-50hz',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=15970391&nc=1',
    pageTokens: ['Non-Current', 'Cat C18 (50 Hz) Diesel Generator Sets', 'C18, DE850E0'],
    docUrl: 'https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1817-',
    docCode: 'LEHE1817-06',
    docTokens: ['Cat® C18', 'DE850E0', '850 kVA', '770 kVA', 'LEHE1817'],
    storagePath: 'caterpillar/legacy/cat-c18-de850e0-50hz-lehe1817-spec-sheet.pdf',
    label: 'Cat C18 DE850E0 50 Hz Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'C18 DE850E0 50 Hz Legacy Genset',
      series: 'C18',
      powerKw: 680,
      displacement: 18.1,
      cylinders: 6,
      rpm: 1500,
      configuration: 'C18 inline-6 four-cycle diesel generator-set engine',
      emissions: 'Low BSFC',
      docCode: 'LEHE1817-06',
      ratingText: '850 kVA standby / 770 kVA prime',
    }),
  }),
  entry({
    key: 'c18-de715e0-50hz',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=15970391&nc=1',
    pageTokens: ['Non-Current', 'Cat C18 (50 Hz) Diesel Generator Sets', 'DE715E0'],
    docUrl: 'https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1660-',
    docCode: 'LEHE1660-05',
    docTokens: ['Cat® C18', 'DE715E0', '715 kVA', '650 kVA', 'LEHE1660'],
    storagePath: 'caterpillar/legacy/cat-c18-de715e0-50hz-lehe1660-spec-sheet.pdf',
    label: 'Cat C18 DE715E0 50 Hz Diesel Generator Set Spec Sheet',
    row: cat({
      model: 'C18 DE715E0 50 Hz Legacy Genset',
      series: 'C18',
      powerKw: 572,
      displacement: 18.1,
      cylinders: 6,
      rpm: 1500,
      configuration: 'C18 inline-6 four-cycle diesel generator-set engine',
      emissions: 'Low BSFC',
      docCode: 'LEHE1660-05',
      ratingText: '715 kVA / 572 ekW standby and 650 kVA / 520 ekW prime',
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
  return `# Legacy Engine Model Discovery - Batch 38 Cat 50 Hz Package Legacy Gensets

Date: 2026-08-11

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
- Rows are generator-set package rows, not replacements for generic active engine-family rows.
- kVA-only Cat package rows use 0.8 power factor for \`power_kw\`.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Cat 50 Hz package legacy genset batch`)
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
  console.log(`Inserted ${missing.length} Cat 50 Hz package legacy genset rows`)
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
