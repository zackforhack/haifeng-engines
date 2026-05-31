import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import path from 'path'
import os from 'os'

// MHIET publishes per-model genset datasheets in its HubSpot documents folder:
//   .../Contant Speed/000. Documents/Mitsubishi Diesel Engine - <MODEL>.pdf   (note their "Contant" typo)
// China (-C) variants and full-width annotations [（新）/（T3）] map to the base model sheet.
// Fallback for any miss: the "Power Generation Engines" overview brochure.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const FOLDER = 'https://f.hubspotusercontent10.net/hubfs/5570069/00.%20Website/02.%20Industrial/02.%20Products/Contant%20Speed/000.%20Documents/'
const BROCHURE_URL = FOLDER + encodeURIComponent('Mitsubishi - Power Generation Engines.pdf')
const TMP = path.join(os.tmpdir(), 'mit-specs'); fs.mkdirSync(TMP, { recursive: true })

const sheetUrl = (cand) => FOLDER + encodeURIComponent(`Mitsubishi Diesel Engine - ${cand}.pdf`)
const candidates = (model) => {
  const m = model.replace(/（[^）]*）/g, '').trim()   // drop （新）/（T3）
  const set = new Set([m])
  if (m.endsWith('-C')) set.add(m.slice(0, -2))         // China variant -> base sheet
  return [...set]
}

async function getPdf(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(30000) })
    if (!res.ok) return null
    const b = Buffer.from(await res.arrayBuffer())
    if ((res.headers.get('content-type') || '').includes('pdf') && b.slice(0, 4).toString() === '%PDF') return b
  } catch {}
  return null
}

const PAGE = 1000; let pdfs = []; let from = 0
while (true) { const { data } = await supabase.from('engine_pdfs').select('engine_id').range(from, from + PAGE - 1); pdfs.push(...(data ?? [])); if (!data || data.length < PAGE) break; from += PAGE }
const withPdf = new Set(pdfs.map(p => p.engine_id))
const { data: engs } = await supabase.from('engines').select('id, model, slug').eq('brand', 'Mitsubishi')
const missing = engs.filter(e => !withPdf.has(e.id))
console.log(`${missing.length} Mitsubishi models missing docs\n`)

// pre-fetch the overview brochure once for fallbacks
const brochureBuf = await getPdf(BROCHURE_URL)
let brochurePath = null
if (brochureBuf) {
  const f = path.join(TMP, 'powergen.pdf'); fs.writeFileSync(f, brochureBuf)
  brochurePath = 'mitsubishi/brochures/power-generation-engines.pdf'
  await uploadPdf(supabase, BUCKET, f, brochurePath)
  console.log(`overview brochure ready (${Math.round(brochureBuf.length / 1024)}KB)\n`)
}

let sheets = 0, broch = 0, none = 0, links = 0
for (const e of missing) {
  process.stdout.write(`${e.model} ... `)
  let buf = null, used = null
  for (const cand of candidates(e.model)) {
    buf = await getPdf(sheetUrl(cand))
    if (buf) { used = cand; break }
  }
  if (buf) {
    const safe = used.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-|-$/g, '')
    const storagePath = `mitsubishi/spec-sheets/${safe}.pdf`
    const f = path.join(TMP, `${safe}.pdf`); fs.writeFileSync(f, buf)
    const { ok } = await uploadPdf(supabase, BUCKET, f, storagePath)
    if (ok) {
      await supabase.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', storagePath)
      const { error } = await supabase.from('engine_pdfs').insert({
        engine_id: e.id, type: 'datasheet', label: `Mitsubishi ${used} Diesel Engine Datasheet`, storage_path: storagePath, file_size_bytes: buf.length,
      })
      if (!error) { console.log(`datasheet ${Math.round(buf.length / 1024)}KB ✓`); sheets++; links++; continue }
    }
  }
  // fallback: overview brochure
  if (brochurePath) {
    await supabase.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', brochurePath)
    const { error } = await supabase.from('engine_pdfs').insert({
      engine_id: e.id, type: 'brochure', label: 'Mitsubishi Power Generation Engines (Overview)', storage_path: brochurePath, file_size_bytes: brochureBuf.length,
    })
    if (!error) { console.log('brochure (fallback)'); broch++; links++; continue }
  }
  console.log('no PDF'); none++
}
console.log(`\n✓ ${sheets} datasheets · ${broch} brochure-fallback · ${none} none · ${links} engine links`)
