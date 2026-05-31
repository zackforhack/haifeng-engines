import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Docs for six previously-uncovered Western/Japanese brands, from official or archived sources.
// Image-heavy catalogs >5MB are raster-compressed (pdftoppm -> JPEG -> PDFKit), since gs and the
// JXA CGPDF bridge are unavailable here; text PDFs (PSI manuals, Hino sheets) upload as-is.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const TMP = path.join(os.tmpdir(), 'wmisc'); fs.mkdirSync(TMP, { recursive: true })
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
  execSync(`pdftoppm -jpeg -r ${dpi} -jpegopt quality=58 "${src}" "${pdir}/pg"`, { timeout: 180000 })
  const out = path.join(TMP, `${tag}_c.pdf`); fs.rmSync(out, { force: true })
  execSync(`osascript -l JavaScript "${JXA}" "${pdir}" "${out}"`, { timeout: 180000 })
  return fs.readFileSync(out)
}

const TARGETS = [
  // brand, models[], url, type, label, store
  { brand: 'Daihatsu', models: ['6DK-20e', '6DK-26e', '8DK-28e', '6DK-36e', '8DK-36e', '12DK-36e'],
    url: 'https://www.shipserv.com/ShipServ/pages/profiles/217061/documents/MARINE-GENSETS-DIESEL-ENGINE.pdf',
    type: 'brochure', label: 'Daihatsu Marine Gensets Diesel Engine Catalog', store: 'daihatsu/brochures/marine-gensets-catalog.pdf' },
  { brand: 'Liebherr', models: ['D934', 'D936', 'D946', 'D976'],
    url: 'https://www.liebherr.com/shared/media/components/documents/combustion-engines/dieselmotoren/liebherr-diesel-engines-construction-industry-application-brochure-en-web.pdf',
    type: 'brochure', label: 'Liebherr Diesel Engines — Construction & Industry', store: 'liebherr/brochures/diesel-engines-construction-industry.pdf' },
  { brand: 'Liebherr', models: ['D9508', 'D9512', 'D9612'],
    url: 'https://assets-cdn.liebherr.com/versions/cc38f271-69f5-4485-adee-4eb644a1812c/original/Brochure-Genset_6pages-OK_FINAL-12032026.pdf',
    type: 'brochure', label: 'Liebherr Diesel Engines — Genset / Power Generation', store: 'liebherr/brochures/diesel-engines-genset.pdf' },
  { brand: 'Hino', models: ['J08E'],
    url: 'https://web.archive.org/web/20210417214453id_/https://www.barringtondieselclub.co.za/hino/j08/hino-j08c-j08e-spec-sheet.pdf',
    type: 'datasheet', label: 'Hino J08C/J08E Engine Spec Sheet', store: 'hino/spec-sheets/j08c-j08e.pdf' },
  { brand: 'Hino', models: ['J05E'],
    url: 'https://web.archive.org/web/20240715000350/https://barringtondieselclub.co.za/members322/hino/hino-j05-j08-especificationes-tecnicas.pdf',
    type: 'datasheet', label: 'Hino J05/J08 Technical Specifications', store: 'hino/spec-sheets/j05-j08-tech-specs.pdf' },
  { brand: 'PSI', models: ['PSI 20L-D'],
    url: 'https://psiengines.com/wp-content/uploads/eric_test/20L-Spark-Ignited-Owners-Manual-7610048-2.pdf',
    type: 'manual', label: 'PSI 20L Engine Owner’s Manual', store: 'psi/manuals/20l-owners-manual.pdf' },
  { brand: 'PSI', models: ['PSI 40L-D'],
    url: 'https://psiengines.com/wp-content/uploads/2024/10/56100037-10-40L-Operations-Maintenance-Manual.pdf',
    type: 'manual', label: 'PSI 40L Operations & Maintenance Manual', store: 'psi/manuals/40l-om-manual.pdf' },
  { brand: 'PSI', models: ['PSI 53L-D'],
    url: 'https://psiengines.com/wp-content/uploads/2024/10/56100039-11-53L-Operations-Maintenance-Manual.pdf',
    type: 'manual', label: 'PSI 53L Operations & Maintenance Manual', store: 'psi/manuals/53l-om-manual.pdf' },
]

async function dl(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(60000) })
  if (!r.ok) return null
  const b = Buffer.from(await r.arrayBuffer())
  return b.slice(0, 4).toString() === '%PDF' ? b : null
}

let linked = 0, none = 0
for (const t of TARGETS) {
  process.stdout.write(`${t.brand} ${t.models.join('/')} ... `)
  let buf = await dl(t.url)
  if (!buf) { console.log('download failed'); none += t.models.length; continue }
  const origMb = (buf.length / 1024 / 1024).toFixed(1)
  if (buf.length > MAX) {
    const raw = path.join(TMP, path.basename(t.store)); fs.writeFileSync(raw, buf)
    let c = rasterCompress(raw, path.basename(t.store, '.pdf'), 100)
    if (c.length > MAX) c = rasterCompress(raw, path.basename(t.store, '.pdf'), 76)
    buf = c
  }
  if (buf.length > MAX) { console.log(`too large (${(buf.length/1024/1024).toFixed(1)}MB)`); none += t.models.length; continue }
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(t.store, buf, { contentType: 'application/pdf', upsert: true })
  if (upErr) { console.log('upload failed: ' + upErr.message); none += t.models.length; continue }
  // link to every row of each model in this brand
  let n = 0
  const { data: rows } = await supabase.from('engines').select('id, model').eq('brand', t.brand).in('model', t.models)
  for (const r of rows ?? []) {
    await supabase.from('engine_pdfs').delete().eq('engine_id', r.id).eq('storage_path', t.store)
    const { error } = await supabase.from('engine_pdfs').insert({ engine_id: r.id, type: t.type, label: t.label, storage_path: t.store, file_size_bytes: buf.length })
    if (!error) { n++; linked++ }
  }
  console.log(`${origMb}MB→${Math.round(buf.length/1024)}KB ✓ ${n} link(s)`)
}
console.log(`\n✓ ${linked} engine links · ${none} unresolved`)
