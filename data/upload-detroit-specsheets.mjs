import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Detroit Diesel's missing models are all discontinued (Series 71/149 two-strokes, Series 60).
// DTNA no longer publishes these, so we use archived spec sheets from dieselpartsdirect.com
// (real per-model genset/marine specs) and a 1977 Detroit Diesel catalog for the V71 trio.
// Oversized PDFs are raster-compressed (pdftoppm -> JPEG -> PDFKit recombine via osascript),
// since Ghostscript and the JXA CGPDF bridge are unavailable here.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const TMP = path.join(os.tmpdir(), 'detroit-specs'); fs.mkdirSync(TMP, { recursive: true })
const MAX = 5 * 1024 * 1024

const JXA = path.join(TMP, 'jpg2pdf.js')
fs.writeFileSync(JXA, `ObjC.import('Foundation');ObjC.import('AppKit');ObjC.import('Quartz')
function run(argv){var dir=argv[0],out=argv[1];var fm=$.NSFileManager.defaultManager
var files=ObjC.deepUnwrap(fm.contentsOfDirectoryAtPathError(dir,null)).filter(f=>/\\.jpg$/i.test(f))
.sort((a,b)=>parseInt((a.match(/(\\d+)/)||[0,0])[1])-parseInt((b.match(/(\\d+)/)||[0,0])[1]))
var doc=$.PDFDocument.alloc.init
files.forEach(f=>{var img=$.NSImage.alloc.initWithContentsOfFile(dir+'/'+f);var p=$.PDFPage.alloc.initWithImage(img);doc.insertPageAtIndex(p,doc.pageCount)})
doc.writeToFile(out);return 'pages='+doc.pageCount}`)

function rasterCompress(src, tag, dpi = 100) {
  const pdir = path.join(TMP, tag); fs.rmSync(pdir, { recursive: true, force: true }); fs.mkdirSync(pdir)
  execSync(`pdftoppm -jpeg -r ${dpi} -jpegopt quality=55 "${src}" "${pdir}/pg"`, { timeout: 180000 })
  const out = path.join(TMP, `${tag}_c.pdf`); fs.rmSync(out, { force: true })
  execSync(`osascript -l JavaScript "${JXA}" "${pdir}" "${out}"`, { timeout: 180000 })
  return fs.readFileSync(out)
}

const DPD = 'https://www.dieselpartsdirect.com/documents/detroit-diesel-specs'
const TARGETS = [
  { models: ['12V71'], url: `${DPD}/12v71-generator-set.pdf`, type: 'datasheet', label: 'Detroit Diesel 12V71 Generator Set Spec Sheet', store: 'detroit-diesel/spec-sheets/12v71-generator-set.pdf' },
  { models: ['12V149'], url: `${DPD}/12v149-marine.pdf`, type: 'datasheet', label: 'Detroit Diesel 12V149 Marine Spec Sheet', store: 'detroit-diesel/spec-sheets/12v149-marine.pdf' },
  { models: ['16V149'], url: `${DPD}/149-series-brochure.pdf`, type: 'brochure', label: 'Detroit Diesel 149 Series Brochure', store: 'detroit-diesel/spec-sheets/149-series-brochure.pdf' },
  { models: ['Series 60 12.7L'], url: `${DPD}/series-60-marine-power-for-commercial-vessels.pdf`, type: 'brochure', label: 'Detroit Diesel Series 60 Power Spec', store: 'detroit-diesel/spec-sheets/series-60-power.pdf' },
  { models: ['6V71', '8V71', '16V71'], url: 'https://xr793.com/wp-content/uploads/2020/07/1977-Detroit-Diesel-Engines.pdf', type: 'brochure', label: 'Detroit Diesel V71-Series Engine Catalog (1977)', store: 'detroit-diesel/spec-sheets/v71-catalog-1977.pdf' },
]

async function dl(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(60000) })
  if (!res.ok) return null
  const b = Buffer.from(await res.arrayBuffer())
  return b.slice(0, 4).toString() === '%PDF' ? b : null
}

const { data: engs } = await supabase.from('engines').select('id, model').eq('brand', 'Detroit Diesel')
const idOf = (m) => (engs.find(e => e.model === m) || {}).id

let linked = 0, none = 0
for (const t of TARGETS) {
  process.stdout.write(`${t.models.join('/')} ... `)
  let buf = await dl(t.url)
  if (!buf) { console.log('download failed'); none += t.models.length; continue }
  const origMb = (buf.length / 1024 / 1024).toFixed(1)
  if (buf.length > MAX) {
    const raw = path.join(TMP, path.basename(t.store)); fs.writeFileSync(raw, buf)
    let c = rasterCompress(raw, path.basename(t.store, '.pdf'), 100)
    if (c.length > MAX) c = rasterCompress(raw, path.basename(t.store, '.pdf'), 72)  // retry lower dpi
    buf = c
  }
  if (buf.length > MAX) { console.log(`still too large (${(buf.length/1024/1024).toFixed(1)}MB)`); none += t.models.length; continue }
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(t.store, buf, { contentType: 'application/pdf', upsert: true })
  if (upErr) { console.log('upload failed: ' + upErr.message); none += t.models.length; continue }
  let n = 0
  for (const m of t.models) {
    const eid = idOf(m); if (!eid) { process.stdout.write(`[no ${m}] `); continue }
    await supabase.from('engine_pdfs').delete().eq('engine_id', eid).eq('storage_path', t.store)
    const { error } = await supabase.from('engine_pdfs').insert({ engine_id: eid, type: t.type, label: t.label, storage_path: t.store, file_size_bytes: buf.length })
    if (!error) { n++; linked++ }
  }
  console.log(`${origMb}MB→${Math.round(buf.length/1024)}KB ✓ ${n} link(s)`)
}
console.log(`\n✓ ${linked} engine links · ${none} unresolved`)
