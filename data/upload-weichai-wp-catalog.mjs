import { createClient } from '@supabase/supabase-js'

// Official public Weichai America WP-series G-Drive engines catalog, linked as a brochure to
// every WP-prefixed Weichai engine. Source provided by user:
//   https://www.weichaiamerica.com/images/literature/catalogs/catalog_g-drives-engines.pdf
// The larger M-series (6M/8M/12M/16M/20M) is NOT covered by this WP catalog.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const URL = 'https://www.weichaiamerica.com/images/literature/catalogs/catalog_g-drives-engines.pdf'
const STORE = 'weichai/brochures/wp-series-gdrive-catalog.pdf'

const res = await fetch(URL, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(60000) })
const buf = Buffer.from(await res.arrayBuffer())
if (buf.slice(0, 4).toString() !== '%PDF') { console.error('not a PDF'); process.exit(1) }
const { error: up } = await supabase.storage.from(BUCKET).upload(STORE, buf, { contentType: 'application/pdf', upsert: true })
if (up) { console.error('upload failed: ' + up.message); process.exit(1) }

const { data: engs } = await supabase.from('engines').select('id, model').eq('brand', 'Weichai')
const wp = engs.filter(e => /^WP/i.test(e.model))
let n = 0
for (const e of wp) {
  await supabase.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', STORE)
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: e.id, type: 'brochure', label: 'Weichai WP-Series G-Drive Engines Catalog', storage_path: STORE, file_size_bytes: buf.length,
  })
  if (!error) n++
}
console.log(`Weichai WP catalog (${Math.round(buf.length / 1024)}KB) linked to ${n} WP engines (${engs.length - wp.length} M-series not covered)`)
