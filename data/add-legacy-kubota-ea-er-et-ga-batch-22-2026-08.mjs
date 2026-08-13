// Add source-validated Kubota discontinued EA/ER/ET/GA small diesel models.
//
// Dry run:
//   set -a; source .env.local; node data/add-legacy-kubota-ea-er-et-ga-batch-22-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/add-legacy-kubota-ea-er-et-ga-batch-22-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-22-kubota-ea-er-et-ga.md'

function parseEnvFile(text) {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const separator = line.indexOf('=')
    const key = line.slice(0, separator).trim()
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] == null) process.env[key] = value
  }
}

function loadEnv() {
  for (const envFile of ['.env.local', '.env']) {
    try {
      parseEnvFile(fs.readFileSync(envFile, 'utf8'))
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

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalize(value) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function kubotaSmallDiesel(row) {
  return clean({
    slug: `kubota-${slugify(row.model)}`,
    brand: 'Kubota',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    origin: 'Japan',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: row.cooling_method,
    emissions_standard: 'Legacy pre-current small diesel',
    certifications: [],
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    description:
      `Kubota ${row.model} discontinued legacy small diesel engine. `
      + row.description,
  })
}

const SOURCES = [
  {
    label: 'Kubota Engine Parts Direct manuals index',
    url: 'https://kubotaenginepartsdirect.com/manuals/',
  },
  {
    label: 'Kubota Genuine Parts Catalog distributor revision',
    url: 'https://www.scribd.com/document/853905131/Kubota-Kits-Juntas-Pistones-etc-Genuine-Parts-Catalog-Distributor-Rev-May-2010-1',
  },
  {
    label: 'Small Diesel Engine Service Manual EA400-600 table',
    url: 'https://www.scribd.com/document/682377650/Small-Diesel-Engine-Service-Manual',
  },
  {
    label: 'Plough Book Sales Kubota old engine literature list',
    url: 'https://www.ploughbooksales.com.au/62.htm',
  },
  {
    label: 'MK Parts Center Kubota single-cylinder diesel parts context',
    url: 'https://mkpartscenter.com/product/',
  },
]

const RECORDS = [
  kubotaSmallDiesel({
    model: 'EA400',
    series: 'EA Series',
    displacement_l: 0.401,
    cylinders: 1,
    cooling_method: 'Liquid-Cooled',
    configuration: 'Single-cylinder, four-stroke diesel',
    description:
      'Kubota Engine Parts Direct lists EA400 under Discontinued Engine Series, Kubota Genuine Parts Catalog lists EA400-N/NB in the EA series, and the small-diesel manual table gives 401 cc displacement.',
  }),
  kubotaSmallDiesel({
    model: 'EA450',
    series: 'EA Series',
    displacement_l: 0.465,
    cylinders: 1,
    cooling_method: 'Liquid-Cooled',
    configuration: 'Single-cylinder, four-stroke diesel',
    description:
      'Kubota Engine Parts Direct lists EA450 under Discontinued Engine Series, Kubota Genuine Parts Catalog lists EA450-N/NB in the EA series, and the small-diesel manual table gives 465 cc displacement.',
  }),
  kubotaSmallDiesel({
    model: 'EA500',
    series: 'EA Series',
    displacement_l: 0.522,
    cylinders: 1,
    cooling_method: 'Liquid-Cooled',
    configuration: 'Single-cylinder, four-stroke diesel',
    description:
      'Kubota Engine Parts Direct lists EA500 under Discontinued Engine Series, Kubota Genuine Parts Catalog lists EA500-N/NB in the EA series, and the small-diesel manual table gives 522 cc displacement.',
  }),
  kubotaSmallDiesel({
    model: 'EA600',
    series: 'EA Series',
    displacement_l: 0.598,
    cylinders: 1,
    cooling_method: 'Liquid-Cooled',
    configuration: 'Single-cylinder, four-stroke diesel',
    description:
      'Kubota Engine Parts Direct lists EA600 under Discontinued Engine Series, Kubota Genuine Parts Catalog lists EA600-N/NB in the EA series, and the small-diesel manual table gives 598 cc displacement.',
  }),
  ...['ER600', 'ER700', 'ER800', 'ER900', 'ER1500'].map((model) =>
    kubotaSmallDiesel({
      model,
      series: 'ER Series',
      cylinders: 1,
      configuration: 'Single-cylinder diesel',
      description:
        `Kubota Engine Parts Direct lists ${model} under Discontinued Engine Series, and Kubota Genuine Parts Catalog lists ${model} in the ER-series manual guide with E cylinder code.`,
    }),
  ),
  ...['ET70', 'ET80', 'ET95', 'ET110'].map((model) =>
    kubotaSmallDiesel({
      model,
      series: 'ET Series',
      cylinders: 1,
      configuration: 'Single-cylinder diesel',
      description:
        `Kubota Engine Parts Direct lists ${model} under Discontinued Engine Series, Kubota Genuine Parts Catalog lists ${model} in the ET-series manual guide with E cylinder code, and current parts suppliers still group ET70-ET110 as Kubota diesel walking-tractor engine parts.`,
    }),
  ),
  ...[
    ['GA70', 1],
    ['GA80', 1],
    ['GA90', 1],
    ['GA100', 1],
    ['GA120', 2],
    ['GA150', 2],
  ].map(([model, cylinders]) =>
    kubotaSmallDiesel({
      model,
      series: 'GA Series',
      cylinders,
      configuration: `${cylinders === 1 ? 'Single-cylinder' : 'Inline-2'} diesel`,
      description:
        `Kubota Engine Parts Direct lists ${model} under Discontinued Engine Series, Kubota Genuine Parts Catalog lists ${model} in the GA-series manual guide, and old Kubota literature listings cross-check the GA70-GA150 engine-parts catalog family.`,
    }),
  ),
]

async function fetchAllEngines(supabase) {
  const engines = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, brand, model, slug, status')
      .range(from, from + 999)
    if (error) throw error
    engines.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return engines
}

async function countLegacyCoverage(supabase) {
  let legacyRows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, status, pdfs:engine_pdfs(id)')
      .eq('status', 'discontinued')
      .range(from, from + 999)
    if (error) throw error
    legacyRows = legacyRows.concat(data ?? [])
    if (!data || data.length < 1000) break
  }
  return {
    legacyCount: legacyRows.length,
    legacyWithPdf: legacyRows.filter((engine) => (engine.pdfs ?? []).length > 0).length,
  }
}

function buildReport({ existingCount, missing, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 22 Kubota EA/ER/ET/GA

Date: 2026-08-11

## Result

- Source-validated Kubota EA/ER/ET/GA discontinued candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Cyl | Displacement L |
| --- | --- | --- | --- | ---: | ---: |
${missing.map((row) =>
  `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.cylinders ?? ''} | ${row.displacement_l ?? ''} |`
).join('\n')}

## Validation Sources

${SOURCES.map((source) => `- ${source.label}: ${source.url}`).join('\n')}

## Notes

- Kubota Engine Parts Direct explicitly labels these EA/ER/ET/GA models as Discontinued Engine Series.
- Kubota Genuine Parts Catalog validates exact model identity and cylinder-code context in the AC/EA/EB/ER/EL/ET/ZB and GA/GH/GN/GS/KND/RK manual-guide tables.
- EA400-EA600 displacement values come from a small-diesel service manual table; ER/ET/GA displacement and power fields are intentionally left blank until a clean public specification table is available.
- No proprietary Kubota manual PDFs are attached or redistributed in this batch; the report links source pages only.
`
}

loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Kubota EA/ER/ET/GA legacy batch`)

const existing = await fetchAllEngines(supabase)
const existingKeys = new Set(
  existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`),
)
const missing = RECORDS.filter(
  (engine) => !existingKeys.has(`${engine.brand}::${normalize(engine.model)}`),
)

console.log(`Candidates: ${RECORDS.length}`)
console.log(`Already present: ${RECORDS.length - missing.length}`)
console.log(`Missing/new: ${missing.length}`)
for (const engine of missing) console.log(`${engine.brand}\t${engine.model}\t${engine.slug}`)

if (APPLY && missing.length) {
  const { data, error } = await supabase
    .from('engines')
    .upsert(missing, { onConflict: 'slug' })
    .select('id, brand, model, slug')
  if (error) throw error
  console.log(`Imported ${data.length} validated Kubota EA/ER/ET/GA record(s).`)
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = APPLY ? await countLegacyCoverage(supabase) : null

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({
  existingCount: RECORDS.length - missing.length,
  missing,
  afterCount: APPLY ? afterCount : null,
  coverage,
}))

console.log(`Engine count is ${afterCount}.`)
if (coverage) {
  console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
}
console.log(`Wrote ${REPORT_PATH}`)
