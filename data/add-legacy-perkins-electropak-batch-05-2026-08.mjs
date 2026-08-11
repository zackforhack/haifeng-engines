// Add source-validated Perkins legacy ElectropaK and industrial models.
//
// Dry run:
//   set -a; source .env.local; node data/add-legacy-perkins-electropak-batch-05-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/add-legacy-perkins-electropak-batch-05-2026-08.mjs --apply

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
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-05.md'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyPerkinsProbe/1.0; +https://engines.haifengmachinery.com)'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const kwToHp = (kw) => round1(kw / 0.7457)

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

function legacy(row) {
  return clean({
    slug: row.slug ?? `${slugify(row.brand)}-${slugify(row.model)}`,
    brand: row.brand,
    model: row.model,
    series: row.series,
    status: 'discontinued',
    year_introduced: row.year_introduced,
    year_discontinued: row.year_discontinued,
    origin: 'United Kingdom',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: row.emissions_standard ?? 'Unregulated',
    certifications: row.certifications ?? [],
    power_kw: row.power_kw,
    power_hp: row.power_hp ?? kwToHp(row.power_kw),
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    compression_ratio: row.compression_ratio,
    weight_kg: row.weight_kg,
    length_mm: row.length_mm,
    width_mm: row.width_mm,
    height_mm: row.height_mm,
    prime_power_kw_50hz: row.prime_power_kw_50hz,
    prime_power_kwe_50hz: row.prime_power_kwe_50hz,
    standby_power_kw_50hz: row.standby_power_kw_50hz,
    standby_power_kwe_50hz: row.standby_power_kwe_50hz,
    prime_power_kw_60hz: row.prime_power_kw_60hz,
    prime_power_kwe_60hz: row.prime_power_kwe_60hz,
    standby_power_kw_60hz: row.standby_power_kw_60hz,
    standby_power_kwe_60hz: row.standby_power_kwe_60hz,
    description:
      `${row.brand} ${row.model} discontinued legacy engine. ${row.use} `
      + 'Model identity and technical fields are taken from Perkins-era specification sheets archived by Diesel Parts Direct; legacy status is cross-checked against Perkins heritage material and parts-support references.',
  })
}

const RECORDS = [
  legacy({
    brand: 'Perkins',
    model: '3.1524',
    series: '3.152 Series',
    year_discontinued: 2005,
    power_kw: 30.5,
    displacement_l: 2.5,
    cylinders: 3,
    configuration: 'L3, naturally aspirated generator-drive diesel',
    rpm_rated: 1800,
    compression_ratio: '16.5:1',
    weight_kg: 311,
    length_mm: 940,
    width_mm: 620,
    height_mm: 846,
    prime_power_kw_50hz: 25,
    prime_power_kwe_50hz: 22,
    standby_power_kw_50hz: 27.5,
    standby_power_kwe_50hz: 24,
    prime_power_kw_60hz: 28,
    prime_power_kwe_60hz: 24.5,
    standby_power_kw_60hz: 31,
    standby_power_kwe_60hz: 27,
    use: 'The 3.1524 ElectropaK is a 3-cylinder generator-drive derivative of the long-running Perkins 3.152 lineage, useful for owners searching old small genset, farm, welder, pump, and parts applications.',
  }),
  legacy({
    brand: 'Perkins',
    model: '903-27',
    series: '900 Series',
    year_discontinued: 2005,
    power_kw: 34,
    displacement_l: 2.7,
    cylinders: 3,
    configuration: 'L3, naturally aspirated generator-drive diesel',
    rpm_rated: 1800,
    compression_ratio: '17.25:1',
    weight_kg: 341,
    length_mm: 966,
    width_mm: 616,
    height_mm: 863,
    prime_power_kw_60hz: 31.8,
    prime_power_kwe_60hz: 27.4,
    standby_power_kw_60hz: 35,
    standby_power_kwe_60hz: 30.3,
    use: 'The 903-27 is a 900 Series ElectropaK successor to the 3.152 lineage, with exact model-code traffic from older compact diesel genset and equipment owners.',
  }),
  legacy({
    brand: 'Perkins',
    model: '903-27T',
    series: '900 Series',
    year_discontinued: 2005,
    emissions_standard: 'Stage I Off-Highway',
    certifications: ['Stage I Off-Highway'],
    power_kw: 48,
    power_hp: 64.5,
    displacement_l: 2.7,
    cylinders: 3,
    configuration: 'L3, turbocharged industrial diesel',
    rpm_rated: 2250,
    compression_ratio: '17.25:1',
    weight_kg: 256,
    length_mm: 966,
    width_mm: 626,
    height_mm: 832,
    use: 'The turbocharged 903-27T is a discontinued 900 Series industrial/agricultural power-unit model, valuable for exact parts, rebuild, compressor, crane, and legacy equipment searches.',
  }),
  legacy({
    brand: 'Perkins',
    model: '1004TG1',
    series: '1000 Series',
    year_discontinued: 2014,
    power_kw: 69.5,
    displacement_l: 3.99,
    cylinders: 4,
    configuration: 'L4, turbocharged generator-drive diesel',
    rpm_rated: 1800,
    compression_ratio: '16:1',
    weight_kg: 433,
    length_mm: 1166,
    width_mm: 665,
    height_mm: 981,
    prime_power_kw_50hz: 60,
    prime_power_kwe_50hz: 52,
    standby_power_kw_50hz: 66,
    standby_power_kwe_50hz: 57.5,
    prime_power_kw_60hz: 66.5,
    prime_power_kwe_60hz: 56.5,
    standby_power_kw_60hz: 73,
    standby_power_kwe_60hz: 62,
    use: 'The 1004TG1 ElectropaK is a four-cylinder 1000 Series generator-drive model used in older 50 Hz and 60 Hz power-generation packages.',
  }),
  legacy({
    brand: 'Perkins',
    model: '1006-6TW',
    series: '1000 Series',
    year_discontinued: 2014,
    power_kw: 136,
    power_hp: 182.5,
    displacement_l: 6.0,
    cylinders: 6,
    configuration: 'L6, turbocharged water-to-air aftercooled industrial diesel',
    rpm_rated: 2600,
    compression_ratio: '16:1',
    weight_kg: 410,
    length_mm: 934,
    width_mm: 673,
    height_mm: 813,
    use: 'The 1006-6TW is a discontinued high-output 1000 Series industrial power-unit model; Perkins heritage material notes the 1006 also developed a reputation in unregulated generator-set and marine use.',
  }),
]

const pdfSource = (file) => `https://www.dieselpartsdirect.com/documents/perkins/${file}`

const DOCUMENTS = [
  {
    source: pdfSource('3.152.pdf'),
    storagePath: 'perkins/legacy/dpd-perkins-3-1524-electropak.pdf',
    label: 'Perkins 3.1524 ElectropaK Specification Sheet',
    slugs: ['perkins-3-1524'],
  },
  {
    source: pdfSource('900-series-34kw.pdf'),
    storagePath: 'perkins/legacy/dpd-perkins-903-27-electropak-34kw.pdf',
    label: 'Perkins 903-27 ElectropaK 34 kW Specification Sheet',
    slugs: ['perkins-903-27'],
  },
  {
    source: pdfSource('900-series-48kw.pdf'),
    storagePath: 'perkins/legacy/dpd-perkins-903-27t-industrial-48kw.pdf',
    label: 'Perkins 903-27T Industrial 48 kW Specification Sheet',
    slugs: ['perkins-903-27t'],
  },
  {
    source: pdfSource('1000-series-64kw.pdf'),
    storagePath: 'perkins/legacy/dpd-perkins-1004tg1-electropak-64kw.pdf',
    label: 'Perkins 1004TG1 ElectropaK 64 kW Specification Sheet',
    slugs: ['perkins-1004tg1'],
  },
  {
    source: pdfSource('1000-series-136kw.pdf'),
    storagePath: 'perkins/legacy/dpd-perkins-1006-6tw-industrial-136kw.pdf',
    label: 'Perkins 1006-6TW Industrial 136 kW Specification Sheet',
    slugs: ['perkins-1006-6tw'],
  },
]

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
  const tempDir = path.join(os.tmpdir(), 'haifeng-legacy-perkins-batch-05')
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
  return `# Legacy Engine Model Discovery - Batch 05

Date: 2026-08-11

## Result

- Source-validated Perkins legacy candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${docResult ? `- Datasheet links inserted: \`${docResult.linked}\`\n- Datasheet links skipped as existing: \`${docResult.skipped}\`\n` : ''}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Power kW | Displacement L | RPM | Source sheet |
| --- | --- | --- | ---: | ---: | ---: | --- |
${missing.map((row) => {
  const doc = DOCUMENTS.find((item) => item.slugs.includes(row.slug))
  return `| ${row.brand} | ${row.model} | ${row.series} | ${row.power_kw ?? ''} | ${row.displacement_l ?? ''} | ${row.rpm_rated ?? ''} | ${doc?.source ?? ''} |`
}).join('\n')}

## Validation Sources

- Diesel Parts Direct Perkins specification sheet index: https://www.dieselpartsdirect.com/perkins-specification-sheets
- Perkins official heritage article for the 3.152 and 4.236 lineage: https://www.perkins.com/en_GB/campaigns/powernews/global-focus/focus-on-perkins-heritage.html
- Perkins official heritage article for the 1006: https://www.perkins.com/en_GB/company/heritage/products/perkins-1006.html
- Perkins Long Service Club 3.152 / 900 Series production-history note: https://sites.google.com/view/perkinslongserviceclub/heritage-snippets/a-record-innings-p3-d3-152-900-series-engines
- Diesel Parts Direct 900 Series support page: https://www.dieselpartsdirect.com/perkins-900-series-engines

## Notes

- This batch intentionally avoids adding broad family rows where a more exact model already exists.
- \`3.152\` was not inserted as a vague family row; the source sheet is for the exact \`3.1524\` ElectropaK.
- \`4.236\`, \`6.3544\`, \`1006-6\`, and \`1006-6T\` were skipped because exact or more specific legacy rows were already present.
- Older 1100 Series rows from the same index were held back because they overlap heavily with active generator-drive records and need a separate current-vs-legacy review.
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
  console.log(`Imported ${data.length} validated legacy Perkins record(s).`)

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
