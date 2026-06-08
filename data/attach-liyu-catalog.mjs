// Attach the compressed Liyu Power bilingual brochure (9.9MB -> 4.1MB) as a downloadable
// on every Liyu Power engine page. Source: liyupower.com product pages. Idempotent.
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const LOCAL_PDF = '/tmp/liyu-min.pdf'
const STORAGE = 'liyu-power/liyu-power-brochure-2024.pdf'

const { data: engines } = await supabase.from('engines').select('id').eq('brand', 'Liyu Power')
console.log(`Liyu Power engines: ${engines.length}`)

const buf = readFileSync(LOCAL_PDF)
const { error: ulErr } = await supabase.storage.from('engine-pdfs')
  .upload(STORAGE, buf, { contentType: 'application/pdf', upsert: true })
if (ulErr) { console.error('✗ upload:', ulErr.message); process.exit(1) }
console.log(`✓ uploaded ${STORAGE} (${(buf.length / 1048576).toFixed(2)} MB)`)

const { data: existing } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', STORAGE)
const have = new Set((existing ?? []).map((r) => r.engine_id))
const rows = engines.filter((e) => !have.has(e.id)).map((e) => ({
  engine_id: e.id, type: 'brochure', label: 'Liyu Power Brochure (Bilingual, 2024)',
  storage_path: STORAGE, file_size_bytes: buf.length,
}))
if (rows.length) {
  const { error } = await supabase.from('engine_pdfs').insert(rows)
  if (error) { console.error('✗ link:', error.message); process.exit(1) }
}
console.log(`✓ linked to ${rows.length} engines (${have.size} already linked)`)
