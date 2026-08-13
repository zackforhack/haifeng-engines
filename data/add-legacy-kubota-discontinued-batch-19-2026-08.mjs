// Add source-validated Kubota discontinued small industrial engine models.
//
// Dry run:
//   set -a; source .env.local; node data/add-legacy-kubota-discontinued-batch-19-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/add-legacy-kubota-discontinued-batch-19-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-19-kubota-discontinued.md'

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

function loadEnv() {
  for (const envFile of ['.env.local', '.env']) {
    try {
      parseEnvFile(fs.readFileSync(envFile, 'utf8'))
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

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalize(value) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function kubota(row) {
  const fuelType = row.fuel_type ?? 'Diesel'
  return clean({
    slug: `kubota-${slugify(row.model)}`,
    brand: 'Kubota',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    origin: 'Japan',
    fuel_type: fuelType,
    ignition_type: fuelType === 'Diesel' ? 'Compression Ignition' : 'Spark Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: row.emissions_standard ?? 'Legacy pre-current industrial emissions',
    certifications: row.certifications ?? [],
    power_kw: row.power_kw,
    power_hp: row.power_hp,
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    description: row.description,
  })
}

const SOURCES = [
  {
    label: 'Kubota Genuine Parts Catalog distributor revision',
    url: 'https://www.scribd.com/document/853905131/Kubota-Kits-Juntas-Pistones-etc-Genuine-Parts-Catalog-Distributor-Rev-May-2010-1',
  },
  {
    label: 'Kubota Engine Parts Direct manuals index',
    url: 'https://kubotaenginepartsdirect.com/manuals/',
  },
  {
    label: 'GCIRON Kubota Z400/D600/V800 operator manual listing',
    url: 'https://www.gciron.com/Kubota_Parts_KU_19461_89163_OPR_MNL_Z400_D600_V800_p/ku-19461-89163.htm',
  },
]

const RECORDS = [
  kubota({
    model: 'Z400',
    series: 'Old Super Mini Series',
    displacement_l: 0.4,
    cylinders: 2,
    configuration: 'Inline-2, indirect-injection industrial diesel',
    description:
      'Kubota Z400 discontinued old Super Mini industrial diesel. Kubota Genuine Parts Catalog lists Z400 in non-current Super Mini production and the manual guide covers Z400-B; Kubota Engine Parts Direct also lists Z400 under Discontinued Engine Series manuals.',
  }),
  kubota({
    model: 'Z430',
    series: 'Old Super Mini Series',
    displacement_l: 0.43,
    cylinders: 2,
    configuration: 'Inline-2, indirect-injection industrial diesel',
    description:
      'Kubota Z430 discontinued old Super Mini industrial diesel. Kubota manual-guide sources group Z430-B with Z400/D600/V800 operator manuals, and Kubota Engine Parts Direct lists Z430 under Discontinued Engine Series.',
  }),
  kubota({
    model: 'Z500',
    series: 'Old Super Mini Series',
    displacement_l: 0.5,
    cylinders: 2,
    configuration: 'Inline-2, indirect-injection industrial diesel',
    description:
      'Kubota Z500 discontinued old Super Mini industrial diesel. Kubota Genuine Parts Catalog lists 500 in non-current Super Mini production and the manual guide identifies the Z500-B cover; Kubota Engine Parts Direct lists Z500 under Discontinued Engine Series.',
  }),
  kubota({
    model: 'Z600',
    series: 'Old Super Mini Series',
    displacement_l: 0.6,
    cylinders: 2,
    configuration: 'Inline-2, indirect-injection industrial diesel',
    description:
      'Kubota Z600 discontinued old Super Mini industrial diesel. Kubota Genuine Parts Catalog lists 600 in non-current Super Mini production, including Z600/Z600BG guide rows, and Kubota Engine Parts Direct lists Z600 under Discontinued Engine Series.',
  }),
  kubota({
    model: 'ZH600',
    series: 'Old Super Mini Series',
    displacement_l: 0.6,
    cylinders: 2,
    configuration: 'Inline-2, indirect-injection industrial diesel',
    description:
      'Kubota ZH600 discontinued old Super Mini industrial diesel. Kubota manual-guide sources list ZH600-B with the Z500-D950 operator manual set, and Kubota Engine Parts Direct lists ZH600 under Discontinued Engine Series.',
  }),
  kubota({
    model: 'D600',
    series: 'Old Super Mini Series',
    displacement_l: 0.6,
    cylinders: 3,
    configuration: 'Inline-3, indirect-injection industrial diesel',
    description:
      'Kubota D600 discontinued old Super Mini industrial diesel. Kubota manual-guide sources group D600-B with Z400/D600/V800 operator manuals, and Kubota Engine Parts Direct lists D600 under Discontinued Engine Series.',
  }),
  kubota({
    model: 'D640',
    series: 'Old Super Mini Series',
    displacement_l: 0.64,
    cylinders: 3,
    configuration: 'Inline-3, indirect-injection industrial diesel',
    description:
      'Kubota D640 discontinued old Super Mini industrial diesel. Kubota manual-guide and old Super Mini parts rows identify D640-B, and Kubota Engine Parts Direct lists D640 under Discontinued Engine Series.',
  }),
  kubota({
    model: 'D650',
    series: 'Old Super Mini Series',
    displacement_l: 0.65,
    cylinders: 3,
    configuration: 'Inline-3, indirect-injection industrial diesel',
    description:
      'Kubota D650 discontinued old Super Mini industrial diesel. Kubota Genuine Parts Catalog lists D650 in non-current Super Mini production and the manual guide identifies D650-B in the Z500-D950 operator manual family.',
  }),
  kubota({
    model: 'D750',
    series: 'Old Super Mini Series',
    displacement_l: 0.75,
    cylinders: 3,
    configuration: 'Inline-3, indirect-injection industrial diesel',
    description:
      'Kubota D750 discontinued old Super Mini industrial diesel. Kubota Genuine Parts Catalog lists 750 in non-current Super Mini production and the manual guide identifies D750-B in the Z500-D950 operator manual family.',
  }),
  kubota({
    model: 'D850',
    series: 'Old Super Mini Series',
    displacement_l: 0.85,
    cylinders: 3,
    configuration: 'Inline-3, indirect-injection industrial diesel',
    description:
      'Kubota D850 discontinued old Super Mini industrial diesel. Kubota Genuine Parts Catalog lists 850 in non-current Super Mini production and the manual guide identifies D850-B and D850BG rows.',
  }),
  kubota({
    model: 'DH850',
    series: 'Old Super Mini Series',
    displacement_l: 0.85,
    cylinders: 3,
    configuration: 'Inline-3, indirect-injection industrial diesel',
    description:
      'Kubota DH850 discontinued old Super Mini industrial diesel. Kubota manual-guide rows place DH850 in the Z500-D950 operator manual family, and Kubota Engine Parts Direct lists DH850 under Discontinued Engine Series.',
  }),
  kubota({
    model: 'D950',
    series: 'Old Super Mini Series',
    displacement_l: 0.95,
    cylinders: 3,
    configuration: 'Inline-3, indirect-injection industrial diesel',
    description:
      'Kubota D950 discontinued old Super Mini industrial diesel. Kubota Genuine Parts Catalog lists 950 in non-current Super Mini production and the manual guide identifies D950-B in the Z500-D950 operator manual family.',
  }),
  kubota({
    model: 'V800',
    series: 'Old Super Mini Series',
    displacement_l: 0.8,
    cylinders: 4,
    configuration: 'Inline-4, indirect-injection industrial diesel',
    description:
      'Kubota V800 discontinued old Super Mini industrial diesel. Kubota manual-guide sources group V800-B with Z400/D600/V800 operator manuals, and Kubota Engine Parts Direct lists V800 under Discontinued Engine Series.',
  }),
  kubota({
    model: 'V1100',
    series: 'Old Super Mini Series',
    displacement_l: 1.1,
    cylinders: 4,
    configuration: 'Inline-4, indirect-injection industrial diesel',
    description:
      'Kubota V1100 discontinued old Super Mini industrial diesel. Kubota Engine Parts Direct lists V1100 under Discontinued Engine Series and Kubota catalog filter/gasket rows group it with old Super Mini engines.',
  }),
  kubota({
    model: 'VH1100',
    series: 'Old Super Mini Series',
    displacement_l: 1.1,
    cylinders: 4,
    configuration: 'Inline-4, indirect-injection industrial diesel',
    description:
      'Kubota VH1100 discontinued old Super Mini industrial diesel. Kubota Engine Parts Direct lists VH1100 under Discontinued Engine Series and Kubota catalog filter/gasket rows group it with old Super Mini engines.',
  }),
  kubota({
    model: 'V1200',
    series: 'Old Super Mini Series',
    displacement_l: 1.2,
    cylinders: 4,
    configuration: 'Inline-4, indirect-injection industrial diesel',
    description:
      'Kubota V1200 discontinued old Super Mini industrial diesel. Kubota Engine Parts Direct lists V1200 under Discontinued Engine Series and Kubota catalog filter/gasket rows group it with old Super Mini engines.',
  }),
  kubota({
    model: 'WG600',
    series: 'Legacy WG Gas Series',
    fuel_type: 'Gasoline',
    displacement_l: 0.6,
    cylinders: 3,
    configuration: 'Inline-3, spark-ignited gasoline industrial engine',
    description:
      'Kubota WG600 discontinued legacy spark-ignited industrial engine. Kubota Genuine Parts Catalog lists WG600 in the WG/DF manual and filters sections, and Kubota Engine Parts Direct lists WG600 under Discontinued Engine Series.',
  }),
  kubota({
    model: 'WG750',
    series: 'Legacy WG Gas Series',
    fuel_type: 'Gasoline',
    displacement_l: 0.75,
    cylinders: 3,
    configuration: 'Inline-3, spark-ignited gasoline industrial engine',
    description:
      'Kubota WG750 discontinued legacy spark-ignited industrial engine. Kubota Genuine Parts Catalog lists WG750-B and WG750-E manual rows and Kubota Engine Parts Direct lists WG750 under Discontinued Engine Series.',
  }),
  kubota({
    model: 'DF750',
    series: 'Legacy DF Gas Series',
    fuel_type: 'Gasoline / Propane (LPG)',
    displacement_l: 0.75,
    cylinders: 3,
    configuration: 'Inline-3, spark-ignited dual-fuel industrial engine',
    description:
      'Kubota DF750 discontinued legacy spark-ignited dual-fuel industrial engine. Kubota Genuine Parts Catalog lists DF750 in the WG/DF gas-engine model table and Kubota Engine Parts Direct lists DF750 under Discontinued Engine Series.',
  }),
  kubota({
    model: 'DG750',
    series: 'Legacy DG LPG Series',
    fuel_type: 'Propane (LPG)',
    displacement_l: 0.75,
    cylinders: 3,
    configuration: 'Inline-3, spark-ignited LPG industrial engine',
    description:
      'Kubota DG750 discontinued legacy LPG industrial engine. Kubota Genuine Parts Catalog lists DG750-LPG with a discontinued operator manual note, and Kubota Engine Parts Direct lists DG750 under Discontinued Engine Series.',
  }),
]

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
  return {
    legacyCount: legacyRows.length,
    legacyWithPdf: legacyRows.filter((engine) => (engine.pdfs ?? []).length > 0).length,
  }
}

function buildReport({ existingCount, missing, afterCount, coverage }) {
  return `# Legacy Engine Model Discovery - Batch 19 Kubota Discontinued

Date: 2026-08-11

## Result

- Source-validated Kubota discontinued candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}${coverage == null ? '' : `- Legacy PDF/manual coverage after import: \`${coverage.legacyWithPdf}/${coverage.legacyCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Status | Fuel | Cyl | Displacement L |
| --- | --- | --- | --- | --- | ---: | ---: |
${missing.map((row) =>
  `| ${row.brand} | ${row.model} | ${row.series} | ${row.status} | ${row.fuel_type ?? ''} | ${row.cylinders ?? ''} | ${row.displacement_l ?? ''} |`
).join('\n')}

## Validation Sources

${SOURCES.map((source) => `- ${source.label}: ${source.url}`).join('\n')}

## Notes

- This batch is limited to Kubota models with explicit non-current or discontinued source evidence.
- Kubota Genuine Parts Catalog separates current production from non-current production and defines Z/D/V cylinder-code logic; it also lists WG/DF/DG manual and parts-index rows.
- Kubota Engine Parts Direct explicitly labels the imported base models as Discontinued Engine Series.
- No proprietary Kubota manual PDFs are attached or redistributed in this batch; the report links source pages only.
- Fuel naming follows the project canonical vocabulary: LPG-facing rows use \`Propane (LPG)\`.
`
}

loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: Kubota discontinued legacy batch`)

const existing = await fetchAllEngines(supabase)
const existingKeys = new Set(
  existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`),
)
const missing = RECORDS.filter(
  (engine) => !existingKeys.has(`${engine.brand}::${normalize(engine.model)}`),
)

console.log(`Candidates: ${RECORDS.length}`)
console.log(`Already present: ${RECORDS.length - missing.length}`)
console.log(`Missing/new: ${missing.length}`)
for (const engine of missing) console.log(`${engine.brand}\t${engine.model}\t${engine.slug}`)

if (APPLY && missing.length) {
  const { data, error } = await supabase
    .from('engines')
    .upsert(missing, { onConflict: 'slug' })
    .select('id, brand, model, slug')
  if (error) throw error
  console.log(`Imported ${data.length} validated Kubota discontinued record(s).`)
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const coverage = APPLY ? await countLegacyCoverage(supabase) : null

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({
  existingCount: RECORDS.length - missing.length,
  missing,
  afterCount: APPLY ? afterCount : null,
  coverage,
}))

console.log(`Engine count is ${afterCount}.`)
if (coverage) {
  console.log(`Legacy rows with PDFs/manuals: ${coverage.legacyWithPdf}/${coverage.legacyCount}.`)
}
console.log(`Wrote ${REPORT_PATH}`)
