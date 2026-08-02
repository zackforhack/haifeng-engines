import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'mwm-guascor-official-gap-spec-sheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    brand: 'MWM',
    slug: 'mwm-tcg-3016-v16-s',
    model: 'TCG 3016 V16 S',
    sourcePage: 'https://www.mwm.net/en/gas-engines-gensets/gas-engine-tcg-3016/',
    sourceUrl:
      'https://www.mwm.net/files/upload/mwm/issuu/MWM18010-OnePager-MWM-TCG-3016_EN_10_screen_dv.pdf',
    storagePath: 'mwm/official-spec-sheets/tcg-3016-v16-s-onepager.pdf',
    label: 'MWM TCG 3016 V16 S One-Page Spec Sheet',
    requiredTokens: [
      'TCG 3016 V16 S',
      'Technical data 50 Hz',
      'Caterpillar Energy Solutions GmbH',
      'www.mwm.net',
    ],
    forbiddenTokens: [
      'TCG 3016 V08',
      'TCG 3016 V12',
      'TCG 2020',
      'TCG 3020',
      'TCG 2032',
    ],
  },
  {
    brand: 'Guascor',
    slug: 'guascor-g-56sl',
    model: 'G-56SL',
    sourcePage: 'https://guascor-energy.com/tri-fuel-mobile-solution/',
    sourceUrl:
      'https://guascor-energy.com/wp-content/uploads/2023/10/6036_Tri-fuel-mobile-solution_en_.pdf',
    downloadMode: 'curl',
    storagePath: 'guascor/official-spec-sheets/g-56sl-tri-fuel-mobile-solution.pdf',
    label: 'Guascor G-56SL Tri-Fuel Mobile Solution Specification',
    requiredTokens: [
      'Engine model',
      'G-56SL',
      'Technical specifications',
      'Guascor Energy',
    ],
    forbiddenTokens: [
      'G-18FR',
      'G-24FR',
      'G-18FL',
      'G-24FL',
      'G-42HM',
      'G-36FL',
      'G-56HM',
      'G-48FL',
      'G-86EM',
      'G-18SL',
      'G-24SL',
      'G-36SL',
      'G-48SL',
      'G-24HM',
      'G-56SM',
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

function assertStillMissingExclusive() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  for (const record of records) {
    const missingSlugs = new Set(
      (report.groups?.[record.brand] ?? []).map((row) => row.slug),
    )
    if (!missingSlugs.has(record.slug)) {
      throw new Error(`${record.slug} is no longer missing exclusive datasheet coverage`)
    }
  }
}

async function downloadPdf(record, localPath) {
  if (record.downloadMode === 'curl') {
    execFileSync('curl', [
      '-L',
      '--fail',
      '--max-time',
      '180',
      '-A',
      UA,
      '-e',
      record.sourcePage,
      '-o',
      localPath,
      record.sourceUrl,
    ], { stdio: 'pipe' })
    const buffer = await fsp.readFile(localPath)
    if (buffer.subarray(0, 4).toString() !== '%PDF') {
      throw new Error(`${record.sourceUrl}: response is not a PDF`)
    }
    return buffer
  }

  let lastError = null
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(record.sourceUrl, {
        headers: {
          'User-Agent': UA,
          Referer: record.sourcePage,
          Accept: 'application/pdf,*/*',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(240000),
      })
      if (!response.ok) throw new Error(`${record.sourceUrl}: HTTP ${response.status}`)

      const buffer = Buffer.from(await response.arrayBuffer())
      await fsp.writeFile(localPath, buffer)
      if (buffer.subarray(0, 4).toString() !== '%PDF') {
        throw new Error(`${record.sourceUrl}: response is not a PDF`)
      }
      return buffer
    } catch (error) {
      lastError = error
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }
  throw lastError
}

function verifyPdf(record, localPath) {
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

  const forbiddenHits = record.forbiddenTokens.filter(
    (token) => normalizedText.includes(normalize(token)),
  )
  if (forbiddenHits.length) {
    throw new Error(
      `${record.storagePath}: contains sibling token(s): ${forbiddenHits.join(', ')}`,
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
let verified = 0
let linked = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} official MWM/Guascor spec PDFs`)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== record.brand || normalize(engine.model) !== normalize(record.model)) {
    throw new Error(
      `Engine mismatch for ${record.slug}: ${engine.brand} ${engine.model}`,
    )
  }

  process.stdout.write(`${engine.brand} ${engine.model} ... `)
  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  const buffer = await downloadPdf(record, localPath)
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
