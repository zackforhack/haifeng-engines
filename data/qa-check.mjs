import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Pull all engines (paginate past 1000-row cap)
const PAGE = 1000
let all = []
let from = 0
while (true) {
  const { data, error } = await supabase.from('engines').select('*').range(from, from + PAGE - 1)
  if (error) { console.error(error.message); process.exit(1) }
  all.push(...(data ?? []))
  if (!data || data.length < PAGE) break
  from += PAGE
}
console.log(`Loaded ${all.length} engines\n`)

const issues = {}
const add = (cat, msg) => { (issues[cat] ??= []).push(msg) }
const id = (e) => `${e.brand} ${e.model}`

// helper: relative diff
const close = (a, b, tol = 0.06) => a == null || b == null || Math.abs(a - b) <= Math.abs(b) * tol + 0.5

for (const e of all) {
  // 1. Missing critical fields
  if (!e.brand) add('missing_brand', `slug=${e.slug}`)
  if (!e.model) add('missing_model', id(e))
  if (!e.slug) add('missing_slug', id(e))
  if (e.displacement_l == null) add('missing_displacement', id(e))
  if (e.cylinders == null) add('missing_cylinders', id(e))
  if (!e.status) add('missing_status', id(e))

  // 2. Cylinder sanity
  if (e.cylinders != null && (e.cylinders < 1 || e.cylinders > 20)) add('cyl_range', `${id(e)} cyl=${e.cylinders}`)

  // 3. Displacement sanity
  if (e.displacement_l != null && (e.displacement_l < 0.2 || e.displacement_l > 700)) add('disp_range', `${id(e)} disp=${e.displacement_l}L`)

  // 4. Per-frequency internal consistency: kVA ≈ kWe/0.8, kWe ≤ kWm, standby ≥ prime
  for (const hz of ['50', '60']) {
    for (const t of ['prime', 'standby']) {
      const kw  = e[`${t}_power_kw_${hz}hz`]
      const kwe = e[`${t}_power_kwe_${hz}hz`]
      const kva = e[`${t}_power_kva_${hz}hz`]
      if (kwe != null && kva != null && !close(kva, kwe / 0.8)) add('kva_vs_kwe', `${id(e)} ${t}${hz}: kVA=${kva} kWe=${kwe} (exp ${(kwe/0.8).toFixed(1)})`)
      if (kwe != null && kw != null && kwe > kw + 0.5) add('kwe_gt_kwm', `${id(e)} ${t}${hz}: kWe=${kwe} > kWm=${kw}`)
    }
    const pP = e[`prime_power_kwe_${hz}hz`], sP = e[`standby_power_kwe_${hz}hz`]
    if (pP != null && sP != null && pP > sP + 0.5) add('prime_gt_standby', `${id(e)} ${hz}Hz: prime=${pP} > standby=${sP}`)
  }

  // 5. Power-to-displacement ratio (kWe/L) sanity on representative 50Hz standby (or 60Hz)
  const repKwe = e.standby_power_kwe_50hz ?? e.standby_power_kwe_60hz ?? e.prime_power_kwe_50hz ?? e.prime_power_kwe_60hz
  if (repKwe != null && e.displacement_l) {
    const ratio = repKwe / e.displacement_l
    if (ratio > 45) add('high_kwe_per_l', `${id(e)} ${ratio.toFixed(1)} kWe/L (${repKwe}kWe / ${e.displacement_l}L)`)
    if (ratio < 4)  add('low_kwe_per_l',  `${id(e)} ${ratio.toFixed(1)} kWe/L (${repKwe}kWe / ${e.displacement_l}L)`)
  }

  // 6. Has a model but zero power data anywhere
  const anyPower = ['50','60'].some(hz => ['prime','standby'].some(t => e[`${t}_power_kwe_${hz}hz`] != null || e[`${t}_power_kw_${hz}hz`] != null)) || e.power_kw != null
  if (!anyPower) add('no_power_data', id(e))
}

// 7. Duplicate slugs
const slugCounts = {}
all.forEach(e => { slugCounts[e.slug] = (slugCounts[e.slug] || 0) + 1 })
Object.entries(slugCounts).filter(([,n]) => n > 1).forEach(([s,n]) => add('dup_slug', `${s} x${n}`))

// 8. Duplicate brand+model
const bmCounts = {}
all.forEach(e => { const k = `${e.brand}|${e.model}`; bmCounts[k] = (bmCounts[k] || 0) + 1 })
Object.entries(bmCounts).filter(([,n]) => n > 1).forEach(([k,n]) => add('dup_brand_model', `${k.replace('|',' ')} x${n}`))

// Report
const order = ['missing_brand','missing_model','missing_slug','missing_status','no_power_data','dup_slug','dup_brand_model','kva_vs_kwe','kwe_gt_kwm','prime_gt_standby','cyl_range','disp_range','high_kwe_per_l','low_kwe_per_l','missing_displacement','missing_cylinders']
let total = 0
for (const cat of order) {
  const list = issues[cat]
  if (!list || !list.length) continue
  total += list.length
  console.log(`\n### ${cat} (${list.length})`)
  list.slice(0, 25).forEach(m => console.log('  - ' + m))
  if (list.length > 25) console.log(`  … and ${list.length - 25} more`)
}
console.log(`\n=== ${total} issues across ${Object.keys(issues).filter(c=>issues[c].length).length} categories ===`)
