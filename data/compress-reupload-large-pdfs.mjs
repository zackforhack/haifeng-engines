// Compresses large PDFs already in Supabase storage using macOS CoreGraphics/Quartz,
// re-uploads them, and updates file_size_bytes in engine_pdfs table.
// Requires macOS (uses osascript JXA + built-in Quartz filters).

import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const PDF_DIR = '/Users/ziqianhuang/haifeng-engines/data/hyundai-pdfs'

// Standard filter: 144 DPI, JPEG 0.70 quality
const STANDARD_FILTER = `<?xml version="1.0" encoding="UTF-8"?>
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
  <key>Name</key><string>Standard Compress</string>
</dict></plist>`

// Aggressive filter: 60 DPI, JPEG 0.30 quality — for files that standard can't get under limit
const AGGRESSIVE_FILTER = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Domains</key><dict><key>Applications</key><true/></dict>
  <key>FilterData</key><dict><key>ColorSettings</key><dict><key>ImageSettings</key><dict>
    <key>Compression Quality</key><real>0.30</real>
    <key>ImageCompression</key><string>ImageJPEGCompress</string>
    <key>ImageScaleSettings</key><dict>
      <key>ImageResolution</key><integer>60</integer>
      <key>ImageScaleInterpolate</key><true/>
      <key>ImageSizeMax</key><integer>1200</integer>
      <key>ImageSizeMin</key><integer>0</integer>
    </dict>
  </dict></dict></dict>
  <key>FilterType</key><integer>1</integer>
  <key>Name</key><string>Aggressive Compress</string>
</dict></plist>`

const MAX_BYTES = 5 * 1024 * 1024

function compressWithJxa(inputPath, outputPath, filterPlist) {
  const ts = Date.now()
  const filterFile = path.join(os.tmpdir(), `qf-${ts}.qfilter`)
  const scriptFile = path.join(os.tmpdir(), `jxa-${ts}.js`)
  fs.writeFileSync(filterFile, filterPlist)
  fs.writeFileSync(scriptFile,
    `ObjC.import('Foundation');ObjC.import('CoreGraphics');ObjC.import('Quartz')\n` +
    `var f=$.QuartzFilter.quartzFilterWithURL($.NSURL.fileURLWithPath(ObjC.wrap(${JSON.stringify(filterFile)})))\n` +
    `var doc=$.CGPDFDocumentCreateWithURL($.NSURL.fileURLWithPath(ObjC.wrap(${JSON.stringify(inputPath)})))\n` +
    `var n=$.CGPDFDocumentGetNumberOfPages(doc)\n` +
    `var ctx=$.CGPDFContextCreateWithURL($.NSURL.fileURLWithPath(ObjC.wrap(${JSON.stringify(outputPath)})),$.CGRectZero,$.NSDictionary.dictionary)\n` +
    `f.applyToContext(ctx)\n` +
    `for(var i=1;i<=n;i++){var pg=$.CGPDFDocumentGetPage(doc,i);var r=$.CGPDFPageGetBoxRect(pg,1);$.CGContextBeginPage(ctx,r);$.CGContextDrawPDFPage(ctx,pg);$.CGContextEndPage(ctx)}\n` +
    `$.CGPDFContextClose(ctx);$.CGContextRelease(ctx)\n`
  )
  try {
    execSync(`osascript -l JavaScript ${scriptFile}`, { timeout: 300_000 })
  } finally {
    try { fs.unlinkSync(filterFile) } catch {}
    try { fs.unlinkSync(scriptFile) } catch {}
  }
}

// Files to compress: local path → storage path
const targets = [
  {
    local: path.join(PDF_DIR, 'hce-engine-brochure-2025.pdf'),
    storage: 'hyundai/hce-engine-brochure-2025.pdf',
    filter: STANDARD_FILTER,
    label: 'HCE Engine Brochure 2025',
  },
  {
    local: path.join(PDF_DIR, 'hce-dx-series-power-generation.pdf'),
    storage: 'hyundai/hce-dx-series-power-generation.pdf',
    filter: AGGRESSIVE_FILTER,
    label: 'HCE DX Series for Power Generation',
  },
]

for (const target of targets) {
  const origSize = fs.statSync(target.local).size
  console.log(`\n📄 ${path.basename(target.local)} (${(origSize/1024/1024).toFixed(1)} MB)`)

  const tmpOut = path.join(os.tmpdir(), `compressed-${Date.now()}.pdf`)
  console.log('  🔧 Compressing via macOS CoreGraphics…')

  try {
    const result = compressWithJxa(target.local, tmpOut, target.filter)
    const compSize = fs.statSync(tmpOut).size
    const ratio = ((1 - compSize / origSize) * 100).toFixed(0)
    console.log(`  📦 ${(origSize/1024/1024).toFixed(1)} MB → ${(compSize/1024/1024).toFixed(1)} MB (−${ratio}%) [${result}]`)

    if (compSize >= origSize) {
      console.warn('  ⚠️  Compressed file is not smaller — skipping upload')
      fs.unlinkSync(tmpOut)
      continue
    }

    // Upload to Supabase (replace existing)
    console.log('  ⬆️  Uploading…')
    const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(
      target.storage,
      fs.readFileSync(tmpOut),
      { contentType: 'application/pdf', upsert: true }
    )
    if (uploadErr) { console.error('  ❌ Upload failed:', uploadErr.message); fs.unlinkSync(tmpOut); continue }
    console.log('  ✅ Uploaded to storage')

    // Update file_size_bytes in engine_pdfs
    const { error: updateErr, count } = await supabase
      .from('engine_pdfs')
      .update({ file_size_bytes: compSize })
      .eq('storage_path', target.storage)
      .select('id', { count: 'exact', head: true })
    if (updateErr) console.warn('  ⚠️  DB update failed:', updateErr.message)
    else console.log(`  ✅ Updated file_size_bytes in DB`)

    // Also overwrite local file with compressed version for future use
    fs.copyFileSync(tmpOut, target.local)
    console.log('  ✅ Local file updated')

    fs.unlinkSync(tmpOut)
  } catch (e) {
    console.error('  ❌ Error:', e.message)
    try { fs.unlinkSync(tmpOut) } catch {}
  }
}

console.log('\n=== DONE ===')
