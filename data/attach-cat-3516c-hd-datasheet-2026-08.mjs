import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'cat-3516c-hd-datasheet-2026-08')
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const record = {
  slug: 'caterpillar-3516c-hd',
  modelTokens: ['3516C', 'HD', 'Offshore Generator Set'],
  sourcePage:
    'https://h-cpc.cat.com/cmms/v2?cid=402&f=product&gid=18434701&it=product&lid=en&nc=1&pid=18459192&sc=M450',
  sourceUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20240910-36bf4-cb1a6',
  storagePath: 'caterpillar/spec-sheets/3516c-hd-offshore-generator-set.pdf',
  label: 'Cat 3516C (HD) Offshore Generator Set Spec Sheet',
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

function pdfContainsTokens(pdfPath, tokens) {
  const text = execFileSync('pdftotext', [pdfPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const normalized = normalize(text)
  return tokens.every((token) => normalized.includes(normalize(token)))
}

async function downloadPdf() {
  const response = await fetch(record.sourceUrl, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${record.sourceUrl}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${record.sourceUrl}: response is not a PDF`)
  }
  return buffer
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
  .eq('slug', record.slug)
if (enginesError) throw enginesError
const engine = engines[0]
if (!engine) throw new Error(`Missing engine row: ${record.slug}`)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${engine.model} Cat spec sheet`)

const buffer = await downloadPdf()
const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
fs.writeFileSync(localPath, buffer)

if (!pdfContainsTokens(localPath, record.modelTokens)) {
  throw new Error(`${record.storagePath}: PDF text does not contain all expected tokens`)
}

if (!APPLY) {
  console.log(`${Math.round(buffer.length / 1024)}KB verified from ${record.sourceUrl}`)
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

console.log(`${Math.round(buffer.length / 1024)}KB linked to ${record.slug}`)
