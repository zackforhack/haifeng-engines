import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'cummins-exact-gas-spec-sheets-2026-08')
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const cSeriesTokens = [
  'C20N6',
  'C25N6',
  'C30N6',
  'C36N6',
  'C40N6',
  'C45N6',
  'C50N6',
  'C60N6',
  'C70N6',
  'C80N6',
  'C100N6',
  'C125N6',
  'C150N6',
  'C175N6B',
  'C200N6',
  'C200N6B',
  'C250N6',
  'C300N6',
  'C350N6',
  'C400N6',
  'C450N6',
  'C500N6B',
  'C550N6',
  'C600N6',
  'C650N6',
  'C750N6',
  'C1000N6',
  'C1100N6C',
  'C1250N6',
  'C1350N6',
  'C1400N6C',
  'C1600N6CD',
  'C1800N6CD',
  'C2000N6CD',
]

const records = [
  {
    slug: 'cummins-c125n6',
    modelToken: 'C125N6',
    sourcePage: 'https://onpointgen.com/equipment/generators/cummins/c125-n6/',
    sourceUrl:
      'https://rockymountaingeneratorsupply.com/userfiles/2002/C125N6%20Spec%20Sheet.pdf',
    storagePath: 'cummins/gas/exact-spec-sheets/c125n6-spec-sheet.pdf',
    label: 'Cummins C125N6 Generator Set Data Sheet',
  },
  {
    slug: 'cummins-c100n6',
    modelToken: 'C100N6',
    sourcePage: 'https://onpointgen.com/equipment/generators/cummins/c100-n6/',
    sourceUrl: 'https://www.depco.com/wp-content/uploads/2023/02/Cummins-C100N6-Data-Sheet.pdf',
    storagePath: 'cummins/gas/exact-spec-sheets/c100n6-data-sheet.pdf',
    label: 'Cummins C100N6 Generator Set Data Sheet',
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

function verifyPdf(record, localPath) {
  const buffer = fs.readFileSync(localPath)
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${record.sourceUrl}: response is not a PDF`)
  }

  const text = execFileSync('pdftotext', [localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const normalizedText = normalize(text)
  const required = [record.modelToken, 'Cummins']
  const missing = required.filter((token) => !normalizedText.includes(normalize(token)))
  if (missing.length) {
    throw new Error(`${record.storagePath}: missing token(s): ${missing.join(', ')}`)
  }
  if (
    !normalizedText.includes(normalize('Generator Set Data Sheet'))
    && !normalizedText.includes(normalize('Specification Sheet'))
  ) {
    throw new Error(`${record.storagePath}: missing datasheet/specification marker`)
  }

  const extraModels = cSeriesTokens
    .filter((token) => token !== record.modelToken)
    .filter((token) => normalizedText.includes(normalize(token)))
  if (extraModels.length) {
    throw new Error(
      `${record.storagePath}: appears to cover additional model(s): ${extraModels.join(', ')}`,
    )
  }

  return buffer
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
  return verifyPdf(record, localPath)
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
  .in('slug', records.map((record) => record.slug))
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let verified = 0
let linked = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} Cummins exact gas spec sheets`)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)

  process.stdout.write(`${engine.model} ... `)
  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  const buffer = await downloadPdf(record, localPath)
  verified += 1

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
    linked += 1
  }

  console.log(`${APPLY ? 'linked' : 'verified'} (${Math.round(buffer.length / 1024)}KB)`)
}

console.log(`${APPLY ? 'Applied' : 'Dry run complete'}: ${verified} verified, ${linked} linked`)
