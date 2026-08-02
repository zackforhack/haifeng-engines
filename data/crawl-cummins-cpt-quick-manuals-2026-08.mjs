import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'cummins-cpt-quick-manuals-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const BASE_URL = 'https://www.cummins-cpt.com'
const INDEX_URL = `${BASE_URL}/h-col-108.html`
const DOWNLOAD_ENDPOINT = `${BASE_URL}/rajax/site_h.jsp?cmd=getWafNotCk_getFilePath`
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
    .replace(/&nbsp;/g, ' ')
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function modelRegex(model) {
  const parts = String(model)
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(escapeRegExp)
  return new RegExp(`(^|[^A-Z0-9])${parts.join('[^A-Z0-9]*')}([^A-Z0-9]|$)`, 'i')
}

function hasModelToken(text, model) {
  return modelRegex(model).test(text)
}

function hasSlashSibling(text, model) {
  const match = String(model).match(/^(.*?)([A-Z]+\d+[A-Z0-9]*)$/i)
  if (!match) return false
  const prefix = match[1]
  const suffix = match[2]
  const prefixParts = prefix
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(escapeRegExp)
  if (!prefixParts.length) return false
  const regex = new RegExp(
    `${prefixParts.join('[^A-Z0-9]*')}[^\\n\\r]{0,40}/\\s*${escapeRegExp(suffix)}([^A-Z0-9]|$)`,
    'i',
  )
  return regex.test(text)
}

function missingRequiredEvidence(text) {
  const missing = []
  if (!text.includes('发动机快速应用手册')) {
    missing.push('发动机快速应用手册')
  }

  const hasPerformanceData =
    text.includes('动力单元性能数据') || text.includes('发电机组用发动机性能数据表')
  if (!hasPerformanceData) {
    missing.push('动力单元性能数据/发电机组用发动机性能数据表')
  }

  const hasCumminsOemMarker =
    text.includes('康明斯动力技术有限公司')
    || text.includes('东风康明斯发动机有限公司')
    || text.includes('东风康明斯发动机')
    || text.includes('www.dcec.com.cn')
  if (!hasCumminsOemMarker) {
    missing.push('Cummins/CPT/DCEC OEM marker')
  }

  return missing
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  return response.text()
}

async function postDownloadInfo(ide, pageUrl) {
  const form = new URLSearchParams()
  form.set('ide', ide)
  form.set('url', new URL(pageUrl).pathname + new URL(pageUrl).search)

  const response = await fetch(DOWNLOAD_ENDPOINT, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      Referer: pageUrl,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: form,
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${DOWNLOAD_ENDPOINT}: HTTP ${response.status}`)

  const payload = await response.json()
  if (!payload.success || !payload.file?.downloadUrl) {
    throw new Error(`No download URL for ${ide}`)
  }

  return {
    sourceUrl: payload.file.downloadUrl.startsWith('//')
      ? `https:${payload.file.downloadUrl}`
      : new URL(payload.file.downloadUrl, BASE_URL).href,
    sourceFileName: payload.file.name,
    sourceSize: payload.file.size,
  }
}

function readMissingCumminsRows() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  return report.groups?.Cummins ?? []
}

function extractProductPageUrls(indexHtml) {
  const urls = new Set()
  const pattern = /href=(["'])(\/h-pd-\d+\.html)\1/g
  for (const match of indexHtml.matchAll(pattern)) {
    urls.add(new URL(match[2], BASE_URL).href)
  }
  return [...urls].sort((a, b) => a.localeCompare(b))
}

function extractDownloadAnchors(pageUrl, html) {
  const anchors = []
  const pattern = /<a\b[^>]*\s_i=(["'])([^"']+)\1[^>]*\s_n=(["'])([^"']+\.pdf)\3[^>]*>/gi
  for (const match of html.matchAll(pattern)) {
    const fileName = decodeHtml(match[4]).trim()
    if (!/快速手册/i.test(fileName)) continue
    anchors.push({
      pageUrl,
      ide: decodeHtml(match[2]),
      fileName,
      model: fileName
        .replace(/\.pdf$/i, '')
        .replace(/\s*快速手册\s*/i, '')
        .trim(),
    })
  }
  return anchors
}

function buildRecords(anchors, missingRows) {
  const rowsByModel = new Map()
  for (const row of missingRows) {
    const key = normalize(row.model)
    rowsByModel.set(key, [...(rowsByModel.get(key) ?? []), row])
  }

  const records = []
  const seen = new Set()
  for (const anchor of anchors) {
    const rows = rowsByModel.get(normalize(anchor.model)) ?? []
    if (rows.length !== 1) continue
    const row = rows[0]
    if (seen.has(row.slug)) continue
    seen.add(row.slug)
    records.push({
      slug: row.slug,
      model: row.model,
      pageUrl: anchor.pageUrl,
      ide: anchor.ide,
      sourceFileName: anchor.fileName,
      storagePath: `cummins/cpt-quick-manuals/${storageSegment(row.model)}.pdf`,
      label: `Cummins ${row.model} Quick Application Manual`,
    })
  }
  return records.sort((a, b) => a.model.localeCompare(b.model))
}

async function downloadPdf(record, localPath) {
  const downloadInfo = await postDownloadInfo(record.ide, record.pageUrl)
  record.sourceUrl = downloadInfo.sourceUrl
  record.resolvedFileName = downloadInfo.sourceFileName
  record.resolvedSize = downloadInfo.sourceSize

  const response = await fetch(record.sourceUrl, {
    headers: {
      'User-Agent': UA,
      Referer: record.pageUrl,
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(300000),
  })
  if (!response.ok) throw new Error(`${record.sourceUrl}: HTTP ${response.status}`)

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${record.sourceUrl}: response is not a PDF`)
  }
  await fsp.writeFile(localPath, buffer)
  return buffer
}

function verifyPdf(record, localPath, missingRows) {
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  })

  const missingTextTokens = missingRequiredEvidence(text)
  if (missingTextTokens.length) {
    throw new Error(
      `${record.storagePath}: missing expected token(s): ${missingTextTokens.join(', ')}`,
    )
  }

  if (!hasModelToken(text, record.model)) {
    throw new Error(`${record.storagePath}: missing exact model token ${record.model}`)
  }

  const siblingHits = missingRows
    .filter((row) => row.model !== record.model)
    .filter((row) => hasModelToken(text, row.model) || hasSlashSibling(text, row.model))
    .map((row) => row.model)
  if (siblingHits.length) {
    throw new Error(
      `${record.storagePath}: contains sibling Cummins model token(s): `
      + siblingHits.join(', '),
    )
  }
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const missingRows = readMissingCumminsRows()
const indexHtml = await fetchText(INDEX_URL)
const productUrls = extractProductPageUrls(indexHtml)
console.log(`Crawled Cummins CPT index: ${productUrls.length} product page URL(s).`)

const anchors = []
for (const pageUrl of productUrls) {
  const html = await fetchText(pageUrl)
  anchors.push(...extractDownloadAnchors(pageUrl, html))
}

const records = buildRecords(anchors, missingRows)
console.log(
  `${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} current missing-exclusive `
  + `Cummins matches from ${anchors.length} official CPT quick-manual link(s).`,
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
let rejected = 0

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Cummins' || normalize(engine.model) !== normalize(record.model)) {
    throw new Error(`Engine mismatch for ${record.slug}: ${engine.brand} ${engine.model}`)
  }

  process.stdout.write(`${record.model} ... `)
  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))

  try {
    const buffer = await downloadPdf(record, localPath)
    verifyPdf(record, localPath, missingRows)
    verified += 1

    if (APPLY) {
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
      linked += 1
    }

    console.log(`${APPLY ? 'linked' : 'verified'} (${Math.round(buffer.length / 1024)}KB)`)
  } catch (error) {
    rejected += 1
    console.log(`rejected: ${error.message}`)
  }
}

console.log(
  `\n${APPLY ? 'Applied' : 'Dry run complete'}: `
  + `${verified} verified, ${linked} linked, ${rejected} rejected.`,
)
