// Reconcile 6LTAA9.5-G1 against Cummins specification 0064180.
// Dry-run by default; pass --apply to update Supabase and replace the
// linked PDF with the official Cummins file.

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
const slug = 'cummins-6ltaa95-g1'
const source =
  'https://mart.cummins.com/imagelibrary/data/assetfiles/0064180.pdf'
const storagePath = 'cummins/spec-sheets/6ltaa9.5-g1.pdf'
const localPath = path.join(os.tmpdir(), 'cummins-6ltaa9.5-g1-official.pdf')
const values = {
  configuration: 'Inline-6 Turbocharged Aftercooled',
  prime_power_kw_50hz: 290,
  standby_power_kw_50hz: 320,
  prime_power_kwe_50hz: 256,
  standby_power_kwe_50hz: 281,
  prime_power_kva_50hz: 321,
  standby_power_kva_50hz: 352,
  prime_power_kw_60hz: 280,
  standby_power_kw_60hz: 310,
  prime_power_kwe_60hz: 250,
  standby_power_kwe_60hz: 275,
  prime_power_kva_60hz: 312,
  standby_power_kva_60hz: 343,
  description:
    'Cummins 6LTAA9.5-G1 is a 9.5 L inline-six turbocharged and '
    + 'aftercooled diesel generator-drive engine. Cummins publishes '
    + '256 kWe prime and 281 kWe standby at 1500 RPM / 50 Hz, plus '
    + '250 kWe prime and 275 kWe standby at 1800 RPM / 60 Hz.',
}

const { data: engine, error: engineError } = await supabase
  .from('engines')
  .select('id, slug, prime_power_kwe_50hz, standby_power_kwe_50hz, prime_power_kwe_60hz, standby_power_kwe_60hz')
  .eq('slug', slug)
  .single()
if (engineError) throw engineError

console.table([{
  slug,
  current_50hz: `${engine.prime_power_kwe_50hz}/${engine.standby_power_kwe_50hz} kWe`,
  corrected_50hz: '256/281 kWe',
  current_60hz: `${engine.prime_power_kwe_60hz}/${engine.standby_power_kwe_60hz} kWe`,
  corrected_60hz: '250/275 kWe',
}])
if (!apply) {
  console.log('Dry run: one engine update and one official PDF replacement.')
  process.exit(0)
}

const response = await fetch(source, {
  headers: { 'User-Agent': 'Mozilla/5.0 HaifengEngineDatabase/1.0' },
  redirect: 'follow',
  signal: AbortSignal.timeout(60_000),
})
if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`)
const buffer = Buffer.from(await response.arrayBuffer())
if (buffer.subarray(0, 4).toString() !== '%PDF') {
  throw new Error(`${source}: response is not a PDF`)
}
fs.writeFileSync(localPath, buffer)

const { error: updateError } = await supabase
  .from('engines')
  .update(values)
  .eq('id', engine.id)
if (updateError) throw updateError

const uploaded = await uploadPdf(
  supabase,
  'engine-pdfs',
  localPath,
  storagePath,
)
if (!uploaded.ok) throw new Error(`Could not upload ${storagePath}`)

const { data: linked, error: linkedError } = await supabase
  .from('engine_pdfs')
  .select('id')
  .eq('engine_id', engine.id)
  .eq('storage_path', storagePath)
if (linkedError) throw linkedError

if (linked.length) {
  const { error } = await supabase
    .from('engine_pdfs')
    .update({
      type: 'datasheet',
      label: 'Cummins 6LTAA9.5-G1 Official Specification',
      file_size_bytes: buffer.length,
    })
    .eq('id', linked[0].id)
  if (error) throw error
} else {
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: engine.id,
    type: 'datasheet',
    label: 'Cummins 6LTAA9.5-G1 Official Specification',
    storage_path: storagePath,
    file_size_bytes: buffer.length,
  })
  if (error) throw error
}

console.log('Applied official Cummins 6LTAA9.5-G1 ratings and PDF.')
