// Add source-validated Volvo Penta industrial / power-generation legacy TAD models.
//
// Dry run:
//   set -a; source .env.local; node data/add-legacy-volvo-industrial-tad-batch-07-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/add-legacy-volvo-industrial-tad-batch-07-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-07-volvo-industrial-tad.md'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyVolvoIndustrialProbe/1.0; +https://engines.haifengmachinery.com)'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const SOURCE_URLS = [
  'https://www.volvopenta.com/industrial/power-generation-engines/power-generation-engine-range/power-gen-product-archive/',
  'https://www.volvopenta.com/industrial/power-generation-engines/power-generation-engine-range/power-gen-product-archive/d5/',
  'https://www.volvopenta.com/industrial/power-generation-engines/power-generation-engine-range/power-gen-product-archive/d7/',
  'https://www.volvogroup.com/en/news-and-media/news/2001/apr/news-20559.html',
  'https://www.volvogroup.com/en/news-and-media/news/2004/mar/news-20734.html',
  'https://www.volspec.co.uk/power-generation-1500-rpm.php',
  'https://www.volspec.co.uk/power-generation-1800-rpm.php',
]

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalize(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function volvo(row) {
  return clean({
    slug: row.slug ?? `volvo-penta-${slugify(row.model)}`,
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
    power_hp: row.power_hp,
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    compression_ratio: row.compression_ratio,
    weight_kg: row.weight_kg,
    prime_power_kw_50hz: row.prime_power_kw_50hz,
    prime_power_kwe_50hz: row.prime_power_kwe_50hz,
    prime_power_kva_50hz: row.prime_power_kva_50hz,
    standby_power_kw_50hz: row.standby_power_kw_50hz,
    standby_power_kwe_50hz: row.standby_power_kwe_50hz,
    standby_power_kva_50hz: row.standby_power_kva_50hz,
    prime_power_kw_60hz: row.prime_power_kw_60hz,
    prime_power_kwe_60hz: row.prime_power_kwe_60hz,
    prime_power_kva_60hz: row.prime_power_kva_60hz,
    standby_power_kw_60hz: row.standby_power_kw_60hz,
    standby_power_kwe_60hz: row.standby_power_kwe_60hz,
    standby_power_kva_60hz: row.standby_power_kva_60hz,
    description:
      `Volvo Penta ${row.model} discontinued legacy industrial engine. ${row.detail} `
      + 'Model identity and legacy status were cross-validated against Volvo Penta industrial archive pages, Volvo Group launch material, and Volvo Penta dealer rating sheets.',
  })
}

function genset(row) {
  return volvo({
    ...row,
    configuration: row.configuration ?? `${row.cylinders === 4 ? 'L4' : 'L6'}, turbocharged air-to-air charge-cooled diesel genset engine`,
  })
}

const RECORDS = [
  genset({
    model: 'TAD530GE',
    series: 'D5 Power Generation',
    year_introduced: 2005,
    year_discontinued: 2023,
    power_kw: 85,
    power_hp: 115,
    displacement_l: 4.76,
    cylinders: 4,
    rpm_rated: 1500,
    compression_ratio: '18:1',
    weight_kg: 575,
    prime_power_kw_50hz: 74,
    prime_power_kwe_50hz: 68,
    prime_power_kva_50hz: 85,
    standby_power_kw_50hz: 83,
    standby_power_kwe_50hz: 76,
    standby_power_kva_50hz: 94,
    prime_power_kw_60hz: 75,
    prime_power_kwe_60hz: 70,
    prime_power_kva_60hz: 88,
    standby_power_kw_60hz: 85,
    standby_power_kwe_60hz: 77,
    standby_power_kva_60hz: 97,
    emissions_standard: 'EU Stage II / TA-luft',
    certifications: ['EU Stage II', 'TA-luft'],
    detail: 'Volvo Penta lists TAD530GE in the D5 power-generation product archive, with manufacturing years 2005-2023; the product bulletin gives 4.76 L, inline-four layout, and dual-speed generator ratings.',
  }),
  genset({
    model: 'TAD531GE',
    series: 'D5 Power Generation',
    year_introduced: 2005,
    year_discontinued: 2023,
    power_kw: 104,
    power_hp: 141,
    displacement_l: 4.76,
    cylinders: 4,
    rpm_rated: 1500,
    compression_ratio: '18:1',
    prime_power_kw_50hz: 88,
    prime_power_kwe_50hz: 80,
    prime_power_kva_50hz: 100,
    standby_power_kw_50hz: 98,
    standby_power_kwe_50hz: 87,
    standby_power_kva_50hz: 109,
    prime_power_kw_60hz: 93,
    prime_power_kwe_60hz: 84,
    prime_power_kva_60hz: 105,
    standby_power_kw_60hz: 104,
    standby_power_kwe_60hz: 92,
    standby_power_kva_60hz: 115,
    emissions_standard: 'EU Stage II / TA-luft',
    certifications: ['EU Stage II', 'TA-luft'],
    detail: 'Volvo Penta lists TAD531GE in the D5 power-generation product archive, and legacy rating sheets identify the 50 Hz and 60 Hz prime/standby ratings used by generator-packagers.',
  }),
  genset({
    model: 'TAD532GE',
    series: 'D5 Power Generation',
    year_introduced: 2005,
    year_discontinued: 2023,
    power_kw: 129,
    power_hp: 173,
    displacement_l: 4.76,
    cylinders: 4,
    rpm_rated: 1500,
    compression_ratio: '18:1',
    prime_power_kw_50hz: 112,
    prime_power_kwe_50hz: 104,
    prime_power_kva_50hz: 130,
    standby_power_kw_50hz: 125,
    standby_power_kwe_50hz: 114,
    standby_power_kva_50hz: 142,
    prime_power_kw_60hz: 115,
    prime_power_kwe_60hz: 106,
    prime_power_kva_60hz: 132,
    standby_power_kw_60hz: 129,
    standby_power_kwe_60hz: 117,
    standby_power_kva_60hz: 146,
    emissions_standard: 'EU Stage II / TA-luft',
    certifications: ['EU Stage II', 'TA-luft'],
    detail: 'Volvo Penta lists TAD532GE in the D5 power-generation product archive, and the legacy bulletin/rating tables support the 4.76 L inline-four generator-drive identity.',
  }),
  genset({
    model: 'TAD550GE',
    series: 'D5 Power Generation',
    year_introduced: 2005,
    year_discontinued: 2023,
    power_kw: 93,
    power_hp: 127,
    displacement_l: 5.1,
    cylinders: 4,
    rpm_rated: 1500,
    prime_power_kw_50hz: 76,
    prime_power_kwe_50hz: 69,
    prime_power_kva_50hz: 86,
    standby_power_kw_50hz: 85,
    standby_power_kwe_50hz: 77,
    standby_power_kva_50hz: 97,
    prime_power_kw_60hz: 84,
    prime_power_kwe_60hz: 76,
    prime_power_kva_60hz: 96,
    standby_power_kw_60hz: 93,
    standby_power_kwe_60hz: 85,
    standby_power_kva_60hz: 106,
    emissions_standard: 'EU Stage IIIA / EPA Tier 3',
    certifications: ['EU Stage IIIA', 'EPA Tier 3'],
    detail: 'Volvo Penta lists TAD550GE in the D5 archive family; D5 Stage IIIA material supports the 5.1 L inline-four platform and Volspec rating sheets provide the dual-speed generator figures.',
  }),
  genset({
    model: 'TAD551GE',
    series: 'D5 Power Generation',
    year_introduced: 2005,
    year_discontinued: 2023,
    power_kw: 111,
    power_hp: 152,
    displacement_l: 5.1,
    cylinders: 4,
    rpm_rated: 1500,
    prime_power_kw_50hz: 89,
    prime_power_kwe_50hz: 81,
    prime_power_kva_50hz: 101,
    standby_power_kw_50hz: 100,
    standby_power_kwe_50hz: 91,
    standby_power_kva_50hz: 114,
    prime_power_kw_60hz: 99,
    prime_power_kwe_60hz: 90,
    prime_power_kva_60hz: 113,
    standby_power_kw_60hz: 111,
    standby_power_kwe_60hz: 101,
    standby_power_kva_60hz: 126,
    emissions_standard: 'EU Stage IIIA / EPA Tier 3',
    certifications: ['EU Stage IIIA', 'EPA Tier 3'],
    detail: 'Volvo Penta lists TAD551GE in the D5 archive family; the 5.1 L D5 Stage IIIA platform and legacy rating sheets support the generator-drive specifications.',
  }),
  volvo({
    model: 'TAD620VE',
    series: 'TAD6 Industrial',
    year_introduced: 2001,
    power_kw: 155,
    power_hp: 211,
    displacement_l: 5.7,
    cylinders: 6,
    rpm_rated: 2500,
    configuration: 'L6, turbocharged charge-air-cooled industrial diesel',
    detail: 'Volvo Group announced TAD620VE in 2001 as part of Volvo Penta industrial engines for mobile machinery, listing 155 kW / 211 hp at 2500 rpm and 5.7 L displacement.',
  }),
  volvo({
    model: 'TAD720VE',
    series: 'TAD7 Industrial',
    year_introduced: 2001,
    power_kw: 174,
    power_hp: 237,
    displacement_l: 7.2,
    cylinders: 6,
    rpm_rated: 2300,
    configuration: 'L6, turbocharged charge-air-cooled industrial diesel',
    detail: 'Volvo Group announced TAD720VE in 2001 as a 7.2 L industrial engine for mobile applications, rated 174 kW / 237 hp at 2300 rpm.',
  }),
  volvo({
    model: 'TAD721VE',
    series: 'TAD7 Industrial',
    year_introduced: 2001,
    power_kw: 195,
    power_hp: 265,
    displacement_l: 7.2,
    cylinders: 6,
    rpm_rated: 2300,
    configuration: 'L6, turbocharged charge-air-cooled industrial diesel',
    detail: 'Volvo Group announced TAD721VE in 2001 as a 7.2 L industrial engine for mobile applications, rated 195 kW / 265 hp at 2300 rpm.',
  }),
  genset({
    model: 'TAD721GE',
    series: 'Early D7 Power Generation',
    year_introduced: 2004,
    power_kw: 197,
    power_hp: 264,
    displacement_l: 7.2,
    cylinders: 6,
    rpm_rated: 1500,
    prime_power_kva_50hz: 180,
    prime_power_kwe_60hz: 180,
    emissions_standard: 'TA-luft / EPA Tier 2',
    certifications: ['TA-luft', 'EPA Tier 2'],
    detail: 'Volvo Group announced TAD721GE in 2004 as an electronically controlled 7.2 L straight-six engine for electrical power generation, listing 180 kVA at 1500 rpm and 180 kWe at 1800 rpm.',
  }),
  genset({
    model: 'TAD722GE',
    series: 'Early D7 Power Generation',
    year_introduced: 2004,
    power_kw: 214,
    power_hp: 287,
    displacement_l: 7.2,
    cylinders: 6,
    rpm_rated: 1500,
    prime_power_kva_50hz: 200,
    prime_power_kwe_60hz: 200,
    emissions_standard: 'TA-luft / EPA Tier 2',
    certifications: ['TA-luft', 'EPA Tier 2'],
    detail: 'Volvo Group announced TAD722GE in 2004 as an electronically controlled 7.2 L straight-six engine for electrical power generation, listing 200 kVA at 1500 rpm and 200 kWe at 1800 rpm.',
  }),
  genset({
    model: 'TAD731GE',
    series: 'D7 Power Generation',
    year_introduced: 2008,
    year_discontinued: 2023,
    power_kw: 154,
    power_hp: 209,
    displacement_l: 7.2,
    cylinders: 6,
    rpm_rated: 1500,
    prime_power_kw_50hz: 133,
    prime_power_kwe_50hz: 121,
    prime_power_kva_50hz: 152,
    standby_power_kw_50hz: 148,
    standby_power_kwe_50hz: 133,
    standby_power_kva_50hz: 167,
    prime_power_kw_60hz: 138,
    prime_power_kwe_60hz: 129,
    prime_power_kva_60hz: 161,
    standby_power_kw_60hz: 154,
    standby_power_kwe_60hz: 142,
    standby_power_kva_60hz: 177,
    emissions_standard: 'EU Stage II / EPA Tier 2',
    certifications: ['EU Stage II', 'EPA Tier 2'],
    detail: 'Volvo Penta lists TAD731GE in the D7 power-generation product archive, with manufacturing years 2008-2023 and 7.2 L inline-six genset configuration.',
  }),
  genset({
    model: 'TAD732GE',
    series: 'D7 Power Generation',
    year_introduced: 2008,
    year_discontinued: 2023,
    power_kw: 197,
    power_hp: 268,
    displacement_l: 7.2,
    cylinders: 6,
    rpm_rated: 1500,
    prime_power_kw_50hz: 160,
    prime_power_kwe_50hz: 149,
    prime_power_kva_50hz: 186,
    standby_power_kw_50hz: 179,
    standby_power_kwe_50hz: 165,
    standby_power_kva_50hz: 206,
    prime_power_kw_60hz: 176,
    prime_power_kwe_60hz: 165,
    prime_power_kva_60hz: 206,
    standby_power_kw_60hz: 197,
    standby_power_kwe_60hz: 181,
    standby_power_kva_60hz: 227,
    emissions_standard: 'EU Stage II / EPA Tier 2',
    certifications: ['EU Stage II', 'EPA Tier 2'],
    detail: 'Volvo Penta lists TAD732GE in the D7 power-generation product archive; legacy rating sheets support the 50 Hz and 60 Hz generator-drive power data.',
  }),
  genset({
    model: 'TAD733GE',
    series: 'D7 Power Generation',
    year_introduced: 2008,
    year_discontinued: 2023,
    power_kw: 214,
    power_hp: 292,
    displacement_l: 7.2,
    cylinders: 6,
    rpm_rated: 1500,
    prime_power_kw_50hz: 175,
    prime_power_kwe_50hz: 161,
    prime_power_kva_50hz: 201,
    standby_power_kw_50hz: 195,
    standby_power_kwe_50hz: 179,
    standby_power_kva_50hz: 224,
    prime_power_kw_60hz: 192,
    prime_power_kwe_60hz: 177,
    prime_power_kva_60hz: 221,
    standby_power_kw_60hz: 214,
    standby_power_kwe_60hz: 197,
    standby_power_kva_60hz: 246,
    emissions_standard: 'EU Stage II / EPA Tier 2',
    certifications: ['EU Stage II', 'EPA Tier 2'],
    detail: 'Volvo Penta lists TAD733GE in the D7 power-generation product archive; dealer rating sheets and product pages also identify it as a 50/60/400 Hz-capable 7.2 L genset engine.',
  }),
  genset({
    model: 'TAD733GE 400 Hz',
    series: 'D7 Power Generation',
    year_introduced: 2008,
    year_discontinued: 2023,
    power_kw: 192,
    power_hp: 258,
    displacement_l: 7.2,
    cylinders: 6,
    rpm_rated: 2000,
    emissions_standard: 'EU Stage II / EPA Tier 2',
    certifications: ['EU Stage II', 'EPA Tier 2'],
    detail: 'Volvo Penta lists TAD733GE 400 Hz as an exact D7 archive variant; distributor pages cross-validate the 2000 rpm / 400 Hz configuration with 171 kWm prime and 192 kWm standby crankshaft ratings.',
  }),
  genset({
    model: 'TAD734GE',
    series: 'D7 Power Generation',
    year_introduced: 2008,
    year_discontinued: 2023,
    power_kw: 244,
    power_hp: 332,
    displacement_l: 7.2,
    cylinders: 6,
    rpm_rated: 1500,
    prime_power_kw_50hz: 217,
    prime_power_kwe_50hz: 202,
    prime_power_kva_50hz: 252,
    standby_power_kw_50hz: 239,
    standby_power_kwe_50hz: 222,
    standby_power_kva_50hz: 278,
    prime_power_kw_60hz: 222,
    prime_power_kwe_60hz: 206,
    prime_power_kva_60hz: 258,
    standby_power_kw_60hz: 244,
    standby_power_kwe_60hz: 227,
    standby_power_kva_60hz: 284,
    emissions_standard: 'EU Stage II / EPA Tier 2',
    certifications: ['EU Stage II', 'EPA Tier 2'],
    detail: 'Volvo Penta lists TAD734GE in the D7 power-generation product archive, and legacy rating sheets provide the 50 Hz and 60 Hz generator-drive ratings.',
  }),
]

const pdfSource = (id) => `https://www.volspec.co.uk/pdf-check.php?ID=${id}&TABLE=pg`

const DOCUMENTS = [
  ['TAD530GE', 2],
  ['TAD531GE', 3],
  ['TAD532GE', 4],
  ['TAD550GE', 5],
  ['TAD551GE', 6],
  ['TAD731GE', 9],
  ['TAD732GE', 10],
  ['TAD733GE', 11],
  ['TAD734GE', 12],
].map(([model, id]) => ({
  source: pdfSource(id),
  storagePath: `volvo/legacy/industrial-tad/${slugify(model)}-volspec-product-bulletin.pdf`,
  label: `Volvo Penta ${model} Legacy Genset Product Bulletin`,
  slugs: [`volvo-penta-${slugify(model)}`],
}))

async function fetchAllEngines() {
  const engines = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, brand, model, slug')
      .range(from, from + 999)
    if (error) throw error
    engines.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return engines
}

function downloadPdf(url, localPath) {
  execFileSync('curl', [
    '-L',
    '--fail',
    '--silent',
    '--show-error',
    '--max-time',
    '60',
    '-A',
    USER_AGENT,
    url,
    '-o',
    localPath,
  ])
  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 100_000 || !buffer.subarray(0, 4).equals(Buffer.from('%PDF'))) {
    throw new Error(`Downloaded file is not a usable PDF: ${url}`)
  }
}

async function attachDocuments(engineBySlug) {
  const tempDir = path.join(os.tmpdir(), 'haifeng-legacy-volvo-industrial-tad-batch-07')
  fs.mkdirSync(tempDir, { recursive: true })
  let linked = 0
  let skipped = 0

  for (const doc of DOCUMENTS) {
    const localPath = path.join(tempDir, path.basename(doc.storagePath))
    downloadPdf(doc.source, localPath)
    const upload = await uploadPdf(supabase, BUCKET, localPath, doc.storagePath)
    if (!upload.ok) throw new Error(`Failed to upload ${doc.storagePath}`)

    for (const slug of doc.slugs) {
      const engine = engineBySlug.get(slug)
      if (!engine) throw new Error(`Missing engine for document slug ${slug}`)
      const { data: existing, error: existingError } = await supabase
        .from('engine_pdfs')
        .select('engine_id')
        .eq('engine_id', engine.id)
        .eq('storage_path', doc.storagePath)
      if (existingError) throw existingError
      if (existing?.length) {
        skipped += 1
        continue
      }
      const { error } = await supabase.from('engine_pdfs').insert({
        engine_id: engine.id,
        type: 'datasheet',
        label: doc.label,
        storage_path: doc.storagePath,
        file_size_bytes: fs.statSync(localPath).size,
      })
      if (error) throw error
      linked += 1
    }
  }

  return { linked, skipped }
}

function buildReport({ existingCount, missing, afterCount, docResult }) {
  return `# Legacy Engine Model Discovery - Batch 07 Volvo Industrial TAD

Date: 2026-08-11

## Result

- Source-validated Volvo Penta industrial TAD candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${docResult ? `- Datasheet links inserted: \`${docResult.linked}\`\n- Datasheet links skipped as existing: \`${docResult.skipped}\`\n` : ''}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Power kW | 50 Hz Prime/Standby kWm | 60 Hz Prime/Standby kWm | Displacement L | Cylinders |
| --- | --- | --- | ---: | --- | --- | ---: | ---: |
${missing.map((row) =>
  `| ${row.brand} | ${row.model} | ${row.series} | ${row.power_kw ?? ''} | ${row.prime_power_kw_50hz ?? ''}/${row.standby_power_kw_50hz ?? ''} | ${row.prime_power_kw_60hz ?? ''}/${row.standby_power_kw_60hz ?? ''} | ${row.displacement_l ?? ''} | ${row.cylinders ?? ''} |`
).join('\n')}

## Datasheet Attachments

${DOCUMENTS.map((doc) => `- ${doc.label}: ${doc.source}`).join('\n')}

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- This is the corrected Volvo legacy batch: industrial and power-generation TAD models only, not Volvo Penta marine propulsion engines.
- D5 and D7 archive status comes from Volvo Penta's official industrial power-generation product archive.
- TAD620VE, TAD720VE, and TAD721VE come from Volvo Group's 2001 industrial-engine launch release.
- TAD721GE and TAD722GE come from Volvo Group's 2004 electrical-power-generation launch release.
- Legacy PDF bulletins were attached only where the Volspec source redirected to a validated PDF.
`
}

const existing = await fetchAllEngines()
const existingKeys = new Set(
  existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`),
)
const missing = RECORDS.filter(
  (record) => !existingKeys.has(`${record.brand}::${normalize(record.model)}`),
)

console.log(`Candidates: ${RECORDS.length}`)
console.log(`Already present: ${RECORDS.length - missing.length}`)
console.log(`Missing/new: ${missing.length}`)
for (const record of missing) console.log(`${record.brand}\t${record.model}\t${record.slug}`)

let docResult = null
if (APPLY && missing.length) {
  const { data, error } = await supabase
    .from('engines')
    .upsert(missing, { onConflict: 'slug' })
    .select('id, brand, model, slug')
  if (error) throw error
  console.log(`Imported ${data.length} validated legacy Volvo industrial TAD record(s).`)

  const refreshed = await fetchAllEngines()
  const engineBySlug = new Map(refreshed.map((engine) => [engine.slug, engine]))
  docResult = await attachDocuments(engineBySlug)
  console.log(`Linked ${docResult.linked} datasheet(s); skipped ${docResult.skipped}.`)
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({
  existingCount: RECORDS.length - missing.length,
  missing,
  afterCount: APPLY ? afterCount : null,
  docResult,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
