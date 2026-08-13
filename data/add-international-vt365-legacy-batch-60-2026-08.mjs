// Add source-validated International VT 365 legacy row and exact service manual reference.
//
// Dry run:
//   node data/add-international-vt365-legacy-batch-60-2026-08.mjs
// Apply:
//   node data/add-international-vt365-legacy-batch-60-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-60-international-vt365.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-international-vt365-batch-60-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyInternationalVT365/1.0; +https://engines.haifengmachinery.com)'

const MANUALSLIB_VT365 = 'https://www.manualslib.com/manual/848625/International-Vt-365.html'

const RECORD = {
  slug: 'international-vt-365',
  brand: 'International',
  model: 'VT 365',
  series: 'International/Navistar VT Series',
  status: 'discontinued',
  year_introduced: 2004,
  year_discontinued: 2006,
  origin: 'United States',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'EPA 2004 on-highway legacy',
  certifications: ['International VT 365 2004-2006 service manual'],
  power_kw: 242.4,
  power_hp: 325,
  displacement_l: 6.0,
  cylinders: 8,
  configuration: 'V8 turbocharged diesel with EGR and variable-geometry turbocharger',
  description:
    'International VT 365 discontinued 6.0 L V8 diesel for 2004-2006 model years. The public International VT 365 service manual validates the exact VT 365 model name, 2004-2006 model-year scope, service-manual context, EGR/VGT systems, and International Truck and Engine Corporation source identity.',
}

const DOCUMENT = {
  label: 'International VT 365 Service Manual',
  storagePath: MANUALSLIB_VT365,
  type: 'manual',
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

function download(url, outputPath, cachedPath) {
  if (cachedPath && fs.existsSync(cachedPath)) {
    fs.copyFileSync(cachedPath, outputPath)
    return
  }

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
    outputPath,
    url,
  ], {
    env: {
      ...process.env,
      HTTP_PROXY: '',
      HTTPS_PROXY: '',
      ALL_PROXY: '',
      http_proxy: '',
      https_proxy: '',
      all_proxy: '',
    },
    maxBuffer: 50 * 1024 * 1024,
  })
}

function verifyManual() {
  const localPath = path.join(TMP_DIR, 'manualslib-international-vt365.html')
  download(MANUALSLIB_VT365, localPath, '/tmp/manualslib-international-vt365-current.html')
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = [
    'INTERNATIONAL VT 365 SERVICE MANUAL',
    '2004-2006 Model Years',
    'VT 365 engine pdf manual download',
    'International Truck and Engine Corporation',
    'EGR',
    'Variable Geometry Turbocharger',
  ].filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${MANUALSLIB_VT365}: missing validation token(s): ${missing.join(', ')}`)
  return {
    localPath,
    fileSizeBytes: Buffer.byteLength(text, 'utf8'),
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

function buildReport({ missing, linkedCount, skippedCount, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 60 International VT 365

Date: 2026-08-12

## Result

- Source-validated International/Navistar VT 365 candidates reviewed: \`1\`
- Already present before import: \`${missing ? 0 : 1}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing ? 1 : 0}\`
- Manual/reference links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power hp | Displacement L | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
${missing ? `| ${RECORD.brand} | ${RECORD.model} | ${RECORD.series} | ${RECORD.status} | ${RECORD.power_hp} | ${RECORD.displacement_l} | ${MANUALSLIB_VT365} |` : ''}

## Manual Attachments

| Document | Source | Target slug |
| --- | --- | --- |
| ${DOCUMENT.label} | ${DOCUMENT.storagePath} | ${RECORD.slug} |

## Validation Sources

- ${MANUALSLIB_VT365}

## Evidence Notes

- The ManualsLib page title/meta validates exact \`International VT 365\` service-manual identity and the 2004-2006 model-year scope.
- Manual text validates International Truck and Engine Corporation source identity and service content for EGR and variable-geometry turbocharger systems.
- This batch intentionally adds only the exact VT 365 model; adjacent VT/T444E rows need separate exact evidence before insertion.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const manual = verifyManual()
const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: International/Navistar VT 365 legacy batch`)

const before = await fetchAllEngines(supabase)
const existingKeys = new Set(before.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const missing = !existingKeys.has(`${RECORD.brand}::${normalize(RECORD.model)}`)

console.log(`Candidates: 1; existing: ${missing ? 0 : 1}; missing: ${missing ? 1 : 0}`)
if (missing) console.log(`${RECORD.brand}\t${RECORD.model}\t${RECORD.slug}`)

if (APPLY && missing) {
  const { error } = await supabase.from('engines').upsert([RECORD], { onConflict: 'slug' })
  if (error) throw error
  console.log('Imported 1 validated legacy International/Navistar VT 365 record.')
}

const afterEngines = APPLY && missing ? await fetchAllEngines(supabase) : before
const engine = afterEngines.find((row) => row.slug === RECORD.slug)
let linkedCount = 0
let skippedCount = 0

if (engine) {
  const { data: existingLinks, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('id')
    .eq('engine_id', engine.id)
    .eq('storage_path', DOCUMENT.storagePath)
  if (existingError) throw existingError

  if (existingLinks?.length) {
    skippedCount = 1
  } else if (!APPLY) {
    linkedCount = 1
  } else {
    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: DOCUMENT.type,
      label: DOCUMENT.label,
      storage_path: DOCUMENT.storagePath,
      file_size_bytes: manual.fileSizeBytes,
    })
    if (insertError) throw insertError
    linkedCount = 1
  }
} else if (APPLY) {
  throw new Error(`Missing target row: ${RECORD.slug}`)
} else if (missing) {
  linkedCount = 1
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = await countLegacyCoverage(supabase)
await fsp.writeFile(
  REPORT_PATH,
  buildReport({
    missing,
    linkedCount,
    skippedCount,
    afterCount: APPLY ? afterCount : null,
    coverage: APPLY ? coverage : null,
  }),
)

console.log(`${APPLY ? 'Linked' : 'Planned'} manual/reference links: ${linkedCount}.`)
console.log(`Existing links skipped: ${skippedCount}.`)
console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
