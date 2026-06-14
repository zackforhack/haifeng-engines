import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const norm = s => s.replace(/[^A-Za-z0-9]/g,'').toUpperCase()
const lp='/Users/ziqianhuang/Downloads/SS-7157026-18377766-010.pdf'
const model='3508', storage='caterpillar/3508-diesel-datasheet.pdf', label='Cat 3508 Diesel Engine Spec Sheet'
const {data:eng}=await supabase.from('engines').select('id').eq('brand','Caterpillar').eq('model',model).single()
if(!eng){console.error('no row');process.exit(1)}
const buf=readFileSync(lp)
const t=execSync(`pdftotext -layout "${lp}" - 2>/dev/null`,{encoding:'utf8',maxBuffer:1<<24})
if(norm(t).indexOf('3508')<0){console.error('model not in PDF');process.exit(1)}
const {error:ul}=await supabase.storage.from('engine-pdfs').upload(storage,buf,{contentType:'application/pdf',upsert:true})
if(ul){console.error(ul.message);process.exit(1)}
const {data:ex}=await supabase.from('engine_pdfs').select('engine_id').eq('storage_path',storage)
if(!(ex??[]).some(r=>r.engine_id===eng.id))
  await supabase.from('engine_pdfs').insert({engine_id:eng.id,type:'datasheet',label,storage_path:storage,file_size_bytes:buf.length})
console.log(`✓ ${model} (${(buf.length/1024).toFixed(0)}KB)`)
