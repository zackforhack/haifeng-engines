// MWM gas engines (Caterpillar Energy Solutions / INNIO), from the MWM 2023 product manual.
// German-built (Mannheim) TCG-series spark-ignition gas engines for CHP/power gen. Multi-fuel:
// natural gas, biogas, sewage/landfill gas. One row per flagship config with the natural-gas
// electrical rating (电功率) as the headline. kVA = kWe / 0.8.
//   TCG 3016 (132/160): 1500/1800 rpm = 50/60 Hz
//   TCG 2020 / 3020 (170/195): 1500 rpm = 50 Hz
//   TCG 2032 (260/320): 1000/900 rpm = 50/60 Hz
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const kva = (kwe) => (kwe == null ? null : round1(kwe / 0.8))

// [model, series, cyl, config, displ_L, rpm, kWe50, kWe60, weightKg, L, W, H]
const MODELS = [
  ['TCG 3016 V08', 'TCG 3016', 8, 'V8', 17.5, 1500, 400, 400, 5720, 3100, 1780, 2150],
  ['TCG 3016 V12', 'TCG 3016', 12, 'V12', 26.3, 1500, 600, 600, 7000, 3830, 1780, 2150],
  ['TCG 3016 V16', 'TCG 3016', 16, 'V16', 35.0, 1500, 800, 800, 8070, 4200, 1780, 2150],
  ['TCG 3016 V16 S', 'TCG 3016', 16, 'V16', 35.0, 1500, 1000, null, 8560, 4200, 1780, 2150],
  ['TCG 2020 V12', 'TCG 2020', 12, 'V12', 53.1, 1500, 1200, null, 11700, null, null, null],
  ['TCG 2020 V16', 'TCG 2020', 16, 'V16', 70.8, 1500, 1560, null, 13300, null, null, null],
  ['TCG 3020 V12', 'TCG 3020', 12, 'V12', 53.0, 1500, 1380, null, 12900, null, null, null],
  ['TCG 3020 V16', 'TCG 3020', 16, 'V16', 71.0, 1500, 1840, null, 17400, null, null, null],
  ['TCG 3020 V20', 'TCG 3020', 20, 'V20', 89.0, 1500, 2300, null, 21400, null, null, null],
  ['TCG 2032 V12', 'TCG 2032', 12, 'V12', 203.9, 1000, 3333, 3000, 43100, null, null, null],
  ['TCG 2032 V16', 'TCG 2032', 16, 'V16', 271.8, 1000, 4300, 4000, 51200, null, null, null],
  ['TCG 2032B V16', 'TCG 2032', 16, 'V16', 271.8, 1000, 4500, 4050, 51400, null, null, null],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'MWM')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, series, cyl, config, displ, rpm, kwe50, kwe60, wt, L, W, H] of MODELS) {
  const slug = 'mwm-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const dual = kwe60 != null
  const freqLabel = rpm === 1000 ? '1000 rpm / 50 Hz' : '1500 rpm / 50 Hz'
  const fields = {
    series, fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: rpm, cylinders: cyl, configuration: config, displacement_l: displ, weight_kg: wt,
    ...(L != null ? { length_mm: L, width_mm: W, height_mm: H } : {}),
    prime_power_kwe_50hz: kwe50, prime_power_kva_50hz: kva(kwe50),
    ...(dual ? { prime_power_kwe_60hz: kwe60, prime_power_kva_60hz: kva(kwe60) } : {}),
    description: `MWM ${model} — ${displ} L ${config} spark-ignition gas engine (${series} series), `
      + `multi-fuel: natural gas, biogas and sewage/landfill gas. ${kwe50} kWe at ${freqLabel}`
      + `${dual ? `, ${kwe60} kWe at ${rpm === 1000 ? '900 rpm / 60 Hz' : '1800 rpm / 60 Hz'}` : ''}; `
      + `NOx ≤ 500 mg/Nm³.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'MWM', model, status: 'active', origin: 'Germany',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} MWM gas engines`)
