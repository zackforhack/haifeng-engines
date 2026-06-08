// Add VMAN diesel engine brand from the 2026 catalog. Models C03–C10 (L4/L6),
// CE10–CE17 (L6), D11–D30 (V6–V16), DE58/DE76 (V12/V16). Suffix A = 50 Hz/1500 rpm,
// B = 60 Hz/1800 rpm. Power is engine kW (catalog notes kWe must be estimated), so
// we store kWm and derive kWe (×0.9) and kVA (÷0.8) for completeness.
// Dry-run by default; pass --apply.
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const lines = readFileSync('/tmp/vman.txt', 'utf8').split('\n')
const round1 = (n) => Math.round(n * 10) / 10

// table regions [startLine, endLine, freqMode]  (1-indexed). freqMode: 'AB' = by A/B letter, 50, 60
const REGIONS = [
  { a: 230, b: 274, freq: 'AB', series: 'C' },
  { a: 945, b: 986, freq: 'AB', series: 'CE' },
  { a: 1672, b: 1727, freq: 50, series: 'D' },
  { a: 1734, b: 1802, freq: 60, series: 'D' },
  { a: 2665, b: 2712, freq: 'AB', series: 'DE' },
]
const MODEL = /^\s*((?:CE|DE|DT|C|D)\d{2}(?:\.\d)?(?:[AB]\d?)?P?Z?)\b/
// authoritative per-series spec (config, cylinders, displacement L) from the catalog
const SERIES = {
  C03: ['L4', 4, 2.5], C04: ['L4', 4, 4.3], C07: ['L6', 6, 6.5], C10: ['L6', 6, 10],
  CE10: ['L6', 6, 9.84], CE12: ['L6', 6, 11.8], CE13: ['L6', 6, 12.8], CE17: ['L6', 6, 16.85],
  D11: ['V6', 6, 10.964], D15: ['V8', 8, 14.618], D22: ['V12', 12, 21.927], D30: ['V16', 16, 29.235],
  DE58: ['V12', 12, 57.2], DE76: ['V16', 16, 76.3],
}
const seriesOf = (m) => m.match(/^((?:CE|DE|C|D)\d{2})/)?.[1]
const dispOf = (m, s) => (s === 'C07' && /P$/.test(m)) ? 7.2 : SERIES[s][2]

const recs = new Map()
for (const reg of REGIONS) {
  for (let i = reg.a - 1; i < reg.b; i++) {
    const ln = lines[i]; if (!ln) continue
    const mm = ln.match(MODEL); if (!mm) continue
    const model = mm[1]
    const s = seriesOf(model)
    if (!s || !SERIES[s]) continue
    // bare series codes (DE58/DE76) on header lines are not real models
    if (model === s && (s === 'DE58' || s === 'DE76')) continue
    const ints = (ln.match(/\b\d{2,4}\b/g) || []).map(Number).filter((n) => n !== 1500 && n !== 1800)
    if (ints.length < 2) continue
    const standby = ints[0], prime = ints[1]
    if (!(standby > prime) || prime < 20 || standby > 3500) continue   // sanity: standby > prime

    const hz = reg.freq === 'AB' ? (/B\d?P?$/.test(model) ? 60 : 50) : reg.freq
    const [config, cylinders] = SERIES[s]
    const rec = recs.get(model) ?? {
      slug: 'vman-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand: 'VMAN', model, status: 'active', origin: 'China',
      fuel_type: 'Diesel', ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
      configuration: config, cylinders, displacement_l: dispOf(model, s),
      emissions_standard: 'Unregulated', rpm_rated: hz === 60 ? 1800 : 1500,
    }
    rec[`prime_power_kw_${hz}hz`] = prime
    rec[`standby_power_kw_${hz}hz`] = standby
    rec[`prime_power_kwe_${hz}hz`] = Math.round(prime * 0.9)
    rec[`standby_power_kwe_${hz}hz`] = Math.round(standby * 0.9)
    rec[`prime_power_kva_${hz}hz`] = round1(Math.round(prime * 0.9) / 0.8)
    rec[`standby_power_kva_${hz}hz`] = round1(Math.round(standby * 0.9) / 0.8)
    recs.set(model, rec)
  }
}

const out = [...recs.values()].sort((a, b) => a.model.localeCompare(b.model))
console.log(`Parsed ${out.length} VMAN models  ·  ${APPLY ? 'APPLYING' : 'dry run'}`)
for (const r of out) console.log(`  ${r.model.padEnd(9)} ${String(r.configuration ?? '?').padEnd(4)} ${String(r.displacement_l ?? '?').padEnd(7)} P50kw=${r.prime_power_kw_50hz ?? '-'} S50=${r.standby_power_kw_50hz ?? '-'} P60=${r.prime_power_kw_60hz ?? '-'} S60=${r.standby_power_kw_60hz ?? '-'}`)

if (APPLY) {
  const { data, error } = await supabase.from('engines').upsert(out, { onConflict: 'slug' }).select('id')
  if (error) { console.error('✗', error.message); process.exit(1) }
  console.log(`\n✓ upserted ${data.length} VMAN engines`)
}
