import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import path from 'path'
import os from 'os'

const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const TMP = path.join(os.tmpdir(), 'jd-specs'); fs.mkdirSync(TMP, { recursive: true })

// John Deere serves per-model PDFs (browser UA required). Try QRG then specsheet variants.
const urlVariants = (m) => [
  `https://www.deere.com/assets/pdfs/common/qrg/${m}.pdf`,
  `https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/specsheets/${m}_aux.pdf`,
  `https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/specsheets/${m}.pdf`,
]

// engines + which have PDFs
const PAGE = 1000; let pdfs = []; let from = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id').range(from, from+PAGE-1); pdfs.push(...(data??[])); if (!data || data.length<PAGE) break; from+=PAGE }
const withPdf = new Set(pdfs.map(p => p.engine_id))
const { data: jd } = await supabase.from('engines').select('id, model').eq('brand', 'John Deere')

// group engine ids by lowercase model, only those missing a PDF
const byModel = {}
for (const e of jd) { if (withPdf.has(e.id)) continue; (byModel[e.model.toLowerCase()] ??= []).push(e.id) }
const models = Object.keys(byModel)
console.log(`${models.length} John Deere models missing docs\n`)

let ok = 0, none = 0, links = 0
for (const m of models) {
  process.stdout.write(`${m} ... `)
  let buf = null
  for (const url of urlVariants(m)) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(25000) })
      if (!res.ok) continue
      const b = Buffer.from(await res.arrayBuffer())
      if ((res.headers.get('content-type')||'').includes('pdf') && b.slice(0,4).toString() === '%PDF') { buf = b; break }
    } catch {}
  }
  if (!buf) { console.log('no PDF'); none++; continue }
  const local = path.join(TMP, `${m}.pdf`); fs.writeFileSync(local, buf)
  const storagePath = `john-deere/spec-sheets/${m}.pdf`
  const { ok: up } = await uploadPdf(supabase, BUCKET, local, storagePath)
  if (!up) { console.log('upload failed'); continue }
  let n = 0
  for (const eid of byModel[m]) {
    await supabase.from('engine_pdfs').delete().eq('engine_id', eid).eq('storage_path', storagePath)
    const { error } = await supabase.from('engine_pdfs').insert({
      engine_id: eid, type: 'datasheet', label: `John Deere ${m.toUpperCase()} Spec Sheet`, storage_path: storagePath, file_size_bytes: buf.length,
    })
    if (!error) { n++; links++ }
  }
  console.log(`${Math.round(buf.length/1024)}KB ✓ ${n} link(s)`)
  ok++
}
console.log(`\n✓ ${ok} models linked (${links} engine links) · ${none} no PDF`)
