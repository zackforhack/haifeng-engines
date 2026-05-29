import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Fix kWm / kWe / kVA columns with correct 0.9 alternator efficiency factor.
//
// Two source types:
//
// MECHANICAL-SOURCE brands (spec sheet gives kWm shaft power):
//   FPT Tier 4 Final (TEVP/ETVP model codes), Isuzu, Hatz, JCB, Mitsubishi
//   → kWe = kWm × 0.9  (alternator efficiency)
//   → kVA = kWe / 0.8  (0.8 power factor)
//   → kWm (kW column) stays unchanged
//
// ELECTRICAL-SOURCE brands (spec sheet gives kWe or kVA):
//   Cummins, Perkins, John Deere, Volvo Penta, Scania, Yanmar, Baudouin,
//   Kubota, Hyundai, Weichai, CCEC, DCEC, FPT Tier III, PSI, etc.
//   → kWe = kVA × 0.8  (if kVA was the source)  OR  kWe = existing kWe
//   → kWm = kWe / 0.9  (derive mechanical from electrical)
//   → kVA = kWe / 0.8

const r1 = (n) => Math.round(n * 10) / 10

function isMechanicalSource(brand, model) {
  if (brand === 'Isuzu' || brand === 'Hatz' || brand === 'JCB') return true
  if (brand === 'Mitsubishi') return true
  // FPT Tier 4 Final models have TEVP or ETVP in the model code
  if (brand === 'FPT' && (model.includes('TEVP') || model.includes('ETVP'))) return true
  return false
}

// Fetch all engines
const PAGE = 1000
let all = []
let from = 0
while (true) {
  const { data, error } = await supabase
    .from('engines')
    .select('id, brand, model, prime_power_kw_50hz, prime_power_kwe_50hz, prime_power_kva_50hz, standby_power_kw_50hz, standby_power_kwe_50hz, standby_power_kva_50hz, prime_power_kw_60hz, prime_power_kwe_60hz, prime_power_kva_60hz, standby_power_kw_60hz, standby_power_kwe_60hz, standby_power_kva_60hz')
    .range(from, from + PAGE - 1)
  if (error) { console.error(error.message); process.exit(1) }
  all.push(...(data ?? []))
  if (!data || data.length < PAGE) break
  from += PAGE
}

console.log(`Loaded ${all.length} engines`)

let updated = 0, skipped = 0

for (const e of all) {
  const mechanical = isMechanicalSource(e.brand, e.model)
  const patches = {}

  for (const hz of ['50', '60']) {
    for (const type of ['prime', 'standby']) {
      const kw_col  = `${type}_power_kw_${hz}hz`
      const kwe_col = `${type}_power_kwe_${hz}hz`
      const kva_col = `${type}_power_kva_${hz}hz`

      const kw  = e[kw_col]
      const kwe = e[kwe_col]
      const kva = e[kva_col]

      if (mechanical) {
        // kW column = kWm (shaft power). Derive kWe and kVA from it.
        if (kw == null) continue
        const kwe_new = r1(kw * 0.9)
        const kva_new = r1(kwe_new / 0.8)
        if (kwe !== kwe_new) patches[kwe_col] = kwe_new
        if (kva !== kva_new) patches[kva_col] = kva_new
        // kW (kWm) stays unchanged
      } else {
        // kW column = kWe (electrical). Derive kWm from it using kVA as first priority.
        // Step 1: get the best kWe value
        let best_kwe = kwe
        if (best_kwe == null && kva != null) best_kwe = r1(kva * 0.8)
        if (best_kwe == null && kw  != null) best_kwe = kw

        if (best_kwe == null) continue

        const kwm_new = r1(best_kwe / 0.9)  // mechanical = electrical / 0.9
        const kva_new = r1(best_kwe / 0.8)  // apparent power

        if (kwe !== best_kwe) patches[kwe_col] = best_kwe
        if (kw  !== kwm_new)  patches[kw_col]  = kwm_new
        if (kva !== kva_new)  patches[kva_col] = kva_new
      }
    }
  }

  if (Object.keys(patches).length === 0) { skipped++; continue }

  const { error } = await supabase.from('engines').update(patches).eq('id', e.id)
  if (error) {
    console.error(`  ✗ ${e.brand} ${e.model}: ${error.message}`)
  } else {
    updated++
    if (updated % 100 === 0) process.stdout.write(`  ${updated} updated...\n`)
  }
}

console.log(`\n✓ Done — ${updated} engines updated, ${skipped} already complete`)
console.log(`  Mechanical-source brands (kWe = kWm × 0.9): Isuzu, Hatz, JCB, Mitsubishi, FPT T4F`)
console.log(`  Electrical-source brands (kWm = kWe / 0.9): everything else`)
