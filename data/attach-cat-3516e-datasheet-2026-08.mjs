import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'cat-3516e-datasheet-2026-08')
const RECORD = {
  slug: 'caterpillar-3516e',
  sourcePage:
    'https://www.cat.com/en_US/products/new/power-systems/electric-power/diesel-generator-sets/1000024629.html',
  sourceUrl: 'https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1299-',
  storagePath: 'caterpillar/spec-sheets/3516e-50hz-low-fuel-consumption-spec-sheet.pdf',
  label: 'Cat 3516E 50 Hz Low Fuel Consumption Spec Sheet',
  tokens: ['3516E', 'Cat', 'Caterpillar'],
}
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

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
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function verifyPdf(localPath) {
  const buffer = fs.readFileSync(localPath)
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${localPath}: response is not a PDF`)
  }

  const text = execFileSync('pdftotext', [localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const normalizedText = normalize(text)
  const missing = RECORD.tokens.filter((token) => !normalizedText.includes(normalize(token)))
  if (missing.length) throw new Error(`${localPath}: missing token(s): ${missing.join(', ')}`)
  return buffer
}

async function downloadPdf(localPath) {
  const response = await fetch(RECORD.sourceUrl, {
    headers: {
      'User-Agent': UA,
      Referer: RECORD.sourcePage,
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(120000),
  })
  if (!response.ok) throw new Error(`${RECORD.sourceUrl}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  await fsp.writeFile(localPath, buffer)
  return verifyPdf(localPath)
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .eq('slug', RECORD.slug)
if (enginesError) throw enginesError
const engine = engines?.[0]
if (!engine) throw new Error(`Missing engine row: ${RECORD.slug}`)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${RECORD.label}`)
const localPath = path.join(TMP_DIR, path.basename(RECORD.storagePath))
const buffer = await downloadPdf(localPath)

if (APPLY) {
  const upload = await uploadPdf(supabase, BUCKET, localPath, RECORD.storagePath)
  if (!upload.ok) throw new Error(`Upload failed: ${RECORD.storagePath}`)

  const { error: deleteError } = await supabase
    .from('engine_pdfs')
    .delete()
    .eq('engine_id', engine.id)
    .eq('storage_path', RECORD.storagePath)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('engine_pdfs').insert({
    engine_id: engine.id,
    type: 'datasheet',
    label: RECORD.label,
    storage_path: RECORD.storagePath,
    file_size_bytes: upload.uploadedSizeBytes ?? buffer.length,
  })
  if (insertError) throw insertError
}

console.log(`${APPLY ? 'Linked' : 'Verified'} ${engine.model} (${Math.round(buffer.length / 1024)}KB)`)
