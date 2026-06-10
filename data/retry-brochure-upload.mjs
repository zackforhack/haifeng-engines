import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

const inputFile = '/Users/ziqianhuang/haifeng-engines/data/hyundai-pdfs/hce-engine-brochure-2025.pdf'
const storagePath = 'hyundai/hce-engine-brochure-2025.pdf'
const ts = Date.now()
const filterFile = path.join(os.tmpdir(), `qf-${ts}.qfilter`)
const scriptFile = path.join(os.tmpdir(), `jxa-${ts}.js`)
const outFile    = path.join(os.tmpdir(), `brochure-${ts}.pdf`)

fs.writeFileSync(filterFile, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Domains</key><dict><key>Applications</key><true/></dict>
  <key>FilterData</key><dict><key>ColorSettings</key><dict><key>ImageSettings</key><dict>
    <key>Compression Quality</key><real>0.70</real>
    <key>ImageCompression</key><string>ImageJPEGCompress</string>
    <key>ImageScaleSettings</key><dict>
      <key>ImageResolution</key><integer>144</integer>
      <key>ImageScaleInterpolate</key><true/>
      <key>ImageSizeMax</key><integer>2400</integer>
      <key>ImageSizeMin</key><integer>0</integer>
    </dict>
  </dict></dict></dict>
  <key>FilterType</key><integer>1</integer>
  <key>Name</key><string>Standard</string>
</dict></plist>`)

fs.writeFileSync(scriptFile,
  `ObjC.import('Foundation');ObjC.import('CoreGraphics');ObjC.import('Quartz')\n` +
  `var f=$.QuartzFilter.quartzFilterWithURL($.NSURL.fileURLWithPath(ObjC.wrap(${JSON.stringify(filterFile)})))\n` +
  `var doc=$.CGPDFDocumentCreateWithURL($.NSURL.fileURLWithPath(ObjC.wrap(${JSON.stringify(inputFile)})))\n` +
  `var n=$.CGPDFDocumentGetNumberOfPages(doc)\n` +
  `var ctx=$.CGPDFContextCreateWithURL($.NSURL.fileURLWithPath(ObjC.wrap(${JSON.stringify(outFile)})),$.CGRectZero,$.NSDictionary.dictionary)\n` +
  `f.applyToContext(ctx)\n` +
  `for(var i=1;i<=n;i++){var pg=$.CGPDFDocumentGetPage(doc,i);var r=$.CGPDFPageGetBoxRect(pg,1);$.CGContextBeginPage(ctx,r);$.CGContextDrawPDFPage(ctx,pg);$.CGContextEndPage(ctx)}\n` +
  `$.CGPDFContextClose(ctx);$.CGContextRelease(ctx)\n`
)

console.log('Compressing…')
execSync(`osascript -l JavaScript ${scriptFile}`, { timeout: 300_000 })
const compSize = fs.statSync(outFile).size
const origSize = fs.statSync(inputFile).size
console.log(`${(origSize/1024/1024).toFixed(1)} MB → ${(compSize/1024/1024).toFixed(1)} MB`)

console.log('Uploading…')
const { error } = await supabase.storage.from('engine-pdfs').upload(
  storagePath, fs.readFileSync(outFile),
  { contentType: 'application/pdf', upsert: true }
)
if (error) { console.error('Upload failed:', error.message); process.exit(1) }
console.log('Uploaded!')

const { error: dbErr } = await supabase.from('engine_pdfs')
  .update({ file_size_bytes: compSize })
  .eq('storage_path', storagePath)
if (dbErr) console.warn('DB update failed:', dbErr.message)
else console.log('DB updated')

fs.copyFileSync(outFile, inputFile)
fs.unlinkSync(outFile)
fs.unlinkSync(filterFile)
fs.unlinkSync(scriptFile)
console.log('Done!')
