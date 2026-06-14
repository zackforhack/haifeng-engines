// FPT Cursor 13 datasheets: ctm.it hosts an exact per-model sheet (C13TE2F.pdf == "C13 TE2F"); the two
// C13ETVP variants use the official FPT Cursor 13 Stage V G-Drive genset datasheet (thtsales mirror).
// ctm filename is model-exact (user-provided) and the PDF carries spec data; thtsales verified to
// contain "C13".
import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'
const norm = (s) => s.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

// [model, url, storage, label, requireToken]
const JOBS = [
  ['C13 TE2F', 'https://www.ctm.it/Datasheet/C13TE2F.pdf', 'fpt/c13-te2f-datasheet.pdf', 'FPT C13 TE2F Datasheet', null],
  ['C13ETVP03.A363', 'https://thtsales.com.au/wp-content/uploads/2024/01/Stage-V-FPT-Cursor-13-450kW.pdf', 'fpt/cursor-13-gdrive-datasheet.pdf', 'FPT Cursor 13 (C13) G-Drive Datasheet', 'C13'],
  ['C13ETVP03.0A395', 'https://thtsales.com.au/wp-content/uploads/2024/01/Stage-V-FPT-Cursor-13-450kW.pdf', 'fpt/cursor-13-gdrive-datasheet.pdf', 'FPT Cursor 13 (C13) G-Drive Datasheet', 'C13'],
]
const { data: engines } = await supabase.from('engines').select('id, model').eq('brand', 'FPT')
const byModel = new Map(engines.map(e => [e.model, e]))

let attached = 0
for (const [model, url, storage, label, token] of JOBS) {
  const eng = byModel.get(model)
  if (!eng) { console.error('no row', model); continue }
  const tmp = `/tmp/fpt/c13_${norm(model)}.pdf`
  try { execSync(`curl -sL --max-time 40 "${url}" -A "${UA}" -o "${tmp}"`) } catch { console.error('dl', model); continue }
  let buf; try { buf = readFileSync(tmp) } catch { continue }
  if (buf.length < 5000 || buf.slice(0,4).toString() !== '%PDF') { console.error('notpdf', model); continue }
  let t=''; try { t = execSync(`pdftotext -layout "${tmp}" - 2>/dev/null`,{encoding:'utf8',maxBuffer:1<<24}) } catch {}
  // require spec keyword always; token (C13) when family-level
  if (!/displacement|kw|kva|bore/i.test(t)) { console.error('no spec content', model); continue }
  if (token && norm(t).indexOf(norm(token)) < 0) { console.error('token miss', model); continue }
  const { error: ul } = await supabase.storage.from('engine-pdfs').upload(storage, buf, { contentType:'application/pdf', upsert:true })
  if (ul) { console.error('upload', model, ul.message); continue }
  const { data: ex } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', storage)
  if ((ex??[]).some(r=>r.engine_id===eng.id)) { console.log('· already', model); continue }
  const { error } = await supabase.from('engine_pdfs').insert({ engine_id:eng.id, type:'datasheet', label, storage_path:storage, file_size_bytes:buf.length })
  if (error) { console.error('link', model, error.message); continue }
  attached++; console.log(`✓ ${model} (${(buf.length/1024).toFixed(0)}KB)`)
}
console.log(`\n✓ attached ${attached}`)
