// Fix all data integrity issues identified in the audit:
//  1. kWm = kWe (impossible efficiency) → kWm = round(kWe / 0.9)
//  2. kWe > kWm (impossible) → kWm = round(kWe / 0.9)
//  3. Normalize configuration strings (Inline X → LX, fix Turbocharged etc.)
//  4. emissions_standard typos
//  5. origin: "USA" → "United States", fill Cummins NULLs
//  6. Yanmar rpm_rated NULLs (60Hz → 1800)

import { createClient } from '@supabase/supabase-js'

const sb = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)

const all = []
let from = 0
while (true) {
  const { data, error } = await sb.from('engines').select('*').range(from, from + 999)
  if (error) { console.error(error); process.exit(1) }
  all.push(...data); if (data.length < 1000) break; from += 1000
}
console.log(`Loaded ${all.length} engines\n`)

const HZ = ['50hz', '60hz'], KINDS = ['prime', 'standby']

// ─── Config normalization map ────────────────────────────────────────────────
// "Inline X" / "Inline-X" → "LX"
// "Turbocharged, Common Rail" / "Turbocharged" on Hyundai/Scania → derive from cylinders
// Yanmar induction-mixed configs → strip induction suffix, keep layout only

function normalizeConfig(cfg, cylinders) {
  if (!cfg) return null

  // Inline-6 (Volvo Penta style with dash)
  const dashInline = cfg.match(/^Inline-(\d+)$/)
  if (dashInline) return `L${dashInline[1]}`

  // "Inline 2", "Inline 3", "Inline 4", "Inline 6"
  const spaceInline = cfg.match(/^Inline (\d+)/)
  if (spaceInline) return `L${spaceInline[1]}`

  // "Turbocharged, Common Rail" / "Turbocharged" / "Turbocharged, Spark Ignition"
  // These are induction descriptions, not layout configs.
  // Derive layout from cylinders count.
  if (cfg.startsWith('Turbocharged') || cfg === 'Common Rail') {
    if (!cylinders) return null
    // All Hyundai/Scania with these configs are inline engines
    return `L${cylinders}`
  }

  return cfg  // already correct (L4, L6, V12, etc.)
}

const patches = []

for (const e of all) {
  const updates = {}

  // ── 1 & 2: kWm/kWe power errors ─────────────────────────────────────────────
  for (const h of HZ) {
    for (const k of KINDS) {
      const fkw  = `${k}_power_kw_${h}`
      const fkwe = `${k}_power_kwe_${h}`
      const kw   = e[fkw]
      const kwe  = e[fkwe]

      if (kw == null || kwe == null) continue

      // kWm = kWe (impossible) or kWe > kWm (impossible)
      if (kw === kwe || kwe > kw) {
        // kWe is the authoritative output figure; kWm was wrong
        const correctedKw = Math.round(kwe / 0.9)
        updates[fkw] = correctedKw
      }
    }
  }

  // ── 3: Configuration normalization ───────────────────────────────────────────
  const normalized = normalizeConfig(e.configuration, e.cylinders)
  if (normalized !== e.configuration && normalized != null) {
    updates.configuration = normalized
  }
  // Fill NULL configuration from cylinders where we can derive it (inline engines)
  if (e.configuration == null && e.cylinders != null && e.brand !== 'Perkins') {
    // Only normalize non-Perkins here (Perkins handled by patch-metadata-fields)
    // For brands where all engines are inline:
    const inlineBrands = ['SDEC', 'Yuchai', 'Weichai', 'Yunnei', 'Baudouin', 'Cummins']
    // Don't guess for V-engines; skip
  }

  // ── 4: emissions_standard typos ──────────────────────────────────────────────
  if (e.emissions_standard === 'Non-certified') updates.emissions_standard = 'Non-Certified'
  if (e.emissions_standard === 'China IV') updates.emissions_standard = 'China National Stage IV'
  if (e.emissions_standard === 'US Tier 4f') updates.emissions_standard = 'U.S. EPA Final Tier 4'

  // ── 5: origin fixes ───────────────────────────────────────────────────────────
  if (e.origin === 'USA') updates.origin = 'United States'
  if (e.origin == null && e.brand === 'Cummins') updates.origin = 'United States'

  // ── 6: Yanmar rpm_rated NULLs ────────────────────────────────────────────────
  if (e.brand === 'Yanmar' && e.rpm_rated == null) {
    // All remaining Yanmar NULLs are 60Hz (1800 rpm) models based on slug check
    if (e.slug.includes('ng6ge') || e.slug.includes('g6ge') ||
        e.slug.includes('4tnv98c')) {
      updates.rpm_rated = 1800
    }
  }

  if (Object.keys(updates).length) patches.push({ slug: e.slug, brand: e.brand, model: e.model, updates })
}

// Summary
console.log(`Patches to apply: ${patches.length}`)
const byCategory = {}
for (const p of patches) {
  for (const k of Object.keys(p.updates)) {
    byCategory[k] = (byCategory[k] || 0) + 1
  }
}
for (const [k,n] of Object.entries(byCategory).sort()) console.log(`  ${k}: ${n}`)
console.log()

let ok = 0, failed = 0
for (const { slug, updates } of patches) {
  const { error } = await sb.from('engines').update(updates).eq('slug', slug)
  if (error) {
    console.error(`  FAIL ${slug}: ${error.message}`)
    failed++
  } else {
    process.stdout.write('.')
    ok++
  }
}
console.log(`\n\n=== DONE: ${ok} updated, ${failed} failed ===`)
