// Attach source-hosted Ford 2700/2710 engine specification page links to exact legacy rows.
//
// Dry run:
//   node data/attach-ford-2700-strict-specs-batch-73-2026-08.mjs
// Apply:
//   node data/attach-ford-2700-strict-specs-batch-73-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-73-ford-2700-strict-specs.md'
const SOURCE_URL = 'https://barringtondieselclub.co.za/ford/ford-2700-engines.html'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengFord2700StrictSpecs/1.0; +https://engines.haifengmachinery.com)'

const TARGETS = [
  'ford-2701e',
  'ford-2703e',
  'ford-2704e',
  'ford-2704et',
  'ford-2711e',
  'ford-2713e',
  'ford-2714e',
  'ford-2715e',
]

const MODEL_TOKENS = [
  'Ford 2701E 4 Cylinder Diesel',
  'Ford 2703E 6 Cylinder Diesel',
  '2704E 6 Cylinder Diesel',
  'Ford 2704ET 6 Cylinder Diesel',
  'Ford 2711E 4 Cylinder',
  'Ford 2713E 6 Cylinder',
  'Ford 2714E 6 Cylinder',
  'Ford 2715E 6 Cylinder',
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

function normalize(value) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
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
    encoding: 'utf8',
    env: curlEnv(),
    maxBuffer: 20 * 1024 * 1024,
  })
}

function verifySourcePage() {
  const text = fetchText(SOURCE_URL)
  const required = [
    'Ford 2700 Manuals, Engine Specifications & Bolt Torques',
    'Ford 2700 Diesel Engine Specs',
    'Bore, Stroke, Displacement',
    'Power, Torque',
    'Compression Ratio',
    ...MODEL_TOKENS,
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
  return `# Legacy Engine Document Attachments - Batch 73 Ford 2700 Strict Specs

Date: 2026-08-12

## Result

- Ford 2700/2710 source-hosted specification page verified: \`1\`
- Strict datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
- Source page bytes: \`${pageBytes}\`
- Strict legacy coverage before: \`${coverageBefore.strictCount}/${coverageBefore.legacyCount} (${coverageBefore.strictPct}%)\`
${coverageAfter == null ? '' : `- Strict legacy coverage after: \`${coverageAfter.strictCount}/${coverageAfter.legacyCount} (${coverageAfter.strictPct}%)\`\n- Remaining strict links needed for 60%: \`${coverageAfter.strictNeededFor60Percent}\`\n`}
## Document Attachment

| Document | Type | Source / URL | Linked rows |
| --- | --- | --- | ---: |
| Ford 2700 Diesel Engine Specs Reference Page | datasheet | ${SOURCE_URL} | ${TARGETS.length} |

## Linked Engine Rows

${TARGETS.map((slug) => `- \`${slug}\``).join('\n')}

## Validation Notes

- The Barrington Diesel Club page title states \`Ford 2700 Manuals, Engine Specifications & Bolt Torques\`.
- The page includes a \`Ford 2700 Diesel Engine Specs\` section with bore, stroke, displacement, power, torque and compression-ratio fields.
- Only rows explicitly named in that specification section were linked. Ford 2701C, 2712E and 2720 Range rows remain manual/reference-only until an exact spec source is validated for them.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Ford 2700/2710 strict spec-page links`)
const coverageBefore = await fetchStrictCoverage(supabase)
const pageBytes = verifySourcePage()
console.log(`Verified Ford 2700 specification page: ${pageBytes} bytes`)

const { data: engines, error: engineError } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .in('slug', TARGETS)
if (engineError) throw engineError

const engineBySlug = new Map((engines ?? []).map((engine) => [engine.slug, engine]))
const missingEngines = TARGETS.filter((slug) => !engineBySlug.has(slug))
if (missingEngines.length) console.warn(`Missing engine rows: ${missingEngines.join(', ')}`)

for (const engine of engines ?? []) {
  if (engine.brand !== 'Ford' || engine.status !== 'discontinued') {
    throw new Error(`Refusing to link unexpected row: ${engine.slug} (${engine.brand}, ${engine.status})`)
  }
}

let linkedCount = 0
let skippedCount = 0

for (const slug of TARGETS) {
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
    label: 'Ford 2700 Diesel Engine Specs Reference Page',
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
