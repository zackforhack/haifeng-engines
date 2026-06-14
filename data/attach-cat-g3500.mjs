// Cat G3500 series gas family datasheet (scene7 LEDW6043-01) -> attach to all our G3500 gas variants.
// Family-level official Cat doc covering G3512/G3516/G3520 (+H/C/+ variants); verified G3500 token.
import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const norm = s => s.replace(/[^A-Za-z0-9]/g,'').toUpperCase()
const lp='/tmp/cat/g3500.pdf', storage='caterpillar/g3500-series-gas-datasheet.pdf'
const MODELS=['G3512','G3516','G3520','G3512H','G3516H','G3520H','G3520C','G3516+']
const buf=readFileSync(lp)
const t=execSync(`pdftotext -layout "${lp}" - 2>/dev/null`,{encoding:'utf8',maxBuffer:1<<24})
if(norm(t).indexOf('G3500')<0){console.error('G3500 token missing');process.exit(1)}
const {error:ul}=await supabase.storage.from('engine-pdfs').upload(storage,buf,{contentType:'application/pdf',upsert:true})
if(ul){console.error(ul.message);process.exit(1)}
const {data:engines}=await supabase.from('engines').select('id,model').eq('brand','Caterpillar').in('model',MODELS)
const {data:ex}=await supabase.from('engine_pdfs').select('engine_id').eq('storage_path',storage)
const have=new Set((ex??[]).map(r=>r.engine_id))
let n=0
for(const e of engines){ if(have.has(e.id))continue
  const {error}=await supabase.from('engine_pdfs').insert({engine_id:e.id,type:'datasheet',label:'Cat G3500 Series Gas Engine Spec Sheet',storage_path:storage,file_size_bytes:buf.length})
  if(error){console.error(e.model,error.message);continue}
  n++;console.log('✓ '+e.model) }
console.log('\n✓ attached G3500 datasheet to '+n+' models ('+(buf.length/1024/1024).toFixed(1)+'MB)')
