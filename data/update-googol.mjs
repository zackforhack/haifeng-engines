// Googol catalog 2026: the engines are already in the DB with power data, but
// fuel_type was null (so they don't show under the Diesel filter). The catalog
// confirms the QTA/QTAA/PTAA lineup is high-power DIESEL. Set fuel/ignition, and
// attach the (compressed) catalog as a downloadable brochure on each Googol engine.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const LOCAL_PDF = '/tmp/googol-min.pdf'
const STORAGE = 'googol/googol-engine-catalog-2026.pdf'

const { data: googol, error: gErr } = await supabase.from('engines').select('id, model').ilike('brand', '%googol%')
if (gErr) { console.error('✗', gErr.message); process.exit(1) }
const ids = googol.map((e) => e.id)
console.log(`Googol engines: ${ids.length}`)

// 1) fuel_type + ignition_type (fills the null gap → shows under Diesel filter)
const { error: uErr } = await supabase.from('engines')
  .update({ fuel_type: 'Diesel', ignition_type: 'Compression Ignition' }).in('id', ids)
if (uErr) { console.error('✗ update:', uErr.message); process.exit(1) }
console.log('✓ set fuel_type=Diesel + ignition for all Googol')

// 2) upload compressed catalog
const buf = readFileSync(LOCAL_PDF)
const { error: ulErr } = await supabase.storage.from('engine-pdfs')
  .upload(STORAGE, buf, { contentType: 'application/pdf', upsert: true })
if (ulErr) { console.error('✗ upload:', ulErr.message); process.exit(1) }
console.log(`✓ uploaded ${STORAGE} (${(buf.length / 1048576).toFixed(2)} MB)`)

// 3) link the catalog as a brochure on each Googol engine (idempotent)
const { data: existing } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', STORAGE)
const have = new Set((existing ?? []).map((r) => r.engine_id))
const rows = googol.filter((e) => !have.has(e.id)).map((e) => ({
  engine_id: e.id, type: 'brochure', label: 'Googol Engine Catalog 2026',
  storage_path: STORAGE, file_size_bytes: buf.length,
}))
if (rows.length) {
  const { error: lErr } = await supabase.from('engine_pdfs').insert(rows)
  if (lErr) { console.error('✗ link:', lErr.message); process.exit(1) }
}
console.log(`✓ linked catalog to ${rows.length} engines (${have.size} already linked)`)
console.log('\nDone.')
