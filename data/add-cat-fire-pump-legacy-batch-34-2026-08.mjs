// Add source-validated Caterpillar non-current fire-pump engine rows
// and attach official Cat fire-pump spec sheets.
//
// Dry run:
//   node data/add-cat-fire-pump-legacy-batch-34-2026-08.mjs
// Apply:
//   node data/add-cat-fire-pump-legacy-batch-34-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-34-cat-fire-pump.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-cat-fire-pump-batch-34-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyCatFirePump/1.0; +https://engines.haifengmachinery.com)'

function record(input) {
  return {
    slug: input.slug,
    brand: 'Caterpillar',
    model: input.model,
    series: input.series,
    status: 'discontinued',
    origin: 'United States',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: input.emissions,
    certifications: input.certifications,
    power_kw: input.powerKw,
    power_hp: input.powerHp,
    cylinders: input.cylinders,
    configuration: input.configuration,
    rpm_max: input.rpmMax,
    description:
      `Caterpillar ${input.model} discontinued/non-current fire-pump diesel engine. ` +
      `Cat H-CPC marks the ${input.model} page as Non-Current and links the ${input.docCode} fire-pump spec sheet with ${input.ratingText} ratings.`,
  }
}

const ENTRIES = [
  {
    key: '3412',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18378906&pid=18457241&nc=1',
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/LEHW0130-00',
    docCode: 'LEHW0130-00',
    storagePath: 'caterpillar/legacy/cat-3412-fire-pump-spec-sheet.pdf',
    label: 'Cat 3412 Fire Pump Spec Sheet',
    requiredPageTokens: ['Non-Current', '3412 Fire Pump Engine', 'Cat 3412 Industrial Diesel Fire Pump Engine', 'LEHW0130-00'],
    requiredPdfTokens: ['3412', 'Fire Pump', '476-551 bkW', '638-739 bhp', 'FM/UL/NFPA 20', 'LEHW0130'],
    row: record({
      slug: 'caterpillar-3412-fire-pump',
      model: '3412 Fire Pump',
      series: '3400 Series',
      emissions: 'Non-certified; available for global non-regulated areas',
      certifications: ['Caterpillar Non-Current product page', 'FM Approved', 'UL Listed', 'NFPA 20'],
      powerKw: 551,
      powerHp: 739,
      cylinders: 12,
      configuration: 'V-12 four-stroke diesel fire-pump engine',
      rpmMax: 2100,
      docCode: 'LEHW0130-00',
      ratingText: '476-551 bkW / 638-739 bhp',
    }),
  },
  {
    key: '3508',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18378906&pid=18457296&nc=1',
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/LEHW0131-01',
    docCode: 'LEHW0131-01',
    storagePath: 'caterpillar/legacy/cat-3508-fire-pump-spec-sheet.pdf',
    label: 'Cat 3508 Fire Pump Spec Sheet',
    requiredPageTokens: ['Non-Current', '3508 Fire Pump Engine', 'Cat 3508 Diesel Fire Pump Engine', 'LEHW0131-01'],
    requiredPdfTokens: ['3508', 'Fire Pump Engine', '709-795 bkW', '950-1065 bhp', 'LEHW0131'],
    row: record({
      slug: 'caterpillar-3508-fire-pump',
      model: '3508 Fire Pump',
      series: '3500 Series',
      emissions: 'Non-certified; available for global non-regulated areas',
      certifications: ['Caterpillar Non-Current product page', 'NFPA 20 fire-pump application'],
      powerKw: 795,
      powerHp: 1065,
      cylinders: 8,
      configuration: 'V-8 four-stroke diesel fire-pump engine',
      rpmMax: 1750,
      docCode: 'LEHW0131-01',
      ratingText: '709-795 bkW / 950-1065 bhp',
    }),
  },
  {
    key: '3512',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18378906&pid=18457364&nc=1',
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/LEHW0132-01',
    docCode: 'LEHW0132-01',
    storagePath: 'caterpillar/legacy/cat-3512-fire-pump-spec-sheet.pdf',
    label: 'Cat 3512 Fire Pump Spec Sheet',
    requiredPageTokens: ['Non-Current', '3512 Fire Pump Engine', 'Cat 3512 Diesel Fire Pump Engine', 'LEHW0132-01'],
    requiredPdfTokens: ['3512', 'Fire Pump Engine', '1066-1195 bkW', '1430-1600 bhp', 'LEHW0132'],
    row: record({
      slug: 'caterpillar-3512-fire-pump',
      model: '3512 Fire Pump',
      series: '3500 Series',
      emissions: 'Non-certified; available for global non-regulated areas',
      certifications: ['Caterpillar Non-Current product page', 'NFPA 20 fire-pump application'],
      powerKw: 1195,
      powerHp: 1600,
      cylinders: 12,
      configuration: 'V-12 four-stroke diesel fire-pump engine',
      rpmMax: 1750,
      docCode: 'LEHW0132-01',
      ratingText: '1066-1195 bkW / 1430-1600 bhp',
    }),
  },
  {
    key: '3516',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18378906&pid=18457435&nc=1',
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/LEHW0133-01',
    docCode: 'LEHW0133-01',
    storagePath: 'caterpillar/legacy/cat-3516-fire-pump-spec-sheet.pdf',
    label: 'Cat 3516 Fire Pump Spec Sheet',
    requiredPageTokens: ['Non-Current', '3516 Fire Pump Engine', 'Cat 3516 Diesel Fire Pump Engine', 'LEHW0133-01'],
    requiredPdfTokens: ['3516', 'Fire Pump Engine', '1417-1480 bkW', '1900-1985 bhp', 'LEHW0133'],
    row: record({
      slug: 'caterpillar-3516-fire-pump',
      model: '3516 Fire Pump',
      series: '3500 Series',
      emissions: 'Non-certified; available for global non-regulated areas',
      certifications: ['Caterpillar Non-Current product page', 'NFPA 20 fire-pump application'],
      powerKw: 1480,
      powerHp: 1985,
      cylinders: 16,
      configuration: 'V-16 four-stroke diesel fire-pump engine',
      rpmMax: 1750,
      docCode: 'LEHW0133-01',
      ratingText: '1417-1480 bkW / 1900-1985 bhp',
    }),
  },
  {
    key: 'c18-acert',
    pageUrl:
      'https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18378906&pid=18457505&nc=1',
    docUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/LEHW0134-00',
    docCode: 'LEHW0134-00',
    storagePath: 'caterpillar/legacy/cat-c18-acert-fire-pump-spec-sheet.pdf',
    label: 'Cat C18 ACERT Fire Pump Spec Sheet',
    requiredPageTokens: ['Non-Current', 'C18 ACERT', 'Fire Pump Engine', 'LEHW0134-00'],
    requiredPdfTokens: ['C18 ACERT', 'Fire Pump', '447-597 bkW', '600-800 bhp', 'FM/UL/NFPA 20', 'LEHW0134'],
    row: record({
      slug: 'caterpillar-c18-acert-fire-pump',
      model: 'C18 ACERT Fire Pump',
      series: 'C18 ACERT',
      emissions: 'Non-certified; available for global non-regulated areas',
      certifications: ['Caterpillar Non-Current product page', 'FM Approved', 'UL Listed', 'NFPA 20'],
      powerKw: 597,
      powerHp: 800,
      cylinders: 6,
      configuration: 'Inline-6 four-stroke ACERT diesel fire-pump engine',
      rpmMax: 2100,
      docCode: 'LEHW0134-00',
      ratingText: '447-597 bkW / 600-800 bhp',
    }),
  },
]

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
    maxBuffer: 30 * 1024 * 1024,
  })
}

function verifyPage(entry) {
  const localPath = path.join(TMP_DIR, `${entry.key}.html`)
  download(entry.pageUrl, localPath)
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = entry.requiredPageTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${entry.pageUrl}: missing required page token(s): ${missing.join(', ')}`)
  }
  return localPath
}

function verifyPdf(entry) {
  const localPath = path.join(TMP_DIR, path.basename(entry.storagePath))
  download(entry.docUrl, localPath, { referer: entry.pageUrl, maxTime: 300 })
  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 100_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${entry.docUrl}: response is not a usable PDF`)
  }
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const missing = entry.requiredPdfTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${entry.storagePath}: missing required PDF token(s): ${missing.join(', ')}`)
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
  return `# Legacy Engine Model Discovery - Batch 34 Cat Fire Pump

Date: 2026-08-11

## Result

- Official Cat non-current fire-pump candidates reviewed: \`${ENTRIES.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Official Cat PDF documents verified: \`${verified.length}\`
- Datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power kW | Power hp | RPM max | Source |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
${missing.map((row) => {
  const entry = ENTRIES.find((item) => item.row.slug === row.slug)
  return `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.power_kw} | ${row.power_hp} | ${row.rpm_max} | ${entry.pageUrl} |`
}).join('\n')}

## Document Attachments

| Document | Source | Storage path | Target slug |
| --- | --- | --- | --- |
${ENTRIES.map((entry) => `| ${entry.label} | ${entry.docUrl} | ${entry.storagePath} | ${entry.row.slug} |`).join('\n')}

## Validation Sources

${ENTRIES.map((entry) => `- ${entry.row.model} non-current product page: ${entry.pageUrl}`).join('\n')}
${ENTRIES.map((entry) => `- ${entry.label}: ${entry.docUrl}`).join('\n')}

## Notes

- This batch uses Caterpillar official H-CPC non-current product pages and exact Cat LEHW fire-pump spec sheets.
- Rows are intentionally model/application-specific fire-pump rows, avoiding cross-linking these documents to generic active Cat generator rows.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Cat fire-pump legacy batch`)
const verified = []
for (const entry of ENTRIES) {
  verifyPage(entry)
  const pdf = verifyPdf(entry)
  verified.push({ ...entry, ...pdf })
  console.log(`Verified ${entry.label}: ${Math.round(pdf.fileSizeBytes / 1024)}KB`)
}

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const before = await fetchAllEngines(supabase)
const existingKeys = new Set(before.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const rows = ENTRIES.map((entry) => entry.row)
const missing = rows.filter((row) => !existingKeys.has(`${row.brand}::${normalize(row.model)}`))
const existingCount = rows.length - missing.length
console.log(`Candidates: ${rows.length}; existing: ${existingCount}; missing: ${missing.length}`)

if (APPLY && missing.length) {
  const { error } = await supabase.from('engines').insert(missing)
  if (error) throw error
  console.log(`Inserted ${missing.length} Cat fire-pump rows`)
}

const engines = APPLY && missing.length ? await fetchAllEngines(supabase) : before
const bySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let linkedCount = 0
let skippedCount = 0

for (const entry of verified) {
  const engine = bySlug.get(entry.row.slug)
  if (!engine) {
    if (APPLY) throw new Error(`Missing target row: ${entry.row.slug}`)
    continue
  }
  const { data: existingLinks, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('engine_id', engine.id)
    .eq('storage_path', entry.storagePath)
  if (existingError) throw existingError

  if (existingLinks?.length) {
    skippedCount += 1
    continue
  }
  if (!APPLY) {
    linkedCount += 1
    continue
  }
  const upload = await uploadPdf(supabase, BUCKET, entry.localPath, entry.storagePath)
  if (!upload.ok) throw new Error(`Upload failed: ${entry.storagePath}`)
  const { error: insertError } = await supabase.from('engine_pdfs').insert({
    engine_id: engine.id,
    type: 'datasheet',
    label: entry.label,
    storage_path: entry.storagePath,
    file_size_bytes: upload.uploadedSizeBytes ?? entry.fileSizeBytes,
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
