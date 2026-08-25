import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const PDFTOTEXT_BIN = process.env.PDFTOTEXT_BIN || 'pdftotext'

const DEFAULT_HMT13F_PATH =
  '/Users/ziqianhuang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/aassdfg684_5b6a/msg/file/2026-08/HMT13F.408发动机性能数据V2.pdf'
const DEFAULT_HMT14F_PATH =
  '/Users/ziqianhuang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/aassdfg684_5b6a/msg/file/2026-08/HMT14F性能数据V1_2024121.pdf'

const round1 = (value) => Math.round(value * 10) / 10

const RECORDS = [
  {
    localPath: process.env.CAMC_HMT13F_PDF_PATH || DEFAULT_HMT13F_PATH,
    storagePath: 'camc-hanma/gas/hmt13f-408-engine-performance-data-v2.pdf',
    label: 'CAMC Hanma HMT13F.408 Engine Performance Data V2',
    requiredTokens: ['HMT13F.408', 'Rated power', '300 kW', '330 kW', '12.82L', '130×161mm'],
    row: {
      slug: 'camc-hanma-hmt13f-408',
      brand: 'CAMC Hanma',
      model: 'HMT13F.408',
      series: 'HMT13F',
      status: 'active',
      origin: 'China',
      fuel_type: 'Natural Gas',
      ignition_type: 'Spark Ignition',
      cooling_method: 'Liquid-Cooled',
      emissions_standard: 'China Non-road Stage III / GB20891-2014',
      rpm_rated: 1500,
      cylinders: 6,
      configuration: 'L6',
      displacement_l: 12.82,
      compression_ratio: '11.5:1',
      weight_kg: 1065,
      length_mm: 1998,
      width_mm: 957,
      height_mm: 1557,
      power_kw: 300,
      prime_power_kw_50hz: 300,
      prime_power_kwe_50hz: 300,
      prime_power_kva_50hz: round1(300 / 0.8),
      standby_power_kw_50hz: 330,
      standby_power_kwe_50hz: 330,
      standby_power_kva_50hz: round1(330 / 0.8),
      description:
        'CAMC Hanma HMT13F.408 is a 12.82 L inline-6 spark-ignited natural gas generator-drive engine rated 300 kW at 1500 rpm, with 330 kW overload power and 250 kW PRP generator-set guidance for 50 Hz applications.',
    },
  },
  {
    localPath: process.env.CAMC_HMT14F_PDF_PATH || DEFAULT_HMT14F_PATH,
    storagePath: 'camc-hanma/gas/hmt14f-engine-performance-data-v1.pdf',
    label: 'CAMC Hanma HMT14F Engine Performance Data V1',
    requiredTokens: ['HMT14F', '328@1500', '361@1500', '6×133×164', '13.67', 'LNG/CNG'],
    row: {
      slug: 'camc-hanma-hmt14f',
      brand: 'CAMC Hanma',
      model: 'HMT14F',
      series: 'HMT14F',
      status: 'active',
      origin: 'China',
      fuel_type: 'Natural Gas',
      ignition_type: 'Spark Ignition',
      cooling_method: 'Liquid-Cooled',
      emissions_standard: 'Unregulated',
      rpm_rated: 1500,
      cylinders: 6,
      configuration: 'L6',
      displacement_l: 13.67,
      weight_kg: 1100,
      power_kw: 328,
      prime_power_kw_50hz: 328,
      prime_power_kwe_50hz: 328,
      prime_power_kva_50hz: round1(328 / 0.8),
      standby_power_kw_50hz: 361,
      standby_power_kwe_50hz: 361,
      standby_power_kva_50hz: round1(361 / 0.8),
      description:
        'CAMC Hanma HMT14F is a 13.67 L inline-6 spark-ignited CNG/LNG generator-drive engine rated 328 kW at 1500 rpm, with 361 kW overload power and 300-330 kW 50 Hz generator-set guidance.',
    },
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

function verifyPdf(record) {
  const buffer = fs.readFileSync(record.localPath)
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${record.localPath}: not a PDF`)
  }

  const text = execFileSync(PDFTOTEXT_BIN, ['-layout', record.localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const normalizedText = normalize(text)
  const missing = record.requiredTokens.filter((token) => !normalizedText.includes(normalize(token)))
  if (missing.length) {
    throw new Error(`${record.localPath}: missing required token(s): ${missing.join(', ')}`)
  }
  return { buffer, text }
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: CAMC Hanma gas engine import`)

for (const record of RECORDS) {
  const { buffer } = verifyPdf(record)
  console.log(`Verified ${record.row.model}: ${Math.round(buffer.length / 1024)}KB`)

  if (!APPLY) continue

  const { data: engine, error: upsertError } = await supabase
    .from('engines')
    .upsert(record.row, { onConflict: 'slug' })
    .select('id, slug, brand, model')
    .single()
  if (upsertError) throw upsertError

  const upload = await uploadPdf(supabase, BUCKET, record.localPath, record.storagePath)
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

  console.log(`Upserted ${engine.slug} and linked ${record.storagePath}`)
}

if (!APPLY) {
  console.log('Dry run passed. Re-run with --apply to upsert engines and upload/link PDFs.')
}
