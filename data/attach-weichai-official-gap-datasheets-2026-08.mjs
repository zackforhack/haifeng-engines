import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'weichai-official-gap-datasheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'weichai-12m55d2450e310',
    model: '12M55D2450E310',
    sourcePage:
      'https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202309/t20230913_96279.htm',
    sourceUrl:
      'https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202309/W020260120473802503665.pdf',
    storagePath: 'weichai/official-gap-datasheets/12m55d2450e310.pdf',
    label: 'Weichai 12M55D2450E310 Engine Datasheet',
    rejectTokens: ['12M55D2700E310', '16M55D2750E310', '16M55D2900E310', '16M55D3300E310'],
  },
  {
    slug: 'weichai-20m33d2020e310',
    model: '20M33D2020E310',
    sourcePage:
      'https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202309/t20230913_96280.htm',
    sourceUrl:
      'https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202309/W020260120473574624504.pdf',
    storagePath: 'weichai/official-gap-datasheets/20m33d2020e310.pdf',
    label: 'Weichai 20M33D2020E310 Engine Datasheet',
    rejectTokens: ['20M33D2210E310'],
    ocrFirstPage: true,
    ocrPsm: '11',
  },
  {
    slug: 'weichai-16m55d2900e310',
    model: '16M55D2900E310',
    sourcePage:
      'https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202309/t20230913_96278.htm',
    sourceUrl:
      'https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202309/W020260120474194250739.pdf',
    storagePath: 'weichai/official-gap-datasheets/16m55d2900e310.pdf',
    label: 'Weichai 16M55D2900E310 Engine Datasheet',
    rejectTokens: ['16M55D2750E310', '16M55D3300E310', '16M55D3600E310', '12M55D2450E310'],
  },
  {
    slug: 'weichai-16m55d3300e310',
    model: '16M55D3300E310',
    sourcePage:
      'https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202309/t20230913_96278.htm',
    sourceUrl:
      'https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202309/W020260120474194259030.pdf',
    storagePath: 'weichai/official-gap-datasheets/16m55d3300e310.pdf',
    label: 'Weichai 16M55D3300E310 Engine Datasheet',
    rejectTokens: ['16M55D2750E310', '16M55D2900E310', '16M55D3600E310', '12M55D2450E310'],
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

function readMissingWeichaiRows() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  return report.groups?.Weichai ?? []
}

function currentMissingRecords() {
  const missingSlugs = new Set(readMissingWeichaiRows().map((row) => row.slug))
  const stale = records.filter((record) => !missingSlugs.has(record.slug))
  if (stale.length) {
    console.warn(
      'Record(s) are no longer missing exclusive datasheets: '
      + stale.map((record) => record.slug).join(', '),
    )
  }
  return records.filter((record) => missingSlugs.has(record.slug))
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
  return buffer
}

function verifyPdf(record, localPath) {
  let text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  if (record.ocrFirstPage) {
    const imagePrefix = path.join(TMP_DIR, `${path.basename(record.storagePath, '.pdf')}-page`)
    execFileSync('pdftoppm', ['-f', '1', '-l', '1', '-r', '200', '-png', localPath, imagePrefix], {
      maxBuffer: 20 * 1024 * 1024,
    })
    text += '\n' + execFileSync(
      'tesseract',
      [`${imagePrefix}-1.png`, 'stdout', '-l', 'eng', '--psm', record.ocrPsm ?? '6'],
      {
        encoding: 'utf8',
        maxBuffer: 20 * 1024 * 1024,
      },
    )
  }
  const normalizedText = normalize(text)
  const requiredTokens = [
    record.model,
    'Engine Datasheet',
    '发动机数据单',
  ]
  const missingTokens = requiredTokens.filter(
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
const activeRecords = currentMissingRecords()
if (!activeRecords.length) {
  throw new Error('No Weichai records remain missing exclusive datasheets.')
}
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model, brand')
  .in('slug', activeRecords.map((record) => record.slug))
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let verified = 0
let linked = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${activeRecords.length} official Weichai gap datasheets`)

for (const record of activeRecords) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Weichai' || normalize(engine.model) !== normalize(record.model)) {
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
