import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'liebherr-official-engine-datasheets-2026-08')
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const RECORDS = [
  {
    slug: 'liebherr-d976',
    modelToken: 'D976',
    sourcePage:
      'https://www.liebherr.com/en-au/components/solutions/combustion-engines/product-portfolio-diesel-engines/d976-power-generation-8858374',
    sourceUrl:
      'https://assets-cdn.liebherr.com/versions/cc38f271-69f5-4485-adee-4eb644a1812c/original/Brochure-Genset_6pages-OK_FINAL-12032026.pdf',
    storagePath: 'liebherr/official-engine-datasheets/d976-power-generation.pdf',
    label: 'Liebherr D976 Engine for Power Generation PDF',
    requiredTokens: ['D976', 'Liebherr'],
    rejectTokens: ['D936', 'D946', 'D9508', 'D9612', 'D9812', 'D9816', 'D9820'],
  },
  {
    slug: 'liebherr-d9612',
    modelToken: 'D9612',
    sourcePage:
      'https://www.liebherr.com/en-gb/components/solutions/combustion-engines/product-portfolio-diesel-engines/d9612-power-generation-8918883',
    sourceUrl:
      'https://assets-cdn.liebherr.com/versions/b4632d44-a734-4eca-a467-6fafdba8b8c9/original/',
    storagePath: 'liebherr/official-engine-datasheets/d9612-power-generation.pdf',
    label: 'Liebherr D9612 Engine for Power Generation PDF',
    requiredTokens: ['D9612', 'Liebherr'],
    rejectTokens: ['D976', 'D9616', 'D9620', 'D9812', 'D9816', 'D9820'],
  },
  {
    slug: 'liebherr-d9616',
    modelToken: 'D9616',
    sourcePage:
      'https://www.liebherr.com/en-gb/components/solutions/combustion-engines/product-portfolio-diesel-engines/d9616-power-generation-8918884',
    sourceUrl:
      'https://assets-cdn.liebherr.com/versions/4124b14e-a651-4c5f-9acb-3b1a8a0d4181/original/',
    storagePath: 'liebherr/official-engine-datasheets/d9616-power-generation.pdf',
    label: 'Liebherr D9616 Engine for Power Generation PDF',
    requiredTokens: ['D9616', 'Liebherr'],
    rejectTokens: ['D976', 'D9612', 'D9620', 'D9812', 'D9816', 'D9820'],
  },
  {
    slug: 'liebherr-d9620',
    modelToken: 'D9620',
    sourcePage:
      'https://www.liebherr.com/en-gb/components/solutions/combustion-engines/product-portfolio-diesel-engines/d9620-power-generation-8968686',
    sourceUrl:
      'https://assets-cdn.liebherr.com/versions/157d514c-a0d0-4a7d-a748-45a87839d038/original/',
    storagePath: 'liebherr/official-engine-datasheets/d9620-power-generation.pdf',
    label: 'Liebherr D9620 Engine for Power Generation PDF',
    requiredTokens: ['D9620', 'Liebherr'],
    rejectTokens: ['D976', 'D9612', 'D9616', 'D9812', 'D9816', 'D9820'],
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

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: official Liebherr engine datasheets`)

let linked = 0
for (const record of RECORDS) {
  const { data: engines, error: enginesError } = await supabase
    .from('engines')
    .select('id, slug, brand, model')
    .eq('slug', record.slug)
  if (enginesError) throw enginesError

  const engine = engines?.[0]
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Liebherr') {
    throw new Error(`${record.slug}: expected Liebherr, got ${engine.brand}`)
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

console.log(`${APPLY ? 'Linked' : 'Verified'} ${linked} official Liebherr datasheet(s).`)
