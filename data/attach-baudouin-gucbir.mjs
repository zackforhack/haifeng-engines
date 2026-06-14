// Fill remaining Baudouin datasheet gaps from gucbirjenerator.com, which hosts a per-model engine
// datasheet at /engine/baudouin/{MODEL}.pdf (model uses '-' where our DB uses '/'). For every Baudouin
// row still lacking a datasheet, try the constructed URL, verify the model appears in the PDF, attach.
import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'
const norm = (s) => s.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

const { data: engines } = await supabase.from('engines').select('id, model').eq('brand', 'Baudouin')
let pdfs = [], f = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id, type').in('engine_id', engines.map(e=>e.id)).range(f, f+999); pdfs = pdfs.concat(data); if (data.length < 1000) break; f += 1000 }
const hasDs = new Set(pdfs.filter(p => p.type === 'datasheet').map(p => p.engine_id))
const missing = engines.filter(e => !hasDs.has(e.id))
console.log(`Baudouin missing datasheet: ${missing.length}`)

let attached = 0, notfound = [], unverified = []
for (const e of missing) {
  // candidate URL variants: model as-is with / -> -, also strip a trailing ^ if present
  const base = e.model.replace(/\^/g,'').trim()
  const cands = [base.replace(/\//g,'-'), base.replace(/\//g,'-').toUpperCase()]
  let done = false
  for (const c of [...new Set(cands)]) {
    const url = `https://www.gucbirjenerator.com/engine/baudouin/${encodeURIComponent(c)}.pdf`
    const tmp = `/tmp/baud2/gb_${norm(e.model)}.pdf`
    try { execSync(`curl -sL --max-time 30 "${url}" -A "${UA}" -o "${tmp}"`) } catch { continue }
    let buf; try { buf = readFileSync(tmp) } catch { continue }
    if (buf.length < 5000 || buf.slice(0,4).toString() !== '%PDF') continue
    let text=''; try { text = execSync(`pdftotext -layout "${tmp}" - 2>/dev/null`, {encoding:'utf8',maxBuffer:1<<24}) } catch {}
    if (norm(text).indexOf(norm(base)) < 0) { unverified.push(e.model); break }
    const storage = `baudouin/${e.model.replace(/[^A-Za-z0-9]+/g,'-').toLowerCase()}-datasheet.pdf`
    const { error: ul } = await supabase.storage.from('engine-pdfs').upload(storage, buf, { contentType:'application/pdf', upsert:true })
    if (ul) { console.error('✗ upload', e.model, ul.message); break }
    const { data: ex } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', storage)
    if (!(ex??[]).some(r=>r.engine_id===e.id))
      await supabase.from('engine_pdfs').insert({ engine_id:e.id, type:'datasheet', label:`Baudouin ${e.model} Datasheet`, storage_path:storage, file_size_bytes:buf.length })
    attached++; console.log(`✓ ${e.model} (${(buf.length/1024).toFixed(0)}KB)`); done = true; break
  }
  if (!done && !unverified.includes(e.model)) notfound.push(e.model)
}
console.log(`\n✓ gucbir attached ${attached}`)
if (unverified.length) console.log(`⚠ found but model mismatch (${unverified.length}):`, unverified.slice(0,30).join(', '))
console.log(`✗ not on gucbir (${notfound.length}):`, notfound.slice(0,40).join(', '))
