import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'baudouin-official-gas-spec-sheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'baudouin-6m11g4n0-5',
    model: '6M11G4N0/5',
    productTitle: '6M11',
    sourcePage: 'https://baudouin.com/engine_product/6m11-3/',
    sourceUrl:
      'https://baudouin.com/wp-content/uploads/2024/08/10012_MB_NG_6M11_Spec_Sheet_revG_converted.pdf',
    storagePath: 'baudouin/official-gas-spec-sheets/6m11g4n0-5.pdf',
    label: 'Baudouin 6M11G4N0/5 Natural Gas Engine Spec Sheet',
  },
  {
    slug: 'baudouin-6m16g4n0-5',
    model: '6M16G4N0/5',
    productTitle: '6M16',
    sourcePage: 'https://baudouin.com/engine_product/6m16-6/',
    sourceUrl:
      'https://baudouin.com/wp-content/uploads/2024/08/10012_MB_NG_6M16_Spec_Sheet_revG_converted.pdf',
    storagePath: 'baudouin/official-gas-spec-sheets/6m16g4n0-5.pdf',
    label: 'Baudouin 6M16G4N0/5 Natural Gas Engine Spec Sheet',
  },
  {
    slug: 'baudouin-6m21g4n0-5',
    model: '6M21G4N0/5',
    productTitle: '6M21',
    sourcePage: 'https://baudouin.com/engine_product/6m21-3/',
    sourceUrl:
      'https://baudouin.com/wp-content/uploads/2024/08/10012_MB_NG_6M21_Spec_Sheet_revG_converted.pdf',
    storagePath: 'baudouin/official-gas-spec-sheets/6m21g4n0-5.pdf',
    label: 'Baudouin 6M21G4N0/5 Natural Gas Engine Spec Sheet',
    allowedForeignModels: ['6M16G4N0/5'],
    note: 'The OEM PDF is titled 6M21 and has the correct 6M21 rating row; its dimensions table carries a 6M16 token.',
  },
  {
    slug: 'baudouin-6m33g6n0-5',
    model: '6M33G6N0/5',
    productTitle: '6M33',
    sourcePage: 'https://baudouin.com/engine_product/6m33-4/',
    sourceUrl: 'https://baudouin.com/wp-content/uploads/2025/04/MB_NG_6M33_Specsheet.pdf',
    storagePath: 'baudouin/official-gas-spec-sheets/6m33g6n0-5.pdf',
    label: 'Baudouin 6M33G6N0/5 Natural Gas Engine Spec Sheet',
  },
  {
    slug: 'baudouin-12m55g6n0-5',
    model: '12M55G6N0/5',
    productTitle: '12M55',
    sourcePage: 'https://baudouin.com/engine_product/12m55-2/',
    sourceUrl:
      'https://baudouin.com/wp-content/uploads/2024/08/10403_12M55_Gas_Spec_Sheet_revC_-3.pdf',
    storagePath: 'baudouin/official-gas-spec-sheets/12m55g6n0-5.pdf',
    label: 'Baudouin 12M55G6N0/5 Gas Engine Spec Sheet',
  },
  {
    slug: 'baudouin-16m33g6n0-5',
    model: '16M33G6N0/5',
    productTitle: '16M33',
    sourcePage: 'https://baudouin.com/engine_product/16m33-2/',
    sourceUrl:
      'https://baudouin.com/wp-content/uploads/2024/08/10012_MB_NG_16M33_Spec_Sheet_revG_converted.pdf',
    storagePath: 'baudouin/official-gas-spec-sheets/16m33g6n0-5.pdf',
    label: 'Baudouin 16M33G6N0/5 Natural Gas Engine Spec Sheet',
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

function readMissingBaudouinModels() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  return report.groups?.Baudouin ?? []
}

function assertStillMissingExclusive() {
  const missingSlugs = new Set(readMissingBaudouinModels().map((row) => row.slug))
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

function verifyPdf(record, localPath, missingBaudouinRows) {
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })

  if (!hasExactToken(text, record.productTitle)) {
    throw new Error(`${record.storagePath}: missing product title token ${record.productTitle}`)
  }
  if (!hasExactToken(text, record.model)) {
    throw new Error(`${record.storagePath}: missing exact model token ${record.model}`)
  }
  if (!/Baudouin\.com/i.test(text) || !/PowerKit|Gas Engine|Biogas Engine/i.test(text)) {
    throw new Error(`${record.storagePath}: missing Baudouin spec-sheet markers`)
  }

  const allowedForeignModels = new Set(record.allowedForeignModels ?? [])
  const foreignHits = missingBaudouinRows
    .filter((row) => row.model !== record.model && !allowedForeignModels.has(row.model))
    .filter((row) => hasExactToken(text, row.model))
    .map((row) => row.model)

  if (foreignHits.length) {
    throw new Error(
      `${record.storagePath}: contains other missing Baudouin model token(s): `
      + foreignHits.join(', '),
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
  .select('id, slug, brand, model')
  .in('slug', records.map((record) => record.slug))
if (enginesError) throw enginesError

const missingBaudouinRows = readMissingBaudouinModels()
const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let verified = 0
let linked = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} Baudouin official gas spec sheets`)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Baudouin' || normalize(engine.model) !== normalize(record.model)) {
    throw new Error(`Engine mismatch for ${record.slug}: ${engine.brand} ${engine.model}`)
  }

  process.stdout.write(`${engine.model} ... `)
  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  const buffer = downloadPdf(record, localPath)
  verifyPdf(record, localPath, missingBaudouinRows)
  verified += 1

  if (!APPLY) {
    const suffix = record.note ? ` verified (${record.note})` : ' verified'
    console.log(`${Math.round(buffer.length / 1024)}KB${suffix}`)
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

  const suffix = record.note ? ` linked (${record.note})` : ' linked'
  console.log(`${Math.round(buffer.length / 1024)}KB${suffix}`)
  linked += 1
}

console.log(
  `\n${APPLY ? 'Applied' : 'Dry run complete'}: `
  + `${verified} verified, ${linked} linked.`,
)
