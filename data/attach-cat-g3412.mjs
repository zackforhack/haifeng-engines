import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const lp='/tmp/cat/cg.pdf', storage='caterpillar/g3412-gas-datasheet.pdf', label='Cat G3412 Gas Petroleum Engine Spec Sheet'
const MODELS=['G3412','G3412C']  // same G3412 engine; G3412C = electronic-control genset variant
const buf=readFileSync(lp)
const t=execSync(`pdftotext -layout "${lp}" - 2>/dev/null`,{encoding:'utf8',maxBuffer:1<<24})
if(t.indexOf('G3412')<0){console.error('model not in PDF');process.exit(1)}
const {error:ul}=await supabase.storage.from('engine-pdfs').upload(storage,buf,{contentType:'application/pdf',upsert:true})
if(ul){console.error(ul.message);process.exit(1)}
const {data:engines}=await supabase.from('engines').select('id,model').eq('brand','Caterpillar').in('model',MODELS)
const {data:ex}=await supabase.from('engine_pdfs').select('engine_id').eq('storage_path',storage)
const have=new Set((ex??[]).map(r=>r.engine_id))
let n=0
for(const e of engines){ if(have.has(e.id))continue
  const {error}=await supabase.from('engine_pdfs').insert({engine_id:e.id,type:'datasheet',label,storage_path:storage,file_size_bytes:buf.length})
  if(error){console.error(e.model,error.message);continue}
  n++;console.log('✓ '+e.model) }
console.log('\n✓ attached to '+n+' models')
