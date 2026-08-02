import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'doosan-hd-official-gas-spec-sheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const BASE = 'https://www.hd-hyundaiengine.com'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'doosan-ge08ti',
    model: 'GE08TI',
    detailId: '36',
    sourceFilename: 'HCE_GE08TI_GEN_PACK-D_Spec Sheet.pdf',
    sourceUrl: `${BASE}/hd-infra-engine/file/down/7f3cbceb-be2e-445e-aa0d-956bb9aa4a75`,
    storagePath: 'doosan/hd-official-gas-spec-sheets/ge08ti-gen-pack-d-spec-sheet.pdf',
    label: 'Doosan GE08TI Official HD Gas Engine Spec Sheet',
    requiredTokens: ['GE08TI', 'GEN-PACK', 'HD Hyundai', 'Specifications'],
  },
  {
    slug: 'doosan-gv158ti',
    model: 'GV158TI',
    detailId: '38',
    sourceFilename: 'HCE_GV158TI_GEN_PACK-B_Spec Sheet.pdf',
    sourceUrl: `${BASE}/hd-infra-engine/file/down/404189b3-a955-4f19-8f1f-f203649eee98`,
    storagePath: 'doosan/hd-official-gas-spec-sheets/gv158ti-gen-pack-b-spec-sheet.pdf',
    label: 'Doosan GV158TI Official HD Gas Engine Spec Sheet',
    requiredTokens: ['GV158TI', 'GEN-PACK', 'HD Hyundai', 'Specifications'],
  },
  {
    slug: 'doosan-gv180ti',
    model: 'GV180TI',
    detailId: '39',
    sourceFilename: 'HCE_GV180TI_GEN_PACK-BV_Spec Sheet.pdf',
    sourceUrl: `${BASE}/hd-infra-engine/file/down/5fe63f72-546a-427a-845b-deaf13d3d247`,
    storagePath: 'doosan/hd-official-gas-spec-sheets/gv180ti-gen-pack-bv-spec-sheet.pdf',
    label: 'Doosan GV180TI Official HD Gas Engine Spec Sheet',
    requiredTokens: ['GV180TI', 'GEN-PACK', 'HD Hyundai', 'Specifications'],
  },
  {
    slug: 'doosan-gv222ti',
    model: 'GV222TI',
    detailId: '40',
    sourceFilename: 'HCE_GV222TI_GEN_PACK-C_Spec Sheet.pdf',
    sourceUrl: `${BASE}/hd-infra-engine/file/down/d1068ea3-ca36-4c95-a39c-413cbb9b8d77`,
    storagePath: 'doosan/hd-official-gas-spec-sheets/gv222ti-gen-pack-c-spec-sheet.pdf',
    label: 'Doosan GV222TI Official HD Gas Engine Spec Sheet',
    requiredTokens: ['GV222TI', 'GEN-PACK', 'HD Hyundai', 'Specifications'],
  },
]

const rejectTokens = ['GE08TI', 'GE12TI', 'GV158TI', 'GV180TI', 'GV222TI']

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
  const missingSlugs = new Set((report.groups?.Doosan ?? []).map((row) => row.slug))
  const stale = records.filter((record) => !missingSlugs.has(record.slug))
  if (stale.length) {
    throw new Error(
      'Record(s) are no longer missing exclusive datasheets: '
      + stale.map((record) => record.slug).join(', '),
    )
  }
}

function downloadPage(record) {
  const sourcePage = `${BASE}/en/engine/generator-detail/${record.detailId}`
  const localPath = path.join(TMP_DIR, `${record.slug}.html`)
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--compressed',
    '--retry',
    '2',
    '--connect-timeout',
    '30',
    '--max-time',
    '180',
    '--user-agent',
    UA,
    '--output',
    localPath,
    sourcePage,
  ], { maxBuffer: 20 * 1024 * 1024 })

  const html = fs.readFileSync(localPath, 'utf8')
  if (!html.includes(record.model) || !html.includes(record.sourceFilename)) {
    throw new Error(`${sourcePage}: source page does not expose ${record.sourceFilename}`)
  }

  return sourcePage
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
    `${BASE}/en/engine/generator-detail/${record.detailId}`,
    '--output',
    localPath,
    record.sourceUrl,
  ], { maxBuffer: 20 * 1024 * 1024 })

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

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} Doosan/HD official gas spec sheets`)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Doosan' || normalize(engine.model) !== normalize(record.model)) {
    throw new Error(`Engine mismatch for ${record.slug}: ${engine.brand} ${engine.model}`)
  }

  process.stdout.write(`${engine.model} [detail ${record.detailId}] ... `)
  downloadPage(record)
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
