// Attach web-validated strict Caterpillar industrial/legacy specification pages
// to exact discontinued rows. Dry-run by default.
//
// Dry run:
//   node data/attach-cat-industrial-strict-pages-batch-93-2026-08.mjs
// Apply:
//   node data/attach-cat-industrial-strict-pages-batch-93-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-13-batch-93-cat-industrial-strict.md'
const SUPABASE_TIMEOUT_MS = 60_000

const DOCUMENTS = [
  {
    key: 'cat-3114-dieselpro',
    sourceUrl: 'https://dieselpro.com/caterpillar-parts/3114-engine.html',
    label: 'Caterpillar 3114 Engine Technical Specifications Page',
    type: 'datasheet',
    slugs: ['caterpillar-3114'],
    validation:
      'Diesel Pro Power page identifies Caterpillar 3114 and lists inline 4-cylinder diesel type, 6.6 L / 403 cu in displacement, 105 mm x 127 mm bore/stroke, compression ratio, fuel system, cooling system and power ranges.',
    note:
      'Aftermarket technical page, accepted because it exposes exact 3114 model identity and core engine specification fields.',
  },
  {
    key: 'cat-3204-tractor-info',
    sourceUrl: 'https://tractor-info.com/tractors/caterpillar/d3b-sa',
    label: 'Caterpillar 3204 Engine Technical Specifications Page',
    type: 'datasheet',
    slugs: ['caterpillar-3204'],
    validation:
      'Tractor-Info D3B SA page identifies Caterpillar 3204 and lists liquid-cooled inline turbo diesel, 4 cylinders, 318 cu in / 5.2 L displacement, 4.50 x 5.00 in bore/stroke, 2400 rpm and 101 hp / 75.3 kW net power.',
    note:
      'Application technical page, accepted because it exposes exact 3204 model identity and engine specification fields.',
  },
  {
    key: 'cat-d330c-tractordata',
    sourceUrl:
      'https://www.tractordata.com/industrial-tractors/000/5/8/585-caterpillar-d4d-engine.html',
    label: 'Caterpillar D330C Engine Technical Specifications Page',
    type: 'datasheet',
    slugs: ['caterpillar-d330c'],
    validation:
      'TractorData D4D engine page identifies Caterpillar D330C and lists 4-cylinder liquid-cooled inline diesel, 350 cu in / 5.7 L displacement, 4.50 x 5.50 in bore/stroke, 65 hp / 48.5 kW net power and rated rpm values.',
    note:
      'Application technical page, accepted because it exposes exact D330C model identity and engine specification fields.',
  },
  {
    key: 'cat-3406b-bigbud',
    sourceUrl: 'https://www.tractorspecifications.com/en/tractors/farm/big-bud/big-bud-402',
    label: 'Caterpillar 3406B Engine Technical Specifications Page',
    type: 'datasheet',
    slugs: ['caterpillar-3406b'],
    validation:
      'TractorSpecifications Big Bud 402 page identifies Caterpillar 3406B and lists turbocharged intercooled diesel, 6-cylinder liquid-cooled type, 893 cu in / 14.6 L displacement, 5.40 x 6.50 in bore/stroke and 2100 rated rpm.',
    note:
      'Application technical page, accepted because it exposes exact 3406B model identity and engine specification fields.',
  },
  {
    key: 'cat-3408b-dieselpro',
    sourceUrl: 'https://dieselpro.com/caterpillar-parts/3408-engines/3408b-engine.html',
    label: 'Caterpillar 3408B Engine Technical Specifications Page',
    type: 'datasheet',
    slugs: ['caterpillar-3408b'],
    validation:
      'Diesel Pro Power page identifies Caterpillar 3408B and lists 4-stroke V8 diesel type, 18.0 L / 1099 cu in displacement, 5.4 x 6.5 in bore/stroke, compression ratio, horsepower range, rated speed range, aspiration and fuel system.',
    note:
      'Aftermarket technical page, accepted because it exposes exact 3408B model identity and core engine specification fields.',
  },
  {
    key: 'cat-3408c-official-d9gc',
    sourceUrl: 'https://www.cat.com/en_IN/products/new/equipment/dozers/large-dozers/106220.html',
    label: 'Cat 3408C Engine Technical Specifications Page',
    type: 'datasheet',
    slugs: ['caterpillar-3408c'],
    validation:
      'Official Caterpillar D9 GC page identifies Cat 3408C and lists 412 hp / 308 kW net power, 443 hp / 330 kW gross power, 5.4 in / 137 mm bore, 6 in / 152 mm stroke, 1099 cu in / 18 L displacement and 1900 rpm rating note.',
    note:
      'Official Cat product technical page, accepted because it exposes exact 3408C model identity and specification fields.',
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
  return `# Legacy Engine Document Attachments - Batch 93 Cat Industrial Strict

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
${DOCUMENTS.map((doc) => `| ${doc.label} | ${doc.type} | ${doc.sourceUrl} | ${doc.slugs.length} | n/a - web-validated HTML page |`).join('\n')}

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
- This batch intentionally avoids Caterpillar marine-only rows from the current gap list.
- This batch does not infer from adjacent 3406, 3406C, 3408, 3408C marine or 3304 successor/family pages unless the exact target model is named in the source.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Cat industrial strict pages`)
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
      missingRows.push({ brand: 'Caterpillar', slug, sourceKey: doc.key, reason: 'missing engine row' })
      continue
    }
    if (engine.brand !== 'Caterpillar') {
      missingRows.push({
        brand: 'Caterpillar',
        slug,
        sourceKey: doc.key,
        reason: `brand mismatch (${engine.brand})`,
      })
      continue
    }
    if (engine.status !== 'discontinued') {
      missingRows.push({
        brand: 'Caterpillar',
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
