// Add source-validated Volvo Penta legacy D10/D12 industrial and genset models.
//
// Dry run:
//   set -a; source .env.local; node data/add-legacy-volvo-d10-d12-batch-17-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/add-legacy-volvo-d10-d12-batch-17-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-17-volvo-d10-d12.md'

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

function volvoLegacy(row) {
  return clean({
    slug: `volvo-penta-${slugify(row.model)}`,
    brand: 'Volvo Penta',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    year_introduced: row.year_introduced,
    origin: 'Sweden',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: row.emissions_standard,
    certifications: row.certifications ?? [],
    power_kw: row.power_kw,
    power_hp: row.power_hp ?? (row.power_kw ? kwToHp(row.power_kw) : undefined),
    displacement_l: row.displacement_l,
    cylinders: 6,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    compression_ratio: row.compression_ratio,
    weight_kg: row.weight_kg,
    prime_power_kw_50hz: row.prime_power_kw_50hz,
    standby_power_kw_50hz: row.standby_power_kw_50hz,
    prime_power_kw_60hz: row.prime_power_kw_60hz,
    standby_power_kw_60hz: row.standby_power_kw_60hz,
    description: row.description,
  })
}

const SOURCES = [
  {
    label: 'Volvo Group TAD1032GE power-generation release',
    url: 'https://www.volvogroup.com/en/news-and-media/news/2002/jan/news-20587.html',
  },
  {
    label: 'ManualsLib Volvo Penta TD/TAD/TWD 10-liter workshop manual index',
    url: 'https://www.manualslib.es/manual/298480/Volvo-Penta-Td1030Me.html?page=128',
  },
  {
    label: 'PDFCoffee Volvo Penta 10-liter service and technical-data mirror',
    url: 'https://pdfcoffee.com/tad740-1032-1630-1631-amp-twd740-1210-1232-1630-pdf-free.html',
  },
  {
    label: 'Manualzz Volvo Penta D12 workshop manual mirror',
    url: 'https://manualzz.com/doc/6324077/volvo-penta-tad1240-ge--tad1241-ge-ve--tad1242-ge-ve--twd...',
  },
  {
    label: 'Manualzz Volvo Penta D12 technical-description mirror',
    url: 'https://manualzz.com/doc/html/54992456/volvo-penta-tad1240ge--tad1242ve--twd1240ve-technical-des...',
  },
  {
    label: 'K MOTORSHOP Volvo Penta engine cross-reference list',
    url: 'https://www.kmotorshop.com/en/device/motor-list/5051',
  },
  {
    label: 'Volvo Penta industrial power generation product archive',
    url: 'https://www.volvopenta.com/en-us/industrial/power-generation-engines/power-generation-engine-range/power-gen-product-archive/',
  },
]

const RECORDS = [
  volvoLegacy({
    model: 'TAD1030GE',
    series: 'Legacy D10 Power Generation',
    displacement_l: 9.6,
    rpm_rated: 1500,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged aftercooled diesel generator engine',
    description:
      'Volvo Penta TAD1030GE discontinued legacy D10 generator-drive diesel. Volvo Penta workshop-manual indexes and mirrored technical-data pages identify TAD1030GE in the TD/TAD/TWD 10-liter industrial service family alongside TAD1031GE, TAD1032GE, TWD1031VE, and TWD1032VE; the current Volvo Penta archive does not list this older D10 family.',
  }),
  volvoLegacy({
    model: 'TAD1031G',
    series: 'Legacy D10 Power Generation',
    displacement_l: 9.6,
    rpm_rated: 1500,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged aftercooled diesel generator engine',
    description:
      'Volvo Penta TAD1031G discontinued legacy D10 generator-drive diesel. The Volvo Penta TD/TAD/TWD 10-liter service-manual index names TAD1031G/GE variants in the industrial engine family; power fields are intentionally left blank until an exact rating table is linked.',
  }),
  volvoLegacy({
    model: 'TAD1031GE',
    series: 'Legacy D10 Power Generation',
    displacement_l: 9.6,
    rpm_rated: 1500,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged aftercooled diesel generator engine',
    description:
      'Volvo Penta TAD1031GE discontinued legacy D10 generator-drive diesel. Volvo Penta workshop-manual indexes and mirrored technical-data pages list TAD1031GE with the older 10-liter industrial service family; it is retained as a conservative model-identity row pending exact public rating-sheet attachment.',
  }),
  volvoLegacy({
    model: 'TAD1032GE',
    series: 'Legacy D10 Power Generation',
    year_introduced: 2002,
    power_kw: 235,
    displacement_l: 9.6,
    rpm_rated: 1800,
    emissions_standard: 'EPA Tier 2',
    certifications: ['EPA Tier 2'],
    configuration: 'Inline-6, turbocharged aftercooled diesel generator engine',
    description:
      'Volvo Penta TAD1032GE discontinued legacy D10 generator-drive diesel. Volvo Group announced TAD1032GE in 2002 for electrical power generation as a 10-liter six-cylinder engine rated 235 kW at 1800 rpm with EPA Tier 2 compliance; Volvo Penta 10-liter service manuals cross-list the exact model.',
  }),
  volvoLegacy({
    model: 'TAD1230G',
    series: 'Legacy D12 Power Generation',
    power_kw: 294,
    displacement_l: 11.98,
    rpm_rated: 1500,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged aftercooled diesel generator engine',
    description:
      'Volvo Penta TAD1230G discontinued legacy D12 generator-drive diesel. Volvo Penta D12 service-manual mirrors and engine cross-reference listings place TAD1230G in the older 12-liter industrial/genset family, with 294 kW / 400 hp and 11.98 L displacement listed in the parts ecosystem.',
  }),
  volvoLegacy({
    model: 'TAD1230GE',
    series: 'Legacy D12 Power Generation',
    power_kw: 294,
    displacement_l: 11.98,
    rpm_rated: 1500,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged aftercooled diesel generator engine',
    description:
      'Volvo Penta TAD1230GE discontinued legacy D12 generator-drive diesel. Volvo Penta D12 service-manual mirrors and engine cross-reference lists identify TAD1230GE in the older 12-liter power-generation family at 294 kW / 400 hp and 11.98 L displacement; this row is kept separate from the later TAD1240/1241/1242GE EDC III generation.',
  }),
  volvoLegacy({
    model: 'TAD1230P',
    series: 'Legacy D12 Power Generation',
    power_kw: 294,
    displacement_l: 11.98,
    rpm_rated: 1500,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged aftercooled diesel generator engine',
    description:
      'Volvo Penta TAD1230P discontinued legacy D12 diesel. D12 manual-family sources and cross-reference listings identify TAD1230P alongside TAD1230G/GE/V variants, with 294 kW / 400 hp and 11.98 L displacement in the service-parts ecosystem.',
  }),
  volvoLegacy({
    model: 'TAD1230V',
    series: 'Legacy D12 Industrial',
    power_kw: 295,
    displacement_l: 11.98,
    rpm_rated: 2100,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged aftercooled industrial diesel',
    description:
      'Volvo Penta TAD1230V discontinued legacy D12 industrial diesel. Cross-reference listings identify TAD1230V with 295 kW / 401 hp and 11.98 L displacement, and D12 manual-family mirrors validate the surrounding legacy Volvo Penta 12-liter industrial service family.',
  }),
  volvoLegacy({
    model: 'TAD1231GE',
    series: 'Legacy D12 Power Generation',
    power_kw: 260,
    displacement_l: 11.98,
    rpm_rated: 1500,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged aftercooled diesel generator engine',
    description:
      'Volvo Penta TAD1231GE discontinued legacy D12 generator-drive diesel. Manual and cross-reference sources list TAD1231GE as an older D12 power-generation model, and independent engine lists align the model with 260 kW / 354 hp output.',
  }),
  volvoLegacy({
    model: 'TAD1232GE',
    series: 'Legacy D12 Power Generation',
    power_kw: 300,
    displacement_l: 11.98,
    rpm_rated: 1500,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged aftercooled diesel generator engine',
    description:
      'Volvo Penta TAD1232GE discontinued legacy D12 generator-drive diesel. Volvo Penta service-manual mirrors cross-list TAD1232GE with the D12 industrial/genset family, and engine cross-reference listings align the model with 300 kW / 408 hp output.',
  }),
  volvoLegacy({
    model: 'TWD1210V',
    series: 'Legacy D12 Industrial',
    power_kw: 193,
    displacement_l: 11.98,
    rpm_rated: 2100,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged water-cooled industrial diesel',
    description:
      'Volvo Penta TWD1210V discontinued legacy D12 industrial diesel. Batch 08 already imported the generator-drive TWD1210G row; this V industrial variant is separately validated by Volvo Penta service-manual family coverage and cross-reference listings at 193 kW / 262 hp with 11.98 L displacement.',
  }),
  volvoLegacy({
    model: 'TWD1211V',
    series: 'Legacy D12 Industrial',
    power_kw: 232,
    displacement_l: 11.98,
    rpm_rated: 2100,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged water-cooled industrial diesel',
    description:
      'Volvo Penta TWD1211V discontinued legacy D12 industrial diesel. Batch 08 already imported the generator-drive TWD1211G row; this V industrial variant is separately validated by service-manual family coverage and cross-reference listings at 232 kW / 315 hp with 11.98 L displacement.',
  }),
  volvoLegacy({
    model: 'TWD1230V',
    series: 'Legacy D12 Industrial',
    power_kw: 295,
    displacement_l: 11.98,
    rpm_rated: 2100,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged water-cooled industrial diesel',
    description:
      'Volvo Penta TWD1230V discontinued legacy D12 industrial diesel. Volvo Penta service-manual mirrors and cross-reference listings place TWD1230V in the older 12-liter industrial family at 295 kW / 401 hp and 11.98 L displacement.',
  }),
  volvoLegacy({
    model: 'TWD1230VE',
    series: 'Legacy D12 Industrial VE',
    power_kw: 295,
    displacement_l: 11.98,
    rpm_rated: 2100,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged water-cooled industrial diesel',
    description:
      'Volvo Penta TWD1230VE discontinued legacy D12 industrial diesel. Volvo Penta service-manual mirrors and cross-reference lists group TWD1230VE with older TWD123x industrial engines at 295 kW / 401 hp and 11.98 L displacement.',
  }),
  volvoLegacy({
    model: 'TWD1231VE',
    series: 'Legacy D12 Industrial VE',
    power_kw: 247,
    displacement_l: 11.98,
    rpm_rated: 2100,
    emissions_standard: 'Legacy pre-current industrial emissions',
    configuration: 'Inline-6, turbocharged water-cooled industrial diesel',
    description:
      'Volvo Penta TWD1231VE discontinued legacy D12 industrial diesel. Volvo Penta service-manual mirrors and engine cross-reference lists identify TWD1231VE in the legacy industrial D12 family, with cross-reference output listed at 247 kW / 335 hp.',
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
  return `# Legacy Engine Model Discovery - Batch 17 Volvo D10/D12

Date: 2026-08-11

## Result

- Source-validated Volvo Penta D10/D12 legacy candidates reviewed: \`${RECORDS.length}\`
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

- This batch is limited to Volvo Penta industrial and generator-drive D10/D12 rows; no marine propulsion-only TAMD/TMD rows are included.
- TWD1210G and TWD1211G were reviewed but intentionally excluded because batch 08 already added those rows; the V/VE industrial siblings are included here as separate legacy owner-search targets.
- TAD1032GE has official Volvo Group launch evidence for exact model, 10-liter displacement, 235 kW at 1800 rpm, and EPA Tier 2 context.
- TAD1030GE, TAD1031G, and TAD1031GE are model-identity rows backed by Volvo Penta workshop/service-manual indexes; rating fields remain blank until exact public rating tables are attached.
- D12 power and displacement values come from cross-reference listings and manual-family validation; TAD1230G/GE/P/V, TAD1231GE, TAD1232GE, TWD1210V, TWD1211V, TWD1230V/VE, and TWD1231VE are treated as separate legacy owner-search targets.
`
}

loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Volvo Penta D10/D12 legacy batch`)

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
  console.log(`Imported ${data.length} validated legacy Volvo Penta record(s).`)
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
