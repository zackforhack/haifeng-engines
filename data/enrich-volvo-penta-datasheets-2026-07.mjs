// Attach exact Volvo Penta product bulletins mirrored by engine distributors.
// Dry-run by default. Use --apply after reviewing the model checks.

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const apply = process.argv.includes('--apply')
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY
if (!supabaseUrl || !serviceKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(supabaseUrl, serviceKey)
const bucket = 'engine-pdfs'
const tempDir = path.join(os.tmpdir(), 'haifeng-volvo-penta-datasheets')
fs.mkdirSync(tempDir, { recursive: true })

const documents = [
  {
    url: 'https://www.raad-eng.com/techdata/volvo/prodbull/twd1643ge.pdf',
    storagePath: 'volvo-penta/spec-sheets/twd1643ge-product-bulletin.pdf',
    label: 'Volvo Penta TWD1643GE Product Bulletin',
    slugs: ['volvo-penta-twd1643ge'],
    models: ['TWD1643GE'],
  },
  {
    url:
      'https://sra-moteur.com/uploads/catalogue/produits/documentations/'
      + 'twd1663ge-twd1663ge.pdf',
    storagePath: 'volvo-penta/spec-sheets/twd1663ge-product-bulletin.pdf',
    label: 'Volvo Penta TWD1663GE Product Bulletin',
    slugs: ['volvo-penta-twd1663ge'],
    models: ['TWD1663GE'],
  },
  {
    url:
      'https://www.volvopenta-mexico.com.mx/generacion/TWD1672GE.pdf',
    storagePath: 'volvo-penta/spec-sheets/twd1672ge-twd1673ge.pdf',
    label: 'Volvo Penta TWD1672GE/TWD1673GE Technical Data',
    slugs: ['volvo-penta-twd1672ge', 'volvo-penta-twd1673ge'],
    models: ['TWD1672GE', 'TWD1673GE'],
  },
]

function normalize(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

async function downloadPdf(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        + 'AppleWebKit/537.36 Chrome/126 Safari/537.36',
    },
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

const targetSlugs = documents.flatMap((document) => document.slugs)
const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .in('slug', targetSlugs)
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
const missingSlugs = targetSlugs.filter((slug) => !engineBySlug.has(slug))
if (missingSlugs.length) {
  throw new Error(`Engine pages not found: ${missingSlugs.join(', ')}`)
}

for (const document of documents) {
  const buffer = await downloadPdf(document.url)
  const filePath = path.join(tempDir, path.basename(document.storagePath))
  fs.writeFileSync(filePath, buffer)
  const text = execFileSync('pdftotext', [filePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const normalizedText = normalize(text)
  const absent = document.models.filter(
    (model) => !normalizedText.includes(normalize(model)),
  )
  if (absent.length) {
    throw new Error(
      `${document.storagePath} does not name: ${absent.join(', ')}`,
    )
  }
  document.buffer = buffer
  document.filePath = filePath
  console.log(
    `${document.label}: ${Math.round(buffer.length / 1024)} KB, `
    + `${document.slugs.length} exact page(s)`,
  )
}

if (!apply) {
  console.log(
    `Dry run: ${documents.length} verified PDFs cover ${targetSlugs.length} pages.`,
  )
  process.exit(0)
}

let linked = 0
for (const document of documents) {
  const upload = await uploadPdf(
    supabase,
    bucket,
    document.filePath,
    document.storagePath,
  )
  if (!upload.ok) throw new Error(`Upload failed: ${document.storagePath}`)

  for (const slug of document.slugs) {
    const engine = engineBySlug.get(slug)
    const { error: deleteError } = await supabase
      .from('engine_pdfs')
      .delete()
      .eq('engine_id', engine.id)
      .eq('storage_path', document.storagePath)
    if (deleteError) throw deleteError

    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: document.buffer.length,
    })
    if (insertError) throw insertError
    linked += 1
  }
}

console.log(`Linked ${linked} Volvo Penta pages to exact datasheets.`)
