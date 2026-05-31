import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Hatz publishes current per-series datasheets on its download center. Match each model
// by series letter (H/D/B). The legacy L- and M-series (air-cooled) have no online datasheet.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const DC = 'https://hatz.com/images/downloads/downloadcenter/datasheets/'
const TMP = path.join(os.tmpdir(), 'hatz-specs'); fs.mkdirSync(TMP, { recursive: true })

const SERIES = {
  H: { file: 'Hatz_data_sheet_H-series_2022-10_en_70257173.pdf', name: 'H-Series' },
  D: { file: 'Hatz_data_sheet_D-series_2022-10_en_70257171.pdf', name: 'D-Series' },
  B: { file: 'Hatz_data_sheet_B-series_2022-10_en_70257169.pdf', name: 'B-Series' },
}
const seriesOf = (model) => (model.match(/^\d+([A-Z])/) || [])[1]   // 3H50TIC -> H, 1D81C -> D

async function getPdf(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(40000) })
  if (!res.ok) return null
  const b = Buffer.from(await res.arrayBuffer())
  return (b.slice(0, 4).toString() === '%PDF') ? b : null
}

const PAGE = 1000; let pdfs = []; let from = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id').range(from, from + PAGE - 1); pdfs.push(...(data ?? [])); if (!data || data.length < PAGE) break; from += PAGE }
const withPdf = new Set(pdfs.map(p => p.engine_id))
const { data: engs } = await supabase.from('engines').select('id, model').eq('brand', 'Hatz')
const missing = engs.filter(e => !withPdf.has(e.id))
console.log(`${missing.length} Hatz models missing docs\n`)

const cache = {}
let ok = 0, none = 0
for (const e of missing) {
  const s = seriesOf(e.model)
  const def = SERIES[s]
  process.stdout.write(`${e.model} (series ${s || '?'}) ... `)
  if (!def) { console.log('no online datasheet (legacy series)'); none++; continue }
  if (cache[def.file] === undefined) cache[def.file] = await getPdf(DC + def.file)
  const buf = cache[def.file]
  if (!buf) { console.log('fetch failed'); none++; continue }
  const storagePath = `hatz/spec-sheets/${def.name.toLowerCase()}.pdf`
  const f = path.join(TMP, def.file); fs.writeFileSync(f, buf)
  const { ok: up } = await uploadPdf(supabase, BUCKET, f, storagePath)
  if (!up) { console.log('upload failed'); none++; continue }
  await supabase.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', storagePath)
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: e.id, type: 'datasheet', label: `Hatz ${def.name} Industrial Diesel Engines Datasheet`, storage_path: storagePath, file_size_bytes: buf.length,
  })
  if (error) { console.log('link failed'); none++; continue }
  console.log(`${def.name} (${Math.round(buf.length / 1024)}KB) ✓`); ok++
}
console.log(`\n✓ ${ok} linked · ${none} no datasheet`)
