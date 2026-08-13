// Attach validated MAN D28 legacy industrial manuals/data sheets to existing discontinued rows.
//
// Dry run:
//   node data/attach-man-legacy-d28-manuals-batch-12-2026-08.mjs
// Apply:
//   node data/attach-man-legacy-d28-manuals-batch-12-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH = 'reports/legacy-engine-doc-attachments-2026-08-11-batch-12-man-d28.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-man-d28-manuals-batch-12-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyManD28Probe/1.0; +https://engines.haifengmachinery.com)'

const SOURCE_URLS = [
  'https://manuals-free.com/131183-d2840le-2-d2842le-2-d2848le-2-man-industrial-diesel-engines-engineering-data-setting-values.html',
  'https://manuals-free.com/uploads/files/2023-09/1694070189_00000034en.pdf',
  'https://manuals-free.com/131203-d2866le-201-202-203-211-operating-instructions-for-man-industrial-diesel-engines.html',
  'https://manuals-free.com/uploads/files/2023-09/1694072226_00000050en.pdf',
  'https://www.manualslib.com/manual/3350542/Man-D-2866-Le-201.html',
  'https://manualzz.com/doc/23024236/man-d2848--d2840--d2842-le-series-industrial-diesel-engin...',
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
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

const d284xSlugs = [
  'man-d2840-le201',
  'man-d2840-le203',
  'man-d2840-le211',
  'man-d2840-le213',
  'man-d2842-le201',
  'man-d2842-le203',
  'man-d2842-le211',
  'man-d2842-le213',
  'man-d2848-le201',
  'man-d2848-le203',
  'man-d2848-le211',
  'man-d2848-le213',
]

const DOCUMENTS = [
  {
    sourceUrl: 'https://manuals-free.com/uploads/files/2023-09/1694070189_00000034en.pdf',
    sourcePage:
      'https://manuals-free.com/131183-d2840le-2-d2842le-2-d2848le-2-man-industrial-diesel-engines-engineering-data-setting-values.html',
    storagePath: 'man/legacy/d2840-d2842-d2848-le2xx-engineering-data-setting-values.pdf',
    label: 'MAN D2840/D2842/D2848 LE2xx Engineering Data and Setting Values',
    type: 'datasheet',
    requiredTokens: ['D2840', 'D2842', 'D2848', 'ENGINEERING', 'SETTING VALUES'],
    slugs: d284xSlugs,
  },
  {
    sourceUrl: 'https://manuals-free.com/uploads/files/2023-09/1694072226_00000050en.pdf',
    sourcePage:
      'https://manuals-free.com/131203-d2866le-201-202-203-211-operating-instructions-for-man-industrial-diesel-engines.html',
    storagePath: 'man/legacy/d2866-le201-le202-le203-le211-operating-instructions.pdf',
    label: 'MAN D2866 LE201/202/203/211 Operating Instructions',
    type: 'manual',
    requiredTokens: ['D2866', 'LE201', 'LE202', 'LE203', 'LE211', 'OPERATING INSTRUCTIONS'],
    slugs: ['man-d2866', 'man-d2866-le201', 'man-d2866-le203'],
  },
]

function downloadAndVerifyPdf(document) {
  const localPath = path.join(TMP_DIR, path.basename(document.storagePath))
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
    USER_AGENT,
    '--referer',
    document.sourcePage,
    '--output',
    localPath,
    document.sourceUrl,
  ], {
    maxBuffer: 20 * 1024 * 1024,
  })

  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 100_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.sourceUrl}: response is not a usable PDF`)
  }

  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })

  const missing = document.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${document.storagePath}: missing required token(s): ${missing.join(', ')}`)
  }

  return {
    localPath,
    fileSizeBytes: buffer.length,
  }
}

function buildReport({ verifiedDocs, linkedCount, skippedCount, missingEngines, afterCount, legacyWithPdf, legacyCount }) {
  return `# Legacy Engine Document Attachments - Batch 12 MAN D28

Date: 2026-08-11

## Result

- Validated MAN D28 legacy documents reviewed: \`${DOCUMENTS.length}\`
- Datasheet/manual links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
${afterCount == null ? '' : `- Engine count after attachment: \`${afterCount}\`\n`}${legacyCount == null ? '' : `- Legacy PDF/manual coverage after attachment: \`${legacyWithPdf}/${legacyCount}\`\n`}
## Document Attachments

| Document | Source | Storage path | Linked rows |
| --- | --- | --- | ---: |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.sourceUrl} | ${doc.storagePath} | ${doc.slugs.length} |`).join('\n')}

## Linked Engine Rows

| Document | Engine slugs |
| --- | --- |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.slugs.join('<br>')} |`).join('\n')}

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- This batch links documents only to existing MAN rows already marked \`discontinued\`.
- The D2840/D2842/D2848 engineering-data document covers LE201, LE203, LE211, and LE213 rows across all three families.
- The D2866 operating-instructions document covers LE201, LE202, LE203, and LE211; the current database has D2866, D2866 LE201, and D2866 LE203 discontinued rows, so only those rows are linked.
- D2842 and D2848 marine-only documents were reviewed but not used for this industrial/generator legacy batch.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: MAN D28 legacy document attachments`)

const verifiedDocs = DOCUMENTS.map((document) => {
  const verified = downloadAndVerifyPdf(document)
  console.log(`Verified ${document.label}: ${Math.round(verified.fileSizeBytes / 1024)}KB`)
  return {
    ...document,
    ...verified,
  }
})

const slugs = [...new Set(DOCUMENTS.flatMap((doc) => doc.slugs))]
const { data: engineRows, error: engineError } = await supabase
  .from('engines')
  .select('id, slug, brand, model, status')
  .in('slug', slugs)
if (engineError) throw engineError

const enginesBySlug = new Map(engineRows.map((engine) => [engine.slug, engine]))
const missingEngines = slugs.filter((slug) => !enginesBySlug.has(slug))
if (missingEngines.length) {
  console.warn(`Missing engine rows: ${missingEngines.join(', ')}`)
}

for (const engine of engineRows) {
  if (engine.brand !== 'MAN' || engine.status !== 'discontinued') {
    throw new Error(`Unexpected engine row for MAN legacy document: ${engine.slug} (${engine.brand}, ${engine.status})`)
  }
}

let linkedCount = 0
let skippedCount = 0

if (APPLY) {
  for (const document of verifiedDocs) {
    const upload = await uploadPdf(supabase, BUCKET, document.localPath, document.storagePath)
    if (!upload.ok) throw new Error(`Upload failed: ${document.storagePath}`)

    for (const slug of document.slugs) {
      const engine = enginesBySlug.get(slug)
      if (!engine) continue

      const { data: existingLinks, error: existingError } = await supabase
        .from('engine_pdfs')
        .select('engine_id')
        .eq('engine_id', engine.id)
        .eq('storage_path', document.storagePath)
      if (existingError) throw existingError

      if (existingLinks?.length) {
        skippedCount += 1
        continue
      }

      const { error: insertError } = await supabase.from('engine_pdfs').insert({
        engine_id: engine.id,
        type: document.type,
        label: document.label,
        storage_path: document.storagePath,
        file_size_bytes: document.fileSizeBytes,
      })
      if (insertError) throw insertError
      linkedCount += 1
      console.log(`Linked ${slug} -> ${document.storagePath}`)
    }
  }
} else {
  linkedCount = slugs.length - missingEngines.length
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

let legacyRows = []
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from('engines')
    .select('id, status, pdfs:engine_pdfs(id)')
    .eq('status', 'discontinued')
    .range(from, from + 999)
  if (error) throw error
  legacyRows = legacyRows.concat(data ?? [])
  if (!data || data.length < 1000) break
}
const legacyWithPdf = legacyRows.filter((engine) => (engine.pdfs ?? []).length > 0).length

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({
  verifiedDocs,
  linkedCount,
  skippedCount,
  missingEngines,
  afterCount: APPLY ? afterCount : null,
  legacyWithPdf: APPLY ? legacyWithPdf : null,
  legacyCount: APPLY ? legacyRows.length : null,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${legacyWithPdf}/${legacyRows.length}.`)
console.log(`Wrote ${REPORT_PATH}`)
