// Add source-validated Volvo Penta legacy TWD industrial / genset models.
//
// Dry run:
//   set -a; source .env.local; node data/add-legacy-volvo-twd-industrial-batch-08-2026-08.mjs
// Apply:
//   set -a; source .env.local; node data/add-legacy-volvo-twd-industrial-batch-08-2026-08.mjs --apply

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const APPLY = process.argv.includes('--apply')
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const REPORT_PATH = 'reports/legacy-engine-model-discovery-2026-08-11-batch-08-volvo-twd.md'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const SOURCE_URLS = [
  'https://dhmecha.en.ec21.com/VOLVO_PENTA_DIESEL_ENGINE--27886_27893.html',
  'https://pdfcoffee.com/tad740-1032-1630-1631-amp-twd740-1210-1232-1630-pdf-free.html',
  'https://www.scribd.com/document/705062046/G330-DOOSAN-Ingersoll-Rand-1',
  'https://www.scribd.com/document/667034852/7734905',
  'https://manualzz.com/doc/6324077/volvo-penta-tad1240-ge--tad1241-ge-ve--tad1242-ge-ve--twd...',
  'https://manualzz.com/doc/o/8rrwe/volvo-penta-tad-1240ge--tad-1241ge-ve--tad-1242ge-ve--twd...-%3Cb%3Egeneral-information-%3C-b%3E',
  'https://sra-moteur.com/en/occasion/detail/65/twd1240ve',
]

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalize(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function hpToKw(hp) {
  return Math.round(hp * 0.7457)
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function volvoLegacy(row) {
  return clean({
    slug: `volvo-penta-${slugify(row.model)}`,
    brand: 'Volvo Penta',
    model: row.model,
    series: row.series,
    status: 'discontinued',
    origin: 'Sweden',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: row.emissions_standard,
    certifications: row.certifications ?? [],
    power_kw: row.power_kw,
    power_hp: row.power_hp,
    displacement_l: row.displacement_l,
    cylinders: row.cylinders ?? 6,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    compression_ratio: row.compression_ratio,
    weight_kg: row.weight_kg,
    prime_power_kw_50hz: row.prime_power_kw_50hz,
    standby_power_kw_50hz: row.standby_power_kw_50hz,
    prime_power_kw_60hz: row.prime_power_kw_60hz,
    standby_power_kw_60hz: row.standby_power_kw_60hz,
    description:
      `Volvo Penta ${row.model} discontinued legacy TWD industrial engine. ${row.detail} `
      + 'The model was added only after cross-checking online service-manual, instruction-book, parts, or generator-rating sources; no marine propulsion-only TWD rows are included in this batch.',
  })
}

function genset({ model, hp50Prime, hp50Standby, hp60Prime, hp60Standby, ...row }) {
  return volvoLegacy({
    model,
    series: row.series ?? 'Legacy TWD Genset',
    power_hp: Math.max(hp50Prime, hp50Standby, hp60Prime, hp60Standby),
    power_kw: hpToKw(Math.max(hp50Prime, hp50Standby, hp60Prime, hp60Standby)),
    rpm_rated: 1500,
    configuration: row.configuration ?? 'Inline-6, turbocharged water-cooled diesel generator engine',
    prime_power_kw_50hz: hpToKw(hp50Prime),
    standby_power_kw_50hz: hpToKw(hp50Standby),
    prime_power_kw_60hz: hpToKw(hp60Prime),
    standby_power_kw_60hz: hpToKw(hp60Standby),
    ...row,
  })
}

const RECORDS = [
  genset({
    model: 'TWD610G',
    hp50Prime: 158,
    hp50Standby: 202,
    hp60Prime: 177,
    hp60Standby: 194,
    detail: 'A 1998 Volvo Penta instruction-book source identifies TWD610G/P, and a generator-packager table gives 50 Hz and 60 Hz horsepower ratings for TWD610G.',
  }),
  genset({
    model: 'TWD710G',
    hp50Prime: 218,
    hp50Standby: 246,
    hp60Prime: 230,
    hp60Standby: 271,
    displacement_l: 6.73,
    weight_kg: 795,
    detail: 'Volvo Penta instruction-book/service-manual sources list TWD710G and the 6.73 L technical family; a generator-packager table gives 50 Hz and 60 Hz horsepower ratings.',
  }),
  genset({
    model: 'TWD740GE',
    hp50Prime: 253,
    hp50Standby: 277,
    hp60Prime: 292,
    hp60Standby: 321,
    displacement_l: 7.28,
    weight_kg: 795,
    detail: 'Volvo Penta instruction-book sources list TWD740GE/VE with 7.28 L displacement, while generator-set documentation and packager tables cross-check TWD740GE ratings.',
  }),
  genset({
    model: 'TWD1010G',
    hp50Prime: 277,
    hp50Standby: 309,
    hp60Prime: 314,
    hp60Standby: 355,
    detail: 'A legacy Volvo Penta generator-packager table lists TWD1010G with 50 Hz and 60 Hz standby/prime horsepower ratings.',
  }),
  genset({
    model: 'TWD1210G',
    hp50Prime: 365,
    hp50Standby: 400,
    hp60Prime: 385,
    hp60Standby: 426,
    displacement_l: 11.98,
    weight_kg: 1140,
    detail: 'Volvo Penta instruction-book sources list TWD1210G in the 11.98 L technical family, and a generator-packager table supplies 50 Hz and 60 Hz horsepower ratings.',
  }),
  genset({
    model: 'TWD1211G',
    hp50Prime: 392,
    hp50Standby: 427,
    hp60Prime: 423,
    hp60Standby: 464,
    displacement_l: 11.98,
    weight_kg: 1140,
    detail: 'Volvo Penta instruction-book sources list TWD1211G in the 11.98 L technical family, and a generator-packager table supplies 50 Hz and 60 Hz horsepower ratings.',
  }),
  genset({
    model: 'TWD1630G',
    hp50Prime: 488,
    hp50Standby: 541,
    hp60Prime: 532,
    hp60Standby: 605,
    displacement_l: 16.12,
    weight_kg: 1428,
    detail: 'Volvo Penta workshop/instruction-book sources list TWD1630G, and a legacy generator-packager table supplies the dual-frequency horsepower ratings.',
  }),
  genset({
    model: 'TWD1630GE',
    hp50Prime: 554,
    hp50Standby: 608,
    hp60Prime: 612,
    hp60Standby: 672,
    displacement_l: 16.12,
    weight_kg: 1428,
    detail: 'Volvo Penta workshop/instruction-book sources list TWD1630GE, and a legacy generator-packager table supplies the dual-frequency horsepower ratings.',
  }),
  volvoLegacy({
    model: 'TWD1240VE',
    series: 'Legacy TWD Industrial',
    power_kw: 310,
    power_hp: 421,
    displacement_l: 12.13,
    cylinders: 6,
    rpm_rated: 2100,
    compression_ratio: '18.5:1',
    weight_kg: 1270,
    configuration: 'Inline-6, turbocharged water-cooled EDC III industrial diesel',
    detail: 'Volvo Penta service-manual sources identify TWD1240VE with 12.13 L displacement, 6 cylinders, 131 mm bore, 150 mm stroke, and EDC III service coverage; a reconditioned-engine stock page cross-checks the 310 kW / 421 hp at 2100 rpm rating.',
  }),
]

async function fetchAllEngines() {
  const engines = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, brand, model, slug')
      .range(from, from + 999)
    if (error) throw error
    engines.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return engines
}

function buildReport({ existingCount, missing, afterCount }) {
  return `# Legacy Engine Model Discovery - Batch 08 Volvo TWD

Date: 2026-08-11

## Result

- Source-validated Volvo Penta legacy TWD candidates reviewed: \`${RECORDS.length}\`
- Already present before import: \`${existingCount}\`
- New rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Series | Power kW | 50 Hz Prime/Standby kWm | 60 Hz Prime/Standby kWm | Displacement L | RPM |
| --- | --- | --- | ---: | --- | --- | ---: | ---: |
${missing.map((row) =>
  `| ${row.brand} | ${row.model} | ${row.series} | ${row.power_kw ?? ''} | ${row.prime_power_kw_50hz ?? ''}/${row.standby_power_kw_50hz ?? ''} | ${row.prime_power_kw_60hz ?? ''}/${row.standby_power_kw_60hz ?? ''} | ${row.displacement_l ?? ''} | ${row.rpm_rated ?? ''} |`
).join('\n')}

## Validation Sources

${SOURCE_URLS.map((url) => `- ${url}`).join('\n')}

## Notes

- This batch is legacy industrial and generator-drive Volvo Penta TWD content only.
- Older generator horsepower values were converted to kWm with 1 hp = 0.7457 kW and rounded to the nearest kW.
- TWD1631GE is intentionally deferred: parts pages mention it, but I did not find enough model-specific rating/service-manual evidence to add it safely in this pass.
- No marine propulsion-only rows are included.
`
}

const existing = await fetchAllEngines()
const existingKeys = new Set(
  existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`),
)
const missing = RECORDS.filter(
  (record) => !existingKeys.has(`${record.brand}::${normalize(record.model)}`),
)

console.log(`Candidates: ${RECORDS.length}`)
console.log(`Already present: ${RECORDS.length - missing.length}`)
console.log(`Missing/new: ${missing.length}`)
for (const record of missing) console.log(`${record.brand}\t${record.model}\t${record.slug}`)

if (APPLY && missing.length) {
  const { data, error } = await supabase
    .from('engines')
    .upsert(missing, { onConflict: 'slug' })
    .select('id, brand, model, slug')
  if (error) throw error
  console.log(`Imported ${data.length} validated legacy Volvo TWD record(s).`)
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({
  existingCount: RECORDS.length - missing.length,
  missing,
  afterCount: APPLY ? afterCount : null,
}))

console.log(`Engine count is ${afterCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
