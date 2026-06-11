// Attach PSI official spec-sheet PDFs (downloaded from psiengines.com) as downloadable 'datasheet'
// PDFs on each matching PSI engine row. Uploads each PDF once to the engine-pdfs bucket at
// psi/<file>, then links via engine_pdfs (type 'datasheet'). Idempotent: skips engine rows already
// linked to that storage_path. Industrial-gasoline and 2.0/6.0/65L sheets are skipped (no matching
// NG/diesel genset row in the DB).
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const DIR = '/tmp/psipdf/'

// pdf file -> { slugs:[...], label }
const MAP = [
  ['PSI-PSYSTEMS_2.4L-Gas_Engine.pdf',   ['psi-gas-2-4l'],            'PSI 2.4L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_2.4LT-Gas_Engine.pdf',  ['psi-gas-2-4l-t'],          'PSI 2.4L-T Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_4.3L-Gas_Engine.pdf',   ['psi-gas-4-3l'],            'PSI 4.3L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_4.5L-Gas_Engine.pdf',   ['psi-gas-4-5l'],            'PSI 4.5L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_5.7L-Gas_Engine.pdf',   ['psi-gas-5-7l'],            'PSI 5.7L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_5.7LCAC-Gas_Engine-3.pdf', ['psi-gas-5-7l-t','psi-gas-5-7l-tcac'], 'PSI 5.7L T/TCAC Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_6.7LNA.pdf',            ['psi-gas-6-7l'],            'PSI 6.7L Gas Engine Spec Sheet'],
  ['PSI-Energy_6.7L-T-Gas_Engine.pdf',   ['psi-gas-6-7l-t'],          'PSI 6.7L-T Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_8.1L-Gas_Engine.pdf',   ['psi-gas-8-1l'],            'PSI 8.1L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_8.1LT-Gas_Engine.pdf',  ['psi-gas-8-1l-t'],          'PSI 8.1L-T Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_8.8LNA-Gas_Engine.pdf', ['psi-gas-8-8l'],            'PSI 8.8L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_8.8-T-TCAC-Gas_Engine.pdf', ['psi-gas-8-8l-t','psi-gas-8-8l-tcac'], 'PSI 8.8L T/TCAC Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_10L-Gas_Engine.pdf',    ['psi-gas-10l'],             'PSI 10L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_10LT-Gas_Engine.pdf',   ['psi-gas-10l-t'],           'PSI 10L-T Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_11.1L-Gas_Engine.pdf',  ['psi-gas-11l'],             'PSI 11L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_13LT-Gas_Engine-3.pdf', ['psi-gas-13l'],             'PSI 13L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_14L-Gas_Engine.pdf',    ['psi-gas-14l'],             'PSI 14L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_20L-Gas_Engine.pdf',    ['psi-gas-20l'],             'PSI 20L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_22L-Gas_Engine-2.pdf',  ['psi-gas-22l'],             'PSI 22L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_32L-Gas_Engine.pdf',    ['psi-gas-32l'],             'PSI 32L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_40L-Gas_Engine.pdf',    ['psi-gas-40l'],             'PSI 40L Gas Engine Spec Sheet'],
  ['PSI-PSYSTEMS_53L-Gas_Engine.pdf',    ['psi-gas-53l'],             'PSI 53L Gas Engine Spec Sheet'],
  ['PSI-Energy_20L-Diesel_Engine.pdf',   ['psi-psi-20l-d-600kwe','psi-psi-20l-d-650kwe'], 'PSI 20L-D Diesel Engine Spec Sheet'],
  ['PSI-Energy_40L-Diesel_Engine.pdf',   ['psi-psi-40l-d-1000kwe','psi-psi-40l-d-1300kwe'], 'PSI 40L-D Diesel Engine Spec Sheet'],
  ['PSI-Energy_53L-Diesel_Engine.pdf',   ['psi-psi-53l-d-1500kwe','psi-psi-53l-d-1750kwe'], 'PSI 53L-D Diesel Engine Spec Sheet'],
  ['PSI-Energy_88L-Diesel_Engine.pdf',   ['psi-psi-88l-d-2800kwe','psi-psi-88l-d-3000kwe','psi-psi-88l-d-3300kwe'], 'PSI 88L-D Diesel Engine Spec Sheet'],
]

const { data: rows } = await supabase.from('engines').select('id, slug').eq('brand', 'PSI')
const idBySlug = new Map(rows.map((r) => [r.slug, r.id]))
let uploaded = 0, linked = 0, missing = []
for (const [file, slugs, label] of MAP) {
  const buf = readFileSync(DIR + file)
  const storage = 'psi/' + file
  const { error: ul } = await supabase.storage.from('engine-pdfs').upload(storage, buf, { contentType: 'application/pdf', upsert: true })
  if (ul) { console.error('✗ upload', file, ul.message); continue }
  uploaded++
  const ids = slugs.map((s) => idBySlug.get(s)).filter(Boolean)
  for (const s of slugs) if (!idBySlug.get(s)) missing.push(s)
  const { data: ex } = await supabase.from('engine_pdfs').select('engine_id').eq('storage_path', storage)
  const have = new Set((ex ?? []).map((r) => r.engine_id))
  const newRows = ids.filter((id) => !have.has(id)).map((id) => ({ engine_id: id, type: 'datasheet', label, storage_path: storage, file_size_bytes: buf.length }))
  if (newRows.length) { const { error } = await supabase.from('engine_pdfs').insert(newRows); if (error) { console.error('✗ link', file, error.message); continue } }
  linked += newRows.length
  console.log(`✓ ${file}  (${(buf.length/1048576).toFixed(1)}MB) -> ${newRows.length} linked, ${have.size} existing`)
}
console.log(`\n✓ uploaded ${uploaded} PDFs, linked ${linked} datasheet rows`)
if (missing.length) console.log('missing slugs:', [...new Set(missing)].join(', '))
