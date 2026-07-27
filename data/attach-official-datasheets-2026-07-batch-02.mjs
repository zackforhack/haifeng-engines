import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

for (const envFile of ['.env.local', '.env']) {
  try {
    for (const rawLine of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
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
  } catch {
    // Local environment files are optional in CI.
  }
}

const APPLY = process.argv.includes('--apply')
const INCLUDE_GENERAC = process.argv.includes('--include-generac')
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://ntrysdovwnbegxtjsqkz.supabase.co'
const supabaseKey = APPLY
  ? process.env.SUPABASE_SERVICE_KEY
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  throw new Error(
    APPLY
      ? 'SUPABASE_SERVICE_KEY is required with --apply'
      : 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required for a dry run',
  )
}

const supabase = createClient(supabaseUrl, supabaseKey)
const bucket = 'engine-pdfs'
const tempDir = path.join(os.tmpdir(), 'haifeng-official-datasheets-batch-02')
fs.mkdirSync(tempDir, { recursive: true })

const documentCandidates = [
  {
    brand: 'Generac',
    models: ['SG450'],
    source:
      'https://www.generac.com/globalassets/products/business/stationary-generators/'
      + 'gaseous-industrial-generators/spec-sheets/'
      + 'sg450-450kw-industrial-gaseous-generator-specsheet.pdf',
    storagePath: 'generac/spec-sheets/sg450-450kw.pdf',
    label: 'Generac SG450 450 kW Industrial Gaseous Generator Spec Sheet',
  },
  {
    brand: 'Generac',
    models: ['SG500'],
    source:
      'https://www.generac.com/globalassets/products/business/stationary-generators/'
      + 'gaseous-industrial-generators/spec-sheets/'
      + 'sg500-500kw-industrial-gaseous-generator-specsheet.pdf',
    storagePath: 'generac/spec-sheets/sg500-500kw.pdf',
    label: 'Generac SG500 500 kW Industrial Gaseous Generator Spec Sheet',
  },
  {
    brand: 'Generac',
    models: ['SG750'],
    source:
      'https://www.generac.com/globalassets/products/business/stationary-generators/'
      + 'gaseous-industrial-generators/spec-sheets/'
      + 'sg750-750kw-industrial-gaseous-generator-specsheet.pdf',
    storagePath: 'generac/spec-sheets/sg750-750kw.pdf',
    label: 'Generac SG750 750 kW Industrial Gaseous Generator Spec Sheet',
  },
  {
    brand: 'Generac',
    models: ['MGG100M'],
    source:
      'https://legacy.genconnect.generac.com/Media/'
      + 'vwDoc.axd?d=08d4c3d6-258a-4f62-98d1-218e72bdec3d',
    storagePath: 'generac/manuals/mgg100m-operating-manual.pdf',
    label: 'Generac MGG100M Official Operating Manual and Specifications',
    type: 'manual',
  },
  {
    brand: 'John Deere',
    models: ['6068HFG85'],
    source:
      'https://www.deere.com/assets/pdfs/common/industries/'
      + 'engines-and-drivetrain/specsheets/6068HFG85_T.pdf',
    storagePath: 'john-deere/spec-sheets/6068hfg85-official.pdf',
    label: 'John Deere 6068HFG85 Generator Drive Engine Spec Sheet',
  },
  {
    brand: 'John Deere',
    models: ['6090HF484'],
    source:
      'https://www.deere.com/assets/pdfs/common/industries/'
      + 'engines-and-drivetrain/specsheets/6090HF484_A.pdf',
    storagePath: 'john-deere/spec-sheets/6090hf484-official.pdf',
    label: 'John Deere 6090HF484 Generator Drive Engine Spec Sheet',
  },
  {
    brand: 'Deutz',
    models: ['D914L03'],
    source:
      'https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/'
      + 'en/mobile_machinery/d_914_mobile_machinery_en.pdf',
    storagePath: 'deutz/spec-sheets/d-914-series-mobile-machinery.pdf',
    label: 'Deutz D 914 Series Official Technical Datasheet',
  },
]
const documents = documentCandidates.filter(
  (document) => INCLUDE_GENERAC || document.brand !== 'Generac',
)

const curlBaseArguments = [
  '--noproxy',
  '*',
  '--http1.1',
  '--location',
  '--silent',
  '--show-error',
  '--fail',
  '--max-time',
  '60',
  '--header',
  'Accept-Encoding: identity',
  '--user-agent',
  'Mozilla/5.0 HaifengEngineDatabase/1.0',
]

function runCurl(arguments_) {
  return execFileSync('curl', [...curlBaseArguments, ...arguments_], {
    encoding: 'buffer',
    maxBuffer: 50 * 1024 * 1024,
  })
}

function downloadRangedPdf(source) {
  const headers = runCurl([
    '--range',
    '0-0',
    '--dump-header',
    '-',
    '--output',
    '/dev/null',
    source,
  ]).toString()
  const sizeMatch = headers.match(/content-range:\s*bytes 0-0\/(\d+)/i)
  if (!sizeMatch) throw new Error(`${source}: missing Content-Range header`)

  const totalBytes = Number(sizeMatch[1])
  const chunkSize = 256 * 1024
  const chunks = []
  for (let start = 0; start < totalBytes; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, totalBytes - 1)
    const expectedBytes = end - start + 1
    const chunkPath = path.join(
      tempDir,
      `range-${process.pid}-${start}-${end}.part`,
    )
    let chunk = null

    for (let attempt = 1; attempt <= 6; attempt += 1) {
      try {
        execFileSync(
          'curl',
          [
            ...curlBaseArguments,
            '--max-time',
            '30',
            '--range',
            `${start}-${end}`,
            '--output',
            chunkPath,
            source,
          ],
          { stdio: ['ignore', 'ignore', 'pipe'] },
        )
        const candidate = fs.readFileSync(chunkPath)
        if (candidate.length === expectedBytes) {
          chunk = candidate
          break
        }
      } catch {
        // The Generac CDN intermittently terminates range responses.
      } finally {
        fs.rmSync(chunkPath, { force: true })
      }
      if (attempt < 6) {
        awaitDelay(500 * attempt)
      }
    }

    if (!chunk) {
      throw new Error(
        `${source}: could not retrieve byte range ${start}-${end}`,
      )
    }
    chunks.push(chunk)
    const completed = Math.min(end + 1, totalBytes)
    if (
      completed === totalBytes ||
      Math.floor((completed - expectedBytes) / (1024 * 1024)) <
        Math.floor(completed / (1024 * 1024))
    ) {
      process.stdout.write(
        `  downloaded ${Math.round((completed / totalBytes) * 100)}%\r`,
      )
    }
  }
  process.stdout.write(' '.repeat(40) + '\r')
  return Buffer.concat(chunks)
}

function awaitDelay(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds)
}

function downloadLegacyGeneracPdf(source) {
  const outputPath = path.join(tempDir, `legacy-generac-${process.pid}.pdf`)
  try {
    execFileSync(
      'curl',
      [
        ...curlBaseArguments,
        '--max-time',
        '300',
        '--retry',
        '5',
        '--retry-delay',
        '1',
        '--retry-all-errors',
        '--remove-on-error',
        '--output',
        outputPath,
        source,
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    )
    return fs.readFileSync(outputPath)
  } finally {
    fs.rmSync(outputPath, { force: true })
  }
}

function downloadPdf(source) {
  const buffer = source.includes('www.generac.com/globalassets/')
    ? downloadRangedPdf(source)
    : source.includes('legacy.genconnect.generac.com/')
      ? downloadLegacyGeneracPdf(source)
      : runCurl([source])
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${source}: response is not a PDF`)
  }
  if (!buffer.subarray(-2048).includes(Buffer.from('%%EOF'))) {
    throw new Error(`${source}: PDF is truncated (missing EOF marker)`)
  }
  return buffer
}

async function findEngines(document) {
  const { data, error } = await supabase
    .from('engines')
    .select('id, brand, model, slug')
    .eq('brand', document.brand)
    .in('model', document.models)
  if (error) throw error
  return data
}

async function existingDocumentIds(engineIds, type) {
  if (!engineIds.length) return new Set()
  const { data, error } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .in('engine_id', engineIds)
    .eq('type', type)
  if (error) throw error
  return new Set(data.map((row) => row.engine_id))
}

let proposedLinks = 0
let insertedLinks = 0
let alreadyCovered = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${documents.length} official PDFs\n`)

for (const document of documents) {
  const documentType = document.type ?? 'datasheet'
  const engines = await findEngines(document)
  if (!engines.length) {
    throw new Error(
      `No engine records found for ${document.brand}: ${document.models.join(', ')}`,
    )
  }

  const coveredIds = await existingDocumentIds(
    engines.map((engine) => engine.id),
    documentType,
  )
  const targets = engines.filter((engine) => !coveredIds.has(engine.id))
  alreadyCovered += engines.length - targets.length

  if (!targets.length) {
    console.log(`${document.label}: already covered`)
    continue
  }

  const buffer = await downloadPdf(document.source)
  proposedLinks += targets.length
  console.log(
    `${document.label}: ${Math.round(buffer.length / 1024)} KB -> `
      + `${targets.map((engine) => engine.slug).join(', ')}`,
  )

  if (!APPLY) continue

  const localPath = path.join(tempDir, path.basename(document.storagePath))
  fs.writeFileSync(localPath, buffer)
  const upload = await uploadPdf(
    supabase,
    bucket,
    localPath,
    document.storagePath,
  )
  if (!upload.ok) throw new Error(`Upload failed: ${document.storagePath}`)

  for (const engine of targets) {
    await supabase
      .from('engine_pdfs')
      .delete()
      .eq('engine_id', engine.id)
      .eq('storage_path', document.storagePath)

    const { error } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: documentType,
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: upload.uploadedSizeBytes ?? buffer.length,
    })
    if (error) throw error
    insertedLinks += 1
  }
}

console.log(
  `\n${APPLY ? 'Complete' : 'Dry run complete'}: `
    + `${proposedLinks} proposed links, ${insertedLinks} inserted, `
    + `${alreadyCovered} already covered.`,
)
