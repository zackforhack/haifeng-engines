// Attach exact International/Navistar DT466, DT570 and HT570 manual pages.
//
// Dry run:
//   node data/attach-international-dt466-570-manuals-batch-58-2026-08.mjs
// Apply:
//   node data/attach-international-dt466-570-manuals-batch-58-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-58-international-dt466-570.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-international-dt466-570-docs-batch-58-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyInternationalDTDocs/1.0; +https://engines.haifengmachinery.com)'

const MANUALSLIB_NAVISTAR_BRAND = 'https://www.manualslib.com/brand/navistar/'
const MANUALSLIB_DT466_SERVICE =
  'https://www.manualslib.com/manual/1640222/Navistar-International-Dt-466.html'
const MANUALSLIB_DT466_DIAGNOSTIC =
  'https://www.manualslib.com/manual/1837761/Navistar-International-Dt-466.html'
const MANUALSLIB_DT466_PRODUCT =
  'https://www.manualslib.com/products/Navistar-International-Dt-466-10570792.html'
const MANUALSLIB_MAXXFORCE_7 =
  'https://www.manualslib.com/manual/3016167/Navistar-Maxxforce-7.html'
const MAXXFORCE_7_OLD_STORAGE_PATH =
  'manualslib/navistar/maxxforce-7-operation-maintenance-manual.html'

const TARGET_SLUGS = ['international-dt466', 'international-dt570', 'international-ht570']

const DOCUMENTS = [
  {
    label: 'Navistar International DT 466/DT 570/HT 570 Service Manual',
    type: 'manual',
    sourceUrl: MANUALSLIB_DT466_SERVICE,
    storagePath: MANUALSLIB_DT466_SERVICE,
    cachedPath: '/tmp/manualslib-navistar-dt466-current.html',
    fileName: 'manualslib-navistar-dt466-service.html',
    requiredTokens: [
      'NAVISTAR INTERNATIONAL DT 466 SERVICE MANUAL',
      'International DT 466 engine pdf manual download. Also for: International dt 570, International ht 570.',
      'DT 466, DT 570, HT 570',
      'DT 570 and HT 570 Engines Only',
      '2009 Navistar',
    ],
  },
  {
    label: 'Navistar International DT 466/DT 570/HT 570 Diagnostic Troubleshooting Manual',
    type: 'manual',
    sourceUrl: MANUALSLIB_DT466_DIAGNOSTIC,
    storagePath: MANUALSLIB_DT466_DIAGNOSTIC,
    cachedPath: '/tmp/manualslib-navistar-dt466-diagnostic-current.html',
    fileName: 'manualslib-navistar-dt466-diagnostic.html',
    requiredTokens: [
      'NAVISTAR INTERNATIONAL DT 466 DIAGNOSTIC/TROUBLESHOOTING MANUAL',
      'International DT 466 engine pdf manual download. Also for: International dt 570, International ht 570.',
      'Appendix A: DT 466 Performance Specifications 2004 Model Year',
      'Appendix B: DT 570 and HT 570 Performance Specifications 2004 Model Year',
      'DT 570 (Standard Torque)',
      'HT 570 (High Torque)',
      '2008 Navistar',
    ],
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
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function download(url, outputPath, cachedPath) {
  if (cachedPath && fs.existsSync(cachedPath)) {
    fs.copyFileSync(cachedPath, outputPath)
    return
  }

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
    '180',
    '--user-agent',
    USER_AGENT,
    '--output',
    outputPath,
    url,
  ], {
    env: {
      ...process.env,
      HTTP_PROXY: '',
      HTTPS_PROXY: '',
      ALL_PROXY: '',
      http_proxy: '',
      https_proxy: '',
      all_proxy: '',
    },
    maxBuffer: 50 * 1024 * 1024,
  })
}

function readPlainText(localPath) {
  return fs.readFileSync(localPath, 'utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
}

function verifyHtml({ url, fileName, tokens, cachedPath }) {
  const localPath = path.join(TMP_DIR, fileName)
  download(url, localPath, cachedPath)
  const html = fs.readFileSync(localPath, 'utf8')
  const missing = tokens.filter((token) => !hasToken(html, token))
  if (missing.length) throw new Error(`${url}: missing validation token(s): ${missing.join(', ')}`)
  return {
    localPath,
    fileSizeBytes: Buffer.byteLength(html, 'utf8'),
  }
}

function verifyDocument(document) {
  const verified = verifyHtml({
    url: document.sourceUrl,
    fileName: document.fileName,
    tokens: document.requiredTokens,
    cachedPath: document.cachedPath,
  })
  return {
    ...document,
    ...verified,
  }
}

async function countLegacyCoverage(supabase) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, status, pdfs:engine_pdfs(id)')
      .eq('status', 'discontinued')
      .range(from, from + 999)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return {
    legacyCount: rows.length,
    legacyWithPdf: rows.filter((engine) => (engine.pdfs ?? []).length > 0).length,
  }
}

function buildReport({
  verifiedDocs,
  actionRows,
  skippedRows,
  missingRows,
  maxxForceFix,
  afterCount,
  coverage,
}) {
  return `# Legacy Engine Document Attachments - Batch 58 International DT466/DT570/HT570

Date: 2026-08-12

## Result

- Exact International/Navistar manual pages reviewed: \`${verifiedDocs.length}\`
- Manual links ${APPLY ? 'inserted' : 'planned'}: \`${actionRows.length}\`
- Manual links skipped as existing: \`${skippedRows.length}\`
- Missing or ineligible target engine rows: \`${missingRows.length}\`
- Existing MaxxForce 7 storage-path fix ${APPLY ? 'applied' : 'planned'}: \`${maxxForceFix.planned ? 1 : 0}\`
${afterCount == null ? '' : `- Engine count after attachment: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after attachment: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## Reference Attachments

| Document | Source | Target models | Verification |
| --- | --- | --- | --- |
${verifiedDocs.map((doc) => `| ${doc.label} | ${doc.sourceUrl} | DT466, DT570, HT570 | Exact DT466 title/meta and DT570/HT570 coverage tokens verified. |`).join('\n')}

## Linked Engine Rows

| Slug | Model | Document | Status |
| --- | --- | --- | --- |
${actionRows.map((row) => `| ${row.slug} | ${row.model} | ${row.label} | ${APPLY ? 'linked' : 'planned'} |`).join('\n')}

## Skipped Existing Links

${skippedRows.length ? skippedRows.map((row) => `- ${row.slug}: ${row.label}`).join('\n') : '- None.'}

## Missing Rows

${missingRows.length ? missingRows.map((row) => `- ${row.slug}: ${row.reason}`).join('\n') : '- None.'}

## Link Quality Fix

- MaxxForce 7 document row: ${maxxForceFix.planned ? `${MAXXFORCE_7_OLD_STORAGE_PATH} -> ${MANUALSLIB_MAXXFORCE_7}` : 'no matching old storage path found.'}

## Validation Sources

- ${MANUALSLIB_NAVISTAR_BRAND}
- ${MANUALSLIB_DT466_PRODUCT}
- ${MANUALSLIB_DT466_SERVICE}
- ${MANUALSLIB_DT466_DIAGNOSTIC}
- ${MANUALSLIB_MAXXFORCE_7}

## Notes

- These are external ManualsLib manual pages, not locally stored PDFs. The frontend resolves absolute document URLs directly.
- DT570 and HT570 were linked only because the service and diagnostic pages both expose them as covered models and the diagnostic page includes the 2004 DT570/HT570 performance appendix.
- Older International variants such as DTI-466, DT-466B, DT360 and DT530 were intentionally excluded from this attachment because these manual pages do not prove exact coverage for those rows.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

verifyHtml({
  url: MANUALSLIB_NAVISTAR_BRAND,
  fileName: 'manualslib-navistar-brand.html',
  cachedPath: '/tmp/manualslib-navistar-brand-current.html',
  tokens: [
    'INTERNATIONAL DT 466',
    'INTERNATIONAL DT 570',
    'INTERNATIONAL HT 570',
    '/manual/1640222/Navistar-International-Dt-466.html#product-INTERNATIONAL DT 570',
    '/manual/1640222/Navistar-International-Dt-466.html#product-INTERNATIONAL HT 570',
  ],
})

verifyHtml({
  url: MANUALSLIB_DT466_PRODUCT,
  fileName: 'manualslib-navistar-dt466-product.html',
  cachedPath: '/tmp/manualslib-navistar-dt466-product-current.html',
  tokens: [
    'Navistar INTERNATIONAL DT 466 Manuals',
    'Diagnostic/Troubleshooting Manual',
    'Service Manual',
    'Appendix B: DT 570 and HT 570 Performance Specifications 2004 Model Year',
    'DT 570 (Standard Torque)',
    'HT 570 (High Torque)',
  ],
})

const verifiedDocs = DOCUMENTS.map(verifyDocument)

const maxxForceCache = path.join(TMP_DIR, 'manualslib-maxxforce-7.html')
download(MANUALSLIB_MAXXFORCE_7, maxxForceCache, '/tmp/manualslib-maxxforce-7.html')
const maxxForceText = readPlainText(maxxForceCache)
const maxxForceMissing = [
  'Navistar MaxxForce 7 Operation And Maintenance Manual',
  'MaxxForce 7 engine pdf manual download',
  'Displacement 6.4 L',
  '4 stroke, V8 diesel',
].filter((token) => !hasToken(maxxForceText, token))
if (maxxForceMissing.length) {
  throw new Error(`${MANUALSLIB_MAXXFORCE_7}: missing validation token(s): ${maxxForceMissing.join(', ')}`)
}

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const { data: targets, error: targetError } = await supabase
  .from('engines')
  .select('id, brand, model, slug, status')
  .in('slug', TARGET_SLUGS)
if (targetError) throw targetError

const enginesBySlug = new Map((targets ?? []).map((engine) => [engine.slug, engine]))
const actionRows = []
const skippedRows = []
const missingRows = []

for (const slug of TARGET_SLUGS) {
  const engine = enginesBySlug.get(slug)
  if (!engine) {
    missingRows.push({ slug, reason: 'No matching International engine row exists.' })
    continue
  }
  if (engine.brand !== 'International') {
    missingRows.push({ slug, reason: `Engine row brand is ${engine.brand}.` })
    continue
  }
  if (engine.status !== 'discontinued') {
    missingRows.push({ slug, reason: `Engine row exists but status is ${engine.status}.` })
    continue
  }

  for (const document of verifiedDocs) {
    const { data: existingLinks, error: existingLinksError } = await supabase
      .from('engine_pdfs')
      .select('id')
      .eq('engine_id', engine.id)
      .eq('storage_path', document.storagePath)
    if (existingLinksError) throw existingLinksError

    const reportRow = {
      slug: engine.slug,
      model: engine.model,
      label: document.label,
    }

    if (existingLinks?.length) {
      skippedRows.push(reportRow)
      continue
    }

    if (APPLY) {
      const { error: insertError } = await supabase.from('engine_pdfs').insert({
        engine_id: engine.id,
        type: document.type,
        label: document.label,
        storage_path: document.storagePath,
        file_size_bytes: document.fileSizeBytes,
      })
      if (insertError) throw insertError
    }
    actionRows.push(reportRow)
  }
}

let maxxForceFix = { planned: false }
const { data: maxxForceRows, error: maxxForceError } = await supabase
  .from('engines')
  .select('id, slug, pdfs:engine_pdfs(id, label, storage_path)')
  .eq('slug', 'international-maxxforce-7')
  .limit(1)
if (maxxForceError) throw maxxForceError

const maxxForce = maxxForceRows?.[0]
const oldMaxxForceLinks = (maxxForce?.pdfs ?? []).filter(
  (pdf) => pdf.storage_path === MAXXFORCE_7_OLD_STORAGE_PATH,
)
if (maxxForce && oldMaxxForceLinks.length) {
  maxxForceFix = { planned: true }
  if (APPLY) {
    const { error: updateError } = await supabase
      .from('engine_pdfs')
      .update({
        storage_path: MANUALSLIB_MAXXFORCE_7,
        file_size_bytes: fs.statSync(maxxForceCache).size,
      })
      .eq('engine_id', maxxForce.id)
      .eq('storage_path', MAXXFORCE_7_OLD_STORAGE_PATH)
    if (updateError) throw updateError
  }
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = await countLegacyCoverage(supabase)
await fsp.writeFile(
  REPORT_PATH,
  buildReport({
    verifiedDocs,
    actionRows,
    skippedRows,
    missingRows,
    maxxForceFix,
    afterCount: APPLY ? afterCount : null,
    coverage: APPLY ? coverage : null,
  }),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: International/Navistar DT466/DT570/HT570 documents.`)
console.log(`Validated manual pages: ${verifiedDocs.length}.`)
console.log(`${APPLY ? 'Linked' : 'Planned'} manual links: ${actionRows.length}.`)
console.log(`Existing manual links skipped: ${skippedRows.length}.`)
console.log(`MaxxForce 7 storage-path fix ${maxxForceFix.planned ? 'planned/applied' : 'not needed'}.`)
console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
