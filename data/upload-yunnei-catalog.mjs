import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'

// Yunnei official power-generation product catalog (Kunming Yunnei Power),
// linked as a brochure to all 55 Yunnei engines. Source: 云内产品选型.pdf (Downloads).
const s = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const file = '/Users/ziqianhuang/Downloads/云内产品选型.pdf'
const storagePath = 'yunnei/brochures/yunnei-powergen-catalog.pdf'

const buf = fs.readFileSync(file)
const { ok } = await uploadPdf(s, 'engine-pdfs', file, storagePath)
if (!ok) { console.error('upload failed'); process.exit(1) }

const { data: engs } = await s.from('engines').select('id').eq('brand', 'Yunnei')
let n = 0
for (const e of engs) {
  await s.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', storagePath)
  const { error } = await s.from('engine_pdfs').insert({
    engine_id: e.id, type: 'brochure',
    label: 'Yunnei Power-Generation Product Catalog (Kunming Yunnei)',
    storage_path: storagePath, file_size_bytes: buf.length,
  })
  if (!error) n++
}
console.log(`Yunnei catalog linked to ${n} engines`)
