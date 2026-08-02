import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'jenbacher-official-j420-brochure-2026-08')
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const record = {
  slug: 'jenbacher-j420',
  sourceUrl:
    'https://www.jenbacher.com/wp-content/uploads/2025/02/innio_jenbacher_j420_brochure_210x297mm_rz_screen_ijb-122001-en.pdf',
  storagePath: 'jenbacher/official-brochures/j420-de-product-brochure.pdf',
  label: 'Jenbacher J420 D/E Product Brochure',
  requiredTokens: ['J420 D/E', 'Jenbacher', 'INNIO', 'Technical data'],
  siblingTokens: ['J312', 'J316', 'J320', 'J412', 'J416', 'J612', 'J616', 'J620', 'J624'],
}

function parseEnvFile(text) {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const separator = line.indexOf('=')
    const key = line.slice(0, separator).trim()
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] == null) process.env[key] = value
  }
}

async function loadEnv() {
  for (const envFile of ['.env.local', '.env']) {
    try {
      parseEnvFile(await fsp.readFile(envFile, 'utf8'))
    } catch {
      // Optional local env files.
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function normalize(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function downloadPdf(localPath) {
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '2',
    '--connect-timeout',
    '30',
    '--max-time',
    '300',
    '--user-agent',
    UA,
    '--output',
    localPath,
    record.sourceUrl,
  ], {
    maxBuffer: 20 * 1024 * 1024,
  })
  const buffer = fs.readFileSync(localPath)
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${record.sourceUrl}: response is not a PDF`)
  }
  return buffer
}

function verifyPdfText(localPath) {
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const normalized = normalize(text)
  const missing = record.requiredTokens.filter((token) => !normalized.includes(normalize(token)))
  if (missing.length > 0) {
    throw new Error(`PDF text missing required token(s): ${missing.join(', ')}`)
  }

  const siblingMatches = record.siblingTokens.filter((token) =>
    new RegExp(`\\b${token}\\b`, 'i').test(text),
  )
  if (siblingMatches.length > 0) {
    throw new Error(`PDF text contains sibling model token(s): ${siblingMatches.join(', ')}`)
  }
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const { data: engine, error: engineError } = await supabase
  .from('engines')
  .select('id, slug, brand, model')
  .eq('slug', record.slug)
  .maybeSingle()
if (engineError) throw engineError
if (!engine) throw new Error(`Missing engine row: ${record.slug}`)

const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${engine.brand} ${engine.model}`)
const buffer = downloadPdf(localPath)
verifyPdfText(localPath)

if (!APPLY) {
  console.log(
    `Verified ${record.label}: ${Math.round(buffer.length / 1024)}KB, source=${record.sourceUrl}`,
  )
  process.exit(0)
}

const upload = await uploadPdf(supabase, BUCKET, localPath, record.storagePath)
if (!upload.ok) throw new Error(`Upload failed: ${record.storagePath}`)

const { error: deleteError } = await supabase
  .from('engine_pdfs')
  .delete()
  .eq('engine_id', engine.id)
  .eq('storage_path', record.storagePath)
if (deleteError) throw deleteError

const { error: insertError } = await supabase.from('engine_pdfs').insert({
  engine_id: engine.id,
  type: 'datasheet',
  label: record.label,
  storage_path: record.storagePath,
  file_size_bytes: upload.uploadedSizeBytes ?? buffer.length,
})
if (insertError) throw insertError

console.log(
  `Linked ${record.label} to ${engine.brand} ${engine.model} (${engine.slug}); `
  + `${record.storagePath}; ${Math.round(buffer.length / 1024)}KB.`,
)
