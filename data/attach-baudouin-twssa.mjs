// Attach Baudouin PowerKit datasheets from twssa.co.za (filename carries the power-based model,
// e.g. ...Generator-6M16G220-5.pdf -> 6M16G220/5). Match to DB rows that currently LACK a datasheet,
// download, verify the model appears in the PDF text, upload + link.
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'
const norm = (s) => s.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

const urls = readFileSync('data/tw-urls.txt', 'utf8').split('\n').map(s => s.trim()).filter(Boolean)
const { data: engines } = await supabase.from('engines').select('id, model').eq('brand', 'Baudouin')
// which already have a datasheet
let pdfs = [], f = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id, type').in('engine_id', engines.map(e=>e.id)).range(f, f+999); pdfs = pdfs.concat(data); if (data.length < 1000) break; f += 1000 }
const hasDs = new Set(pdfs.filter(p => p.type === 'datasheet').map(p => p.engine_id))
const byNorm = new Map(engines.map(e => [norm(e.model), e]))

let attached = 0, already = 0, noRow = [], unverified = []
for (const u of urls) {
  const m = u.match(/Generator-(.+?)\.pdf$/)
  if (!m) continue
  const fileModel = m[1].replace(/-([56])$/, '/$1')   // 6M16G220-5 -> 6M16G220/5
  const eng = byNorm.get(norm(fileModel))
  if (!eng) { noRow.push(fileModel); continue }
  if (hasDs.has(eng.id)) { already++; continue }
  const full = `https://twssa.co.za${u}`
  const tmp = `/tmp/baud2/dl_${norm(fileModel)}.pdf`
  try { execSync(`curl -sL --max-time 40 "${full}" -A "${UA}" -o "${tmp}"`) } catch { continue }
  let buf; try { buf = readFileSync(tmp) } catch { continue }
  if (buf.length < 5000 || buf.slice(0,4).toString() !== '%PDF') { continue }
  let text = ''; try { text = execSync(`pdftotext -layout "${tmp}" - 2>/dev/null`, { encoding: 'utf8', maxBuffer: 1<<24 }) } catch {}
  if (norm(text).indexOf(norm(fileModel)) < 0) { unverified.push(fileModel); continue }
  const storage = `baudouin/${eng.model.replace(/[^A-Za-z0-9]+/g,'-').toLowerCase()}-datasheet.pdf`
  const { error: ul } = await supabase.storage.from('engine-pdfs').upload(storage, buf, { contentType: 'application/pdf', upsert: true })
  if (ul) { console.error('✗ upload', fileModel, ul.message); continue }
  const { data: ex } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', storage)
  if ((ex??[]).some(r=>r.engine_id===eng.id)) { already++; continue }
  const { error } = await supabase.from('engine_pdfs').insert({ engine_id: eng.id, type:'datasheet', label:`Baudouin ${eng.model} Datasheet`, storage_path: storage, file_size_bytes: buf.length })
  if (error) { console.error('✗ link', fileModel, error.message); continue }
  attached++; console.log(`✓ ${eng.model} (${(buf.length/1024).toFixed(0)}KB)`)
}
console.log(`\n✓ attached ${attached}, already had ${already}`)
if (unverified.length) console.log('⚠ model not in PDF:', unverified.join(', '))
if (noRow.length) console.log(`no DB row (${noRow.length}):`, noRow.join(', '))
