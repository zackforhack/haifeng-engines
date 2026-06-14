// Attach Cat per-model spec sheets from emc.cat.com (verified: model string present in PDF text).
// Only confident exact-model matches — Cat's doc IDs are cryptic and per-rating, so each is checked.
import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const norm = s => s.replace(/[^A-Za-z0-9]/g,'').toUpperCase()
// [model, localpdf, storage, label, token]
const JOBS = [
  ['C32', '/tmp/cat/c32.pdf', 'caterpillar/c32-diesel-genset-datasheet.pdf', 'Cat C32 Diesel Generator Set Spec Sheet', 'C32'],
  ['3512', '/tmp/cat/3512.pdf', 'caterpillar/3512-diesel-genset-datasheet.pdf', 'Cat 3512 Diesel Generator Set Spec Sheet', '3512'],
  ['C175-16', '/tmp/cat/c175-16.pdf', 'caterpillar/c175-16-diesel-genset-datasheet.pdf', 'Cat C175-16 Diesel Generator Set Spec Sheet', 'C175'],
]
const { data: engines } = await supabase.from('engines').select('id, model').eq('brand','Caterpillar')
const byModel = new Map(engines.map(e=>[e.model, e]))
let n=0
for (const [model, lp, storage, label, token] of JOBS) {
  const eng = byModel.get(model); if (!eng) { console.error('no row', model); continue }
  let buf; try { buf = readFileSync(lp) } catch { console.error('no file', model); continue }
  if (buf.length<5000 || buf.slice(0,4).toString()!=='%PDF') { console.error('notpdf', model); continue }
  let t=''; try { t = execSync(`pdftotext -layout "${lp}" - 2>/dev/null`,{encoding:'utf8',maxBuffer:1<<24}) } catch {}
  if (norm(t).indexOf(norm(token))<0) { console.error('token miss', model); continue }
  const { error: ul } = await supabase.storage.from('engine-pdfs').upload(storage, buf, {contentType:'application/pdf',upsert:true})
  if (ul) { console.error('upload', model, ul.message); continue }
  const { data: ex } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', storage)
  if (!(ex??[]).some(r=>r.engine_id===eng.id))
    await supabase.from('engine_pdfs').insert({ engine_id:eng.id, type:'datasheet', label, storage_path:storage, file_size_bytes:buf.length })
  n++; console.log(`✓ ${model} (${(buf.length/1024).toFixed(0)}KB)`)
}
console.log(`\n✓ attached ${n}`)
