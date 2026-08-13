// Add source-validated Volvo Penta legacy D16 industrial and genset models.
//
// Dry run:
//   set -a; source .env.local; node data/add-legacy-volvo-d16-batch-18-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/add-legacy-volvo-d16-batch-18-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-18-volvo-d16.md'

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

function kwToHp(kw) {
  return Math.round((kw / 0.7457) * 10) / 10
}

function volvoD16(row) {
  return clean({
    slug: `volvo-penta-${slugify(row.model)}`,
    brand: 'Volvo Penta',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    origin: 'Sweden',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'Legacy pre-current industrial emissions',
    certifications: [],
    power_kw: row.power_kw,
    power_hp: row.power_hp ?? (row.power_kw ? kwToHp(row.power_kw) : undefined),
    displacement_l: 16.123,
    cylinders: 6,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    description: row.description,
  })
}

const SOURCES = [
  {
    label: 'ManualsLib Volvo Penta TAD1630G workshop manual index',
    url: 'https://www.manualslib.com/manual/1840742/Volvo-Penta-Tad1630g.html',
  },
  {
    label: 'Manualzz Volvo Penta TWD1630V workshop manual mirror',
    url: 'https://manualzz.com/doc/html/55752033/volvo-penta-td164kae--tid162ap--twd1620g--twd1630v-worksh...',
  },
  {
    label: 'K MOTORSHOP Volvo Penta D16 engine cross-reference list',
    url: 'https://www.kmotorshop.com/en/device/motor-list/5051',
  },
  {
    label: 'K MOTORSHOP MAHLE piston-ring application listing',
    url: 'https://www.kmotorshop.com/en/article-detail/view/155839/piston-ring-kit-037rs001460n0-mahle-3837146-877356',
  },
  {
    label: 'Volvo Penta industrial power generation product archive',
    url: 'https://www.volvopenta.com/en-us/industrial/power-generation-engines/power-generation-engine-range/power-gen-product-archive/',
  },
]

const RECORDS = [
  volvoD16({
    model: 'TAD1630G',
    series: 'Legacy D16 Power Generation',
    power_kw: 395,
    rpm_rated: 1500,
    configuration: 'Inline-6, turbocharged aftercooled diesel generator engine',
    description:
      'Volvo Penta TAD1630G discontinued legacy D16 generator-drive diesel. Volvo Penta workshop-manual indexes cover TAD1630G/GE/P/V and TAD1631G/GE, while K MOTORSHOP cross-reference data lists TAD1630G at 395 kW / 537 hp and 16.123 L displacement.',
  }),
  volvoD16({
    model: 'TAD1630GE',
    series: 'Legacy D16 Power Generation',
    power_kw: 395,
    rpm_rated: 1500,
    configuration: 'Inline-6, turbocharged aftercooled diesel generator engine',
    description:
      'Volvo Penta TAD1630GE discontinued legacy D16 generator-drive diesel. Volvo Penta workshop-manual indexes name the exact GE variant in the TAD1630 service family, and parts/cross-reference sources validate the same 16.123 L D16 platform.',
  }),
  volvoD16({
    model: 'TAD1630P',
    series: 'Legacy D16 Industrial',
    power_kw: 330,
    rpm_rated: 1800,
    configuration: 'Inline-6, turbocharged aftercooled industrial diesel',
    description:
      'Volvo Penta TAD1630P discontinued legacy D16 industrial diesel. The Volvo Penta workshop manual lists TAD1630P alongside the TAD1630G/GE/V and TWD1630 variants, while cross-reference data gives 330 kW / 449 hp and 16.123 L displacement.',
  }),
  volvoD16({
    model: 'TAD1630V',
    series: 'Legacy D16 Industrial',
    power_kw: 330,
    rpm_rated: 1800,
    configuration: 'Inline-6, turbocharged aftercooled industrial diesel',
    description:
      'Volvo Penta TAD1630V discontinued legacy D16 industrial diesel. Workshop-manual and parts-application sources identify the exact V variant in the TAD1630 family, with cross-reference output listed at 330 kW / 449 hp and 16.123 L displacement.',
  }),
  volvoD16({
    model: 'TAD1631G',
    series: 'Legacy D16 Power Generation',
    power_kw: 435,
    rpm_rated: 1500,
    configuration: 'Inline-6, turbocharged aftercooled diesel generator engine',
    description:
      'Volvo Penta TAD1631G discontinued legacy D16 generator-drive diesel. Volvo Penta workshop-manual indexes list TAD1631G/GE as a distinct service group from TAD1630, and cross-reference data gives 435 kW / 591 hp with 16.123 L displacement.',
  }),
  volvoD16({
    model: 'TAD1631GE',
    series: 'Legacy D16 Power Generation',
    power_kw: 435,
    rpm_rated: 1500,
    configuration: 'Inline-6, turbocharged aftercooled diesel generator engine',
    description:
      'Volvo Penta TAD1631GE discontinued legacy D16 generator-drive diesel. The exact GE variant is named in Volvo Penta workshop-manual indexes and parts/cross-reference sources, with 435 kW / 591 hp and 16.123 L displacement listed.',
  }),
  volvoD16({
    model: 'TWD1630P',
    series: 'Legacy D16 Industrial',
    power_kw: 288,
    rpm_rated: 1800,
    configuration: 'Inline-6, turbocharged water-cooled industrial diesel',
    description:
      'Volvo Penta TWD1630P discontinued legacy D16 industrial diesel. Batch 08 already imported the generator-drive TWD1630G/GE rows; this P industrial sibling is separately validated by the D16 workshop manual and cross-reference data at 288 kW / 392 hp.',
  }),
  volvoD16({
    model: 'TWD1630V',
    series: 'Legacy D16 Industrial',
    power_kw: 288,
    rpm_rated: 1800,
    configuration: 'Inline-6, turbocharged water-cooled industrial diesel',
    description:
      'Volvo Penta TWD1630V discontinued legacy D16 industrial diesel. Volvo Penta workshop-manual pages name TWD1630V in the TWD1630 service family, and K MOTORSHOP cross-reference data lists 288 kW / 392 hp with 16.123 L displacement.',
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
  return `# Legacy Engine Model Discovery - Batch 18 Volvo D16

Date: 2026-08-11

## Result

- Source-validated Volvo Penta D16 legacy candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power kW | Displacement L | RPM |
| --- | --- | --- | --- | ---: | ---: | ---: |
${missing.map((row) =>
  `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.power_kw ?? ''} | ${row.displacement_l ?? ''} | ${row.rpm_rated ?? ''} |`
).join('\n')}

## Validation Sources

${SOURCES.map((source) => `- ${source.label}: ${source.url}`).join('\n')}

## Notes

- This batch is limited to older Volvo Penta D16 industrial and generator-drive rows; marine-only TAMD/TMD rows are intentionally excluded.
- TWD1630G and TWD1630GE were reviewed but intentionally excluded because batch 08 already imported those rows.
- Exact model identity is validated by Volvo Penta workshop-manual indexes; power and displacement values come from K MOTORSHOP cross-reference rows and MAHLE application listings.
- Volvo Penta's current industrial archive does not expose this older TAD/TWD1630-1631 service family, supporting discontinued/legacy treatment.
`
}

loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Volvo Penta D16 legacy batch`)

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
  console.log(`Imported ${data.length} validated legacy Volvo Penta D16 record(s).`)
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
