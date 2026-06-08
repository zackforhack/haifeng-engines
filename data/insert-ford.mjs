// Ford Power Products EPA/CARB-certified spark-ignition genset engines, from the official
// "Ford EPA NG LP Genset Engine Data" sheet. Bi-fuel natural gas / LPG, all 1800 rpm (60 Hz).
// Published power is SAE J1349 intermittent (engine mechanical). We store the NG rating as the
// engine's prime kW and derive genset kWe = kWm × 0.9 (alternator eff) and kVA = kWe / 0.8.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const LB_TO_KG = 0.453592

// [model, series, cylinders, config, displ_L, compression, aspiration, weightLb, ngKwm, ngHp, lpKwm, lpHp]
const MODELS = [
  ['MSG425', 'MSG', 4, 'L4', 2.5, 9.7, 'Naturally aspirated', 351, 34.7, 46.6, 36.0, 48.7],
  ['LSG635', 'LSG', 6, 'V6', 3.5, 11.8, 'Naturally aspirated', 390.2, 45.6, 61.1, 49.7, 66.6],
  ['WSG850', 'WSG', 8, 'V8', 5.0, 12, 'Naturally aspirated', 453, 59.3, 79.5, 65.3, 87.6],
  ['WSG873', 'WSG', 8, 'V8', 7.3, 10.5, 'Naturally aspirated', 580, 90.2, 120.9, 98.8, 132.4],
  ['WSG873-T', 'WSG', 8, 'V8', 7.3, 10.5, 'Turbocharged', 580, 130, 174, 137, 184],
  ['WSG873-T-CAC', 'WSG', 8, 'V8', 7.3, 10.5, 'Turbocharged + charge-air-cooled', 580, 138, 185, 146, 196],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Ford')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, series, cyl, config, displ, cr, asp, weightLb, ngKwm, ngHp, lpKwm, lpHp] of MODELS) {
  const slug = 'ford-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const kwe = Math.round(ngKwm * 0.9)
  const kva = round1(kwe / 0.8)
  const fields = {
    series, fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800, cylinders: cyl, configuration: config, displacement_l: displ, compression_ratio: cr,
    weight_kg: round1(weightLb * LB_TO_KG), power_kw: ngKwm, power_hp: ngHp,
    prime_power_kw_60hz: ngKwm, prime_power_kwe_60hz: kwe, prime_power_kva_60hz: kva,
    certifications: ['EPA', 'CARB', '3-way catalyst'],
    description: `Ford Power Products ${model} — ${displ} L ${config} spark-ignition genset engine, `
      + `${asp.toLowerCase()}, bi-fuel natural gas / LPG. ${ngKwm} kWm (${ngHp} hp) on natural gas, `
      + `${lpKwm} kWm (${lpHp} hp) on LPG at 1800 rpm (SAE J1349 intermittent); ${cr}:1 compression, `
      + `EPA/CARB certified with 3-way catalyst.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'Ford', model, status: 'active', origin: 'United States',
      emissions_standard: 'EPA Certified', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} Ford gas engines`)
