// Add source-validated Volvo Penta legacy industrial VE models.
//
// Dry run:
//   node data/add-legacy-volvo-industrial-ve-batch-14-2026-08.mjs
// Apply:
//   node data/add-legacy-volvo-industrial-ve-batch-14-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-14-volvo-industrial-ve.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-volvo-industrial-ve-batch-14-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyVolvoIndustrialVEProbe/1.0; +https://engines.haifengmachinery.com)'

const VOLVO_2001_LAUNCH = 'https://www.volvogroup.com/en/news-and-media/news/2001/apr/news-20559.html'
const VOLVO_TECH_MANUAL =
  'https://manualzz.com/doc/html/57476384/volvo-penta-tad530--tad531--tad730--tad731--tad732-worksh...'
const MANUALSLIB_TAD650 =
  'https://www.manualslib.com/manual/1622503/Volvo-Tad650ve.html'
const LECTURA_TAD660 =
  'https://www.lectura-specs.com/en/model/components/engines-volvo-penta/tad660ve-11703130'
const LECTURA_TAD750 =
  'https://www.lectura-specs.com/en/model/components/engines-volvo-penta/tad750ve-11703136'
const LECTURA_TAD760 =
  'https://www.lectura-specs.com/en/model/components/engines-volvo-penta/tad760ve-11703137'
const VOLVO_D5_CURRENT =
  'https://www.volvopenta.com/en-us/industrial/industrial-engines/off-road-engine-range/d5-eu-stage-v-epa-tier-4f/'

const SOURCE_URLS = [
  VOLVO_2001_LAUNCH,
  VOLVO_TECH_MANUAL,
  MANUALSLIB_TAD650,
  LECTURA_TAD660,
  LECTURA_TAD750,
  LECTURA_TAD760,
  VOLVO_D5_CURRENT,
]

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

function record(row) {
  return clean({
    slug: `volvo-penta-${slugify(row.model)}`,
    brand: 'Volvo Penta',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    year_introduced: row.year_introduced,
    year_discontinued: row.year_discontinued,
    origin: 'Sweden',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: row.emissions_standard,
    certifications: row.certifications ?? [],
    power_kw: row.power_kw,
    power_hp: row.power_hp ?? kwToHp(row.power_kw),
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    weight_kg: row.weight_kg,
    description: row.description,
  })
}

const RECORDS = [
  record({
    model: 'TD420VE',
    series: 'Early Volvo Penta 4-7 L Industrial',
    year_introduced: 2001,
    displacement_l: 4.04,
    cylinders: 4,
    power_kw: 74.9,
    power_hp: 102,
    rpm_rated: 2500,
    emissions_standard: 'Early off-road industrial emissions',
    configuration: 'Inline-4, turbocharged industrial diesel',
    description:
      'Volvo Penta TD420VE discontinued early-2000s industrial diesel. Volvo Group introduced the TD420VE/TAD420VE/TAD520VE/TAD620VE/TAD720VE/TAD721VE range in 2001 for mobile industrial applications, and current Volvo Penta D5 Stage V listings now represent the replacement generation.',
  }),
  record({
    model: 'TAD420VE',
    series: 'Early Volvo Penta 4-7 L Industrial',
    year_introduced: 2001,
    displacement_l: 4.04,
    cylinders: 4,
    power_kw: 103,
    power_hp: 140,
    rpm_rated: 2500,
    emissions_standard: 'Early off-road industrial emissions',
    configuration: 'Inline-4, turbocharged aftercooled industrial diesel',
    description:
      'Volvo Penta TAD420VE discontinued early-2000s industrial diesel. Volvo Group announced the T(A)D420VE family in 2001 with 103 kW at 2500 rpm and 493 Nm peak torque for mobile industrial applications.',
  }),
  record({
    model: 'TAD520VE',
    series: 'Early Volvo Penta 4-7 L Industrial',
    year_introduced: 2001,
    displacement_l: 4.8,
    cylinders: 4,
    power_kw: 118,
    power_hp: 160,
    rpm_rated: 2300,
    emissions_standard: 'Early off-road industrial emissions',
    configuration: 'Inline-4, turbocharged aftercooled industrial diesel',
    description:
      'Volvo Penta TAD520VE discontinued early-2000s industrial diesel. Volvo Group introduced the TAD520VE in 2001 as part of its expanded 4-7 liter industrial engine range, with 118 kW at 2300 rpm and 577 Nm peak torque.',
  }),
  record({
    model: 'TAD660VE',
    series: 'D6 Industrial VE',
    year_introduced: 2005,
    year_discontinued: 2019,
    displacement_l: 5.7,
    cylinders: 6,
    power_kw: 147,
    rpm_rated: 2300,
    weight_kg: 565,
    emissions_standard: 'EPA Tier 3',
    certifications: ['EPA Tier 3'],
    configuration: 'Inline-6, turbocharged industrial diesel',
    description:
      'Volvo Penta TAD660VE discontinued D6 industrial diesel. LECTURA lists the model as manufactured from 2005 to 2019, with 5.7 L displacement, 6 cylinders, 147 kW at 2300 rpm, 800 Nm torque, and 565 kg weight; Volvo workshop-manual indexes also name TAD660VE in the industrial engine technical-data set.',
  }),
  record({
    model: 'TAD750VE',
    series: 'D7 Industrial VE',
    year_introduced: 2007,
    year_discontinued: 2021,
    displacement_l: 7.15,
    cylinders: 6,
    power_kw: 200,
    rpm_rated: 2300,
    weight_kg: 650,
    emissions_standard: 'EU Stage III / EPA Tier 3',
    certifications: ['EU Stage III', 'EPA Tier 3'],
    configuration: 'Inline-6, turbocharged industrial diesel',
    description:
      'Volvo Penta TAD750VE discontinued D7 industrial diesel. LECTURA lists the model as manufactured from 2007 to 2021, with 7.15 L displacement, 6 cylinders, 200 kW at 2300 rpm, 1050 Nm torque, and 650 kg weight; Volvo workshop-manual indexes also cover TAD750VE.',
  }),
  record({
    model: 'TAD760VE',
    series: 'D7 Industrial VE',
    year_introduced: 2007,
    year_discontinued: 2021,
    displacement_l: 7.15,
    cylinders: 6,
    power_kw: 181,
    rpm_rated: 2300,
    weight_kg: 650,
    emissions_standard: 'EU Stage III / EPA Tier 3',
    certifications: ['EU Stage III', 'EPA Tier 3'],
    configuration: 'Inline-6, turbocharged industrial diesel',
    description:
      'Volvo Penta TAD760VE discontinued D7 industrial diesel. LECTURA lists the model as manufactured from 2007 to 2021, with 7.15 L displacement, 6 cylinders, 181 kW at 2300 rpm, 1100 Nm torque, and 650 kg weight; Volvo workshop-manual indexes also cover TAD760VE.',
  }),
]

function downloadAndCheck(url, fileName, tokens) {
  const localPath = path.join(TMP_DIR, fileName)
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '2',
    '--connect-timeout',
    '30',
    '--max-time',
    '120',
    '--user-agent',
    USER_AGENT,
    '--output',
    localPath,
    url,
  ], { maxBuffer: 20 * 1024 * 1024 })
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = tokens.filter((token) => !text.includes(token))
  if (missing.length) throw new Error(`${url}: missing validation token(s): ${missing.join(', ')}`)
}

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

function buildReport({ existingCount, missing, afterCount, legacyCount, legacyWithPdf }) {
  return `# Legacy Engine Model Discovery - Batch 14 Volvo Industrial VE

Date: 2026-08-11

## Result

- Source-validated Volvo Penta industrial VE candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${legacyCount == null ? '' : `- Legacy PDF/manual coverage after import: \`${legacyWithPdf}/${legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Power kW | Displacement L | RPM |
| --- | --- | --- | --- | ---: | ---: | ---: |
${missing.map((row) => `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.power_kw ?? ''} | ${row.displacement_l ?? ''} | ${row.rpm_rated ?? ''} |`).join('\n')}

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- This batch is limited to industrial/mobile VE rows, not marine TAMD/TMD models.
- The 2001 Volvo Group launch page directly names TD420VE, TAD420VE, and TAD520VE and gives their rated power, peak torque, rated speed, and displacement.
- LECTURA provides production windows ending in 2019/2021 for TAD660VE, TAD750VE, and TAD760VE, supporting discontinued status.
- Manualzz and ManualsLib workshop-manual pages cross-check the model family identity across TD/TAD420, TD/TAD520, TAD650/TAD660, TAD750, and TAD760 industrial manuals.
- TAD650VE was reviewed but deferred until a production-ended source is found; an old manual/parts catalog alone is not enough for this import threshold.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

downloadAndCheck(VOLVO_2001_LAUNCH, 'volvo-2001-launch.html', [
  'TD420VE',
  'TAD420VE',
  'TAD520VE',
  'TAD620VE',
  'TAD720VE',
  'TAD721VE',
])
const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Volvo Penta industrial VE legacy batch`)

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
const legacyWithPdf = legacyRows.filter((engine) => (engine.pdfs ?? []).length > 0).length

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({
  existingCount: RECORDS.length - missing.length,
  missing,
  afterCount: APPLY ? afterCount : null,
  legacyCount: APPLY ? legacyRows.length : null,
  legacyWithPdf: APPLY ? legacyWithPdf : null,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${legacyWithPdf}/${legacyRows.length}.`)
console.log(`Wrote ${REPORT_PATH}`)
