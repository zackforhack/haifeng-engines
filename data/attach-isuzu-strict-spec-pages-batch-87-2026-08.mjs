// Attach source-validated strict specification pages to exact Isuzu legacy rows.
//
// Dry run:
//   node data/attach-isuzu-strict-spec-pages-batch-87-2026-08.mjs
// Apply:
//   node data/attach-isuzu-strict-spec-pages-batch-87-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-13-batch-87-isuzu-strict.md'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
const SUPABASE_TIMEOUT_MS = 60_000

const DOCUMENTS = [
  {
    key: 'isuzu-4bd1-enginetechspecs-page',
    sourceUrl: 'https://enginetechspecs.com/isuzu_4bd1_technical_specs.html',
    label: 'Isuzu 4BD1 Technical Specifications Page',
    type: 'datasheet',
    slugs: ['isuzu-4bd1'],
    requiredTokens: [
      'Isuzu 4BD1 Specifications',
      'Engine Model: Isuzu 4BD1',
      'Total Displacement: 238 cu.in (3.9 L)',
      'Bore measures about 102 mm',
      'stroke approximately 118 mm',
      '4.65 inches',
      'compression ratio',
      '85 to 95 horsepower',
    ],
    note:
      'EngineTechSpecs page exposes exact 4BD1 identity plus displacement, bore/stroke, compression-ratio and power-range specification content.',
  },
  {
    key: 'isuzu-4bd1t-dieselhub-specs',
    sourceUrl: 'https://www.dieselhub.com/specs/isuzu-3.9l-4bd1.html',
    label: 'Isuzu 3.9L 4BD1T Diesel Specifications Page',
    type: 'datasheet',
    slugs: ['isuzu-4bd1t'],
    requiredTokens: [
      '3.9L Isuzu 4BD1T',
      'Isuzu 4BD1T Diesel Specs (1986 - 1991)',
      'direct injection, turbocharged diesel engine',
      '3.9L displacement',
      'Isuzu 3.9L 4BD1-T',
      'Displacement',
      'Compression Ratio',
      'Cylinder Bore',
      'Cylinder Stroke',
      'Horsepower',
      'Torque',
    ],
    note:
      'DieselHub page exposes exact 4BD1T model identity, production-year context, configuration and tabular displacement, compression, bore/stroke, horsepower and torque fields.',
  },
  {
    key: 'isuzu-6bb1-jsae-330-selection',
    sourceUrl: 'https://www.jsae.or.jp/autotech/10-5.php',
    label: 'JSAE Automotive Technology 330 Selection Isuzu 6BB1 Specifications Page',
    type: 'datasheet',
    slugs: ['isuzu-6bb1'],
    requiredTokens: [
      '6BB1',
      '6BB1型',
      '107kW(145PS)/3200rpm',
      '343N',
      '35kgm',
      '2000rpm',
      '231g/kWh',
      'いすゞディーゼル50年史',
    ],
    note:
      'JSAE historical technology page identifies the exact 6BB1 model and publishes output, torque and fuel-consumption data with Isuzu historical-reference context.',
  },
  {
    key: 'isuzu-6bd1-ydtech-spec-table',
    sourceUrl: 'https://shanghai-ydtech.com/product/isuzu-6bd1-engine-isuzu-6bd1-engine/',
    label: 'Isuzu 6BD1 Engine Specification Table Page',
    type: 'datasheet',
    slugs: ['isuzu-6bd1'],
    requiredTokens: [
      'Isuzu 6BD1 Engine',
      'total displacement of 5,785 cc',
      'bore by stroke measured 4.02 by 4.63 inches',
      'compression ratio measured 17.5:1',
      'Engine Model',
      '6BD1',
      'Rated Power',
      '103kw(130hp)3000rpm',
      'Peak Torque',
      '372 N.m(274 Ib.ft) 1600 -2000 rpm',
    ],
    note:
      'YD Technology product page is a commercial source, but the page exposes an exact 6BD1 technical table with model, displacement, bore/stroke, compression, rated power and torque.',
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

function curlEnv() {
  return process.env
}

function fetchText(url) {
  const args = [
    '--http1.1',
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--max-time',
    '60',
    '--compressed',
    '--user-agent',
    USER_AGENT,
    '--referer',
    'https://www.google.com/',
    url,
  ]
  try {
    return execFileSync('curl', args, {
      encoding: 'utf8',
      env: curlEnv(),
      maxBuffer: 30 * 1024 * 1024,
    })
  } catch (error) {
    const stdout = String(error.stdout ?? '')
    if (error.status === 28 && stdout.length > 50_000) return stdout
    throw error
  }
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
  return `# Legacy Engine Document Attachments - Batch 87 Isuzu Strict

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
- This batch only upgrades existing discontinued Isuzu rows. It does not add engine records or infer adjacent B-series variants.
- The 6BD1 source is marked strict because it exposes a public exact-model technical table; it is still a commercial product page rather than an OEM brochure.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Isuzu strict legacy pages`)
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
      missingRows.push({ brand: 'Isuzu', slug, sourceKey: doc.key, reason: 'missing engine row' })
      continue
    }
    if (engine.brand !== 'Isuzu') {
      missingRows.push({
        brand: 'Isuzu',
        slug,
        sourceKey: doc.key,
        reason: `brand mismatch (${engine.brand})`,
      })
      continue
    }
    if (engine.status !== 'discontinued') {
      missingRows.push({
        brand: 'Isuzu',
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
