import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const PAGE_SIZE = 1000

const TECHNICAL_DOCUMENT_PATHS = new Set([
  'sdec/brochures/shanghai-diesel-upto-1000kwe.pdf',
  'vman/vman-diesel-engine-catalog-2026.pdf',
  'lister-petter/guides/g-drive-engine-range-guide-v2509.pdf',
  'yunnei/brochures/yunnei-powergen-catalog.pdf',
  'googol/googol-engine-catalog-2026.pdf',
  'weichai/brochures/wp-series-gdrive-catalog.pdf',
  'xinchai/xinchai-engine-catalog-2026.pdf',
  'yanmar/tnv-series-brochure.pdf',
  'guascor/guascor-gas-engine-catalog-2023.pdf',
  'man/man-power-gas-engines-2025.pdf',
  'isuzu/spec-sheets/isuzu-engines-and-power-units-product-line-up-brochure-2026-web.pdf',
  'fpt/brochures/g-drive-powergen-lineup-2025.pdf',
  'hyundai/hce-engine-brochure-2025.pdf',
  'mwm/mwm-gas-engine-catalog-2023.pdf',
  'push/push-gas-genset-brochure.pdf',
  'fawde/brochures/fawde-genset-engine-catalog.pdf',
  'kohler/brochures/kd-series.pdf',
  'liyu-power/liyu-power-brochure-2024.pdf',
  'lovol/lovol-1000-series-handbook.pdf',
  'vman/vman-gas-genset-catalog-2026.pdf',
  'mitsubishi/gas/mhi-gas-engine-lineup.pdf',
  'caterpillar/brochures/electric-power-ratings-guide.pdf',
  'scania/scania-power-gen-handbook-2025.pdf',
  'hyundai/hce-dx-series-power-generation.pdf',
  'kirloskar/brochures/r1040-series.pdf',
  'daihatsu/brochures/marine-gensets-catalog.pdf',
  'ford/ford-msg425-spec-sheet.pdf',
  'waukesha/waukesha-vhp-series-five-brochure.pdf',
  'fpt/f34-stage-v-tier-4-final-g-drive-portfolio.pdf',
  'mitsubishi/brochures/power-generation-engines.pdf',
  'kubota/brochures/kubota-bg-engine-catalog.pdf',
  'man/brochures/man-power-diesel.pdf',
  'liebherr/brochures/diesel-engines-construction-industry.pdf',
  'vm-motori/vm-motori-high-performance-diesel-brochure.pdf',
  'mahindra/brochures/powerol-10-650kva.pdf',
  'wartsila/wartsila-34sg-leaflet.pdf',
  'psi/brochures/power-systems-product-brochure-y24.pdf',
  'kohler/brochures/kdi-power-pack.pdf',
  'detroit-diesel/spec-sheets/v71-catalog-1977.pdf',
  'liebherr/brochures/diesel-engines-genset.pdf',
  'niigata/niigata-engine-selection-guide.pdf',
  'mtu/brochures/series-1600-gendrive.pdf',
  'bergen/bergen-b3645v-gas-spec.pdf',
  'mesa/mesa-gv22pu-spec-sheet.pdf',
  'ashok-leyland/brochures/power-solutions.pdf',
  'psi/psi-power-systems-brochure-2024.pdf',
  'vman/vman-sustainable-gas-methanol-catalog-2026.pdf',
  'kawasaki/kawasaki-green-gas-engine-leaflet.pdf',
  'fpt/brochures/on-road-engine-range-2020.pdf',
  'yanmar/brochures/yanmar-industrial-engine-product-guide.pdf',
  'cummins/brochures/chongqing-cummins-gas-engine-2024.pdf',
  'cummins/brochures/qsk60g-gas-generator-series.pdf',
  'cummins/brochures/qsf2.8-tier-4-final.pdf',
  'cat/c32b-generator-application-brochure.pdf',
  'caterpillar/c32b-generator-application-brochure.pdf',
  'isuzu/spec-sheets/4hk1xbrochure.pdf',
  'isuzu/spec-sheets/isuzu-4jg1t-lit-sheet.pdf',
  'isuzu/spec-sheets/isuzu-4bg1t-lit-sheet.pdf',
  'isuzu/spec-sheets/isuzu-redtech-6hk1x-genset-ready-power-units.pdf',
  'isuzu/spec-sheets/isuzu-4jj1x-brochure.pdf',
  'detroit-diesel/spec-sheets/series-60-14l.pdf',
  'detroit-diesel/spec-sheets/8v-92ta.pdf',
  'detroit-diesel/spec-sheets/149-series-brochure.pdf',
  'detroit-diesel/spec-sheets/series-60-power.pdf',
  'kirloskar/brochures/koel-green-750-1500kva.pdf',
])

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

async function loadLocalEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      parseEnvFile(await fs.readFile(path.join(process.cwd(), file), 'utf8'))
    } catch {
      // Local env files are optional in CI.
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

async function fetchAll(supabase, table, select) {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) return rows
  }
}

function pct(value, total) {
  return total ? ((value / total) * 100).toFixed(1) : '0.0'
}

await loadLocalEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  requireEnv('SUPABASE_SERVICE_KEY'),
)

const [engines, documents] = await Promise.all([
  fetchAll(supabase, 'engines', 'id, brand, model, slug'),
  fetchAll(
    supabase,
    'engine_pdfs',
    'engine_id, type, label, storage_path, file_size_bytes',
  ),
])

const engineById = new Map(engines.map((engine) => [engine.id, engine]))
const datasheetEngineIds = new Set(
  documents
    .filter((document) => document.type === 'datasheet')
    .map((document) => document.engine_id),
)
const existingDatasheetLinks = new Set(
  documents
    .filter((document) => document.type === 'datasheet')
    .map((document) => `${document.engine_id}\0${document.storage_path}`),
)

const inserts = []
const byPath = new Map()

for (const document of documents) {
  if (document.type === 'datasheet') continue
  if (!TECHNICAL_DOCUMENT_PATHS.has(document.storage_path)) continue
  if (datasheetEngineIds.has(document.engine_id)) continue

  const linkKey = `${document.engine_id}\0${document.storage_path}`
  if (existingDatasheetLinks.has(linkKey)) continue

  const row = {
    engine_id: document.engine_id,
    type: 'datasheet',
    label: document.label,
    storage_path: document.storage_path,
    file_size_bytes: document.file_size_bytes,
  }
  inserts.push(row)

  const group = byPath.get(document.storage_path) ?? {
    label: document.label,
    count: 0,
    brands: new Map(),
    samples: [],
  }
  group.count += 1
  const engine = engineById.get(document.engine_id)
  if (engine) {
    group.brands.set(engine.brand, (group.brands.get(engine.brand) ?? 0) + 1)
    if (group.samples.length < 5) {
      group.samples.push(`${engine.brand} ${engine.model} (${engine.slug})`)
    }
  }
  byPath.set(document.storage_path, group)
}

const current = datasheetEngineIds.size
const projected = current + new Set(inserts.map((row) => row.engine_id)).size
console.log(
  `${APPLY ? 'Applying' : 'Dry run:'} ${inserts.length} datasheet link(s) `
    + `across ${byPath.size} technical document file(s).`,
)
console.log(
  `Coverage: ${current}/${engines.length} (${pct(current, engines.length)}%) `
    + `-> ${projected}/${engines.length} (${pct(projected, engines.length)}%).`,
)

for (const [storagePath, group] of [...byPath].sort(
  (a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]),
)) {
  const brands = [...group.brands]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([brand, count]) => `${brand}:${count}`)
    .join(', ')
  console.log(`\n${group.count} | ${group.label}`)
  console.log(`  ${storagePath}`)
  console.log(`  ${brands}`)
  console.log(`  sample: ${group.samples.join('; ')}`)
}

if (!APPLY || inserts.length === 0) process.exit(0)

for (let offset = 0; offset < inserts.length; offset += 500) {
  const batch = inserts.slice(offset, offset + 500)
  const { error } = await supabase.from('engine_pdfs').insert(batch)
  if (error) throw new Error(`engine_pdfs insert: ${error.message}`)
}

console.log(`\nInserted ${inserts.length} datasheet link(s).`)
