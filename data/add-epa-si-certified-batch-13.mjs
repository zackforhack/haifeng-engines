// Add three legacy EPA spark-ignited platforms identified from official
// Kubota/PSI material and EPA certification configurations. Dry-run by default.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-13')
const common = {
  status: 'discontinued',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA NSPS Subpart JJJJ',
  ],
}

const records = [
  {
    ...common,
    slug: 'kubota-wg2503-ln-e3',
    brand: 'Kubota',
    model: 'WG2503-LN-E3',
    series: 'WG Series',
    origin: 'Japan',
    year_introduced: 2013,
    year_discontinued: 2016,
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 2.491,
    compression_ratio: '9.2:1',
    power_kw: 24.4,
    power_hp: 32.7,
    description:
      'Kubota WG2503-LN-E3 is a 2.491 L inline-four naturally '
      + 'aspirated natural-gas engine for fixed-speed generator '
      + 'drives. Kubota publishes 24.4 kWm continuous at 1800 RPM '
      + 'for the 60 Hz natural-gas configuration. EPA lineage '
      + 'DKBXB02.52FM records the matching 2.5 L four-cylinder '
      + 'stationary platform from model years 2013 through 2016.',
  },
  {
    ...common,
    slug: 'psi-legacy-3-0l-l4',
    brand: 'PSI',
    model: 'Legacy 3.0L L4',
    series: 'Legacy Industrial',
    origin: 'United States',
    year_introduced: 2011,
    year_discontinued: 2016,
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 2.972,
    power_kw: 36.7,
    power_hp: 49.2,
    description:
      'PSI Legacy 3.0L L4 is a liquid-cooled spark-ignited '
      + 'industrial engine platform. PSI publishes the official '
      + '3.0 L engine service manual, while EPA lineage '
      + '9PSIB2.972ED identifies the 2.972 L four-cylinder '
      + 'stationary natural-gas configuration at 1800 RPM. The '
      + '36.7 kW value is the EPA certification power node, not '
      + 'a claimed generator-set electrical rating.',
  },
  {
    ...common,
    slug: 'psi-legacy-gm-8-1l-v8',
    brand: 'PSI',
    model: 'Legacy GM 8.1L V8',
    series: 'Legacy Industrial',
    origin: 'United States',
    year_introduced: 2011,
    year_discontinued: 2012,
    cylinders: 8,
    configuration: 'V8 Turbocharged',
    displacement_l: 8.1,
    power_kw: 182.8,
    power_hp: 245.1,
    description:
      'PSI Legacy GM 8.1L V8 is the earlier GM-derived '
      + 'spark-ignited industrial platform, distinct from PSI\'s '
      + 'current inline-six 8.1 L engine. EPA lineage '
      + '9PSIB8.10EMT identifies an 8.1 L eight-cylinder '
      + 'turbocharged stationary natural-gas configuration at '
      + '1800 RPM. The 182.8 kW value is the EPA certification '
      + 'power node, not a generator-set electrical output.',
  },
]

const documents = [
  {
    source:
      'https://www.kubotaengine.com/wp-content/uploads/2020/02/'
      + '62037_1_Kubota_Gas_and_Oil_Engine_Lit_a3_web.pdf',
    storagePath: 'kubota/gas/kubota-oil-and-gas-engine-guide.pdf',
    label: 'Kubota Engines for the Oil and Gas Market',
    type: 'datasheet',
    slugs: ['kubota-wg2503-ln-e3'],
  },
  {
    source:
      'https://psiengines.com/wp-content/uploads/2024/06/'
      + '3.0L-Engine-Service-Manual.pdf',
    storagePath: 'psi/manuals/psi-legacy-3-0l-engine-service-manual.pdf',
    label: 'PSI 3.0L Engine Service Manual',
    type: 'manual',
    slugs: ['psi-legacy-3-0l-l4'],
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
  brand: record.brand,
  model: record.model,
  displacement_l: record.displacement_l,
  cylinders: record.cylinders,
  power_kw: record.power_kw,
})))

if (!apply) {
  console.log(
    `Dry run: ${existing.length} updates, `
    + `${records.length - existing.length} inserts.`,
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
  const links = engineIds
    .filter((engineId) => !linkedIds.has(engineId))
    .map((engineId) => ({
      engine_id: engineId,
      type: document.type,
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(document.localPath).size,
    }))
  if (links.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
    if (linkError) throw linkError
  }
}

console.log(
  `Saved ${records.length} EPA SI records and ensured `
  + `${documents.length} official document sets.`,
)
