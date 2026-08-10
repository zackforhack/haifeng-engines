// Import validated GenProBase Mitsubishi delta found after the 2026-08-05 probe.
//
// Dry run:
//   set -a; source .env.local; node data/add-genprobase-mitsubishi-delta-2026-08-10.mjs
// Apply:
//   set -a; source .env.local; node data/add-genprobase-mitsubishi-delta-2026-08-10.mjs --apply

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const APPLY = process.argv.includes('--apply')
const REPORT_PATH = 'reports/genprobase-mitsubishi-delta-2026-08-10.md'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalize(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function kwToHp(kw) {
  return Math.round((kw / 0.7457) * 10) / 10
}

function mitsubishi(row) {
  const slug = `mitsubishi-${slugify(row.model)}`
  return {
    slug,
    brand: 'Mitsubishi',
    model: row.model,
    series: row.model.startsWith('S12R') ? 'S12R Series' : 'S16R Series',
    status: 'active',
    origin: 'Japan',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: 'Unregulated',
    certifications: [],
    power_kw: row.prime_kwm,
    power_hp: kwToHp(row.prime_kwm),
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: `V${row.cylinders}, turbocharged aftercooled generator-drive diesel`,
    rpm_rated: 1500,
    prime_power_kw_50hz: row.prime_kwm,
    prime_power_kwe_50hz: row.prime_kwe,
    standby_power_kw_50hz: row.standby_kwm,
    standby_power_kwe_50hz: row.standby_kwe,
    description:
      `Mitsubishi ${row.model} generator-drive diesel engine discovered in the GenProBase public selector `
      + `and cross-validated against Mitsubishi Heavy Industries Engine System Asia generator-set product data. `
      + `GenProBase lists this 50 Hz model at ${row.prime_kwe} kWe prime and ${row.standby_kwe} kWe standby, `
      + `${row.displacement_l} L displacement, V${row.cylinders} layout, 1500 rpm speed, liquid cooling, `
      + `turbocharged aftercooled aspiration, and unregulated emissions labeling. Official validation page: ${row.validationUrl}`,
  }
}

const RECORDS = [
  mitsubishi({
    model: 'S12R-PTA3',
    prime_kwm: 1261,
    prime_kwe: 1200,
    standby_kwm: 1391,
    standby_kwe: 1300,
    displacement_l: 49.03,
    cylinders: 12,
    validationUrl:
      'https://www.mhi.com/group/mhiesa/products/diesel-generator-sets/diesel-generator-sets-mgs1700r-2',
  }),
  mitsubishi({
    model: 'S16R-PTA3',
    prime_kwm: 1712,
    prime_kwe: 1600,
    standby_kwm: 1887,
    standby_kwe: 1800,
    displacement_l: 65.37,
    cylinders: 16,
    validationUrl:
      'https://www.mhi.com/group/mhiesa/diesel-generator-480v-60hz-standby-3',
  }),
]

const HELD = [
  {
    brand: 'Mitsubishi',
    model: 'S16R-PTAA2-Y1',
    reason:
      'GenProBase lists the model, but public validation found stronger evidence for the related S16R-Y1PTAA2 naming family than for this exact hyphenation. Hold until OEM or distributor evidence confirms the exact model string.',
  },
]

async function fetchExisting() {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('brand, model, slug')
      .range(from, from + 999)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return rows
}

function buildReport({ existing, missing, afterCount }) {
  return `# GenProBase Mitsubishi Delta

Date: 2026-08-10

Source: https://genprobase.com/api/products?all=1&page=1&pageSize=10000

## Result

- New GenProBase public product rows since the prior probe: \`17\` under source brand \`三菱\`
- Exact Mitsubishi rows already present in Haifeng: \`14\`
- Validated new rows ${APPLY ? 'inserted' : 'planned'}: \`${missing.length}\`
${afterCount == null ? '' : `- Engine count after import: \`${afterCount}\`\n`}
## ${APPLY ? 'Inserted' : 'Planned'} Rows

| Brand | Model | Prime kWe 50 Hz | Standby kWe 50 Hz | Validation |
| --- | --- | ---: | ---: | --- |
${missing.map((record) => `| ${record.brand} | ${record.model} | ${record.prime_power_kwe_50hz} | ${record.standby_power_kwe_50hz} | ${record.description.match(/Official validation page: (.+)$/)?.[1] ?? ''} |`).join('\n')}

## Held Candidate

| Brand | Model | Reason |
| --- | --- | --- |
${HELD.map((row) => `| ${row.brand} | ${row.model} | ${row.reason} |`).join('\n')}

## Notes

- GenProBase added a plain \`三菱\` bucket after the August 5 probe; the original importer already handled \`上海菱重\`.
- \`三菱\` is normalized to \`Mitsubishi\`; no Chinese brand label is inserted.
- \`S12R-PTA3\` and \`S16R-PTA3\` were cross-validated against public Mitsubishi Heavy Industries Engine System Asia pages before insertion.
- Existing comparison uses normalized \`brand + model\`; \`-C\` Shanghai-MHI variants are treated as separate variants and do not block exact Mitsubishi model rows.
- Already-present matching rows checked: \`${existing.length}\`.
`
}

const existing = await fetchExisting()
const existingKeys = new Set(
  existing.map((engine) => `${engine.brand}::${normalize(engine.model)}`),
)
const missing = RECORDS.filter(
  (record) => !existingKeys.has(`${record.brand}::${normalize(record.model)}`),
)

console.log(`Validated candidates: ${RECORDS.length}`)
console.log(`Already present: ${RECORDS.length - missing.length}`)
console.log(`Missing/new: ${missing.length}`)
for (const record of missing) console.log(`${record.brand}\t${record.model}\t${record.slug}`)
console.log(`Held: ${HELD.map((row) => `${row.brand} ${row.model}`).join(', ')}`)

if (APPLY && missing.length) {
  const { data, error } = await supabase
    .from('engines')
    .upsert(missing, { onConflict: 'slug' })
    .select('brand, model, slug')
  if (error) throw error
  console.log(`Imported ${data.length} validated Mitsubishi engine record(s).`)
}

const { count: afterCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, buildReport({ existing, missing, afterCount }))
console.log(`Engine count is ${afterCount}.`)
console.log(`Wrote ${REPORT_PATH}`)
