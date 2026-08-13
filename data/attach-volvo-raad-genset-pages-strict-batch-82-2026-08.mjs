// Attach/upgrade exact RAAD Volvo Penta genset technical pages as strict datasheet links.
//
// Dry run:
//   node data/attach-volvo-raad-genset-pages-strict-batch-82-2026-08.mjs
// Apply:
//   node data/attach-volvo-raad-genset-pages-strict-batch-82-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-82-volvo-raad-genset-strict.md'
const RAAD_BASE = 'https://www.raad-eng.com/techdata/volvo/engines'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengVolvoRaadGensetStrictBatch82/1.0; +https://engines.haifengmachinery.com)'

const TARGETS = [
  target('TAD1030GE', ['1500rpm, 266 kW', '1800rpm, 282 kW', 'EPA/CARB tier 1']),
  target('TAD1031GE', ['1800rpm, 285 kW', 'EPA/CARB tier 1']),
  target('TAD1032GE', ['1500rpm, 292 kW', '1800rpm,  287 kW', 'EPA/CARB tier 1']),
  target('TAD1630GE', ['1500rpm, 440 kW', '1800rpm, 482 kW', 'EPA/CARB tier 1']),
  target('TAD1631GE', ['1500rpm, 478 kW', '1800rpm, 558 kW', 'EPA/CARB tier 1']),
  target('TAD740GE', ['1 500rpm, 242 kW', '1 800rpm, 251 kW', 'EPA/CARB tier 1']),
  target('TAD741GE', ['1 800rpm, 228 kW']),
  target('TWD740GE', ['1 500rpm, 199 kW', '1 800rpm, 228 kW', 'EPA/CARB tier 1']),
]

function target(model, tokens) {
  const page = model.toLowerCase()
  return {
    model,
    slug: `volvo-penta-${page}`,
    sourceUrl: `${RAAD_BASE}/${page}.html`,
    storagePath: `${RAAD_BASE}/${page}.html`,
    label: `Volvo Penta ${model} RAAD Genset Technical Datasheet`,
    requiredTokens: [
      'VOLVO PENTA GENSET ENGINE',
      model,
      `${model} is a powerful, reliable and economical Generating Set diesel`,
      ...tokens,
    ],
  }
}

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
    encoding: 'latin1',
    env: curlEnv(),
    maxBuffer: 20 * 1024 * 1024,
  })
  return {
    text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    fileSizeBytes: Buffer.byteLength(html, 'latin1'),
  }
}

function verifyTarget(targetRow) {
  const page = fetchPageText(targetRow.sourceUrl)
  const missing = targetRow.requiredTokens.filter((token) => !hasToken(page.text, token))
  if (missing.length) {
    throw new Error(`${targetRow.sourceUrl}: missing validation token(s): ${missing.join(', ')}`)
  }
  return {
    ...targetRow,
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
  return `# Legacy Engine Document Attachments - Batch 82 Volvo RAAD Genset Strict

Date: 2026-08-12

## Result

- Exact RAAD Volvo Penta genset technical pages verified: \`${verifiedDocs.length}\`
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
  return `| ${doc.model} | ${doc.sourceUrl} | ${action} | Exact Volvo Penta genset heading, model code, product-description text, and kW/rpm rating tokens verified. |`
}).join('\n')}

## Missing / Refused Rows

${missingRows.length ? missingRows.map((row) => `- ${row.model}: ${row.reason}`).join('\n') : '- None.'}

## Validation Notes

- This batch is limited to Volvo Penta power-generation technical pages; no marine rows are included.
- The RAAD pages are source-hosted external technical datasheet pages, not copied PDFs. They are classified as \`datasheet\` only because each page validates an exact model, a Volvo Penta genset heading, a product description, and model-specific kW/rpm ratings.
- \`TAD741GE\` is included with a tailored validation set because the page has exact model/rating/product text but does not contain the EPA/CARB tier text present on the sibling pages.
- \`TWD710G\` was probed but excluded because the RAAD page body identifies \`TWD710GE\`, not the exact \`TWD710G\` database row.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Volvo RAAD genset strict datasheet pages`)

const coverageBefore = await fetchStrictCoverage(supabase)
const verifiedDocs = TARGETS.map(verifyTarget)

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
    missingRows.push({ model: doc.model, reason: 'No matching Volvo Penta engine row exists.' })
    continue
  }
  if (engine.brand !== 'Volvo Penta') {
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
    .eq('storage_path', doc.storagePath)
  if (existingError) throw existingError

  const reportRow = {
    model: doc.model,
    slug: engine.slug,
    storagePath: doc.storagePath,
  }

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
      storage_path: doc.storagePath,
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
