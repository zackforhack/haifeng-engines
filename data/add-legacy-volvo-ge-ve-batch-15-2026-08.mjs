// Add source-validated Volvo Penta legacy GE/VE industrial engines.
//
// Dry run:
//   node data/add-legacy-volvo-ge-ve-batch-15-2026-08.mjs
// Apply:
//   node data/add-legacy-volvo-ge-ve-batch-15-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-15-volvo-ge-ve.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-volvo-ge-ve-batch-15-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyVolvoGEVEProbe/1.0; +https://engines.haifengmachinery.com)'

const MANUALZZ_OPERATOR =
  'https://manualzz.com/doc/4422352/volvo-penta-tad530--tad620--tad720--tad730--td520--td720-...'
const MANUALZZ_WORKSHOP =
  'https://manualzz.com/doc/44056997/volvo-penta-td520-ge--ve--tad520-ge--ve--tad530-ge--tad53...'
const VOLVO_TAD722VE_RELEASE =
  'https://www.volvopenta.com/about-us/news-page/2003/may/news-20664/'
const VOLVO_POWER_ARCHIVE =
  'https://www.volvopenta.com/en-us/industrial/power-generation-engines/power-generation-engine-range/power-gen-product-archive/'
const VOLVO_MEXICO_PAGE = 'https://www.volvopenta-mexico.com.mx/motores-generacion-electrica/'
const RAAD_TAD520GE = 'https://www.raad-eng.com/techdata/volvo/engines/tad520ge.html'
const RAAD_TAD720GE = 'https://www.raad-eng.com/techdata/volvo/engines/tad720ge.html'

const SOURCE_URLS = [
  MANUALZZ_OPERATOR,
  MANUALZZ_WORKSHOP,
  VOLVO_TAD722VE_RELEASE,
  VOLVO_POWER_ARCHIVE,
  VOLVO_MEXICO_PAGE,
  RAAD_TAD520GE,
  RAAD_TAD720GE,
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

function volvo(row) {
  return clean({
    slug: `volvo-penta-${slugify(row.model)}`,
    brand: 'Volvo Penta',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    year_introduced: row.year_introduced,
    origin: 'Sweden',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: row.emissions_standard,
    certifications: row.certifications ?? [],
    power_kw: row.power_kw,
    power_hp: row.power_hp ?? (row.power_kw ? kwToHp(row.power_kw) : undefined),
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    compression_ratio: row.compression_ratio,
    weight_kg: row.weight_kg,
    prime_power_kw_50hz: row.prime_power_kw_50hz,
    standby_power_kw_50hz: row.standby_power_kw_50hz,
    prime_power_kw_60hz: row.prime_power_kw_60hz,
    standby_power_kw_60hz: row.standby_power_kw_60hz,
    description: row.description,
  })
}

const RECORDS = [
  volvo({
    model: 'TD520GE',
    series: 'Early D5 Power Generation',
    power_kw: 89,
    power_hp: 121,
    displacement_l: 4.76,
    cylinders: 4,
    rpm_rated: 1800,
    compression_ratio: '17.5:1',
    weight_kg: 550,
    prime_power_kw_50hz: 77.5,
    standby_power_kw_50hz: 85,
    prime_power_kw_60hz: 81.5,
    standby_power_kw_60hz: 89,
    emissions_standard: 'EPA Tier 1 / EU Stage II',
    certifications: ['EPA Tier 1', 'EU Stage II'],
    configuration: 'Inline-4, turbocharged diesel genset engine',
    description:
      'Volvo Penta TD520GE discontinued legacy generator-drive diesel. The 2013 Volvo Penta operator manual identifies TD520GE in the 4-7 Liter EDC4 industrial/genset family, and the Volvo Penta Mexico datasheet gives 4.76 L displacement with 85 kW at 1500 rpm and 89 kW at 1800 rpm standby ratings.',
  }),
  volvo({
    model: 'TAD520GE',
    series: 'Early D5 Power Generation',
    power_kw: 101,
    power_hp: 135,
    displacement_l: 4.76,
    cylinders: 4,
    rpm_rated: 1800,
    compression_ratio: '17.5:1',
    weight_kg: 575,
    emissions_standard: 'EPA/CARB Tier 1 / TA-Luft',
    certifications: ['EPA/CARB Tier 1', 'TA-Luft'],
    configuration: 'Inline-4, turbocharged aftercooled diesel genset engine',
    description:
      'Volvo Penta TAD520GE discontinued legacy generator-drive diesel. RAAD archived Volvo Penta product-bulletin material identifies the exact TAD520GE genset engine at 96 kW/1500 rpm and 101 kW/1800 rpm, while Volvo Penta workshop-manual pages group it with TD520GE, TD520VE, TAD520VE, and the early TAD/TD720 industrial engines.',
  }),
  volvo({
    model: 'TD520VE',
    series: 'Early D5 Industrial VE',
    displacement_l: 4.76,
    cylinders: 4,
    rpm_rated: 2300,
    compression_ratio: '17.5:1',
    weight_kg: 432,
    emissions_standard: 'Early off-road industrial emissions',
    configuration: 'Inline-4, turbocharged industrial diesel',
    description:
      'Volvo Penta TD520VE discontinued legacy industrial diesel. Volvo Penta workshop-manual pages identify TD520VE as one of the standard TD/TAD 520 industrial configurations covered by the 2007 Group 20-26 manual; it is not part of Volvo Penta current industrial engine listings.',
  }),
  volvo({
    model: 'TD720GE',
    series: 'Early D7 Power Generation',
    power_kw: 134,
    power_hp: 180,
    displacement_l: 7.15,
    cylinders: 6,
    rpm_rated: 1800,
    compression_ratio: '17.1:1',
    weight_kg: 750,
    prime_power_kw_50hz: 128,
    prime_power_kw_60hz: 134,
    emissions_standard: 'EPA Tier 1 / EU Stage II',
    certifications: ['EPA Tier 1', 'EU Stage II'],
    configuration: 'Inline-6, turbocharged diesel genset engine',
    description:
      'Volvo Penta TD720GE discontinued legacy generator-drive diesel. The 2013 Volvo Penta operator manual identifies TD720GE in the 4-7 Liter EDC4 family and gives 7.15 L displacement, six cylinders, 128 kW at 1500 rpm, and 134 kW at 1800 rpm.',
  }),
  volvo({
    model: 'TAD720GE',
    series: 'Early D7 Power Generation',
    power_kw: 154,
    power_hp: 206,
    displacement_l: 7.15,
    cylinders: 6,
    rpm_rated: 1800,
    compression_ratio: '17.1:1',
    weight_kg: 760,
    emissions_standard: 'EPA/CARB Tier 1 / TA-Luft',
    certifications: ['EPA/CARB Tier 1', 'TA-Luft'],
    configuration: 'Inline-6, turbocharged aftercooled diesel genset engine',
    description:
      'Volvo Penta TAD720GE discontinued legacy generator-drive diesel. RAAD archived Volvo Penta product-bulletin material identifies the exact TAD720GE genset engine at 145 kW/1500 rpm and 154 kW/1800 rpm and states EPA/CARB Tier 1 and TA-Luft compliance; Volvo Penta workshop-manual pages cross-list it with TD720GE and the TAD721/TAD722 families.',
  }),
  volvo({
    model: 'TD720VE',
    series: 'Early D7 Industrial VE',
    displacement_l: 7.15,
    cylinders: 6,
    rpm_rated: 2300,
    compression_ratio: '17.1:1',
    weight_kg: 725,
    emissions_standard: 'Early off-road industrial emissions',
    configuration: 'Inline-6, turbocharged industrial diesel',
    description:
      'Volvo Penta TD720VE discontinued legacy industrial diesel. Volvo Penta workshop-manual pages identify TD720VE as a standard TD/TAD 720 industrial configuration in the 2007 Group 20-26 manual, adjacent to TD720GE, TAD720GE, TAD720VE, TAD721VE, and TAD722VE.',
  }),
  volvo({
    model: 'TAD722VE',
    series: 'Early D7 Industrial VE',
    year_introduced: 2003,
    power_kw: 200,
    power_hp: 272,
    displacement_l: 7.15,
    cylinders: 6,
    rpm_rated: 2300,
    compression_ratio: '19.0:1',
    weight_kg: 680,
    emissions_standard: 'EU/EPA Phase 2',
    certifications: ['EU Phase 2', 'EPA Phase 2'],
    configuration: 'Inline-6, turbocharged aftercooled industrial diesel with EDC4',
    description:
      'Volvo Penta TAD722VE discontinued legacy industrial diesel for off-road and stationary applications. Volvo Penta announced TAD722VE in 2003 as a 7.15 L straight-six with EDC4, EU/EPA Phase 2 emissions, and 180/200/220 kW versions; the Volvo Penta operator manual technical table gives the 200 kW variant and 680 kg dry weight.',
  }),
  volvo({
    model: 'TAD730GE',
    series: 'Early D7 Power Generation',
    power_kw: 136,
    power_hp: 182,
    displacement_l: 7.15,
    cylinders: 6,
    rpm_rated: 1800,
    compression_ratio: '17.1:1',
    weight_kg: 760,
    prime_power_kw_50hz: 129,
    prime_power_kw_60hz: 136,
    emissions_standard: 'EPA Tier 2 / EU Stage II',
    certifications: ['EPA Tier 2', 'EU Stage II'],
    configuration: 'Inline-6, turbocharged aftercooled diesel genset engine',
    description:
      'Volvo Penta TAD730GE discontinued legacy generator-drive diesel. The 2013 Volvo Penta operator manual identifies TAD730GE in the early TD/TAD720-733 GE/VE family and gives 7.15 L displacement, six cylinders, 129 kW at 1500 rpm, 136 kW at 1800 rpm, and 1500/1800 rpm full-load speed range.',
  }),
]

const DOCUMENTS = [
  {
    slug: 'volvo-penta-td520ge',
    model: 'TD520GE',
    sourceUrl: 'https://www.volvopenta-mexico.com.mx/generacion/TD520GE.pdf',
    sourcePage: VOLVO_MEXICO_PAGE,
    storagePath: 'volvo/legacy/ge-ve-batch-15/td520ge-volvo-penta-mexico-datasheet.pdf',
    label: 'Volvo Penta TD520GE Generator Drive Datasheet',
    requiredTokens: ['VOLVO PENTA GENSET ENGINE', 'TD520GE', '1500 rpm', '1800 rpm'],
  },
  {
    slug: 'volvo-penta-tad520ge',
    model: 'TAD520GE',
    sourceUrl: 'https://www.raad-eng.com/techdata/volvo/prodbull/tad520ge.pdf',
    sourcePage: RAAD_TAD520GE,
    storagePath: 'volvo/legacy/ge-ve-batch-15/tad520ge-raad-product-bulletin.pdf',
    label: 'Volvo Penta TAD520GE Legacy Genset Product Bulletin',
    requiredTokens: ['VOLVO PENTA GENSET ENGINE', 'TAD520GE'],
  },
  {
    slug: 'volvo-penta-tad720ge',
    model: 'TAD720GE',
    sourceUrl: 'https://www.raad-eng.com/techdata/volvo/prodbull/tad720ge.pdf',
    sourcePage: RAAD_TAD720GE,
    storagePath: 'volvo/legacy/ge-ve-batch-15/tad720ge-raad-product-bulletin.pdf',
    label: 'Volvo Penta TAD720GE Legacy Genset Product Bulletin',
    requiredTokens: ['VOLVO PENTA GENSET ENGINE', 'TAD720GE'],
  },
]

function downloadText(url, fileName, tokens) {
  const localPath = path.join(TMP_DIR, fileName)
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
    '120',
    '--user-agent',
    USER_AGENT,
    '--output',
    localPath,
    url,
  ], { maxBuffer: 20 * 1024 * 1024 })
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = tokens.filter((token) => !text.includes(token))
  if (missing.length) throw new Error(`${url}: missing validation token(s): ${missing.join(', ')}`)
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
  ], { maxBuffer: 20 * 1024 * 1024 })

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
    ...document,
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

async function attachDocuments(supabase, verifiedDocs) {
  const { data: engineRows, error: engineError } = await supabase
    .from('engines')
    .select('id, slug, brand, model')
    .in('slug', verifiedDocs.map((doc) => doc.slug))
  if (engineError) throw engineError

  const enginesBySlug = new Map(engineRows.map((engine) => [engine.slug, engine]))
  let linkedCount = 0
  let skippedCount = 0

  for (const document of verifiedDocs) {
    const engine = enginesBySlug.get(document.slug)
    if (!engine) throw new Error(`Missing engine row for document: ${document.slug}`)
    if (engine.brand !== 'Volvo Penta' || normalize(engine.model) !== normalize(document.model)) {
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

  return { linkedCount, skippedCount }
}

function buildReport({ existingCount, missing, verifiedDocs, docResult, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 15 Volvo GE/VE

Date: 2026-08-11

## Result

- Source-validated Volvo Penta GE/VE candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Exact PDFs ${APPLY ? 'linked' : 'verified'}: \`${APPLY ? docResult.linkedCount : verifiedDocs.length}\`
${APPLY ? `- Exact PDF links skipped as existing: \`${docResult.skippedCount}\`\n` : ''}${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power kW | Displacement L | RPM | PDF |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
${missing.map((row) => {
  const doc = DOCUMENTS.find((item) => item.slug === row.slug)
  return `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.power_kw ?? ''} | ${row.displacement_l ?? ''} | ${row.rpm_rated ?? ''} | ${doc?.sourceUrl ?? ''} |`
}).join('\n')}

## Datasheet Attachments

| Engine | Source sheet | Storage path |
| --- | --- | --- |
${DOCUMENTS.map((doc) => `| ${doc.model} | ${doc.sourceUrl} | ${doc.storagePath} |`).join('\n')}

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- This batch is limited to Volvo Penta industrial and power-generation GE/VE rows; marine-only TAMD/TMD/KAD records are intentionally excluded.
- \`TD520GE\`, \`TD720GE\`, and \`TAD730GE\` are validated from the Volvo Penta 4-7 Liter EDC4 operator manual tables.
- \`TAD520GE\` and \`TAD720GE\` are validated against exact RAAD archived Volvo Penta genset product bulletins and the Volvo Penta workshop-manual model list.
- \`TD520VE\` and \`TD720VE\` are added with conservative fields only: model identity, displacement family, cylinder count, and industrial configuration are source-backed, but power ratings are left blank until an exact rated-output source is found.
- \`TAD722VE\` is validated by Volvo Penta's 2003 launch release and the Volvo Penta operator manual table. The 200 kW row represents the mid rating; the official release also mentions 180 kW and 220 kW versions.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

downloadText(VOLVO_MEXICO_PAGE, 'volvo-mexico-power-generation.html', ['TD520GE'])
downloadText(RAAD_TAD520GE, 'raad-tad520ge.html', ['TAD520GE', '96 kW', '101 kW'])
downloadText(RAAD_TAD720GE, 'raad-tad720ge.html', ['TAD720GE', '145 kW', '154 kW'])

const verifiedDocs = DOCUMENTS.map((document) => {
  const verified = downloadAndVerifyPdf(document)
  console.log(`Verified ${document.model} PDF: ${Math.round(verified.fileSizeBytes / 1024)}KB`)
  return verified
})

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Volvo Penta GE/VE legacy batch`)

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
  console.log(`Imported ${data.length} validated legacy Volvo Penta record(s).`)
}

const docResult = APPLY
  ? await attachDocuments(supabase, verifiedDocs)
  : { linkedCount: 0, skippedCount: 0 }

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = APPLY ? await countLegacyCoverage(supabase) : null

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({
  existingCount: RECORDS.length - missing.length,
  missing,
  verifiedDocs,
  docResult,
  afterCount: APPLY ? afterCount : null,
  coverage,
}))

console.log(`Engine count is ${afterCount}.`)
if (coverage) {
  console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
}
console.log(`Wrote ${REPORT_PATH}`)
