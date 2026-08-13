// Add source-validated Kubota discontinued ZB/KND/WG-DF legacy models.
//
// Dry run:
//   set -a; source .env.local; node data/add-legacy-kubota-zb-knd-wg-batch-23-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/add-legacy-kubota-zb-knd-wg-batch-23-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-23-kubota-zb-knd-wg.md'

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

function kubotaLegacy(row) {
  const fuelType = row.fuel_type ?? 'Diesel'
  return clean({
    slug: `kubota-${slugify(row.model)}`,
    brand: 'Kubota',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    origin: 'Japan',
    fuel_type: fuelType,
    ignition_type: fuelType === 'Diesel' ? 'Compression Ignition' : 'Spark Ignition',
    cooling_method: row.cooling_method,
    emissions_standard: 'Legacy pre-current industrial emissions',
    certifications: [],
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    description: row.description,
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
    label: 'Kubota Engine Discovery ZB400 gallery',
    url: 'https://discovery.engine.kubota.com/jp/gallery/zb400/',
  },
  {
    label: 'Kubota model-number identification',
    url: 'https://engine.kubota.com/en/support/modelnumber/index.html',
  },
  {
    label: 'Plough Book Sales Kubota old engine literature list',
    url: 'https://www.ploughbooksales.com.au/62.htm',
  },
  {
    label: 'Kubota WG Series fuel-family page',
    url: 'https://engine.kubota.com/products/category?c=Kubota+WG+Series&ln=en',
  },
]

const RECORDS = [
  kubotaLegacy({
    model: 'ZB400',
    series: 'ZB Series',
    fuel_type: 'Diesel',
    displacement_l: 0.4,
    cylinders: 2,
    cooling_method: 'Liquid-Cooled',
    configuration: 'Horizontal inline-2, water-cooled four-stroke diesel',
    description:
      'Kubota ZB400 discontinued horizontal two-cylinder diesel. Kubota Engine Parts Direct lists ZB400 under Discontinued Engine Series; Kubota Engine Discovery identifies the ZB400 as a 1980 diesel with 400 cc displacement, two cylinders, and horizontal water-cooled four-stroke construction.',
  }),
  kubotaLegacy({
    model: 'ZB500',
    series: 'ZB Series',
    fuel_type: 'Diesel',
    displacement_l: 0.5,
    cylinders: 2,
    cooling_method: 'Liquid-Cooled',
    configuration: 'Horizontal inline-2, indirect-injection diesel',
    description:
      'Kubota ZB500 discontinued ZB-series diesel. Kubota Engine Parts Direct lists ZB500 under Discontinued Engine Series and Kubota Genuine Parts Catalog validates the ZB500-C-E model-cover entry with Z cylinder code.',
  }),
  kubotaLegacy({
    model: 'ZB600',
    series: 'ZB Series',
    fuel_type: 'Diesel',
    displacement_l: 0.6,
    cylinders: 2,
    cooling_method: 'Liquid-Cooled',
    configuration: 'Horizontal inline-2, indirect-injection diesel',
    description:
      'Kubota ZB600 discontinued ZB-series diesel. Kubota Engine Parts Direct lists ZB600 under Discontinued Engine Series and Kubota Genuine Parts Catalog validates ZB600-C and ZB600-D model-cover entries.',
  }),
  ...['KND600', 'KND700', 'KND800', 'KND900', 'KND1500'].map((model) =>
    kubotaLegacy({
      model,
      series: 'KND Series',
      fuel_type: 'Diesel',
      cylinders: 1,
      configuration: 'Single-cylinder diesel',
      description:
        `Kubota ${model} legacy KND-series diesel. Kubota Genuine Parts Catalog validates ${model} in the KND manual-guide rows, Plough Book Sales cross-checks old KND engine parts-catalog coverage, and the Kubota Engine Parts Direct discontinued list appears to carry the same family under NKD spelling.`,
    }),
  ),
  kubotaLegacy({
    model: 'DF1005',
    series: 'WG/DF Gas Series',
    fuel_type: 'Gasoline / Propane (LPG)',
    displacement_l: 1.0,
    cylinders: 3,
    cooling_method: 'Liquid-Cooled',
    configuration: 'Inline-3, spark-ignited dual-fuel industrial engine',
    description:
      'Kubota DF1005 discontinued dual-fuel industrial gas engine. Kubota Engine Parts Direct lists DF1005 under Discontinued Engine Series; Kubota model-number guidance identifies DF as gasoline/LPG dual fuel and 1005 as the approximate 1000 cc 05-series gas platform.',
  }),
  kubotaLegacy({
    model: 'WG1005',
    series: 'WG/DF Gas Series',
    fuel_type: 'Gasoline / Propane (LPG)',
    displacement_l: 1.0,
    cylinders: 3,
    cooling_method: 'Liquid-Cooled',
    configuration: 'Inline-3, spark-ignited industrial gas engine',
    description:
      'Kubota WG1005 discontinued 05-series industrial gas engine. Kubota Engine Parts Direct lists WG1005 under Discontinued Engine Series, and Kubota WG Series guidance identifies the family as spark-ignited engines using gasoline, propane/LPG, or natural gas depending on suffix.',
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
  return `# Legacy Engine Model Discovery - Batch 23 Kubota ZB/KND/WG

Date: 2026-08-11

## Result

- Source-validated Kubota ZB/KND/WG discontinued candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Fuel | Cyl | Displacement L |
| --- | --- | --- | --- | --- | ---: | ---: |
${missing.map((row) =>
  `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.fuel_type} | ${row.cylinders ?? ''} | ${row.displacement_l ?? ''} |`
).join('\n')}

## Validation Sources

${SOURCES.map((source) => `- ${source.label}: ${source.url}`).join('\n')}

## Notes

- Kubota Engine Parts Direct explicitly labels ZB400, ZB500, ZB600, DF1005, and WG1005 as Discontinued Engine Series.
- KND rows are treated as legacy/discontinued because Kubota Genuine Parts Catalog validates the KND model spelling and old engine manual coverage, while Kubota Engine Parts Direct appears to list the same discontinued family with NKD spelling. These should be live-dry-run checked before apply.
- Kubota model-number guidance validates cylinder-code and fuel-code handling: Z = two-cylinder diesel, DF = gasoline/LPG dual fuel, and WG is the spark-ignited gas-engine family.
- KND displacement and power fields are intentionally left blank until a clean public specification table is available.
- No proprietary Kubota manual PDFs are attached or redistributed in this batch; the report links source pages only.
`
}

loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Kubota ZB/KND/WG legacy batch`)

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
  console.log(`Imported ${data.length} validated Kubota ZB/KND/WG record(s).`)
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
