import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'emean-small-brand-crawl-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const BASE_URL = 'https://www.emeanpower.com'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const SOURCES = [
  {
    brand: 'FAWDE',
    storageBrand: 'fawde',
    pathPrefix: 'FAW-12KW-352KW',
    categoryPages: [
      '/FAW-12KW-352KW/',
      '/FAW-12KW-352KW/page_2.html',
      '/FAW-12KW-352KW/page_3.html',
      '/FAW-12KW-352KW/page_4.html',
      '/FAW-12KW-352KW/page_5.html',
    ],
    titleBrandPattern: /(?:FAW|FAWDE)/i,
    requiredBrandTokens: ['FAW'],
  },
  {
    brand: 'Isuzu',
    storageBrand: 'isuzu',
    pathPrefix: 'ISUZU-16KW-36KW',
    categoryPages: [
      '/ISUZU-16KW-36KW/',
      '/ISUZU-16KW-36KW/page_2.html',
    ],
    titleBrandPattern: /ISUZU/i,
    requiredBrandTokens: ['ISUZU'],
  },
  {
    brand: 'Yangdong',
    storageBrand: 'yangdong',
    pathPrefix: 'YANGDONG-7KW-65KW',
    categoryPages: [
      '/YANGDONG-7KW-65KW/',
      '/YANGDONG-7KW-65KW/page_2.html',
      '/YANGDONG-7KW-65KW/page_3.html',
      '/YANGDONG-7KW-65KW/page_4.html',
    ],
    titleBrandPattern: /YANGDONG/i,
    requiredBrandTokens: ['YANGDONG'],
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

function storageSegment(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function decodeHtml(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function fetchText(url, referer = BASE_URL) {
  return execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '2',
    '--connect-timeout',
    '30',
    '--max-time',
    '120',
    '--user-agent',
    UA,
    '--referer',
    referer,
    url,
  ], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
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

function readMissingRows() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  return report.groups ?? {}
}

function extractProductUrls(source) {
  const productUrls = new Set()
  const pattern = new RegExp(
    `href=(["'])(/${source.pathPrefix}/[^"']+?\\.html)\\1`,
    'g',
  )
  for (const categoryPath of source.categoryPages) {
    const categoryUrl = new URL(categoryPath, BASE_URL).toString()
    const html = fetchText(categoryUrl)
    for (const match of html.matchAll(pattern)) {
      productUrls.add(new URL(decodeHtml(match[2]), BASE_URL).toString())
    }
  }
  return [...productUrls].sort()
}

function modelFromTitle(title, source) {
  let model = title
    .replace(/\.pdf$/i, '')
    .replace(source.titleBrandPattern, '')
    .replace(/\bengine\b/gi, '')
    .replace(/\bdata\s*sheet\b/gi, '')
    .trim()
  model = model.replace(/\s+/g, ' ').trim()
  return model || null
}

function extractEngineDatasheet(source, productUrl, html) {
  const rows = html.match(/<tr\b[\s\S]*?<\/tr>/gi) ?? []
  const row = rows.find((candidate) => /Engine Data Sheet/i.test(candidate))
  if (!row) return null

  const anchorPattern = /<a\b[^>]*href=(["'])([^"']+\.pdf[^"']*)\1[^>]*>/i
  const anchor = row.match(anchorPattern)
  if (!anchor) return null

  const titlePattern = /title=(["'])([^"']+)\1/i
  const title = decodeHtml(row.match(titlePattern)?.[2] ?? '')
  if (!source.titleBrandPattern.test(title) || !/engine/i.test(title)) return null

  const model = modelFromTitle(title, source)
  if (!model) return null

  return {
    brand: source.brand,
    productUrl,
    model,
    sourceUrl: new URL(decodeHtml(anchor[2]), productUrl).toString(),
  }
}

function buildRecords(source, candidates, missingRowsByBrand) {
  const rows = missingRowsByBrand[source.brand] ?? []
  const rowsByModel = new Map()
  for (const row of rows) {
    const key = normalize(row.model)
    rowsByModel.set(key, [...(rowsByModel.get(key) ?? []), row])
  }

  const records = []
  const seenSlugs = new Set()
  for (const candidate of candidates) {
    const matchedRows = rowsByModel.get(normalize(candidate.model)) ?? []
    if (matchedRows.length !== 1) continue
    const row = matchedRows[0]
    if (seenSlugs.has(row.slug)) continue
    seenSlugs.add(row.slug)
    records.push({
      brand: source.brand,
      requiredBrandTokens: source.requiredBrandTokens,
      slug: row.slug,
      model: row.model,
      sourcePage: candidate.productUrl,
      sourceUrl: candidate.sourceUrl,
      storagePath:
        `${source.storageBrand}/emean-engine-datasheets/${storageSegment(row.model)}.pdf`,
    })
  }
  return records.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model))
}

function verifyPdf(record, localPath, missingRows) {
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  })
  const normalizedText = normalize(text)
  const requiredTokens = [record.model, ...record.requiredBrandTokens]
  const missingTokens = requiredTokens.filter(
    (token) => !normalizedText.includes(normalize(token)),
  )
  if (missingTokens.length) {
    throw new Error(
      `${record.storagePath}: missing expected token(s): ${missingTokens.join(', ')}`,
    )
  }

  const dataMarkers = [
    'Engine Model',
    'ENGINE MODEL',
    'Engine Data Sheet',
    'Data Sheet',
    'Technical Data',
    'Performance Data',
  ]
  if (!dataMarkers.some((marker) => normalizedText.includes(normalize(marker)))) {
    throw new Error(`${record.storagePath}: missing engine data markers`)
  }

  const siblingHits = missingRows
    .filter((row) => row.model !== record.model)
    .filter((row) => normalizedText.includes(normalize(row.model)))
    .map((row) => row.model)
  if (siblingHits.length) {
    throw new Error(
      `${record.storagePath}: contains other missing ${record.brand} model token(s): `
      + siblingHits.join(', '),
    )
  }
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const missingRowsByBrand = readMissingRows()
const records = []
const candidateCounts = []

for (const source of SOURCES) {
  const productUrls = extractProductUrls(source)
  const candidates = []
  console.log(`Crawled ${productUrls.length} Emean ${source.brand} product page URL(s).`)
  for (const productUrl of productUrls) {
    const html = fetchText(productUrl, BASE_URL)
    const candidate = extractEngineDatasheet(source, productUrl, html)
    if (candidate) candidates.push(candidate)
  }
  candidateCounts.push(`${source.brand}: ${candidates.length}`)
  records.push(...buildRecords(source, candidates, missingRowsByBrand))
}

console.log(
  `${APPLY ? 'APPLY' : 'DRY RUN'}: `
  + `${records.length} current missing-exclusive exact match(es) from `
  + `${candidateCounts.join(', ')} Emean engine datasheet candidate(s).`,
)

if (!records.length) process.exit(0)

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
let failed = 0

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== record.brand || normalize(engine.model) !== normalize(record.model)) {
    throw new Error(`Engine mismatch for ${record.slug}: ${engine.brand} ${engine.model}`)
  }

  process.stdout.write(`${engine.brand} ${engine.model} ... `)
  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  let buffer
  try {
    buffer = downloadPdf(record, localPath)
    verifyPdf(record, localPath, missingRowsByBrand[record.brand] ?? [])
  } catch (error) {
    failed += 1
    console.log(`skipped (${error.message})`)
    continue
  }
  verified += 1

  if (!APPLY) {
    console.log(`${Math.round(buffer.length / 1024)}KB verified <- ${record.sourcePage}`)
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
    label: `${record.brand} ${record.model} Engine Datasheet`,
    storage_path: record.storagePath,
    file_size_bytes: upload.uploadedSizeBytes ?? buffer.length,
  })
  if (insertError) throw insertError

  console.log(`${Math.round(buffer.length / 1024)}KB linked <- ${record.sourcePage}`)
  linked += 1
}

console.log(
  `\n${APPLY ? 'Applied' : 'Dry run complete'}: `
  + `${verified} verified, ${linked} linked, ${failed} skipped.`,
)
