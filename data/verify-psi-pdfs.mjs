import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const { data: psi } = await supabase.from('engines').select('id, model, slug').eq('brand','PSI')
const ids = psi.map(e=>e.id)
const { data: pdfs } = await supabase.from('engine_pdfs').select('engine_id, type, storage_path').in('engine_id', ids).eq('type','datasheet')
const linked = new Set(pdfs.map(p=>p.engine_id))
console.log(`PSI engines: ${psi.length}, with datasheet: ${linked.size}, total datasheet links: ${pdfs.length}`)
const without = psi.filter(e=>!linked.has(e.id)).map(e=>e.model)
console.log('PSI engines WITHOUT datasheet:', without.join(', '))
