// Add exact 60 Hz generator ratings and archived OEM sheets for the
// Mercedes-Benz OM 924 LA and OM 926 LA EPA records.
// Dry-run by default. Use --apply to update Supabase.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const apply = process.argv.includes('--apply')
const records = [
  {
    slug: 'mercedes-benz-om924la',
    sourceUrl:
      'https://woodstockpower.com/wp-content/uploads/2018/09/'
      + 'MTU_4R0120-DS125_111kW_Prime.pdf',
    storagePath: 'mercedes-benz/spec-sheets/mtu-4r0120-ds125-prime-60hz.pdf',
    label: 'MTU 4R0120 DS125 / Mercedes-Benz OM924LA 60 Hz Prime Specification',
    update: {
      power_hp: 180,
      compression_ratio: '17.5:1',
      fuel_consumption_l_per_hr: 25.7,
      prime_power_kw_60hz: 134,
      prime_power_kwe_60hz: 111,
      prime_power_kva_60hz: 139,
    },
  },
  {
    slug: 'mercedes-benz-om926la',
    sourceUrl:
      'https://woodstockpower.com/wp-content/uploads/2018/09/'
      + 'MTU_6R0120-DS180_163kW_Prime.pdf',
    storagePath: 'mercedes-benz/spec-sheets/mtu-6r0120-ds180-prime-60hz.pdf',
    label: 'MTU 6R0120 DS180 / Mercedes-Benz OM926LA 60 Hz Prime Specification',
    update: {
      power_hp: 302,
      compression_ratio: '17.5:1',
      fuel_consumption_l_per_hr: 44.7,
      prime_power_kw_60hz: 225,
      prime_power_kwe_60hz: 163,
      prime_power_kva_60hz: 204,
    },
  },
]

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)
const slugs = records.map((record) => record.slug)
const { data: engines, error: engineError } = await supabase
  .from('engines')
  .select(
    'id, slug, brand, model, emissions_standard, power_kw, power_hp, '
    + 'compression_ratio, fuel_consumption_l_per_hr, prime_power_kw_60hz, '
    + 'prime_power_kwe_60hz, prime_power_kva_60hz',
  )
  .in('slug', slugs)
if (engineError) throw engineError
if (engines.length !== records.length) {
  throw new Error(`Expected ${records.length} engines; found ${engines.length}`)
}

const enginesBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
const ids = engines.map((engine) => engine.id)
const { data: pdfs, error: pdfError } = await supabase
  .from('engine_pdfs')
  .select('engine_id, storage_path')
  .in('engine_id', ids)
if (pdfError) throw pdfError

console.table(records.map((record) => {
  const engine = enginesBySlug.get(record.slug)
  return {
    action: apply ? 'apply' : 'preview',
    engine: `${engine.brand} ${engine.model}`,
    emissions: engine.emissions_standard,
    certified_kwm: engine.power_kw,
    prime_kwm: `${engine.prime_power_kw_60hz ?? '-'} -> ${record.update.prime_power_kw_60hz}`,
    prime_kwe: `${engine.prime_power_kwe_60hz ?? '-'} -> ${record.update.prime_power_kwe_60hz}`,
    pdf_links: `${pdfs.filter((pdf) => pdf.engine_id === engine.id).length} -> + exact OEM sheet`,
  }
}))

if (!apply) {
  console.log('\nDry run only. Re-run with --apply to save ratings and attach the OEM sheets.')
  process.exit(0)
}

for (const record of records) {
  const engine = enginesBySlug.get(record.slug)
  const response = await fetch(record.sourceUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 HaifengEngineDatabase/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) {
    throw new Error(`${engine.model} PDF download failed: HTTP ${response.status}`)
  }

  const pdf = Buffer.from(await response.arrayBuffer())
  if (pdf.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${engine.model} source did not return a PDF`)
  }

  const localPath = path.join(os.tmpdir(), path.basename(record.storagePath))
  fs.writeFileSync(localPath, pdf)
  const upload = await uploadPdf(
    supabase,
    'engine-pdfs',
    localPath,
    record.storagePath,
  )
  if (!upload.ok) throw new Error(`${engine.model} PDF upload failed`)

  const { error: updateError } = await supabase
    .from('engines')
    .update(record.update)
    .eq('id', engine.id)
  if (updateError) throw updateError

  const { error: deleteError } = await supabase
    .from('engine_pdfs')
    .delete()
    .eq('engine_id', engine.id)
    .eq('storage_path', record.storagePath)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('engine_pdfs').insert({
    engine_id: engine.id,
    type: 'datasheet',
    label: record.label,
    storage_path: record.storagePath,
    file_size_bytes: pdf.length,
  })
  if (insertError) throw insertError

  console.log(
    `Updated ${engine.model}: ${record.update.prime_power_kwe_60hz} kWe `
    + `prime at 60 Hz; linked ${Math.round(pdf.length / 1024)}KB sheet.`,
  )
}

console.log('Standby fields were intentionally left blank because those configurations')
console.log('use higher mechanical power nodes than the selected EPA records.')
