// Fill Baudouin datasheet gaps from emsa.gen.tr, which hosts per-model genset datasheets at
// .../Baudouin/{50 Hz|60 Hz}/{MODEL}_DataSheet_Gb.pdf (model '/' -> '-', folder picked by the
// trailing /5 or /6). For every Baudouin row still lacking a datasheet, try the URL, verify the
// model appears in the PDF (404s return HTML, so we also check the %PDF magic), then attach.
import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'
const BASE = 'https://www.emsa.gen.tr/images/brochures/TECHNICAL%20DOCUMENTS/ENGINE%20DATASHEET/Baudouin'
const norm = (s) => s.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

const { data: engines } = await supabase.from('engines').select('id, model').eq('brand', 'Baudouin')
let pdfs = [], f = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id, type').in('engine_id', engines.map(e=>e.id)).range(f, f+999); pdfs = pdfs.concat(data); if (data.length < 1000) break; f += 1000 }
const hasDs = new Set(pdfs.filter(p => p.type === 'datasheet').map(p => p.engine_id))
const missing = engines.filter(e => !hasDs.has(e.id))
console.log(`Baudouin missing: ${missing.length}`)

let attached = 0, notfound = []
for (const e of missing) {
  const base = e.model.replace(/\^/g,'').trim()
  const file = base.replace(/\//g,'-') + '_DataSheet_Gb.pdf'
  const folders = base.endsWith('/6') ? ['60%20Hz'] : base.endsWith('/5') ? ['50%20Hz'] : ['50%20Hz','60%20Hz']
  let done = false
  for (const fld of folders) {
    const url = `${BASE}/${fld}/${encodeURIComponent(file)}`
    const tmp = `/tmp/emsa/dl_${norm(e.model)}.pdf`
    try { execSync(`curl -sL --max-time 30 "${url}" -A "${UA}" -o "${tmp}"`) } catch { continue }
    let buf; try { buf = readFileSync(tmp) } catch { continue }
    if (buf.length < 5000 || buf.slice(0,4).toString() !== '%PDF') continue
    let text=''; try { text = execSync(`pdftotext -layout "${tmp}" - 2>/dev/null`, {encoding:'utf8',maxBuffer:1<<24}) } catch {}
    if (norm(text).indexOf(norm(base)) < 0) continue
    const storage = `baudouin/${e.model.replace(/[^A-Za-z0-9]+/g,'-').toLowerCase()}-datasheet.pdf`
    const { error: ul } = await supabase.storage.from('engine-pdfs').upload(storage, buf, { contentType:'application/pdf', upsert:true })
    if (ul) { console.error('✗ upload', e.model, ul.message); break }
    const { data: ex } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', storage)
    if (!(ex??[]).some(r=>r.engine_id===e.id))
      await supabase.from('engine_pdfs').insert({ engine_id:e.id, type:'datasheet', label:`Baudouin ${e.model} Datasheet`, storage_path:storage, file_size_bytes:buf.length })
    attached++; console.log(`✓ ${e.model} (${(buf.length/1024).toFixed(0)}KB)`); done = true; break
  }
  if (!done) notfound.push(e.model)
}
console.log(`\n✓ emsa attached ${attached}`)
console.log(`✗ not on emsa (${notfound.length}):`, notfound.join(', '))
