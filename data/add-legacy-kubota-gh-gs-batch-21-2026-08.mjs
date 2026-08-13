// Add source-validated Kubota discontinued GH/GS gasoline engine models.
//
// Dry run:
//   set -a; source .env.local; node data/add-legacy-kubota-gh-gs-batch-21-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/add-legacy-kubota-gh-gs-batch-21-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-21-kubota-gh-gs.md'

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

function kubotaGas(row) {
  return clean({
    slug: `kubota-${slugify(row.model)}`,
    brand: 'Kubota',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    origin: 'Japan',
    fuel_type: 'Gasoline',
    ignition_type: 'Spark Ignition',
    cooling_method: row.cooling_method,
    emissions_standard: 'Legacy gasoline service literature',
    certifications: [],
    cylinders: row.cylinders,
    configuration: row.configuration,
    description:
      `Kubota ${row.model} discontinued legacy gasoline engine. `
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
    label: 'Kubota GH Series workshop manual listing',
    url: 'https://erepair-info.com/p/kubota-gh-series-workshop-manual-gasoline-engine-97897-00915/',
  },
  {
    label: 'Kubota engine and generator literature index',
    url: 'https://es.scribd.com/doc/38499381/ktape',
  },
]

const RECORDS = [
  kubotaGas({
    model: 'GH120',
    series: 'GH Gasoline Series',
    cylinders: 1,
    cooling_method: 'Air-Cooled',
    configuration: 'Single-cylinder spark-ignited gasoline engine',
    description:
      'Kubota Engine Parts Direct lists GH120 under Discontinued Engine Series, and Kubota GH Series workshop-manual listings name GH120 in the gasoline-engine service manual.',
  }),
  kubotaGas({
    model: 'GH130',
    series: 'GH Gasoline Series',
    cylinders: 1,
    cooling_method: 'Air-Cooled',
    configuration: 'Single-cylinder spark-ignited gasoline engine',
    description:
      'Kubota Engine Parts Direct lists GH130 under Discontinued Engine Series, and Kubota Genuine Parts Catalog lists GH130 in the GH-series manual guide with E cylinder code.',
  }),
  kubotaGas({
    model: 'GH170',
    series: 'GH Gasoline Series',
    cylinders: 1,
    cooling_method: 'Air-Cooled',
    configuration: 'Single-cylinder spark-ignited gasoline engine',
    description:
      'Kubota Engine Parts Direct lists GH170 under Discontinued Engine Series, and Kubota GH Series workshop-manual listings name GH170 in the gasoline-engine service manual.',
  }),
  kubotaGas({
    model: 'GH170-1',
    series: 'GH Gasoline Series',
    cylinders: 1,
    cooling_method: 'Air-Cooled',
    configuration: 'Single-cylinder spark-ignited gasoline engine',
    description:
      'Kubota Engine Parts Direct lists GH170-1 under Discontinued Engine Series, and Kubota GH Series workshop-manual listings name GH170-1 in the gasoline-engine service manual.',
  }),
  kubotaGas({
    model: 'GH250',
    series: 'GH Gasoline Series',
    cylinders: 1,
    cooling_method: 'Air-Cooled',
    configuration: 'Single-cylinder spark-ignited gasoline engine',
    description:
      'Kubota Engine Parts Direct lists GH250 under Discontinued Engine Series, and Kubota GH Series workshop-manual listings name GH250 in the gasoline-engine service manual.',
  }),
  kubotaGas({
    model: 'GH280',
    series: 'GH Gasoline Series',
    cylinders: 1,
    cooling_method: 'Air-Cooled',
    configuration: 'Single-cylinder spark-ignited gasoline engine',
    description:
      'Kubota Engine Parts Direct lists GH280 under Discontinued Engine Series, and Kubota GH Series workshop-manual listings name GH280 in the gasoline-engine service manual.',
  }),
  kubotaGas({
    model: 'GH340',
    series: 'GH Gasoline Series',
    cylinders: 1,
    cooling_method: 'Air-Cooled',
    configuration: 'Single-cylinder spark-ignited gasoline engine',
    description:
      'Kubota Engine Parts Direct lists GH340 under Discontinued Engine Series, and Kubota GH Series workshop-manual listings name GH340 in the gasoline-engine service manual.',
  }),
  kubotaGas({
    model: 'GH400',
    series: 'GH Gasoline Series',
    cylinders: 1,
    cooling_method: 'Air-Cooled',
    configuration: 'Single-cylinder spark-ignited gasoline engine',
    description:
      'Kubota Engine Parts Direct lists GH400 under Discontinued Engine Series, and Kubota GH Series workshop-manual listings name GH400 in the gasoline-engine service manual.',
  }),
  kubotaGas({
    model: 'GS160',
    series: 'GS Gasoline Series',
    cooling_method: 'Air-Cooled',
    configuration: 'Spark-ignited gasoline engine',
    description:
      'Kubota Engine Parts Direct lists GS160 under Discontinued Engine Series, while Kubota literature indexes place GS160 in the petrol-engine GS-series documentation.',
  }),
  kubotaGas({
    model: 'GS200',
    series: 'GS Gasoline Series',
    cooling_method: 'Air-Cooled',
    configuration: 'Spark-ignited gasoline engine',
    description:
      'Kubota Engine Parts Direct lists GS200 under Discontinued Engine Series, while Kubota literature indexes place GS200 in the petrol-engine GS-series documentation.',
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
  return `# Legacy Engine Model Discovery - Batch 21 Kubota GH/GS

Date: 2026-08-11

## Result

- Source-validated Kubota GH/GS discontinued candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Fuel | Cyl | Cooling |
| --- | --- | --- | --- | --- | ---: | --- |
${missing.map((row) =>
  `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.fuel_type ?? ''} | ${row.cylinders ?? ''} | ${row.cooling_method ?? ''} |`
).join('\n')}

## Validation Sources

${SOURCES.map((source) => `- ${source.label}: ${source.url}`).join('\n')}

## Notes

- Kubota Engine Parts Direct explicitly labels GH120, GH130, GH170, GH170-1, GH250, GH280, GH340, GH400, GS160, and GS200 as Discontinued Engine Series.
- The GH-series workshop manual listing identifies these as Kubota gasoline engines; Kubota Genuine Parts Catalog and literature indexes cross-check GH/GS model identity.
- Displacement and power fields are intentionally left blank until a clean public specification table is available.
- No proprietary Kubota manual PDFs are attached or redistributed in this batch; the report links source pages only.
`
}

loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Kubota GH/GS legacy batch`)

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
  console.log(`Imported ${data.length} validated Kubota GH/GS record(s).`)
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
