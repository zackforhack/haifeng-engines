// Attach source-validated strict technical/brochure references to exact legacy rows.
//
// Dry run:
//   node data/attach-doosan-wartsila-strict-docs-batch-84-2026-08.mjs
// Apply:
//   node data/attach-doosan-wartsila-strict-docs-batch-84-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-84-doosan-wartsila-strict.md'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyStrictDocsBatch84/1.0; +https://engines.haifengmachinery.com)'

const DOCUMENTS = [
  {
    key: 'doosan-d1146-p086ti-engine-specification',
    brand: 'Doosan',
    sourceUrl: 'https://www.manualslib.com/manual/3896050/Doosan-P086t1.html?page=14',
    label: 'Doosan D1146/D1146T/P086TI Engine Specification Page',
    type: 'datasheet',
    slugs: ['doosan-d1146', 'doosan-d1146t', 'doosan-p086ti'],
    requiredTokens: [
      'Engine Specification - Doosan P086T1 Installation Operation & Maintenance',
      '2.2. Engine Specification',
      '2.2.1. Specification',
      'D1146/PU086',
      'D1146T/PU086T',
      'P086TI',
      'No. of cylinder-bore x stroke',
      'Total piston displacement',
      'Compression ratio',
    ],
    note:
      'ManualsLib page 14 is treated as a strict spec page because the page title and rendered text expose the exact D1146, D1146T and P086TI specification table fields.',
  },
  {
    key: 'doosan-d1146-d1146t-p086ti-engine-power',
    brand: 'Doosan',
    sourceUrl: 'https://www.manualslib.com/manual/3896050/Doosan-P086t1.html?page=15',
    label: 'Doosan D1146/D1146T/P086TI Engine Power Page',
    type: 'datasheet',
    slugs: ['doosan-d1146', 'doosan-d1146t', 'doosan-p086ti'],
    requiredTokens: [
      '2.2.2. Engine power',
      'Generating-Set Engines',
      '50 HZ (1,500 rpm)',
      '60 HZ (1,800 rpm)',
      'D1146',
      'D1146T',
      'P086TI',
      'P086TI-I',
      'Power-Unit Engines',
    ],
    note:
      'Page 15 validates rating context for the same exact engine families. The DB row doosan-p086ti-1 is deliberately excluded because the source uses P086TI-I, not the numeric-1 DB token.',
  },
  {
    key: 'wartsila-vasa-32ln-performance-upgrade',
    brand: 'Wärtsilä',
    sourceUrl:
      'https://www.wartsila.com/services-catalogue/engine-services-4-stroke/wartsila-vasa-32ln-performance-upgrade',
    label: 'Wärtsilä Vasa 32 Performance Upgrade Brochure Page',
    type: 'brochure',
    slugs: ['wartsila-vasa-6r32', 'wartsila-vasa-12v32'],
    requiredTokens: [
      'Wärtsilä Vasa 32LN Performance upgrade',
      'Wärtsilä Vasa 32 Performance upgrade',
      'Vasa 6R32 and 12V32 installations',
      'Download leaflet',
      'specific fuel oil consumption',
      'SFOC',
      'turbocharger',
      'manufactured after 1991',
    ],
    note:
      'Official Wärtsilä services page names Vasa 6R32 and 12V32 installations and exposes a download-leaflet CTA for the performance-upgrade brochure.',
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
    .replace(/&#228;|&auml;/gi, 'ä')
    .replace(/&#246;|&ouml;/gi, 'ö')
    .replace(/&#252;|&uuml;/gi, 'ü')
    .replace(/&#196;|&Auml;/gi, 'Ä')
    .replace(/&#214;|&Ouml;/gi, 'Ö')
    .replace(/&#220;|&Uuml;/gi, 'Ü')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ndash;|&#8211;/gi, '-')
    .replace(/&mdash;|&#8212;/gi, '-')
}

function normalize(value) {
  return decodeHtml(value)
    .toUpperCase()
    .replace(/[^A-Z0-9ÄÖÜ]+/g, '')
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
  return `# Legacy Engine Document Attachments - Batch 84 Doosan/Wärtsilä Strict

Date: 2026-08-12

## Result

- Strict source pages verified: \`${verifiedDocs.length}\`
- Strict datasheet/brochure links ${APPLY ? 'inserted' : 'planned'}: \`${insertedRows.length}\`
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
- Doosan \`doosan-db58\`, \`doosan-dp086ta\` and \`doosan-p086ti-1\` remain strict gaps until exact source tokens are validated.
- Wärtsilä evidence is an official manufacturer services/brochure page, not a third-party manual mirror.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Doosan/Wärtsilä strict legacy links`)
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
