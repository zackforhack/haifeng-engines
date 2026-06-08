// Bergen gas engines (Bergen Engines, Norway — formerly Rolls-Royce), from the official
// B36:45V natural-gas spec sheet. Large lean-burn spark-ignited gas engine gensets for power
// plants. Bore 360 mm × stroke 450 mm (45.8 L/cyl, 600 kW/cyl). kVA = kWe/0.8. 750 rpm (50 Hz).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// [model, cyl, config, displ_L, kWe, weightKg]
const MODELS = [
  ['B36:45V12', 12, 'V12', 549.7, 7090, 100000],
  ['B36:45V16', 16, 'V16', 732.9, 9470, 150000],
  ['B36:45V20', 20, 'V20', 916.1, 11830, 170000],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Bergen')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, cyl, config, displ, kwe, wt] of MODELS) {
  const slug = 'bergen-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const fields = {
    series: 'B36:45', fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 750, cylinders: cyl, configuration: config, displacement_l: displ, weight_kg: wt,
    prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8), power_kw: kwe,
    description: `Bergen ${model} — ${displ} L ${config} (360 × 450 mm) lean-burn spark-ignited natural-gas `
      + `engine generating set (Bergen B36:45 series), 600 kW/cylinder. ${kwe} kWe at 750 rpm / 50 Hz; for power plants.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'Bergen', model, status: 'active', origin: 'Norway',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} Bergen gas engines`)
