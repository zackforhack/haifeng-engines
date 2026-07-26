// Add the legacy EPA-certified Generac SG080 9.0 L configuration without
// colliding with the current 4.5 L SG080 record.
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
  'https://www.generac.com/globalassets/products/business/'
  + 'stationary-generators/gaseous-industrial-generators/spec-sheets/'
  + 'sg080-80kw-industrial-gaseous-generator-specsheet.pdf'
const storagePath = 'generac/industrial/sg080-9l-specification.pdf'
const localPath = path.join(os.tmpdir(), path.basename(storagePath))

const record = {
  slug: 'generac-sg080-9l',
  brand: 'Generac',
  model: 'SG080 (9.0L)',
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
  cylinders: 8,
  displacement_l: 8.9,
  configuration: 'V8 Naturally Aspirated',
  compression_ratio: '9.9:1',
  power_kw: 91,
  power_hp: 122,
  standby_power_kw_60hz: 91,
  standby_power_kwe_60hz: 80,
  standby_power_kva_60hz: 100,
  rpm_rated: 1800,
  rpm_max: 1800,
  description:
    'Generac SG080 is an 80 kWe, 60 Hz industrial gaseous generator '
    + 'using the legacy 8.9 L naturally aspirated V8 at 1800 RPM. The '
    + 'official specification publishes 122 hp at rated output, natural '
    + 'gas and propane capability, and EPA stationary-emergency '
    + 'certification. This 9.0 L configuration is distinct from the '
    + 'newer 4.5 L SG080.',
}

const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .eq('slug', record.slug)
if (existingError) throw existingError

console.table([{
  action: existing.length ? 'update' : 'insert',
  slug: record.slug,
  displacement_l: record.displacement_l,
  standby_kwe_60hz: record.standby_power_kwe_60hz,
  mechanical_kw: record.power_kw,
}])
if (!apply) {
  console.log(`Dry run: ${existing.length ? 1 : 0} updates and ${existing.length ? 0 : 1} inserts.`)
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

const query = existing.length
  ? supabase.from('engines').update(record).eq('slug', record.slug)
  : supabase.from('engines').insert(record)
const { error } = await query
if (error) throw error

const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .eq('slug', record.slug)
  .single()
if (savedError) throw savedError

const uploaded = await uploadPdf(
  supabase,
  'engine-pdfs',
  localPath,
  storagePath,
)
if (!uploaded.ok) throw new Error(`Could not upload ${storagePath}`)

const { data: linked, error: linkedError } = await supabase
  .from('engine_pdfs')
  .select('engine_id')
  .eq('engine_id', saved.id)
  .eq('storage_path', storagePath)
if (linkedError) throw linkedError
if (!linked.length) {
  const { error: insertError } = await supabase.from('engine_pdfs').insert({
    engine_id: saved.id,
    type: 'datasheet',
    label: 'Generac SG080 9.0L Specification',
    storage_path: storagePath,
    file_size_bytes: fs.statSync(localPath).size,
  })
  if (insertError) throw insertError
}

console.log('Applied the EPA-certified Generac SG080 9.0L record.')
