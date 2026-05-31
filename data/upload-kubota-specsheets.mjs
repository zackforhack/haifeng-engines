import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Kubota serves per-product spec PDFs at /en/products/product_pdf/{id}_pdf_1.pdf.
// We crawled an id->model index (data/kubota-crawl.mjs -> /tmp/kubota_index.json) and match
// each DB variant to the base engine + emission tier (E2/E3/E4), ignoring market/cert suffixes.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const pdfUrl = (id) => `https://engine.kubota.com/en/products/product_pdf/${id}_pdf_1.pdf`
const TMP = path.join(os.tmpdir(), 'kubota-specs'); fs.mkdirSync(TMP, { recursive: true })

const index = JSON.parse(fs.readFileSync('/tmp/kubota_index.json', 'utf8'))   // [{id, model}]
const baseOf = (m) => (m.toUpperCase().match(/^[A-Z]+\d+[A-Z]*/) || [''])[0]
const tierOf = (m) => { const x = m.toUpperCase().match(/-E(\d)/); return x ? x[1] : null }   // -E2B.. -> 2

// build lookup maps
const byKey = {}, byBase = {}
for (const { id, model } of index) {
  const b = baseOf(model), t = tierOf(model)
  if (t) (byKey[`${b}|${t}`] ??= []).push(id)
  ;(byBase[b] ??= []).push(id)
  if (b.endsWith('DI')) (byBase[b.slice(0, -2)] ??= []).push(id)   // V3800DI also under V3800
}

function candidateIds(model) {
  let b = baseOf(model); const t = tierOf(model)
  const ids = []
  if (t && byKey[`${b}|${t}`]) ids.push(...byKey[`${b}|${t}`])
  if (byBase[b]) ids.push(...byBase[b])
  if (b.endsWith('DI') && byBase[b.slice(0, -2)]) ids.push(...byBase[b.slice(0, -2)])
  return [...new Set(ids)]
}
async function getPdf(id) {
  try {
    const res = await fetch(pdfUrl(id), { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) })
    if (!res.ok) return null
    const b = Buffer.from(await res.arrayBuffer())
    return b.slice(0, 4).toString() === '%PDF' ? b : null
  } catch { return null }
}

const PAGE = 1000; let pdfs = []; let from = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id').range(from, from + PAGE - 1); pdfs.push(...(data ?? [])); if (!data || data.length < PAGE) break; from += PAGE }
const withPdf = new Set(pdfs.map(p => p.engine_id))
const { data: engs } = await supabase.from('engines').select('id, model, slug').eq('brand', 'Kubota')
const missing = engs.filter(e => !withPdf.has(e.id))
console.log(`${missing.length} Kubota models missing docs\n`)

const cache = {}
let ok = 0, none = 0
for (const e of missing) {
  process.stdout.write(`${e.model} ... `)
  let buf = null, usedId = null
  for (const id of candidateIds(e.model)) {
    if (cache[id] === undefined) cache[id] = await getPdf(id)
    if (cache[id]) { buf = cache[id]; usedId = id; break }
  }
  if (!buf) { console.log('no match'); none++; continue }
  const storagePath = `kubota/spec-sheets/${baseOf(e.model).toLowerCase()}-e${tierOf(e.model) || 'x'}-${usedId}.pdf`
  const f = path.join(TMP, `${usedId}.pdf`); fs.writeFileSync(f, buf)
  const { ok: up } = await uploadPdf(supabase, BUCKET, f, storagePath)
  if (!up) { console.log('upload failed'); none++; continue }
  await supabase.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', storagePath)
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: e.id, type: 'datasheet', label: `Kubota ${e.model} Spec Sheet`, storage_path: storagePath, file_size_bytes: buf.length,
  })
  if (error) { console.log('link failed'); none++; continue }
  console.log(`id=${usedId} (${Math.round(buf.length / 1024)}KB) ✓`); ok++
}
console.log(`\n✓ ${ok} linked · ${none} no match`)
