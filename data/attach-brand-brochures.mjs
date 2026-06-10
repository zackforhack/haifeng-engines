// Attach a brand-level brochure/datasheet to every engine of the 13 brands that previously had
// no PDF. Idempotent (skips engines already linked). Source PDFs are staged in /tmp (downloaded
// during research / fetched from each maker or an authorized distributor, then compressed).
import { readFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)

// [brand, localPdf, storagePath, label]
const CONFIG = [
  ['Wärtsilä', '/tmp/br-wartsila.pdf', 'wartsila/wartsila-34sg-leaflet.pdf', 'Wärtsilä 34SG Leaflet'],
  ['Waukesha', '/tmp/br-waukesha.pdf', 'waukesha/waukesha-vhp-series-five-brochure.pdf', 'Waukesha VHP Series Five Brochure'],
  ['Bergen', '/tmp/br-bergen.pdf', 'bergen/bergen-b3645v-gas-spec.pdf', 'Bergen B36:45V Gas Spec Sheet'],
  ['Kawasaki', '/tmp/br-kawasaki.pdf', 'kawasaki/kawasaki-green-gas-engine-leaflet.pdf', 'Kawasaki Green Gas Engine Leaflet'],
  ['Jenbacher', '/tmp/br-jenbacher.pdf', 'jenbacher/jenbacher-type-3-datasheet.pdf', 'Jenbacher Type 3 Datasheet'],
  ['Doosan', '/tmp/br-doosan.pdf', 'doosan/doosan-gv-gas-engine-manual.pdf', 'Doosan GV-series Gas Engine Manual'],
  ['Generac', '/tmp/br-generac.pdf', 'generac/generac-gaseous-industrial-spec.pdf', 'Generac Industrial Gaseous Spec Sheet'],
  ['Mesa', '/tmp/br-mesa.pdf', 'mesa/mesa-gv22pu-spec-sheet.pdf', 'Mesa GV22PU Spec Sheet'],
  ['Niigata', '/tmp/br-niigata.pdf', 'niigata/niigata-engine-selection-guide.pdf', 'Niigata (IHI) Engine Selection Guide'],
  ['Ford', '/tmp/br-ford.pdf', 'ford/ford-msg425-spec-sheet.pdf', 'Ford MSG425 Spec Sheet'],
  ['VM Motori', '/tmp/br-vmmotori.pdf', 'vm-motori/vm-motori-high-performance-diesel-brochure.pdf', 'VM Motori Diesel Engines Brochure'],
  ['Komatsu', '/tmp/br-komatsu.pdf', 'komatsu/komatsu-engine-service-manual.pdf', 'Komatsu Diesel Engine Manual (excerpt)'],
  ['Lovol', '/tmp/br-lovol.pdf', 'lovol/lovol-1000-series-handbook.pdf', 'Lovol 1000 Series Engine Handbook'],
]

for (const [brand, localPdf, storage, label] of CONFIG) {
  if (!existsSync(localPdf)) { console.error(`✗ ${brand}: missing ${localPdf} (re-download to re-run)`); continue }
  const { data: engines } = await supabase.from('engines').select('id').eq('brand', brand)
  const buf = readFileSync(localPdf)
  const { error: ul } = await supabase.storage.from('engine-pdfs').upload(storage, buf, { contentType: 'application/pdf', upsert: true })
  if (ul) { console.error(`✗ ${brand} upload: ${ul.message}`); continue }
  const { data: ex } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', storage)
  const have = new Set((ex ?? []).map((r) => r.engine_id))
  const rows = engines.filter((e) => !have.has(e.id)).map((e) => ({ engine_id: e.id, type: 'brochure', label, storage_path: storage, file_size_bytes: buf.length }))
  if (rows.length) { const { error } = await supabase.from('engine_pdfs').insert(rows); if (error) { console.error(`✗ ${brand} link: ${error.message}`); continue } }
  console.log(`✓ ${brand}: ${(buf.length / 1048576).toFixed(2)}MB -> linked ${rows.length} (${have.size} already)`)
}
