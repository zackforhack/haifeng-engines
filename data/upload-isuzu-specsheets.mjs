import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Isuzu's media server exposes a browsable directory of literature + brochures.
// We scrape /downloads/Lit Sheets/ and /downloads/Brochure/, match each model to its
// most specific PDF, and fall back to the official full product line-up brochure.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const BASE = 'https://ptmedia.isuzuengines.com/downloads/'
const TMP = path.join(os.tmpdir(), 'isuzu-specs'); fs.mkdirSync(TMP, { recursive: true })
const LINEUP = 'Brochure/Isuzu_Engines_and_Power_Units_Product_Line-up_Brochure_2026_web.pdf'
const enc = (rel) => BASE + rel.split('/').map(encodeURIComponent).join('/')   // decoded rel -> URL

async function listDir(dir) {   // dir is a DECODED prefix e.g. 'Lit Sheets/'
  const html = await (await fetch(enc(dir), { headers: { 'User-Agent': UA } })).text()
  return [...html.matchAll(/href="([^"]+\.pdf)"/gi)].map(m => decodeURIComponent(m[1].replace(/&amp;/g, '&')))
    .filter(f => !f.startsWith('/')).map(f => dir + f)   // decoded rel path
}
async function getPdf(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(40000) })
    if (!res.ok) return null
    const b = Buffer.from(await res.arrayBuffer())
    if ((res.headers.get('content-type') || '').includes('pdf') && b.slice(0, 4).toString() === '%PDF') return b
  } catch {}
  return null
}

const lit = await listDir('Lit Sheets/')
const broch = await listDir('Brochure/')
const all = [...lit, ...broch]   // values like "Lit%20Sheets/Isuzu_4JJ1X_brochure.pdf"
console.log(`${all.length} Isuzu PDFs in media dir\n`)

// pick best doc (relative path) for a model
function pick(model) {
  const m = model.toUpperCase()
  const relaxed = m.replace(/[XT]$/, '')   // 4LE2X -> 4LE2
  // prefer specific sheets; avoid the 15MB+ "HR" high-res variants and line-ups
  const cands = (tok) => all.filter(f => f.toUpperCase().includes(tok) && !/line-?up/i.test(f))
  const rank = (f) => (/brochure/i.test(f) ? 0 : /lit[-_ ]?sheet|_sheet/i.test(f) ? 1 : /genset/i.test(f) ? 2 : / HR|_HR/i.test(f) ? 4 : 3)
  const best = (tok) => cands(tok).sort((a, b) => rank(a) - rank(b))[0]
  const exact = best(m) || (relaxed !== m ? best(relaxed) : null)
  if (exact) return { rel: exact, type: 'brochure', label: `Isuzu ${model} Spec Sheet` }
  if (['4JJ1X', '4HK1X', '6HK1X'].includes(m)) {
    const g = broch.find(f => /4JJ1X-4HK1X-6HK1X.*Genset.*Web/i.test(f))
    if (g) return { rel: g, type: 'brochure', label: 'Isuzu 4JJ1X/4HK1X/6HK1X Genset-Ready Power Units' }
  }
  return { rel: LINEUP, type: 'brochure', label: 'Isuzu Engines & Power Units Product Line-up 2026' }
}

const PAGE = 1000; let pdfs = []; let from = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id').range(from, from + PAGE - 1); pdfs.push(...(data ?? [])); if (!data || data.length < PAGE) break; from += PAGE }
const withPdf = new Set(pdfs.map(p => p.engine_id))
const { data: engs } = await supabase.from('engines').select('id, model, slug').eq('brand', 'Isuzu')
const missing = engs.filter(e => !withPdf.has(e.id))
console.log(`${missing.length} Isuzu models missing docs\n`)

const cache = {}
let specific = 0, fallback = 0, none = 0, links = 0
for (const e of missing) {
  const { rel, type, label } = pick(e.model)
  process.stdout.write(`${e.model} -> ${rel.split('/').pop()} ... `)
  if (cache[rel] === undefined) cache[rel] = await getPdf(enc(rel))
  const buf = cache[rel]
  if (!buf) { console.log('fetch failed'); none++; continue }
  const fname = rel.split('/').pop().toLowerCase().replace(/[^a-z0-9.]+/g, '-')
  const storagePath = `isuzu/spec-sheets/${fname}`
  const f = path.join(TMP, fname); fs.writeFileSync(f, buf)
  const { ok } = await uploadPdf(supabase, BUCKET, f, storagePath)
  if (!ok) { console.log('upload failed'); none++; continue }
  await supabase.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', storagePath)
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: e.id, type, label, storage_path: storagePath, file_size_bytes: buf.length,
  })
  if (error) { console.log('link failed'); none++; continue }
  const isFallback = rel === LINEUP
  console.log(`${Math.round(buf.length / 1024)}KB ✓${isFallback ? ' (line-up)' : ''}`)
  if (isFallback) fallback++; else specific++
  links++
}
console.log(`\n✓ ${specific} specific · ${fallback} line-up-fallback · ${none} none · ${links} engine links`)
