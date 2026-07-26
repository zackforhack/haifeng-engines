// Add the legacy MTU 10V0068 GS100 / 6.8LT V10 platform and official
// MTU Onsite Energy specification sheet. Dry-run by default.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-11')

const records = [
  {
    slug: 'mtu-10v0068-gs100',
    brand: 'MTU',
    model: '10V0068 GS100',
    series: 'Onsite Energy Gas',
    status: 'discontinued',
    year_introduced: 2013,
    year_discontinued: 2022,
    origin: 'Germany / United States',
    fuel_type: 'Natural Gas',
    ignition_type: 'Spark Ignition',
    cooling_method: 'Liquid-Cooled',
    cylinders: 10,
    configuration: 'V10 Turbocharged',
    displacement_l: 6.8,
    compression_ratio: '9:1',
    rpm_rated: 1800,
    power_kw: 132,
    power_hp: 177,
    standby_power_kw_60hz: 132,
    standby_power_kwe_60hz: 100,
    standby_power_kva_60hz: 125,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: [
      'U.S. EPA Stationary',
      'U.S. EPA NSPS Subpart JJJJ',
      'UL 2200 Optional',
      'NFPA 110',
    ],
    description:
      'MTU 10V0068 GS100 is a legacy 100 kWe standby gas generator '
      + 'platform powered by the MTU 6.8LT V10. The turbocharged '
      + '6.8 L spark-ignited engine is rated 132 kWm at 1800 RPM '
      + 'on natural gas and uses a three-way catalyst. Rolls-Royce '
      + 'Solutions EPA lineages rooted at DMDDB06.8GBT, DMDDB06.8GBV '
      + 'and DMDDB06.8GBX cover matching 6.8 L V10 stationary '
      + 'configurations and additional output calibrations.',
  },
]

const documents = [
  {
    source:
      'https://www.curtispowersolutions.com/hubfs/Files/'
      + 'Technical%20Information/MTU%20Onsite%20Energy/Spec%20Sheets/'
      + '60%20Hz%20Gas/MTU10V0068GS100_100kW_Standby.pdf',
    storagePath: 'mtu/spec-sheets/mtu-10v0068-gs100-100kw-standby.pdf',
    label: 'MTU 10V0068 GS100 100 kWe Standby Specification Sheet',
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

const engine = saved[0]
for (const document of documents) {
  const uploaded = await uploadPdf(
    supabase,
    'engine-pdfs',
    document.localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)
  const { data: linked, error: linkedError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('storage_path', document.storagePath)
    .eq('engine_id', engine.id)
  if (linkedError) throw linkedError
  if (!linked.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(document.localPath).size,
    })
    if (linkError) throw linkError
  }
}

console.log('Saved the MTU 10V0068 GS100 and official specification sheet.')
