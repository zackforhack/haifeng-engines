import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Fetch all engines
const all = []
let from = 0
while (true) {
  const { data, error } = await sb.from('engines').select('*').range(from, from + 999)
  if (error) { console.error(error); process.exit(1) }
  all.push(...data)
  if (data.length < 1000) break
  from += 1000
}
console.log(`Total engines: ${all.length}\n`)

// ── 1. Brand summary ──────────────────────────────────────────────────────────
const byBrand = {}
for (const e of all) {
  byBrand[e.brand] = (byBrand[e.brand] || 0) + 1
}
console.log('=== Brand counts ===')
for (const [b, n] of Object.entries(byBrand).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${b}: ${n}`)
}

// ── 2. NULL audit for key fields ──────────────────────────────────────────────
const KEY_FIELDS = [
  'brand','model','slug','series','status',
  'cylinders','configuration','displacement_l',
  'fuel_type','ignition_type','cooling_method',
  'rpm_rated','emissions_standard','origin',
]
console.log('\n=== NULL counts per field ===')
for (const f of KEY_FIELDS) {
  const n = all.filter(e => e[f] == null).length
  if (n > 0) console.log(`  ${f}: ${n} NULL`)
}

// ── 3. Power field completeness ───────────────────────────────────────────────
const HZ = ['50hz','60hz'], KINDS = ['prime','standby']
console.log('\n=== Power field NULL counts ===')
for (const h of HZ) {
  for (const k of KINDS) {
    for (const unit of ['kw','kwe','kva']) {
      const f = `${k}_power_${unit}_${h}`
      const nulls = all.filter(e => e[f] == null).length
      const pct = Math.round(nulls / all.length * 100)
      if (nulls > 0) console.log(`  ${f}: ${nulls} NULL (${pct}%)`)
    }
  }
}

// ── 4. Engines with NO power data at all ──────────────────────────────────────
const powerFields = []
for (const h of HZ) for (const k of KINDS) for (const u of ['kw','kwe','kva'])
  powerFields.push(`${k}_power_${u}_${h}`)

const noPower = all.filter(e => powerFields.every(f => e[f] == null))
console.log(`\n=== Engines with NO power data: ${noPower.length} ===`)
for (const e of noPower.slice(0, 20)) console.log(`  ${e.brand} ${e.model} (${e.slug})`)
if (noPower.length > 20) console.log(`  ... and ${noPower.length - 20} more`)

// ── 5. Partial kW triples (kWm/kWe/kVA inconsistency) ────────────────────────
let partialTriple = 0
const partialExamples = []
for (const e of all) {
  for (const h of HZ) {
    for (const k of KINDS) {
      const kw  = e[`${k}_power_kw_${h}`]
      const kwe = e[`${k}_power_kwe_${h}`]
      const kva = e[`${k}_power_kva_${h}`]
      const defined = [kw,kwe,kva].filter(v => v != null).length
      if (defined > 0 && defined < 3) {
        partialTriple++
        if (partialExamples.length < 10)
          partialExamples.push(`  ${e.brand} ${e.model} ${k}@${h}: kw=${kw} kwe=${kwe} kva=${kva}`)
      }
    }
  }
}
console.log(`\n=== Partial kW/kWe/kVA triples (should all be 0): ${partialTriple} ===`)
for (const ex of partialExamples) console.log(ex)

// ── 6. Impossible efficiencies (kWm ≈ kWe — 100% efficiency) ─────────────────
let sameKwKwe = 0
for (const e of all) {
  for (const h of HZ) {
    for (const k of KINDS) {
      const kw  = e[`${k}_power_kw_${h}`]
      const kwe = e[`${k}_power_kwe_${h}`]
      if (kw != null && kwe != null && kw === kwe) {
        sameKwKwe++
        if (sameKwKwe <= 5) console.log(`  SAME kW=kWe: ${e.brand} ${e.model} ${k}@${h}: ${kw}`)
      }
    }
  }
}
console.log(`\n=== Engines where kWm = kWe (impossible efficiency): ${sameKwKwe} ===`)

// ── 7. Duplicate slugs ────────────────────────────────────────────────────────
const slugCounts = {}
for (const e of all) slugCounts[e.slug] = (slugCounts[e.slug] || 0) + 1
const dupes = Object.entries(slugCounts).filter(([,n]) => n > 1)
console.log(`\n=== Duplicate slugs: ${dupes.length} ===`)
for (const [s,n] of dupes) console.log(`  ${s}: ${n}×`)

// ── 8. kWe/kVA ratio sanity (should be ~1.25 for PF=0.8) ────────────────────
let badRatio = 0
const ratioExamples = []
for (const e of all) {
  for (const h of HZ) {
    for (const k of KINDS) {
      const kwe = e[`${k}_power_kwe_${h}`]
      const kva = e[`${k}_power_kva_${h}`]
      if (kwe == null || kva == null) continue
      const ratio = kva / kwe
      if (ratio < 1.15 || ratio > 1.35) {
        badRatio++
        if (ratioExamples.length < 10)
          ratioExamples.push(`  ${e.brand} ${e.model} ${k}@${h}: kWe=${kwe} kVA=${kva} ratio=${ratio.toFixed(3)}`)
      }
    }
  }
}
console.log(`\n=== kVA/kWe ratio outside 1.15–1.35 (expected ~1.25): ${badRatio} ===`)
for (const ex of ratioExamples) console.log(ex)

// ── 9. kWe/kWm ratio sanity (should be ~0.9) ─────────────────────────────────
let badEff = 0
const effExamples = []
for (const e of all) {
  for (const h of HZ) {
    for (const k of KINDS) {
      const kw  = e[`${k}_power_kw_${h}`]
      const kwe = e[`${k}_power_kwe_${h}`]
      if (kw == null || kwe == null) continue
      const ratio = kwe / kw
      if (ratio < 0.8 || ratio > 1.0) {
        badEff++
        if (effExamples.length < 10)
          effExamples.push(`  ${e.brand} ${e.model} ${k}@${h}: kWm=${kw} kWe=${kwe} eff=${ratio.toFixed(3)}`)
      }
    }
  }
}
console.log(`\n=== kWe/kWm ratio outside 0.80–1.00 (expected ~0.90): ${badEff} ===`)
for (const ex of effExamples) console.log(ex)

// ── 10. rpm_rated values ─────────────────────────────────────────────────────
const rpmCounts = {}
for (const e of all) {
  const r = e.rpm_rated ?? 'NULL'
  rpmCounts[r] = (rpmCounts[r] || 0) + 1
}
console.log('\n=== rpm_rated distribution ===')
for (const [r,n] of Object.entries(rpmCounts).sort()) console.log(`  ${r}: ${n}`)

// ── 11. Configuration values ─────────────────────────────────────────────────
const cfgCounts = {}
for (const e of all) {
  const c = e.configuration ?? 'NULL'
  cfgCounts[c] = (cfgCounts[c] || 0) + 1
}
console.log('\n=== configuration distribution ===')
for (const [c,n] of Object.entries(cfgCounts).sort()) console.log(`  ${c}: ${n}`)

// ── 12. emissions_standard values ────────────────────────────────────────────
const emCounts = {}
for (const e of all) {
  const s = e.emissions_standard ?? 'NULL'
  emCounts[s] = (emCounts[s] || 0) + 1
}
console.log('\n=== emissions_standard distribution ===')
for (const [s,n] of Object.entries(emCounts).sort()) console.log(`  ${s}: ${n}`)

// ── 13. origin values ────────────────────────────────────────────────────────
const origCounts = {}
for (const e of all) {
  const o = e.origin ?? 'NULL'
  origCounts[o] = (origCounts[o] || 0) + 1
}
console.log('\n=== origin distribution ===')
for (const [o,n] of Object.entries(origCounts).sort()) console.log(`  ${o}: ${n}`)

// ── 14. fuel_type values ─────────────────────────────────────────────────────
const fuelCounts = {}
for (const e of all) {
  const f = e.fuel_type ?? 'NULL'
  fuelCounts[f] = (fuelCounts[f] || 0) + 1
}
console.log('\n=== fuel_type distribution ===')
for (const [f,n] of Object.entries(fuelCounts).sort()) console.log(`  ${f}: ${n}`)
