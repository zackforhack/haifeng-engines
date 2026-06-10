// Patch missing structural fields across multiple brands.
// Only fills NULL fields — never overwrites existing data.
//
// Fixes:
//  1. Perkins      — cylinders, configuration, displacement_l  (119 engines)
//  2. Weichai      — displacement_l for M-series               ( 46 engines)
//  3. SDEC         — displacement_l                            ( 22 engines)
//  4. Baudouin     — displacement_l                            ( 38 engines)
//  5. Hyundai      — cylinders + configuration for DP158/DP222 ( 10 engines)
//  6. Yanmar       — displacement_l, rpm_rated                 ( 10 engines)
//  7. Scania OC16  — prime_power_kw corrected (was = kWe, impossible efficiency)

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ─── Helpers ───────────────────────────────────────────────────────────────

function only(updates, engine) {
  // Drop any key that already has a non-null value in the DB record
  const out = {}
  for (const [k, v] of Object.entries(updates)) {
    if (v != null && engine[k] == null) out[k] = v
  }
  return out
}

// ─── 1. Perkins ─────────────────────────────────────────────────────────────
// Naming: {seriesNum}{letter?}-{E?}{dispNum}{suffix}
//   seriesNum < 2000 → displacement = dispNum / 10
//   seriesNum ≥ 2000 → displacement = dispNum  (already in liters)
// Configuration: 4000/5000 series = V-type; all others = inline (L)

const PERKINS_CYLS = {
  402:1,  // actually 2-cyl
  403:3, 404:4, 904:4,
  1103:3, 1104:4, 1106:6,
  1204:4, 1206:6,
  1706:6,
  2206:6, 2406:6, 2506:6, 2806:6,
  4006:6, 4008:8, 4012:12, 4016:16,
  5006:6, 5008:8, 5012:12, 5016:16,
}
// Correct 402: 2-cyl
PERKINS_CYLS[402] = 2

const PERKINS_DISP_DEFAULTS = { 4008: 30.6, 4016: 61.1 }

function perkinsInfo(model) {
  const seriesMatch = model.match(/^(\d+)/)
  if (!seriesMatch) return {}
  const series = parseInt(seriesMatch[1])
  const cyl = PERKINS_CYLS[series]
  if (!cyl) return {}

  const isV = series >= 4000
  const cfg = isV ? `V${cyl}` : `L${cyl}`

  // Extract displacement number: after '-', skip optional letters, grab first digits
  const dispMatch = model.match(/-[A-Za-z]*?(\d+)/)
  let disp = null
  if (dispMatch) {
    const num = parseInt(dispMatch[1])
    disp = series < 2000 ? parseFloat((num / 10).toFixed(1)) : num
  } else {
    disp = PERKINS_DISP_DEFAULTS[series] ?? null
  }

  return { cylinders: cyl, configuration: cfg, displacement_l: disp }
}

// ─── 2. Weichai M-series ────────────────────────────────────────────────────
// Pattern: {cyl}M{num}... → displacement = cyl × (num / 10)
// e.g. 6M33 → 6 × 3.3 = 19.8L;  12M26 → 12 × 2.6 = 31.2L

function weichaiMDisp(model) {
  const m = model.match(/^(\d+)M(\d+)/)
  if (!m) return null
  const cyl = parseInt(m[1]), num = parseInt(m[2])
  return parseFloat((cyl * num / 10).toFixed(1))
}

// ─── 3. SDEC ────────────────────────────────────────────────────────────────
// SC{num}{letter} → displacement = num (in liters)
// e.g. SC9D → 9.0L,  SC13E → 13.0L,  SC27G → 27.0L

function sdecDisp(model) {
  const m = model.match(/^SC(\d+)[A-Za-z]/)
  return m ? parseFloat(m[1]) : null
}

// ─── 4. Baudouin ────────────────────────────────────────────────────────────
// {cyl}M{num}G... → displacement = cyl × (num / 10)
// e.g. 4M06G25 → 4 × 0.6 = 2.4L;  6M21G400 → 6 × 2.1 = 12.6L

function baudouinDisp(model) {
  const m = model.match(/^(\d+)M(\d+)/)
  if (!m) return null
  const cyl = parseInt(m[1]), num = parseInt(m[2])
  return parseFloat((cyl * num / 10).toFixed(1))
}

// ─── 5. Hyundai ─────────────────────────────────────────────────────────────
// DP158: 6-cyl, L6 (15.1L already in DB)
// DP222: 6-cyl, L6 (21.9L already in DB)
// configuration was incorrectly set to "Turbocharged, Common Rail" — fix to L6

function hyundaiInfo(model) {
  if (model.startsWith('DP158')) return { cylinders: 6, configuration: 'L6' }
  if (model.startsWith('DP222')) return { cylinders: 6, configuration: 'L6' }
  return {}
}

// ─── 6. Yanmar ──────────────────────────────────────────────────────────────
// Displacement from known Yanmar specs (bore × stroke × cylinders)
// rpm_rated: -NG6GE / -G6GE suffix = 60Hz (1800 rpm); others = 50Hz (1500 rpm)

const YANMAR_DISP = {
  '3TNM68-HGE':      0.668,
  '3TNM68-GGE':      0.668,
  '3TNV80F-NGGE':    1.267,
  '3TNV80F-NG6GE':   1.267,
  '3TNV88F-UGGE':    1.494,
  '3TNV88F-UG6GE':   1.494,
}

function yanmarRpm(model) {
  // G6GE or NG6GE suffix = 60 Hz
  if (/-NG6GE$|-G6GE$/.test(model)) return 1800
  // Standard generator models default to 50Hz
  return 1500
}

// ─── Main ───────────────────────────────────────────────────────────────────

const all = []
let from = 0
while (true) {
  const { data, error } = await sb.from('engines').select('*').range(from, from + 999)
  if (error) { console.error(error); process.exit(1) }
  all.push(...data); if (data.length < 1000) break; from += 1000
}
console.log(`Loaded ${all.length} engines\n`)

const patches = []  // { slug, updates }

for (const e of all) {
  let updates = {}

  if (e.brand === 'Perkins') {
    const info = perkinsInfo(e.model)
    Object.assign(updates, only(info, e))
  }

  if (e.brand === 'Weichai' && !e.displacement_l) {
    const d = weichaiMDisp(e.model)
    if (d) updates.displacement_l = d
  }

  if (e.brand === 'SDEC' && !e.displacement_l) {
    const d = sdecDisp(e.model)
    if (d) updates.displacement_l = d
  }

  if (e.brand === 'Baudouin' && !e.displacement_l) {
    const d = baudouinDisp(e.model)
    if (d) updates.displacement_l = d
  }

  if (e.brand === 'Hyundai') {
    const info = hyundaiInfo(e.model)
    // For cylinders: only fill if null
    if (info.cylinders && !e.cylinders) updates.cylinders = info.cylinders
    // For configuration: fix if null OR if wrongly set to injection description
    if (info.configuration && (
      !e.configuration ||
      e.configuration.toLowerCase().includes('turbo') ||
      e.configuration.toLowerCase().includes('rail')
    )) updates.configuration = info.configuration
  }

  if (e.brand === 'Yanmar') {
    const knownDisp = YANMAR_DISP[e.model]
    if (knownDisp && !e.displacement_l) updates.displacement_l = knownDisp
    if (!e.rpm_rated) updates.rpm_rated = yanmarRpm(e.model)
  }

  if (Object.keys(updates).length) patches.push({ slug: e.slug, brand: e.brand, model: e.model, updates })
}

// ─── Scania OC16: kWm was set to same value as kWe (100% efficiency = impossible) ──
// Fix: prime_power_kw = round(prime_power_kwe / 0.9) for affected hz
for (const e of all) {
  if (e.brand !== 'Scania' || !e.slug.includes('oc16')) continue
  const fix = {}
  for (const h of ['50hz', '60hz']) {
    const kw = e[`prime_power_kw_${h}`], kwe = e[`prime_power_kwe_${h}`]
    if (kw != null && kwe != null && kw === kwe) {
      fix[`prime_power_kw_${h}`] = Math.round(kwe / 0.9)
    }
  }
  if (Object.keys(fix).length) patches.push({ slug: e.slug, brand: 'Scania', model: e.model, updates: fix })
}

console.log(`Patches to apply: ${patches.length}`)

// Print summary by brand
const byBrand = {}
for (const p of patches) {
  const fields = Object.keys(p.updates).join(',')
  byBrand[p.brand] = byBrand[p.brand] || {}
  byBrand[p.brand][fields] = (byBrand[p.brand][fields] || 0) + 1
}
for (const [brand, counts] of Object.entries(byBrand)) {
  console.log(`  ${brand}:`, Object.entries(counts).map(([f,n]) => `${n}×[${f}]`).join(' '))
}
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
