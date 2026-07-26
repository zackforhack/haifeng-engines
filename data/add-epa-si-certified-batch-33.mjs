// Add the EPA mechanical certification node to Generac's 2.4 L RG03824.
// Dry-run by default; pass --apply to update and verify the official PDF link.

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
const slug = 'generac-rg03824'
const source =
  'https://www.generac.com/globalassets/products/residential/'
  + 'standby-generators/spec-sheets/'
  + '22kw-27kw-32kw-38kw-protector-qs-standby-generator-specsheet.pdf'
const storagePath =
  'generac/protector/rg02224-rg03824-protector-qs-specification.pdf'
const localPath = path.join(os.tmpdir(), path.basename(storagePath))
const values = {
  power_kw: 38.6,
  power_hp: 51.8,
  standby_power_kw_60hz: 38.6,
  standby_power_kwe_60hz: 38,
  standby_power_kva_60hz: 47.5,
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA Stationary Emergency',
  ],
  description:
    'Generac RG03824 is a 38 kWe, 60 Hz emergency-standby generator '
    + 'using a turbocharged and aftercooled 2.4 L inline-four gaseous '
    + 'engine at 1800 RPM. EPA annual certification data records the '
    + 'matching natural-gas and propane engine families at 38.6 kW '
    + 'maximum engine test power.',
}

const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .eq('slug', slug)
  .single()
if (existingError) throw existingError

console.table([{
  action: 'update',
  slug,
  mechanical_kw: values.power_kw,
  standby_kwe: values.standby_power_kwe_60hz,
}])
if (!apply) {
  console.log('Dry run: one update and one official PDF link check.')
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

const { error } = await supabase.from('engines').update(values).eq('slug', slug)
if (error) throw error

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
  .eq('engine_id', existing.id)
  .eq('storage_path', storagePath)
if (linkedError) throw linkedError
if (!linked.length) {
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: existing.id,
    type: 'datasheet',
    label: 'Generac Protector QS 22-38 kW Specification',
    storage_path: storagePath,
    file_size_bytes: fs.statSync(localPath).size,
  })
  if (error) throw error
}

console.log('Applied the Generac RG03824 EPA mechanical rating.')
