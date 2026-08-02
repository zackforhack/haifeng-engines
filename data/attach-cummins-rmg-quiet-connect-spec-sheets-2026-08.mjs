import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'cummins-rmg-quiet-connect-spec-sheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const SOURCE_PAGE = 'https://rockymountaingeneratorsupply.com/Residential-Generators'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'cummins-c25n6',
    model: 'C25N6',
    sourceUrl: 'https://rockymountaingeneratorsupply.com/userfiles/2002/C25N6%20Spec%20Sheet.pdf',
    storagePath: 'cummins/gas/exact-spec-sheets/c25n6-rmg-spec-sheet.pdf',
    label: 'Cummins C25N6 Specification Sheet',
    requiredTokens: ['C25N6', 'Cummins', 'Specification Sheet', 'NAS-5775d-EN'],
  },
  {
    slug: 'cummins-c30n6',
    model: 'C30N6',
    sourceUrl: 'https://rockymountaingeneratorsupply.com/userfiles/2002/C30N6%20Spec%20Sheet.pdf',
    storagePath: 'cummins/gas/exact-spec-sheets/c30n6-rmg-spec-sheet.pdf',
    label: 'Cummins C30N6 Specification Sheet',
    requiredTokens: ['C30N6', 'Cummins', 'Specification Sheet', 'NAS-5776d-EN'],
  },
  {
    slug: 'cummins-c36n6',
    model: 'C36N6',
    sourceUrl: 'https://rockymountaingeneratorsupply.com/userfiles/2002/C36N6%20Spec%20Sheet.pdf',
    storagePath: 'cummins/gas/exact-spec-sheets/c36n6-rmg-spec-sheet.pdf',
    label: 'Cummins C36N6 Specification Sheet',
    requiredTokens: ['C36N6', 'Cummins', 'Specification Sheet', 'NAS-5777d-EN'],
  },
  {
    slug: 'cummins-c40n6',
    model: 'C40N6',
    sourceUrl: 'https://rockymountaingeneratorsupply.com/userfiles/2002/C40N6%20Spec%20Sheet.pdf',
    storagePath: 'cummins/gas/exact-spec-sheets/c40n6-rmg-spec-sheet.pdf',
    label: 'Cummins C40N6 Specification Sheet',
    requiredTokens: ['C40N6', 'Cummins', 'Specification Sheet', 'NAS-5778d-EN'],
  },
]

const rejectTokens = [
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

  const rejected = rejectTokens
    .filter((token) => normalize(token) !== normalize(record.model))
    .filter((token) => hasToken(text, token))
  if (rejected.length) {
    throw new Error(`${record.storagePath}: contains sibling token(s): ${rejected.join(', ')}`)
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

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} Cummins RMG exact spec sheets`)

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
