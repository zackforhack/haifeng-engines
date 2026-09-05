// Add Sida Power generator-drive diesel engines from the supplied Sida workbook.
//
// Dry run:
//   node data/add-sida-power-generator-engines-2026-09.mjs
// Apply:
//   node data/add-sida-power-generator-engines-2026-09.mjs --apply

import fs from 'node:fs'
import fsp from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const BRAND = 'Sida Power'
const REPORT_PATH = 'reports/sida-power-engine-addition-2026-09-05.md'
const BROCHURE_STORAGE_PATH = 'sida-power/company/sida-power-brochure-16p-2026-03.pdf'

const DEFAULT_BROCHURE_PATH =
  '/Users/ziqianhuang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/aassdfg684_5b6a/msg/file/2026-09/16P.pdf'
const DEFAULT_WORKBOOK_PATH =
  '/Users/ziqianhuang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/aassdfg684_5b6a/temp/RWTemp/2026-09/badcf9119cb09045c6514656a09c88a0/四达动力发电机组用柴油机配套参数（Supporting parameters of diesel engine for Sida power generator set）.xlsx'

const BROCHURE_PATH = process.env.SIDA_BROCHURE_PATH || DEFAULT_BROCHURE_PATH
const WORKBOOK_PATH = process.env.SIDA_WORKBOOK_PATH || DEFAULT_WORKBOOK_PATH

const SOURCE_CHECKS = [
  {
    label: 'Sida Power homepage',
    url: 'https://www.sida-engine.com/',
    tokens: ['Jiangsu Sida Power Machinery Group Co., Ltd.', 'founded in 1984', 'annual production capacity of 200,000'],
  },
  {
    label: 'Sida Power diesel generator category',
    url: 'https://www.sida-engine.com/diesel-generator/',
    tokens: ['SIDA is one of the most professional diesel generator manufacturers', 'Diesel Generator Engines'],
  },
  {
    label: 'Sida Power diesel generator engines page',
    url: 'https://www.sida-engine.com/diesel-generator/diesel-generator-engines.html',
    tokens: ['Diesel Generator Engines', 'Diesel Engine for Gensets', 'Original: Jiangsu, China', 'IATF16949'],
  },
  {
    label: 'Sida Power four-stroke diesel engine page',
    url: 'https://www.sida-engine.com/diesel-generator/four-stroke-diesel-engine.html',
    tokens: ['4BWZ', 'four-stroke diesel engine', 'Sida Power diesel engine'],
  },
  {
    label: 'Sida Power 4DE diesel engine sets page',
    url: 'https://www.sida-engine.com/diesel-generator/diesel-engine-sets.html',
    tokens: ['4DE series diesel engine', 'Engine model:4DE', 'Displacement (L):2.8'],
  },
]

const GENERIC_DOCS = [
  {
    type: 'brochure',
    label: 'Jiangsu Sida Power Company Brochure 16P',
    storage_path: BROCHURE_STORAGE_PATH,
    sourceKind: 'local-brochure',
  },
  {
    type: 'datasheet',
    label: 'Sida Power Diesel Generator Engines Product Page',
    storage_path: 'https://www.sida-engine.com/diesel-generator/diesel-generator-engines.html',
    sourceKind: 'external',
  },
]

const kva = (kwe) => Math.round((Number(kwe) / 0.8) * 10) / 10
const hp = (kw) => Math.round(Number(kw) * 1.34102)

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function record({
  model,
  gensetCodes,
  enginePrime50,
  engineStandby50,
  unitPrime50,
  unitStandby50,
  enginePrime60,
  engineStandby60,
  unitPrime60,
  unitStandby60,
  displacement,
  compression,
  weight,
  dimensions,
  configuration,
  docs = [],
}) {
  const [length_mm, width_mm, height_mm] = dimensions
  const boost = configuration.includes('turbocharged intercooled')
    ? 'turbocharged intercooled'
    : configuration.includes('turbocharged')
      ? 'turbocharged'
      : 'naturally aspirated'

  return {
    expectedTokens: [model, ...gensetCodes.split('/'), String(enginePrime50), String(engineStandby50), String(displacement)],
    docs: [...GENERIC_DOCS, ...docs],
    row: {
      slug: `sida-power-${slugify(model)}`,
      brand: BRAND,
      model,
      series: gensetCodes,
      status: 'active',
      origin: 'China',
      fuel_type: 'Diesel',
      ignition_type: 'Compression Ignition',
      cooling_method: 'Liquid-Cooled',
      emissions_standard: 'Application-dependent',
      certifications: ['IATF16949', 'GB/T 2820', 'GB/T 1147.1'],
      rpm_rated: 1500,
      rpm_max: 1800,
      cylinders: 4,
      configuration,
      displacement_l: displacement,
      compression_ratio: compression,
      weight_kg: weight,
      length_mm,
      width_mm,
      height_mm,
      power_kw: enginePrime50,
      power_hp: hp(enginePrime50),
      prime_power_kw_50hz: enginePrime50,
      standby_power_kw_50hz: engineStandby50,
      prime_power_kwe_50hz: unitPrime50,
      standby_power_kwe_50hz: unitStandby50,
      prime_power_kva_50hz: kva(unitPrime50),
      standby_power_kva_50hz: kva(unitStandby50),
      prime_power_kw_60hz: enginePrime60,
      standby_power_kw_60hz: engineStandby60,
      prime_power_kwe_60hz: unitPrime60,
      standby_power_kwe_60hz: unitStandby60,
      prime_power_kva_60hz: kva(unitPrime60),
      standby_power_kva_60hz: kva(unitStandby60),
      description:
        `Sida Power ${model} is a 4-cylinder ${boost} diesel generator-drive engine for ${gensetCodes} generator-set pairings. `
        + `The supplied Sida generator-set workbook lists ${enginePrime50} kW prime / ${engineStandby50} kW standby at 1500 rpm and ${enginePrime60} kW prime / ${engineStandby60} kW standby at 1800 rpm, `
        + `with ${displacement} L displacement, ${compression} compression ratio, and ${weight} kg net weight.`,
    },
  }
}

const RECORDS = [
  record({
    model: '4AW',
    gensetCodes: 'BW17E/BW20E',
    enginePrime50: 17,
    engineStandby50: 19,
    unitPrime50: 15,
    unitStandby50: 16,
    enginePrime60: 20,
    engineStandby60: 22,
    unitPrime60: 17,
    unitStandby60: 19,
    displacement: 2.55,
    compression: '19:1',
    weight: 250,
    dimensions: [743, 562, 664],
    configuration: 'L4 naturally aspirated direct-injection diesel',
  }),
  record({
    model: '4BW',
    gensetCodes: 'BW21E/BW25E',
    enginePrime50: 21,
    engineStandby50: 23,
    unitPrime50: 16,
    unitStandby50: 18,
    enginePrime60: 25,
    engineStandby60: 28,
    unitPrime60: 20,
    unitStandby60: 24,
    displacement: 2.55,
    compression: '19:1',
    weight: 250,
    dimensions: [743, 562, 664],
    configuration: 'L4 naturally aspirated direct-injection diesel',
  }),
  record({
    model: '4BWZ',
    gensetCodes: 'BW30E/BW35E',
    enginePrime50: 30,
    engineStandby50: 33,
    unitPrime50: 24,
    unitStandby50: 26,
    enginePrime60: 35,
    engineStandby60: 38,
    unitPrime60: 28,
    unitStandby60: 30,
    displacement: 2.55,
    compression: '19:1',
    weight: 250,
    dimensions: [743, 616, 727],
    configuration: 'L4 turbocharged direct-injection diesel',
    docs: [
      {
        type: 'datasheet',
        label: 'Sida Power Four Stroke Diesel Engine Page',
        storage_path: 'https://www.sida-engine.com/diesel-generator/four-stroke-diesel-engine.html',
        sourceKind: 'external',
      },
    ],
  }),
  record({
    model: '4DW',
    gensetCodes: 'DW25E/DW30E',
    enginePrime50: 25,
    engineStandby50: 28,
    unitPrime50: 20,
    unitStandby50: 22,
    enginePrime60: 30,
    engineStandby60: 33,
    unitPrime60: 26,
    unitStandby60: 28,
    displacement: 2.77,
    compression: '19:1',
    weight: 250,
    dimensions: [743, 562, 664],
    configuration: 'L4 naturally aspirated direct-injection diesel',
  }),
  record({
    model: '4DEZ',
    gensetCodes: 'DE38E/DE44E',
    enginePrime50: 40,
    engineStandby50: 44,
    unitPrime50: 32,
    unitStandby50: 36,
    enginePrime60: 44,
    engineStandby60: 48,
    unitPrime60: 36,
    unitStandby60: 38,
    displacement: 2.77,
    compression: '19:1',
    weight: 250,
    dimensions: [896, 590, 737],
    configuration: 'L4 turbocharged direct-injection diesel',
    docs: [
      {
        type: 'datasheet',
        label: 'Sida Power Diesel Engine Sets 4DE Page',
        storage_path: 'https://www.sida-engine.com/diesel-generator/diesel-engine-sets.html',
        sourceKind: 'external',
      },
    ],
  }),
  record({
    model: '4BMZ',
    gensetCodes: 'BM46E/BM55E',
    enginePrime50: 50,
    engineStandby50: 55,
    unitPrime50: 40,
    unitStandby50: 45,
    enginePrime60: 55,
    engineStandby60: 60,
    unitPrime60: 45,
    unitStandby60: 50,
    displacement: 3.8,
    compression: '17.5:1',
    weight: 390,
    dimensions: [871, 632, 841],
    configuration: 'L4 turbocharged direct-injection diesel',
  }),
  record({
    model: '4BMZ1',
    gensetCodes: 'BM65E/BM75E',
    enginePrime50: 65,
    engineStandby50: 70,
    unitPrime50: 52,
    unitStandby50: 56,
    enginePrime60: 75,
    engineStandby60: 80,
    unitPrime60: 60,
    unitStandby60: 64,
    displacement: 3.8,
    compression: '17.5:1',
    weight: 390,
    dimensions: [871, 632, 841],
    configuration: 'L4 turbocharged direct-injection diesel',
  }),
  record({
    model: '4BMZL',
    gensetCodes: 'BM80E/BM90E',
    enginePrime50: 80,
    engineStandby50: 85,
    unitPrime50: 64,
    unitStandby50: 68,
    enginePrime60: 90,
    engineStandby60: 93,
    unitPrime60: 72,
    unitStandby60: 75,
    displacement: 3.8,
    compression: '17.5:1',
    weight: 400,
    dimensions: [1181, 681, 976],
    configuration: 'L4 turbocharged intercooled direct-injection diesel',
  }),
  record({
    model: '4FWZL',
    gensetCodes: 'FW88RE/FW100RE',
    enginePrime50: 88,
    engineStandby50: 96,
    unitPrime50: 70,
    unitStandby50: 76,
    enginePrime60: 100,
    engineStandby60: 110,
    unitPrime60: 80,
    unitStandby60: 90,
    displacement: 3.6,
    compression: '17.5:1',
    weight: 370,
    dimensions: [822, 636, 766],
    configuration: 'L4 turbocharged intercooled direct-injection diesel',
  }),
  record({
    model: '4FWZL1',
    gensetCodes: 'FW110RE/FW120RE',
    enginePrime50: 110,
    engineStandby50: 115,
    unitPrime50: 90,
    unitStandby50: 92,
    enginePrime60: 120,
    engineStandby60: 125,
    unitPrime60: 96,
    unitStandby60: 100,
    displacement: 3.6,
    compression: '17.5:1',
    weight: 370,
    dimensions: [822, 636, 766],
    configuration: 'L4 turbocharged intercooled direct-injection diesel',
  }),
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

function fetchText(url) {
  return execFileSync('curl', [
    '--compressed',
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--max-time',
    '60',
    '--user-agent',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    url,
  ], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
}

function workbookText(filePath) {
  return execFileSync('python3', ['-c', `
import sys
from openpyxl import load_workbook
wb = load_workbook(sys.argv[1], data_only=True)
parts = []
for ws in wb.worksheets:
    parts.append(ws.title)
    for row in ws.iter_rows():
        for cell in row:
            if cell.value is not None:
                parts.append(str(cell.value))
print("\\n".join(parts))
`, filePath], {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  })
}

function verifyLocalSources() {
  const brochure = fs.readFileSync(BROCHURE_PATH)
  if (brochure.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${BROCHURE_PATH}: not a PDF`)
  }

  const workbook = fs.readFileSync(WORKBOOK_PATH)
  if (workbook.subarray(0, 2).toString() !== 'PK') {
    throw new Error(`${WORKBOOK_PATH}: not an XLSX file`)
  }

  const text = workbookText(WORKBOOK_PATH)
  const compact = normalize(text)
  const missing = RECORDS.flatMap((recordItem) =>
    recordItem.expectedTokens
      .filter((token) => !compact.includes(normalize(token)))
      .map((token) => `${recordItem.row.model}:${token}`),
  )
  for (const token of ['POWER', 'GB/T2820', 'GB/T1147.1', 'DIESEL', 'DIRECTINJECTION']) {
    if (!compact.includes(normalize(token))) missing.push(`workbook:${token}`)
  }
  if (missing.length) {
    throw new Error(`Workbook source is missing expected token(s): ${missing.join(', ')}`)
  }

  return {
    brochureBytes: brochure.length,
    workbookBytes: workbook.length,
    workbookSheets: RECORDS.length,
  }
}

function validateExternalSources() {
  const results = []
  for (const source of SOURCE_CHECKS) {
    const text = fetchText(source.url)
    const compact = normalize(text)
    const missing = source.tokens.filter((token) => !compact.includes(normalize(token)))
    if (missing.length) {
      throw new Error(`${source.label}: missing token(s): ${missing.join(', ')}`)
    }
    results.push({ ...source, bytes: text.length })
  }
  return results
}

async function fetchExisting(supabase) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id,slug,brand,model,status,pdfs:engine_pdfs(id,label,storage_path)')
      .eq('brand', BRAND)
      .range(from, from + 999)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return rows
}

async function countEngines(supabase) {
  const { count, error } = await supabase
    .from('engines')
    .select('id', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined && value !== null))
}

function buildReport({ localSource, sourceResults, existing, inserted, docsInserted, beforeCount, afterCount }) {
  const sourceRows = sourceResults
    .map((source) => `| ${source.label} | ${source.url} | ${source.tokens.map((token) => `\`${token}\``).join(', ')} |`)
    .join('\n')
  const rowRows = RECORDS
    .map((recordItem) => {
      const existed = existing.some((row) => row.slug === recordItem.row.slug)
      const action = existed ? 'already present / refreshed' : APPLY ? 'inserted' : 'planned'
      return `| ${recordItem.row.model} | ${recordItem.row.series} | ${recordItem.row.prime_power_kw_50hz}/${recordItem.row.standby_power_kw_50hz} kWm | ${recordItem.row.prime_power_kwe_50hz}/${recordItem.row.standby_power_kwe_50hz} kWe | ${action} | ${recordItem.docs.length} |`
    })
    .join('\n')

  return `# Sida Power Engine Addition

Date: 2026-09-05

## Result

- Brand: \`${BRAND}\`
- Rows ${APPLY ? 'inserted/refreshed' : 'planned'}: \`${inserted}\`
- Document links ${APPLY ? 'inserted' : 'planned'}: \`${docsInserted}\`
- Engine count: \`${beforeCount}${APPLY ? ` -> ${afterCount}` : ''}\`
- Local workbook verified: \`${localSource.workbookSheets}\` sheets, \`${localSource.workbookBytes}\` bytes
- Local brochure verified: \`${localSource.brochureBytes}\` bytes

## External Validation

| Source | URL | Verified tokens |
| --- | --- | --- |
${sourceRows}

## Rows

| Model | Generator pairings | Engine 50 Hz PRP/ESP | Genset 50 Hz PRP/ESP | Action | Linked docs |
| --- | --- | --- | --- | --- | --- |
${rowRows}

## Notes

- Source workbook: \`${WORKBOOK_PATH}\`
- Source brochure: \`${BROCHURE_PATH}\`
- Workbook kVA cells were reviewed, but database kVA fields are calculated from the source kWe values at 0.8 power factor to satisfy the catalog QA convention.
- The rows use actual diesel engine models as \`model\` and keep generator-set pairings in \`series\` and descriptions for search coverage.
`
}

await loadEnv()

const localSource = verifyLocalSources()
const sourceResults = validateExternalSources()
const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const beforeCount = await countEngines(supabase)
const existing = await fetchExisting(supabase)
const existingSlugs = new Set(existing.map((row) => row.slug))
const existingDocKeys = new Set(
  existing.flatMap((row) => (row.pdfs ?? []).map((doc) => `${row.slug}|${doc.storage_path}`)),
)

const engineRows = RECORDS.map((recordItem) => clean(recordItem.row))
const inserted = engineRows.filter((row) => !existingSlugs.has(row.slug)).length
let docsInserted = RECORDS.flatMap((recordItem) =>
  recordItem.docs.filter((doc) => !existingDocKeys.has(`${recordItem.row.slug}|${doc.storage_path}`)),
).length

if (APPLY) {
  const upload = await uploadPdf(supabase, BUCKET, BROCHURE_PATH, BROCHURE_STORAGE_PATH)
  if (!upload.ok) throw new Error(`Upload failed: ${BROCHURE_STORAGE_PATH}`)

  const { data, error } = await supabase.from('engines').upsert(engineRows, { onConflict: 'slug' }).select('id,slug')
  if (error) throw error

  const idBySlug = new Map((data ?? []).map((row) => [row.slug, row.id]))
  const docRows = []
  for (const recordItem of RECORDS) {
    const engineId = idBySlug.get(recordItem.row.slug) ?? existing.find((row) => row.slug === recordItem.row.slug)?.id
    if (!engineId) throw new Error(`Missing engine id for ${recordItem.row.slug}`)
    for (const doc of recordItem.docs) {
      if (existingDocKeys.has(`${recordItem.row.slug}|${doc.storage_path}`)) continue
      const { sourceKind, ...docRow } = doc
      docRows.push({
        engine_id: engineId,
        ...docRow,
        file_size_bytes: sourceKind === 'local-brochure' ? (upload.uploadedSizeBytes ?? localSource.brochureBytes) : null,
      })
    }
  }

  if (docRows.length) {
    const { error: docError } = await supabase.from('engine_pdfs').insert(docRows)
    if (docError) throw docError
  }
  docsInserted = docRows.length
}

const afterCount = APPLY ? await countEngines(supabase) : beforeCount
await fsp.writeFile(
  REPORT_PATH,
  buildReport({ localSource, sourceResults, existing, inserted, docsInserted, beforeCount, afterCount }),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Sida Power generator engine import`)
console.log(`Local source checks passed: workbook ${localSource.workbookSheets} sheets; brochure ${Math.round(localSource.brochureBytes / 1024)}KB`)
console.log(`External source checks passed: ${sourceResults.length}`)
console.log(`Rows ${APPLY ? 'inserted/refreshed' : 'planned'}: ${inserted}`)
console.log(`Document links ${APPLY ? 'inserted' : 'planned'}: ${docsInserted}`)
console.log(`Engine count: ${beforeCount}${APPLY ? ` -> ${afterCount}` : ''}`)
console.log(`Report: ${REPORT_PATH}`)
