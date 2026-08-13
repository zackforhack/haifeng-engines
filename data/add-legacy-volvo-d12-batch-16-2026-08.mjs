// Add source-validated Volvo Penta D12 legacy industrial / genset models.
//
// Dry run:
//   set -a; source .env.local; node data/add-legacy-volvo-d12-batch-16-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/add-legacy-volvo-d12-batch-16-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-16-volvo-d12.md'

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

function volvoD12(row) {
  return clean({
    slug: `volvo-penta-${slugify(row.model)}`,
    brand: 'Volvo Penta',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    year_introduced: 2001,
    origin: 'Sweden',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: row.emissions_standard,
    certifications: row.certifications ?? [],
    power_kw: row.power_kw,
    power_hp: row.power_hp ?? (row.power_kw ? kwToHp(row.power_kw) : undefined),
    displacement_l: 12.13,
    cylinders: 6,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    compression_ratio: '17.5:1',
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
    label: 'Volvo Group D12 industrial launch release',
    url: 'https://www.volvogroup.com/en/news-and-media/news/2001/apr/news-20561.html',
  },
  {
    label: 'Manualzz Volvo Penta D12 workshop manual mirror',
    url: 'https://manualzz.com/doc/6324077/volvo-penta-tad1240-ge--tad1241-ge-ve--tad1242-ge-ve--twd...',
  },
  {
    label: 'ManualsLib Volvo Penta TAD1240GE installation manual index',
    url: 'https://www.manualslib.com/manual/4542784/Volvo-Penta-Tad1240ge.html',
  },
  {
    label: 'Manualzz Volvo Penta TAD1242GE technical description mirror',
    url: 'https://manualzz.com/doc/html/54992456/volvo-penta-tad1240ge--tad1242ve--twd1240ve-technical-des...',
  },
  {
    label: 'Scribd-indexed Volvo Penta TAD1241GE technical data',
    url: 'https://www.scribd.com/document/360166778/TAD1241GE-pdf',
  },
  {
    label: 'Scribd-indexed Volvo Penta TAD1241VE technical data',
    url: 'https://www.scribd.com/document/303570281/Engine-Datasheet',
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
  volvoD12({
    model: 'TAD1240GE',
    series: 'D12 Power Generation',
    power_kw: 310,
    rpm_rated: 1800,
    prime_power_kw_50hz: 260,
    standby_power_kw_60hz: 304,
    emissions_standard: 'EU off-road / TA-Luft / EPA-CARB Tier II',
    certifications: ['EU off-road', 'TA-Luft 1/2', 'EPA/CARB Tier II'],
    configuration: 'Inline-6, turbocharged air-to-air intercooled diesel genset engine with EDC III',
    description:
      'Volvo Penta TAD1240GE discontinued D12 generator-drive diesel. Volvo Group introduced the industrial D12 series in 2001 and listed TAD1240GE as one of three power-supply models; the same release gives 325 kVA prime at 50 Hz and 304 kWe standby at 60 Hz, while Volvo Penta workshop-manual pages cover TAD1240GE service and technical data.',
  }),
  volvoD12({
    model: 'TAD1241GE',
    series: 'D12 Power Generation',
    power_kw: 323,
    rpm_rated: 1800,
    prime_power_kw_50hz: 300,
    standby_power_kw_60hz: 352,
    emissions_standard: 'EU Stage 2 / TA-Luft / EPA-CARB Tier II',
    certifications: ['EU Stage 2', 'TA-Luft 1/2', 'EPA/CARB Tier II'],
    configuration: 'Inline-6, turbocharged air-to-air intercooled diesel genset engine with EDC III',
    description:
      'Volvo Penta TAD1241GE discontinued D12 generator-drive diesel. Volvo Group lists TAD1241GE in the 2001 D12 power-supply launch table at 375 kVA prime 50 Hz and 352 kWe standby 60 Hz; indexed Volvo Penta sales-guide material also identifies the exact TAD1241GE genset data sheet and 2005/2006 technical-data pages.',
  }),
  volvoD12({
    model: 'TAD1242GE',
    series: 'D12 Power Generation',
    power_kw: 352,
    rpm_rated: 1800,
    weight_kg: 1380,
    prime_power_kw_50hz: 352,
    standby_power_kw_50hz: 387,
    prime_power_kw_60hz: 391,
    standby_power_kw_60hz: 430,
    emissions_standard: 'EU Stage 2 / TA-Luft / EPA-CARB Tier II',
    certifications: ['EU Stage 2', 'TA-Luft 1/2', 'EPA/CARB Tier II'],
    configuration: 'Inline-6, turbocharged air-to-air intercooled diesel genset engine with EDC III',
    description:
      'Volvo Penta TAD1242GE discontinued D12 generator-drive diesel. Volvo Group introduced it with the 2001 D12 power-supply range, and the Volvo Penta technical-description mirror lists the exact TAD1242GE genset engine at 352 kW prime / 387 kW standby at 1500 rpm and 391 kW prime / 430 kW standby at 1800 rpm.',
  }),
  volvoD12({
    model: 'TAD1241VE',
    series: 'D12 Industrial VE',
    power_kw: 343,
    rpm_rated: 1800,
    weight_kg: 1350,
    emissions_standard: 'EU off-road / EPA-CARB Tier II',
    certifications: ['EU off-road', 'EPA/CARB Tier II'],
    configuration: 'Inline-6, turbocharged air-to-air intercooled industrial diesel with EDC III',
    description:
      'Volvo Penta TAD1241VE discontinued D12 industrial diesel. Volvo Penta workshop-manual pages list TAD1241GE/VE as standard D12 service variants, while indexed Volvo Penta Industrial Diesel Power 2003/2004 technical data identifies TAD1241VE ICFN power at 343 kW with 12.13 L displacement and 17.5:1 compression ratio.',
  }),
  volvoD12({
    model: 'TAD1242VE',
    series: 'D12 Industrial VE',
    power_kw: 383,
    rpm_rated: 1800,
    weight_kg: 1380,
    emissions_standard: 'EU off-road / EPA-CARB Tier II',
    certifications: ['EU off-road', 'EPA/CARB Tier II'],
    configuration: 'Inline-6, turbocharged air-to-air intercooled industrial diesel with EDC III',
    description:
      'Volvo Penta TAD1242VE discontinued D12 industrial diesel. Volvo Penta workshop-manual pages list TAD1242GE/VE as a standard D12 service variant with 12.13 L displacement; independent engine cross-reference listings align TAD1242VE with 383 kW / 521 hp and the D12 industrial parts ecosystem still lists the model for service components.',
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
  return `# Legacy Engine Model Discovery - Batch 16 Volvo D12

Date: 2026-08-11

## Result

- Source-validated Volvo Penta D12 legacy candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power kW | 50 Hz Prime/Standby kWm | 60 Hz Prime/Standby kWm | Displacement L | RPM |
| --- | --- | --- | --- | ---: | --- | --- | ---: | ---: |
${missing.map((row) =>
  `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.power_kw ?? ''} | ${row.prime_power_kw_50hz ?? ''}/${row.standby_power_kw_50hz ?? ''} | ${row.prime_power_kw_60hz ?? ''}/${row.standby_power_kw_60hz ?? ''} | ${row.displacement_l ?? ''} | ${row.rpm_rated ?? ''} |`
).join('\n')}

## Validation Sources

${SOURCES.map((source) => `- ${source.label}: ${source.url}`).join('\n')}

## Notes

- This batch is limited to Volvo Penta D12 industrial and power-generation engines; no marine propulsion-only rows are included.
- The official Volvo Group 2001 release validates the D12 industrial launch, TWD1240VE context, the TAD1240/1241/1242GE power-generation designations, ratings, and EPA/CARB Tier II / TA-Luft emissions context.
- Manualzz and ManualsLib mirrors validate the exact D12 service-manual coverage for TAD1240GE, TAD1241GE/VE, TAD1242GE/VE, and TWD1240VE.
- TAD1241GE, TAD1241VE, TAD1242GE, and TAD1242VE rating fields are cross-checked against indexed technical-data or engine cross-reference pages; fields are kept conservative where exact official rated-output tables were not publicly exposed.
- Volvo Penta's current industrial power-generation archive only lists later D5/D7 archive ranges in the browsed result, supporting legacy/discontinued treatment for these older D12 rows.
`
}

loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Volvo Penta D12 legacy batch`)

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
  console.log(`Imported ${data.length} validated legacy Volvo Penta D12 record(s).`)
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
