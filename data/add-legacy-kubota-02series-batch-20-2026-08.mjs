// Add source-validated Kubota discontinued 02-series industrial diesel models.
//
// Dry run:
//   set -a; source .env.local; node data/add-legacy-kubota-02series-batch-20-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/add-legacy-kubota-02series-batch-20-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-20-kubota-02series.md'

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

function kubota02(row) {
  return clean({
    slug: `kubota-${slugify(row.model)}`,
    brand: 'Kubota',
    model: row.model,
    series: '02 Series',
    status: 'discontinued',
    origin: 'Japan',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'Tier 1 / non-certified legacy industrial',
    certifications: ['Tier 1 / non-certified service literature'],
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    description:
      `Kubota ${row.model} discontinued 02-series industrial diesel. `
      + 'Kubota Engine Parts Direct lists this exact base model under Discontinued Engine Series manuals, and the Kubota Genuine Parts Catalog identifies the 02-series service/gasket/filter context and cylinder-code model logic.',
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
]

const RECORDS = [
  kubota02({
    model: 'D1102',
    displacement_l: 1.1,
    cylinders: 3,
    configuration: 'Inline-3, indirect-injection industrial diesel',
  }),
  kubota02({
    model: 'D1302',
    displacement_l: 1.3,
    cylinders: 3,
    configuration: 'Inline-3, indirect-injection industrial diesel',
  }),
  kubota02({
    model: 'D1402',
    displacement_l: 1.4,
    cylinders: 3,
    configuration: 'Inline-3, indirect-injection industrial diesel',
  }),
  kubota02({
    model: 'V1502',
    displacement_l: 1.5,
    cylinders: 4,
    configuration: 'Inline-4, indirect-injection industrial diesel',
  }),
  kubota02({
    model: 'V1702',
    displacement_l: 1.7,
    cylinders: 4,
    configuration: 'Inline-4, indirect-injection industrial diesel',
  }),
  kubota02({
    model: 'V1902',
    displacement_l: 1.9,
    cylinders: 4,
    configuration: 'Inline-4, indirect-injection industrial diesel',
  }),
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
  return `# Legacy Engine Model Discovery - Batch 20 Kubota 02 Series

Date: 2026-08-11

## Result

- Source-validated Kubota 02-series discontinued candidates reviewed: \`${RECORDS.length}\`
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

- Kubota Engine Parts Direct explicitly labels D1102, D1302, D1402, V1502, V1702, and V1902 as Discontinued Engine Series.
- Kubota Genuine Parts Catalog cross-checks 02-series service context and explains model-code logic: D = 3 cylinder, V = 4 cylinder.
- No proprietary Kubota manual PDFs are attached or redistributed in this batch; the report links source pages only.
`
}

loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Kubota 02-series legacy batch`)

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
  console.log(`Imported ${data.length} validated Kubota 02-series record(s).`)
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
