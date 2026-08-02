import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'waukesha-official-vgf-gap-factsheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'waukesha-vgf-h24gsi',
    model: 'VGF24GL/GLD (H24GL/GLD)',
    sourceUrl: 'https://www.waukeshaengine.com/wp-content/uploads/IWK-123029-VGF24GL.pdf',
    storagePath: 'waukesha/factsheets/vgf24gl.pdf',
    label: 'Waukesha VGF24GL Fact Sheet',
    requiredTokens: ['VGF24GL', 'H24GL', 'Waukesha'],
    rejectTokens: ['VGF18GL', 'L36GSI', 'P48GSI', 'VGF24SE', 'H24SE'],
  },
  {
    slug: 'waukesha-vgf-l36gsi',
    model: 'VGF36GSI/GSID (L36GSI/GSID)',
    sourceUrl: 'https://www.waukeshaengine.com/wp-content/uploads/IWK-123064-VGF-L36GSI.pdf',
    storagePath: 'waukesha/factsheets/vgf-l36gsi.pdf',
    label: 'Waukesha VGF L36GSI Fact Sheet',
    requiredTokens: ['VGF L36GSI', 'Waukesha'],
    rejectTokens: ['VGF18GL', 'VGF24GL', 'P48GSI', 'L36SE'],
  },
  {
    slug: 'waukesha-vgf-p48gsi',
    model: 'VGF48GSI/GSID (P48GSI/GSID)',
    sourceUrl: 'https://www.waukeshaengine.com/wp-content/uploads/IWK-123060-VGF-P48GSI.pdf',
    storagePath: 'waukesha/factsheets/vgf-p48gsi.pdf',
    label: 'Waukesha VGF P48GSI Fact Sheet',
    requiredTokens: ['VGF P48GSI', 'Waukesha'],
    rejectTokens: ['VGF18GL', 'VGF24GL', 'L36GSI', 'P48SE'],
  },
  {
    slug: 'waukesha-vgf-f18gsi',
    model: 'VGF18GL/GLD (F18GL/GLD)',
    sourceUrl: 'https://www.waukeshaengine.com/wp-content/uploads/IWK-123021-VGF18GL.pdf',
    storagePath: 'waukesha/factsheets/vgf18gl.pdf',
    label: 'Waukesha VGF18GL Fact Sheet',
    requiredTokens: ['VGF18GL', 'F18GL', 'Waukesha'],
    rejectTokens: ['VGF24GL', 'L36GSI', 'P48GSI', 'VGF18SE'],
  },
]

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

function assertStillMissingExclusive() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  const missingSlugs = new Set((report.groups?.Waukesha ?? []).map((row) => row.slug))
  const stale = records.filter((record) => !missingSlugs.has(record.slug))
  if (stale.length) {
    throw new Error(
      'Record(s) are no longer missing exclusive datasheets: '
      + stale.map((record) => record.slug).join(', '),
    )
  }
}

function downloadPdf(record, localPath) {
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

function verifyPdf(record, localPath) {
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const normalizedText = normalize(text)
  const missingTokens = record.requiredTokens.filter(
    (token) => !normalizedText.includes(normalize(token)),
  )
  if (missingTokens.length) {
    throw new Error(
      `${record.storagePath}: missing expected token(s): ${missingTokens.join(', ')}`,
    )
  }

  const siblingHits = record.rejectTokens.filter(
    (token) => normalizedText.includes(normalize(token)),
  )
  if (siblingHits.length) {
    throw new Error(
      `${record.storagePath}: contains sibling token(s): ${siblingHits.join(', ')}`,
    )
  }
}

await loadEnv()
assertStillMissingExclusive()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model, brand')
  .in('slug', records.map((record) => record.slug))
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let verified = 0
let linked = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} Waukesha VGF gap factsheets`)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Waukesha' || normalize(engine.model) !== normalize(record.model)) {
    throw new Error(`Engine mismatch for ${record.slug}: ${engine.brand} ${engine.model}`)
  }

  process.stdout.write(`${engine.model} ... `)
  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  const buffer = downloadPdf(record, localPath)
  verifyPdf(record, localPath)
  verified += 1

  if (!APPLY) {
    console.log(`${Math.round(buffer.length / 1024)}KB verified`)
    continue
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

  console.log(`${Math.round(buffer.length / 1024)}KB linked`)
  linked += 1
}

console.log(
  `\n${APPLY ? 'Applied' : 'Dry run complete'}: `
  + `${verified} verified, ${linked} linked.`,
)
