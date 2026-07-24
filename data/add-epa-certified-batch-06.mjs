// Add manufacturer-verified Cummins families and 60 Hz ratings found in the EPA audit.
// Dry-run by default. Use --apply to upsert engines and attach official Cummins PDFs.

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import os from 'os'
import path from 'path'

const apply = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)
const bucket = 'engine-pdfs'
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-06')

const common = {
  brand: 'Cummins',
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  origin: 'United States',
}

const records = [
  {
    slug: 'cummins-qsb45',
    model: 'QSB4.5',
    series: 'QSB4.5 Series',
    cylinders: 4,
    configuration: 'L4',
    displacement_l: 4.46,
    power_kw: 155,
    emissions_standard: 'U.S. EPA Tier 3 / U.S. EPA Final Tier 4',
  },
  {
    slug: 'cummins-qsk23',
    model: 'QSK23',
    series: 'QSK23 Series',
    cylinders: 6,
    configuration: 'L6',
    displacement_l: 23.152,
    power_kw: 962,
    emissions_standard: 'U.S. EPA Tier 2 / U.S. EPA Final Tier 4',
  },
  {
    slug: 'cummins-qsk78',
    model: 'QSK78',
    series: 'QSK78 Series',
    cylinders: 18,
    configuration: 'V18',
    displacement_l: 77.627,
    power_kw: 3312,
    emissions_standard:
      'U.S. EPA Tier 2 / U.S. EPA Interim Tier 4 / U.S. EPA Final Tier 4',
  },
  {
    slug: 'cummins-qsk95',
    model: 'QSK95',
    series: 'QSK95 Series',
    cylinders: 16,
    configuration: 'V16',
    displacement_l: 95.266,
    power_kw: 3922,
    emissions_standard: 'U.S. EPA Tier 2',
  },
  {
    slug: 'cummins-qst30',
    model: 'QST30',
    series: 'QST30 Series',
    cylinders: 12,
    configuration: 'V12',
    displacement_l: 30.48,
    power_kw: 1111,
    emissions_standard: 'U.S. EPA Interim Tier 4 / U.S. EPA Final Tier 4',
  },
  {
    slug: 'cummins-qsx15',
    model: 'QSX15',
    series: 'QSX15 Series',
    cylinders: 6,
    configuration: 'L6',
    displacement_l: 14.948,
    power_kw: 563,
    emissions_standard: 'U.S. EPA Tier 3 / U.S. EPA Final Tier 4',
  },
  {
    slug: 'cummins-qsk38-g17',
    model: 'QSK38-G17',
    series: 'QSK38 Series',
    cylinders: 12,
    configuration: 'V12',
    displacement_l: 37.885,
    power_kw: 1399,
    prime_power_kwe_60hz: 1136,
    prime_power_kva_60hz: 1420,
    standby_power_kwe_60hz: 1250,
    standby_power_kva_60hz: 1563,
    emissions_standard: 'U.S. EPA Tier 2',
  },
  {
    slug: 'cummins-qsk38-g18',
    model: 'QSK38-G18',
    series: 'QSK38 Series',
    cylinders: 12,
    configuration: 'V12',
    displacement_l: 37.885,
    power_kw: 1659,
    prime_power_kwe_60hz: 1364,
    prime_power_kva_60hz: 1705,
    standby_power_kwe_60hz: 1500,
    standby_power_kva_60hz: 1875,
    emissions_standard: 'U.S. EPA Tier 2',
  },
  {
    slug: 'cummins-qsk50-g24',
    model: 'QSK50-G24',
    series: 'QSK50 Series',
    cylinders: 16,
    configuration: 'V16',
    displacement_l: 50.513,
    power_kw: 2204,
    emissions_standard: 'U.S. EPA Tier 2',
  },
].map((record) => ({
  ...common,
  ...record,
  certifications: record.emissions_standard.split(' / '),
  description:
    `Cummins ${record.model} ${record.displacement_l} L `
    + `${record.configuration} diesel engine for generator and industrial `
    + `constant-speed applications. EPA annual certification data lists up to `
    + `${record.power_kw.toLocaleString()} kW mechanical power at 1800 RPM. `
    + `${record.emissions_standard}. Electrical ratings are stored only where `
    + 'an official Cummins generator-set rating card identifies the exact engine model.',
}))

const documents = [
  {
    source:
      'https://www.cummins.com/sites/default/files/2022-07/'
      + 'centum-qsk38-specification-sheet-revd.pdf',
    storagePath: 'cummins/qsk38/centum-qsk38-specification-sheet.pdf',
    label: 'Cummins Centum QSK38 Generator Set Specification',
    slugs: ['cummins-qsk38-g17', 'cummins-qsk38-g18'],
  },
  {
    source:
      'https://www.cummins.com/sites/default/files/2025-03/'
      + 'diesel-gen-set-rating-cards-north-america-60hz-2025.pdf',
    storagePath: 'cummins/catalogs/north-america-60hz-rating-card-2025.pdf',
    label: 'Cummins North America 60 Hz Diesel Rating Card',
    slugs: [
      'cummins-qsk50-g24',
      'cummins-qsk78',
      'cummins-qsk95',
      'cummins-qst30',
    ],
  },
  {
    source:
      'https://www.cummins.com/sites/default/files/2025-03/'
      + 'diesel-gen-set-rating-cards-international-50-60hz-2025.pdf',
    storagePath: 'cummins/catalogs/international-50-60hz-rating-card-2025.pdf',
    label: 'Cummins International 50/60 Hz Diesel Rating Card',
    slugs: ['cummins-qsk23', 'cummins-qsx15'],
  },
  {
    source: 'https://www.cummins.com/sites/default/files/A042J399.pdf',
    storagePath: 'cummins/qsb45/qsb45-tier-4-final-specification.pdf',
    label: 'Cummins QSB4.5 Tier 4 Final Specification',
    slugs: ['cummins-qsb45'],
  },
]

async function downloadPdf(source, destination) {
  const response = await fetch(source, {
    headers: { 'User-Agent': 'Mozilla/5.0 HaifengEngineDatabase/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${source}: response is not a PDF`)
  }
  fs.writeFileSync(destination, buffer)
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const slugs = records.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (existingError) throw existingError
const existingSlugs = new Set(existing.map((engine) => engine.slug))

console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  slug: record.slug,
  model: record.model,
  power_kw: record.power_kw,
  emissions: record.emissions_standard,
})))

if (!apply) {
  console.log(`\nDry run: ${records.length} qualified Cummins records.`)
  process.exit(0)
}

const { error: upsertError } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
if (upsertError) throw upsertError

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (enginesError) throw enginesError
const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))

fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
  const localPath = path.join(tempDir, path.basename(document.storagePath))
  await downloadPdf(document.source, localPath)
  const uploaded = await uploadPdf(
    supabase,
    bucket,
    localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)

  const engineIds = document.slugs.map((slug) => engineBySlug.get(slug).id)
  const fileSize = fs.statSync(localPath).size
  const { data: linked, error: linkedError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('storage_path', document.storagePath)
    .in('engine_id', engineIds)
  if (linkedError) throw linkedError
  const linkedIds = new Set(linked.map((row) => row.engine_id))
  const rows = engineIds
    .filter((engineId) => !linkedIds.has(engineId))
    .map((engineId) => ({
      engine_id: engineId,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fileSize,
    }))
  if (rows.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(rows)
    if (linkError) throw linkError
  }
}

console.log(`Upserted ${records.length} Cummins engines and linked official PDFs.`)
