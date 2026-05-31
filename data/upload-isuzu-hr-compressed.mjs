import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

// 6UZ1X / 6WG1X only have 15 MB+ "HR" datasheets and Ghostscript/JXA-CGPDF are unavailable here.
// Pipeline: pdftoppm -> JPEG pages (110 dpi, q55) -> PDFKit recombine via osascript (run unsandboxed).
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const TMP = path.join(os.tmpdir(), 'isuzu-hr'); fs.mkdirSync(TMP, { recursive: true })

const JXA = path.join(TMP, 'jpg2pdf.js')
fs.writeFileSync(JXA, `ObjC.import('Foundation');ObjC.import('AppKit');ObjC.import('Quartz')
function run(argv){var dir=argv[0],out=argv[1];var fm=$.NSFileManager.defaultManager
var files=ObjC.deepUnwrap(fm.contentsOfDirectoryAtPathError(dir,null)).filter(f=>/\\.jpg$/i.test(f))
.sort((a,b)=>parseInt((a.match(/(\\d+)/)||[0,0])[1])-parseInt((b.match(/(\\d+)/)||[0,0])[1]))
var doc=$.PDFDocument.alloc.init
files.forEach(f=>{var img=$.NSImage.alloc.initWithContentsOfFile(dir+'/'+f);var p=$.PDFPage.alloc.initWithImage(img);doc.insertPageAtIndex(p,doc.pageCount)})
doc.writeToFile(out);return 'pages='+doc.pageCount}`)

const TARGETS = [
  { model: '6UZ1X', url: 'https://ptmedia.isuzuengines.com/downloads/Lit%20Sheets/Isuzu%206UZ1X%20Sheet%20HR.pdf' },
  { model: '6WG1X', url: 'https://ptmedia.isuzuengines.com/downloads/Lit%20Sheets/Isuzu%206WG1X%20Sheet%20HR.pdf' },
]

for (const t of TARGETS) {
  process.stdout.write(`${t.model} ... `)
  const { data: eng } = await supabase.from('engines').select('id').eq('brand', 'Isuzu').eq('model', t.model).single()
  if (!eng) { console.log('not in DB'); continue }
  const res = await fetch(t.url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60000) })
  const raw = path.join(TMP, `${t.model}.pdf`); fs.writeFileSync(raw, Buffer.from(await res.arrayBuffer()))
  const pagedir = path.join(TMP, t.model); fs.rmSync(pagedir, { recursive: true, force: true }); fs.mkdirSync(pagedir)
  execSync(`pdftoppm -jpeg -r 110 -jpegopt quality=55 "${raw}" "${pagedir}/pg"`, { timeout: 120000 })
  const out = path.join(TMP, `${t.model}_c.pdf`); fs.rmSync(out, { force: true })
  execSync(`osascript -l JavaScript "${JXA}" "${pagedir}" "${out}"`, { timeout: 120000 })
  const buf = fs.readFileSync(out)
  const kb = Math.round(buf.length / 1024)
  if (buf.slice(0, 4).toString() !== '%PDF' || buf.length > 5 * 1024 * 1024) { console.log(`compress failed (${kb}KB)`); continue }
  const storagePath = `isuzu/spec-sheets/isuzu-${t.model.toLowerCase()}-sheet.pdf`
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, buf, { contentType: 'application/pdf', upsert: true })
  if (upErr) { console.log('upload failed: ' + upErr.message); continue }
  await supabase.from('engine_pdfs').delete().eq('engine_id', eng.id).eq('storage_path', storagePath)
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: eng.id, type: 'datasheet', label: `Isuzu ${t.model} Spec Sheet`, storage_path: storagePath, file_size_bytes: buf.length,
  })
  console.log(error ? 'link failed' : `${kb}KB ✓ (compressed from ${Math.round(fs.statSync(raw).size / 1024 / 1024 * 10) / 10}MB)`)
}
