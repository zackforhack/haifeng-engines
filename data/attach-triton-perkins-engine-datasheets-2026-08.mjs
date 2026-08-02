import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'triton-perkins-engine-datasheets-2026-08')
const STORAGE_PREFIX = 'perkins/triton-oem-engine-datasheets'
const PRODUCT_SITEMAP = 'https://tritonpower.com/product-sitemap.xml'
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

function decodeHtml(value) {
  return String(value)
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  return await response.text()
}

async function fetchPdf(url, outputPath) {
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '2',
    '--connect-timeout',
    '15',
    '--max-time',
    '60',
    '--user-agent',
    UA,
    '--header',
    'Accept: application/pdf,*/*',
    '--output',
    outputPath,
    url,
  ], {
    maxBuffer: 20 * 1024 * 1024,
  })

  const buffer = await fsp.readFile(outputPath)
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${url}: response is not a PDF`)
  }
  return buffer
}

function extractProductUrls(sitemapXml) {
  return [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => decodeHtml(match[1]))
    .filter((url) => {
      const normalizedUrl = normalize(url)
      return [...targetByModel.keys()].some((modelKey) => normalizedUrl.includes(modelKey))
    })
}

function extractEngineDataSheetLinks(productUrl, html) {
  const links = []
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi
  let match
  while ((match = anchorPattern.exec(html))) {
    const attrs = match[1]
    const text = decodeHtml(match[2].replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
    if (!/engine\s+data\s+sheet/i.test(text)) continue

    const href = attrs.match(/\bhref=(["'])(.*?)\1/i)?.[2]
    if (!href || !/\.pdf(?:$|[?#])/i.test(href)) continue
    const sourceUrl = new URL(decodeHtml(href), productUrl).toString()
    links.push(sourceUrl)
  }
  return links
}

function modelFromProductUrl(url) {
  const pathname = new URL(url).pathname
  const candidates = pathname
    .split('/')
    .filter(Boolean)
    .flatMap((part) => part.split(/-/))
    .filter((part) => /[a-z]*\d+[a-z0-9]*/i.test(part))
  return candidates.join('-')
}

function pdfText(localPath) {
  return execFileSync('pdftotext', [localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    timeout: 20000,
  })
}

function isPerkinsEngineSheet(text, model) {
  const normalizedText = normalize(text)
  return (
    normalizedText.includes(normalize(model))
    && normalizedText.includes('PERKINS')
    && (
      normalizedText.includes('WWWPERKINSCOM')
      || normalizedText.includes('PERKINSENGINESCOMPANYLIMITED')
    )
    && (
      normalizedText.includes('ELECTROPAK')
      || normalizedText.includes('DIESELENGINE')
      || normalizedText.includes('ELECTRICUNIT')
    )
  )
}

const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
const missingPerkins = report.groups?.Perkins ?? []
const targetByModel = new Map(
  missingPerkins.map((row) => [normalize(row.model), row]),
)

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .eq('brand', 'Perkins')
if (enginesError) throw enginesError
const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: crawl Triton Perkins Engine Data Sheet links`)

const sitemap = await fetchText(PRODUCT_SITEMAP)
const productUrls = extractProductUrls(sitemap)
console.log(`Product pages with missing Perkins model token in URL: ${productUrls.length}`)

const seenPdfUrls = new Set()
const verifiedRecords = []
let pagesChecked = 0
let linksFound = 0
let rejected = 0

for (const productUrl of productUrls) {
  console.log(`page: ${productUrl}`)
  let html
  try {
    html = await fetchText(productUrl)
  } catch (error) {
    console.log(`page failed: ${productUrl} (${error.message})`)
    continue
  }
  pagesChecked += 1

  const links = extractEngineDataSheetLinks(productUrl, html)
  linksFound += links.length
  for (const sourceUrl of links) {
    if (seenPdfUrls.has(sourceUrl)) continue

    const guessedModel = modelFromProductUrl(productUrl)
    const candidates = [...targetByModel.values()]
      .filter((row) => normalize(guessedModel).includes(normalize(row.model)))
    if (!candidates.length) {
      rejected += 1
      continue
    }
    const normalizedSourceUrl = normalize(sourceUrl)
    if (!candidates.some((row) => normalizedSourceUrl.includes(normalize(row.model)))) {
      rejected += 1
      continue
    }

    seenPdfUrls.add(sourceUrl)
    console.log(`  pdf: ${sourceUrl}`)

    const filename = path.basename(new URL(sourceUrl).pathname).replace(/[^A-Za-z0-9._-]/g, '-')
    const localPath = path.join(TMP_DIR, filename)
    let buffer
    let text
    try {
      buffer = await fetchPdf(sourceUrl, localPath)
      text = pdfText(localPath)
    } catch (error) {
      console.log(`pdf failed: ${sourceUrl} (${error.message})`)
      rejected += 1
      continue
    }

    const exactMatches = candidates.filter((row) => isPerkinsEngineSheet(text, row.model))
    if (exactMatches.length !== 1) {
      rejected += 1
      continue
    }

    const row = exactMatches[0]
    const engine = engineBySlug.get(row.slug)
    if (!engine) throw new Error(`Missing engine row: ${row.slug}`)

    verifiedRecords.push({
      model: row.model,
      slug: row.slug,
      sourceUrl,
      sourcePage: productUrl,
      localPath,
      buffer,
      storagePath: `${STORAGE_PREFIX}/${row.slug}.pdf`,
      label: `Perkins ${row.model} Engine Data Sheet`,
    })
  }
}

let linked = 0
for (const record of verifiedRecords) {
  if (APPLY) {
    const engine = engineBySlug.get(record.slug)
    const upload = await uploadPdf(supabase, BUCKET, record.localPath, record.storagePath)
    if (!upload.ok) {
      console.log(`upload failed: ${record.model}`)
      continue
    }

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
        file_size_bytes: record.buffer.length,
      })
    if (insertError) throw insertError
    linked += 1
  }

  console.log(
    `${APPLY ? 'linked' : 'verified'}: ${record.model} `
      + `(${record.slug}) <- ${record.sourceUrl}`,
  )
}

console.log()
console.log(`Pages checked: ${pagesChecked}`)
console.log(`Engine Data Sheet links found: ${linksFound}`)
console.log(`Unique PDF URLs checked/matched: ${seenPdfUrls.size}`)
console.log(`Rejected/non-gap/non-exact links: ${rejected}`)
console.log(`${APPLY ? 'Applied' : 'Dry run complete'}: ${verifiedRecords.length} verified, ${linked} linked`)
