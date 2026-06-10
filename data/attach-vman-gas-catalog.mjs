// Attach the VMAN Gas Genset Catalog 2026 (3.1MB) to the VMAN gas-engine pages (series like '%Gas%').
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const STORAGE = 'vman/vman-gas-genset-catalog-2026.pdf'
const { data: engines } = await supabase.from('engines').select('id').eq('brand', 'VMAN').like('series', '%Gas%')
const buf = readFileSync('/tmp/vman-gas-min.pdf')
await supabase.storage.from('engine-pdfs').upload(STORAGE, buf, { contentType: 'application/pdf', upsert: true })
const { data: ex } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', STORAGE)
const have = new Set((ex ?? []).map((r) => r.engine_id))
const rows = engines.filter((e) => !have.has(e.id)).map((e) => ({ engine_id: e.id, type: 'brochure', label: 'VMAN Gas Genset Catalog 2026', storage_path: STORAGE, file_size_bytes: buf.length }))
if (rows.length) await supabase.from('engine_pdfs').insert(rows)
console.log(`✓ linked ${rows.length} VMAN gas engines`)
