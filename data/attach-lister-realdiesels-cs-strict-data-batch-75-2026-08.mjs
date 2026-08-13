// Attach remaining source-validated RealDiesels Lister CS/9-1 technical-data rows.
//
// Dry run:
//   node data/attach-lister-realdiesels-cs-strict-data-batch-75-2026-08.mjs
// Apply:
//   node data/attach-lister-realdiesels-cs-strict-data-batch-75-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-75-lister-cs-realdiesels-strict-data.md'
const SOURCE_URL = 'https://realdiesels.co.uk/listerdata.html'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengListerCSRealDieselsStrictData/1.0; +https://engines.haifengmachinery.com)'

const TARGETS = [
  { slug: 'lister-petter-lister-9-1-jp1', token: 'Lister 9/1' },
  { slug: 'lister-petter-lister-cs-3-5-1', token: 'Lister CS 3.5/1' },
  { slug: 'lister-petter-lister-cs-10-2', token: 'Lister CS 10/2' },
  { slug: 'lister-petter-lister-cs-12-2', token: 'Lister CS 12/2' },
  { slug: 'lister-petter-lister-cs-16-2', token: 'Lister CS 16/2' },
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
  return String(value ?? '')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function curlEnv() {
  return {
    ...process.env,
    HTTP_PROXY: '',
    HTTPS_PROXY: '',
    ALL_PROXY: '',
    http_proxy: '',
    https_proxy: '',
    all_proxy: '',
  }
}

function fetchText(url) {
  return execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '3',
    '--retry-all-errors',
    '--connect-timeout',
    '30',
    '--max-time',
    '120',
    '--user-agent',
    USER_AGENT,
    url,
  ], {
    encoding: 'latin1',
    env: curlEnv(),
    maxBuffer: 20 * 1024 * 1024,
  })
}

function verifySourcePage() {
  const text = fetchText(SOURCE_URL)
  const required = [
    'Lister Spare Parts and Engine Data',
    'Lister Marine & Industrial Engine Information & Technical Data',
    'Model',
    'Cylinders',
    'Capacity (cc)',
    'Bore & Stroke',
    'HP @ RPM (max)',
    'Cooling',
    'Weight',
    'Fuel',
    'Combustion/Injection',
    ...TARGETS.map((target) => target.token),
  ]
  const missing = required.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${SOURCE_URL}: missing validation token(s): ${missing.join(', ')}`)
  }
  return text.length
}

async function fetchStrictCoverage(supabase) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, status, pdfs:engine_pdfs(id,type)')
      .range(from, from + 999)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  const legacy = rows.filter((row) => row.status === 'discontinued')
  const strict = legacy.filter((row) =>
    (row.pdfs ?? []).some((pdf) => pdf.type === 'datasheet' || pdf.type === 'brochure'),
  )
  return {
    engineCount: rows.length,
    legacyCount: legacy.length,
    strictCount: strict.length,
    strictPct: Number((strict.length / legacy.length * 100).toFixed(1)),
    strictNeededFor60Percent: Math.max(0, Math.ceil(legacy.length * 0.6) - strict.length),
  }
}

function buildReport({ pageBytes, linkedCount, skippedCount, missingEngines, coverageBefore, coverageAfter }) {
  return `# Legacy Engine Document Attachments - Batch 75 Lister CS RealDiesels Strict Data

Date: 2026-08-12

## Result

- RealDiesels Lister technical-data page verified: \`1\`
- Strict datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
- Source page bytes: \`${pageBytes}\`
- Strict legacy coverage before: \`${coverageBefore.strictCount}/${coverageBefore.legacyCount} (${coverageBefore.strictPct}%)\`
${coverageAfter == null ? '' : `- Strict legacy coverage after: \`${coverageAfter.strictCount}/${coverageAfter.legacyCount} (${coverageAfter.strictPct}%)\`\n- Remaining strict links needed for 60%: \`${coverageAfter.strictNeededFor60Percent}\`\n`}
## Document Attachment

| Document | Type | Source / URL | Linked rows |
| --- | --- | --- | ---: |
| Lister Marine & Industrial Engine Information & Technical Data | datasheet | ${SOURCE_URL} | ${TARGETS.length} |

## Linked Engine Rows

${TARGETS.map((target) => `- \`${target.slug}\` - source token: \`${target.token}\``).join('\n')}

## Validation Notes

- These rows were separated from Batch 74 after body-table inspection confirmed they appear with model-by-model technical fields, not only metadata keywords.
- The source table includes cylinders, capacity, bore/stroke, HP/RPM, cooling, weight, fuel and combustion/injection fields.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: remaining Lister CS RealDiesels strict data links`)
const coverageBefore = await fetchStrictCoverage(supabase)
const pageBytes = verifySourcePage()
console.log(`Verified RealDiesels Lister technical-data page: ${pageBytes} bytes`)

const slugs = TARGETS.map((target) => target.slug)
const { data: engines, error: engineError } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .in('slug', slugs)
if (engineError) throw engineError

const engineBySlug = new Map((engines ?? []).map((engine) => [engine.slug, engine]))
const missingEngines = slugs.filter((slug) => !engineBySlug.has(slug))
if (missingEngines.length) console.warn(`Missing engine rows: ${missingEngines.join(', ')}`)

for (const engine of engines ?? []) {
  if (engine.brand !== 'Lister Petter' || engine.status !== 'discontinued') {
    throw new Error(`Refusing to link unexpected row: ${engine.slug} (${engine.brand}, ${engine.status})`)
  }
}

let linkedCount = 0
let skippedCount = 0

for (const slug of slugs) {
  const engine = engineBySlug.get(slug)
  if (!engine) continue

  const { data: existing, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('id')
    .eq('engine_id', engine.id)
    .eq('storage_path', SOURCE_URL)
  if (existingError) throw existingError

  if ((existing ?? []).length > 0) {
    skippedCount += 1
    continue
  }

  linkedCount += 1
  if (!APPLY) continue

  const { error: insertError } = await supabase.from('engine_pdfs').insert({
    engine_id: engine.id,
    type: 'datasheet',
    label: 'Lister Marine & Industrial Engine Information & Technical Data',
    storage_path: SOURCE_URL,
    file_size_bytes: pageBytes,
  })
  if (insertError) throw insertError
}

const coverageAfter = APPLY ? await fetchStrictCoverage(supabase) : null
await fsp.writeFile(
  REPORT_PATH,
  buildReport({ pageBytes, linkedCount, skippedCount, missingEngines, coverageBefore, coverageAfter }),
)

console.log(
  `${APPLY ? 'Applied' : 'Dry run complete'}: ${linkedCount} linked/planned, `
  + `${skippedCount} skipped.`,
)
if (coverageAfter) {
  console.log(
    `Strict legacy coverage: ${coverageAfter.strictCount}/${coverageAfter.legacyCount} `
    + `(${coverageAfter.strictPct}%), remaining ${coverageAfter.strictNeededFor60Percent}`,
  )
}
