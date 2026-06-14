import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const lp='/tmp/cat/cg170.pdf', storage='caterpillar/cg170-series-gas-datasheet.pdf', label='Cat CG170 Series Gas Generator Set Spec Sheet'
const MODELS=['CG170-12','CG170-16','CG170B-12','CG170B-16','CG170B-20']
const buf=readFileSync(lp)
const t=execSync(`pdftotext -layout "${lp}" - 2>/dev/null`,{encoding:'utf8',maxBuffer:1<<24})
if(t.replace(/[^A-Za-z0-9]/g,'').indexOf('CG170')<0){console.error('CG170 token missing');process.exit(1)}
const {error:ul}=await supabase.storage.from('engine-pdfs').upload(storage,buf,{contentType:'application/pdf',upsert:true})
if(ul){console.error(ul.message);process.exit(1)}
const {data:engines}=await supabase.from('engines').select('id,model').eq('brand','Caterpillar').in('model',MODELS)
const {data:ex}=await supabase.from('engine_pdfs').select('engine_id').eq('storage_path',storage)
const have=new Set((ex??[]).map(r=>r.engine_id)); let n=0
for(const e of engines){ if(have.has(e.id))continue
  const {error}=await supabase.from('engine_pdfs').insert({engine_id:e.id,type:'datasheet',label,storage_path:storage,file_size_bytes:buf.length})
  if(error){console.error(e.model,error.message);continue}; n++;console.log('✓ '+e.model) }
console.log('\n✓ attached to '+n+' CG170 models')
