// Attach source-validated strict technical/brochure references to exact legacy rows.
//
// Dry run:
//   node data/attach-perkins-international-strict-docs-batch-80-2026-08.mjs
// Apply:
//   node data/attach-perkins-international-strict-docs-batch-80-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-80-perkins-international-strict.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-strict-docs-batch-80-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyStrictDocsBatch80/1.0; +https://engines.haifengmachinery.com)'

const DOCUMENTS = [
  {
    key: 'perkins-4236-family-technical-data',
    mode: 'external-page',
    sourceUrl: 'https://doczz.net/doc/1282433/perkins-4.236-series',
    storagePath: 'https://doczz.net/doc/1282433/perkins-4.236-series#technical-data',
    label: 'Perkins 4.236 Series Technical Data Reference',
    type: 'datasheet',
    slugs: [
      'perkins-4-236',
      'perkins-t4-236',
      'perkins-4-248',
      'perkins-4-2482',
    ],
    requiredTokens: [
      'Perkins 4.236 Series',
      'Models 4.236, T4.236, 4.248, 4.2482',
      'The 4.236 Series family consists of four engines',
      'naturally aspirated 4.236, 4.248 and 4.2482 engines',
      'turbocharged T4.236 engine',
      '3,86 litres (236 in3)',
      '4,06 litres (248 in3)',
      'Engine data',
      'Compression ratio',
      'Number of cylinders',
    ],
    notes:
      'Linked only to the four exact 4.236-family models named in the source technical-data text; A4.236/A4.248 rows remain manual-only because this source does not name them in the model list.',
  },
  {
    key: 'international-maxxforce-dt-9-10-i6',
    mode: 'pdf',
    sourceUrl: 'https://news.international.com/news?item=61&asPDF=1',
    storagePath: 'international/legacy/maxxforce-dt-9-10-i6-family-newsroom-2006.pdf',
    cachedPath: '/tmp/international-maxxforce-i6-release.pdf',
    label: 'International MaxxForce DT/9/10 I-6 Ratings Brochure',
    type: 'brochure',
    slugs: [
      'international-maxxforce-dt',
      'international-maxxforce-9',
      'international-maxxforce-10',
    ],
    requiredTokens: [
      'International Engine Group Introduces I-6 Family of MaxxForce Engines',
      'MaxxForce DT, 9 and 10 Built On Legendary Engine Platform',
      'MaxxForce DT powers',
      'MaxxForce 9 powers',
      'MaxxForce 10 powers',
      '210-300 horsepower',
      '330 hp and 800-950 ft.-lbs of torque',
      '310-350 hp and 1,050-1,150 ft.-lbs',
    ],
    notes:
      'Official International/Navistar newsroom PDF treated as a brochure/rating announcement because it validates exact model names, applications and horsepower ranges.',
  },
  {
    key: 'international-maxxforce-11-13-big-bore',
    mode: 'pdf',
    sourceUrl: 'https://news.international.com/news?item=42&asPDF=1',
    storagePath: 'international/legacy/maxxforce-11-13-big-bore-ratings-2007.pdf',
    cachedPath: '/tmp/international-maxxforce-11-13-release.pdf',
    label: 'International MaxxForce 11/13 Big Bore Ratings Brochure',
    type: 'brochure',
    slugs: [
      'international-maxxforce-11',
      'international-maxxforce-13',
    ],
    requiredTokens: [
      'New Maxxforce Big Bore Engine Ratings Revealed',
      'MaxxForce 11 and MaxxForce 13',
      '330 to 475 horsepower',
      'beginning in late 2007',
      'manufactured at a new International plant in Huntsville',
    ],
    notes:
      'Official International/Navistar newsroom PDF treated as a brochure/rating announcement for the exact MaxxForce 11 and 13 big-bore rows.',
  },
  {
    key: 'international-maxxforce-15',
    mode: 'pdf',
    sourceUrl: 'https://news.international.com/news?item=472&asPDF=1',
    storagePath: 'international/legacy/maxxforce-15-production-availability-2011.pdf',
    cachedPath: '/tmp/international-maxxforce-15-release.pdf',
    label: 'International MaxxForce 15 Production/Ratings Brochure',
    type: 'brochure',
    slugs: ['international-maxxforce-15'],
    requiredTokens: [
      'Navistar Introduces ProStar+ With Maxxforce 15',
      'production availability',
      'MaxxForce 15',
      'up to 500 horsepower',
      'up to 550 horsepower',
    ],
    notes:
      'Official International/Navistar newsroom PDF treated as a brochure/rating announcement for the exact MaxxForce 15 row.',
  },
]

function parseEnvFile(text) {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const separator = line.indexOf('=')
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
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
  return String(value ?? '')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ndash;/gi, '-')
    .replace(/–/g, '-')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function curlEnv() {
  return {
    ...process.env,
    HTTP_PROXY: '',
    HTTPS_PROXY: '',
    ALL_PROXY: '',
    http_proxy: '',
    https_proxy: '',
    all_proxy: '',
  }
}

function curl(args, options = {}) {
  return execFileSync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '3',
    '--retry-all-errors',
    '--connect-timeout',
    '30',
    '--max-time',
    String(options.maxTime ?? 180),
    '--user-agent',
    USER_AGENT,
    ...args,
  ], {
    ...options,
    env: curlEnv(),
    maxBuffer: options.maxBuffer ?? 80 * 1024 * 1024,
  })
}

function fetchText(url) {
  return curl([url], {
    encoding: 'utf8',
    maxTime: 120,
    maxBuffer: 20 * 1024 * 1024,
  })
}

function download(document, outputPath) {
  if (document.cachedPath && fs.existsSync(document.cachedPath)) {
    fs.copyFileSync(document.cachedPath, outputPath)
    return
  }
  curl(['--output', outputPath, document.sourceUrl], {
    maxTime: 240,
    maxBuffer: 80 * 1024 * 1024,
  })
}

function verifyExternalPage(document) {
  const text = fetchText(document.sourceUrl)
  const missing = document.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${document.sourceUrl}: missing page token(s): ${missing.join(', ')}`)
  }
  return {
    localPath: null,
    fileSizeBytes: Buffer.byteLength(text, 'utf8'),
  }
}

function verifyPdf(document) {
  const localPath = path.join(TMP_DIR, path.basename(document.storagePath))
  download(document, localPath)
  const buffer = fs.readFileSync(localPath)
  if (buffer.length < 10_000 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.sourceUrl}: response is not a usable PDF`)
  }
  const text = execFileSync('pdftotext', ['-layout', localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
  })
  const missing = document.requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) {
    throw new Error(`${document.sourceUrl}: missing PDF token(s): ${missing.join(', ')}`)
  }
  return {
    localPath,
    fileSizeBytes: buffer.length,
  }
}

async function fetchStrictCoverage(supabase) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, status, pdfs:engine_pdfs(id,type)')
      .range(from, from + 999)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  const legacy = rows.filter((row) => row.status === 'discontinued')
  const strict = legacy.filter((row) =>
    (row.pdfs ?? []).some((pdf) => pdf.type === 'datasheet' || pdf.type === 'brochure'),
  )
  return {
    engineCount: rows.length,
    legacyCount: legacy.length,
    strictCount: strict.length,
    strictPct: Number((strict.length / legacy.length * 100).toFixed(1)),
    strictNeededFor60Percent: Math.max(0, Math.ceil(legacy.length * 0.6) - strict.length),
  }
}

function buildReport({
  verifiedDocs,
  linkedCount,
  upgradedCount,
  skippedCount,
  missingEngines,
  coverageBefore,
  coverageAfter,
}) {
  return `# Legacy Engine Document Attachments - Batch 80 Perkins/International Strict Docs

Date: 2026-08-12

## Result

- Strict technical/brochure documents verified: \`${verifiedDocs.length}\`
- Strict document links ${APPLY ? 'inserted' : 'planned'}: \`${linkedCount}\`
- Existing links upgraded to strict type ${APPLY ? 'updated' : 'planned'}: \`${upgradedCount}\`
- Links skipped as existing: \`${skippedCount}\`
- Missing engine rows: \`${missingEngines.length}\`
- Strict legacy coverage before: \`${coverageBefore.strictCount}/${coverageBefore.legacyCount} (${coverageBefore.strictPct}%)\`
${coverageAfter == null ? '' : `- Strict legacy coverage after: \`${coverageAfter.strictCount}/${coverageAfter.legacyCount} (${coverageAfter.strictPct}%)\`\n- Remaining strict links needed for 60%: \`${coverageAfter.strictNeededFor60Percent}\`\n`}
## Document Attachments

| Document | Type | Source / URL | Storage / URL | Linked rows | Bytes |
| --- | --- | --- | --- | ---: | ---: |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.type} | ${doc.sourceUrl} | ${doc.storagePath} | ${doc.slugs.length} | ${doc.fileSizeBytes} |`).join('\n')}

## Linked Engine Rows

| Document | Engine slugs |
| --- | --- |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.slugs.join('<br>')} |`).join('\n')}

## Validation Notes

- Perkins 4.236-family strict credit is limited to the exact \`4.236\`, \`T4.236\`, \`4.248\`, and \`4.2482\` rows because the source names those four models and includes technical-data fields such as displacement, compression ratio and cylinder count.
- International MaxxForce rows use official International/Navistar newsroom PDFs as brochure/rating references. These are not labeled as datasheets; they are strict brochure links because the PDFs validate exact model names, applications and horsepower/rating ranges.
- Existing links were upgraded only when the same exact source was already attached as non-strict \`manual\`/\`other\` evidence and the source qualified as a strict \`datasheet\` or \`brochure\`.
${verifiedDocs.map((doc) => `- ${doc.notes}`).join('\n')}
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Perkins/International strict legacy document links`)

const coverageBefore = await fetchStrictCoverage(supabase)
const verifiedDocs = DOCUMENTS.map((document) => ({
  ...document,
  ...(document.mode === 'pdf' ? verifyPdf(document) : verifyExternalPage(document)),
}))

const slugs = [...new Set(DOCUMENTS.flatMap((document) => document.slugs))]
const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .in('slug', slugs)
if (enginesError) throw enginesError

const enginesBySlug = new Map((engines ?? []).map((engine) => [engine.slug, engine]))
const missingEngines = slugs.filter((slug) => !enginesBySlug.has(slug))
if (missingEngines.length) console.warn(`Missing engine rows: ${missingEngines.join(', ')}`)

for (const engine of engines ?? []) {
  if (engine.status !== 'discontinued') {
    throw new Error(`Refusing to link non-discontinued row: ${engine.slug}`)
  }
}

let linkedCount = 0
let upgradedCount = 0
let skippedCount = 0

for (const document of verifiedDocs) {
  if (APPLY && document.mode === 'pdf') {
    const upload = await uploadPdf(supabase, BUCKET, document.localPath, document.storagePath)
    if (!upload.ok) throw new Error(`Upload failed: ${document.storagePath}`)
    document.fileSizeBytes = upload.uploadedSizeBytes ?? document.fileSizeBytes
  }

  for (const slug of document.slugs) {
    const engine = enginesBySlug.get(slug)
    if (!engine) continue

    const { data: existing, error: existingError } = await supabase
      .from('engine_pdfs')
      .select('id,type')
      .eq('engine_id', engine.id)
      .eq('storage_path', document.storagePath)
    if (existingError) throw existingError

    if ((existing ?? []).some((row) => row.type === 'datasheet' || row.type === 'brochure')) {
      skippedCount += 1
      continue
    }

    if ((existing ?? []).length > 0) {
      upgradedCount += 1
      if (APPLY) {
        const { error: updateError } = await supabase
          .from('engine_pdfs')
          .update({
            type: document.type,
            label: document.label,
            file_size_bytes: document.fileSizeBytes,
          })
          .in('id', existing.map((row) => row.id))
        if (updateError) throw updateError
      }
      continue
    }

    linkedCount += 1
    if (!APPLY) continue

    const { error: insertError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: document.type,
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: document.fileSizeBytes,
    })
    if (insertError) throw insertError
  }
}

const coverageAfter = APPLY ? await fetchStrictCoverage(supabase) : null
await fsp.writeFile(
  REPORT_PATH,
  buildReport({
    verifiedDocs,
    linkedCount,
    upgradedCount,
    skippedCount,
    missingEngines,
    coverageBefore,
    coverageAfter,
  }),
)

console.log(
  `${APPLY ? 'Applied' : 'Dry run complete'}: ${verifiedDocs.length} docs, `
  + `${linkedCount} linked/planned, ${upgradedCount} upgraded/planned, ${skippedCount} skipped.`,
)
if (coverageAfter) {
  console.log(
    `Strict legacy coverage: ${coverageAfter.strictCount}/${coverageAfter.legacyCount} `
    + `(${coverageAfter.strictPct}%), remaining ${coverageAfter.strictNeededFor60Percent}`,
  )
}
console.log(`Wrote ${REPORT_PATH}`)
