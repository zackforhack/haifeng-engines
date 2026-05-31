import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import path from 'path'
import os from 'os'

// The 35 doc-less Cummins engines are generator-drive (G-suffix) variants of ~8 base engines.
// Cummins publishes one G-Drive spec sheet per base engine (covers all its G-ratings); we link
// the official sheet to every variant in that family. QSB3.9 (DCEC/China-only) has no global sheet.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const TMP = path.join(os.tmpdir(), 'cummins-gd'); fs.mkdirSync(TMP, { recursive: true })

// modelPrefix -> { url, label, store }. A DB model matches a family if it startsWith the prefix.
const FAMILIES = [
  { prefix: 'M15-G',     url: 'https://www.ghaddar.com/wp-content/uploads/2025/09/M15-G8_CoolPac-Specsheet.pdf', label: 'Cummins M15 G-Drive Spec Sheet (M15-G8)', store: 'cummins/spec-sheets/m15-gdrive.pdf' },
  { prefix: 'QSB5.9-G',  url: 'https://www.cummins.com/sites/default/files/2019-06/QSB5G3.pdf',                 label: 'Cummins QSB5.9 G-Drive Spec Sheet (QSB5-G3)', store: 'cummins/spec-sheets/qsb5.9-gdrive.pdf' },
  { prefix: 'QSB6.7-G',  url: 'https://www.cummins.com/sites/default/files/2023-05/180-225_kVA_QSB6.7_Specsheet_Rev-4.pdf', label: 'Cummins QSB6.7 Spec Sheet (180-225 kVA)', store: 'cummins/spec-sheets/qsb6.7-gdrive.pdf' },
  { prefix: 'QSB7-G',    url: 'https://www.cummins.com/sites/default/files/2019-06/QSB7G5.pdf',                 label: 'Cummins QSB7-G5 Spec Sheet', store: 'cummins/spec-sheets/qsb7-gdrive.pdf' },
  { prefix: 'QSK19-G',   url: 'https://www.cummins.com/sites/default/files/2019-06/QSK19G4.pdf',                label: 'Cummins QSK19 G-Drive Spec Sheet (QSK19-G4)', store: 'cummins/spec-sheets/qsk19-gdrive.pdf' },
  { prefix: 'QSL9-G',    url: 'https://www.cummins.com/sites/default/files/2019-07/QSL9-G7.pdf',                label: 'Cummins QSL9 G-Drive Spec Sheet (QSL9-G7)', store: 'cummins/spec-sheets/qsl9-gdrive.pdf' },
  { prefix: 'QSL8.9-G',  url: 'https://www.cummins.com/sites/default/files/2019-07/QSL9-G7.pdf',                label: 'Cummins QSL8.9/QSL9 G-Drive Spec Sheet (QSL9-G7)', store: 'cummins/spec-sheets/qsl9-gdrive.pdf' },
  // QSB3.9: DCEC/China-only — no global Cummins spec sheet (left for manual sourcing)
]

async function getPdf(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(40000) })
    if (!r.ok) return null
    const b = Buffer.from(await r.arrayBuffer())
    return b.slice(0, 4).toString() === '%PDF' ? b : null
  } catch { return null }
}

const PAGE = 1000; let pdfs = []; let from = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id').range(from, from + PAGE - 1); pdfs.push(...(data ?? [])); if (!data || data.length < PAGE) break; from += PAGE }
const withPdf = new Set(pdfs.map(p => p.engine_id))
const { data: cummins } = await supabase.from('engines').select('id, model').eq('brand', 'Cummins')
const missing = cummins.filter(e => !withPdf.has(e.id))

const cache = {}
let linked = 0
const covered = new Set()
for (const fam of FAMILIES) {
  const models = missing.filter(e => e.model.startsWith(fam.prefix))
  if (!models.length) continue
  process.stdout.write(`${fam.prefix}* (${models.length}) ... `)
  if (cache[fam.url] === undefined) cache[fam.url] = await getPdf(fam.url)
  const buf = cache[fam.url]
  if (!buf) { console.log('download failed'); continue }
  const f = path.join(TMP, path.basename(fam.store)); fs.writeFileSync(f, buf)
  const { ok } = await uploadPdf(supabase, BUCKET, f, fam.store)
  if (!ok) { console.log('upload failed'); continue }
  let n = 0
  for (const e of models) {
    await supabase.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', fam.store)
    const { error } = await supabase.from('engine_pdfs').insert({ engine_id: e.id, type: 'datasheet', label: fam.label, storage_path: fam.store, file_size_bytes: buf.length })
    if (!error) { n++; linked++; covered.add(e.model) }
  }
  console.log(`${Math.round(buf.length / 1024)}KB ✓ ${n} link(s)`)
}
const stillMissing = missing.filter(e => !covered.has(e.model))
console.log(`\n✓ ${linked} engine links · still missing: ${stillMissing.map(e => e.model).join(', ') || 'none'}`)
