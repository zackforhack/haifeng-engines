// Attach FPT family Industrial sell-sheets (klassendiesel.com mirror, official FPT spec content) to
// their diesel variants. Family-level datasheet covering the engine family (NEF45/NEF67/Cursor9/
// Cursor16/F34/F36); verified by family token in the PDF. N67* = NEF67 (6.7L). Gas (NG) + Cursor13 +
// C90 have no source here and are skipped.
import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'
const K = 'https://klassendiesel.com/wp-content/uploads/2023/07/FPT_Industrial-Off-Road-sell-sheet'
const FAM = {
  NEF45:   { url: `${K}_NEF-45_lores-1.pdf`,   token: 'NEF45',    label: 'FPT NEF45 Industrial Engine Datasheet' },
  NEF67:   { url: `${K}_NEF-67_lores-1.pdf`,   token: 'NEF67',    label: 'FPT NEF67 Industrial Engine Datasheet' },
  Cursor9: { url: `${K}_Cursor-9_lores-1.pdf`, token: 'CURSOR9',  label: 'FPT Cursor 9 Industrial Engine Datasheet' },
  Cursor16:{ url: `${K}_Cursor-16_lores-1.pdf`,token: 'CURSOR16', label: 'FPT Cursor 16 Industrial Engine Datasheet' },
  F34:     { url: `${K}_F34_lores-1.pdf`,      token: 'F34',      label: 'FPT F34 Industrial Engine Datasheet' },
  F36:     { url: `${K}_F36_lores-1.pdf`,      token: 'F36',      label: 'FPT F36 Industrial Engine Datasheet' },
}
const norm = (s) => s.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
function famFor(model, fuel) {
  if (fuel === 'Natural Gas') return null
  const m = norm(model)
  if (m.startsWith('NEF45')) return 'NEF45'
  if (m.startsWith('NEF67') || m.startsWith('N67')) return 'NEF67'
  if (m.startsWith('C87')) return 'Cursor9'
  if (m.startsWith('C16')) return 'Cursor16'
  if (m.startsWith('F34')) return 'F34'
  if (m.startsWith('F36')) return 'F36'
  return null
}

const { data: engines } = await supabase.from('engines').select('id, model, fuel_type').eq('brand', 'FPT')
let pdfs = [], f = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id, type').in('engine_id', engines.map(e=>e.id)).range(f, f+999); pdfs = pdfs.concat(data); if (data.length < 1000) break; f += 1000 }
const hasDs = new Set(pdfs.filter(p => p.type === 'datasheet').map(p => p.engine_id))
const missing = engines.filter(e => !hasDs.has(e.id))

const store = {}
for (const [fam, cfg] of Object.entries(FAM)) {
  if (!missing.some(e => famFor(e.model, e.fuel_type) === fam)) continue
  const tmp = `/tmp/fpt/f_${fam}.pdf`
  try { execSync(`curl -sL --max-time 40 "${cfg.url}" -A "${UA}" -o "${tmp}"`) } catch { console.error('dl', fam); continue }
  let buf; try { buf = readFileSync(tmp) } catch { continue }
  if (buf.length < 5000 || buf.slice(0,4).toString() !== '%PDF') { console.error('notpdf', fam); continue }
  let t=''; try { t = execSync(`pdftotext -layout "${tmp}" - 2>/dev/null`,{encoding:'utf8',maxBuffer:1<<24}) } catch {}
  if (norm(t).indexOf(cfg.token) < 0) { console.error('token miss', fam); continue }
  const storage = `fpt/${fam.toLowerCase()}-industrial-datasheet.pdf`
  const { error: ul } = await supabase.storage.from('engine-pdfs').upload(storage, buf, { contentType:'application/pdf', upsert:true })
  if (ul) { console.error('upload', fam, ul.message); continue }
  store[fam] = { storage, size: buf.length, label: cfg.label }
  console.log(`· loaded ${fam} (${(buf.length/1024).toFixed(0)}KB)`)
}

let attached = 0, skip = []
for (const e of missing) {
  const fam = famFor(e.model, e.fuel_type)
  const s = fam && store[fam]
  if (!s) { skip.push(e.model); continue }
  const { data: ex } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', s.storage)
  if ((ex??[]).some(r=>r.engine_id===e.id)) continue
  const { error } = await supabase.from('engine_pdfs').insert({ engine_id:e.id, type:'datasheet', label:s.label, storage_path:s.storage, file_size_bytes:s.size })
  if (error) { console.error('link', e.model, error.message); continue }
  attached++; console.log(`✓ ${e.model} -> ${fam}`)
}
console.log(`\n✓ attached ${attached}; not covered (${skip.length}):`, skip.join(', '))
