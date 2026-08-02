import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'xinchai-official-product-datasheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'xinchai-3b11yd41',
    model: '3B11YD41',
    sourcePage: 'https://www.xinchaiengine.com/3B11YD41-pd710707688.html',
    sourceUrl:
      'https://jrrorwxhijopli5p.ldycdn.com/3B11YD41%E6%80%A7%E8%83%BD%E5%8F%82%E6%95%B0%28%E4%B8%AD%E6%96%87%29+3000-aidmoBpiKnmRlkSpikliojkj.pdf',
    storagePath: 'xinchai/official-product-datasheets/3b11yd41.pdf',
    label: 'Xinchai 3B11YD41 Product Datasheet',
    siblingTokens: ['3B11YD41P185', '3B11RD', '3E22RD', '3E22YD'],
  },
  {
    slug: 'xinchai-4d35zd',
    model: '4D35ZD',
    sourcePage: 'https://www.xinchaiengine.com/4D35ZD-pd47535955.html',
    sourceUrl: 'https://rprorwxhijopli5q.ldycdn.com/4D35ZD-aidmjBpiKnmRliSmjqimolpl.pdf?dp=',
    storagePath: 'xinchai/official-product-datasheets/4d35zd.pdf',
    label: 'Xinchai 4D35ZD Product Datasheet',
    siblingTokens: ['4D35LD', '4D29BD', '4N28ZD'],
  },
  {
    slug: 'xinchai-4e30yd',
    model: '4E30YD',
    sourcePage: 'https://www.xinchaiengine.com/4E30YD-pd47635955.html',
    sourceUrl: 'https://rprorwxhijopli5q.ldycdn.com/4E30YD-aidmnBpiKnmRliSpkqopjlik.pdf?dp=',
    storagePath: 'xinchai/official-product-datasheets/4e30yd.pdf',
    label: 'Xinchai 4E30YD Product Datasheet',
    siblingTokens: ['4E30YG30', '4D30', '4D32YG30', '4D32RG30'],
  },
  {
    slug: 'xinchai-4k41ld',
    model: '4K41LD',
    sourcePage: 'https://www.xinchaiengine.com/4K41LD-pd48796055.html',
    sourceUrl: 'https://rprorwxhijopli5q.ldycdn.com/4K41LD-aidmpBpiKnmRliSmjqirqljj.pdf?dp=',
    storagePath: 'xinchai/official-product-datasheets/4k41ld.pdf',
    label: 'Xinchai 4K41LD Product Datasheet',
    siblingTokens: ['A4K41LD', '4K41RD', '4K41ZD', 'A4K41ZD'],
  },
  {
    slug: 'xinchai-a498bd',
    model: 'A498BD',
    sourcePage: 'https://www.xinchaiengine.com/A498BD-pd42506055.html',
    sourceUrl: 'https://rprorwxhijopli5q.ldycdn.com/A498BD-aidmpBpiKnmRliSmjqimollk.pdf?dp=',
    storagePath: 'xinchai/official-product-datasheets/a498bd.pdf',
    label: 'Xinchai A498BD Product Datasheet',
    siblingTokens: ['A498BZD', 'A498BZD1', 'A498BZD2'],
  },
  {
    slug: 'xinchai-a498bzd',
    model: 'A498BZD',
    sourcePage: 'https://www.xinchaiengine.com/A498BZD-pd44106055.html',
    sourceUrl: 'https://rprorwxhijopli5q.ldycdn.com/A498BZD-aidmnBpiKnmRliSmjqiqolkk.pdf?dp=',
    storagePath: 'xinchai/official-product-datasheets/a498bzd.pdf',
    label: 'Xinchai A498BZD Product Datasheet',
    siblingTokens: ['A498BD', 'A498BZD1', 'A498BZD2'],
  },
  {
    slug: 'xinchai-c490bd',
    model: 'C490BD',
    sourcePage: 'https://www.xinchaiengine.com/C490BD-pd47006055.html',
    sourceUrl: 'https://rprorwxhijopli5q.ldycdn.com/C490BD-aidmrBpiKnmRliSpjqpnmlil.pdf?dp=',
    storagePath: 'xinchai/official-product-datasheets/c490bd.pdf',
    label: 'Xinchai C490BD Product Datasheet',
    siblingTokens: ['NC485BD', 'A498BD', 'A498BZD'],
  },
  {
    slug: 'xinchai-nc485bd',
    model: 'NC485BD',
    sourcePage: 'https://www.xinchaiengine.com/NC485BD-pd43554845.html',
    sourceUrl: 'https://rprorwxhijopli5q.ldycdn.com/NC485BD-aidmpBpiKnmRliSmjqikolrj.pdf?dp=',
    storagePath: 'xinchai/official-product-datasheets/nc485bd.pdf',
    label: 'Xinchai NC485BD Product Datasheet',
    siblingTokens: ['C490BD', 'A498BD', 'A498BZD'],
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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hasExactToken(text, token) {
  return new RegExp(`(^|[^A-Z0-9])${escapeRegex(token.toUpperCase())}([^A-Z0-9]|$)`).test(
    text.toUpperCase(),
  )
}

function assertStillMissingExclusive() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  const missingSlugs = new Set((report.groups?.Xinchai ?? []).map((row) => row.slug))
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
  if (!hasExactToken(text, record.model)) {
    throw new Error(`${record.storagePath}: missing exact model token ${record.model}`)
  }
  if (!/MAIN TECHNICAL PARAMETERS|基本规格|功率/i.test(text)) {
    throw new Error(`${record.storagePath}: missing datasheet/specification markers`)
  }

  const normalizedText = normalize(text)
  const siblingHits = record.siblingTokens.filter(
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

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} Xinchai product datasheets`)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Xinchai' || normalize(engine.model) !== normalize(record.model)) {
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
