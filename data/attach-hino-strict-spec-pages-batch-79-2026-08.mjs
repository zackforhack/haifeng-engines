// Attach source-validated Hino technical-spec pages to exact legacy rows.
//
// Dry run:
//   node data/attach-hino-strict-spec-pages-batch-79-2026-08.mjs
// Apply:
//   node data/attach-hino-strict-spec-pages-batch-79-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-79-hino-strict-spec-pages.md'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengHinoStrictSpecs/1.0; +https://engines.haifengmachinery.com)'

const DOCUMENTS = [
  {
    key: 'h06c-h06ct',
    sourceUrl: 'http://www.hino-h06.com/hino-h06c-h06ct-engine-specifications-and-torque-values.html',
    label: 'Hino H06C/H06CT Engine Specifications and Torque Values',
    note: 'Third-party Hino engine-parts technical page; source is HTTP because HTTPS certificate names do not match the host.',
    slugs: ['hino-h06c', 'hino-h06ct'],
    required: [
      'Hino H06C H06CT Engine Specifications and Torque Values',
      'Turbocharger Boost Pressure',
      'Compression test at 270',
      'Cylinder Liner Inside Diameter',
      'Piston Ring End Gap',
      'Head Bolt Tightening Torque Value',
    ],
  },
  {
    key: 'h07c-h07ct-h07d-h07dt',
    sourceUrl: 'http://www.hino-h07.com/hitachi-ex220-specifications--engine-specifications.html',
    label: 'Hino H07C/H07CT/H07D/H07DT Engine Specifications and Rebuilding Information',
    note: 'Third-party Hino engine-parts technical page; source is HTTP because HTTPS certificate names do not match the host.',
    slugs: ['hino-h07c', 'hino-h07ct', 'hino-h07d', 'hino-h07dt'],
    required: [
      'Hino H07C H07CT Engine Specifications and Engine Rebuilding Information',
      'Displacement 6.728 Liters',
      'Bore 110MM',
      'Stroke 118MM',
      'Generator Engine Operating Speed 1500 - 1800 RPM',
      'Hino H07D H07DT Engine Specifications and Engine Rebuilding Information',
      'Displacement 7.412 Liters',
      'Stroke 130MM',
      'Heavy Equipment Engine Operating Speed 2800 RPM',
    ],
  },
  {
    key: 'w04c-t-w04c-ti',
    sourceUrl: 'https://barringtondieselclub.co.za/hino/hino-w04.html',
    label: 'Hino W04 Diesel Engine Specs Reference Page',
    note: 'Barrington Diesel Club source-hosted Hino W04 specification page.',
    slugs: ['hino-w04c-t', 'hino-w04c-ti'],
    required: [
      'Hino W04 Manuals, Engine Specifications & Bolt Torques',
      'Hino W04 Diesel Engine Specs',
      'Displacement, Bore and Stroke',
      'W04C-T - W04C-TI',
      'Bore',
      'Stroke',
      'Weight and Dimensions',
      'Power and Arrangement',
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
    .replace(/&ndash;/gi, '-')
    .replace(/–/g, '-')
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
  return `# Legacy Engine Document Attachments - Batch 79 Hino Strict Spec Pages

Date: 2026-08-12

## Result

- Hino technical/specification pages verified: \`${verifiedDocs.length}\`
- Strict datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
- Strict legacy coverage before: \`${coverageBefore.strictCount}/${coverageBefore.legacyCount} (${coverageBefore.strictPct}%)\`
${coverageAfter == null ? '' : `- Strict legacy coverage after: \`${coverageAfter.strictCount}/${coverageAfter.legacyCount} (${coverageAfter.strictPct}%)\`\n- Remaining strict links needed for 60%: \`${coverageAfter.strictNeededFor60Percent}\`\n`}
## Document Attachments

| Document | Type | Source / URL | Linked rows | Source bytes |
| --- | --- | --- | ---: | ---: |
${verifiedDocs.map((doc) => `| ${doc.label} | datasheet | ${doc.sourceUrl} | ${doc.slugs.length} | ${doc.pageBytes} |`).join('\n')}

## Linked Engine Rows

${verifiedDocs.map((doc) => `### ${doc.label}\n${doc.slugs.map((slug) => `- \`${slug}\``).join('\n')}`).join('\n\n')}

## Validation Notes

${verifiedDocs.map((doc) => `- ${doc.note}`).join('\n')}
- H06/H07 validation required exact model-family headings plus rebuilding/specification fields such as displacement, bore/stroke, compression-test values, generator operating speed, and torque/rebuild specifications.
- W04 validation required the Barrington title plus W04 diesel-spec, displacement/bore/stroke, W04C-T/W04C-TI, weight/dimensions and power/arrangement sections.
- Hino W04D-J, W06D/W06D-TI and J05C remain unlinked until exact model/source-page tokens are validated.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Hino strict spec-page links`)
const coverageBefore = await fetchStrictCoverage(supabase)
const verifiedDocs = DOCUMENTS.map(verifySource)
for (const doc of verifiedDocs) {
  console.log(`Verified ${doc.label}: ${doc.pageBytes} bytes`)
}

const slugs = [...new Set(verifiedDocs.flatMap((doc) => doc.slugs))]
const { data: engines, error: engineError } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .in('slug', slugs)
if (engineError) throw engineError

const engineBySlug = new Map((engines ?? []).map((engine) => [engine.slug, engine]))
const missingEngines = slugs.filter((slug) => !engineBySlug.has(slug))
if (missingEngines.length) console.warn(`Missing engine rows: ${missingEngines.join(', ')}`)

for (const engine of engines ?? []) {
  if (engine.brand !== 'Hino' || engine.status !== 'discontinued') {
    throw new Error(`Refusing to link unexpected row: ${engine.slug} (${engine.brand}, ${engine.status})`)
  }
}

let linkedCount = 0
let skippedCount = 0

for (const doc of verifiedDocs) {
  for (const slug of doc.slugs) {
    const engine = engineBySlug.get(slug)
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
