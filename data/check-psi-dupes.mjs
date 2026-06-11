import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const { data: psi } = await supabase.from('engines').select('id, model').eq('brand','PSI')
const m = new Map(psi.map(e=>[e.id,e.model]))
const { data: pdfs } = await supabase.from('engine_pdfs').select('engine_id, type, label, storage_path').in('engine_id', psi.map(e=>e.id))
const byEng = {}
for (const p of pdfs) (byEng[p.engine_id] ??= []).push(p)
for (const [id, list] of Object.entries(byEng)) {
  if (list.length > 1) console.log(`${m.get(id)} (${list.length}): ` + list.map(p=>`[${p.type}] ${p.storage_path}`).join('  |  '))
}
console.log('--- types present ---')
const types = {}; for (const p of pdfs) types[p.type]=(types[p.type]||0)+1; console.log(types)
