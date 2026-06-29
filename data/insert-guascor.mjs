// Guascor (高斯科尔) gas engines, from the official 2023 multi-fuel catalog. Spanish-built
// (Zumaia) spark-ignition gas engines, now part of INNIO / Siemens Energy. Multi-fuel:
// natural gas, biogas, landfill/sewage gas, syngas, propane, wellhead/flare/coal gas.
// One row per engine model with the natural-gas rating (MN75) as the headline; 1500 rpm = 50 Hz,
// 1800 rpm = 60 Hz. 6/8 cyl are INLINE (per spec sheet "In Line 6/8"); 12/16 are V. kVA = kWe/0.8.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const kva = (kwe) => (kwe == null ? null : round1(kwe / 0.8))
const crText = (cr) => cr == null ? null : `${cr}:1`

// [model, series, cyl, config, displ_L, compression, kWb50, kWe50, kWb60, kWe60]
const MODELS = [
  ['G-18FR', 'G-FR', 6, 'L6', 18, null, 150, 142, 180, 171],
  ['G-24FR', 'G-FR', 8, 'L8', 24, null, 200, 191, 238, 226],
  ['G-18FL', 'G-FL', 6, 'L6', 18, null, 275, 264, 300, 287],
  ['G-24FL', 'G-FL', 8, 'L8', 24, null, 360, 347, 400, 385],
  ['G-36FL', 'G-FL', 12, 'V12', 35.9, null, 550, 529, 600, 577],
  ['G-48FL', 'G-FL', 16, 'V16', 47.9, null, 725, 703, 792, 761],
  ['G-18SL', 'G-SL', 6, 'L6', 18, 11.6, 314, 304, 350, 336],
  ['G-24SL', 'G-SL', 8, 'L8', 24, 11.6, 419, 405, 453, 436],
  ['G-36SL', 'G-SL', 12, 'V12', 35.9, 11.6, 630, 609, 700, 678],
  ['G-48SL', 'G-SL', 16, 'V16', 47.9, 11.6, 838, 812, 906, 880],
  ['G-56SL', 'G-SL', 16, 'V16', 56.3, 12.3, 985, 957, 1067, 1028],
  ['G-56SM', 'G-SM', 16, 'V16', 56.3, 12.3, 1055, 1025, 1100, 1065],
  ['G-24HM', 'G-HM', 8, 'L8', 24, null, 520, 500, 520, 500],
  ['G-42HM', 'G-HM', 12, 'V12', 42, null, 1040, 1011, 1040, 1011],
  ['G-56HM', 'G-HM', 16, 'V16', 56.3, null, 1240, 1200, 1350, 1308],
  ['G-86EM', 'G-EM', 12, 'V12', 86, null, 2065, 2012, null, null],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Guascor')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, series, cyl, config, displ, cr, kw50, kwe50, kw60, kwe60] of MODELS) {
  const slug = 'guascor-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const dual = kwe60 != null
  const fields = {
    series, fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: cyl, configuration: config, displacement_l: displ,
    ...(cr != null ? { compression_ratio: crText(cr) } : {}),
    prime_power_kw_50hz: kw50, prime_power_kwe_50hz: kwe50, prime_power_kva_50hz: kva(kwe50),
    ...(dual ? {
      prime_power_kw_60hz: kw60, prime_power_kwe_60hz: kwe60, prime_power_kva_60hz: kva(kwe60),
    } : {}),
    description: `Guascor ${model} — ${displ} L ${config} spark-ignition gas engine (${series} series), `
      + `multi-fuel: natural gas, biogas, landfill/sewage gas, syngas, propane and wellhead/flare gas. `
      + `${kwe50} kWe at 1500 rpm / 50 Hz${dual ? `, ${kwe60} kWe at 1800 rpm / 60 Hz` : ''}`
      + `${cr != null ? `; ${crText(cr)} compression` : ''}; low-emission (NOx < 1 g/bhp·hr).`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'Guascor', model, status: 'active', origin: 'Spain',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} Guascor gas engines`)
