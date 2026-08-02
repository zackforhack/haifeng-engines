import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'waukesha-exclusive-factsheets-2026-08')
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'waukesha-vhp-p9394gsi',
    tokens: ['P9394GSI', 'Series Five'],
    sourceUrl:
      'https://www.waukeshaengine.com/wp-content/uploads/IWK-123055-VHP-P9394GSI-S5.pdf',
    storagePath: 'waukesha/factsheets/vhp-p9394gsi-s5.pdf',
    label: 'Waukesha VHP Series Five P9394GSI S5 Fact Sheet',
  },
  {
    slug: 'waukesha-vhp-l7044gsi',
    tokens: ['L7044GSI', 'Series Five'],
    sourceUrl:
      'https://www.waukeshaengine.com/wp-content/uploads/IWK-124054-VHP-L7044GSI-S5-08.04.25.pdf',
    storagePath: 'waukesha/factsheets/vhp-l7044gsi-s5.pdf',
    label: 'Waukesha VHP Series Five L7044GSI S5 Fact Sheet',
  },
  {
    slug: 'waukesha-vhp-l7042gsi',
    tokens: ['L7042GSI', 'Series Five'],
    sourceUrl:
      'https://www.waukeshaengine.com/wp-content/uploads/IWK-123056-VHP-L7042GSI-S5.pdf',
    storagePath: 'waukesha/factsheets/vhp-l7042gsi-s5.pdf',
    label: 'Waukesha VHP Series Five L7042GSI S5 Fact Sheet',
  },
  {
    slug: 'waukesha-vhp-f3524gsi',
    tokens: ['F3524GSI', 'Series Five'],
    sourceUrl:
      'https://www.waukeshaengine.com/wp-content/uploads/IWK-123083-VHP-F3524GSI-S5-3.pdf',
    storagePath: 'waukesha/factsheets/vhp-f3524gsi-s5.pdf',
    label: 'Waukesha VHP Series Five F3524GSI S5 Fact Sheet',
  },
  {
    slug: 'waukesha-275gl-12v',
    tokens: ['12V', '275GL'],
    sourceUrl:
      'https://www.waukeshaengine.com/wp-content/uploads/2024/04/IWK-123025-12-275GL-ESM2-mech-drive.pdf',
    storagePath: 'waukesha/factsheets/275gl-12v-esm2-mechanical-drive.pdf',
    label: 'Waukesha 12V 275GL+ ESM2 Mechanical Drive Fact Sheet',
  },
  {
    slug: 'waukesha-275gl-16v',
    tokens: ['16V', '275GL'],
    sourceUrl:
      'https://www.waukeshaengine.com/wp-content/uploads/2024/04/IWK-123023-16-275GL-ESM2.pdf',
    storagePath: 'waukesha/factsheets/275gl-16v-esm2.pdf',
    label: 'Waukesha 16V 275GL+ ESM2 Fact Sheet',
  },
  {
    slug: 'waukesha-vgf-h24se',
    tokens: ['VGF', 'H24SE'],
    sourceUrl:
      'https://www.waukeshaengine.com/wp-content/uploads/IWK-123069-VGF-H24SE.pdf',
    storagePath: 'waukesha/factsheets/vgf-h24se.pdf',
    label: 'Waukesha VGF H24SE Fact Sheet',
  },
  {
    slug: 'waukesha-vgf-p48se',
    tokens: ['VGF', 'P48SE'],
    sourceUrl:
      'https://www.waukeshaengine.com/wp-content/uploads/IWK-123077-VGF-P48SE-02.11.26_L.pdf',
    storagePath: 'waukesha/factsheets/vgf-p48se.pdf',
    label: 'Waukesha VGF P48SE Fact Sheet',
  },
]

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

function pdfContainsTokens(pdfPath, tokens) {
  const text = execFileSync('pdftotext', [pdfPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const normalized = normalize(text)
  return tokens.every((token) => normalized.includes(normalize(token)))
}

function downloadPdf(record, localPath) {
  execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '2',
    '--connect-timeout',
    '30',
    '--max-time',
    '300',
    '--user-agent',
    UA,
    '--output',
    localPath,
    record.sourceUrl,
  ], {
    maxBuffer: 20 * 1024 * 1024,
  })
  const buffer = fs.readFileSync(localPath)
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${record.sourceUrl}: response is not a PDF`)
  }
  return buffer
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .in('slug', records.map((record) => record.slug))
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let verified = 0
let linked = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} Waukesha fact-sheet records`)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)

  process.stdout.write(`${engine.model} -> ${record.label} ... `)
  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  const buffer = downloadPdf(record, localPath)

  if (!pdfContainsTokens(localPath, record.tokens)) {
    throw new Error(`${record.storagePath}: PDF text does not contain ${record.tokens.join(', ')}`)
  }
  verified += 1

  if (!APPLY) {
    console.log(`${Math.round(buffer.length / 1024)}KB verified`)
    continue
  }

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

  console.log(`${Math.round(buffer.length / 1024)}KB linked`)
  linked += 1
}

console.log(
  `\n${APPLY ? 'Applied' : 'Dry run complete'}: `
  + `${verified} verified, ${linked} linked.`,
)
