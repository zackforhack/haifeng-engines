import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const BASE = 'https://www.hd-hyundaiengine.com'
const SEED_DETAIL_ID = '26'
const TMP_DIR = path.join(os.tmpdir(), 'hyundai-official-generator-spec-sheets-2026-08')
const MISSING_REPORT = path.join(
  process.cwd(),
  'reports',
  'datasheet-coverage',
  'missing-exclusive-2026-08-02.json',
)
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

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

function shellFetch(url, outputPath) {
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '3',
    '--connect-timeout',
    '30',
    '--max-time',
    '300',
    '--user-agent',
    UA,
    '--output',
    outputPath,
    url,
  ], {
    maxBuffer: 20 * 1024 * 1024,
  })
}

function readOfficialPage(detailId) {
  const pagePath = path.join(TMP_DIR, `hyundai-detail-${detailId}.html`)
  const sourcePage = `${BASE}/en/engine/generator-detail/${detailId}`
  shellFetch(sourcePage, pagePath)
  return {
    sourcePage,
    html: fs.readFileSync(pagePath, 'utf8'),
  }
}

function extractModelToken(name) {
  const parenMatch = name.match(/\(([^)]+)\)/)
  return (parenMatch?.[1] ?? name).trim()
}

function extractDetailIdMap(seedHtml) {
  const detailIds = new Map()
  const comparePattern =
    /<a class="product-compare" href="javascript:void\(0\);" data-id="(\d+)">([^<]+)/g
  let match
  while ((match = comparePattern.exec(seedHtml))) {
    const modelToken = extractModelToken(match[2].trim())
    detailIds.set(normalize(modelToken), {
      detailId: match[1],
      officialName: match[2].trim(),
      modelToken,
    })
  }

  const selfTitle = seedHtml.match(/<p class="name en_plain_b">([^<]+)<\/p>/)
  if (selfTitle) {
    const modelToken = extractModelToken(selfTitle[1].trim())
    detailIds.set(normalize(modelToken), {
      detailId: SEED_DETAIL_ID,
      officialName: selfTitle[1].trim(),
      modelToken,
    })
  }

  return detailIds
}

function extractSpecDownload(html) {
  const linkPattern =
    /<a class="down file-download"[^>]+data-name="([^"]+)"[^>]+href="([^"]+)"[^>]*>/g
  let match
  while ((match = linkPattern.exec(html))) {
    const filename = match[1].replaceAll('&amp;', '&')
    const href = match[2].replaceAll('&amp;', '&')
    if (/spec\s*sheet/i.test(filename) && /\.pdf$/i.test(filename)) {
      return {
        filename,
        sourceUrl: href.startsWith('http') ? href : `${BASE}${href}`,
      }
    }
  }
  return null
}

function downloadAndVerifyPdf(record, localPath) {
  shellFetch(record.sourceUrl, localPath)
  const buffer = fs.readFileSync(localPath)
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${record.sourceUrl}: response is not a PDF`)
  }

  const text = execFileSync('pdftotext', [localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  if (!normalize(text).includes(normalize(record.modelToken))) {
    throw new Error(
      `${record.sourceUrl}: PDF text does not contain exact model token ${record.modelToken}`,
    )
  }
  return buffer
}

function buildTargetRecords(detailIds) {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  const missingHyundai = report.groups?.Hyundai ?? []
  return missingHyundai
    .map((engine) => {
      const detail = detailIds.get(normalize(engine.model))
      if (!detail) {
        return {
          ...engine,
          skippedReason: 'No matching official Hyundai generator detail page',
        }
      }
      return {
        ...engine,
        ...detail,
        storagePath: `hyundai/official-generator-spec-sheets/${engine.slug}.pdf`,
        label: `Hyundai ${engine.model} Official Generator Spec Sheet`,
      }
    })
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const seedPage = readOfficialPage(SEED_DETAIL_ID)
const detailIds = extractDetailIdMap(seedPage.html)
const targetRecords = buildTargetRecords(detailIds)
const records = targetRecords.filter((record) => !record.skippedReason)
const skipped = targetRecords.filter((record) => record.skippedReason)

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .in('slug', records.map((record) => record.slug))
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let discovered = 0
let verified = 0
let linked = 0
const verifiedRecords = []

console.log(
  `${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} Hyundai official generator detail pages`,
)
if (skipped.length) {
  console.log(
    `Skipping ${skipped.length} Hyundai rows with no official detail-page match: `
      + skipped.map((record) => record.model).join(', '),
  )
}
console.log()

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)

  process.stdout.write(`${engine.model} [detail ${record.detailId}] ... `)
  const { sourcePage, html } = readOfficialPage(record.detailId)
  const download = extractSpecDownload(html)
  if (!download) {
    console.log('no official spec-sheet PDF link found')
    continue
  }
  discovered += 1

  const candidate = {
    ...record,
    sourcePage,
    sourceUrl: download.sourceUrl,
    sourceFilename: download.filename,
  }
  const localPath = path.join(TMP_DIR, `${record.slug}.pdf`)
  const buffer = downloadAndVerifyPdf(candidate, localPath)
  verified += 1

  if (APPLY) {
    const upload = await uploadPdf(supabase, BUCKET, localPath, record.storagePath)
    if (!upload.ok) {
      console.log('verified, upload failed')
      continue
    }

    const size = upload.uploadedSizeBytes ?? buffer.length
    const { error: deleteError } = await supabase
      .from('engine_pdfs')
      .delete()
      .eq('engine_id', engine.id)
      .eq('storage_path', record.storagePath)
    if (deleteError) throw deleteError

    const { error: insertError } = await supabase
      .from('engine_pdfs')
      .insert({
        engine_id: engine.id,
        type: 'datasheet',
        label: record.label,
        storage_path: record.storagePath,
        file_size_bytes: size,
      })
    if (insertError) throw insertError
    linked += 1
  }

  verifiedRecords.push(candidate)
  console.log(
    `${APPLY ? 'linked' : 'verified'} ${download.filename} `
      + `(${Math.round(buffer.length / 1024)}KB)`,
  )
}

console.log()
console.log(
  `${APPLY ? 'Applied' : 'Dry run complete'}: `
    + `${discovered} discovered, ${verified} verified, ${linked} linked`,
)
if (verifiedRecords.length) {
  console.log('\nVerified official Hyundai sources:')
  for (const record of verifiedRecords) {
    console.log(
      `- ${record.model} (${record.slug}) -> ${record.sourceFilename} | ${record.sourceUrl}`,
    )
  }
}
