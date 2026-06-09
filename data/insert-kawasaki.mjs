// Kawasaki Green Gas Engine (Kawasaki Heavy Industries, Japan), from the KG-series leaflet.
// New brand. Large lean-burn gas engines for power plants, bore 300 × stroke 480 mm (33.93 L/cyl),
// 750 rpm (50 Hz) / 720 rpm (60 Hz). 49% electrical efficiency (49.5% on -V high-efficiency models).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, cyl, config, displ_L, kWe50, kWe60]
const MODELS = [
  ['KG-12', 12, 'V12', 407.2, 5200, 5000],
  ['KG-18', 18, 'V18', 610.7, 7800, 7500],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Kawasaki')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let upd = 0, ins = 0
for (const [model, cyl, config, displ, kwe50, kwe60] of MODELS) {
  const slug = 'kawasaki-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const fields = {
    series: 'Green Gas Engine', fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition',
    cooling_method: 'Liquid-Cooled', rpm_rated: 750, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kwe_50hz: kwe50, prime_power_kva_50hz: round1(kwe50 / 0.8),
    prime_power_kwe_60hz: kwe60, prime_power_kva_60hz: round1(kwe60 / 0.8), power_kw: kwe50,
    description: `Kawasaki ${model} — ${displ} L ${config} (300 × 480 mm) lean-burn spark-ignited natural-gas `
      + `engine (Green Gas Engine series) for power plants. ${kwe50} kWe at 750 rpm / 50 Hz, ${kwe60} kWe at `
      + `720 rpm / 60 Hz; electrical efficiency 49.0% (49.5% on the -V high-efficiency model).`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Kawasaki', model, status: 'active', origin: 'Japan', emissions_standard: 'Unregulated', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ updated ${upd}, inserted ${ins} Kawasaki gas engines`)
