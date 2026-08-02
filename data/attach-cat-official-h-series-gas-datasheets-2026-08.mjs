import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'cat-official-h-series-gas-datasheets-2026-08')
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const RECORDS = [
  {
    slug: 'caterpillar-g3512h',
    modelToken: 'G3512H',
    sourcePage:
      'https://h-cpc.cat.com/cmms/v2?cid=402&f=product&gid=18327284&it=product&lid=en&nc=1&pid=1000034459&sc=T210',
    sourceUrl: 'https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1443-',
    storagePath: 'caterpillar/official-gas-datasheets/g3512h-50hz-natural-gas.pdf',
    label: 'Cat G3512H 50 Hz Natural Gas Data Sheet',
    requiredTokens: ['G3512H', 'Cat', 'Caterpillar'],
    rejectTokens: ['G3516H', 'G3520H', 'G3520C', 'CG170', 'CG260'],
  },
  {
    slug: 'caterpillar-g3520h',
    modelToken: 'G3520H',
    sourcePage:
      'https://h-cpc.cat.com/cmms/v2?cid=402&f=product&gid=18327284&it=product&lid=en&nc=1&pid=104683&sc=X355',
    sourceUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20190905-e6c89-25b86',
    storagePath: 'caterpillar/official-gas-datasheets/g3520h-50hz-natural-gas.pdf',
    label: 'Cat G3520H 50 Hz Natural Gas Data Sheet',
    requiredTokens: ['G3520H', 'Cat', 'Caterpillar'],
    rejectTokens: ['G3512H', 'G3516H', 'G3520C', 'CG170', 'CG260'],
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

async function downloadPdf(record, localPath) {
  const response = await fetch(record.sourceUrl, {
    headers: {
      'User-Agent': UA,
      Referer: record.sourcePage,
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${record.sourceUrl}: HTTP ${response.status}`)

  const buffer = Buffer.from(await response.arrayBuffer())
  await fsp.writeFile(localPath, buffer)
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${record.sourceUrl}: response is not a PDF`)
  }

  const text = execFileSync('pdftotext', [localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  })

  const missing = record.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${record.storagePath}: missing required token(s): ${missing.join(', ')}`)
  }

  const rejected = record.rejectTokens.filter((token) => hasToken(text, token))
  if (rejected.length) {
    throw new Error(`${record.storagePath}: appears to cover sibling token(s): ${rejected.join(', ')}`)
  }

  return buffer
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: official Cat H-series gas data sheets`)

let linked = 0
for (const record of RECORDS) {
  const { data: engines, error: enginesError } = await supabase
    .from('engines')
    .select('id, slug, brand, model')
    .eq('slug', record.slug)
  if (enginesError) throw enginesError

  const engine = engines?.[0]
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Caterpillar') {
    throw new Error(`${record.slug}: expected Caterpillar, got ${engine.brand}`)
  }

  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  const buffer = await downloadPdf(record, localPath)
  console.log(`Verified ${engine.slug} ${engine.model}: ${Math.round(buffer.length / 1024)}KB`)

  if (APPLY) {
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
  }

  linked += 1
}

console.log(`${APPLY ? 'Linked' : 'Verified'} ${linked} official Cat data sheet(s).`)
