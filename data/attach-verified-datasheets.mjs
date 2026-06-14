// Attach OEM spec-sheet PDFs that were VERIFIED to match the exact model (the model string appears in
// the downloaded PDF text). Reusable across brands; only add a row here after verifying the match, so
// we never link a sibling/wrong-variant sheet. Pattern mirrors the PSI datasheet attach.
import { readFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)

// [brand, model, localPdf, storagePath, label]
const VERIFIED = [
  ['Cummins', 'HSK78G', '/tmp/hsk78g.pdf', 'cummins/hsk78g-natural-gas-spec-sheet.pdf', 'Cummins HSK78G Gas Generator Spec Sheet'],
]

for (const [brand, model, localPdf, storage, label] of VERIFIED) {
  if (!existsSync(localPdf)) { console.error(`✗ ${brand} ${model}: missing ${localPdf}`); continue }
  const { data: eng } = await supabase.from('engines').select('id').eq('brand', brand).eq('model', model)
  if (!eng?.length) { console.error(`✗ ${brand} ${model}: no engine row`); continue }
  const buf = readFileSync(localPdf)
  const { error: ul } = await supabase.storage.from('engine-pdfs').upload(storage, buf, { contentType: 'application/pdf', upsert: true })
  if (ul) { console.error(`✗ ${brand} ${model} upload: ${ul.message}`); continue }
  const { data: ex } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', storage)
  const have = new Set((ex ?? []).map((r) => r.engine_id))
  const rows = eng.filter((e) => !have.has(e.id)).map((e) => ({ engine_id: e.id, type: 'datasheet', label, storage_path: storage, file_size_bytes: buf.length }))
  if (rows.length) { const { error } = await supabase.from('engine_pdfs').insert(rows); if (error) { console.error(`✗ ${brand} ${model} link: ${error.message}`); continue } }
  console.log(`✓ ${brand} ${model}: ${(buf.length/1048576).toFixed(2)}MB -> linked ${rows.length} (${have.size} existing)`)
}
