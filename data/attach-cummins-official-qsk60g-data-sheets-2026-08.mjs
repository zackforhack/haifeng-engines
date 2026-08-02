import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'cummins-official-qsk60g-data-sheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const SOURCE_PAGE =
  'https://www.cummins.com/en-apac/generators/products/qsk60g-gas-generator-series'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'cummins-c1000n6',
    model: 'C1000N6',
    sourceUrl: 'https://www.cummins.com/sites/default/files/2020-02/C1000N6%20-%20D-6455.pdf',
    storagePath: 'cummins/gas/official-qsk60g-data-sheets/c1000n6-d-6455.pdf',
    label: 'Cummins C1000N6 Generator Set Data Sheet',
    requiredTokens: ['C1000N6', 'QSK60G', 'Cummins', 'Data Sheet', 'D-6455'],
  },
  {
    slug: 'cummins-c1250n6',
    model: 'C1250N6',
    sourceUrl: 'https://www.cummins.com/sites/default/files/2020-02/C1250N6%20-%20D-6454.pdf',
    storagePath: 'cummins/gas/official-qsk60g-data-sheets/c1250n6-d-6454.pdf',
    label: 'Cummins C1250N6 Generator Set Data Sheet',
    requiredTokens: ['C1250N6', 'QSK60G', 'Cummins', 'Data Sheet', 'D-6454'],
  },
  {
    slug: 'cummins-c1350n6',
    model: 'C1350N6',
    sourceUrl: 'https://www.cummins.com/sites/default/files/2020-02/C1350N6%20-%20D-6453.pdf',
    storagePath: 'cummins/gas/official-qsk60g-data-sheets/c1350n6-d-6453.pdf',
    label: 'Cummins C1350N6 Generator Set Data Sheet',
    requiredTokens: ['C1350N6', 'QSK60G', 'Cummins', 'Data Sheet', 'D-6453'],
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function modelRegex(model) {
  const parts = String(model)
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(escapeRegExp)
  return new RegExp(`(^|[^A-Z0-9])${parts.join('[^A-Z0-9]*')}([^A-Z0-9]|$)`, 'i')
}

function hasModelToken(text, model) {
  return modelRegex(model).test(text)
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function assertStillMissingExclusive() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  const missingSlugs = new Set((report.groups?.Cummins ?? []).map((row) => row.slug))
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
    SOURCE_PAGE,
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

  const siblingHits = records
    .filter((sibling) => sibling.model !== record.model)
    .filter((sibling) => hasModelToken(text, sibling.model))
    .map((sibling) => sibling.model)
  if (siblingHits.length) {
    throw new Error(
      `${record.storagePath}: contains sibling Cummins model token(s): `
      + siblingHits.join(', '),
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
let verified = 0
let linked = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} Cummins official QSK60G data sheets`)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Cummins' || normalize(engine.model) !== normalize(record.model)) {
    throw new Error(`Engine mismatch for ${record.slug}: ${engine.brand} ${engine.model}`)
  }

  process.stdout.write(`${engine.model} ... `)
  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  const buffer = downloadPdf(record, localPath)
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
