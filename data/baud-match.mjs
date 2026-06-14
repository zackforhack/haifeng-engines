import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const fileModels = readFileSync('/tmp/baud-file-models.txt','utf8').split('\n').map(s=>s.trim()).filter(Boolean)
const { data } = await supabase.from('engines').select('id, model, slug').eq('brand','Baudouin')
const dbModels = new Map(data.map(e=>[e.model, e]))
const norm = s => s.replace(/[^A-Za-z0-9]/g,'').toUpperCase()
const dbByNorm = new Map(data.map(e=>[norm(e.model), e]))
console.log(`DB Baudouin models: ${data.length}\n`)
let exact=0, fuzzy=0, miss=[]
for (const fm of fileModels) {
  if (dbModels.has(fm)) { exact++; }
  else if (dbByNorm.has(norm(fm))) { fuzzy++; console.log(`~ fuzzy: file "${fm}" -> db "${dbByNorm.get(norm(fm)).model}"`) }
  else miss.push(fm)
}
console.log(`\nexact matches: ${exact}, fuzzy(normalized): ${fuzzy}, unmatched: ${miss.length}`)
if (miss.length) console.log('unmatched file models:', miss.join(', '))
// show some DB models for reference
console.log('\nsample DB models:', data.slice(0,15).map(e=>e.model).join(', '))
