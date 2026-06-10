// DEUTZ TCG 2015 natural-gas engines, from deutzsupport.com / deutz.com. Added to the EXISTING
// 'Deutz' brand. 90° V, bore 132 × stroke 145 mm (1.985 L/cyl), turbocharged charge-air-cooled,
// liquid-cooled. Engine kW published; genset kWe derived at 0.95. 1800 rpm.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, cyl, config, displ_L, engineKw]
const MODELS = [
  ['TCG 2015 V6', 6, 'V6', 11.9, 180],
  ['TCG 2015 V8', 8, 'V8', 15.9, 240],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Deutz')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let upd = 0, ins = 0
for (const [model, cyl, config, displ, engKw] of MODELS) {
  const slug = 'deutz-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const kwe = Math.round(engKw * 0.95)
  const fields = {
    series: 'TCG 2015', fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800, cylinders: cyl, configuration: config, displacement_l: displ,
    power_kw: engKw, prime_power_kw_60hz: engKw, prime_power_kwe_60hz: kwe, prime_power_kva_60hz: round1(kwe / 0.8),
    description: `Deutz ${model} — ${displ} L ${config} (132 × 145 mm) turbocharged charge-air-cooled lean-burn `
      + `natural-gas engine (Deutz TCG 2015 series) for CHP/power generation. ${engKw} kW (~${kwe} kWe) at 1800 rpm.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Deutz', model, status: 'active', origin: 'Germany', emissions_standard: 'Unregulated', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ updated ${upd}, inserted ${ins} Deutz gas engines`)
