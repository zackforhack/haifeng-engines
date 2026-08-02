import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'psi-official-gas-spec-sheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'psi-gas-5-7l-tcac',
    model: '5.7L TCAC',
    sourcePage: 'https://psiengines.com/product/5-7l-tcac/',
    sourceUrl:
      'https://psiengines.com/wp-content/uploads/2025/08/PSI-PSYSTEMS_5.7LCAC-Gas_Engine-3.pdf',
    storagePath: 'psi/official-gas-spec-sheets/5-7l-tcac.pdf',
    label: 'PSI 5.7L TCAC Gas Engine Spec Sheet',
    requiredTokens: [
      '5.7LCAC',
      'PSI 5.7-LITER ENGINE DATA',
      'STANDBY',
      'TCAC',
      'Power Solutions International',
    ],
  },
  {
    slug: 'psi-gas-13l-ho',
    model: '13L HO',
    sourcePage: 'https://psiengines.com/product/13l-ho/',
    sourceUrl:
      'https://psiengines.com/wp-content/uploads/2026/05/PSI-PSYSTEMS_13LT-Gas_Engine-3.pdf',
    storagePath: 'psi/official-gas-spec-sheets/13l-ho.pdf',
    label: 'PSI 13L HO Gas Engine Spec Sheet',
    requiredTokens: [
      '13LT',
      'PSI 13-LITER ENGINE DATA',
      'STANDBY HO',
      'Power Solutions International',
    ],
  },
  {
    slug: 'psi-gas-14l-ho',
    model: '14L HO',
    sourcePage: 'https://psiengines.com/product/14l-ho/',
    sourceUrl:
      'https://psiengines.com/wp-content/uploads/2025/08/PSI-PSYSTEMS_14L-Gas_Engine.pdf',
    storagePath: 'psi/official-gas-spec-sheets/14l-ho.pdf',
    label: 'PSI 14L HO Gas Engine Spec Sheet',
    requiredTokens: [
      '14L',
      'PSI 14-LITER ENGINE DATA',
      'HIGH OUTPUT',
      'Power Solutions International',
    ],
  },
  {
    slug: 'psi-gas-22l-ho',
    model: '22L HO',
    sourcePage: 'https://psiengines.com/product/22l-ho/',
    sourceUrl:
      'https://psiengines.com/wp-content/uploads/2025/08/PSI-PSYSTEMS_22L-Gas_Engine-2.pdf',
    storagePath: 'psi/official-gas-spec-sheets/22l-ho.pdf',
    label: 'PSI 22L HO Gas Engine Spec Sheet',
    requiredTokens: [
      '22L',
      'PSI 22-LITER ENGINE DATA',
      'HIGH OUTPUT',
      'Power Solutions International',
    ],
  },
  {
    slug: 'psi-gas-53l-ho',
    model: '53L HO',
    sourcePage: 'https://psiengines.com/product/53l-ho/',
    sourceUrl:
      'https://psiengines.com/wp-content/uploads/2025/08/PSI-PSYSTEMS_53L-Gas_Engine.pdf',
    storagePath: 'psi/official-gas-spec-sheets/53l-ho.pdf',
    label: 'PSI 53L HO Gas Engine Spec Sheet',
    requiredTokens: [
      '53L',
      'PSI 53-LITER ENGINE DATA',
      'STANDBY HO',
      'Power Solutions International',
    ],
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
  const missingSlugs = new Set((report.groups?.PSI ?? []).map((row) => row.slug))
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
    record.sourcePage,
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

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} PSI official gas spec sheets`)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)

  const brand = normalize(engine.brand)
  if (
    brand !== normalize('PSI')
    && !brand.includes(normalize('Power Solutions International'))
  ) {
    throw new Error(`Brand mismatch for ${record.slug}: ${engine.brand}`)
  }
  if (normalize(engine.model) !== normalize(record.model)) {
    throw new Error(`Model mismatch for ${record.slug}: expected ${record.model}, got ${engine.model}`)
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
