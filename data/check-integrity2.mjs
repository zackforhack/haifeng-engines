import { createClient } from '@supabase/supabase-js'

const sb = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const all = []
let from = 0
while (true) {
  const { data, error } = await sb.from('engines').select('*').range(from, from + 999)
  if (error) { console.error(error); process.exit(1) }
  all.push(...data); if (data.length < 1000) break; from += 1000
}

// ── NULL breakdown by brand ──────────────────────────────────────────────────
console.log('=== NULLs by brand ===')
const brands = [...new Set(all.map(e => e.brand))].sort()
const nullFields = ['cylinders','configuration','displacement_l','rpm_rated','origin']
for (const b of brands) {
  const eng = all.filter(e => e.brand === b)
  const issues = []
  for (const f of nullFields) {
    const n = eng.filter(e => e[f] == null).length
    if (n > 0) issues.push(`${f}:${n}`)
  }
  if (issues.length) console.log(`  ${b} (${eng.length}): ${issues.join(', ')}`)
}

// ── configuration inconsistency ──────────────────────────────────────────────
console.log('\n=== Non-standard configuration values (to normalize) ===')
const BAD_CONFIGS = all.filter(e =>
  e.configuration && (
    e.configuration.startsWith('Inline') ||
    e.configuration.startsWith('Turbocharged') ||
    e.configuration.includes('Common Rail') ||
    e.configuration.includes('Spark Ignition')
  )
)
const badCfgByBrand = {}
for (const e of BAD_CONFIGS) {
  const key = `${e.brand}|${e.configuration}`
  badCfgByBrand[key] = (badCfgByBrand[key] || 0) + 1
}
for (const [k,n] of Object.entries(badCfgByBrand).sort()) {
  const [brand, cfg] = k.split('|')
  console.log(`  ${brand} (${n}): "${cfg}"`)
}

// ── kWm=kWe remaining (impossible efficiency) ─────────────────────────────────
console.log('\n=== kWm=kWe still present (impossible efficiency) ===')
const HZ = ['50hz','60hz'], KINDS = ['prime','standby']
for (const e of all) {
  const hits = []
  for (const h of HZ) for (const k of KINDS) {
    const kw = e[`${k}_power_kw_${h}`], kwe = e[`${k}_power_kwe_${h}`]
    if (kw != null && kwe != null && kw === kwe) hits.push(`${k}@${h}=${kw}`)
  }
  if (hits.length) console.log(`  ${e.brand} ${e.model}: ${hits.join(', ')}`)
}

// ── kWe/kWm > 1.0 (kWe > kWm — impossible) ───────────────────────────────────
console.log('\n=== kWe > kWm (impossible — likely kWm/kWe swapped) ===')
for (const e of all) {
  const hits = []
  for (const h of HZ) for (const k of KINDS) {
    const kw = e[`${k}_power_kw_${h}`], kwe = e[`${k}_power_kwe_${h}`]
    if (kw != null && kwe != null && kwe > kw) hits.push(`${k}@${h}: kWm=${kw} kWe=${kwe}`)
  }
  if (hits.length) console.log(`  ${e.brand} ${e.model}: ${hits.join(', ')}`)
}

// ── Cummins QSB5.9 very low efficiency ────────────────────────────────────────
console.log('\n=== kWe/kWm < 0.80 (suspiciously low efficiency) ===')
for (const e of all) {
  const hits = []
  for (const h of HZ) for (const k of KINDS) {
    const kw = e[`${k}_power_kw_${h}`], kwe = e[`${k}_power_kwe_${h}`]
    if (kw != null && kwe != null && kwe/kw < 0.80) hits.push(`${k}@${h}: kWm=${kw} kWe=${kwe} (${(kwe/kw).toFixed(3)})`)
  }
  if (hits.length) console.log(`  ${e.brand} ${e.model}: ${hits.join(', ')}`)
}

// ── emissions_standard inconsistencies ───────────────────────────────────────
console.log('\n=== emissions_standard inconsistencies ===')
const EMI_ISSUES = [
  ['Non-certified', 'should be "Non-Certified"'],
  ['China IV', 'should be "China National Stage IV"'],
  ['US Tier 4f', 'should be "U.S. EPA Final Tier 4"'],
]
for (const [val, note] of EMI_ISSUES) {
  const n = all.filter(e => e.emissions_standard === val).length
  if (n) console.log(`  "${val}" (${n}): ${note}`)
}

// ── origin inconsistency ──────────────────────────────────────────────────────
console.log('\n=== origin: "USA" vs "United States" ===')
for (const val of ['USA', 'United States']) {
  const engs = all.filter(e => e.origin === val)
  if (engs.length) console.log(`  "${val}" (${engs.length}): ${engs.slice(0,3).map(e=>e.brand+' '+e.model).join(', ')}...`)
}

// ── rpm_rated NULLs ───────────────────────────────────────────────────────────
console.log('\n=== rpm_rated NULL engines ===')
for (const e of all.filter(e => e.rpm_rated == null)) {
  console.log(`  ${e.brand} ${e.model} (${e.slug})`)
}

// ── displacement_l NULLs by brand ────────────────────────────────────────────
console.log('\n=== displacement_l NULL by brand ===')
const dispNullByBrand = {}
for (const e of all.filter(e => e.displacement_l == null)) {
  dispNullByBrand[e.brand] = (dispNullByBrand[e.brand] || 0) + 1
}
for (const [b,n] of Object.entries(dispNullByBrand).sort((a,b)=>b[1]-a[1])) console.log(`  ${b}: ${n}`)

// ── origin NULLs ──────────────────────────────────────────────────────────────
console.log('\n=== origin NULL engines ===')
const origNull = all.filter(e => e.origin == null)
const origNullBrand = {}
for (const e of origNull) origNullBrand[e.brand] = (origNullBrand[e.brand]||0)+1
for (const [b,n] of Object.entries(origNullBrand)) console.log(`  ${b}: ${n}`)
