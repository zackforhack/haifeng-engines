import { execSync } from 'child_process'
import { tmpdir } from 'os'
import fs from 'fs'
import path from 'path'

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Attempt to compress a PDF using Ghostscript (if installed).
 * Returns a Buffer of the compressed PDF, or null if gs is unavailable.
 */
export async function compressPdf(filePath) {
  const tmpOut = path.join(tmpdir(), `compressed-${Date.now()}.pdf`)
  try {
    execSync(
      `gs -sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH -dPDFSETTINGS=/ebook` +
      ` -sOutputFile="${tmpOut}" "${filePath}"`,
      { timeout: 120_000 }
    )
    const buf = fs.readFileSync(tmpOut)
    fs.unlinkSync(tmpOut)
    return buf
  } catch {
    try { fs.unlinkSync(tmpOut) } catch {}
    return null
  }
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
        return { ok: true, skipped: true }
      }
      console.warn(`  ❌ Too large (${mb} MB), Ghostscript unavailable, and not yet in storage. Skipping.`)
      console.warn(`     Install Ghostscript to enable compression: brew install ghostscript`)
      return { ok: false }
    }
  } else {
    uploadBuffer = fs.readFileSync(filePath)
  }

  const { error } = await supabase.storage.from(bucket).upload(
    storagePath, uploadBuffer,
    { contentType: 'application/pdf', upsert: true }
  )
  if (error) {
    console.error(`  ❌ Upload failed: ${error.message}`)
    return { ok: false }
  }
  return { ok: true }
}
