// Attach Baudouin's OFFICIAL family PowerKit/Spec datasheets (from baudouin.com/downloads) to every
// still-missing variant of that family. These are the authoritative Baudouin engine datasheets and
// their per-variant rating tables cover the variants — so attaching the family sheet to e.g. all
// 6M21* variants is correct, not a guessed sibling. Verified by confirming the family code in the PDF.
import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'
const U = 'https://baudouin.com/wp-content/uploads'
const FAM = {
  '4M06': `${U}/2023/10/4M06_10403C_PK.S.308.EN_.06.22.pdf`,
  '4M10': `${U}/2023/10/4M10_10403D_PK.S.308.EN_.06.22-1.pdf`,
  '6M11': `${U}/2023/10/6M11_10403C_PK.S.308.EN_.06.22.pdf`,
  '6M16': `${U}/2023/10/6M16_10403C_PK.S.308.EN_.06.22.pdf`,
  '6M21': `${U}/2023/10/6M21_10403E_PK.S.308.EN_.06.22.pdf`,
  '6M33': `${U}/2023/10/6M33_10403E_PK.S.308.EN_.06.22.pdf`,
  '8M21': `${U}/2023/10/8M21_10403D_PK.S.308.EN_.06.22.pdf`,
  '8M33': `${U}/2023/10/10707_8M33_Spec_Sheet_revE.pdf`,
  '12M26': `${U}/2023/10/10403_12M26_Spec_Sheet_revB_-1.pdf`,
  '12M33': `${U}/2023/10/12M33_10403E_PK.S.308.EN_.06.22.pdf`,
  '12M55': `${U}/2023/10/12M55_10403E_PK.S.308.EN_.06.22.pdf`,
  '16M33': `${U}/2024/03/16M33_Spec_Sheet.pdf`,
  '16M55': `${U}/2023/10/10403_16M55_Spec_Sheet_revH.pdf`,
  '20M33': `${U}/2022/11/20M33_10403G_PK.S.308.EN_.06.22.pdf`,
}
const norm = (s) => s.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
const famOf = (m) => (m.match(/^(\d+M\d+)/) || [])[1]

const { data: engines } = await supabase.from('engines').select('id, model').eq('brand', 'Baudouin')
let pdfs = [], f = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id, type').in('engine_id', engines.map(e=>e.id)).range(f, f+999); pdfs = pdfs.concat(data); if (data.length < 1000) break; f += 1000 }
const hasDs = new Set(pdfs.filter(p => p.type === 'datasheet').map(p => p.engine_id))
const missing = engines.filter(e => !hasDs.has(e.id))

// download + upload each family sheet once, capturing its storage path
const famStore = {}
for (const [fam, url] of Object.entries(FAM)) {
  const needed = missing.some(e => famOf(e.model) === fam)
  if (!needed) continue
  const tmp = `/tmp/bdo/fam_${fam}.pdf`
  try { execSync(`curl -sL --max-time 60 "${url}" -A "${UA}" -o "${tmp}"`) } catch { console.error('dl fail', fam); continue }
  let buf; try { buf = readFileSync(tmp) } catch { continue }
  if (buf.length < 5000 || buf.slice(0,4).toString() !== '%PDF') { console.error('not pdf', fam); continue }
  let text=''; try { text = execSync(`pdftotext -layout "${tmp}" - 2>/dev/null`, {encoding:'utf8',maxBuffer:1<<25}) } catch {}
  if (norm(text).indexOf(norm(fam)) < 0) { console.error('family token not in PDF', fam); continue }
  const storage = `baudouin/${fam.toLowerCase()}-powerkit-datasheet.pdf`
  const { error: ul } = await supabase.storage.from('engine-pdfs').upload(storage, buf, { contentType:'application/pdf', upsert:true })
  if (ul) { console.error('upload fail', fam, ul.message); continue }
  famStore[fam] = { storage, size: buf.length }
  console.log(`· loaded ${fam} datasheet (${(buf.length/1024/1024).toFixed(1)}MB)`)
}

let attached = 0, uncovered = []
for (const e of missing) {
  const fam = famOf(e.model)
  const fs = famStore[fam]
  if (!fs) { uncovered.push(e.model); continue }
  const { data: ex } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', fs.storage)
  if ((ex??[]).some(r=>r.engine_id===e.id)) continue
  const { error } = await supabase.from('engine_pdfs').insert({ engine_id:e.id, type:'datasheet', label:`Baudouin ${fam} PowerKit Engine Datasheet`, storage_path:fs.storage, file_size_bytes:fs.size })
  if (error) { console.error('link fail', e.model, error.message); continue }
  attached++
}
console.log(`\n✓ attached family datasheets to ${attached} variants`)
const byFam={}; for(const m of uncovered){ const fm=famOf(m); (byFam[fm]??=[]).push(m) }
console.log(`✗ uncovered families (no standalone datasheet): ${Object.keys(byFam).join(', ')}`)
console.log(`  ${uncovered.length} variants:`, uncovered.join(', '))
