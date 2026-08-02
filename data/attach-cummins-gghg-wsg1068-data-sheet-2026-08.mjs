import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'cummins-gghg-wsg1068-data-sheet-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const RECORD = {
  slug: 'cummins-gghg-wsg-1068',
  model: 'GGHG WSG-1068',
  sourcePage: 'https://generatorsource.com/brands/cummins/',
  sourceUrl: 'https://picgeneratorsource.com/specs/Cummins-85-GGHG.pdf',
  storagePath: 'cummins/gas/exact-data-sheets/gghg-wsg1068-generator-set-data-sheet.pdf',
  label: 'Cummins GGHG WSG-1068 Generator Set Data Sheet',
  requiredTokens: [
    'Generator set data sheet',
    'Model: GGHG',
    'Engine model WSG-1068',
    'power.cummins.com',
    '©2017 Cummins Inc.',
    'D-3384',
  ],
  rejectTokens: [
    'GGHE',
    'GGHF',
    'GGHH',
    'GGHJ',
    'GGLA',
    'GGLB',
    'GGMC',
    'GGPC',
  ],
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

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function assertStillMissingExclusive() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  const row = (report.groups?.Cummins ?? []).find((item) => item.slug === RECORD.slug)
  if (!row || row.hasDatasheet) {
    throw new Error(`${RECORD.slug} is no longer missing an exclusive datasheet.`)
  }
}

function downloadPdf(record, localPath) {
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--compressed',
    '--http1.1',
    '--retry',
    '2',
    '--connect-timeout',
    '30',
    '--max-time',
    '300',
    '--header',
    'Accept: application/pdf,*/*',
    '--header',
    'Accept-Language: en-US,en;q=0.9',
    '--user-agent',
    UA,
    '--referer',
    record.sourcePage,
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

  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })

  const missing = record.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${record.storagePath}: missing required token(s): ${missing.join(', ')}`)
  }

  const rejected = record.rejectTokens.filter((token) => hasToken(text, token))
  if (rejected.length) {
    throw new Error(`${record.storagePath}: contains sibling token(s): ${rejected.join(', ')}`)
  }

  return buffer
}

await loadEnv()
assertStillMissingExclusive()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Cummins GGHG WSG-1068 exact data sheet`)

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, brand, model')
  .eq('slug', RECORD.slug)
if (enginesError) throw enginesError

const engine = engines?.[0]
if (!engine) throw new Error(`Missing engine row: ${RECORD.slug}`)
if (engine.brand !== 'Cummins' || normalize(engine.model) !== normalize(RECORD.model)) {
  throw new Error(`Engine mismatch: expected Cummins ${RECORD.model}, got ${engine.brand} ${engine.model}`)
}

const localPath = path.join(TMP_DIR, path.basename(RECORD.storagePath))
const buffer = downloadPdf(RECORD, localPath)
console.log(`Verified ${engine.slug} ${engine.model}: ${Math.round(buffer.length / 1024)}KB`)

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

  console.log(`Linked ${RECORD.storagePath}`)
}
