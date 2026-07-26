// Add official Generac gaseous configurations that resolve weak EPA SI
// crosswalks on the 4.5 L inline-four and 9.0 L V8 platforms.
// Dry-run by default; pass --apply to write records and upload documents.

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(url, key)
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-17')
const common = {
  brand: 'Generac',
  series: 'Industrial Gaseous',
  status: 'active',
  origin: 'United States',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA Stationary Emergency',
  ],
  rpm_rated: 1800,
  rpm_max: 1800,
}

const records = [
  {
    ...common,
    slug: 'generac-sg040-4-5l',
    model: 'SG040',
    cylinders: 4,
    configuration: 'Inline-4 Naturally Aspirated',
    displacement_l: 4.43,
    power_kw: 45.5,
    power_hp: 61,
    prime_power_kw_60hz: 41.8,
    prime_power_kwe_60hz: 36,
    prime_power_kva_60hz: 45,
    standby_power_kw_60hz: 45.5,
    standby_power_kwe_60hz: 40,
    standby_power_kva_60hz: 50,
    description:
      'Generac SG040 uses the 4.43 L inline-four gaseous engine at '
      + '1800 RPM. The official natural-gas specification publishes '
      + '40 kWe standby, 36 kWe prime and 61 hp at standby output. '
      + 'The generator set is EPA certified for stationary service.',
  },
  {
    ...common,
    slug: 'generac-sg045-4-5l',
    model: 'SG045',
    cylinders: 4,
    configuration: 'Inline-4 Naturally Aspirated',
    displacement_l: 4.43,
    power_kw: 51.5,
    power_hp: 69,
    prime_power_kwe_60hz: 41,
    prime_power_kva_60hz: 51.3,
    standby_power_kw_60hz: 51.5,
    standby_power_kwe_60hz: 45,
    standby_power_kva_60hz: 56.3,
    description:
      'Generac SG045 uses the 4.43 L inline-four gaseous engine at '
      + '1800 RPM. The official natural-gas specification publishes '
      + '45 kWe standby, 41 kWe prime and 69 hp at standby output. '
      + 'The generator set is EPA certified for stationary emergency service.',
  },
  {
    ...common,
    slug: 'generac-sg060-4-5l',
    model: 'SG060',
    cylinders: 4,
    configuration: 'Inline-4 Turbocharged',
    displacement_l: 4.43,
    power_kw: 73.1,
    power_hp: 98,
    standby_power_kw_60hz: 73.1,
    standby_power_kwe_60hz: 60,
    standby_power_kva_60hz: 75,
    description:
      'Generac SG060 uses the 4.43 L inline-four gaseous engine at '
      + '1800 RPM. The official natural-gas specification publishes '
      + '60 kWe standby and 98 hp at rated output. The generator set '
      + 'is EPA certified for stationary emergency service.',
  },
  {
    ...common,
    slug: 'generac-sg080',
    model: 'SG080',
    cylinders: 4,
    configuration: 'Inline-4 Turbocharged',
    displacement_l: 4.43,
    power_kw: 91,
    power_hp: 122,
    prime_power_kwe_60hz: 73,
    prime_power_kva_60hz: 91.3,
    standby_power_kw_60hz: 91,
    standby_power_kwe_60hz: 80,
    standby_power_kva_60hz: 100,
    description:
      'Generac SG080 uses the 4.43 L inline-four gaseous engine at '
      + '1800 RPM. The official specification publishes 80 kWe standby '
      + 'and 122 hp at rated output. EPA annual certification data records '
      + 'matching 4.4 L inline-four stationary configurations.',
  },
  {
    ...common,
    slug: 'generac-sg100-9l',
    model: 'SG100 (9.0L)',
    cylinders: 8,
    configuration: 'V8 Naturally Aspirated',
    displacement_l: 8.9,
    power_kw: 114.8,
    power_hp: 154,
    prime_power_kw_60hz: 103.7,
    prime_power_kwe_60hz: 90,
    prime_power_kva_60hz: 112.5,
    standby_power_kw_60hz: 114.8,
    standby_power_kwe_60hz: 100,
    standby_power_kva_60hz: 125,
    description:
      'Generac SG100 uses the 8.9 L V8 gaseous engine at 1800 RPM. '
      + 'The official natural-gas specification publishes 100 kWe '
      + 'standby, 90 kWe prime and 154 hp at standby output. EPA annual '
      + 'certification data records matching 8.9 L V8 stationary families.',
  },
]

const documents = [
  {
    source:
      'https://legacy.genconnect.generac.com/Media/vwDoc.axd?'
      + 'd=65e29cd3-e2d3-4711-bd15-25dbf7479bb7',
    storagePath: 'generac/industrial/sg040-4-5l-spec-sheet.pdf',
    label: 'Generac SG040 4.5L Gaseous Generator Spec Sheet',
    slugs: ['generac-sg040-4-5l'],
  },
  {
    source:
      'https://www.generac.com/globalassets/products/business/'
      + 'stationary-generators/gaseous-industrial-generators/spec-sheets/'
      + 'sg045-45kw-industrial-gaseous-specsheet.pdf',
    storagePath: 'generac/industrial/sg045-4-5l-spec-sheet.pdf',
    label: 'Generac SG045 4.5L Gaseous Generator Spec Sheet',
    slugs: ['generac-sg045-4-5l'],
  },
  {
    source:
      'https://www.generac.com/globalassets/products/business/'
      + 'stationary-generators/gaseous-industrial-generators/spec-sheets/'
      + 'sg060-60kw-industrial-gaseous-generator-specsheet.pdf',
    storagePath: 'generac/industrial/sg060-4-5l-spec-sheet.pdf',
    label: 'Generac SG060 4.5L Gaseous Generator Spec Sheet',
    slugs: ['generac-sg060-4-5l'],
  },
  {
    source:
      'https://legacy.genconnect.generac.com/Media/vwDoc.axd?'
      + 'd=6979fe32-1589-4858-809a-d37c6ba92223',
    storagePath: 'generac/industrial/sg080-4-5l-spec-sheet.pdf',
    label: 'Generac SG080 4.5L Gaseous Generator Spec Sheet',
    slugs: ['generac-sg080'],
  },
  {
    source:
      'https://www.generac.com/globalassets/products/business/'
      + 'stationary-generators/gaseous-industrial-generators/spec-sheets/'
      + 'sg100-100kw-industrial-gaseous-generator-specsheet.pdf',
    storagePath: 'generac/industrial/sg100-9l-spec-sheet.pdf',
    label: 'Generac SG100 9.0L Gaseous Generator Spec Sheet',
    slugs: ['generac-sg100-9l'],
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
  kwm: record.power_kw,
  standby_kwe_60hz: record.standby_power_kwe_60hz,
})))

if (!apply) {
  console.log(
    `Dry run: ${existing.length} updates, `
    + `${records.length - existing.length} inserts, `
    + `${documents.length} official PDFs.`,
  )
  process.exit(0)
}

fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
  document.localPath = path.join(tempDir, path.basename(document.storagePath))
  await downloadPdf(document.source, document.localPath)
  console.log(`Validated ${document.label}`)
}

for (const record of records) {
  const query = existingSlugs.has(record.slug)
    ? supabase.from('engines').update(record).eq('slug', record.slug)
    : supabase.from('engines').insert(record)
  const { error } = await query
  if (error) throw error
}

const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (savedError) throw savedError
if (saved.length !== records.length) {
  throw new Error(`Expected ${records.length} saved records; found ${saved.length}`)
}
const engineBySlug = new Map(saved.map((engine) => [engine.slug, engine]))

for (const document of documents) {
  const uploaded = await uploadPdf(
    supabase,
    'engine-pdfs',
    document.localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)

  const engineIds = document.slugs.map((slug) => engineBySlug.get(slug).id)
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
      file_size_bytes: fs.statSync(document.localPath).size,
    }))
  if (rows.length) {
    const { error } = await supabase.from('engine_pdfs').insert(rows)
    if (error) throw error
  }
  console.log(`Linked ${document.label}`)
}

console.log(
  `Applied ${records.length} Generac records and linked `
  + `${documents.length} official PDFs.`,
)
