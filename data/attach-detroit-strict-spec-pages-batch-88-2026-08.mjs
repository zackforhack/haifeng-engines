// Attach source-validated strict Detroit Diesel specification pages to exact legacy rows.
//
// Dry run:
//   node data/attach-detroit-strict-spec-pages-batch-88-2026-08.mjs
// Apply:
//   node data/attach-detroit-strict-spec-pages-batch-88-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-13-batch-88-detroit-strict.md'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
const SUPABASE_TIMEOUT_MS = 60_000

const DOCUMENTS = [
  {
    key: 'detroit-diesel-2-53-dieselpro-specs',
    sourceUrl:
      'https://dieselpro.com/blog/engine-configurations-overview-of-inline-and-v-type-detroit-diesel-53-series-engine-models-2-53-3-53-4-53-6v-53-and-8v-53/',
    label: 'Detroit Diesel 2-53 Engine Configuration Specifications Page',
    type: 'datasheet',
    slugs: ['detroit-diesel-2-53'],
    requiredTokens: [
      '2-53 Engine Configuration',
      'Specifications',
      'Cylinders:',
      '2',
      'Bore:',
      '3.875 inches (98 mm)',
      'Stroke:',
      '4.5 inches (114 mm)',
      'Displacement:',
      '106 cubic inches (1.74 liters)',
      'Naturally Aspirated (N): 21:1',
      'Turbocharged (T): 18.7:1',
    ],
    note:
      'Diesel Pro page exposes the exact 2-53 section with cylinder count, bore, stroke, displacement and compression-ratio data.',
  },
  {
    key: 'detroit-diesel-6-53-chevytrucks-specs',
    sourceUrl: 'https://chevytrucks.org/detroit-diesel-series-53-engine-guide/',
    label: 'Detroit Diesel Series 53 Specs Table - 6-53 Row',
    type: 'datasheet',
    slugs: ['detroit-diesel-6-53'],
    requiredTokens: [
      'Detroit Diesel Series 53 Specs',
      '6-53',
      '6 Cylinders',
      '2-Cycle Diesel',
      '5.22 L (318 cid)',
      'Inline or V',
      '3.875',
      '4.5',
      '17:1, 21:1',
      '216-400 hp',
      '445-568 lb-ft',
    ],
    note:
      'ChevyTrucks page exposes a Series 53 specification table with an exact 6-53 column covering displacement, configuration, bore/stroke, compression, horsepower and torque.',
  },
  {
    key: 'detroit-diesel-82-fuel-pincher-dieselpro-specs',
    sourceUrl: 'https://dieselpro.com/blog/general-information-for-detroit-diesel-8-2l-engines/',
    label: 'Detroit Diesel 8.2L Fuel Pincher Specifications Page',
    type: 'datasheet',
    slugs: ['detroit-diesel-8-2l-fuel-pincher'],
    requiredTokens: [
      'General Information for Detroit Diesel 8.2L Engines',
      'Fuel Pincher',
      'four-stroke, V-8 diesel engine',
      'Type:',
      'Four-stroke cycle diesel engine',
      'Configuration:',
      '90-degree V-8 with a cast-iron block',
      'Bore and Stroke:',
      '4.25 inches x 4.41 inches',
      'Displacement:',
      '500 cubic inches (8.2 liters)',
      'Compression Ratio:',
      'Naturally aspirated engines',
      'Turbocharged engines',
    ],
    note:
      'Diesel Pro page exposes exact Detroit Diesel 8.2L/Fuel Pincher identity plus V8 configuration, bore/stroke, displacement and compression-ratio specifications.',
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

function decodeHtml(value) {
  return String(value ?? '')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ndash;|&#8211;|\u2013/gi, '-')
    .replace(/&mdash;|&#8212;|\u2014/gi, '-')
    .replace(/&reg;|&#174;/gi, '')
    .replace(/&bull;|&#8226;|\u2022/gi, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
}

function normalize(value) {
  return decodeHtml(value)
    .toUpperCase()
    .replace(/\uFB01/g, 'FI')
    .replace(/\uFB02/g, 'FL')
    .replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function fetchText(url) {
  const args = [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--compressed',
    '--user-agent',
    USER_AGENT,
    '--max-time',
    '60',
    url,
  ]
  return execFileSync('curl', args, {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  })
}

async function withTimeout(promise, label) {
  let timeout
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`${label} timed out after ${SUPABASE_TIMEOUT_MS}ms`)),
          SUPABASE_TIMEOUT_MS,
        )
      }),
    ])
  } finally {
    clearTimeout(timeout)
  }
}

function verifyDocument(document) {
  console.log(`Fetching ${document.sourceUrl}`)
  const text = fetchText(document.sourceUrl)
  const missing = document.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${document.key}: missing validation token(s): ${missing.join(', ')}`)
  }
  return {
    ...document,
    fileSizeBytes: Buffer.byteLength(text),
  }
}

async function fetchStrictCoverage(supabase) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await withTimeout(
      supabase
        .from('engines')
        .select('id, status, pdfs:engine_pdfs(id,type)')
        .range(from, from + 999),
      `coverage range ${from}-${from + 999}`,
    )
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

function buildReport({
  verifiedDocs,
  insertedRows,
  skippedRows,
  missingRows,
  coverageBefore,
  coverageAfter,
}) {
  return `# Legacy Engine Document Attachments - Batch 88 Detroit Strict

Date: 2026-08-13

## Result

- Strict source pages verified: \`${verifiedDocs.length}\`
- Strict datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${insertedRows.length}\`
- Links skipped as existing strict/exact duplicates: \`${skippedRows.length}\`
- Missing/refused engine rows: \`${missingRows.length}\`
- Strict legacy coverage before: \`${coverageBefore.strictCount}/${coverageBefore.legacyCount} (${coverageBefore.strictPct}%)\`
${coverageAfter == null ? '' : `- Strict legacy coverage after: \`${coverageAfter.strictCount}/${coverageAfter.legacyCount} (${coverageAfter.strictPct}%)\`\n- Remaining strict links needed for 60%: \`${coverageAfter.strictNeededFor60Percent}\`\n`}
## Document Attachments

| Document | Type | Source / URL | Target rows | Source bytes |
| --- | --- | --- | ---: | ---: |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.type} | ${doc.sourceUrl} | ${doc.slugs.length} | ${doc.fileSizeBytes} |`).join('\n')}

## Linked Engine Rows

| Brand | Engine slug | Source key | Status |
| --- | --- | --- | --- |
${insertedRows.map((row) => `| ${row.brand} | \`${row.slug}\` | ${row.sourceKey} | inserted |`).join('\n')}
${skippedRows.map((row) => `| ${row.brand} | \`${row.slug}\` | ${row.sourceKey} | existing |`).join('\n')}
${missingRows.map((row) => `| ${row.brand ?? ''} | \`${row.slug}\` | ${row.sourceKey ?? ''} | ${row.reason} |`).join('\n')}

## Validation Notes

${verifiedDocs.map((doc) => `- ${doc.note}`).join('\n')}
- Detroit Diesel 4V-53 remains a strict gap because the accessible source found during this pass validates a 4-53/inline-or-V family table rather than a clean exact 4V-53 row.
- Komatsu 95/105/125 candidates remain excluded from this batch because promising pages were blocked by JS challenge or did not expose durable public source text for exact validation.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Detroit strict legacy pages`)
console.log('Reading current strict legacy coverage...')
const coverageBefore = await fetchStrictCoverage(supabase)
console.log(`Coverage before: ${coverageBefore.strictCount}/${coverageBefore.legacyCount}`)
const verifiedDocs = DOCUMENTS.map(verifyDocument)
for (const doc of verifiedDocs) {
  console.log(`Verified ${doc.label}: ${doc.fileSizeBytes} bytes`)
}

const slugs = [...new Set(verifiedDocs.flatMap((doc) => doc.slugs))]
const { data: engines, error: enginesError } = await withTimeout(
  supabase
    .from('engines')
    .select('id, brand, model, slug, status')
    .in('slug', slugs),
  'engine row lookup',
)
if (enginesError) throw enginesError

const enginesBySlug = new Map((engines ?? []).map((engine) => [engine.slug, engine]))
const insertedRows = []
const skippedRows = []
const missingRows = []
const strictSlugs = new Set()

for (const doc of verifiedDocs) {
  for (const slug of doc.slugs) {
    const engine = enginesBySlug.get(slug)
    if (!engine) {
      missingRows.push({
        brand: 'Detroit Diesel',
        slug,
        sourceKey: doc.key,
        reason: 'missing engine row',
      })
      continue
    }
    if (engine.brand !== 'Detroit Diesel') {
      missingRows.push({
        brand: 'Detroit Diesel',
        slug,
        sourceKey: doc.key,
        reason: `brand mismatch (${engine.brand})`,
      })
      continue
    }
    if (engine.status !== 'discontinued') {
      missingRows.push({
        brand: 'Detroit Diesel',
        slug,
        sourceKey: doc.key,
        reason: `status mismatch (${engine.status})`,
      })
      continue
    }

    const { data: existingStrict, error: strictError } = await withTimeout(
      supabase
        .from('engine_pdfs')
        .select('id')
        .eq('engine_id', engine.id)
        .in('type', ['datasheet', 'brochure']),
      `strict lookup ${slug}`,
    )
    if (strictError) throw strictError

    if ((existingStrict ?? []).length || strictSlugs.has(slug)) {
      skippedRows.push({ brand: engine.brand, slug, sourceKey: doc.key })
      continue
    }

    const { data: existingExact, error: exactError } = await withTimeout(
      supabase
        .from('engine_pdfs')
        .select('id')
        .eq('engine_id', engine.id)
        .eq('storage_path', doc.sourceUrl),
      `exact lookup ${slug}`,
    )
    if (exactError) throw exactError

    if ((existingExact ?? []).length) {
      skippedRows.push({ brand: engine.brand, slug, sourceKey: doc.key })
      strictSlugs.add(slug)
      continue
    }

    insertedRows.push({ brand: engine.brand, slug, sourceKey: doc.key })
    strictSlugs.add(slug)
    if (!APPLY) continue

    const { error: insertError } = await withTimeout(
      supabase.from('engine_pdfs').insert({
        engine_id: engine.id,
        type: doc.type,
        label: doc.label,
        storage_path: doc.sourceUrl,
        file_size_bytes: doc.fileSizeBytes,
      }),
      `insert ${slug}`,
    )
    if (insertError) throw insertError
  }
}

const coverageAfter = APPLY ? await fetchStrictCoverage(supabase) : null
await fsp.writeFile(
  REPORT_PATH,
  buildReport({
    verifiedDocs,
    insertedRows,
    skippedRows,
    missingRows,
    coverageBefore,
    coverageAfter,
  }),
)

console.log(
  `${APPLY ? 'Applied' : 'Dry run complete'}: ${verifiedDocs.length} verified, `
  + `${insertedRows.length} inserted/planned, ${skippedRows.length} skipped, `
  + `${missingRows.length} missing/refused.`,
)
if (coverageAfter) {
  console.log(
    `Strict legacy coverage: ${coverageAfter.strictCount}/${coverageAfter.legacyCount} `
    + `(${coverageAfter.strictPct}%), remaining ${coverageAfter.strictNeededFor60Percent}`,
  )
}
