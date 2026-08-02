import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const INDEX_URL = 'https://www.baifapower.com/Enginespecsheet/'
const TMP_DIR = path.join(os.tmpdir(), 'baifa-engine-spec-sheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const brandMap = {
  BAUDOUIN: 'Baudouin',
  CUMMINS: 'Cummins',
  KUBOTA: 'Kubota',
  MTU: 'MTU',
  PERKINS: 'Perkins',
  SCANIA: 'Scania',
  VOLVO: 'Volvo Penta',
}

const markerMap = {
  Baudouin: ['Baudouin', 'PowerKit'],
  Cummins: ['Cummins'],
  Kubota: ['Kubota'],
  MTU: ['MTU'],
  Perkins: ['Perkins'],
  Scania: ['Scania'],
  'Volvo Penta': ['Volvo', 'Penta'],
}

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

function cleanCell(value) {
  return String(value)
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function storageSegment(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildMissingRowsByKey() {
  const missing = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  const acceptedBrands = new Set(Object.values(brandMap))
  const rowsByKey = new Map()

  for (const [brand, rows] of Object.entries(missing.groups ?? {})) {
    if (!acceptedBrands.has(brand)) continue
    for (const row of rows) {
      const key = `${brand}\t${normalize(row.model)}`
      if (!rowsByKey.has(key)) rowsByKey.set(key, [])
      rowsByKey.get(key).push(row)
    }
  }

  return rowsByKey
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

function parseBaifaIndex(html, rowsByKey) {
  const candidates = []
  const seen = new Set()
  let currentBrand = ''

  for (const rowMatch of html.matchAll(/<tr[\s\S]*?<\/tr>/gi)) {
    const rowHtml = rowMatch[0]
    const href = rowHtml.match(/href="([^"]+\.pdf)"/i)?.[1]
    if (!href) continue

    const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) =>
      cleanCell(cell[1]))
    if (cells.length < 3) continue
    if (cells[1]) currentBrand = cells[1].toUpperCase()

    const brand = brandMap[currentBrand]
    if (!brand) continue

    const model = cells[2]
    const matchedRows = rowsByKey.get(`${brand}\t${normalize(model)}`)
    if (!matchedRows?.length) continue
    if (matchedRows.length !== 1) continue

    const sourceUrl = new URL(
      href.replace('/FADONGJI/', '/fadongji/'),
      INDEX_URL,
    ).href
    const storagePath =
      `${storageSegment(brand)}/baifa-engine-spec-sheets/`
      + `${storageSegment(path.basename(new URL(sourceUrl).pathname, '.pdf'))}.pdf`
    const key = `${brand}\t${normalize(model)}\t${sourceUrl}`
    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      brand,
      model,
      engine: matchedRows[0],
      sourceUrl,
      storagePath,
      label: `${brand} ${matchedRows[0].model} Engine Spec Sheet`,
    })
  }

  return candidates
}

async function downloadPdf(candidate, localPath) {
  const response = await fetch(candidate.sourceUrl, {
    headers: {
      'User-Agent': UA,
      Referer: INDEX_URL,
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${candidate.sourceUrl}: HTTP ${response.status}`)

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${candidate.sourceUrl}: response is not a PDF`)
  }

  await fsp.writeFile(localPath, buffer)
  return buffer
}

function verifyPdf(candidate, localPath) {
  const text = execFileSync('pdftotext', [localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const normalizedText = normalize(text)
  const expectedTokens = [candidate.engine.model, ...(markerMap[candidate.brand] ?? [])]
  const missingTokens = expectedTokens.filter((token) => !normalizedText.includes(normalize(token)))

  if (missingTokens.length) {
    throw new Error(
      `${candidate.storagePath}: missing expected token(s): ${missingTokens.join(', ')}`,
    )
  }
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const rowsByKey = buildMissingRowsByKey()
const html = await fetchText(INDEX_URL)
const candidates = parseBaifaIndex(html, rowsByKey)

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model, brand')
  .in('slug', candidates.map((candidate) => candidate.engine.slug))
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let verified = 0
let linked = 0
let rejected = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Baifa public engine spec sheets`)
console.log(`Candidate exact model rows from index: ${candidates.length}`)

for (const candidate of candidates) {
  const engine = engineBySlug.get(candidate.engine.slug)
  if (!engine) throw new Error(`Missing engine row: ${candidate.engine.slug}`)

  process.stdout.write(`${candidate.brand} ${engine.model} ... `)
  const localPath = path.join(TMP_DIR, path.basename(candidate.storagePath))

  try {
    const buffer = await downloadPdf(candidate, localPath)
    verifyPdf(candidate, localPath)
    verified += 1

    if (APPLY) {
      const upload = await uploadPdf(supabase, BUCKET, localPath, candidate.storagePath)
      if (!upload.ok) throw new Error(`Upload failed: ${candidate.storagePath}`)

      const { error: deleteError } = await supabase
        .from('engine_pdfs')
        .delete()
        .eq('engine_id', engine.id)
        .eq('storage_path', candidate.storagePath)
      if (deleteError) throw deleteError

      const { error: insertError } = await supabase.from('engine_pdfs').insert({
        engine_id: engine.id,
        type: 'datasheet',
        label: candidate.label,
        storage_path: candidate.storagePath,
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
