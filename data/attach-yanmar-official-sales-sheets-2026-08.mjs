import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'yanmar-official-sales-sheets-2026-08')
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const records = [
  {
    slug: 'yanmar-3tnm74f-ngge',
    modelTokens: ['3TNM74F-NGGE'],
    sourcePage: 'https://yanmarengines.com/3tnm74f-gge-water-cooled-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/Sales-Sheet-3TNV74F-NGGE.pdf',
    storagePath: 'yanmar/official-sales-sheets/3tnm74f-ngge.pdf',
    label: 'Yanmar 3TNM74F-NGGE Sales Sheet',
    removeSharedFromSlugs: ['yanmar-3tnm74f-ng6ge'],
    removeSharedStoragePath: 'yanmar/datasheets/3tnm74f-ngge.pdf',
  },
  {
    slug: 'yanmar-3tnv80f-ngge',
    modelTokens: ['3TNV80F-NGGE'],
    sourcePage: 'https://yanmarengines.com/3tnv80f-ngge-diesel-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/Sales-Sheet-3TNV80F-NGGE.pdf',
    storagePath: 'yanmar/official-sales-sheets/3tnv80f-ngge.pdf',
    label: 'Yanmar 3TNV80F-NGGE Sales Sheet',
    removeSharedFromSlugs: ['yanmar-3tnv80f-ng6ge'],
    removeSharedStoragePath: 'yanmar/datasheets/3tnv80f-ngge.pdf',
  },
  {
    slug: 'yanmar-3tnv88f-ugge',
    modelTokens: ['3TNV88F-UGGE'],
    sourcePage: 'https://yanmarengines.com/3tnv88f-ugge-diesel-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/Sales-Sheet-3TNV88F-UGGE.pdf',
    storagePath: 'yanmar/official-sales-sheets/3tnv88f-ugge.pdf',
    label: 'Yanmar 3TNV88F-UGGE Sales Sheet',
    removeSharedFromSlugs: ['yanmar-3tnv88f-ug6ge'],
    removeSharedStoragePath: 'yanmar/datasheets/3tnv88f-ugge.pdf',
  },
  {
    slug: 'yanmar-4tnv84t-bgges',
    modelTokens: ['4TNV84T-BGGES'],
    sourcePage: 'https://yanmarengines.com/4tnv84t-bgges-diesel-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/Sales-Sheet-4TNV84T-BGGES.pdf',
    storagePath: 'yanmar/official-sales-sheets/4tnv84t-bgges.pdf',
    label: 'Yanmar 4TNV84T-BGGES Sales Sheet',
  },
  {
    slug: 'yanmar-2tnv70-hge',
    modelTokens: ['2TNV70-HGE'],
    sourcePage: 'https://yanmarengines.com/2tnv70-hge-diesel-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/2020/09/2TNV70-HGE.pdf',
    storagePath: 'yanmar/official-sales-sheets/2tnv70-hge.pdf',
    label: 'Yanmar 2TNV70-HGE Spec Sheet',
  },
  {
    slug: 'yanmar-3tnv70-hge',
    modelTokens: ['3TNV70-HGE'],
    sourcePage: 'https://yanmarengines.com/3tnv70-hge-diesel-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/2020/09/3TNV70-HGE.pdf',
    storagePath: 'yanmar/official-sales-sheets/3tnv70-hge.pdf',
    label: 'Yanmar 3TNV70-HGE Spec Sheet',
  },
  {
    slug: 'yanmar-3tnv76-gge',
    modelTokens: ['3TNV76-GGE'],
    sourcePage: 'https://yanmarengines.com/3tnv76-gge-diesel-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/2020/09/3TNV76-GGE.pdf',
    storagePath: 'yanmar/official-sales-sheets/3tnv76-gge.pdf',
    label: 'Yanmar 3TNV76-GGE Spec Sheet',
  },
  {
    slug: 'yanmar-3tnv76-hge',
    modelTokens: ['3TNV76-HGE'],
    sourcePage: 'https://yanmarengines.com/3tnv76-hge-diesel-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/2020/09/3TNV76-HGE.pdf',
    storagePath: 'yanmar/official-sales-sheets/3tnv76-hge.pdf',
    label: 'Yanmar 3TNV76-HGE Spec Sheet',
  },
  {
    slug: 'yanmar-3tnv82a-gge',
    modelTokens: ['3TNV82A-GGE'],
    sourcePage: 'https://yanmarengines.com/3tnv82a-gge-diesel-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/2020/09/3TNV82A-GGE.pdf',
    storagePath: 'yanmar/official-sales-sheets/3tnv82a-gge.pdf',
    label: 'Yanmar 3TNV82A-GGE Spec Sheet',
  },
  {
    slug: 'yanmar-4tnv88-bgges',
    modelTokens: ['4TNV88-BGGES'],
    sourcePage: 'https://yanmarengines.com/4tnv88-bgges-water-diesel-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/Sales-Sheet-4TNV88-BGGES.pdf',
    storagePath: 'yanmar/official-sales-sheets/4tnv88-bgges.pdf',
    label: 'Yanmar 4TNV88-BGGES Sales Sheet',
  },
  {
    slug: 'yanmar-4tnv98c-gge',
    modelTokens: ['4TNV98C-GGE'],
    sourcePage: 'https://yanmarengines.com/4tnv98c-gge-water-cooled-diesel-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/Sales-Sheet-4TNV98C-GGE.pdf',
    storagePath: 'yanmar/official-sales-sheets/4tnv98c-gge.pdf',
    label: 'Yanmar 4TNV98C-GGE Sales Sheet',
  },
  {
    slug: 'yanmar-4tnv98-zgges',
    modelTokens: ['4TNV98-ZGGES'],
    sourcePage: 'https://yanmarengines.com/4tnv98-zgges-diesel-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/Sales-Sheet-4TNV98-ZGGES.pdf',
    storagePath: 'yanmar/official-sales-sheets/4tnv98-zgges.pdf',
    label: 'Yanmar 4TNV98-ZGGES Sales Sheet',
  },
  {
    slug: 'yanmar-4tnv98t-zgges',
    modelTokens: ['4TNV98T-ZGGES'],
    sourcePage: 'https://yanmarengines.com/4tnv98t-zgges-diesel-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/Sales-Sheet-4TNV98T-ZGGES.pdf',
    storagePath: 'yanmar/official-sales-sheets/4tnv98t-zgges.pdf',
    label: 'Yanmar 4TNV98T-ZGGES Sales Sheet',
  },
  {
    slug: 'yanmar-4tnv98ct-gge',
    modelTokens: ['4TNV98CT-GGE'],
    sourcePage: 'https://yanmarengines.com/4tnv98ct-gge-water-cooled-diesel-engine/',
    sourceUrl: 'https://yanmarengines.com/wp-content/uploads/Sales-Sheet-4TNV98CT-GGE.pdf',
    storagePath: 'yanmar/official-sales-sheets/4tnv98ct-gge.pdf',
    label: 'Yanmar 4TNV98CT-GGE Sales Sheet',
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

const allSlugs = [
  ...new Set(records.flatMap((record) => [
    record.slug,
    ...(record.removeSharedFromSlugs ?? []),
  ])),
]
const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .in('slug', allSlugs)
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let verified = 0
let linked = 0
let removedSharedLinks = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${records.length} official Yanmar sales sheets`)

for (const record of records) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)

  process.stdout.write(`${engine.model} -> ${record.label} ... `)
  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  const buffer = downloadPdf(record, localPath)

  if (!pdfContainsTokens(localPath, record.modelTokens)) {
    throw new Error(`${record.storagePath}: PDF text does not contain ${record.modelTokens.join(', ')}`)
  }
  verified += 1

  if (!APPLY) {
    console.log(`${Math.round(buffer.length / 1024)}KB verified from ${record.sourceUrl}`)
    continue
  }

  const upload = await uploadPdf(supabase, BUCKET, localPath, record.storagePath)
  if (!upload.ok) throw new Error(`Upload failed: ${record.storagePath}`)

  const { error: deleteExistingError } = await supabase
    .from('engine_pdfs')
    .delete()
    .eq('engine_id', engine.id)
    .eq('storage_path', record.storagePath)
  if (deleteExistingError) throw deleteExistingError

  const { error: insertError } = await supabase.from('engine_pdfs').insert({
    engine_id: engine.id,
    type: 'datasheet',
    label: record.label,
    storage_path: record.storagePath,
    file_size_bytes: upload.uploadedSizeBytes ?? buffer.length,
  })
  if (insertError) throw insertError
  linked += 1

  if (record.removeSharedStoragePath) {
    for (const slug of record.removeSharedFromSlugs ?? []) {
      const sharedEngine = engineBySlug.get(slug)
      if (!sharedEngine) throw new Error(`Missing shared-link engine row: ${slug}`)

      const { error: removeError, count } = await supabase
        .from('engine_pdfs')
        .delete({ count: 'exact' })
        .eq('engine_id', sharedEngine.id)
        .eq('storage_path', record.removeSharedStoragePath)
      if (removeError) throw removeError
      removedSharedLinks += count ?? 0
    }
  }

  console.log(`${Math.round(buffer.length / 1024)}KB linked`)
}

console.log(
  `\n${APPLY ? 'Applied' : 'Dry run complete'}: `
  + `${verified} verified, ${linked} linked, ${removedSharedLinks} stale shared links removed.`,
)
