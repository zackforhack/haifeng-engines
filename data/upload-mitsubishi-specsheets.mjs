// Discover and attach model-specific PDFs from MHI's live constant-speed
// engine catalog. Run without --apply to preview; use --apply to write.

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import path from 'path'
import os from 'os'

const CATALOG_BASE = 'https://engine-genset.mhi.com/industrial-engines-constant-speed'
const apply = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY,
)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const TMP = path.join(os.tmpdir(), 'mitsubishi-mhi-specs')

// These regional database records are the same models as the corresponding
// public MHI catalog pages. China-specific "-C" variants are intentionally
// excluded because their emissions and specifications differ.
const slugAliases = new Map([
  ['s12a2-y2ptaw', 'mitsubishi-s12a2-y2ptaw-2'],
  ['s12h-y2ptaw', 'mitsubishi-s12h-y2ptaw-1'],
  ['s12r-y2ptaw', 'mitsubishi-s12r-y2ptaw-1'],
  ['s16r-y2ptaw', 'mitsubishi-s16r-y2ptaw-1'],
])

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

async function getHtml(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
    signal: AbortSignal.timeout(30000),
  })
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  return response.text()
}

function catalogPaths(html) {
  const paths = [...html.matchAll(/href="\/industrial-engines-constant-speed\/([^"#?]+)"/g)]
    .map((match) => match[1])
  return [...new Set(paths)].sort()
}

function extractDatasheet(html, productPath) {
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+\.pdf[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)]
  const match = links.find(([, , body]) =>
    /specification sheet/i.test(body.replace(/<[^>]+>/g, ' '))
  )

  const modelMatch = html.match(
    /<h1[^>]*>Mitsubishi Engine - Industrial - Constant Speed ([^<]+)<\/h1>/i,
  )
  const model = modelMatch
    ? decodeHtml(modelMatch[1]).trim()
    : productPath.toUpperCase()

  return { model, url: match ? decodeHtml(match[1]) : null }
}

async function getPdf(url) {
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
  return buffer
}

async function mapWithConcurrency(items, concurrency, callback) {
  const results = new Array(items.length)
  let next = 0

  async function worker() {
    while (next < items.length) {
      const index = next++
      results[index] = await callback(items[index])
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY is required')
}

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, model, slug, fuel_type')
  .eq('brand', 'Mitsubishi')
if (enginesError) throw enginesError
const enginesBySlug = new Map(engines.map((engine) => [engine.slug, engine]))

const catalogHtml = await getHtml(CATALOG_BASE)
const paths = catalogPaths(catalogHtml)
if (paths.length < 50) {
  throw new Error(`Only found ${paths.length} MHI catalog products; expected at least 50`)
}

const products = await mapWithConcurrency(paths, 6, async (productPath) => {
  const html = await getHtml(`${CATALOG_BASE}/${productPath}`)
  const datasheet = extractDatasheet(html, productPath)
  const expectedSlug = slugAliases.get(productPath)
    ?? `mitsubishi-${productPath.replace('switshable', 'switchable')}`
  return { productPath, expectedSlug, ...datasheet }
})

const unmatched = products.filter((product) => !enginesBySlug.has(product.expectedSlug))
const available = products.filter((product) => product.url)
const unavailable = products.filter((product) => !product.url)
console.log(`Official MHI catalog: ${products.length} models`)
console.log(`Matched database records: ${products.length - unmatched.length}`)
console.log(`Product pages with specification sheets: ${available.length}`)
if (unmatched.length) {
  console.log(`Unmatched: ${unmatched.map((product) => product.model).join(', ')}`)
}
if (unavailable.length) {
  console.log(`No sheet linked by MHI: ${unavailable.map((product) => product.model).join(', ')}`)
}

if (!apply) {
  console.log('\nDry run only. Re-run with --apply to upload and link official datasheets.')
  process.exit(unmatched.length ? 1 : 0)
}

fs.mkdirSync(TMP, { recursive: true })
let linked = 0
const failures = []

for (const product of available) {
  const engine = enginesBySlug.get(product.expectedSlug)
  if (!engine) continue

  process.stdout.write(`${engine.model} ... `)
  try {
    const buffer = await getPdf(product.url)
    const normalizedPath = product.productPath.replace('switshable', 'switchable')
    const storagePath = `mitsubishi/spec-sheets/${normalizedPath}.pdf`
    const localPath = path.join(TMP, `${product.productPath}.pdf`)
    fs.writeFileSync(localPath, buffer)
    const { ok } = await uploadPdf(supabase, BUCKET, localPath, storagePath)
    if (!ok) throw new Error('storage upload failed')

    const { error: deleteError } = await supabase
      .from('engine_pdfs')
      .delete()
      .eq('engine_id', engine.id)
      .eq('type', 'datasheet')
    if (deleteError) throw deleteError

    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'datasheet',
      label: `Mitsubishi ${product.model} Diesel Engine Datasheet`,
      storage_path: storagePath,
      file_size_bytes: buffer.length,
    })
    if (insertError) throw insertError

    console.log(`${Math.round(buffer.length / 1024)}KB linked`)
    linked++
  } catch (error) {
    console.log(`failed: ${error.message}`)
    failures.push(`${engine.model}: ${error.message}`)
  }
}

console.log(`\nLinked ${linked}/${available.length} official MHI datasheets.`)
if (unmatched.length) console.log(`Skipped ${unmatched.length} unmatched database records.`)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
}
