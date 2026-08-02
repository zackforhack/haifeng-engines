import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'kubota-exclusive-product-pdfs')
const INDEX_PATH = '/tmp/kubota_index.json'
const PAGE_SIZE = 1000
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

async function fetchAll(supabase, table, select) {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) return rows
  }
}

function normalizeModel(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function storageName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function candidateKeys(model) {
  const upper = model.toUpperCase().trim()
  const keys = new Set([upper])
  keys.add(upper.replace(/-CHN-\d+$/i, ''))
  keys.add(upper.replace(/-EU-[A-Z]\d+$/i, ''))
  keys.add(upper.replace(/-SAE-\d+X?$/i, ''))
  keys.add(upper.replace(/-CWL-\d+$/i, ''))
  keys.add(upper.replace(/-(EF|EW|ET)$/i, ''))
  return [...keys].map(normalizeModel)
}

function containsModelToken(pdfPath, model) {
  try {
    const text = execFileSync('pdftotext', [pdfPath, '-'], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    })
    return normalizeModel(text).includes(normalizeModel(model))
  } catch {
    return false
  }
}

async function downloadPdf(productId) {
  const url = `https://engine.kubota.com/en/products/product_pdf/${productId}_pdf_1.pdf`
  const response = await fetch(url, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${url}: response is not a PDF`)
  }
  return { url, buffer }
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

if (!fs.existsSync(INDEX_PATH)) {
  throw new Error(`Missing ${INDEX_PATH}; run data/kubota-crawl.mjs first`)
}

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'))
const catalogByKey = new Map(
  index.map((entry) => [normalizeModel(entry.model), entry]),
)

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const [engines, documents] = await Promise.all([
  fetchAll(supabase, 'engines', 'id, brand, model, slug'),
  fetchAll(supabase, 'engine_pdfs', 'engine_id, type, label, storage_path'),
])

const datasheets = documents.filter((document) => document.type === 'datasheet')
const pathCounts = new Map()
for (const document of datasheets) {
  pathCounts.set(document.storage_path, (pathCounts.get(document.storage_path) ?? 0) + 1)
}

const datasheetsByEngine = new Map()
for (const document of datasheets) {
  const rows = datasheetsByEngine.get(document.engine_id) ?? []
  rows.push(document)
  datasheetsByEngine.set(document.engine_id, rows)
}

function hasExclusiveDatasheet(engine) {
  return (datasheetsByEngine.get(engine.id) ?? []).some(
    (document) => pathCounts.get(document.storage_path) === 1,
  )
}

const missingKubota = engines
  .filter((engine) => engine.brand === 'Kubota')
  .filter((engine) => !hasExclusiveDatasheet(engine))

const proposed = []
for (const engine of missingKubota) {
  const match = candidateKeys(engine.model)
    .map((key) => catalogByKey.get(key))
    .find(Boolean)
  if (!match) continue
  proposed.push({ engine, product: match })
}

const byProductId = new Map()
for (const item of proposed) {
  const rows = byProductId.get(item.product.id) ?? []
  rows.push(item)
  byProductId.set(item.product.id, rows)
}

const exclusiveTargets = [...byProductId.values()]
  .filter((rows) => rows.length === 1)
  .map((rows) => rows[0])

console.log(
  `${APPLY ? 'APPLY' : 'DRY RUN'}: ${missingKubota.length} Kubota engines missing exclusive datasheets.`,
)
console.log(
  `${proposed.length} official product matches; ${exclusiveTargets.length} map to exactly one engine record.\n`,
)

let linked = 0
let failed = 0

for (const target of exclusiveTargets) {
  const storagePath =
    `kubota/official-product-pdfs/${storageName(target.product.model)}-${target.product.id}.pdf`
  process.stdout.write(
    `${target.engine.model} -> ${target.product.model} id=${target.product.id} ... `,
  )

  try {
    const { buffer } = await downloadPdf(target.product.id)
    const localPath = path.join(TMP_DIR, `${target.product.id}.pdf`)
    fs.writeFileSync(localPath, buffer)

    if (!containsModelToken(localPath, target.product.model)) {
      throw new Error('PDF text does not contain catalog model token')
    }

    if (!APPLY) {
      console.log(`${Math.round(buffer.length / 1024)}KB verified`)
      linked += 1
      continue
    }

    const upload = await uploadPdf(supabase, BUCKET, localPath, storagePath)
    if (!upload.ok) throw new Error('storage upload failed')

    const { error: deleteError } = await supabase
      .from('engine_pdfs')
      .delete()
      .eq('engine_id', target.engine.id)
      .eq('storage_path', storagePath)
    if (deleteError) throw deleteError

    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: target.engine.id,
      type: 'datasheet',
      label: `Kubota ${target.product.model} Official Product PDF`,
      storage_path: storagePath,
      file_size_bytes: upload.uploadedSizeBytes ?? buffer.length,
    })
    if (insertError) throw insertError

    console.log(`${Math.round(buffer.length / 1024)}KB linked`)
    linked += 1
  } catch (error) {
    console.log(`failed: ${error.message}`)
    failed += 1
  }
}

const shared = [...byProductId.values()].filter((rows) => rows.length > 1)
if (shared.length) {
  console.log('\nShared official product PDFs not linked for exclusive coverage:')
  for (const rows of shared) {
    console.log(
      `- ${rows[0].product.model} id=${rows[0].product.id}: `
        + rows.map((row) => row.engine.model).join(', '),
    )
  }
}

console.log(
  `\n${APPLY ? 'Applied' : 'Dry run complete'}: ${linked} verified exclusive target(s), ${failed} failed.`,
)
