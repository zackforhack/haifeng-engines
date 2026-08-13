// Attach official Kubota Engine Discovery gallery technical-data pages to exact legacy rows.
//
// Dry run:
//   node data/attach-kubota-official-gallery-strict-batch-77-2026-08.mjs
// Apply:
//   node data/attach-kubota-official-gallery-strict-batch-77-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-77-kubota-official-gallery-strict.md'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengKubotaOfficialGalleryStrict/1.0; +https://engines.haifengmachinery.com)'

const DOCUMENTS = [
  {
    slug: 'kubota-d850',
    sourceUrl: 'https://discovery.engine.kubota.com/gallery/d850/',
    label: 'Kubota D850 Engine Discovery Technical Data Page',
    required: [
      'D850 (1980) | Gallery | Kubota Engine Discovery',
      'D850',
      'Super Mini',
      'Diesel engine',
      'Vertical, water-cooled, 4-cycle',
      'Year',
      'Number of cylinders',
      'Bore (mm)',
      'Stroke (mm)',
      'Displacement (cc)',
      'Rated output / speed',
      'Dry weight',
    ],
  },
  {
    slug: 'kubota-zb400',
    sourceUrl: 'https://discovery.engine.kubota.com/gallery/zb400/',
    label: 'Kubota ZB400 Engine Discovery Technical Data Page',
    required: [
      'ZB400 (1980) | Gallery | Kubota Engine Discovery',
      'ZB400',
      'Diesel engine',
      'Horizontal, water-cooled, 4-cycle',
      'Year',
      '1980',
      'Number of cylinders',
      'Displacement (cc)',
      '400',
      'Rated output / speed',
      'Dry weight',
    ],
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
  return String(value ?? '')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
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

function verifySource(document) {
  const text = fetchText(document.sourceUrl)
  const missing = document.required.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${document.sourceUrl}: missing validation token(s): ${missing.join(', ')}`)
  }
  return {
    ...document,
    pageBytes: Buffer.byteLength(text),
  }
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

function buildReport({ verifiedDocs, linkedCount, skippedCount, missingEngines, coverageBefore, coverageAfter }) {
  return `# Legacy Engine Document Attachments - Batch 77 Kubota Official Gallery Strict Data

Date: 2026-08-12

## Result

- Official Kubota Engine Discovery technical pages verified: \`${verifiedDocs.length}\`
- Strict datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
- Strict legacy coverage before: \`${coverageBefore.strictCount}/${coverageBefore.legacyCount} (${coverageBefore.strictPct}%)\`
${coverageAfter == null ? '' : `- Strict legacy coverage after: \`${coverageAfter.strictCount}/${coverageAfter.legacyCount} (${coverageAfter.strictPct}%)\`\n- Remaining strict links needed for 60%: \`${coverageAfter.strictNeededFor60Percent}\`\n`}
## Document Attachments

| Engine row | Document | Type | Source / URL | Source bytes |
| --- | --- | --- | --- | ---: |
${verifiedDocs.map((doc) => `| \`${doc.slug}\` | ${doc.label} | datasheet | ${doc.sourceUrl} | ${doc.pageBytes} |`).join('\n')}

## Validation Notes

- Each page is an official Kubota Engine Discovery gallery page, not a third-party parts listing.
- D850 validation required the official model page title plus Super Mini, diesel, vertical water-cooled 4-cycle, cylinder, bore, stroke, displacement, rated-output/speed and dry-weight fields.
- ZB400 validation required the official model page title plus diesel, horizontal water-cooled 4-cycle, year, cylinder, displacement, rated-output/speed and dry-weight fields.
- Only exact discontinued rows were linked.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Kubota official gallery strict links`)
const coverageBefore = await fetchStrictCoverage(supabase)
const verifiedDocs = DOCUMENTS.map(verifySource)
for (const doc of verifiedDocs) {
  console.log(`Verified ${doc.label}: ${doc.pageBytes} bytes`)
}

const slugs = verifiedDocs.map((doc) => doc.slug)
const { data: engines, error: engineError } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .in('slug', slugs)
if (engineError) throw engineError

const engineBySlug = new Map((engines ?? []).map((engine) => [engine.slug, engine]))
const missingEngines = slugs.filter((slug) => !engineBySlug.has(slug))
if (missingEngines.length) console.warn(`Missing engine rows: ${missingEngines.join(', ')}`)

for (const engine of engines ?? []) {
  if (engine.brand !== 'Kubota' || engine.status !== 'discontinued') {
    throw new Error(`Refusing to link unexpected row: ${engine.slug} (${engine.brand}, ${engine.status})`)
  }
}

let linkedCount = 0
let skippedCount = 0

for (const doc of verifiedDocs) {
  const engine = engineBySlug.get(doc.slug)
  if (!engine) continue

  const { data: existing, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('id')
    .eq('engine_id', engine.id)
    .eq('storage_path', doc.sourceUrl)
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
    label: doc.label,
    storage_path: doc.sourceUrl,
    file_size_bytes: doc.pageBytes,
  })
  if (insertError) throw insertError
}

const coverageAfter = APPLY ? await fetchStrictCoverage(supabase) : null
await fsp.writeFile(
  REPORT_PATH,
  buildReport({ verifiedDocs, linkedCount, skippedCount, missingEngines, coverageBefore, coverageAfter }),
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
