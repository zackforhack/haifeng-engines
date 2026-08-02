import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'volvo-penta-mexico-industrial-pdfs-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const SOURCE_PAGE = 'https://www.volvopenta-mexico.com.mx/motores-industriales/'
const BASE_URL = 'https://www.volvopenta-mexico.com.mx'
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

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  return response.text()
}

function readMissingVolvoRows() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  return report.groups?.['Volvo Penta'] ?? []
}

function extractAnchors(html) {
  const anchors = []
  const pattern =
    /<td class="column-1"><center>([^<]+)<\/center><\/td><td class="column-2"><center><a\b[^>]*href=(["'])([^"']+\.pdf[f]?)\2[^>]*>\s*Descargar PDF\s*<\/a>/gi
  for (const match of html.matchAll(pattern)) {
    anchors.push({
      model: decodeHtml(match[1]).trim(),
      sourceUrl: new URL(decodeHtml(match[3]), BASE_URL).href,
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
      sourceUrl: anchor.sourceUrl,
      storagePath: `volvo-penta/mexico-industrial-pdfs/${storageSegment(row.model)}.pdf`,
      label: `Volvo Penta ${row.model} Technical Data Sheet`,
    })
  }
  return records.sort((a, b) => a.model.localeCompare(b.model))
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
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${record.sourceUrl}: response is not a PDF`)
  }
  await fsp.writeFile(localPath, buffer)
  return buffer
}

function verifyPdf(record, localPath, missingRows) {
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
  })

  const required = [record.model, 'Volvo Penta', 'AB Volvo Penta']
  const missing = required.filter((token) => !hasModelToken(text, token))
  if (missing.length) {
    throw new Error(`${record.storagePath}: missing expected token(s): ${missing.join(', ')}`)
  }

  const siblingHits = missingRows
    .filter((row) => row.model !== record.model)
    .filter((row) => hasModelToken(text, row.model))
    .map((row) => row.model)
  if (siblingHits.length) {
    throw new Error(
      `${record.storagePath}: contains sibling Volvo Penta model token(s): `
      + siblingHits.join(', '),
    )
  }
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const missingRows = readMissingVolvoRows()
const html = await fetchText(SOURCE_PAGE)
const anchors = extractAnchors(html)
const records = buildRecords(anchors, missingRows)
console.log(
  `${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} current missing-exclusive `
  + `Volvo Penta matches from ${anchors.length} official Mexico PDF link(s).`,
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
  if (engine.brand !== 'Volvo Penta' || normalize(engine.model) !== normalize(record.model)) {
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
