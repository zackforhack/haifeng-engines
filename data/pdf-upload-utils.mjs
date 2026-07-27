import { execSync } from 'child_process'
import { tmpdir } from 'os'
import fs from 'fs'
import path from 'path'

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 // 5 MB

// Standard Quartz filter: 144 DPI, JPEG 0.70 — good quality, used when file is moderately large
const STANDARD_QFILTER = `<?xml version="1.0" encoding="UTF-8"?>
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

// Aggressive Quartz filter: 60 DPI, JPEG 0.30 — fallback for very large files
const AGGRESSIVE_QFILTER = `<?xml version="1.0" encoding="UTF-8"?>
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

function runJxaCompress(inputPath, outputPath, filterPlist) {
  const ts = Date.now()
  const filterFile = path.join(tmpdir(), `qf-${ts}.qfilter`)
  const scriptFile = path.join(tmpdir(), `jxa-${ts}.js`)
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

/**
 * Attempt to compress a PDF using Ghostscript (preferred) or macOS CoreGraphics (fallback).
 * Returns a Buffer of the compressed PDF, or null if all methods fail.
 */
export async function compressPdf(filePath) {
  const tmpOut = path.join(tmpdir(), `compressed-${Date.now()}.pdf`)

  // 1. Try Ghostscript first (best quality/ratio if installed)
  try {
    execSync(
      `gs -sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH -dPDFSETTINGS=/ebook` +
      ` -sOutputFile="${tmpOut}" "${filePath}"`,
      { timeout: 120_000 }
    )
    const buf = fs.readFileSync(tmpOut)
    fs.unlinkSync(tmpOut)
    return buf
  } catch {}

  // 2. Try macOS CoreGraphics/Quartz (standard quality first)
  try {
    runJxaCompress(filePath, tmpOut, STANDARD_QFILTER)
    const buf = fs.readFileSync(tmpOut)
    fs.unlinkSync(tmpOut)
    if (buf.length < fs.statSync(filePath).size) return buf
  } catch {}

  // 3. Try aggressive Quartz filter for very large files
  try {
    runJxaCompress(filePath, tmpOut, AGGRESSIVE_QFILTER)
    const buf = fs.readFileSync(tmpOut)
    fs.unlinkSync(tmpOut)
    if (buf.length < fs.statSync(filePath).size) return buf
  } catch {}

  try { fs.unlinkSync(tmpOut) } catch {}
  return null
}

/**
 * Check whether a file already exists in a Supabase Storage bucket.
 */
export async function fileExistsInStorage(supabase, bucket, storagePath) {
  const dir = path.dirname(storagePath)
  const name = path.basename(storagePath)
  const { data } = await supabase.storage.from(bucket).list(dir, { search: name })
  return Array.isArray(data) && data.some(f => f.name === name)
}

/**
 * Upload a PDF file, compressing it first if it exceeds MAX_UPLOAD_BYTES.
 * Falls back to skipping the upload (but still returns true) when the file
 * is already in storage — so DB linking can proceed.
 *
 * Returns { ok: true } on success/skip, { ok: false } on unrecoverable failure.
 */
export async function uploadPdf(supabase, bucket, filePath, storagePath) {
  const fileSize = fs.statSync(filePath).size
  let uploadBuffer = null

  if (fileSize > MAX_UPLOAD_BYTES) {
    const mb = (fileSize / 1024 / 1024).toFixed(1)
    console.log(`  ⚠️  Large file (${mb} MB) — attempting Ghostscript compression…`)

    const compressed = await compressPdf(filePath)
    if (compressed) {
      const ratio = ((1 - compressed.length / fileSize) * 100).toFixed(0)
      console.log(`  📦 Compressed: ${Math.round(fileSize/1024)}KB → ${Math.round(compressed.length/1024)}KB (−${ratio}%)`)
      uploadBuffer = compressed
    } else {
      // gs not available — skip upload if file already exists in storage
      const exists = await fileExistsInStorage(supabase, bucket, storagePath)
      if (exists) {
        console.log(`  ⏭  Already in storage — skipping upload (install Ghostscript to re-compress)`)
        return { ok: true, skipped: true, uploadedSizeBytes: null }
      }
      console.warn(`  ❌ Too large (${mb} MB), Ghostscript unavailable, and not yet in storage. Skipping.`)
      console.warn(`     Install Ghostscript to enable compression: brew install ghostscript`)
      return { ok: false }
    }
  } else {
    uploadBuffer = fs.readFileSync(filePath)
  }

  const maxAttempts = 3
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const { error } = await supabase.storage.from(bucket).upload(
        storagePath, uploadBuffer,
        { contentType: 'application/pdf', upsert: true }
      )
      if (!error) {
        return { ok: true, uploadedSizeBytes: uploadBuffer.length }
      }
      console.error(
        `  ❌ Upload attempt ${attempt}/${maxAttempts} failed: ${error.message}`
      )
    } catch (error) {
      console.error(
        `  ❌ Upload attempt ${attempt}/${maxAttempts} failed: ${error.message}`
      )
    }

    // A dropped response can occur after Storage accepted the object.
    if (await fileExistsInStorage(supabase, bucket, storagePath)) {
      console.log(`  ✅ File is present in storage after the failed response`)
      return { ok: true, uploadedSizeBytes: uploadBuffer.length }
    }
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
  return { ok: false }
}
