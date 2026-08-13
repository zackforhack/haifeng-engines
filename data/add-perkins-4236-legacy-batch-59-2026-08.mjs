// Add source-validated Perkins 4.236 family legacy rows and attach public
// handbook/manual reference pages to exact existing and new family rows.
//
// Dry run:
//   node data/add-perkins-4236-legacy-batch-59-2026-08.mjs
// Apply:
//   node data/add-perkins-4236-legacy-batch-59-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-model-discovery-2026-08-12-batch-59-perkins-4236-family.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-perkins-4236-batch-59-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyPerkins4236/1.0; +https://engines.haifengmachinery.com)'

const PERKINS_4236_SHOP = 'https://shop.perkins.com/fr/engines/perkins-4236-series'
const MANUALSLIB_4236_PRODUCT =
  'https://www.manualslib.com/products/Perkins-4-236-Series-3913665.html'
const DOCZZ_4236_HANDBOOK = 'https://doczz.net/doc/1282433/perkins-4.236-series'

const DOCUMENT = {
  label: 'Perkins 4.236 Series User Handbook',
  storagePath: DOCZZ_4236_HANDBOOK,
  type: 'manual',
}

const WORKSHOP_DOCUMENT = {
  label: 'Perkins 4.236 Series Workshop Manual Index',
  storagePath: MANUALSLIB_4236_PRODUCT,
  type: 'manual',
}

const RECORDS = [
  perkins4236({
    model: '4.236',
    displacement_l: 3.86,
    configuration: 'Inline-4 naturally aspirated direct-injection diesel',
    power_hp: 80,
    rpm_rated: 2800,
    description:
      'Perkins 4.236 legacy four-cylinder diesel. Perkins current shop route preserves a 4.236 Series parts family page, while the public 4.236 Series user handbook validates the exact 4.236 model, 3.86 L displacement and naturally aspirated configuration.',
  }),
  perkins4236({
    model: '4.248',
    displacement_l: 4.06,
    configuration: 'Inline-4 naturally aspirated direct-injection diesel',
    description:
      'Perkins 4.248 legacy 4.236-family derivative. Perkins current shop route preserves a 4.236 Series parts family page, and the public 4.236 Series user handbook lists 4.248 as a naturally aspirated 4.06 L model in the family.',
  }),
  perkins4236({
    model: '4.2482',
    displacement_l: 4.06,
    configuration: 'Inline-4 naturally aspirated direct-injection diesel',
    description:
      'Perkins 4.2482 legacy 4.236-family derivative. The public 4.236 Series user handbook explicitly names 4.2482 as one of the four engines in the family and validates its 4.06 L naturally aspirated technical data.',
  }),
]

const DOCUMENT_TARGET_MODELS = [
  '4.236',
  'T4.236',
  '4.248',
  '4.2482',
  'A4.236',
  'A4.248',
]

function perkins4236(row) {
  return clean({
    slug: `perkins-${slugify(row.model)}`,
    brand: 'Perkins',
    model: row.model,
    series: '4.236 Series',
    status: 'discontinued',
    origin: 'United Kingdom',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'Legacy pre-electronic mechanical diesel',
    certifications: [
      'Perkins official 4.236 Series shop route',
      'Perkins 4.236 Series user handbook',
    ],
    power_kw: row.power_hp ? hpToKw(row.power_hp) : undefined,
    power_hp: row.power_hp,
    displacement_l: row.displacement_l,
    cylinders: 4,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    description: row.description,
  })
}

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

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function normalize(value) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function hpToKw(hp) {
  return Math.round(hp * 0.7457 * 10) / 10
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

function verifyHtml({ url, fileName, cachedPath, requiredTokens }) {
  const localPath = path.join(TMP_DIR, fileName)
  download(url, localPath, cachedPath)
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${url}: missing validation token(s): ${missing.join(', ')}`)
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

function buildReport({
  existingCount,
  missingRows,
  linkedRows,
  skippedRows,
  missingDocumentTargets,
  afterCount,
  coverage,
}) {
  return `# Legacy Engine Model Discovery - Batch 59 Perkins 4.236 Family

Date: 2026-08-12

## Result

- Source-validated Perkins 4.236 candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missingRows.length}\`
- Manual/reference links ${APPLY ? 'inserted' : 'planned'}: \`${linkedRows.length}\`
- Links skipped as existing: \`${skippedRows.length}\`
- Missing document target rows: \`${missingDocumentTargets.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Cyl | Displacement L | Configuration |
| --- | --- | --- | --- | ---: | ---: | --- |
${missingRows.map((row) => `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.cylinders ?? ''} | ${row.displacement_l ?? ''} | ${row.configuration ?? ''} |`).join('\n')}

## Manual Attachments

| Document | Source | Target models |
| --- | --- | --- |
| ${DOCUMENT.label} | ${DOCUMENT.storagePath} | ${DOCUMENT_TARGET_MODELS.join(', ')} |
| ${WORKSHOP_DOCUMENT.label} | ${WORKSHOP_DOCUMENT.storagePath} | ${DOCUMENT_TARGET_MODELS.join(', ')} |

## Validation Sources

- Perkins official shop page for 4.236/A4.236 parts: ${PERKINS_4236_SHOP}
- ManualsLib 4.236 Series manuals index: ${MANUALSLIB_4236_PRODUCT}
- Perkins 4.236 Series user handbook mirror: ${DOCZZ_4236_HANDBOOK}

## Evidence Notes

- Perkins' official shop site preserves a public 4.236 Series engine-family route, validating that Perkins still treats this as a legacy parts family.
- The public 4.236 Series user handbook explicitly lists models \`4.236\`, \`T4.236\`, \`4.248\`, and \`4.2482\`; it also validates four cylinders, naturally aspirated vs turbocharged variants, and 3.86/4.06 L displacement data.
- \`4.204\`, \`4.212\`, and \`4.224\` were reviewed but not imported in this batch because the validated handbook model list does not cover them as exact rows.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

verifyHtml({
  url: PERKINS_4236_SHOP,
  fileName: 'perkins-shop-4236-series.html',
  cachedPath: '/tmp/perkins-shop-4236-series-current.html',
  requiredTokens: [
    'perkins-4236-series',
    'X4_236_series__c',
    '4.236-series',
  ],
})

const manualProduct = verifyHtml({
  url: MANUALSLIB_4236_PRODUCT,
  fileName: 'manualslib-perkins-4236-series.html',
  cachedPath: '/tmp/manualslib-perkins-4236-series-current.html',
  requiredTokens: [
    'Perkins 4.236 Series Manuals',
    'Workshop Manual',
    'Operator',
    'Service Data',
    'User Handbook',
    'View of Fuel Pump Side of T4.236 Engine',
    'View of Fuel Pump Side of 4.248, 4.236 and 4.212 Engines',
  ],
})

const handbook = verifyHtml({
  url: DOCZZ_4236_HANDBOOK,
  fileName: 'doczz-perkins-4236-series.html',
  cachedPath: '/tmp/doczz-perkins-4236-series-current.html',
  requiredTokens: [
    'Perkins 4.236 Series',
    'Models 4.236, T4.236, 4.248, 4.2482',
    'The 4.236 Series family consists of four engines',
    'naturally aspirated 4.236, 4.248 and 4.2482 engines',
    'turbocharged T4.236 engine',
    '3,86 litres (236 in3)',
    '4,06 litres (248 in3)',
  ],
})

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Perkins 4.236 family legacy batch`)

const before = await fetchAllEngines(supabase)
const existingKeys = new Set(before.map((engine) => `${engine.brand}::${normalize(engine.model)}`))
const missingRows = RECORDS.filter(
  (engine) => !existingKeys.has(`${engine.brand}::${normalize(engine.model)}`),
)
const existingCount = RECORDS.length - missingRows.length

console.log(`Candidates: ${RECORDS.length}; existing: ${existingCount}; missing: ${missingRows.length}`)
for (const engine of missingRows) console.log(`${engine.brand}\t${engine.model}\t${engine.slug}`)

if (APPLY && missingRows.length) {
  const { data, error } = await supabase
    .from('engines')
    .upsert(missingRows, { onConflict: 'slug' })
    .select('id, brand, model, slug')
  if (error) throw error
  console.log(`Imported ${data.length} validated legacy Perkins 4.236-family record(s).`)
}

const afterEngines = APPLY && missingRows.length ? await fetchAllEngines(supabase) : before
const targetEngines = DOCUMENT_TARGET_MODELS.map((model) => {
  const engine = afterEngines.find(
    (row) => row.brand === 'Perkins' && normalize(row.model) === normalize(model),
  )
  return { model, engine }
})

const linkedRows = []
const skippedRows = []
const missingDocumentTargets = []

for (const { model, engine } of targetEngines) {
  if (!engine) {
    missingDocumentTargets.push({ model, reason: 'No matching Perkins row exists.' })
    continue
  }
  if (engine.status !== 'discontinued') {
    missingDocumentTargets.push({ model, reason: `Engine row exists but status is ${engine.status}.` })
    continue
  }

  for (const document of [
    { ...DOCUMENT, fileSizeBytes: handbook.fileSizeBytes },
    { ...WORKSHOP_DOCUMENT, fileSizeBytes: manualProduct.fileSizeBytes },
  ]) {
    const { data: existingLinks, error: existingLinksError } = await supabase
      .from('engine_pdfs')
      .select('id')
      .eq('engine_id', engine.id)
      .eq('storage_path', document.storagePath)
    if (existingLinksError) throw existingLinksError

    const row = { model, slug: engine.slug, label: document.label }
    if (existingLinks?.length) {
      skippedRows.push(row)
      continue
    }

    if (APPLY) {
      const { error: insertError } = await supabase.from('engine_pdfs').insert({
        engine_id: engine.id,
        type: document.type,
        label: document.label,
        storage_path: document.storagePath,
        file_size_bytes: document.fileSizeBytes,
      })
      if (insertError) throw insertError
    }
    linkedRows.push(row)
  }
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = await countLegacyCoverage(supabase)
await fsp.writeFile(
  REPORT_PATH,
  buildReport({
    existingCount,
    missingRows,
    linkedRows,
    skippedRows,
    missingDocumentTargets,
    afterCount: APPLY ? afterCount : null,
    coverage: APPLY ? coverage : null,
  }),
)

console.log(`${APPLY ? 'Linked' : 'Planned'} manual/reference links: ${linkedRows.length}.`)
console.log(`Existing links skipped: ${skippedRows.length}.`)
console.log(`Missing document target rows: ${missingDocumentTargets.length}.`)
console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
