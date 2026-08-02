import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'emean-weichai-engine-datasheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'weichai-wp2-3d25e200',
    model: 'WP2.3D25E200',
    sourcePage:
      'https://www.emeanpower.com/WEICHAI-16KW-880KW/16kW-Good-Generator-WEICHAI-Diesel-GenSet-EMEAN.html',
    sourceUrl:
      'https://www.emeanpower.com/ueditor/php/upload/file/20240622/1719025110750007.pdf',
    storagePath: 'weichai/emean-engine-datasheets/wp2-3d25e200.pdf',
  },
  {
    slug: 'weichai-wp2-3d33e200',
    model: 'WP2.3D33E200',
    sourcePage:
      'https://www.emeanpower.com/WEICHAI-16KW-880KW/20kW-Quiet-240V-Generator-WEICHAI-Diesel-EMEAN.html',
    sourceUrl:
      'https://www.emeanpower.com/ueditor/php/upload/file/20240622/1719024022404885.pdf',
    storagePath: 'weichai/emean-engine-datasheets/wp2-3d33e200.pdf',
  },
  {
    slug: 'weichai-wp2-3d41e201',
    model: 'WP2.3D41E201',
    sourcePage:
      'https://www.emeanpower.com/WEICHAI-16KW-880KW/30kVA-Generator-For-220V-WEICHAI-Engine-EMEAN.html',
    sourceUrl:
      'https://www.emeanpower.com/ueditor/php/upload/file/20240622/1719023169558762.pdf',
    storagePath: 'weichai/emean-engine-datasheets/wp2-3d41e201.pdf',
  },
  {
    slug: 'weichai-wp2-3d40e200',
    model: 'WP2.3D40E200',
    sourcePage:
      'https://www.emeanpower.com/WEICHAI-16KW-880KW/30kW-240V-Generator-WEICHAI-Diesel-EMEAN-Power.html',
    sourceUrl:
      'https://www.emeanpower.com/ueditor/php/upload/file/20240622/1719022407901793.pdf',
    storagePath: 'weichai/emean-engine-datasheets/wp2-3d40e200.pdf',
  },
  {
    slug: 'weichai-wp2-3d48e200',
    model: 'WP2.3D48E200',
    sourcePage:
      'https://www.emeanpower.com/WEICHAI-16KW-880KW/40kW-Best-Electric-Start-Generator-WEICHAI-Diesel-EMEAN.html',
    sourceUrl:
      'https://www.emeanpower.com/ueditor/php/upload/file/20240622/1719019217940084.pdf',
    storagePath: 'weichai/emean-engine-datasheets/wp2-3d48e200.pdf',
  },
  {
    slug: 'weichai-12m26d968e200',
    model: '12M26D968E200',
    sourcePage:
      'https://www.emeanpower.com/WEICHAI-800KW-1600KW/1000KVA-800KW-Contianer-Type-Genset-With-WEICHAI-Engine.html',
    sourceUrl:
      'https://www.emeanpower.com/ueditor/php/upload/file/20240725/1721873224630073.pdf',
    storagePath: 'weichai/emean-engine-datasheets/12m26d968e200.pdf',
  },
  {
    slug: 'weichai-12m33d1108e200',
    model: '12M33D1108E200',
    sourcePage:
      'https://www.emeanpower.com/WEICHAI-800KW-1600KW/1125KVA-900KW-50HZ-Contianer-Type-Genset-With-WEICHAI-Engine.html',
    sourceUrl:
      'https://www.emeanpower.com/ueditor/php/upload/file/20240725/1721872640121725.pdf',
    storagePath: 'weichai/emean-engine-datasheets/12m33d1108e200.pdf',
  },
  {
    slug: 'weichai-12m33d1210e200',
    model: '12M33D1210E200',
    sourcePage:
      'https://www.emeanpower.com/WEICHAI-800KW-1600KW/1250KVA-1000KW-50HZ-Contianer-Type-Genset-With-WEICHAI-Engine.html',
    sourceUrl:
      'https://www.emeanpower.com/ueditor/php/upload/file/20240725/1721871063251212.pdf',
    storagePath: 'weichai/emean-engine-datasheets/12m33d1210e200.pdf',
  },
  {
    slug: 'weichai-12m33d1320e200',
    model: '12M33D1320E200',
    sourcePage:
      'https://www.emeanpower.com/WEICHAI-800KW-1600KW/1375KVA-1100KW-50HZ-Contianer-Type-Genset-With-WEICHAI-Engine.html',
    sourceUrl:
      'https://www.emeanpower.com/ueditor/php/upload/file/20240729/1722224860132192.pdf',
    storagePath: 'weichai/emean-engine-datasheets/12m33d1320e200.pdf',
  },
  {
    slug: 'weichai-16m33d1680e310',
    model: '16M33D1680E310',
    sourcePage:
      'https://www.emeanpower.com/WEICHAI-800KW-1600KW/1750KVA-1400KW-50HZ-Contianer-Type-Genset-With-WEICHAI-Engine.html',
    sourceUrl:
      'https://www.emeanpower.com/ueditor/php/upload/file/20240724/1721812538464934.pdf',
    storagePath: 'weichai/emean-engine-datasheets/16m33d1680e310.pdf',
  },
  {
    slug: 'weichai-16m33d1980e310',
    model: '16M33D1980E310',
    sourcePage:
      'https://www.emeanpower.com/WEICHAI-800KW-1600KW/2000KVA-1600KW-Contianer-Type-Genset-With-WEICHAI-Engine.html',
    sourceUrl:
      'https://www.emeanpower.com/ueditor/php/upload/file/20240724/1721807017694635.pdf',
    storagePath: 'weichai/emean-engine-datasheets/16m33d1980e310.pdf',
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

function readMissingWeichaiRows() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  return report.groups?.Weichai ?? []
}

function assertStillMissingExclusive() {
  const missingSlugs = new Set(readMissingWeichaiRows().map((row) => row.slug))
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
    record.sourcePage,
    '--output',
    localPath,
    record.sourceUrl,
  ], {
    maxBuffer: 30 * 1024 * 1024,
  })

  const buffer = fs.readFileSync(localPath)
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${record.sourceUrl}: response is not a PDF`)
  }
  return buffer
}

function verifyPdf(record, localPath, missingRows) {
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  })
  const normalizedText = normalize(text)
  const requiredTokens = [
    record.model,
    'Engine Datasheet',
    '发动机数据单',
  ]
  const missingTokens = requiredTokens.filter(
    (token) => !normalizedText.includes(normalize(token)),
  )
  if (missingTokens.length) {
    throw new Error(
      `${record.storagePath}: missing expected token(s): ${missingTokens.join(', ')}`,
    )
  }

  const siblingHits = missingRows
    .filter((row) => row.model !== record.model)
    .filter((row) => normalizedText.includes(normalize(row.model)))
    .map((row) => row.model)
  if (siblingHits.length) {
    throw new Error(
      `${record.storagePath}: contains other missing Weichai model token(s): `
      + siblingHits.join(', '),
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

const missingRows = readMissingWeichaiRows()
const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let verified = 0
let linked = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} Emean-hosted Weichai engine datasheets`)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Weichai' || normalize(engine.model) !== normalize(record.model)) {
    throw new Error(`Engine mismatch for ${record.slug}: ${engine.brand} ${engine.model}`)
  }

  process.stdout.write(`${engine.model} ... `)
  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  const buffer = downloadPdf(record, localPath)
  verifyPdf(record, localPath, missingRows)
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
    label: `Weichai ${record.model} Engine Datasheet`,
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
