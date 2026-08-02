import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'scania-dc13-507a-gap-spec-sheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const SOURCE_PAGE =
  'https://www.scania.com/group/en/home/products-and-services/power-solutions.html'
const BASE_URL =
  'https://www.scania.com/content/dam/www/market/master/products/power-solutions/engine-pdfs-next-generation/power-generation/'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'scania-dc13-507a-550',
    model: 'DC13 507A 550',
    sourceUrl: `${BASE_URL}DC13-507A_550-605kVA.pdf`,
    storagePath: 'scania/spec-sheets/DC13-507A_550-605kVA.pdf',
    label: 'Scania DC13 507A 550/605 kVA Spec Sheet',
    requiredTokens: ['DC13 507A', 'DC13 507A 550', '550-605 kVA', 'Scania'],
  },
  {
    slug: 'scania-dc13-507a-600',
    model: 'DC13 507A 600',
    sourceUrl: `${BASE_URL}DC13-507A_600-660kVA.pdf`,
    storagePath: 'scania/spec-sheets/DC13-507A_600-660kVA.pdf',
    label: 'Scania DC13 507A 600/660 kVA Spec Sheet',
    requiredTokens: ['DC13 507A', 'DC13 507A 600', '600-660 kVA', 'Scania'],
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

function assertStillMissingExclusive() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  const missingSlugs = new Set((report.groups?.Scania ?? []).map((row) => row.slug))
  const stale = records.filter((record) => !missingSlugs.has(record.slug))
  if (stale.length) {
    throw new Error(
      'Record(s) are no longer missing exclusive datasheets: '
      + stale.map((record) => record.slug).join(', '),
    )
  }
}

async function downloadPdf(record, localPath) {
  const response = await fetch(record.sourceUrl, {
    headers: {
      'User-Agent': UA,
      Referer: SOURCE_PAGE,
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(120000),
  })
  if (!response.ok) throw new Error(`${record.sourceUrl}: HTTP ${response.status}`)

  const buffer = Buffer.from(await response.arrayBuffer())
  await fsp.writeFile(localPath, buffer)
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${record.sourceUrl}: response is not a PDF`)
  }
  return buffer
}

function verifyPdf(record, localPath, siblingRows) {
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const normalizedText = normalize(text)

  const missingTokens = record.requiredTokens.filter(
    (token) => !normalizedText.includes(normalize(token)),
  )
  if (missingTokens.length) {
    throw new Error(
      `${record.storagePath}: missing expected token(s): ${missingTokens.join(', ')}`,
    )
  }

  const siblingHits = siblingRows
    .filter((row) => row.slug !== record.slug)
    .filter((row) => normalizedText.includes(normalize(row.model)))
    .map((row) => row.model)
  if (siblingHits.length) {
    throw new Error(
      `${record.storagePath}: contains sibling Scania token(s): ${siblingHits.join(', ')}`,
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
const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
const siblingRows = report.groups?.Scania ?? []
let verified = 0
let linked = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} official Scania DC13 507A spec sheets`)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Scania' || normalize(engine.model) !== normalize(record.model)) {
    throw new Error(`Engine mismatch for ${record.slug}: ${engine.brand} ${engine.model}`)
  }

  process.stdout.write(`${engine.model} ... `)
  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  const buffer = await downloadPdf(record, localPath)
  verifyPdf(record, localPath, siblingRows)
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
