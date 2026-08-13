// Attach source-validated strict specification/rating pages to exact International legacy rows.
//
// Dry run:
//   node data/attach-international-navistar-strict-pages-batch-86-2026-08.mjs
// Apply:
//   node data/attach-international-navistar-strict-pages-batch-86-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-86-international-navistar-strict.md'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyStrictDocsBatch86/1.0; +https://engines.haifengmachinery.com)'
const SUPABASE_TIMEOUT_MS = 60_000

const DOCUMENTS = [
  {
    key: 'international-dt466-2004-standard-torque-performance',
    sourceUrl: 'https://www.manualslib.com/manual/1837761/Navistar-International-Dt-466.html?page=601',
    label: 'Navistar International DT 466 2004 Standard Torque Performance Specifications',
    type: 'datasheet',
    slugs: ['international-dt466'],
    requiredTokens: [
      'DT 466 (Standard Torque)',
      '210 hp @ 2300 rpm',
      'DT 466/210 hp @ 2300 rpm',
      '520 ft',
      '2004 Model Year',
      'International DT 466 Diesel Engine Specifications',
      'Engine Unit Code',
    ],
    note:
      'ManualsLib page 601 exposes exact DT 466 standard-torque performance specifications with horsepower, rpm, torque, 2004 model-year and engine-unit-code context.',
  },
  {
    key: 'international-dt570-2004-standard-torque-performance',
    sourceUrl: 'https://www.manualslib.com/manual/1837761/Navistar-International-Dt-466.html?page=625',
    label: 'Navistar International DT 570 2004 Standard Torque Performance Specifications',
    type: 'datasheet',
    slugs: ['international-dt570'],
    requiredTokens: [
      'DT 570 (Standard Torque)',
      '285 hp @ 2000 rpm',
      'DT 570/285 hp @ 2000 rpm',
      '800 ft',
      '2004 Model Year',
      'International DT 570 Diesel Engine Specifications',
      'Engine Unit Code',
    ],
    note:
      'ManualsLib page 625 exposes exact DT 570 standard-torque performance specifications with horsepower, rpm, torque, 2004 model-year and engine-unit-code context.',
  },
  {
    key: 'international-ht570-2004-high-torque-performance',
    sourceUrl: 'https://www.manualslib.com/manual/1837761/Navistar-International-Dt-466.html?page=631',
    label: 'Navistar International HT 570 2004 High Torque Performance Specifications',
    type: 'datasheet',
    slugs: ['international-ht570'],
    requiredTokens: [
      'HT 570 (High Torque)',
      '295 hp @ 2000 rpm',
      'HT 570/295 hp @ 2000 rpm',
      '950 ft',
      '2004 Model Year',
      'International HT 570 Diesel Engine Specifications',
      'Engine Unit Code',
    ],
    note:
      'ManualsLib page 631 exposes exact HT 570 high-torque performance specifications with horsepower, rpm, torque, 2004 model-year and engine-unit-code context.',
  },
  {
    key: 'international-maxxforce-7-engine-specifications',
    sourceUrl: 'https://www.manualslib.com/manual/3016167/Navistar-Maxxforce-7.html?page=25',
    label: 'Navistar MaxxForce 7 Engine Specifications Page',
    type: 'datasheet',
    slugs: ['international-maxxforce-7'],
    requiredTokens: [
      'Engine Specifications - Navistar MaxxForce 7',
      'MaxxForce 7 Features and Specifications',
      'Engine Configuration',
      '4 stroke, V8 diesel',
      'Displacement',
      '6.4 L',
      '389 in',
      'Compression ratio',
      '16.5',
      'Stroke',
      'Bore',
    ],
    note:
      'ManualsLib page 25 exposes the MaxxForce 7 engine-specifications table, including configuration, displacement, compression ratio, stroke and bore.',
  },
  {
    key: 'international-vt365-engine-features-specifications',
    sourceUrl: 'https://www.manualslib.com/manual/848625/International-Vt-365.html?page=13',
    label: 'International VT 365 Engine Features and Specifications Page',
    type: 'datasheet',
    slugs: ['international-vt-365'],
    requiredTokens: [
      'Engine Description; Specifications; Major Features',
      'International VT 365',
      'engine features and specifications',
      'Engine Configuration',
      'Diesel, 4 cycle',
      '4 OHV/1 Cam-in-Crankcase-V8',
      'Displacement',
      '365 cu. in',
      '6.0L',
      'Bore and stroke',
      '95 mm x 105 mm',
      'Compression ratio',
      '18.0:1',
    ],
    note:
      'ManualsLib page 13 exposes the VT 365 features/specifications table, including exact model identity, V8 configuration, displacement, bore/stroke and compression ratio.',
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
  const args = [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '0',
    '--retry-all-errors',
    '--connect-timeout',
    '15',
    '--max-time',
    '60',
    '--compressed',
    '--user-agent',
    USER_AGENT,
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
  return `# Legacy Engine Document Attachments - Batch 86 International/Navistar Strict

Date: 2026-08-12

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
- Older International Harvester D/DT agricultural rows remain strict gaps because current open sources validate manual coverage rather than clean public datasheet/specification pages.
- This batch uses page-specific specification/rating URLs instead of generic manual landing pages.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: International/Navistar strict legacy pages`)
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
      missingRows.push({ brand: 'International', slug, sourceKey: doc.key, reason: 'missing engine row' })
      continue
    }
    if (engine.brand !== 'International') {
      missingRows.push({
        brand: 'International',
        slug,
        sourceKey: doc.key,
        reason: `brand mismatch (${engine.brand})`,
      })
      continue
    }
    if (engine.status !== 'discontinued') {
      missingRows.push({
        brand: 'International',
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
