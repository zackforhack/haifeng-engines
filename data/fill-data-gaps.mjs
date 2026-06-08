// Fill safely-derivable data gaps so every engine is as complete as possible:
//  - ignition_type from fuel_type (diesel->Compression, gas/LPG->Spark)
//  - cooling_method -> Liquid-Cooled (except air-cooled brands Deutz/Hatz)
//  - Baudouin: origin=France, rpm_rated from frequency, displacement from family
//  - kWe/kVA derived where only engine kW exists (kWe=kW*0.9, kVA=kWe/0.8)
// Dry-run by default; pass --apply.
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const AIR_COOLED_BRANDS = new Set(['Deutz', 'Hatz'])
const SPARK = /natural gas|biogas|gas|cng|lng|lpg|propane/i

const all = []; let from = 0
while (true) { const { data } = await supabase.from('engines').select('*').range(from, from + 999); all.push(...data); if (data.length < 1000) break; from += 1000 }

// Baudouin displacement is exact within a bore series: cylinders x per-cylinder.
// Learn per-cylinder displacement for each series (M33, M26, ...) from known rows.
const seriesPerCyl = {}
const seriesOf = (m) => m.match(/^\d+(M\d+)/)?.[1] ?? null   // "12M33" -> "M33"
const cylOf = (m) => Number(m.match(/^(\d+)M/)?.[1])         // "12M33" -> 12
for (const e of all) if (e.brand === 'Baudouin' && e.displacement_l != null) {
  const sr = seriesOf(e.model), c = cylOf(e.model)
  if (sr && c && !(sr in seriesPerCyl)) seriesPerCyl[sr] = e.displacement_l / c
}
const baudouinDisp = (m) => { const sr = seriesOf(m), c = cylOf(m); return sr && c && seriesPerCyl[sr] ? round1(c * seriesPerCyl[sr]) : null }

const tally = { ignition: 0, cooling: 0, origin: 0, rpm: 0, displacement: 0, kwe: 0, kva: 0 }
let changed = 0

for (const e of all) {
  const u = {}
  if (!e.ignition_type && e.fuel_type) { u.ignition_type = SPARK.test(e.fuel_type) ? 'Spark Ignition' : 'Compression Ignition'; tally.ignition++ }
  if (!e.cooling_method && !AIR_COOLED_BRANDS.has(e.brand)) { u.cooling_method = 'Liquid-Cooled'; tally.cooling++ }

  if (e.brand === 'Baudouin') {
    if (!e.origin) { u.origin = 'France'; tally.origin++ }
    if (e.rpm_rated == null) {
      const has50 = ['prime', 'standby'].some((r) => ['kw', 'kwe', 'kva'].some((x) => e[`${r}_power_${x}_50hz`] != null))
      const has60 = ['prime', 'standby'].some((r) => ['kw', 'kwe', 'kva'].some((x) => e[`${r}_power_${x}_60hz`] != null))
      if (has50) { u.rpm_rated = 1500; tally.rpm++ } else if (has60) { u.rpm_rated = 1800; tally.rpm++ }
    }
    if (e.displacement_l == null) { const d = baudouinDisp(e.model); if (d != null) { u.displacement_l = d; tally.displacement++ } }
  }

  // derive kWe / kVA where only engine kW exists
  for (const r of ['prime', 'standby']) for (const h of ['50', '60']) {
    const kw = e[`${r}_power_kw_${h}hz`], kwe = e[`${r}_power_kwe_${h}hz`], kva = e[`${r}_power_kva_${h}hz`]
    let newKwe = kwe
    if (kwe == null && kw != null) { newKwe = Math.round(kw * 0.9); u[`${r}_power_kwe_${h}hz`] = newKwe; tally.kwe++ }
    if (kva == null && newKwe != null) { u[`${r}_power_kva_${h}hz`] = round1(newKwe / 0.8); tally.kva++ }
  }

  if (Object.keys(u).length) {
    changed++
    if (APPLY) { const { error } = await supabase.from('engines').update(u).eq('id', e.id); if (error) console.error(`✗ ${e.model}: ${error.message}`) }
  }
}

console.log(`${APPLY ? 'APPLIED' : 'DRY RUN'} — ${changed} engines updated`)
console.log('  fills:', JSON.stringify(tally, null, 0))
console.log('  Baudouin series displacement/cyl:', JSON.stringify(Object.fromEntries(Object.entries(seriesPerCyl).map(([k, v]) => [k, round1(v)]))))
