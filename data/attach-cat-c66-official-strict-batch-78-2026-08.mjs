// Attach official Cat non-current C6.6 60 Hz product-spec page to exact legacy genset row.
//
// Dry run:
//   node data/attach-cat-c66-official-strict-batch-78-2026-08.mjs
// Apply:
//   node data/attach-cat-c66-official-strict-batch-78-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-78-cat-c66-official-strict.md'
const SOURCE_URL = 'https://h-cpc.cat.com/cmms/v2?cid=402&f=product&gid=18260932&it=product&lid=en&nc=1&pid=18488397&sc=K212'
const TARGET_SLUG = 'caterpillar-c6-6-60-hz-tier-3-legacy-genset'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengCatC66OfficialStrict/1.0; +https://engines.haifengmachinery.com)'

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
    .replace(/™/g, '')
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
    encoding: 'utf8',
    env: curlEnv(),
    maxBuffer: 20 * 1024 * 1024,
  })
}

function verifySourcePage() {
  const text = fetchText(SOURCE_URL)
  const required = [
    'Cat C6.6 (60 Hz) Diesel Generator Sets | Caterpillar',
    'C6.6 (60 Hz)',
    'Non-Current',
    'Specifications',
    'Generator Set Specifications',
    'Minimum Rating',
    'Maximum Rating',
    'Tier 3 Nonroad Equiv.',
    'Frequency',
    '60 Hz',
    'Speed',
    '1800 rpm',
    'Engine Specifications',
    'Engine Model',
    'C6.6, In-line 6, 4-cycle diesel',
    'Compression Ratio',
    'Fuel System',
  ]
  const missing = required.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${SOURCE_URL}: missing validation token(s): ${missing.join(', ')}`)
  }
  return Buffer.byteLength(text)
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
  return `# Legacy Engine Document Attachments - Batch 78 Cat C6.6 Official Strict Data

Date: 2026-08-12

## Result

- Official Cat non-current C6.6 60 Hz product page verified: \`1\`
- Strict datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
- Source page bytes: \`${pageBytes}\`
- Strict legacy coverage before: \`${coverageBefore.strictCount}/${coverageBefore.legacyCount} (${coverageBefore.strictPct}%)\`
${coverageAfter == null ? '' : `- Strict legacy coverage after: \`${coverageAfter.strictCount}/${coverageAfter.legacyCount} (${coverageAfter.strictPct}%)\`\n- Remaining strict links needed for 60%: \`${coverageAfter.strictNeededFor60Percent}\`\n`}
## Document Attachment

| Engine row | Document | Type | Source / URL |
| --- | --- | --- | --- |
| \`${TARGET_SLUG}\` | Cat C6.6 (60 Hz) Non-Current Product Specifications Page | datasheet | ${SOURCE_URL} |

## Validation Notes

- The official Cat page carries a \`Non-Current\` marker for \`C6.6 (60 Hz)\`.
- Validation required generator-set specification fields and engine specification fields, including Tier 3 Nonroad equivalent, 60 Hz, 1800 rpm, and engine model \`C6.6, In-line 6, 4-cycle diesel\`.
- Only the exact discontinued C6.6 60 Hz Tier 3 legacy genset row was linked.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Cat C6.6 official strict link`)
const coverageBefore = await fetchStrictCoverage(supabase)
const pageBytes = verifySourcePage()
console.log(`Verified Cat C6.6 non-current specifications page: ${pageBytes} bytes`)

const { data: engines, error: engineError } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .eq('slug', TARGET_SLUG)
if (engineError) throw engineError

const engine = (engines ?? [])[0]
const missingEngines = engine ? [] : [TARGET_SLUG]
if (engine && (engine.brand !== 'Caterpillar' || engine.status !== 'discontinued')) {
  throw new Error(`Refusing to link unexpected row: ${engine.slug} (${engine.brand}, ${engine.status})`)
}

let linkedCount = 0
let skippedCount = 0

if (engine) {
  const { data: existing, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('id')
    .eq('engine_id', engine.id)
    .eq('storage_path', SOURCE_URL)
  if (existingError) throw existingError

  if ((existing ?? []).length > 0) {
    skippedCount += 1
  } else {
    linkedCount += 1
    if (APPLY) {
      const { error: insertError } = await supabase.from('engine_pdfs').insert({
        engine_id: engine.id,
        type: 'datasheet',
        label: 'Cat C6.6 (60 Hz) Non-Current Product Specifications Page',
        storage_path: SOURCE_URL,
        file_size_bytes: pageBytes,
      })
      if (insertError) throw insertError
    }
  }
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
