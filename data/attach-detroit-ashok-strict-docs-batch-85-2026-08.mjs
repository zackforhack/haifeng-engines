// Attach source-validated strict technical references to exact legacy rows.
//
// Dry run:
//   node data/attach-detroit-ashok-strict-docs-batch-85-2026-08.mjs
// Apply:
//   node data/attach-detroit-ashok-strict-docs-batch-85-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-85-detroit-ashok-strict.md'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyStrictDocsBatch85/1.0; +https://engines.haifengmachinery.com)'

const DOCUMENTS = [
  {
    key: 'detroit-diesel-53-series-general-specifications',
    brand: 'Detroit Diesel',
    sourceUrl: 'https://www.manualslib.com/manual/4071484/Detroit-Diesel-53-Series.html?page=10',
    label: 'Detroit Diesel 53 Series General Specifications Page',
    type: 'datasheet',
    slugs: ['detroit-diesel-3-53', 'detroit-diesel-4-53', 'detroit-diesel-6v-53'],
    requiredTokens: [
      'General Specifications - Detroit Diesel 53 Series',
      'Detroit Diesel 53 Series Manual Online: General Specifications',
      'Number of cylinders',
      'Bore (inches)',
      'Stroke (inches)',
      'Total Displacement',
      'Compression Ratio',
      '3-53',
      '4-53',
      '6V-53',
    ],
    note:
      'ManualsLib page 10 is linked only to exact model tokens visible on the General Specifications page. 2-53, 4V-53 and 6-53 remain strict gaps until exact tokens are validated.',
  },
  {
    key: 'ashok-leyland-algp-wo4d-specifications',
    brand: 'Ashok Leyland',
    sourceUrl: 'https://www.akashpowergensets.com/algpwo4d.html',
    label: 'Ashok Leyland ALGP WO4D Specification Page',
    type: 'datasheet',
    slugs: ['ashok-leyland-algp-wo4d'],
    requiredTokens: [
      'ALGP WO4D',
      'BHP Range (PS) Gross',
      'RPM Range',
      'Max Torque',
      'CYLINDERS',
      'DISPLACEMENT(L)',
      'BORE(MM)',
      'STROKE(MM)',
      'COMPRESSION RATIO',
    ],
    note:
      'Akash Power Gensets page exposes exact ALGP WO4D product/spec fields, including ratings, displacement, bore, stroke and compression ratio.',
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
}

function normalize(value) {
  return decodeHtml(value)
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
    maxBuffer: 30 * 1024 * 1024,
  })
}

function verifyDocument(document) {
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

function buildReport({
  verifiedDocs,
  insertedRows,
  skippedRows,
  missingRows,
  coverageBefore,
  coverageAfter,
}) {
  return `# Legacy Engine Document Attachments - Batch 85 Detroit/Ashok Strict

Date: 2026-08-12

## Result

- Strict source pages verified: \`${verifiedDocs.length}\`
- Strict datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${insertedRows.length}\`
- Links skipped as existing strict/exact duplicates: \`${skippedRows.length}\`
- Missing/refused engine rows: \`${missingRows.length}\`
- Strict legacy coverage before: \`${coverageBefore.strictCount}/${coverageBefore.legacyCount} (${coverageBefore.strictPct}%)\`
${coverageAfter == null ? '' : `- Strict legacy coverage after: \`${coverageAfter.strictCount}/${coverageAfter.legacyCount} (${coverageAfter.strictPct}%)\`\n- Remaining strict links needed for 60%: \`${coverageAfter.strictNeededFor60Percent}\`\n`}
## Document Attachments

| Document | Brand | Type | Source / URL | Target rows | Source bytes |
| --- | --- | --- | --- | ---: | ---: |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.brand} | ${doc.type} | ${doc.sourceUrl} | ${doc.slugs.length} | ${doc.fileSizeBytes} |`).join('\n')}

## Linked Engine Rows

| Brand | Engine slug | Source key | Status |
| --- | --- | --- | --- |
${insertedRows.map((row) => `| ${row.brand} | \`${row.slug}\` | ${row.sourceKey} | inserted |`).join('\n')}
${skippedRows.map((row) => `| ${row.brand} | \`${row.slug}\` | ${row.sourceKey} | existing |`).join('\n')}
${missingRows.map((row) => `| ${row.brand ?? ''} | \`${row.slug}\` | ${row.sourceKey ?? ''} | ${row.reason} |`).join('\n')}

## Validation Notes

${verifiedDocs.map((doc) => `- ${doc.note}`).join('\n')}
- Detroit Diesel 2-53, 4V-53 and 6-53 were deliberately excluded because this source page did not expose those exact row tokens in the validated table text.
- Ashok Leyland ALGP 400 and ALGP 402 remain strict gaps until open exact specification tokens are validated.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Detroit/Ashok strict legacy links`)
const coverageBefore = await fetchStrictCoverage(supabase)
const verifiedDocs = DOCUMENTS.map(verifyDocument)
for (const doc of verifiedDocs) {
  console.log(`Verified ${doc.label}: ${doc.fileSizeBytes} bytes`)
}

const slugs = [...new Set(verifiedDocs.flatMap((doc) => doc.slugs))]
const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .in('slug', slugs)
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
      missingRows.push({ brand: doc.brand, slug, sourceKey: doc.key, reason: 'missing engine row' })
      continue
    }
    if (engine.brand !== doc.brand) {
      missingRows.push({
        brand: doc.brand,
        slug,
        sourceKey: doc.key,
        reason: `brand mismatch (${engine.brand})`,
      })
      continue
    }
    if (engine.status !== 'discontinued') {
      missingRows.push({
        brand: doc.brand,
        slug,
        sourceKey: doc.key,
        reason: `status mismatch (${engine.status})`,
      })
      continue
    }

    const { data: existingStrict, error: strictError } = await supabase
      .from('engine_pdfs')
      .select('id')
      .eq('engine_id', engine.id)
      .in('type', ['datasheet', 'brochure'])
    if (strictError) throw strictError

    if ((existingStrict ?? []).length || strictSlugs.has(slug)) {
      skippedRows.push({ brand: doc.brand, slug, sourceKey: doc.key })
      continue
    }

    const { data: existingExact, error: exactError } = await supabase
      .from('engine_pdfs')
      .select('id')
      .eq('engine_id', engine.id)
      .eq('storage_path', doc.sourceUrl)
    if (exactError) throw exactError

    if ((existingExact ?? []).length) {
      skippedRows.push({ brand: doc.brand, slug, sourceKey: doc.key })
      strictSlugs.add(slug)
      continue
    }

    insertedRows.push({ brand: doc.brand, slug, sourceKey: doc.key })
    strictSlugs.add(slug)
    if (!APPLY) continue

    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: doc.type,
      label: doc.label,
      storage_path: doc.sourceUrl,
      file_size_bytes: doc.fileSizeBytes,
    })
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
