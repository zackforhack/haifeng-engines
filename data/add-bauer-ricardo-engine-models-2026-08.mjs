// Import Bauer Generator-discovered Ricardo generator-drive engine models.
//
// Dry run:
//   set -a; source .env.local; node data/add-bauer-ricardo-engine-models-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/add-bauer-ricardo-engine-models-2026-08.mjs --apply

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
const REPORT_PATH = 'reports/bauer-generator-probe-2026-08-05.md'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengBauerProbe/1.0; +https://engines.haifengmachinery.com)'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const kwToHp = (kw) => round1(kw / 0.7457)

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function normalize(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function ricardo(row) {
  const slug = `ricardo-${slugify(row.model)}`
  return clean({
    slug,
    brand: 'Ricardo',
    model: row.model,
    series: row.series,
    status: 'active',
    origin: 'China',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'Unregulated',
    certifications: [],
    power_kw: row.power_kw,
    power_hp: kwToHp(row.power_kw),
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: `L${row.cylinders}, generator-drive diesel`,
    rpm_rated: 1500,
    compression_ratio: row.compression_ratio,
    prime_power_kw_50hz: row.power_kw,
    standby_power_kw_50hz: row.standby_power_kw_50hz,
    description:
      `Ricardo ${row.model} generator-drive diesel engine validated from Bauer Generator GFS technical datasheets. `
      + `Bauer lists the engine as ${row.model}/${row.power_kw}KW with ${row.cylinders} inline cylinders, `
      + `${row.displacement_l} L displacement, 1500 rpm speed, diesel fuel, liquid cooling, and Non Emission Certified labeling.`,
  })
}

const ENGINES = [
  ricardo({
    model: 'ZH490D',
    series: 'ZH490 Series',
    power_kw: 22,
    standby_power_kw_50hz: 24.2,
    displacement_l: 2.54,
    cylinders: 4,
    compression_ratio: '17:1',
  }),
  ricardo({
    model: 'ZH4100D',
    series: 'ZH4100 Series',
    power_kw: 30.1,
    standby_power_kw_50hz: 33.1,
    displacement_l: 3.61,
    cylinders: 4,
    compression_ratio: '19:1',
  }),
  ricardo({
    model: 'ZH4102ZD',
    series: 'ZH4100 Series',
    power_kw: 44,
    standby_power_kw_50hz: 48.4,
    displacement_l: 3.76,
    cylinders: 4,
    compression_ratio: '17:1',
  }),
  ricardo({
    model: 'ZH4105ZD',
    series: 'ZH4105 Series',
    power_kw: 56,
    standby_power_kw_50hz: 61.6,
    displacement_l: 4.15,
    cylinders: 4,
    compression_ratio: '18:1',
  }),
  ricardo({
    model: 'ZH6105ZLD',
    series: 'ZH6105 Series',
    power_kw: 100,
    standby_power_kw_50hz: 110,
    displacement_l: 6.49,
    cylinders: 6,
    compression_ratio: '16:1',
  }),
  ricardo({
    model: 'ZH6105AZLD',
    series: 'ZH6105 Series',
    power_kw: 110,
    standby_power_kw_50hz: 121,
    displacement_l: 6.75,
    cylinders: 6,
    compression_ratio: '16:1',
  }),
  ricardo({
    model: 'ZH6105IZLD',
    series: 'ZH6105 Series',
    power_kw: 132,
    standby_power_kw_50hz: 145.2,
    displacement_l: 7.02,
    cylinders: 6,
    compression_ratio: '16:1',
  }),
]

const bauerPdf = (file) => `https://bauer-generator.de/wp-content/uploads/2023/04/${file}`

const DOCUMENTS = [
  {
    source: bauerPdf('GFS-12-ATS-DATA-de.pdf'),
    storagePath: 'ricardo/bauer-gfs/gfs-12-ats-data-de.pdf',
    label: 'Bauer GFS-12 ATS Datasheet (Ricardo ZH490D)',
    slugs: ['ricardo-zh490d'],
    expected: ['ZH490D'],
  },
  {
    source: bauerPdf('GFS-16-ATS-DATA-de.pdf'),
    storagePath: 'ricardo/bauer-gfs/gfs-16-ats-data-de.pdf',
    label: 'Bauer GFS-16 ATS Datasheet (Ricardo ZH490D)',
    slugs: ['ricardo-zh490d'],
    expected: ['ZH490D'],
  },
  {
    source: bauerPdf('GFS-24-ATS-DATA-de.pdf'),
    storagePath: 'ricardo/bauer-gfs/gfs-24-ats-data-de.pdf',
    label: 'Bauer GFS-24 ATS Datasheet (Ricardo ZH4100D)',
    slugs: ['ricardo-zh4100d'],
    expected: ['ZH4100D'],
  },
  {
    source: bauerPdf('GFS-40-ATS-DATA-de.pdf'),
    storagePath: 'ricardo/bauer-gfs/gfs-40-ats-data-de.pdf',
    label: 'Bauer GFS-40 ATS Datasheet (Ricardo ZH4102ZD)',
    slugs: ['ricardo-zh4102zd'],
    expected: ['ZH4102ZD'],
  },
  {
    source: bauerPdf('GFS-50-ATS-DATA-de.pdf'),
    storagePath: 'ricardo/bauer-gfs/gfs-50-ats-data-de.pdf',
    label: 'Bauer GFS-50 ATS Datasheet (Ricardo ZH4105ZD)',
    slugs: ['ricardo-zh4105zd'],
    expected: ['ZH4105ZD'],
  },
  {
    source: bauerPdf('GFS-80-ATS-DATA-de.pdf'),
    storagePath: 'ricardo/bauer-gfs/gfs-80-ats-data-de.pdf',
    label: 'Bauer GFS-80 ATS Datasheet (Ricardo ZH6105ZLD)',
    slugs: ['ricardo-zh6105zld'],
    expected: ['ZH6105ZLD'],
  },
  {
    source: bauerPdf('GFS-90-ATS-DATA-de.pdf'),
    storagePath: 'ricardo/bauer-gfs/gfs-90-ats-data-de.pdf',
    label: 'Bauer GFS-90 ATS Datasheet (Ricardo ZH6105AZLD)',
    slugs: ['ricardo-zh6105azld'],
    expected: ['ZH6105AZLD'],
  },
  {
    source: bauerPdf('GFS-120-ATS-DATA-de-1.pdf'),
    storagePath: 'ricardo/bauer-gfs/gfs-120-ats-data-de.pdf',
    label: 'Bauer GFS-120 ATS Datasheet (Ricardo ZH6105IZLD)',
    slugs: ['ricardo-zh6105izld'],
    expected: ['ZH6105IZLD'],
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

function downloadPdf(source, localPath) {
  execFileSync(
    'curl',
    ['-L', '--fail', '--silent', '--show-error', '-A', USER_AGENT, '-o', localPath, source],
    { stdio: 'pipe', maxBuffer: 10 * 1024 * 1024 },
  )
}

function assertPdfContains(localPath, expected) {
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  })
  const missing = expected.filter((token) => !text.includes(token))
  if (missing.length) {
    throw new Error(`${path.basename(localPath)} did not contain expected token(s): ${missing.join(', ')}`)
  }
}

async function attachDocuments(engineBySlug) {
  const tempDir = path.join(os.tmpdir(), 'haifeng-bauer-ricardo-pdfs')
  fs.mkdirSync(tempDir, { recursive: true })
  let linked = 0
  let skipped = 0

  for (const doc of DOCUMENTS) {
    const localPath = path.join(tempDir, path.basename(doc.storagePath))
    downloadPdf(doc.source, localPath)
    assertPdfContains(localPath, doc.expected)

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

function buildReport({ existing, missing, afterCount, docResult }) {
  return `# Bauer Generator Probe

Date: 2026-08-05

Source site: https://bauer-generator.de/

## Result

- Public WordPress sitemap checked: https://bauer-generator.de/page-sitemap.xml
- Public media API checked: https://bauer-generator.de/wp-json/wp/v2/media?search=pdf&per_page=100
- Exact Ricardo engine models found in Bauer GFS datasheet PDFs: \`${ENGINES.length}\`
- Already present before import: \`${existing.length}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}
${docResult == null ? '' : `- Bauer PDF datasheet links inserted: \`${docResult.linked}\`\n- Bauer PDF links already present: \`${docResult.skipped}\`\n`}
## Added / Planned Rows

| Brand | Model | Source generator datasheet | Power kW | Displacement L | Cylinders | RPM |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Ricardo | ZH490D | GFS-12 / GFS-16 | 22 | 2.54 | 4 | 1500 |
| Ricardo | ZH4100D | GFS-24 | 30.1 | 3.61 | 4 | 1500 |
| Ricardo | ZH4102ZD | GFS-40 | 44 | 3.76 | 4 | 1500 |
| Ricardo | ZH4105ZD | GFS-50 | 56 | 4.15 | 4 | 1500 |
| Ricardo | ZH6105ZLD | GFS-80 | 100 | 6.49 | 6 | 1500 |
| Ricardo | ZH6105AZLD | GFS-90 | 110 | 6.75 | 6 | 1500 |
| Ricardo | ZH6105IZLD | GFS-120 | 132 | 7.02 | 6 | 1500 |

## Quality Notes

- The GFS-6 and GFS-8 datasheets were intentionally not imported as engine models because Bauer gives only an 8 kW one-cylinder diesel description, not an exact engine model.
- Each linked Bauer PDF is text-validated before upload by checking that it contains the expected Ricardo engine model string.
- Bauer labels these engines as Non Emission Certified; database rows normalize that to \`Unregulated\`.
- Independent web cross-checks found the same Ricardo/Weifang model family and matching displacement/power ranges for ZH490, ZH4100/ZH4105, and ZH6105 variants.
`
}

const existingEngines = await fetchAllEngines()
const existingKeys = new Set(
  existingEngines.map((engine) => `${engine.brand}::${normalize(engine.model)}`),
)
const existing = ENGINES.filter((engine) => existingKeys.has(`${engine.brand}::${normalize(engine.model)}`))
const missing = ENGINES.filter((engine) => !existingKeys.has(`${engine.brand}::${normalize(engine.model)}`))

console.log(`Bauer Ricardo candidates: ${ENGINES.length}`)
console.log(`Already present: ${existing.length}`)
console.log(`Missing/new: ${missing.length}`)
for (const engine of missing) console.log(`${engine.brand}\t${engine.model}\t${engine.slug}`)

if (!APPLY) {
  const report = buildReport({ existing, missing, afterCount: null, docResult: null })
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, report)
  console.log('\nDry run only. Re-run with --apply to insert missing rows and attach PDFs.')
  console.log(`Wrote ${REPORT_PATH}`)
  process.exit(0)
}

if (missing.length) {
  const { data, error } = await supabase
    .from('engines')
    .upsert(missing, { onConflict: 'slug' })
    .select('brand, model, slug')
  if (error) throw error
  console.log(`Imported ${data.length} Bauer/Ricardo engine records.`)
}

const slugList = ENGINES.map((engine) => engine.slug)
const { data: savedEngines, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugList)
if (savedError) throw savedError
const engineBySlug = new Map(savedEngines.map((engine) => [engine.slug, engine]))
const docResult = await attachDocuments(engineBySlug)

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const report = buildReport({ existing, missing, afterCount, docResult })
fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, report)

console.log(`Engine count is now ${afterCount}.`)
console.log(`Bauer PDF links inserted: ${docResult.linked}; already present: ${docResult.skipped}.`)
console.log(`Wrote ${REPORT_PATH}`)
