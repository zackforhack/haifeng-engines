import { createClient } from '@supabase/supabase-js'

// Weichai's HHP M-series land-genset engines are Baudouin-platform engines (Weichai owns
// Baudouin). No Weichai catalog covers them, so we cross-link the matching official Baudouin
// M-platform spec sheets (already in the bucket) to each Weichai M model by platform token.
// 20M33 isn't a Baudouin DB model, so its sheet is fetched & uploaded here. 6M31 has no
// Baudouin equivalent and is left uncovered.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

// platform token -> existing Baudouin sheet storage_path (already uploaded for Baudouin brand)
const PLATFORM = {
  '6M33':  'baudouin/spec-sheets/6M33G750-5.pdf',
  '8M33':  'baudouin/spec-sheets/8M33G1100-5.pdf',
  '12M26': 'baudouin/spec-sheets/12M26G1000-5.pdf',
  '12M33': 'baudouin/spec-sheets/12M33G1500-5.pdf',
  '16M33': 'baudouin/spec-sheets/16M33G2000-5.pdf',
  '12M55': 'baudouin/spec-sheets/12M55.pdf',
  '16M55': 'baudouin/spec-sheets/16M55.pdf',
  // 20M33 added below after upload
}
const SIZE = {}  // storage_path -> bytes (look up from an existing row)

// ensure the 20M33 Baudouin sheet is in the bucket
const STORE_20M33 = 'baudouin/spec-sheets/20M33.pdf'
const res = await fetch('https://baudouin.com/wp-content/uploads/2022/11/20M33_10403G_PK.S.308.EN_.06.22.pdf', { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(40000) })
const buf20 = Buffer.from(await res.arrayBuffer())
if (buf20.slice(0, 4).toString() === '%PDF') {
  await supabase.storage.from(BUCKET).upload(STORE_20M33, buf20, { contentType: 'application/pdf', upsert: true })
  PLATFORM['20M33'] = STORE_20M33
  SIZE[STORE_20M33] = buf20.length
}

// file sizes for the reused Baudouin sheets (from existing engine_pdfs rows)
const paths = [...new Set(Object.values(PLATFORM))]
const { data: existing } = await supabase.from('engine_pdfs').select('storage_path, file_size_bytes').in('storage_path', paths)
for (const r of (existing ?? [])) if (r.file_size_bytes) SIZE[r.storage_path] = r.file_size_bytes

const platformOf = (m) => (m.match(/^(\d+M\d+)/) || [])[1]
const PAGE = 1000; let pdfs = []; let from = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id').range(from, from + PAGE - 1); pdfs.push(...(data ?? [])); if (!data || data.length < PAGE) break; from += PAGE }
const withPdf = new Set(pdfs.map(p => p.engine_id))
const { data: wc } = await supabase.from('engines').select('id, model').eq('brand', 'Weichai')
const missing = wc.filter(e => !/^WP/i.test(e.model) && !withPdf.has(e.id))

let linked = 0; const noMatch = []
for (const e of missing) {
  const plat = platformOf(e.model)
  const sp = PLATFORM[plat]
  if (!sp) { noMatch.push(e.model); continue }
  await supabase.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', sp)
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: e.id, type: 'datasheet',
    label: `Baudouin ${plat} Spec Sheet (Weichai HHP is Baudouin-built)`,
    storage_path: sp, file_size_bytes: SIZE[sp] ?? null,
  })
  if (!error) linked++
}
console.log(`✓ ${linked} Weichai M-series engines cross-linked to Baudouin sheets`)
console.log(`no Baudouin platform match: ${noMatch.join(', ') || 'none'}`)
