// Upgrade exact Mercedes-Benz legacy technical-spec pages to strict datasheet links.
//
// Dry run:
//   node data/attach-mercedes-strict-spec-pages-batch-83-2026-08.mjs
// Apply:
//   node data/attach-mercedes-strict-spec-pages-batch-83-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-83-mercedes-strict-spec-pages.md'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengMercedesStrictSpecsBatch83/1.0; +https://engines.haifengmachinery.com)'

const DOCUMENTS = [
  {
    slug: 'mercedes-benz-om-352',
    model: 'OM 352',
    sourceUrl: 'https://barringtondieselclub.co.za/mercedes/352.html',
    label: 'Mercedes OM352 Engine Specs Reference Page',
    requiredTokens: [
      'Mercedes OM352 Manuals, Engine Specs, Bolt Torques',
      'OM352 Diesel Engine Specs',
      'Mercedes OM352 Engine, Displacement, Bore, Stroke, Compression Ratio, Weight',
      'Displacement OM352 5.675 liter',
      'Bore 97.0 mm',
      'Stroke 128.0 mm',
      'Power OM352 94 kW',
      'Torque OM352 375 Nm',
    ],
  },
  {
    slug: 'mercedes-benz-om-366-a',
    model: 'OM 366 A',
    sourceUrl: 'https://mbmanuals.com/engines/om366eng.htm',
    label: 'Mercedes OM366A Technical Data Reference Page',
    requiredTokens: [
      'OM366 Technical Data',
      'OM 366 A',
      'OM366A turbocharged',
      'Version Codes and Specifications',
      'OM366 OM366 A OM366 LA',
      'Variants Variant CCM kW HP@RPM Bore/Stroke Comp. Torque @ RPM',
      '97.5/133',
      '5958',
    ],
  },
  {
    slug: 'mercedes-benz-om-366-la',
    model: 'OM 366 LA',
    sourceUrl: 'https://mbmanuals.com/engines/om366eng.htm',
    label: 'Mercedes OM366LA Technical Data Reference Page',
    requiredTokens: [
      'OM366 Technical Data',
      'OM 366 LA',
      'OM366LA',
      'Version Codes and Specifications',
      'OM366 OM366 A OM366 LA',
      'Variants Variant CCM kW HP@RPM Bore/Stroke Comp. Torque @ RPM',
      '366TI',
      '150 201@2600',
      '640Nm@1400',
    ],
  },
  {
    slug: 'mercedes-benz-om-401',
    model: 'OM 401',
    sourceUrl: 'https://barringtondieselclub.co.za/mercedes/401-402-403-404.html',
    label: 'Mercedes OM401 Engine Specs Reference Page',
    requiredTokens: [
      'Mercedes Diesel Engine OM400 Series Manuals, Engine Specs, Bolt Torques',
      'Mercedes OM401 OM402 OM403 OM404 Diesel Engine Specs',
      'Displacement OM401 - 9.57 liter',
      'Bore 125 mm',
      'Stroke 130 mm',
      'OM401 - 6v Natural Aspiration',
      'Power OM401 - 189 hp',
      'Torque OM401 - 462 lb.ft',
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

function fetchPageText(url) {
  const html = execFileSync('curl', [
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
  return {
    text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    fileSizeBytes: Buffer.byteLength(html, 'utf8'),
  }
}

function verifyDocument(document) {
  const page = fetchPageText(document.sourceUrl)
  const missing = document.requiredTokens.filter((token) => !hasToken(page.text, token))
  if (missing.length) {
    throw new Error(`${document.sourceUrl}: missing validation token(s): ${missing.join(', ')}`)
  }
  return {
    ...document,
    fileSizeBytes: page.fileSizeBytes,
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
  upgradedRows,
  skippedRows,
  missingRows,
  coverageBefore,
  coverageAfter,
}) {
  return `# Legacy Engine Document Attachments - Batch 83 Mercedes Strict Spec Pages

Date: 2026-08-12

## Result

- Mercedes technical-spec pages verified: \`${verifiedDocs.length}\`
- Strict links ${APPLY ? 'inserted' : 'planned'}: \`${insertedRows.length}\`
- Existing exact links upgraded to datasheet ${APPLY ? 'updated' : 'planned'}: \`${upgradedRows.length}\`
- Links skipped as already strict: \`${skippedRows.length}\`
- Missing/refused engine rows: \`${missingRows.length}\`
- Strict legacy coverage before: \`${coverageBefore.strictCount}/${coverageBefore.legacyCount} (${coverageBefore.strictPct}%)\`
${coverageAfter == null ? '' : `- Strict legacy coverage after: \`${coverageAfter.strictCount}/${coverageAfter.legacyCount} (${coverageAfter.strictPct}%)\`\n- Remaining strict links needed for 60%: \`${coverageAfter.strictNeededFor60Percent}\`\n`}
## Datasheet Links

| Model | Source page | Action | Verification |
| --- | --- | --- | --- |
${verifiedDocs.map((doc) => {
  const action = insertedRows.find((row) => row.model === doc.model)
    ? 'inserted'
    : upgradedRows.find((row) => row.model === doc.model)
      ? 'upgraded'
      : skippedRows.find((row) => row.model === doc.model)
        ? 'skipped-existing'
        : 'not-linked'
  return `| ${doc.model} | ${doc.sourceUrl} | ${action} | Exact model/family page plus open technical-spec tokens for displacement, bore/stroke, power/torque or variant specification table verified. |`
}).join('\n')}

## Missing / Refused Rows

${missingRows.length ? missingRows.map((row) => `- ${row.model}: ${row.reason}`).join('\n') : '- None.'}

## Validation Notes

- Existing manual/reference links were upgraded only where the same exact public page exposes open technical data, not merely paid manual listings.
- OM352 and OM401 use Barrington Diesel Club pages with open engine-spec sections.
- OM366A/OM366LA use the MB Manuals OM366 page because it includes open version-code and specification tables covering the turbocharged and intercooled variants.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Mercedes strict technical-spec pages`)

const coverageBefore = await fetchStrictCoverage(supabase)
const verifiedDocs = DOCUMENTS.map(verifyDocument)

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .in('slug', verifiedDocs.map((doc) => doc.slug))
if (enginesError) throw enginesError

const enginesBySlug = new Map((engines ?? []).map((engine) => [engine.slug, engine]))
const insertedRows = []
const upgradedRows = []
const skippedRows = []
const missingRows = []

for (const doc of verifiedDocs) {
  const engine = enginesBySlug.get(doc.slug)
  if (!engine) {
    missingRows.push({ model: doc.model, reason: 'No matching Mercedes-Benz engine row exists.' })
    continue
  }
  if (engine.brand !== 'Mercedes-Benz') {
    missingRows.push({ model: doc.model, reason: `Engine row brand is ${engine.brand}.` })
    continue
  }
  if (engine.status !== 'discontinued') {
    missingRows.push({ model: doc.model, reason: `Engine row status is ${engine.status}.` })
    continue
  }

  const { data: existingLinks, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('id,type')
    .eq('engine_id', engine.id)
    .eq('storage_path', doc.sourceUrl)
  if (existingError) throw existingError

  const reportRow = { model: doc.model, slug: engine.slug, storagePath: doc.sourceUrl }

  if ((existingLinks ?? []).some((row) => row.type === 'datasheet' || row.type === 'brochure')) {
    skippedRows.push(reportRow)
    continue
  }

  if ((existingLinks ?? []).length) {
    upgradedRows.push(reportRow)
    if (APPLY) {
      const { error: updateError } = await supabase
        .from('engine_pdfs')
        .update({
          type: 'datasheet',
          label: doc.label,
          file_size_bytes: doc.fileSizeBytes,
        })
        .in('id', existingLinks.map((row) => row.id))
      if (updateError) throw updateError
    }
    continue
  }

  insertedRows.push(reportRow)
  if (APPLY) {
    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'datasheet',
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
    upgradedRows,
    skippedRows,
    missingRows,
    coverageBefore,
    coverageAfter,
  }),
)

console.log(
  `${APPLY ? 'Applied' : 'Dry run complete'}: ${verifiedDocs.length} verified, `
  + `${insertedRows.length} inserted/planned, ${upgradedRows.length} upgraded/planned, `
  + `${skippedRows.length} skipped, ${missingRows.length} missing/refused.`,
)
if (coverageAfter) {
  console.log(
    `Strict legacy coverage: ${coverageAfter.strictCount}/${coverageAfter.legacyCount} `
    + `(${coverageAfter.strictPct}%), remaining ${coverageAfter.strictNeededFor60Percent}`,
  )
}
console.log(`Wrote ${REPORT_PATH}`)
