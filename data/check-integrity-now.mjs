import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
// paginate past the 1000-row cap
let all = [], from = 0
while (true) {
  const { data, error } = await supabase.from('engines').select('*').range(from, from + 999)
  if (error) { console.error(error.message); break }
  all = all.concat(data); if (data.length < 1000) break; from += 1000
}
const n = all.length
const brands = new Set(all.map((e) => e.brand))
console.log(`TOTAL: ${n} engines, ${brands.size} brands\n`)

const FIELDS = ['fuel_type','ignition_type','cooling_method','rpm_rated','cylinders','configuration',
  'origin','emissions_standard','displacement_l']
const isNull = (v) => v === null || v === undefined || v === ''
console.log('Field completeness:')
for (const f of FIELDS) {
  const miss = all.filter((e) => isNull(e[f]))
  const pct = (((n - miss.length) / n) * 100).toFixed(1)
  console.log(`  ${f.padEnd(20)} ${pct}%  (${miss.length} missing)`)
}
// power: at least one rating present
const powerMiss = all.filter((e) => isNull(e.power_kw) && isNull(e.power_hp)
  && isNull(e.prime_power_kwe_50hz) && isNull(e.prime_power_kwe_60hz)
  && isNull(e.standby_power_kwe_50hz) && isNull(e.standby_power_kwe_60hz))
console.log(`  ${'power (any rating)'.padEnd(20)} ${(((n-powerMiss.length)/n)*100).toFixed(1)}%  (${powerMiss.length} missing)`)

// detail the displacement gaps
const dispMiss = all.filter((e) => isNull(e.displacement_l))
console.log(`\nDisplacement gaps (${dispMiss.length}):`)
const byBrand = {}
for (const e of dispMiss) (byBrand[e.brand] ??= []).push(e.model)
for (const [b, ms] of Object.entries(byBrand)) console.log(`  ${b}: ${ms.join(', ')}`)

// Jichai snapshot
const jichai = all.filter((e) => e.brand === 'Jichai')
console.log(`\nJichai: ${jichai.length} models`)
const jmiss = jichai.filter((e) => FIELDS.some((f) => isNull(e[f])))
if (jmiss.length) for (const e of jmiss) console.log(`  ${e.model}: missing ${FIELDS.filter((f)=>isNull(e[f])).join(', ')}`)
else console.log('  all core fields complete')
