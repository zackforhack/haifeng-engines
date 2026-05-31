import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Deutz publishes datasheet PDFs on its engines-archive page (filenames not model-derivable),
// so we scrape every PDF link and match each DB model by series number + cooling letter.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const ARCHIVE = 'https://www.deutz.com/en/products/engines-archive/'
const TMP = path.join(os.tmpdir(), 'deutz-specs'); fs.mkdirSync(TMP, { recursive: true })
// 2013 has no archive PDF; this German-market datasheet covers TCD 2013 L06.
const TCD2013 = 'https://germangenerator.com/wp-content/uploads/2014/09/Motordatenblatt-DEUTZ-TCD2013L06.pdf'

async function getPdf(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(30000) })
    if (!res.ok) return null
    const b = Buffer.from(await res.arrayBuffer())
    if ((res.headers.get('content-type') || '').includes('pdf') && b.slice(0, 4).toString() === '%PDF') return b
  } catch {}
  return null
}

// scrape archive PDF links
const html = await (await fetch(ARCHIVE, { headers: { 'User-Agent': UA } })).text()
const links = [...new Set([...html.matchAll(/href="([^"]*\.pdf)"/gi)].map(m => m[1]))]
console.log(`${links.length} PDF links scraped from Deutz archive\n`)

// pick the best archive link for a model
function matchUrl(model) {
  const series = (model.match(/(914|1011|1012|1013|1015|2011|2012)/) || [])[1]
  if (!series) return null
  const cooling = /M\d/.test(model) ? 'm' : (/L\d/.test(model) ? 'l' : null)  // BF6M / F6L
  const cands = links.filter(u => u.toLowerCase().includes(series))
  if (!cands.length) return null
  const score = (u) => {
    u = u.toLowerCase(); let s = 0
    if (cooling && new RegExp(`bf${cooling}_|f${cooling}_|_${cooling}_`).test(u)) s += 4
    if (cooling === 'm' && /bfm_|fm_/.test(u)) s += 4
    if (cooling === 'l' && /bfl_|fl_/.test(u)) s += 4
    if (u.includes('mobile_machinery')) s += 2   // industrial use, prefer over genset/automotive
    if (u.includes('/en/')) s += 1
    return s
  }
  return cands.sort((a, b) => score(b) - score(a))[0]
}

const PAGE = 1000; let pdfs = []; let from = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id').range(from, from + PAGE - 1); pdfs.push(...(data ?? [])); if (!data || data.length < PAGE) break; from += PAGE }
const withPdf = new Set(pdfs.map(p => p.engine_id))
const { data: engs } = await supabase.from('engines').select('id, model, slug').eq('brand', 'Deutz')
const missing = engs.filter(e => !withPdf.has(e.id))
console.log(`${missing.length} Deutz models missing docs\n`)

// cache downloads by source URL
const cache = {}
let ok = 0, none = 0, links2 = 0
for (const e of missing) {
  process.stdout.write(`${e.model} ... `)
  let url = /2013/.test(e.model) ? TCD2013 : matchUrl(e.model)
  if (!url) { console.log('no match'); none++; continue }
  if (cache[url] === undefined) cache[url] = await getPdf(url)
  const buf = cache[url]
  if (!buf) { console.log('fetch failed'); none++; continue }
  const fname = url.split('/').pop().split('?')[0].toLowerCase().replace(/[^a-z0-9.]+/g, '-')
  const storagePath = `deutz/spec-sheets/${fname}`
  const f = path.join(TMP, fname); fs.writeFileSync(f, buf)
  const { ok: up } = await uploadPdf(supabase, BUCKET, f, storagePath)
  if (!up) { console.log('upload failed'); none++; continue }
  await supabase.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', storagePath)
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: e.id, type: 'datasheet', label: `Deutz ${e.model} Datasheet`, storage_path: storagePath, file_size_bytes: buf.length,
  })
  if (error) { console.log('link failed'); none++; continue }
  console.log(`${url.split('/').pop().split('?')[0]} (${Math.round(buf.length / 1024)}KB) ✓`)
  ok++; links2++
}
console.log(`\n✓ ${ok} linked · ${none} none · ${links2} engine links`)
