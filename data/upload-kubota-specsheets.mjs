// Rebuild Kubota datasheet links from Kubota's official product-PDF catalog.
// A match requires the exact engine-family prefix and numeric E-generation.
// Dry-run by default. Use --apply to replace managed Kubota links.

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const apply = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY,
)
const bucket = 'engine-pdfs'
const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const pdfUrl = (id) =>
  `https://engine.kubota.com/en/products/product_pdf/${id}_pdf_1.pdf`
const tmp = path.join(os.tmpdir(), 'kubota-specs')
fs.mkdirSync(tmp, { recursive: true })

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY is required')
}
if (!fs.existsSync('/tmp/kubota_index.json')) {
  throw new Error('Missing /tmp/kubota_index.json; run data/kubota-crawl.mjs first')
}

const index = JSON.parse(fs.readFileSync('/tmp/kubota_index.json', 'utf8'))

function tierOf(model) {
  const match = model.toUpperCase().match(/-?E(\d)/)
  return match ? match[1] : null
}

function familyOf(model) {
  const upper = model.toUpperCase().trim()
  const match = upper.match(/^(.*?)-?E\d/)
  return match?.[1]?.replace(/-$/, '') || null
}

const catalogByKey = new Map()
for (const entry of index) {
  const family = familyOf(entry.model)
  const tier = tierOf(entry.model)
  if (!family || !tier) continue
  const key = `${family}|${tier}`
  const candidates = catalogByKey.get(key) ?? []
  candidates.push(entry)
  catalogByKey.set(key, candidates)
}

function candidates(model) {
  const family = familyOf(model)
  const tier = tierOf(model)
  return family && tier ? (catalogByKey.get(`${family}|${tier}`) ?? []) : []
}

async function getPdf(id) {
  try {
    const response = await fetch(pdfUrl(id), {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(30000),
    })
    if (!response.ok) return null
    const buffer = Buffer.from(await response.arrayBuffer())
    return buffer.subarray(0, 4).toString() === '%PDF' ? buffer : null
  } catch {
    return null
  }
}

const { data: engines, error: engineError } = await supabase
  .from('engines')
  .select('id, model, slug')
  .eq('brand', 'Kubota')
if (engineError) throw engineError

const { data: existing, error: pdfError } = await supabase
  .from('engine_pdfs')
  .select('id, engine_id, storage_path')
  .in('engine_id', engines.map((engine) => engine.id))
if (pdfError) throw pdfError

const managed = existing.filter((pdf) =>
  pdf.storage_path?.startsWith('kubota/spec-sheets/')
)
console.log(
  `${engines.length} Kubota engines; ${managed.length} managed links will be audited.\n`,
)

const cache = new Map()
const matches = []
let unmatched = 0

for (const engine of engines) {
  process.stdout.write(`${engine.model} ... `)
  let selected = null
  let buffer = null

  for (const candidate of candidates(engine.model)) {
    if (!cache.has(candidate.id)) cache.set(candidate.id, await getPdf(candidate.id))
    const candidatePdf = cache.get(candidate.id)
    if (candidatePdf) {
      selected = candidate
      buffer = candidatePdf
      break
    }
  }

  if (!selected || !buffer) {
    console.log('intentionally unmatched')
    unmatched++
    continue
  }

  const storagePath =
    `kubota/spec-sheets/${familyOf(engine.model).toLowerCase()}`
    + `-e${tierOf(engine.model)}-${selected.id}.pdf`
  matches.push({ engine, selected, buffer, storagePath })
  console.log(
    `${selected.model} id=${selected.id} (${Math.round(buffer.length / 1024)}KB) exact`,
  )
}

if (!apply) {
  console.log(`\n[dry run] ${matches.length} exact matches · ${unmatched} unmatched`)
  console.log(`${managed.length} managed links would be replaced by ${matches.length}.`)
  console.log('Re-run with --apply to rebuild the verified Kubota link set.')
  process.exit(0)
}

if (managed.length) {
  const { error: deleteError } = await supabase
    .from('engine_pdfs')
    .delete()
    .in('id', managed.map((pdf) => pdf.id))
  if (deleteError) throw deleteError
}

let linked = 0
let failed = 0
for (const { engine, selected, buffer, storagePath } of matches) {
  const localPath = path.join(tmp, `${selected.id}.pdf`)
  fs.writeFileSync(localPath, buffer)
  const upload = await uploadPdf(supabase, bucket, localPath, storagePath)
  if (!upload.ok) {
    console.log(`${engine.model}: upload failed`)
    failed++
    continue
  }

  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: engine.id,
    type: 'datasheet',
    label: `Kubota ${selected.model} Official Specification Sheet`,
    storage_path: storagePath,
    file_size_bytes: buffer.length,
  })
  if (error) {
    console.log(`${engine.model}: link failed`)
    failed++
    continue
  }
  console.log(`${engine.model} -> ${selected.model} linked`)
  linked++
}

console.log(
  `\nRebuilt ${linked} verified Kubota links; ${unmatched} intentionally unmatched; `
  + `${failed} failed.`,
)
