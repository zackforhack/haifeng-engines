// Attach web-validated strict Kubota Z/WG specification pages to exact legacy rows.
//
// The source site intermittently blocks local curl in this environment, so this
// batch records URLs validated through web inspection and leaves byte sizes null.
//
// Dry run:
//   node data/attach-kubota-z-wg-strict-pages-batch-92-2026-08.mjs
// Apply:
//   node data/attach-kubota-z-wg-strict-pages-batch-92-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-13-batch-92-kubota-z-wg-strict.md'
const SUPABASE_TIMEOUT_MS = 60_000

const DOCUMENTS = [
  {
    key: 'kubota-z400-tractorgearbox',
    sourceUrl: 'https://tractorgearbox.com/kubota_z400_engine_specs.html',
    label: 'Kubota Z400 Engine Technical Data Page',
    type: 'datasheet',
    slugs: ['kubota-z400'],
    validation:
      'Page title and body identify Kubota Z400 and list vertical water-cooled diesel type, 2 cylinders, 0.399 L displacement, 64.0 mm bore, 62.2 mm stroke, 10.0 hp / 7.5 kW at 3200 rpm, plus service specifications.',
    note:
      'TractorGearbox page exposes exact Z400 identity, displacement, bore/stroke, rated power and rated speed.',
  },
  {
    key: 'kubota-z430-tractorgearbox',
    sourceUrl: 'https://tractorgearbox.com/kubota_z430_engine_specs.html',
    label: 'Kubota Z430 Engine Technical Data Page',
    type: 'datasheet',
    slugs: ['kubota-z430'],
    validation:
      'Page title and body identify Kubota Z430 and list engine model, diesel type, displacement, bore/stroke, rated engine power, rated engine speed and service specifications.',
    note:
      'TractorGearbox page exposes exact Z430 identity with engine specification and service-data fields.',
  },
  {
    key: 'kubota-wg750-tractorgearbox',
    sourceUrl: 'https://tractorgearbox.com/kubota_wg750_engine_specs.html',
    label: 'Kubota WG750 Engine Technical Data Page',
    type: 'datasheet',
    slugs: ['kubota-wg750'],
    validation:
      'Page title and body identify Kubota WG750 and list 4-cycle vertical OHV gasoline type, 3 cylinders, 740 cc displacement, 68.0 mm bore/stroke, 24.5 hp / 18.3 kW at 3600 rpm, fuel type gasoline, compression ratio 9.0:1 and service data.',
    note:
      'TractorGearbox page exposes exact WG750 identity, gasoline fuel type, displacement, bore/stroke, rated power, rated speed and compression ratio.',
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
  insertedRows,
  skippedRows,
  missingRows,
  coverageBefore,
  coverageAfter,
}) {
  return `# Legacy Engine Document Attachments - Batch 92 Kubota Z/WG Strict

Date: 2026-08-13

## Result

- Strict source pages verified by web inspection: \`${DOCUMENTS.length}\`
- Strict datasheet links ${APPLY ? 'inserted' : 'planned'}: \`${insertedRows.length}\`
- Links skipped as existing strict/exact duplicates: \`${skippedRows.length}\`
- Missing/refused engine rows: \`${missingRows.length}\`
- Strict legacy coverage before: \`${coverageBefore.strictCount}/${coverageBefore.legacyCount} (${coverageBefore.strictPct}%)\`
${coverageAfter == null ? '' : `- Strict legacy coverage after: \`${coverageAfter.strictCount}/${coverageAfter.legacyCount} (${coverageAfter.strictPct}%)\`\n- Remaining strict links needed for 60%: \`${coverageAfter.strictNeededFor60Percent}\`\n`}
## Document Attachments

| Document | Type | Source / URL | Target rows | Source bytes |
| --- | --- | --- | ---: | ---: |
${DOCUMENTS.map((doc) => `| ${doc.label} | ${doc.type} | ${doc.sourceUrl} | ${doc.slugs.length} | n/a - local curl blocked |`).join('\n')}

## Linked Engine Rows

| Brand | Engine slug | Source key | Status |
| --- | --- | --- | --- |
${insertedRows.map((row) => `| ${row.brand} | \`${row.slug}\` | ${row.sourceKey} | inserted |`).join('\n')}
${skippedRows.map((row) => `| ${row.brand} | \`${row.slug}\` | ${row.sourceKey} | existing |`).join('\n')}
${missingRows.map((row) => `| ${row.brand ?? ''} | \`${row.slug}\` | ${row.sourceKey ?? ''} | ${row.reason} |`).join('\n')}

## Source Validation

${DOCUMENTS.map((doc) => `- ${doc.validation}`).join('\n')}

## Validation Notes

${DOCUMENTS.map((doc) => `- ${doc.note}`).join('\n')}
- Excluded Kubota WG600-B and DH850-B candidates because the current database gap rows are base model names; this batch does not treat suffix-specific application pages as exact strict coverage for base rows.
- This batch only upgrades exact discontinued Kubota Z400, Z430 and WG750 rows and does not infer adjacent Kubota ZB, KND, VH, DH or small single-cylinder models.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Kubota Z/WG strict pages`)
console.log('Reading current strict legacy coverage...')
const coverageBefore = await fetchStrictCoverage(supabase)
console.log(`Coverage before: ${coverageBefore.strictCount}/${coverageBefore.legacyCount}`)

const slugs = [...new Set(DOCUMENTS.flatMap((doc) => doc.slugs))]
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

for (const doc of DOCUMENTS) {
  for (const slug of doc.slugs) {
    const engine = enginesBySlug.get(slug)
    if (!engine) {
      missingRows.push({ brand: 'Kubota', slug, sourceKey: doc.key, reason: 'missing engine row' })
      continue
    }
    if (engine.brand !== 'Kubota') {
      missingRows.push({
        brand: 'Kubota',
        slug,
        sourceKey: doc.key,
        reason: `brand mismatch (${engine.brand})`,
      })
      continue
    }
    if (engine.status !== 'discontinued') {
      missingRows.push({
        brand: 'Kubota',
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
        file_size_bytes: null,
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
    insertedRows,
    skippedRows,
    missingRows,
    coverageBefore,
    coverageAfter,
  }),
)

console.log(
  `${APPLY ? 'Applied' : 'Dry run complete'}: ${DOCUMENTS.length} verified, `
  + `${insertedRows.length} inserted/planned, ${skippedRows.length} skipped, `
  + `${missingRows.length} missing/refused.`,
)
if (coverageAfter) {
  console.log(
    `Strict legacy coverage: ${coverageAfter.strictCount}/${coverageAfter.legacyCount} `
    + `(${coverageAfter.strictPct}%), remaining ${coverageAfter.strictNeededFor60Percent}`,
  )
}
