import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import path from 'path'
import os from 'os'

// John Deere generator-drive spec sheets live at /specsheets/{MODEL}_{REV}.pdf with an
// irregular revision suffix (e.g. 6090HFG84_A15, 4045HFG85_E). We HEAD-probe a bounded
// suffix space per model (letters A-H + optional number 0-30, priority-ordered, stop on
// first hit). Models with no spec sheet fall back to the official Gen-Drive Selection Guide.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const SPEC = 'https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/specsheets'
const GUIDE = 'https://johndeere.widen.net/content/3cbmawpwkm/original/dswt39-gen-drive-selection-guide.pdf?u=ieggj8&use=cnpyd&download=true'
const GUIDE_PATH = 'john-deere/brochures/gen-drive-selection-guide.pdf'
const TMP = path.join(os.tmpdir(), 'jd-gd'); fs.mkdirSync(TMP, { recursive: true })

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
function suffixes() {
  const s = LETTERS.map(l => `_${l}`)                       // bare letters first
  for (let n = 1; n <= 30; n++) for (const l of LETTERS) s.push(`_${l}${n}`)
  return s
}
async function head(url) {
  try { const r = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) }); return r.status === 200 }
  catch { return false }
}
async function findSpec(model) {
  const cands = suffixes().map(suf => `${SPEC}/${model}${suf}.pdf`)
  const CONC = 10
  for (let i = 0; i < cands.length; i += CONC) {
    const batch = cands.slice(i, i + CONC)
    const res = await Promise.all(batch.map(async u => ({ u, ok: await head(u) })))
    const hit = res.find(r => r.ok)
    if (hit) return hit.u
  }
  return null
}
async function getPdf(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(40000) })
  if (!r.ok) return null
  const b = Buffer.from(await r.arrayBuffer())
  return b.slice(0, 4).toString() === '%PDF' ? b : null
}

// missing JD engines, grouped by model (duplicates share a doc)
const PAGE = 1000; let pdfs = []; let from = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id').range(from, from + PAGE - 1); pdfs.push(...(data ?? [])); if (!data || data.length < PAGE) break; from += PAGE }
const withPdf = new Set(pdfs.map(p => p.engine_id))
const { data: jd } = await supabase.from('engines').select('id, model').eq('brand', 'John Deere')
const byModel = {}
for (const e of jd) { if (withPdf.has(e.id)) continue; (byModel[e.model] ??= []).push(e.id) }
const models = Object.keys(byModel)
console.log(`${models.length} JD models missing docs (${Object.values(byModel).flat().length} rows)\n`)

// prep selection-guide brochure once
const guideBuf = await getPdf(GUIDE)
if (guideBuf) { const f = path.join(TMP, 'guide.pdf'); fs.writeFileSync(f, guideBuf); await uploadPdf(supabase, BUCKET, f, GUIDE_PATH); console.log(`selection guide ready (${Math.round(guideBuf.length / 1024)}KB)\n`) }

async function link(ids, storagePath, type, label, bytes) {
  let n = 0
  for (const id of ids) {
    await supabase.from('engine_pdfs').delete().eq('engine_id', id).eq('storage_path', storagePath)
    const { error } = await supabase.from('engine_pdfs').insert({ engine_id: id, type, label, storage_path: storagePath, file_size_bytes: bytes })
    if (!error) n++
  }
  return n
}

let spec = 0, broch = 0, links = 0
for (const model of models) {
  process.stdout.write(`${model} ... `)
  const url = await findSpec(model)
  if (url) {
    const buf = await getPdf(url)
    if (buf) {
      const storagePath = `john-deere/spec-sheets/${model.toLowerCase()}.pdf`
      const f = path.join(TMP, `${model}.pdf`); fs.writeFileSync(f, buf)
      const { ok } = await uploadPdf(supabase, BUCKET, f, storagePath)
      if (ok) {
        const n = await link(byModel[model], storagePath, 'datasheet', `John Deere ${model} Spec Sheet`, buf.length)
        console.log(`spec ${url.split('/').pop()} (${Math.round(buf.length / 1024)}KB) -> ${n} link(s)`); spec++; links += n; continue
      }
    }
  }
  if (guideBuf) {
    const n = await link(byModel[model], GUIDE_PATH, 'brochure', 'John Deere Generator Drive Engine Selection Guide', guideBuf.length)
    console.log(`selection-guide fallback -> ${n} link(s)`); broch++; links += n; continue
  }
  console.log('no doc')
}
console.log(`\n✓ ${spec} spec sheets · ${broch} guide-fallback · ${links} engine links`)
