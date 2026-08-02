import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'hyundai-doosan-gdrive-spec-sheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'hyundai-p180fe',
    model: 'P180FE',
    sourcePage: 'https://thtsales.com.au/product/doosan-p158fe-1-g-drive/',
    sourcePageTokens: ['Model Number', 'P180FE', 'P180FE Specifications Sheet'],
    sourceUrl: 'https://thtsales.com.au/wp-content/uploads/2016/10/P180FE-1.pdf',
    storagePath: 'hyundai/doosan-gdrive-spec-sheets/p180fe-gdrive-spec-sheet.pdf',
    label: 'Hyundai/Doosan P180FE G-Drive Spec Sheet',
    requiredTokens: [
      'DOOSAN INFRACORE GENERATOR ENGINE',
      'P180FE',
      'Engine Model',
      'Large Engine Design Team_P180FE_F',
      'Specifications are subject to change',
    ],
  },
  {
    slug: 'hyundai-p222fe',
    model: 'P222FE',
    sourcePage:
      'https://www.tradekorea.com/product/detail/P227914/NEW-Diesel-Generator-Doosan-P222FE--750KW-.html',
    sourcePageTokens: ['11_P222FE.pdf', 'P222FE Engine Specifications'],
    sourceUrl: 'https://www.tradekorea.com/product/download.do?productfileno=828',
    storagePath: 'hyundai/doosan-gdrive-spec-sheets/p222fe-gdrive-spec-sheet.pdf',
    label: 'Hyundai/Doosan P222FE G-Drive Spec Sheet',
    requiredTokens: [
      'P222FE G-DRIVE',
      'Engine Model',
      'P222FE',
      'DOOSAN',
      'Infracore',
      'Speccifications are subject to change',
    ],
    needsOcr: true,
  },
]

const siblingTokens = records.map((record) => record.model)

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
  const missingSlugs = new Set(
    (report.groups?.Hyundai ?? [])
      .filter((row) => !row.hasDatasheet)
      .map((row) => row.slug),
  )
  const stale = records.filter((record) => !missingSlugs.has(record.slug))
  if (stale.length) {
    throw new Error(
      'Record(s) are no longer missing exclusive datasheets: '
      + stale.map((record) => record.slug).join(', '),
    )
  }
}

function fetchSourcePage(record) {
  const localPath = path.join(TMP_DIR, `${record.slug}.html`)
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
    record.sourcePage,
  ], { maxBuffer: 20 * 1024 * 1024 })

  const html = fs.readFileSync(localPath, 'utf8')
  const missing = record.sourcePageTokens.filter((token) => !html.includes(token))
  if (missing.length) {
    throw new Error(`${record.sourcePage}: missing source-page token(s): ${missing.join(', ')}`)
  }
}

function extractPdfText(record, localPath) {
  const directText = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  if (!record.needsOcr) return directText

  const renderPrefix = path.join(TMP_DIR, `${record.slug}-page`)
  execFileSync('pdftoppm', ['-r', '200', '-png', localPath, renderPrefix], {
    maxBuffer: 20 * 1024 * 1024,
  })

  const pageImages = fs
    .readdirSync(TMP_DIR)
    .filter((file) => file.startsWith(`${record.slug}-page-`) && file.endsWith('.png'))
    .sort()
  if (!pageImages.length) throw new Error(`${record.storagePath}: OCR render produced no pages`)

  return pageImages
    .map((file, index) => {
      const imagePath = fs.realpathSync(path.join(TMP_DIR, file))
      const outBase = path.join(TMP_DIR, `${record.slug}-ocr-${index + 1}`)
      execFileSync('tesseract', [imagePath, outBase, '--psm', '6'], {
        maxBuffer: 20 * 1024 * 1024,
      })
      return fs.readFileSync(`${outBase}.txt`, 'utf8')
    })
    .join('\n')
}

function downloadAndVerifyPdf(record, localPath) {
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

  const text = extractPdfText(record, localPath)
  const missing = record.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${record.storagePath}: missing required token(s): ${missing.join(', ')}`)
  }

  const siblingHits = siblingTokens
    .filter((token) => normalize(token) !== normalize(record.model))
    .filter((token) => hasToken(text, token))
  if (siblingHits.length) {
    throw new Error(`${record.storagePath}: contains sibling token(s): ${siblingHits.join(', ')}`)
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
  .select('id, slug, brand, model')
  .in('slug', records.map((record) => record.slug))
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let verified = 0
let linked = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} Hyundai/Doosan G-Drive spec sheets`)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Hyundai' || normalize(engine.model) !== normalize(record.model)) {
    throw new Error(`Engine mismatch for ${record.slug}: ${engine.brand} ${engine.model}`)
  }

  process.stdout.write(`${engine.model} ... `)
  fetchSourcePage(record)
  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  const buffer = downloadAndVerifyPdf(record, localPath)
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
