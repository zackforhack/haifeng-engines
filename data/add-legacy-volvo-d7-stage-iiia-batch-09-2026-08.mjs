// Add source-validated Volvo Penta D7 Stage IIIA / EPA Tier 3 legacy genset models.
//
// Dry run:
//   node data/add-legacy-volvo-d7-stage-iiia-batch-09-2026-08.mjs
// Apply:
//   node data/add-legacy-volvo-d7-stage-iiia-batch-09-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-09-volvo-d7-stage-iiia.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-volvo-d7-stage-iiia-batch-09-2026-08')
const SOURCE_PAGE = 'https://www.volvopenta-mexico.com.mx/motores-generacion-electrica/'
const VOLSPEC_1500 = 'https://www.volspec.co.uk/power-generation-1500-rpm.php'
const VOLSPEC_1800 = 'https://www.volspec.co.uk/power-generation-1800-rpm.php'
const MANUAL_SOURCE = 'https://www.manualslib.com/manual/3913138/Volvo-Penta-Tad754ge.html'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyVolvoD7Probe/1.0; +https://engines.haifengmachinery.com)'
const CURL_ENV = {
  ...process.env,
  HTTP_PROXY: '',
  HTTPS_PROXY: '',
  ALL_PROXY: '',
  http_proxy: '',
  https_proxy: '',
  all_proxy: '',
}

const SOURCE_URLS = [
  SOURCE_PAGE,
  VOLSPEC_1500,
  VOLSPEC_1800,
  MANUAL_SOURCE,
  'https://pdf.directindustry.com/pdf/volvo-penta/tad750ge/34254-212609.html',
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

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function record(row) {
  return clean({
    slug: `volvo-penta-${slugify(row.model)}`,
    brand: 'Volvo Penta',
    model: row.model,
    series: 'D7 Stage IIIA Power Generation',
    status: 'discontinued',
    origin: 'Sweden',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'EU Stage IIIA / EPA Tier 3',
    certifications: ['EU Stage IIIA', 'EPA Tier 3'],
    power_kw: row.standby_power_kw_60hz,
    power_hp: row.standby_hp_60hz,
    displacement_l: 7.15,
    cylinders: 6,
    configuration: 'Inline-6, turbocharged air-to-air charge-cooled diesel genset engine',
    rpm_rated: 1500,
    compression_ratio: '18:1',
    prime_power_kw_50hz: row.prime_power_kw_50hz,
    prime_power_kwe_50hz: row.prime_power_kwe_50hz,
    prime_power_kva_50hz: row.prime_power_kva_50hz,
    standby_power_kw_50hz: row.standby_power_kw_50hz,
    standby_power_kwe_50hz: row.standby_power_kwe_50hz,
    standby_power_kva_50hz: row.standby_power_kva_50hz,
    prime_power_kw_60hz: row.prime_power_kw_60hz,
    prime_power_kwe_60hz: row.prime_power_kwe_60hz,
    prime_power_kva_60hz: row.prime_power_kva_60hz,
    standby_power_kw_60hz: row.standby_power_kw_60hz,
    standby_power_kwe_60hz: row.standby_power_kwe_60hz,
    standby_power_kva_60hz: row.standby_power_kva_60hz,
    description:
      `Volvo Penta ${row.model} discontinued D7 Stage IIIA / EPA Tier 3 generator-drive diesel engine. `
      + 'The model-specific power ratings are cross-checked against Volspec 1500 rpm and 1800 rpm power-generation tables, '
      + 'while model identity and service coverage are cross-checked against Volvo Penta Mexico datasheet links and the Volvo Penta operator manual covering TAD750GE through TAD754GE. '
      + 'This is an industrial power-generation row, not a marine propulsion listing.',
  })
}

const RECORDS = [
  record({
    model: 'TAD750GE',
    prime_power_kw_50hz: 114,
    prime_power_kwe_50hz: 105,
    prime_power_kva_50hz: 131,
    standby_power_kw_50hz: 127,
    standby_power_kwe_50hz: 115,
    standby_power_kva_50hz: 144,
    prime_power_kw_60hz: 127,
    prime_power_kwe_60hz: 117,
    prime_power_kva_60hz: 146,
    standby_power_kw_60hz: 146,
    standby_power_kwe_60hz: 134,
    standby_power_kva_60hz: 168,
    standby_hp_60hz: 199,
  }),
  record({
    model: 'TAD751GE',
    prime_power_kw_50hz: 132,
    prime_power_kwe_50hz: 121,
    prime_power_kva_50hz: 152,
    standby_power_kw_50hz: 145,
    standby_power_kwe_50hz: 133,
    standby_power_kva_50hz: 167,
    prime_power_kw_60hz: 149,
    prime_power_kwe_60hz: 137,
    prime_power_kva_60hz: 171,
    standby_power_kw_60hz: 166,
    standby_power_kwe_60hz: 153,
    standby_power_kva_60hz: 191,
    standby_hp_60hz: 226,
  }),
  record({
    model: 'TAD752GE',
    prime_power_kw_50hz: 158,
    prime_power_kwe_50hz: 145,
    prime_power_kva_50hz: 182,
    standby_power_kw_50hz: 174,
    standby_power_kwe_50hz: 160,
    standby_power_kva_50hz: 200,
    prime_power_kw_60hz: 178,
    prime_power_kwe_60hz: 164,
    prime_power_kva_60hz: 205,
    standby_power_kw_60hz: 196,
    standby_power_kwe_60hz: 180,
    standby_power_kva_60hz: 225,
    standby_hp_60hz: 267,
  }),
  record({
    model: 'TAD753GE',
    prime_power_kw_50hz: 173,
    prime_power_kwe_50hz: 159,
    prime_power_kva_50hz: 199,
    standby_power_kw_50hz: 191,
    standby_power_kwe_50hz: 176,
    standby_power_kva_50hz: 220,
    prime_power_kw_60hz: 194,
    prime_power_kwe_60hz: 178,
    prime_power_kva_60hz: 223,
    standby_power_kw_60hz: 218,
    standby_power_kwe_60hz: 201,
    standby_power_kva_60hz: 251,
    standby_hp_60hz: 296,
  }),
  record({
    model: 'TAD754GE',
    prime_power_kw_50hz: 217,
    prime_power_kwe_50hz: 200,
    prime_power_kva_50hz: 250,
    standby_power_kw_50hz: 239,
    standby_power_kwe_50hz: 220,
    standby_power_kva_50hz: 275,
    prime_power_kw_60hz: 219,
    prime_power_kwe_60hz: 201,
    prime_power_kva_60hz: 252,
    standby_power_kw_60hz: 246,
    standby_power_kwe_60hz: 226,
    standby_power_kva_60hz: 283,
    standby_hp_60hz: 334,
  }),
]

const DOCUMENTS = RECORDS.map((engine) => ({
  slug: engine.slug,
  model: engine.model,
  sourceUrl: `https://www.volvopenta-mexico.com.mx/generacion/${engine.model}.pdf`,
  sourcePage: SOURCE_PAGE,
  storagePath: `volvo-penta/legacy-d7-stage-iiia/${engine.model.toLowerCase()}-datasheet.pdf`,
  label: `Volvo Penta ${engine.model} Product Bulletin`,
  requiredTokens: ['VOLVO PENTA', engine.model, 'GENSET ENGINE'],
}))

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
    env: CURL_ENV,
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

function buildReport({ existingCount, missing, linkedCount, verifiedDocs, afterCount }) {
  return `# Legacy Engine Model Discovery - Batch 09 Volvo D7 Stage IIIA

Date: 2026-08-11

## Result

- Source-validated Volvo Penta D7 Stage IIIA / EPA Tier 3 candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
- Datasheets ${APPLY ? 'linked' : 'verified'}: \`${APPLY ? linkedCount : verifiedDocs.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | 50 Hz Prime/Standby kWe | 60 Hz Prime/Standby kWe | Emissions | PDF |
| --- | --- | --- | --- | --- | --- | --- |
${missing.map((row) =>
  `| ${row.brand} | ${row.model} | ${row.series} | ${row.prime_power_kwe_50hz}/${row.standby_power_kwe_50hz} | ${row.prime_power_kwe_60hz}/${row.standby_power_kwe_60hz} | ${row.emissions_standard} | ${DOCUMENTS.find((doc) => doc.slug === row.slug)?.sourceUrl ?? ''} |`
).join('\n')}

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- This batch is Volvo Penta industrial/power-generation D7 content only.
- Marine-only Volvo Penta models remain excluded.
- TAD750GE through TAD754GE are not present in the current Volvo Penta D7 product archive set that lists TAD731GE through TAD734GE, and the current D8 Stage IIIA range uses later TAD851GE through TAD853GE designations.
- The ratings are copied from model-specific Volspec 1500 rpm and 1800 rpm rows. The datasheet files are model-specific Volvo Penta Mexico PDF endpoints and are text-verified before linking.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: validated legacy Volvo D7 Stage IIIA models`)

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

let linkedCount = 0

if (APPLY && missing.length) {
  const { data, error } = await supabase
    .from('engines')
    .upsert(missing, { onConflict: 'slug' })
    .select('id, brand, model, slug')
  if (error) throw error
  console.log(`Imported ${data.length} validated legacy Volvo D7 record(s).`)
}

if (APPLY) {
  const { data: engineRows, error: engineError } = await supabase
    .from('engines')
    .select('id, slug, brand, model')
    .in('slug', RECORDS.map((engine) => engine.slug))
  if (engineError) throw engineError

  const enginesBySlug = new Map(engineRows.map((engine) => [engine.slug, engine]))

  for (const document of verifiedDocs) {
    const engine = enginesBySlug.get(document.slug)
    if (!engine) throw new Error(`Missing engine after upsert: ${document.slug}`)
    if (engine.brand !== 'Volvo Penta' || normalize(engine.model) !== normalize(document.model)) {
      throw new Error(`Engine mismatch for ${document.slug}: ${engine.brand} ${engine.model}`)
    }

    const upload = await uploadPdf(supabase, BUCKET, document.localPath, document.storagePath)
    if (!upload.ok) throw new Error(`Upload failed: ${document.storagePath}`)

    const { error: deleteError } = await supabase
      .from('engine_pdfs')
      .delete()
      .eq('engine_id', engine.id)
      .eq('storage_path', document.storagePath)
    if (deleteError) throw deleteError

    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: upload.uploadedSizeBytes ?? document.fileSizeBytes,
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
  linkedCount,
  verifiedDocs,
  afterCount: APPLY ? afterCount : null,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
