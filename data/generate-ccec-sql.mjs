// Generates ccec-insert.sql from 2025年重康型谱.xlsx
// CCEC = Chongqing Cummins Engine Company, all models made in China

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const XLSX = require('/tmp/xlsxtmp/node_modules/xlsx/xlsx.js')
import { readFileSync, writeFileSync } from 'fs'

const buf = readFileSync('/Users/ziqianhuang/Downloads/2025年重康型谱.xlsx')
const wb = XLSX.read(buf)

function parseNum(v) {
  if (v === '' || v === '-----' || v == null) return null
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

function slugify(model) {
  return 'cummins-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

// Series metadata
function getSeriesMeta(seriesCode, model) {
  const m = model.toUpperCase()
  if (m.startsWith('NT') && m.includes('855'))  return { series: 'NT Series', cylinders: 6, config: 'Inline 6', disp: 14.0 }
  if (m.startsWith('QSN') || m.startsWith('QSNT')) return { series: 'QSN Series', cylinders: 6, config: 'Inline 6', disp: 14.0 }
  if (m.startsWith('M15'))  return { series: 'M15 Series', cylinders: 6, config: 'Inline 6', disp: 15.0 }
  if (m.startsWith('QSM11')) return { series: 'QSM11 Series', cylinders: 6, config: 'Inline 6', disp: 10.8 }
  if (m.startsWith('QSK19')) return { series: 'QSK19 Series', cylinders: 6, config: 'Inline 6', disp: 19.0 }
  if (m.startsWith('QSK38')) return { series: 'QSK38 Series', cylinders: 12, config: 'V12', disp: 38.0 }
  if (m.match(/^KT[A]*50/) || m.startsWith('K50'))  return { series: 'K50 Series', cylinders: 16, config: 'V16', disp: 50.3 }
  if (m.match(/^KT[A]*38/) || m.startsWith('KT38')) return { series: 'K38 Series', cylinders: 12, config: 'V12', disp: 38.0 }
  if (m.match(/^KT[A]*19/) || m.startsWith('K19'))  return { series: 'K19 Series', cylinders: 6, config: 'Inline 6', disp: 19.0 }
  return { series: `${seriesCode} Series`, cylinders: null, config: null, disp: null }
}

// Parse both sheets into a map keyed by model name
// Sheet 2 takes precedence (has emission data)
const engines = {}

for (let sheetIdx = 0; sheetIdx < wb.SheetNames.length; sheetIdx++) {
  const ws = wb.Sheets[wb.SheetNames[sheetIdx]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  const isSheet2 = sheetIdx === 1

  for (let i = 4; i < rows.length; i++) {
    const r = rows[i]
    const seriesCode = r[0]?.toString().trim()
    const model = r[1]?.toString().trim()
    if (!model || model === '') continue

    const hz50_prime    = parseNum(r[4])
    const hz50_standby  = parseNum(r[5])
    const hz50_gs_prime = parseNum(r[6])
    const hz50_gs_stby  = parseNum(r[7])
    const hz60_prime    = parseNum(r[9])
    const hz60_standby  = parseNum(r[10])
    const hz60_gs_prime = parseNum(r[11])
    const hz60_gs_stby  = parseNum(r[12])

    // Emission cert (sheet 2 col 23 or 24 depending on layout)
    const certRaw = isSheet2 ? (r[23] ?? r[24] ?? '').toString().trim() : ''
    const hasCert = certRaw && certRaw !== 'N/A' && certRaw !== ''
    const emissions = hasCert ? 'China Nonroad Stage III' : null

    if (!engines[model]) {
      const meta = getSeriesMeta(seriesCode, model)
      engines[model] = {
        seriesCode,
        model,
        slug: slugify(model),
        ...meta,
        emissions,
        hz50_prime: null, hz50_standby: null,
        hz50_gs_prime: null, hz50_gs_stby: null,
        hz60_prime: null, hz60_standby: null,
        hz60_gs_prime: null, hz60_gs_stby: null,
      }
    } else if (isSheet2 && hasCert && !engines[model].emissions) {
      engines[model].emissions = emissions
    }

    const e = engines[model]
    if (hz50_prime   && !e.hz50_prime)    e.hz50_prime   = hz50_prime
    if (hz50_standby && !e.hz50_standby)  e.hz50_standby = hz50_standby
    if (hz50_gs_prime && !e.hz50_gs_prime) e.hz50_gs_prime = hz50_gs_prime
    if (hz50_gs_stby  && !e.hz50_gs_stby)  e.hz50_gs_stby  = hz50_gs_stby
    if (hz60_prime   && !e.hz60_prime)    e.hz60_prime   = hz60_prime
    if (hz60_standby && !e.hz60_standby)  e.hz60_standby = hz60_standby
    if (hz60_gs_prime && !e.hz60_gs_prime) e.hz60_gs_prime = hz60_gs_prime
    if (hz60_gs_stby  && !e.hz60_gs_stby)  e.hz60_gs_stby  = hz60_gs_stby
  }
}

function sql(v) {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`
  return String(v)
}

function kva(kwe) {
  if (!kwe) return null
  return Math.round(kwe / 0.8)
}

const list = Object.values(engines)
console.log(`Total unique CCEC models: ${list.length}`)

const lines = []
lines.push(`-- CCEC (Chongqing Cummins Engine Company) engine records`)
lines.push(`-- Source: 2025年重康型谱.xlsx`)
lines.push(`-- All models manufactured in Chongqing, China`)
lines.push(`-- ${list.length} models across NT, M15, K19, K38, K50, QSM11, QSN, QSK19, QSK38 series\n`)

lines.push(`INSERT INTO engines (`)
lines.push(`  brand, model, series, slug, status,`)
lines.push(`  cylinders, configuration, displacement_l,`)
lines.push(`  rpm_rated, fuel_type, ignition_type, cooling_method,`)
lines.push(`  emissions_standard, origin,`)
lines.push(`  prime_power_kw_50hz,  standby_power_kw_50hz,`)
lines.push(`  prime_power_kwe_50hz, prime_power_kva_50hz,`)
lines.push(`  standby_power_kwe_50hz, standby_power_kva_50hz,`)
lines.push(`  prime_power_kw_60hz,  standby_power_kw_60hz,`)
lines.push(`  prime_power_kwe_60hz, prime_power_kva_60hz,`)
lines.push(`  standby_power_kwe_60hz, standby_power_kva_60hz`)
lines.push(`) VALUES`)

const rows = []
for (const e of list) {
  const rpm = e.hz50_prime || e.hz50_standby ? 1500 : 1800

  rows.push(
    `('Cummins', ${sql(e.model)}, ${sql(e.series)}, ${sql(e.slug)}, 'active',` +
    `\n  ${sql(e.cylinders)}, ${sql(e.config)}, ${sql(e.disp)},` +
    `\n  ${rpm}, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',` +
    `\n  ${sql(e.emissions)}, 'China',` +
    `\n  ${sql(e.hz50_prime)}, ${sql(e.hz50_standby)},` +
    `\n  ${sql(e.hz50_gs_prime)}, ${sql(kva(e.hz50_gs_prime))},` +
    `\n  ${sql(e.hz50_gs_stby)}, ${sql(kva(e.hz50_gs_stby))},` +
    `\n  ${sql(e.hz60_prime)}, ${sql(e.hz60_standby)},` +
    `\n  ${sql(e.hz60_gs_prime)}, ${sql(kva(e.hz60_gs_prime))},` +
    `\n  ${sql(e.hz60_gs_stby)}, ${sql(kva(e.hz60_gs_stby))})`
  )
}

lines.push(rows.join(',\n\n'))
lines.push(`\nON CONFLICT (slug) DO UPDATE SET`)
lines.push(`  series                = EXCLUDED.series,`)
lines.push(`  cylinders             = EXCLUDED.cylinders,`)
lines.push(`  configuration         = EXCLUDED.configuration,`)
lines.push(`  displacement_l        = EXCLUDED.displacement_l,`)
lines.push(`  emissions_standard    = EXCLUDED.emissions_standard,`)
lines.push(`  prime_power_kw_50hz   = EXCLUDED.prime_power_kw_50hz,`)
lines.push(`  standby_power_kw_50hz = EXCLUDED.standby_power_kw_50hz,`)
lines.push(`  prime_power_kwe_50hz  = EXCLUDED.prime_power_kwe_50hz,`)
lines.push(`  prime_power_kva_50hz  = EXCLUDED.prime_power_kva_50hz,`)
lines.push(`  standby_power_kwe_50hz = EXCLUDED.standby_power_kwe_50hz,`)
lines.push(`  standby_power_kva_50hz = EXCLUDED.standby_power_kva_50hz,`)
lines.push(`  prime_power_kw_60hz   = EXCLUDED.prime_power_kw_60hz,`)
lines.push(`  standby_power_kw_60hz = EXCLUDED.standby_power_kw_60hz,`)
lines.push(`  prime_power_kwe_60hz  = EXCLUDED.prime_power_kwe_60hz,`)
lines.push(`  prime_power_kva_60hz  = EXCLUDED.prime_power_kva_60hz,`)
lines.push(`  standby_power_kwe_60hz = EXCLUDED.standby_power_kwe_60hz,`)
lines.push(`  standby_power_kva_60hz = EXCLUDED.standby_power_kva_60hz,`)
lines.push(`  updated_at            = now();`)

const sql_out = lines.join('\n')
writeFileSync('/Users/ziqianhuang/haifeng-engines/data/ccec-insert.sql', sql_out)
console.log('Written ccec-insert.sql')

// Print summary by series
const bySeries = {}
for (const e of list) {
  bySeries[e.series] = (bySeries[e.series] || 0) + 1
}
for (const [s, n] of Object.entries(bySeries)) console.log(`  ${s}: ${n}`)
