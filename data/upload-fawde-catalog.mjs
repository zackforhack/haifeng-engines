import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// FAWDE (FAW Jiefang / Wuxi Diesel Engine Works) gen-set engine catalog (user-provided:
// https://genset.com.ua/wp-content/uploads/2021/08/motor-faw.pdf). 16-page catalog with
// detailed spec tables for the 4DW, 4DX and CA-series gen-set engines. Linked as a brochure
// to all FAWDE engines.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const STORE = 'fawde/brochures/fawde-genset-engine-catalog.pdf'
const FILE = '/tmp/fawde.pdf'   // pre-downloaded (genset.com.ua needs unsandboxed fetch)

const buf = fs.readFileSync(FILE)
if (buf.slice(0, 4).toString() !== '%PDF') { console.error('not a PDF'); process.exit(1) }
const { error: up } = await supabase.storage.from(BUCKET).upload(STORE, buf, { contentType: 'application/pdf', upsert: true })
if (up) { console.error('upload failed: ' + up.message); process.exit(1) }

const { data: engs } = await supabase.from('engines').select('id, model').eq('brand', 'FAWDE')
let n = 0
for (const e of engs) {
  await supabase.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', STORE)
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: e.id, type: 'brochure', label: 'FAWDE Gen-Set Engine Catalog', storage_path: STORE, file_size_bytes: buf.length,
  })
  if (!error) n++
}
console.log(`FAWDE catalog (${Math.round(buf.length / 1024)}KB) linked to ${n}/${engs.length} engines`)
