// Inserts all 97 CCEC (Chongqing Cummins) engine records into Supabase
// Source: 2025年重康型谱.xlsx

import { createClient } from '@supabase/supabase-js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const XLSX = require('/tmp/xlsxtmp/node_modules/xlsx/xlsx.js')
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const buf = readFileSync('/Users/ziqianhuang/Downloads/2025年重康型谱.xlsx')
const wb = XLSX.read(buf)

function parseNum(v) {
  if (v === '' || v === '-----' || v == null) return null
  const n = parseFloat(v); return isNaN(n) ? null : n
}
function slugify(model) {
  return 'cummins-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}
function kva(kwe) { return kwe ? Math.round(kwe / 0.8) : null }

function getSeriesMeta(model) {
  const m = model.toUpperCase()
  if (m.startsWith('QSM11'))                  return { series: 'QSM11 Series', cylinders: 6,  configuration: 'Inline 6', displacement_l: 10.8 }
  if (m.startsWith('QSNT') || m.startsWith('QSN')) return { series: 'QSN Series', cylinders: 6,  configuration: 'Inline 6', displacement_l: 14.0 }
  if (m.startsWith('QSK19'))                  return { series: 'QSK19 Series', cylinders: 6,  configuration: 'Inline 6', displacement_l: 19.0 }
  if (m.startsWith('QSK38'))                  return { series: 'QSK38 Series', cylinders: 12, configuration: 'V12',      displacement_l: 38.0 }
  if (m.match(/^(NT|NTA|NTAA)855/))           return { series: 'NT Series',    cylinders: 6,  configuration: 'Inline 6', displacement_l: 14.0 }
  if (m.startsWith('M15'))                    return { series: 'M15 Series',   cylinders: 6,  configuration: 'Inline 6', displacement_l: 15.0 }
  if (m.match(/^KT[A]*19/) || m.startsWith('K19')) return { series: 'K19 Series', cylinders: 6,  configuration: 'Inline 6', displacement_l: 19.0 }
  if (m.match(/^KT[A]*38/) || m.startsWith('KT38')) return { series: 'K38 Series', cylinders: 12, configuration: 'V12',     displacement_l: 38.0 }
  if (m.match(/^KT[A]*50/) || m.startsWith('K50'))  return { series: 'K50 Series', cylinders: 16, configuration: 'V16',     displacement_l: 50.3 }
  return { series: null, cylinders: null, configuration: null, displacement_l: null }
}

const engines = {}

for (let sheetIdx = 0; sheetIdx < wb.SheetNames.length; sheetIdx++) {
  const ws = wb.Sheets[wb.SheetNames[sheetIdx]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  const isSheet2 = sheetIdx === 1

  for (let i = 4; i < rows.length; i++) {
    const r = rows[i]
    const model = r[1]?.toString().trim()
    if (!model) continue

    const hz50_prime    = parseNum(r[4])
    const hz50_standby  = parseNum(r[5])
    const hz50_gs_prime = parseNum(r[6])
    const hz50_gs_stby  = parseNum(r[7])
    const hz60_prime    = parseNum(r[9])
    const hz60_standby  = parseNum(r[10])
    const hz60_gs_prime = parseNum(r[11])
    const hz60_gs_stby  = parseNum(r[12])

    const certRaw = isSheet2 ? (r[23] ?? r[24] ?? '').toString().trim() : ''
    const hasCert = certRaw && certRaw !== 'N/A'
    const emissions = hasCert ? 'China Nonroad Stage III' : null

    if (!engines[model]) {
      engines[model] = {
        brand: 'Cummins', model, slug: slugify(model), status: 'active',
        ...getSeriesMeta(model),
        rpm_rated: null, fuel_type: 'Diesel',
        ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
        emissions_standard: null, origin: 'China',
        prime_power_kw_50hz: null,   standby_power_kw_50hz: null,
        prime_power_kwe_50hz: null,  prime_power_kva_50hz: null,
        standby_power_kwe_50hz: null, standby_power_kva_50hz: null,
        prime_power_kw_60hz: null,   standby_power_kw_60hz: null,
        prime_power_kwe_60hz: null,  prime_power_kva_60hz: null,
        standby_power_kwe_60hz: null, standby_power_kva_60hz: null,
      }
    }
    const e = engines[model]
    if (isSheet2 && hasCert && !e.emissions_standard) e.emissions_standard = emissions

    if (hz50_prime    && !e.prime_power_kw_50hz)    e.prime_power_kw_50hz   = hz50_prime
    if (hz50_standby  && !e.standby_power_kw_50hz)  e.standby_power_kw_50hz = hz50_standby
    if (hz50_gs_prime && !e.prime_power_kwe_50hz) {
      e.prime_power_kwe_50hz  = hz50_gs_prime
      e.prime_power_kva_50hz  = kva(hz50_gs_prime)
    }
    if (hz50_gs_stby  && !e.standby_power_kwe_50hz) {
      e.standby_power_kwe_50hz = hz50_gs_stby
      e.standby_power_kva_50hz = kva(hz50_gs_stby)
    }
    if (hz60_prime    && !e.prime_power_kw_60hz)    e.prime_power_kw_60hz   = hz60_prime
    if (hz60_standby  && !e.standby_power_kw_60hz)  e.standby_power_kw_60hz = hz60_standby
    if (hz60_gs_prime && !e.prime_power_kwe_60hz) {
      e.prime_power_kwe_60hz  = hz60_gs_prime
      e.prime_power_kva_60hz  = kva(hz60_gs_prime)
    }
    if (hz60_gs_stby  && !e.standby_power_kwe_60hz) {
      e.standby_power_kwe_60hz = hz60_gs_stby
      e.standby_power_kva_60hz = kva(hz60_gs_stby)
    }
  }
}

// Set rpm_rated: 1500 if has 50Hz data, else 1800
for (const e of Object.values(engines)) {
  e.rpm_rated = (e.prime_power_kw_50hz || e.standby_power_kw_50hz) ? 1500 : 1800
}

const records = Object.values(engines)
console.log(`Upserting ${records.length} CCEC engine records...\n`)

const { error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' })
if (error) { console.error('Upsert failed:', error.message); process.exit(1) }

console.log(`Done. ${records.length} records upserted.`)

// Summary by series
const bySeries = {}
for (const e of records) bySeries[e.series] = (bySeries[e.series] || 0) + 1
console.log('\nBy series:')
for (const [s, n] of Object.entries(bySeries)) console.log(`  ${s}: ${n} models`)
