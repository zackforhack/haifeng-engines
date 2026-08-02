import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'perkins-welland-exact-spec-sheets-2026-08')
const MISSING_REPORT = 'reports/datasheet-coverage/missing-exclusive-2026-08-02.json'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

const RECORDS = [
  {
    slug: 'perkins-1106a-70tg1',
    model: '1106A-70TG1',
    sourcePage:
      'https://tickets.wellandpower.net/hc/en-us/articles/360002174037-All-About-the-Perkins-1106A-70TG1-Engine',
    sourceUrl: 'https://tickets.wellandpower.net/hc/en-us/article_attachments/360003397037',
    storagePath: 'perkins/welland-exact-spec-sheets/1106a-70tg1.pdf',
    label: 'Perkins 1106A-70TG1 Technical Data Sheet',
    siblingTokens: ['1106A-70TAG2', '1106A-70TAG3', '1106A-E70TAG4'],
  },
  {
    slug: 'perkins-2806a-e18ttag4',
    model: '2806A-E18TTAG4',
    sourcePage:
      'https://tickets.wellandpower.net/hc/en-us/articles/360002183977-All-About-the-Perkins-2806A-E18TTAG4-Engine',
    sourceUrl: 'https://tickets.wellandpower.net/hc/en-us/article_attachments/360010464818',
    storagePath: 'perkins/welland-exact-spec-sheets/2806a-e18ttag4.pdf',
    label: 'Perkins 2806A-E18TTAG4 Technical Data Sheet',
    siblingTokens: ['2806A-E18TTAG5', '2806A-E18TTAG6', '2806A-E18TTAG7'],
  },
  {
    slug: 'perkins-2806a-e18ttag5',
    model: '2806A-E18TTAG5',
    sourcePage:
      'https://tickets.wellandpower.net/hc/en-us/articles/360002184157-All-About-the-Perkins-2806A-E18TTAG5-Engine',
    sourceUrl: 'https://tickets.wellandpower.net/hc/en-us/article_attachments/360003490378',
    storagePath: 'perkins/welland-exact-spec-sheets/2806a-e18ttag5.pdf',
    label: 'Perkins 2806A-E18TTAG5 Technical Data Sheet',
    siblingTokens: ['2806A-E18TTAG4', '2806A-E18TTAG6', '2806A-E18TTAG7'],
  },
  {
    slug: 'perkins-4008tag1a',
    model: '4008TAG1A',
    sourcePage:
      'https://tickets.wellandpower.net/hc/en-us/articles/360002186257-All-About-the-Perkins-4008TAG1A-Engine',
    sourceUrl: 'https://tickets.wellandpower.net/hc/en-us/article_attachments/360003492338',
    storagePath: 'perkins/welland-exact-spec-sheets/4008tag1a.pdf',
    label: 'Perkins 4008TAG1A Technical Data Sheet',
    siblingTokens: ['4008TAG2A', '4008TAG2', '4008-30TAG3'],
  },
  {
    slug: 'perkins-4008tag2a',
    model: '4008TAG2A',
    sourcePage:
      'https://tickets.wellandpower.net/hc/en-us/articles/360002193278-All-About-the-Perkins-4008TAG2A-Engine',
    sourceUrl: 'https://tickets.wellandpower.net/hc/en-us/article_attachments/360003492698',
    storagePath: 'perkins/welland-exact-spec-sheets/4008tag2a.pdf',
    label: 'Perkins 4008TAG2A Technical Data Sheet',
    siblingTokens: ['4008TAG1A', '4008TAG2', '4008-30TAG3'],
  },
  {
    slug: 'perkins-4012-46twg3a',
    model: '4012-46TWG3A',
    sourcePage:
      'https://tickets.wellandpower.net/hc/en-us/articles/360002187117-All-About-the-Perkins-4012-46TWG3A-Engine',
    sourceUrl: 'https://tickets.wellandpower.net/hc/en-us/article_attachments/360003410117',
    storagePath: 'perkins/welland-exact-spec-sheets/4012-46twg3a.pdf',
    label: 'Perkins 4012-46TWG3A Technical Data Sheet',
    siblingTokens: ['4012-46TWG2A', '4012-46TAG2A', '4012-46TAG3A'],
  },
  {
    slug: 'perkins-4016tag2a',
    model: '4016TAG2A',
    sourcePage: 'https://tech-expo.ru/engines/perkins-4016tag2a/',
    sourceUrl: 'https://tech-expo.ru/upload/iblock/17c/4016TAG2A_perkins_techexpo.pdf',
    storagePath: 'perkins/secondary-exact-spec-sheets/4016tag2a.pdf',
    label: 'Perkins 4016TAG2A Technical Data Sheet',
    siblingTokens: ['4016TAG1A', '4016-61TRG3', '4016-61TRG3X'],
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
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hasExactToken(text, token) {
  return new RegExp(`(^|[^A-Z0-9])${escapeRegex(token.toUpperCase())}([^A-Z0-9]|$)`).test(
    text.toUpperCase(),
  )
}

function assertStillMissingExclusive() {
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'))
  const missingSlugs = new Set((report.groups?.Perkins ?? []).map((row) => row.slug))
  const stale = RECORDS.filter((record) => !missingSlugs.has(record.slug))
  if (stale.length) {
    console.warn(
      'Record(s) are no longer missing exclusive datasheets: '
      + stale.map((record) => record.slug).join(', '),
    )
  }
}

function downloadPdf(record, localPath) {
  execFileSync('curl', [
    '--http1.1',
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
    '--referer',
    record.sourcePage,
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

function verifyPdf(record, localPath) {
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  })
  if (!hasExactToken(text, record.model)) {
    throw new Error(`${record.storagePath}: missing exact model token ${record.model}`)
  }
  if (!/Perkins Engines Company Limited|www\.perkins\.com/i.test(text)) {
    throw new Error(`${record.storagePath}: missing Perkins-authored source markers`)
  }
  if (!/Basic technical data|Technical data|Technical information|General installation|Specification|Ratings|Performance/i.test(text)) {
    throw new Error(`${record.storagePath}: missing datasheet/specification markers`)
  }

  const siblingHits = record.siblingTokens.filter(
    (token) => hasExactToken(text, token),
  )
  if (siblingHits.length) {
    throw new Error(
      `${record.storagePath}: contains sibling token(s): ${siblingHits.join(', ')}`,
    )
  }
}

await loadEnv()
assertStillMissingExclusive()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model, brand')
  .in('slug', RECORDS.map((record) => record.slug))
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
let linked = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${RECORDS.length} exact Perkins spec sheets`)

for (const record of RECORDS) {
  const engine = engineBySlug.get(record.slug)
  if (!engine) throw new Error(`Missing engine row: ${record.slug}`)
  if (engine.brand !== 'Perkins') {
    throw new Error(`${record.slug}: expected Perkins, got ${engine.brand}`)
  }
  if (normalize(engine.model) !== normalize(record.model)) {
    throw new Error(`${record.slug}: expected ${record.model}, got ${engine.model}`)
  }

  const localPath = path.join(TMP_DIR, path.basename(record.storagePath))
  const buffer = downloadPdf(record, localPath)
  verifyPdf(record, localPath)
  console.log(`Verified ${engine.slug} ${engine.model}: ${Math.round(buffer.length / 1024)}KB`)

  if (APPLY) {
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
  }

  linked += 1
}

console.log(`${APPLY ? 'Linked' : 'Verified'} ${linked} exact Perkins spec sheet(s).`)
