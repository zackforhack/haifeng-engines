import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'scania-kaihua-dc16-gap-spec-sheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'scania-dc16-093a-02-51',
    model: 'DC16 093A 02-51',
    sourcePage:
      'https://www.kaihuagenset.com/news/Download/Engine-Data-Sheet/Scania/447kW-SCANIA-DC16-093A-02-51-Datasheet.html',
    downloadPage: 'https://www.kaihuagenset.com/Home/Download/did/97968/relation_id/409794',
    sourceUrl: 'https://hkimg.bjyyb.net/sites/95000/95303/20250827220113202.pdf',
    storagePath: 'scania/kaihua-official-spec-sheets/dc16-093a-02-51-447kw.pdf',
    label: 'Scania DC16 093A 02-51 447 kW Power Generation Spec Sheet',
    sourcePageTokens: [
      '447kW SCANIA DC16 093A 02-51 Datasheet',
    ],
    downloadPageTokens: [
      '447kW SCANIA DC16 093A 02-51 Datasheet.pdf',
      'https://hkimg.bjyyb.net/sites/95000/95303/20250827220113202.pdf',
    ],
    requiredTokens: [
      'SCANIA POWER GENERATION ENGINES',
      'DC16 093A. 447-496 kW',
      '501-567 kVA',
      'Scania CV AB',
      'engines@scania.com',
    ],
  },
  {
    slug: 'scania-dc16-078a-02-44',
    model: 'DC16 078A 02-44',
    sourcePage:
      'https://www.kaihuagenset.com/news/Download/Engine-Data-Sheet/Scania/644kW-SCANIA-DC16-078A-02-44-Datasheet.html',
    downloadPage: 'https://www.kaihuagenset.com/Home/Download/did/97888/relation_id/409714',
    sourceUrl: 'https://hkimg.bjyyb.net/sites/95000/95303/20250827215557562.pdf',
    storagePath: 'scania/kaihua-official-spec-sheets/dc16-078a-02-44-644kw.pdf',
    label: 'Scania DC16 078A 02-44 644 kW Power Generation Spec Sheet',
    sourcePageTokens: [
      '644kW SCANIA DC16 078A 02-44 Datasheet',
    ],
    downloadPageTokens: [
      '644kW SCANIA DC16 078A 02-44 Datasheet.pdf',
      'https://hkimg.bjyyb.net/sites/95000/95303/20250827215557562.pdf',
    ],
    requiredTokens: [
      'Scania POWER GENERATION engine',
      'DC16 078A. 725-800 kVA',
      '640-706 kW',
      'Scania developed Engine Management System',
      'Technical data',
    ],
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

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function fetchText(url, localPath) {
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--compressed',
    '--retry',
    '2',
    '--connect-timeout',
    '30',
    '--max-time',
    '180',
    '--user-agent',
    UA,
    '--output',
    localPath,
    url,
  ], { maxBuffer: 20 * 1024 * 1024 })

  return fs.readFileSync(localPath, 'utf8')
}

function assertStillMissingExclusive() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  const missingSlugs = new Set((report.groups?.Scania ?? []).map((row) => row.slug))
  const stale = records.filter((record) => !missingSlugs.has(record.slug))
  if (stale.length) {
    throw new Error(
      'Record(s) are no longer missing exclusive datasheets: '
      + stale.map((record) => record.slug).join(', '),
    )
  }
}

function verifySourcePages(record) {
  const sourceHtml = fetchText(record.sourcePage, path.join(TMP_DIR, `${record.slug}-source.html`))
  const missingSourceTokens = record.sourcePageTokens.filter((token) => !sourceHtml.includes(token))
  if (missingSourceTokens.length) {
    throw new Error(
      `${record.sourcePage}: missing source-page token(s): ${missingSourceTokens.join(', ')}`,
    )
  }

  const downloadHtml = fetchText(
    record.downloadPage,
    path.join(TMP_DIR, `${record.slug}-download.html`),
  )
  const missingDownloadTokens = record.downloadPageTokens.filter(
    (token) => !downloadHtml.includes(token),
  )
  if (missingDownloadTokens.length) {
    throw new Error(
      `${record.downloadPage}: missing download-page token(s): ${missingDownloadTokens.join(', ')}`,
    )
  }
}

function downloadAndVerifyPdf(record, localPath, siblingRows) {
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--compressed',
    '--retry',
    '2',
    '--connect-timeout',
    '30',
    '--max-time',
    '300',
    '--user-agent',
    UA,
    '--referer',
    record.sourcePage,
    '--output',
    localPath,
    record.sourceUrl,
  ], { maxBuffer: 20 * 1024 * 1024 })

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

  const siblingHits = siblingRows
    .filter((row) => row.slug !== record.slug)
    .filter((row) => hasToken(text, row.model))
    .map((row) => row.model)
  if (siblingHits.length) {
    throw new Error(
      `${record.storagePath}: contains sibling Scania token(s): ${siblingHits.join(', ')}`,
    )
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

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model, brand')
  .in('slug', records.map((record) => record.slug))
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
const siblingRows = report.groups?.Scania ?? []
let verified = 0
let linked = 0

console.log(
  `${APPLY ? 'APPLY' : 'DRY RUN'}: `
  + `${records.length} Scania-authored DC16 spec sheets from Kaihua download pages`,
)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Scania' || normalize(engine.model) !== normalize(record.model)) {
    throw new Error(`Engine mismatch for ${record.slug}: ${engine.brand} ${engine.model}`)
  }

  process.stdout.write(`${engine.model} ... `)
  verifySourcePages(record)
  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  const buffer = downloadAndVerifyPdf(record, localPath, siblingRows)
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
