// Attach official Baudouin M33/M55 datasheets (36 PDFs supplied by the user) to their exact engine
// rows. Filename encodes the model (…_12M55G8D2-5_…); our DB writes it as 12M55G8D2/5, so we match on
// a normalized (punctuation-stripped) key. Each attach is verified by confirming the model string
// appears in the PDF text. Files are small (≤0.6 MB) so no compression needed.
import { readFileSync, readdirSync } from 'fs'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const DIR = '/Users/ziqianhuang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/aassdfg684_5b6a/msg/file/2023-12/01-Datasheet'

const norm = (s) => s.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
const { data: engines } = await supabase.from('engines').select('id, model').eq('brand', 'Baudouin')
const byNorm = new Map(engines.map((e) => [norm(e.model), e]))

let attached = 0, already = 0, unmatched = [], unverified = []
for (const fn of readdirSync(DIR).filter((f) => f.endsWith('.pdf'))) {
  const m = fn.match(/_(\d+M\d+G[0-9A-Za-z]+D\d-\d)_(?:NoRad|StdRad)_Datasheet\.pdf/)
  if (!m) { unmatched.push(fn); continue }
  const fileModel = m[1]
  const eng = byNorm.get(norm(fileModel))
  if (!eng) { unmatched.push(fileModel); continue }
  const path = `${DIR}/${fn}`
  // verify model appears in the PDF text (slash form)
  let text = ''
  try { text = execSync(`pdftotext -layout "${path}" - 2>/dev/null`, { encoding: 'utf8', maxBuffer: 1 << 24 }) } catch {}
  if (norm(text).indexOf(norm(fileModel)) < 0) { unverified.push(fileModel); continue }
  const buf = readFileSync(path)
  const storage = `baudouin/${eng.model.replace(/[^A-Za-z0-9]+/g, '-').toLowerCase()}-datasheet.pdf`
  const { error: ul } = await supabase.storage.from('engine-pdfs').upload(storage, buf, { contentType: 'application/pdf', upsert: true })
  if (ul) { console.error('✗ upload', fileModel, ul.message); continue }
  const { data: ex } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', storage)
  if ((ex ?? []).some((r) => r.engine_id === eng.id)) { already++; continue }
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: eng.id, type: 'datasheet', label: `Baudouin ${eng.model} Datasheet`,
    storage_path: storage, file_size_bytes: buf.length,
  })
  if (error) { console.error('✗ link', fileModel, error.message); continue }
  attached++; console.log(`✓ ${eng.model}  (${(buf.length/1024).toFixed(0)}KB)`)
}
console.log(`\n✓ attached ${attached} datasheets, ${already} already linked`)
if (unverified.length) console.log('⚠ model not found in PDF text:', unverified.join(', '))
if (unmatched.length) console.log(`✗ no DB row (${unmatched.length}):`, unmatched.join(', '))
