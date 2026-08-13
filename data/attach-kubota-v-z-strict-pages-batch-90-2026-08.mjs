// Attach source-validated strict Kubota V/Z-series specification pages to exact legacy rows.
//
// Dry run:
//   node data/attach-kubota-v-z-strict-pages-batch-90-2026-08.mjs
// Apply:
//   node data/attach-kubota-v-z-strict-pages-batch-90-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-13-batch-90-kubota-v-z-strict.md'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'

const DOCUMENTS = [
  {
    key: 'kubota-v1100-tractorgearbox',
    sourceUrl: 'https://tractorgearbox.com/kubota_v1100_engine_specs.html',
    label: 'Kubota V1100 Engine Technical Data Page',
    slugs: ['kubota-v1100'],
    requiredTokens: [
      'Kubota V1100 Diesel Engine: Technical Data and Specs',
      'Kubota V1100 Engine Specifications',
      'Engine Model .......... Kubota V1100',
      'Bore, mm (in.) .......... 72.0 (2.83)',
      'Stroke, mm (in.) .......... 70.0 (2.76)',
      'Total displacement, cm3 (cu. in.) .......... 1140 (69.6)',
      'Gross power, kw (hp) .......... 19.8 (26.5)',
      'Maximum torque, Nm (ft-lb) .......... 68.5 (50.5)',
      'Compression ratio .......... 22:1',
    ],
    note:
      'TractorGearbox page exposes exact V1100 identity, bore/stroke, displacement, power, torque and compression-ratio data.',
  },
  {
    key: 'kubota-v1200-tractorgearbox',
    sourceUrl: 'https://tractorgearbox.com/kubota_v1200_engine_specs.html',
    label: 'Kubota V1200 Engine Technical Data Page',
    slugs: ['kubota-v1200'],
    requiredTokens: [
      'Kubota V1200 Engine: Specifications and Technical Data',
      'Kubota V1200 Engine Specifications',
      'Engine Model .......... Kubota V1200',
      'Bore, mm (in.) .......... 75.0 (2.95)',
      'Stroke, mm (in.) .......... 70.0 (2.76)',
      'Total displacement, cm3 (cu. in.) .......... 1237 (75.5)',
      'Gross power, kw (hp) .......... 21.3 (28.5)',
      'Maximum torque, Nm (ft-lb) .......... 74.1 (54.7)',
      'Compression ratio .......... 22:1',
    ],
    note:
      'TractorGearbox page exposes exact V1200 identity, bore/stroke, displacement, power, torque and compression-ratio data.',
  },
  {
    key: 'kubota-z500-tractorgearbox',
    sourceUrl: 'https://tractorgearbox.com/kubota_z500_engine_specs.html',
    label: 'Kubota Z500 Engine Technical Data Page',
    slugs: ['kubota-z500'],
    requiredTokens: [
      'Kubota Z500 Engine: Specifications and Technical Data',
      'Kubota Z500 Engine Specifications',
      'Engine Model .......... Kubota Z500',
      'Bore, mm (in.) .......... 68.0 (2.68)',
      'Stroke, mm (in.) .......... 70.0 (2.76)',
      'Total displacement, cm3 (cu. in.) .......... 508 (31.0)',
      'Gross power, kw (hp) .......... 8.2 (11.0)',
      'Maximum torque, Nm (ft-lb) .......... 28.1 (20.7)',
      'Compression ratio .......... 22:1',
    ],
    note:
      'TractorGearbox page exposes exact Z500 identity, bore/stroke, displacement, power, torque and compression-ratio data.',
  },
  {
    key: 'kubota-z600-tractorgearbox',
    sourceUrl: 'https://tractorgearbox.com/kubota_z600_engine_specs.html',
    label: 'Kubota Z600 Engine Technical Data Page',
    slugs: ['kubota-z600'],
    requiredTokens: [
      'Kubota Z600 Engine: Technical Specifications and Service Data',
      'Kubota Z600 Engine Specifications',
      'Engine Model .......... Kubota Z600',
      'Bore, mm (in.) .......... 72.0 (2.83)',
      'Stroke, mm (in.) .......... 70.0 (2.76)',
      'Total displacement, cm3 (cu. in.) .......... 570 (34.8)',
      'Gross power, kw (hp) .......... 10.4 (13.8)',
      'Maximum torque, Nm (ft-lb) .......... 32.9 (24.3)',
      'Compression ratio .......... 22:1',
    ],
    note:
      'TractorGearbox page exposes exact Z600 identity, bore/stroke, displacement, power, torque and compression-ratio data.',
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
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
}

function normalize(value) {
  return decodeHtml(value).toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function fetchText(url) {
  return execFileSync('curl', [
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
  ], {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  })
}

async function fetchCoverage(supabase) {
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
    legacyCount: legacy.length,
    strictCount: strict.length,
    strictPct: Number((strict.length / legacy.length * 100).toFixed(1)),
    strictNeededFor60Percent: Math.max(0, Math.ceil(legacy.length * 0.6) - strict.length),
  }
}

function verifyDocument(document) {
  console.log(`Fetching ${document.sourceUrl}`)
  const text = fetchText(document.sourceUrl)
  const missing = document.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${document.key}: missing token(s): ${missing.join(', ')}`)
  return { ...document, type: 'datasheet', fileSizeBytes: Buffer.byteLength(text) }
}

function buildReport({ verifiedDocs, insertedRows, skippedRows, missingRows, coverageBefore, coverageAfter }) {
  return `# Legacy Engine Document Attachments - Batch 90 Kubota V/Z Strict

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
- This batch only upgrades exact discontinued Kubota V/Z rows and does not infer \`VH1100\`, \`V800\`, \`Z400\`, \`Z430\`, or ZB/KND/WG/DF rows.
- \`kubota-v800\` was excluded because the probed candidate URL returned 404; \`kubota-vh1100\` was excluded because the validated source is V1100, not VH1100.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Kubota V/Z strict pages`)
const coverageBefore = await fetchCoverage(supabase)
console.log(`Coverage before: ${coverageBefore.strictCount}/${coverageBefore.legacyCount}`)
const verifiedDocs = DOCUMENTS.map(verifyDocument)

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

for (const doc of verifiedDocs) {
  for (const slug of doc.slugs) {
    const engine = enginesBySlug.get(slug)
    if (!engine) {
      missingRows.push({ brand: 'Kubota', slug, sourceKey: doc.key, reason: 'missing engine row' })
      continue
    }
    if (engine.brand !== 'Kubota' || engine.status !== 'discontinued') {
      missingRows.push({
        brand: 'Kubota',
        slug,
        sourceKey: doc.key,
        reason: `unexpected row (${engine.brand}, ${engine.status})`,
      })
      continue
    }

    const { data: existingStrict, error: strictError } = await supabase
      .from('engine_pdfs')
      .select('id')
      .eq('engine_id', engine.id)
      .in('type', ['datasheet', 'brochure'])
    if (strictError) throw strictError

    if ((existingStrict ?? []).length > 0) {
      skippedRows.push({ brand: engine.brand, slug, sourceKey: doc.key })
      continue
    }

    insertedRows.push({ brand: engine.brand, slug, sourceKey: doc.key })
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

const coverageAfter = APPLY ? await fetchCoverage(supabase) : null
await fsp.writeFile(
  REPORT_PATH,
  buildReport({ verifiedDocs, insertedRows, skippedRows, missingRows, coverageBefore, coverageAfter }),
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
