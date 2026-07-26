// Complete Generac's current 1800 RPM, 2.4 L Protector QS range.
// Dry-run by default; pass --apply to write and link the official spec sheet.

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) throw new Error('Supabase credentials are required')

const supabase = createClient(url, key)
const source =
  'https://www.generac.com/globalassets/products/residential/'
  + 'standby-generators/spec-sheets/'
  + '22kw-27kw-32kw-38kw-protector-qs-standby-generator-specsheet.pdf'
const storagePath =
  'generac/protector/rg02224-rg03824-protector-qs-specification.pdf'
const localPath = path.join(os.tmpdir(), path.basename(storagePath))

const common = {
  brand: 'Generac',
  series: 'Protector QS',
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
  cylinders: 4,
  displacement_l: 2.4,
  compression_ratio: '9.5:1',
  rpm_rated: 1800,
  rpm_max: 1800,
}

const records = [
  {
    ...common,
    slug: 'generac-rg02224',
    model: 'RG02224',
    configuration: 'Inline-4 Naturally Aspirated',
    standby_power_kwe_60hz: 22,
    standby_power_kva_60hz: 27.5,
    description:
      'Generac RG02224 is a 22 kWe, 60 Hz emergency-standby '
      + 'generator using a naturally aspirated 2.4 L inline-four gaseous '
      + 'engine at 1800 RPM. The official specification publishes the '
      + 'same 22 kWe output on natural gas and propane.',
  },
  {
    ...common,
    slug: 'generac-rg02724',
    model: 'RG02724',
    configuration: 'Inline-4 Naturally Aspirated',
    standby_power_kwe_60hz: 25,
    standby_power_kva_60hz: 31.3,
    description:
      'Generac RG02724 is a 60 Hz emergency-standby generator using a '
      + 'naturally aspirated 2.4 L inline-four engine at 1800 RPM. The '
      + 'model is rated 27 kWe on propane and 25 kWe on natural gas; this '
      + 'database uses the published natural-gas rating.',
  },
  {
    ...common,
    slug: 'generac-rg03224',
    model: 'RG03224',
    configuration: 'Inline-4 Turbocharged',
    standby_power_kwe_60hz: 32,
    standby_power_kva_60hz: 40,
    description:
      'Generac RG03224 is a 32 kWe, 60 Hz emergency-standby '
      + 'generator using a turbocharged 2.4 L inline-four gaseous engine '
      + 'at 1800 RPM. Generac publishes the same output on natural gas '
      + 'and propane.',
  },
  {
    ...common,
    slug: 'generac-rg03824',
    model: 'RG03824',
    configuration: 'Inline-4 Turbocharged Aftercooled',
    standby_power_kwe_60hz: 38,
    standby_power_kva_60hz: 47.5,
    description:
      'Generac RG03824 is a 38 kWe, 60 Hz emergency-standby '
      + 'generator using a turbocharged and aftercooled 2.4 L inline-four '
      + 'gaseous engine at 1800 RPM. Generac publishes the same output '
      + 'on natural gas and propane.',
  },
]

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
  configuration: record.configuration,
  natural_gas_kwe: record.standby_power_kwe_60hz,
})))
if (!apply) {
  console.log(
    `Dry run: ${existing.length} updates and `
    + `${records.length - existing.length} inserts.`,
  )
  process.exit(0)
}

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
fs.writeFileSync(localPath, buffer)

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
  throw new Error(`Expected ${records.length} records; found ${saved.length}`)
}

const uploaded = await uploadPdf(
  supabase,
  'engine-pdfs',
  localPath,
  storagePath,
)
if (!uploaded.ok) throw new Error(`Could not upload ${storagePath}`)

const engineIds = saved.map((engine) => engine.id)
const { data: linked, error: linkedError } = await supabase
  .from('engine_pdfs')
  .select('engine_id')
  .in('engine_id', engineIds)
  .eq('storage_path', storagePath)
if (linkedError) throw linkedError
const linkedIds = new Set(linked.map((row) => row.engine_id))
const rows = saved
  .filter((engine) => !linkedIds.has(engine.id))
  .map((engine) => ({
    engine_id: engine.id,
    type: 'datasheet',
    label: 'Generac Protector QS 22-38 kW Specification',
    storage_path: storagePath,
    file_size_bytes: fs.statSync(localPath).size,
  }))
if (rows.length) {
  const { error } = await supabase.from('engine_pdfs').insert(rows)
  if (error) throw error
}

console.log(`Applied ${records.length} Generac Protector QS records.`)
