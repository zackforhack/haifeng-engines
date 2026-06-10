// Attach the 2026 VMAN Sustainable Gas & Methanol Engine Catalog (6.3MB -> 4.8MB) to the VMAN
// HMM methanol engine pages.
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const STORAGE = 'vman/vman-sustainable-gas-methanol-catalog-2026.pdf'
const { data: engines } = await supabase.from('engines').select('id').eq('brand', 'VMAN').eq('series', 'HMM Methanol')
const buf = readFileSync('/tmp/vman-meth-min.pdf')
await supabase.storage.from('engine-pdfs').upload(STORAGE, buf, { contentType: 'application/pdf', upsert: true })
const { data: ex } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', STORAGE)
const have = new Set((ex ?? []).map((r) => r.engine_id))
const rows = engines.filter((e) => !have.has(e.id)).map((e) => ({ engine_id: e.id, type: 'brochure', label: 'VMAN Sustainable Gas & Methanol Engine Catalog 2026', storage_path: STORAGE, file_size_bytes: buf.length }))
if (rows.length) await supabase.from('engine_pdfs').insert(rows)
console.log(`✓ linked ${rows.length} VMAN methanol engines`)
