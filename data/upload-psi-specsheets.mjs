import { createClient } from '@supabase/supabase-js'

// PSI (Power Solutions International) publishes per-displacement engine spec sheets on its
// site (PSI-Energy_{N}L-{Diesel|Gas}_Engine.pdf). These replace the earlier 20/40/53L O&M
// manuals (which were the spark-ignited owner's manuals) with proper diesel spec sheets.
// 26L and 66L have on-page specs only (no PDF published).
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const U = 'https://psiengines.com/wp-content/uploads/2025/08'

const SHEETS = [
  { match: '20L', url: `${U}/PSI-Energy_20L-Diesel_Engine.pdf`, label: 'PSI 20L Diesel Engine Spec Sheet', store: 'psi/spec-sheets/20l-diesel.pdf' },
  { match: '40L', url: `${U}/PSI-Energy_40L-Diesel_Engine.pdf`, label: 'PSI 40L Diesel Engine Spec Sheet', store: 'psi/spec-sheets/40l-diesel.pdf' },
  { match: '53L', url: `${U}/PSI-Energy_53L-Diesel_Engine.pdf`, label: 'PSI 53L Diesel Engine Spec Sheet', store: 'psi/spec-sheets/53l-diesel.pdf' },
  { match: '65L', url: `${U}/PSI-Energy_65L-Gas_Engine_FNL.pdf`, label: 'PSI 65L Engine Spec Sheet', store: 'psi/spec-sheets/65l.pdf' },
  { match: '88L', url: `${U}/PSI-Energy_88L-Diesel_Engine.pdf`, label: 'PSI 88L Diesel Engine Spec Sheet', store: 'psi/spec-sheets/88l-diesel.pdf' },
]

async function dl(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(60000) })
  if (!r.ok) return null
  const b = Buffer.from(await r.arrayBuffer())
  return b.slice(0, 4).toString() === '%PDF' ? b : null
}

const { data: engs } = await supabase.from('engines').select('id, model').eq('brand', 'PSI')

// drop the earlier spark-ignited O&M manual links — superseded by proper diesel spec sheets
const ids = engs.map(e => e.id)
await supabase.from('engine_pdfs').delete().in('engine_id', ids).like('storage_path', 'psi/manuals/%')

let linked = 0
for (const sh of SHEETS) {
  const models = engs.filter(e => e.model.includes(sh.match))
  process.stdout.write(`${sh.match} (${models.length}) ... `)
  const buf = await dl(sh.url)
  if (!buf) { console.log('download failed'); continue }
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(sh.store, buf, { contentType: 'application/pdf', upsert: true })
  if (upErr) { console.log('upload failed: ' + upErr.message); continue }
  let n = 0
  for (const e of models) {
    await supabase.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', sh.store)
    const { error } = await supabase.from('engine_pdfs').insert({ engine_id: e.id, type: 'datasheet', label: sh.label, storage_path: sh.store, file_size_bytes: buf.length })
    if (!error) { n++; linked++ }
  }
  console.log(`${Math.round(buf.length / 1024)}KB ✓ ${n} link(s)`)
}
console.log(`\n✓ ${linked} engine links (26L & 66L have on-page specs only — no PDF)`)
