import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'kirloskar-americas-official-spec-sheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const SOURCE_PAGE = 'https://www.kirloskaramericas.com/generator-drive-engines'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'kirloskar-4r810na1',
    model: '4R810NA1',
    sourceUrl:
      'https://www.kirloskaramericas.com/documents/5928996/5929168/'
      + 'T4.3068_4R810NA1_For+30kWe_Specification+Sheet.pdf/'
      + 'dcb1a4fc-f47d-03b9-1573-ce350345771e?t=1759466868790',
    storagePath: 'kirloskar/official-spec-sheets/4r810na1-specification-sheet.pdf',
    label: 'Kirloskar Americas 4R810NA1 Official Specification Sheet',
    requiredTokens: ['4R810NA1', 'BROAD SPECIFICATIONS', 'Engine Model', 'US EPA TIER'],
  },
  {
    slug: 'kirloskar-4r810ta2',
    model: '4R810TA2',
    sourceUrl:
      'https://www.kirloskaramericas.com/documents/5928996/5929170/'
      + '4R810TA2_For+40kWe_Specification+Sheet.pdf/'
      + '5ff08b8b-a344-1921-0694-d1d6749fb08d?t=1748927656345',
    storagePath: 'kirloskar/official-spec-sheets/4r810ta2-specification-sheet.pdf',
    label: 'Kirloskar Americas 4R810TA2 Official Specification Sheet',
    requiredTokens: ['4R810TA2', 'BROAD SPECIFICATIONS', 'Engine Model', 'US EPA TIER'],
  },
  {
    slug: 'kirloskar-4r810ta1',
    model: '4R810TA1',
    sourceUrl:
      'https://www.kirloskaramericas.com/documents/5928996/5929170/'
      + '4R810TA1_For+60kWe_Specification+Sheet.pdf/'
      + 'b7c73d90-2b56-3811-87ef-d964356047c2?t=1748927701521',
    storagePath: 'kirloskar/official-spec-sheets/4r810ta1-specification-sheet.pdf',
    label: 'Kirloskar Americas 4R810TA1 Official Specification Sheet',
    requiredTokens: ['4R810TA1', 'BROAD SPECIFICATIONS', 'Engine Model', 'US EPA TIER'],
  },
  {
    slug: 'kirloskar-4k1080ta1',
    model: '4K1080TA1',
    sourceUrl:
      'https://www.kirloskaramericas.com/documents/5928996/5929170/'
      + '4K1080TA1_For+100kWe_Specification+Sheet.pdf/'
      + '5ac20c32-a8f8-dcfd-1517-99bf83ac84ec?t=1748927730958',
    storagePath: 'kirloskar/official-spec-sheets/4k1080ta1-specification-sheet.pdf',
    label: 'Kirloskar Americas 4K1080TA1 Official Specification Sheet',
    requiredTokens: ['4K1080TA1', 'BROAD SPECIFICATIONS', 'Engine Model', 'US EPA TIER'],
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

function assertStillMissingExclusive() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  const missingSlugs = new Set((report.groups?.Kirloskar ?? []).map((row) => row.slug))
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
  return buffer
}

function verifyPdf(record, localPath) {
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
    .filter((sibling) => hasToken(text, sibling.model))
    .map((sibling) => sibling.model)
  if (siblingHits.length) {
    throw new Error(
      `${record.storagePath}: contains sibling Kirloskar model token(s): `
      + siblingHits.join(', '),
    )
  }

  for (const rejectedSibling of ['2R550NA', '2R550NA1', '3R550NA', '3R550NA1']) {
    if (hasToken(text, rejectedSibling)) {
      throw new Error(
        `${record.storagePath}: contains rejected nearby Kirloskar token: `
        + rejectedSibling,
      )
    }
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

console.log(
  `${APPLY ? 'APPLY' : 'DRY RUN'}: `
  + `${records.length} Kirloskar Americas official specification sheets`,
)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Kirloskar' || normalize(engine.model) !== normalize(record.model)) {
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
