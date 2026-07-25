// Discover and attach exact John Deere generator-drive datasheets.
// Dry-run by default. Use --apply only after reviewing the discovered matches.

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
const base =
  'https://www.deere.com/assets/pdfs/common/industries/'
  + 'engines-and-drivetrain/specsheets'
const tempDir = path.join(os.tmpdir(), 'haifeng-john-deere-datasheets')
fs.mkdirSync(tempDir, { recursive: true })

function normalizeModel(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function candidateUrls(model) {
  return [
    `${base}/${model}_60Hz.pdf`,
    `${base}/${model}_50Hz.pdf`,
    `${base}/${model}_PWL.pdf`,
    `${base}/${model}_PVL.pdf`,
    `${base}/${model}.pdf`,
    `${base}/${model}_aux.pdf`,
  ]
}

async function fetchPdf(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
          + 'AppleWebKit/537.36 Chrome/126 Safari/537.36',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    })
    if (!response.ok) return null
    const buffer = Buffer.from(await response.arrayBuffer())
    return buffer.subarray(0, 4).toString() === '%PDF' ? buffer : null
  } catch {
    return null
  }
}

function pdfContainsModel(filePath, model) {
  try {
    const text = execFileSync('pdftotext', [filePath, '-'], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    })
    return normalizeModel(text).includes(normalizeModel(model))
  } catch {
    return false
  }
}

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .eq('brand', 'John Deere')
  .order('model')
if (enginesError) throw enginesError

const engineIds = engines.map((engine) => engine.id)
const relations = []
for (let index = 0; index < engineIds.length; index += 100) {
  const { data, error } = await supabase
    .from('engine_pdfs')
    .select('engine_id, type')
    .in('engine_id', engineIds.slice(index, index + 100))
  if (error) throw error
  relations.push(...data)
}

const withDatasheet = new Set(
  relations
    .filter((relation) => relation.type === 'datasheet')
    .map((relation) => relation.engine_id),
)
const missing = engines.filter((engine) => !withDatasheet.has(engine.id))
const byModel = new Map()
for (const engine of missing) {
  const group = byModel.get(engine.model) ?? []
  group.push(engine)
  byModel.set(engine.model, group)
}

const matches = []
for (const [model, rows] of byModel) {
  process.stdout.write(`${model} ... `)
  let match = null
  for (const url of candidateUrls(model)) {
    const buffer = await fetchPdf(url)
    if (!buffer) continue
    const filePath = path.join(tempDir, `${normalizeModel(model)}.pdf`)
    fs.writeFileSync(filePath, buffer)
    if (!pdfContainsModel(filePath, model)) continue
    match = { model, rows, url, buffer, filePath }
    break
  }
  if (!match) {
    console.log('no exact official sheet')
    continue
  }
  matches.push(match)
  console.log(`${path.basename(new URL(match.url).pathname)} -> ${rows.length} page(s)`)
}

console.log(
  `\n${matches.length} exact model sheets cover `
  + `${matches.reduce((sum, match) => sum + match.rows.length, 0)} pages.`,
)

if (!apply) {
  console.log('Dry run only. Re-run with --apply to upload and link these sheets.')
  process.exit(0)
}

let linked = 0
for (const match of matches) {
  const storagePath =
    `john-deere/official-spec-sheets/${normalizeModel(match.model).toLowerCase()}.pdf`
  const upload = await uploadPdf(
    supabase,
    bucket,
    match.filePath,
    storagePath,
  )
  if (!upload.ok) {
    throw new Error(`Upload failed for ${match.model}`)
  }

  for (const engine of match.rows) {
    const { error: deleteError } = await supabase
      .from('engine_pdfs')
      .delete()
      .eq('engine_id', engine.id)
      .eq('storage_path', storagePath)
    if (deleteError) throw deleteError

    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'datasheet',
      label: `John Deere ${match.model} Generator Drive Datasheet`,
      storage_path: storagePath,
      file_size_bytes: match.buffer.length,
    })
    if (insertError) throw insertError
    linked += 1
  }
}

console.log(`Linked ${linked} John Deere pages to exact official datasheets.`)
