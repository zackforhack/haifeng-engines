// Attach source-validated strict Kubota small-engine specification pages to exact legacy rows.
//
// Dry run:
//   node data/attach-kubota-small-engine-strict-pages-batch-89-2026-08.mjs
// Apply:
//   node data/attach-kubota-small-engine-strict-pages-batch-89-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fsp from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-13-batch-89-kubota-small-engine-strict.md'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
const SUPABASE_TIMEOUT_MS = 60_000

const DOCUMENTS = [
  {
    key: 'kubota-d600-tractortechspecs',
    sourceUrl: 'https://tractortechspecs.com/kubota_d600_specs.html',
    label: 'Kubota D600 Engine Specifications Page',
    type: 'datasheet',
    slugs: ['kubota-d600'],
    requiredTokens: [
      'Kubota D600 Engine: Specifications and technical data',
      'Kubota D600 Specifications',
      'Engine Model .............. Kubota D600',
      'Displacement, cu in (L) .............. 36.6 (0.601)',
      'Cylinder Bore, in (mm) .............. 2.52 (64.0)',
      'Piston Stroke, in (mm) .............. 2.45 (62.2)',
      'Rated Engine Power, hp (kW) .............. 14.0 (10.3)',
      'Rated Engine Speed, rpm .............. 3200',
    ],
    note:
      'TractorTechSpecs page exposes exact D600 identity, displacement, bore/stroke, rated power and rated speed.',
  },
  {
    key: 'kubota-d640-tractortechspecs',
    sourceUrl: 'https://tractortechspecs.com/kubota_d640_specs.html',
    label: 'Kubota D640 Engine Specifications Page',
    type: 'datasheet',
    slugs: ['kubota-d640'],
    requiredTokens: [
      'Kubota D640 Engine: Specifications and technical data',
      'Kubota D640 Specifications',
      'Engine Model .............. Kubota D640',
      'Displacement, cu in (L) .............. 38.9 (0.638)',
      'Cylinder Bore, in (mm) .............. 2.60 (66.0)',
      'Piston Stroke, in (mm) .............. 2.45 (62.2)',
      'Rated Engine Power, hp (kW) .............. 16.0 (11.8)',
      'Rated Engine Speed, rpm .............. 3200',
    ],
    note:
      'TractorTechSpecs page exposes exact D640 identity, displacement, bore/stroke, rated power and rated speed.',
  },
  {
    key: 'kubota-d650-tractortechspecs',
    sourceUrl: 'https://tractortechspecs.com/kubota_d650_specs.html',
    label: 'Kubota D650 Engine Specifications Page',
    type: 'datasheet',
    slugs: ['kubota-d650'],
    requiredTokens: [
      'Kubota D650 Engine: Specifications and technical data',
      'Kubota D650 Specifications',
      'Engine Model .............. Kubota D650',
      'Bore, mm (in) .............. 64.0 (2.52)',
      'Stroke, mm (in) .............. 70.0 (2.76)',
      'Total displacement, cm3 (cu. in) .............. 675 (41.2)',
      'Gross power, kw (hp) .............. 11.2 (14.3)',
      'Maximum torque, Nm (ft-lb) .............. 36.5 (27)',
      'Compression ratio .............. 22:1',
    ],
    note:
      'TractorTechSpecs page exposes exact D650 identity, bore/stroke, displacement, power, torque and compression-ratio data.',
  },
  {
    key: 'kubota-d750-tractortechspecs',
    sourceUrl: 'https://www.tractortechspecs.com/kubota_d750_specs.html',
    label: 'Kubota D750 Engine Specifications Page',
    type: 'datasheet',
    slugs: ['kubota-d750'],
    requiredTokens: [
      'Kubota D750 Engine: Specifications and technical data',
      'Kubota D750 Specifications',
      'Engine Model .............. Kubota D750',
      'Bore, mm (in) .............. 68.0 (2.68)',
      'Stroke, mm (in) .............. 70.0 (2.76)',
      'Total displacement, cm3 (cu. in) .............. 762 (46.5)',
      'Gross power, kw (hp) .............. 12.7 (16.5)',
      'Maximum torque, Nm (ft-lb) .............. 42.2 (33.1)',
      'Compression ratio .............. 22:1',
    ],
    note:
      'TractorTechSpecs page exposes exact D750 identity, bore/stroke, displacement, power, torque and compression-ratio data.',
  },
  {
    key: 'kubota-d950-tractorgearbox',
    sourceUrl: 'https://tractorgearbox.com/kubota_d950_engine_specs.html',
    label: 'Kubota D950 Engine Technical Data Page',
    type: 'datasheet',
    slugs: ['kubota-d950'],
    requiredTokens: [
      'Kubota D950 Engine: Technical Data and Service Specs',
      'Kubota D950 Engine Specifications',
      'Engine Model .......... Kubota D950',
      'Bore, mm (in.) .......... 75.0 (2.95)',
      'Stroke, mm (in.) .......... 70.0 (2.76)',
      'Total displacement, cm3 (cu. in.) .......... 927 (56.6)',
      'Gross power, kw (hp) .......... 16.0 (21.5)',
      'Maximum torque, Nm (ft-lb) .......... 55.6 (41)',
      'Compression ratio .......... 22:1',
    ],
    note:
      'TractorGearbox page exposes exact D950 identity, bore/stroke, displacement, power, torque and compression-ratio data.',
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
    .replace(/&#8243;/g, '"')
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
  return `# Legacy Engine Document Attachments - Batch 89 Kubota Small Engine Strict

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
- This batch only upgrades exact discontinued Kubota D-series rows and does not infer adjacent Kubota D/V/Z/GH/GS/WG models.
- Pages are public technical-specification pages, not parts-only listings.
`
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Kubota small-engine strict pages`)
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
