import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Engines used by Generac SD-series that were missing from the DB:
//   - FPT Cursor 9 (C90), 10.3L I6  — Generac SD275/SD300
//   - Baudouin M55 data-center V-engines (12M55/16M55/20M55)
//
// Sources:
//   FPT Cursor 9: Generac SD275/SD300 spec pages (Iveco/FPT 10.3L, 480 HP)
//   Baudouin M55: baudouin.com 16M55 page + published ESP ranges; displacement
//     derived exactly from bore/stroke 180x215mm (5.47 L/cyl): 12=65.6, 16=87.5,
//     20=109.4 L — matching Generac SDMD 65.6L/87.5L. Large stationary engines
//     are emissions-unregulated (stationary-emergency).
//
// All genset ratings electrical (ekW): kVA = ekW/0.8, kWm = ekW/0.9.

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)

// [brand, model, series, disp_l, cyls, config, emissions,
//  prime50_ekw, standby50_ekw, prime60_ekw, standby60_ekw, rpm]
const rows = [
  // ── FPT Cursor 9 (C90) ───────────────────────────────────────────────────
  ['FPT', 'C90 TE2', 'Cursor 9', 10.3, 6, 'In-line 6, Turbocharged Aftercooled',
    'U.S. EPA Tier 3', 225, 250, 270, 300, 1800],

  // ── Baudouin M55 data-center series ──────────────────────────────────────
  ['Baudouin', '12M55', 'M55 Series', 65.6, 12, 'V12, Turbocharged, Common Rail',
    'Unregulated', 2200, 2400, 2250, 2500, 1500],
  ['Baudouin', '16M55', 'M55 Series', 87.5, 16, 'V16, Turbocharged, Common Rail',
    'Unregulated', 2720, 3000, 2960, 3250, 1500],
  ['Baudouin', '20M55', 'M55 Series', 109.4, 20, 'V20, Turbocharged, Common Rail',
    'Unregulated', 3280, 3600, 3800, 4200, 1500],
]

function slug(brand, model) {
  return `${brand.toLowerCase()}-${model.toLowerCase()}`
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

const records = rows.map(([brand, model, series, displacement_l, cylinders, configuration,
                           emissions_standard, p50, s50, p60, s60, rpm]) => ({
  slug:                    slug(brand, model),
  brand,
  model,
  series,
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  brand === 'Baudouin' ? 'France' : 'Italy',
  emissions_standard,
  displacement_l,
  cylinders,
  configuration,
  rpm_rated:               rpm,
  prime_power_kwe_50hz:    p50,
  prime_power_kva_50hz:    r1(p50 / 0.8),
  prime_power_kw_50hz:     r1(p50 / 0.9),
  standby_power_kwe_50hz:  s50,
  standby_power_kva_50hz:  r1(s50 / 0.8),
  standby_power_kw_50hz:   r1(s50 / 0.9),
  prime_power_kwe_60hz:    p60,
  prime_power_kva_60hz:    r1(p60 / 0.8),
  prime_power_kw_60hz:     r1(p60 / 0.9),
  standby_power_kwe_60hz:  s60,
  standby_power_kva_60hz:  r1(s60 / 0.8),
  standby_power_kw_60hz:   r1(s60 / 0.9),
  description: `${brand} ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${s60} ekW standby at 60Hz / ${s50} ekW standby at 50Hz. ${emissions_standard}.`,
}))

console.log(`Inserting ${records.length} Generac-sourced engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, brand, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.brand} ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
