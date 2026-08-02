import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'baudouin-60hz-reassign-2026-08')
const PUBLIC_STORAGE_BASE =
  'https://ntrysdovwnbegxtjsqkz.supabase.co/storage/v1/object/public/engine-pdfs'

const moves = [
  ['baudouin/spec-sheets/12M33G1100-6.pdf', 'baudouin-12m33g1250-5', 'baudouin-12m33g1100-6', '12M33G1100/6'],
  ['baudouin/spec-sheets/12M33G1200-6.pdf', 'baudouin-12m33g1400-5', 'baudouin-12m33g1200-6', '12M33G1200/6'],
  ['baudouin/spec-sheets/12M33G1300-6.pdf', 'baudouin-12m33g1500-5', 'baudouin-12m33g1300-6', '12M33G1300/6'],
  ['baudouin/spec-sheets/16M33G1650-6.pdf', 'baudouin-16m33g1900-5', 'baudouin-16m33g1650-6', '16M33G1650/6'],
  ['baudouin/spec-sheets/16M33G1750-6.pdf', 'baudouin-16m33g2000-5', 'baudouin-16m33g1750-6', '16M33G1750/6'],
  ['baudouin/spec-sheets/4M10G83-6.pdf', 'baudouin-4m10g88-5', 'baudouin-4m10g83-6', '4M10G83/6'],
  ['baudouin/spec-sheets/6M11G176-6.pdf', 'baudouin-6m11g188-5', 'baudouin-6m11g176-6', '6M11G176/6'],
  ['baudouin/spec-sheets/6M21G330-6.pdf', 'baudouin-6m21g400-5', 'baudouin-6m21g330-6', '6M21G330/6'],
  ['baudouin/spec-sheets/6M21G390-6.pdf', 'baudouin-6m21g440-5', 'baudouin-6m21g390-6', '6M21G390/6'],
  ['baudouin/spec-sheets/6M21G460-6.pdf', 'baudouin-6m21g550-5', 'baudouin-6m21g460-6', '6M21G460/6'],
  ['baudouin/spec-sheets/6M33G633-6.pdf', 'baudouin-6m33g750-5', 'baudouin-6m33g633-6', '6M33G633/6'],
  ['baudouin/spec-sheets/8M33G800-6.pdf', 'baudouin-8m33g1000-5', 'baudouin-8m33g800-6', '8M33G800/6'],
].map(([storagePath, fromSlug, toSlug, model]) => ({
  storagePath,
  fromSlug,
  toSlug,
  model,
}))

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
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function publicUrl(storagePath) {
  return `${PUBLIC_STORAGE_BASE}/${storagePath
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`
}

function verifyStoredPdf(record, localPath) {
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '2',
    '--output',
    localPath,
    publicUrl(record.storagePath),
  ])

  const buffer = fs.readFileSync(localPath)
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${record.storagePath}: stored object is not a PDF`)
  }

  const text = execFileSync('pdftotext', [localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  if (!normalize(text).includes(normalize(record.model))) {
    throw new Error(`${record.storagePath}: PDF text does not contain ${record.model}`)
  }

  return buffer.length
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const allSlugs = [...new Set(moves.flatMap((move) => [move.fromSlug, move.toSlug]))]
const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .in('slug', allSlugs)
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let verified = 0
let moved = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${moves.length} Baudouin 60 Hz link corrections`)

for (const move of moves) {
  const fromEngine = engineBySlug.get(move.fromSlug)
  const toEngine = engineBySlug.get(move.toSlug)
  if (!fromEngine) throw new Error(`Missing source engine row: ${move.fromSlug}`)
  if (!toEngine) throw new Error(`Missing target engine row: ${move.toSlug}`)

  process.stdout.write(`${move.model}: ${move.fromSlug} -> ${move.toSlug} ... `)
  const localPath = path.join(TMP_DIR, path.basename(move.storagePath))
  const fileSize = verifyStoredPdf(move, localPath)
  verified += 1

  const { data: existingRows, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('id, engine_id, type, label, storage_path, file_size_bytes')
    .eq('storage_path', move.storagePath)
  if (existingError) throw existingError

  const sourceRows = existingRows.filter((row) => row.engine_id === fromEngine.id)
  if (sourceRows.length !== 1) {
    throw new Error(
      `${move.storagePath}: expected one source link on ${move.fromSlug}, found ${sourceRows.length}`,
    )
  }

  const targetRows = existingRows.filter((row) => row.engine_id === toEngine.id)
  if (targetRows.length) {
    throw new Error(`${move.storagePath}: target ${move.toSlug} is already linked`)
  }

  if (!APPLY) {
    console.log(`${Math.round(fileSize / 1024)}KB verified`)
    continue
  }

  const sourceRow = sourceRows[0]
  const { error: deleteError } = await supabase
    .from('engine_pdfs')
    .delete()
    .eq('id', sourceRow.id)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('engine_pdfs').insert({
    engine_id: toEngine.id,
    type: sourceRow.type,
    label: `Baudouin ${toEngine.model} Specification Sheet`,
    storage_path: move.storagePath,
    file_size_bytes: sourceRow.file_size_bytes ?? fileSize,
  })
  if (insertError) throw insertError

  console.log(`${Math.round(fileSize / 1024)}KB moved`)
  moved += 1
}

console.log(
  `\n${APPLY ? 'Applied' : 'Dry run complete'}: `
  + `${verified} verified, ${moved} moved.`,
)
