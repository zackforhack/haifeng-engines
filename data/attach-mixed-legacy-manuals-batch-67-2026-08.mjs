// Attach exact legacy manual/reference pages to existing discontinued rows.
//
// Dry run:
//   node data/attach-mixed-legacy-manuals-batch-67-2026-08.mjs
// Apply:
//   node data/attach-mixed-legacy-manuals-batch-67-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH =
  'reports/legacy-engine-doc-attachments-2026-08-12-batch-67-mixed-coverage-crossing.md'
const TMP_DIR = path.join(os.tmpdir(), 'legacy-mixed-docs-batch-67-2026-08')
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyMixedDocs/1.0; +https://engines.haifengmachinery.com)'

const SOURCES = {
  international361407:
    'https://peacefulcreek.com/product/international-d361-d407-dt361-dt407-diesel-engine-service-repair-manual-overhaul/',
  internationalDt429:
    'https://www.ihbookstore.com/ih-numbered-series-service-manuals?orderby=11&pagenumber=2',
  internationalNavistar:
    'https://qualityservicemanual.com/152/internationalnavistar-diesel-engines-workshop-repair-service-manual',
  waukeshaDirectory:
    'http://generator-info.com/Engine%20Manuals/Waukesha/',
  waukeshaF817gPdf:
    'http://generator-info.com/Engine%20Manuals/Waukesha/WAUKESHA%20O%26M%20F817G%201977.pdf',
  waukeshaF1197gPdf:
    'http://generator-info.com/Engine%20Manuals/Waukesha/WAUKESHA%20O%26M%206WAK%20F1197G%201978.pdf',
  mercedesOm352:
    'https://barringtondieselclub.co.za/mercedes/352.html',
  mercedesOm366:
    'https://mbmanuals.com/engines/om366eng.htm',
  mercedesOm401:
    'https://barringtondieselclub.co.za/mercedes/401-402-403-404.html',
  isuzu4b6b:
    'https://www.epcatalogs.com/isuzu-industrial-diesel-engine-4b-6b-series-workshop-manual-pdf/',
  manD2876:
    'https://www.manualslib.com/brand/man/engine.html',
}

const SOURCE_VALIDATIONS = [
  {
    key: 'international361407',
    url: SOURCES.international361407,
    fileName: 'peacefulcreek-international-361-407.html',
    requiredTokens: [
      'International D361 D407 Dt361 Dt407 Diesel Engine Service Repair Manual Overhaul',
      '361 407 DIESEL ENGINE SERIES',
      'Service/Repair/Overhaul Manual',
      'Complete Manual',
      'Troubleshoot, Repair and Overhaul',
    ],
  },
  {
    key: 'internationalDt429',
    url: SOURCES.internationalDt429,
    fileName: 'ihbookstore-dt429.html',
    requiredTokens: [
      'Service Manual for International DT-429 Engine and Fuel System',
      'GSS-1375-B',
      '142 pages',
    ],
  },
  {
    key: 'internationalNavistar',
    url: SOURCES.internationalNavistar,
    fileName: 'qualityservicemanual-international-navistar.html',
    requiredTokens: [
      'International/Navistar 200-, 300-, 400-, & 500- Series Engines Workshop Repair & Service Manual',
      'DTI466',
      'DTI466C',
      'DT530',
      'Complete digital official workshop manual',
      'Diesel Engines',
    ],
  },
  {
    key: 'waukeshaDirectory',
    url: SOURCES.waukeshaDirectory,
    fileName: 'generator-info-waukesha-directory.html',
    requiredTokens: [
      'WAUKESHA O&M F817G 1977.pdf',
      'WAUKESHA O&M 6WAK F1197G 1978.pdf',
      'WAUKESHA O&M WAKC F1197G .pdf',
    ],
  },
  {
    key: 'mercedesOm352',
    url: SOURCES.mercedesOm352,
    fileName: 'barrington-mercedes-om352.html',
    requiredTokens: [
      'Mercedes OM352 Manuals, Engine Specifications & Bolt Torques',
      'Mercedes OM352 Diesel Engine Workshop Repair Manuals',
      'Mercedes 352 362 engines workshop manual',
      'OM352 Essential Diesel Engine Bolt Tightening Torques',
    ],
  },
  {
    key: 'mercedesOm366',
    url: SOURCES.mercedesOm366,
    fileName: 'mbmanuals-mercedes-om366.html',
    requiredTokens: [
      'Mercedes OM366 Diesel Engine Manuals',
      'Download: Mercedes OM366 Engine Service Repair Manual',
      'OM366 Diesel Engines',
      'OM366A Turbo Diesel',
      'OM366LA Turbo Intercooled',
    ],
  },
  {
    key: 'mercedesOm401',
    url: SOURCES.mercedesOm401,
    fileName: 'barrington-mercedes-om400.html',
    requiredTokens: [
      'Mercedes Diesel Engine OM400 Series Manuals',
      'OM401 OM402LA Workshop manual',
      'OM401 OM402 OM441 OM444 Operator manual',
      'Mercedes OM401 OM402 OM403 OM404 Diesel Engine Specs',
    ],
  },
  {
    key: 'isuzu4b6b',
    url: SOURCES.isuzu4b6b,
    fileName: 'epcatalogs-isuzu-4b-6b.html',
    requiredTokens: [
      'Workshop Manual for Isuzu Industrial Diesel Engine 4B and 6B Series',
      '4BD1',
      '4BD1T',
      '6BB1',
      '6BD1',
      '6BD1T',
      '6BG1',
    ],
  },
  {
    key: 'manD2876',
    url: SOURCES.manD2876,
    fileName: 'manualslib-man-engine.html',
    requiredTokens: [
      'D 2876 LE 201',
      'D 2876 LE 202',
      'D 2876 LE 203',
      '17 pages Industrial Diesel Engines',
      'Repair manual',
      'Download 183 Man Engine PDF manuals',
    ],
  },
]

const DOCUMENTS = [
  {
    brand: 'International',
    key: 'international361407',
    label: 'International 361/407 Diesel Engine Service/Repair/Overhaul Manual Reference Page',
    storagePath: SOURCES.international361407,
    type: 'manual',
    models: ['D-361', 'D-407', 'DT-361', 'DT-407'],
  },
  {
    brand: 'International',
    key: 'internationalDt429',
    label: 'International DT-429 Engine and Fuel System Service Manual Reference Page',
    storagePath: SOURCES.internationalDt429,
    type: 'manual',
    models: ['DT-429'],
  },
  {
    brand: 'International',
    key: 'internationalNavistar',
    label: 'International/Navistar DTI466 and DTI466C Workshop Repair Manual Reference Page',
    storagePath: SOURCES.internationalNavistar,
    type: 'manual',
    models: ['DT530', 'DTI-466', 'DTI-466C'],
  },
  {
    brand: 'Waukesha',
    key: 'waukeshaDirectory',
    label: 'Waukesha F817G Operation & Maintenance Manual PDF',
    storagePath: SOURCES.waukeshaF817gPdf,
    type: 'manual',
    fileSizeBytes: 7184594,
    models: ['F817G'],
  },
  {
    brand: 'Waukesha',
    key: 'waukeshaDirectory',
    label: 'Waukesha 6WAK / F1197G Operation & Maintenance Manual PDF',
    storagePath: SOURCES.waukeshaF1197gPdf,
    type: 'manual',
    fileSizeBytes: 7160905,
    models: ['F1197G'],
  },
  {
    brand: 'Mercedes-Benz',
    key: 'mercedesOm352',
    label: 'Mercedes OM352 Workshop Repair Manuals and Technical Specs Reference Page',
    storagePath: SOURCES.mercedesOm352,
    type: 'manual',
    models: ['OM 352'],
  },
  {
    brand: 'Mercedes-Benz',
    key: 'mercedesOm366',
    label: 'Mercedes OM366 / OM366A / OM366LA Service Repair Manual Reference Page',
    storagePath: SOURCES.mercedesOm366,
    type: 'manual',
    models: ['OM 366 A', 'OM 366 LA'],
  },
  {
    brand: 'Mercedes-Benz',
    key: 'mercedesOm401',
    label: 'Mercedes OM400 Series OM401 Workshop/Operator Manual Reference Page',
    storagePath: SOURCES.mercedesOm401,
    type: 'manual',
    models: ['OM 401'],
  },
  {
    brand: 'Isuzu',
    key: 'isuzu4b6b',
    label: 'Isuzu Industrial Diesel Engine 4B / 6B Series Workshop Manual Reference Page',
    storagePath: SOURCES.isuzu4b6b,
    type: 'manual',
    models: ['4BD1', '4BD1T', '6BB1', '6BD1'],
  },
  {
    brand: 'MAN',
    key: 'manD2876',
    label: 'MAN D2876 LE201/LE202/LE203 Industrial Diesel Engine Repair Manual Reference Page',
    storagePath: SOURCES.manD2876,
    type: 'manual',
    models: ['D2876 LE201', 'D2876 LE202', 'D2876 LE203'],
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
  return String(value ?? '').replace(/&amp;/gi, '&').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function hasToken(text, token) {
  return normalize(text).includes(normalize(token))
}

function download(url, outputPath) {
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
    '120',
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

function verifyHtml({ key, url, fileName, requiredTokens }) {
  const localPath = path.join(TMP_DIR, fileName)
  download(url, localPath)
  const text = fs.readFileSync(localPath, 'utf8')
  const missing = requiredTokens.filter((token) => !hasToken(text, token))
  if (missing.length) throw new Error(`${url}: missing validation token(s): ${missing.join(', ')}`)
  return {
    key,
    localPath,
    fileSizeBytes: Buffer.byteLength(text, 'utf8'),
  }
}

async function fetchAllEngines(supabase) {
  const engines = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, brand, model, slug, status')
      .range(from, from + 999)
    if (error) throw error
    engines.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return engines
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

function buildReport({ linkedRows, skippedRows, missingTargets, afterCount, coverage }) {
  const targetCount = DOCUMENTS.reduce((sum, document) => sum + document.models.length, 0)
  return `# Legacy Engine Document Attachments - Batch 67 Mixed Coverage Crossing

Date: 2026-08-12

## Result

- Exact legacy targets reviewed: \`${targetCount}\`
- Manual/reference links ${APPLY ? 'inserted' : 'planned'}: \`${linkedRows.length}\`
- Links skipped as existing: \`${skippedRows.length}\`
- Missing/rejected targets: \`${missingTargets.length}\`
${afterCount == null ? '' : `- Engine count after attachments: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after attachments: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## Manual Attachments

| Brand | Model | Document | Source | Target slug |
| --- | --- | --- | --- | --- |
${linkedRows.map((row) => `| ${row.brand} | ${row.model} | ${row.label} | ${row.storagePath} | ${row.slug} |`).join('\n') || '| - | - | - | - | - |'}

## Existing Links Skipped

${skippedRows.map((row) => `- ${row.brand} ${row.model} (${row.slug}): ${row.label}`).join('\n') || '- None'}

## Missing/Rejected Targets

${missingTargets.map((row) => `- ${row.brand} ${row.model}: ${row.reason}`).join('\n') || '- None'}

## Validation Sources

${SOURCE_VALIDATIONS.map((source) => `- ${source.url}`).join('\n')}

## Evidence Notes

- International targets use exact manual pages for \`D361/D407/DT361/DT407\`, \`DT-429\`, and \`DT530/DTI466/DTI466C\`; no unlisted D/DT variants are inferred.
- Waukesha targets use a public generator-info directory that names the exact O&M PDF files for \`F817G\` and \`6WAK F1197G\`; database links point directly to those PDF files.
- Mercedes-Benz targets use OM352, OM366, and OM400/OM401 pages that explicitly name the manual families and model variants attached here.
- Isuzu targets use a 4B/6B industrial workshop manual page that explicitly lists \`4BD1\`, \`4BD1T\`, \`6BB1\`, and \`6BD1\`.
- MAN targets use a ManualsLib index that explicitly lists every D2876 model code attached in this batch.
`
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const verifiedFiles = Object.fromEntries(
  SOURCE_VALIDATIONS.map((source) => {
    const verified = verifyHtml(source)
    return [source.key, verified]
  }),
)

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: mixed exact legacy manual attachment batch`)

const engines = await fetchAllEngines(supabase)
const linkedRows = []
const skippedRows = []
const missingTargets = []

for (const document of DOCUMENTS) {
  for (const model of document.models) {
    const engine = engines.find(
      (row) => row.brand === document.brand && normalize(row.model) === normalize(model),
    )

    if (!engine) {
      missingTargets.push({ brand: document.brand, model, reason: 'No matching row exists.' })
      continue
    }

    if (engine.status !== 'discontinued') {
      missingTargets.push({
        brand: document.brand,
        model,
        reason: `Engine row exists but status is ${engine.status}.`,
      })
      continue
    }

    const { data: existingLinks, error: existingLinksError } = await supabase
      .from('engine_pdfs')
      .select('id')
      .eq('engine_id', engine.id)
      .eq('storage_path', document.storagePath)
    if (existingLinksError) throw existingLinksError

    const row = {
      brand: document.brand,
      model,
      slug: engine.slug,
      label: document.label,
      storagePath: document.storagePath,
    }

    if (existingLinks?.length) {
      skippedRows.push(row)
      continue
    }

    if (APPLY) {
      const { error: insertError } = await supabase.from('engine_pdfs').insert({
        engine_id: engine.id,
        type: document.type,
        label: document.label,
        storage_path: document.storagePath,
        file_size_bytes: document.fileSizeBytes ?? verifiedFiles[document.key].fileSizeBytes,
      })
      if (insertError) throw insertError
    }

    linkedRows.push(row)
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
    linkedRows,
    skippedRows,
    missingTargets,
    afterCount: APPLY ? afterCount : null,
    coverage: APPLY ? coverage : null,
  }),
)

console.log(`${APPLY ? 'Linked' : 'Planned'} manual/reference links: ${linkedRows.length}.`)
console.log(`Existing links skipped: ${skippedRows.length}.`)
console.log(`Missing/rejected targets: ${missingTargets.length}.`)
console.log(`Engine count is ${afterCount}.`)
console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
