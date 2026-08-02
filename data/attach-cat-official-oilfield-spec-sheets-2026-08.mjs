import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'cat-official-oilfield-spec-sheets-2026-08')
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const RECORDS = [
  {
    slug: 'caterpillar-g3512',
    modelTokens: ['G3512', 'Caterpillar', 'SPECIFICATIONS'],
    sourcePage: 'https://www.hawthornecat.com/item/g3512/',
    sourceUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20210630-80c97-a706a',
    storagePath: 'caterpillar/spec-sheets/g3512-drilling-genset-spec-sheet.pdf',
    label: 'Cat G3512 Drilling Genset Spec Sheet',
  },
  {
    slug: 'caterpillar-g3520',
    modelTokens: ['G3520', 'Caterpillar', 'Gas Generator Sets'],
    sourcePage: 'https://www.hawthornecat.com/item/g3520/',
    sourceUrl: 'https://s7d2.scene7.com/is/content/Caterpillar/CM20210409-4be59-15f2d',
    storagePath: 'caterpillar/spec-sheets/g3520-oil-gas-generator-set-spec-sheet.pdf',
    label: 'Cat G3520 Oil & Gas Generator Set Spec Sheet',
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

function verifyPdf(localPath, tokens) {
  const buffer = fs.readFileSync(localPath)
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${localPath}: response is not a PDF`)
  }

  const text = execFileSync('pdftotext', [localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const normalized = normalize(text)
  const missing = tokens.filter((token) => !normalized.includes(normalize(token)))
  if (missing.length) {
    throw new Error(`${localPath}: missing expected token(s): ${missing.join(', ')}`)
  }
  return buffer
}

async function downloadPdf(record, localPath) {
  const response = await fetch(record.sourceUrl, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${record.sourceUrl}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  await fsp.writeFile(localPath, buffer)
  return verifyPdf(localPath, record.modelTokens)
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
  .in('slug', RECORDS.map((record) => record.slug))
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))

let verified = 0
let linked = 0
console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${RECORDS.length} official Cat spec sheets`)

for (const record of RECORDS) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)

  process.stdout.write(`${engine.model} ... `)
  const localPath = path.join(TMP_DIR, `${record.slug}.pdf`)
  const buffer = await downloadPdf(record, localPath)
  verified += 1

  if (APPLY) {
    const upload = await uploadPdf(supabase, BUCKET, localPath, record.storagePath)
    if (!upload.ok) {
      console.log('verified, upload failed')
      continue
    }

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
    linked += 1
  }

  console.log(`${APPLY ? 'linked' : 'verified'} (${Math.round(buffer.length / 1024)}KB)`)
}

console.log(`${APPLY ? 'Applied' : 'Dry run complete'}: ${verified} verified, ${linked} linked`)
