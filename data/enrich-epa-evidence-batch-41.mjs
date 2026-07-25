// Enrich EPA-added records with exact manufacturer evidence.
// Dry-run by default. Use --apply to update Supabase.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const apply = process.argv.includes('--apply')
const slug = 'mitsubishi-s16r-y2ptaw2-1-rudox-tier4f'
const sourceUrl =
  'https://f.hubspotusercontent10.net/hubfs/5570069/00.%20Website/02.%20Industrial/'
  + '02.%20Products/Contant%20Speed/000.%20Documents/'
  + 'Mitsubishi%20Diesel%20Engine%20-%20S16R-Y2PTAW2.pdf'
const storagePath = 'mitsubishi/spec-sheets/s16r-y2ptaw2.pdf'
const label = 'Mitsubishi S16R-Y2PTAW2 Diesel Engine Specification Sheet'
const ratings = {
  prime_power_kw_60hz: 1982,
  prime_power_kwe_60hz: 1883,
  prime_power_kva_60hz: 2354,
  standby_power_kw_60hz: 2180,
  standby_power_kwe_60hz: 2071,
  standby_power_kva_60hz: 2589,
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)

const { data: engine, error: engineError } = await supabase
  .from('engines')
  .select(
    'id, slug, brand, model, emissions_standard, prime_power_kw_60hz, '
    + 'prime_power_kwe_60hz, prime_power_kva_60hz, standby_power_kw_60hz, '
    + 'standby_power_kwe_60hz, standby_power_kva_60hz',
  )
  .eq('slug', slug)
  .maybeSingle()
if (engineError) throw engineError
if (!engine) throw new Error(`Engine not found: ${slug}`)

const { data: existingPdfs, error: pdfError } = await supabase
  .from('engine_pdfs')
  .select('id, label, storage_path, file_size_bytes')
  .eq('engine_id', engine.id)
if (pdfError) throw pdfError

console.table([{
  action: apply ? 'apply' : 'preview',
  engine: `${engine.brand} ${engine.model}`,
  emissions: engine.emissions_standard,
  prime_kwm: `${engine.prime_power_kw_60hz ?? '-'} -> ${ratings.prime_power_kw_60hz}`,
  prime_kwe: `${engine.prime_power_kwe_60hz ?? '-'} -> ${ratings.prime_power_kwe_60hz}`,
  standby_kwm: `${engine.standby_power_kw_60hz ?? '-'} -> ${ratings.standby_power_kw_60hz}`,
  standby_kwe: `${engine.standby_power_kwe_60hz ?? '-'} -> ${ratings.standby_power_kwe_60hz}`,
  pdf_links: `${existingPdfs.length} -> 1 exact MHI sheet`,
}])

if (!apply) {
  console.log('\nDry run only. Re-run with --apply to update ratings and attach the official PDF.')
  process.exit(0)
}

const response = await fetch(sourceUrl, {
  headers: { 'User-Agent': 'Mozilla/5.0 HaifengEngineDatabase/1.0' },
  redirect: 'follow',
  signal: AbortSignal.timeout(60000),
})
if (!response.ok) throw new Error(`MHI PDF download failed: HTTP ${response.status}`)

const pdf = Buffer.from(await response.arrayBuffer())
if (pdf.subarray(0, 4).toString() !== '%PDF') {
  throw new Error('MHI source did not return a PDF')
}

const localPath = path.join(os.tmpdir(), 'mhi-s16r-y2ptaw2.pdf')
fs.writeFileSync(localPath, pdf)
const upload = await uploadPdf(supabase, 'engine-pdfs', localPath, storagePath)
if (!upload.ok) throw new Error('MHI PDF upload failed')

const { error: updateError } = await supabase
  .from('engines')
  .update(ratings)
  .eq('id', engine.id)
if (updateError) throw updateError

const { error: deleteError } = await supabase
  .from('engine_pdfs')
  .delete()
  .eq('engine_id', engine.id)
  .eq('type', 'datasheet')
if (deleteError) throw deleteError

const { error: insertError } = await supabase.from('engine_pdfs').insert({
  engine_id: engine.id,
  type: 'datasheet',
  label,
  storage_path: storagePath,
  file_size_bytes: pdf.length,
})
if (insertError) throw insertError

console.log(
  `Updated ${engine.brand} ${engine.model}: 1883/2071 kWe prime/standby at 60 Hz.`,
)
console.log(`Linked ${label} (${pdf.length} bytes).`)
console.log('Emissions classification was intentionally left unchanged.')
