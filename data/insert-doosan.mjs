// Doosan (HD Hyundai Infracore, South Korea) lean-burn natural-gas generator engines, from
// doosanengine.com / official manuals. New brand. Published power is the engine max rating (kW);
// genset kWe derived at 0.95. kVA = kWe/0.8. 1500 rpm (50 Hz) / 1800 (60 Hz).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, cyl, config, displ_L, bore, stroke, engineKw]
const MODELS = [
  ['GE08TI', 6, 'L6', 8.1, 111, 139, 165],
  ['GV158TI', 8, 'V8', 14.6, 128, 142, 297],
  ['GV180TI', 10, 'V10', 18.3, 128, 142, 374],
  ['GV222TI', 12, 'V12', 21.9, 128, 142, 451],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Doosan')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let upd = 0, ins = 0
for (const [model, cyl, config, displ, bore, stroke, engKw] of MODELS) {
  const slug = 'doosan-' + model.toLowerCase()
  const kwe = Math.round(engKw * 0.95)
  const fields = {
    series: model.replace(/TI$/, ''), fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition',
    cooling_method: 'Liquid-Cooled', rpm_rated: 1500, cylinders: cyl, configuration: config, displacement_l: displ,
    power_kw: engKw, prime_power_kw_50hz: engKw, prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8),
    description: `Doosan ${model} — ${displ} L ${config} (${bore} × ${stroke} mm) turbocharged lean-burn spark-ignited `
      + `natural-gas generator engine. ${engKw} kW engine output (~${kwe} kWe) at 1500 rpm (50 Hz) / 1800 rpm (60 Hz).`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Doosan', model, status: 'active', origin: 'South Korea', emissions_standard: 'Unregulated', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ updated ${upd}, inserted ${ins} Doosan gas engines`)
