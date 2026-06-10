// Niigata 28AGS spark-ignited lean-burn gas engines, made by Niigata Power Systems (IHI Group /
// IHI Power Systems), Japan. New brand. Medium-speed gas engines for high-efficiency cogeneration.
// Bore 280 × stroke 390 mm (24.0 L/cyl, same platform as the AHX). The 2000/4000/6000 kWe ratings
// are published; they map cleanly to 6L/12V/18V at ~333 kWe/cyl (engine ~350 kW/cyl, matching AHX).
// kVA = kWe/0.8. ~750 rpm.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, cyl, config, displ_L, kWe]
const MODELS = [
  ['6L28AGS', 6, 'L6', 144, 2000],
  ['12V28AGS', 12, 'V12', 288, 4000],
  ['18V28AGS', 18, 'V18', 432, 6000],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Niigata')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let upd = 0, ins = 0
for (const [model, cyl, config, displ, kwe] of MODELS) {
  const slug = 'niigata-' + model.toLowerCase()
  const fields = {
    series: '28AGS', fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 750, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8), power_kw: Math.round(kwe / 0.96),
    description: `Niigata ${model} — ${displ} L ${config} (280 × 390 mm) spark-ignited lean-burn natural-gas `
      + `engine (Niigata Power Systems / IHI Group), for high-efficiency cogeneration. ${kwe} kWe at ~750 rpm.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Niigata', model, status: 'active', origin: 'Japan', emissions_standard: 'Unregulated', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ updated ${upd}, inserted ${ins} Niigata (IHI) gas engines`)
