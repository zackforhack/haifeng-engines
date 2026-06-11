// Caterpillar gas gensets from the official Cat 2024 Electric Power Ratings Guide (LEXE7582, 20th ed).
// Adds the CG lean-burn series (ex-MWM/Cat Energy Solutions) and the G3500 high-output/variant models.
// Displacements derived from published Cat/MWM bore×stroke: CG132 132×160 = 2.19 L/cyl, CG170 170×195
// = 4.43 L/cyl, CG260 260×320 = 17.0 L/cyl; G3500 V-block 170×190 ≈ existing family values. ekW figures
// are catalog continuous (CG, 0.8 pf) or standby (G35xx). CG = NOx-configurable lean-burn (250/500
// mg/Nm³, no single US cert) -> "Unregulated"; G35xx EP gensets are EPA Factory Certified in the US.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const r1 = (n) => Math.round(n * 10) / 10

// [model, cyl, config, displ, series, fuel, rpm, kwe50, kwe60, emissions, note]
const M = [
  // CG132 (132×160 = 2.19 L/cyl) — lean-burn
  ['CG132B-8',  8,  'V8',  17.5, 'CG132', 'Natural Gas', 1500, 400,  400,  'Unregulated', 'lean-burn, ≤250 mg/Nm³ NOx; multi-fuel (NG/biogas/propane)'],
  ['CG132B-12', 12, 'V12', 26.3, 'CG132', 'Natural Gas', 1500, 600,  600,  'Unregulated', 'lean-burn, ≤250 mg/Nm³ NOx; multi-fuel (NG/biogas/propane)'],
  ['CG132B-16', 16, 'V16', 35.1, 'CG132', 'Natural Gas', 1500, 1000, 800,  'Unregulated', 'lean-burn, ≤250 mg/Nm³ NOx; multi-fuel (NG/biogas/propane)'],
  // CG170 (170×195 = 4.43 L/cyl)
  ['CG170-12',  12, 'V12', 53.1, 'CG170', 'Natural Gas', 1500, 1200, 1200, 'Unregulated', 'lean-burn, ≤250 mg/Nm³ NOx; multi-fuel (NG/biogas/propane)'],
  ['CG170-16',  16, 'V16', 70.8, 'CG170', 'Natural Gas', 1500, 1560, 1560, 'Unregulated', 'lean-burn, ≤250 mg/Nm³ NOx; multi-fuel (NG/biogas/propane)'],
  ['CG170B-12', 12, 'V12', 53.1, 'CG170', 'Natural Gas', 1500, 1380, null, 'Unregulated', 'B-series lean-burn, ≤250 mg/Nm³ NOx; multi-fuel'],
  ['CG170B-16', 16, 'V16', 70.8, 'CG170', 'Natural Gas', 1500, 1840, null, 'Unregulated', 'B-series lean-burn, ≤250 mg/Nm³ NOx; multi-fuel'],
  ['CG170B-20', 20, 'V20', 88.5, 'CG170', 'Natural Gas', 1500, 2300, 2300, 'Unregulated', 'B-series lean-burn, ≤250 mg/Nm³ NOx; multi-fuel'],
  // CG260 (260×320 = 17.0 L/cyl), 1000 rpm (50Hz) / 900 rpm (60Hz)
  ['CG260-12', 12, 'V12', 204.0, 'CG260', 'Natural Gas', 1000, 3333, 3000, 'Unregulated', 'high-efficiency lean-burn, ≤250 mg/Nm³ NOx; ~45% electrical efficiency'],
  ['CG260-16', 16, 'V16', 272.0, 'CG260', 'Natural Gas', 1000, 4500, 4050, 'Unregulated', 'high-efficiency lean-burn, ≤250 mg/Nm³ NOx; ~45% electrical efficiency'],
  // G3400 / G3500 variants (same blocks as existing base models)
  ['G3412C',  12, 'V12', 27.0, 'G3400', 'Natural Gas', 1500, 374,  423,  'U.S. EPA Stationary', 'low-emission electronic-control variant'],
  ['G3512H',  12, 'V12', 50.5, 'G3500', 'Natural Gas', 1500, 1500, 1490, 'U.S. EPA Stationary', 'high-output Miller-cycle; EPA Factory Certified'],
  ['G3516H',  16, 'V16', 67.4, 'G3500', 'Natural Gas', 1500, 2000, 1982, 'U.S. EPA Stationary', 'high-output Miller-cycle; EPA Factory Certified'],
  ['G3520H',  20, 'V20', 84.2, 'G3500', 'Natural Gas', 1500, 2500, 2490, 'U.S. EPA Stationary', 'high-output Miller-cycle; EPA Factory Certified'],
  // Biogas / landfill variants
  ['G3520C',  20, 'V20', 84.2, 'G3500', 'Biogas',      1500, 1984, 1950, 'U.S. EPA Stationary', 'landfill/biogas variant with ADEM control'],
  ['G3516+',  16, 'V16', 67.4, 'G3500', 'Biogas',      1200, 1000, 1000, 'U.S. EPA Stationary', 'biogas variant (1000 ekW @ 1200 rpm)'],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Caterpillar')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let ins = 0, upd = 0
for (const [model, cyl, config, displ, series, fuel, rpm, kwe50, kwe60, emissions, note] of M) {
  const slug = 'caterpillar-' + model.toLowerCase().replace(/\+/g, '-plus').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const row = {
    brand: 'Caterpillar', model, status: 'active', origin: fuel === 'Biogas' || series.startsWith('CG') ? 'Germany' : 'United States',
    series, fuel_type: fuel, ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: rpm, cylinders: cyl, configuration: config, displacement_l: displ, emissions_standard: emissions,
    power_kw: kwe50,
    prime_power_kwe_50hz: kwe50, prime_power_kva_50hz: r1(kwe50 / 0.8),
    ...(kwe60 != null ? { prime_power_kwe_60hz: kwe60, prime_power_kva_60hz: r1(kwe60 / 0.8) } : {}),
    description: `Caterpillar ${model} — ${displ} L ${config} spark-ignited ${fuel.toLowerCase()} generator engine `
      + `(Cat ${series} series). ${kwe50} ekW continuous at ${rpm} rpm${kwe60 != null && kwe60 !== kwe50 ? ` (${kwe60} ekW @ 60 Hz)` : ''}; ${note}. `
      + `Source: Cat 2024 Electric Power Ratings Guide.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else { upd++; console.log('· updated', model) } }
  else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else { ins++; console.log('✓ inserted', model) } }
}
console.log(`\n✓ inserted ${ins}, updated ${upd} Caterpillar gas models`)
