// Wärtsilä gas engines (Wärtsilä Energy, Finland), from official product leaflets. Large
// four-stroke, spark-ignited, lean-burn gas engine generating sets for power plants.
//   34SG: bore 340 × stroke 400 mm (36.32 L/cyl), 12V/16V/20V, 750 rpm (50 Hz)/720 (60 Hz)
//   31SG: bore 310 × stroke 430 mm (32.45 L/cyl), 20V, the world's most efficient (51.5%)
// Rated electrical power (kWe) per the leaflets; kVA = kWe/0.8.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// [model, series, cyl, config, displ_L, kWe50, kWe60, effPct]
const MODELS = [
  ['12V34SG', '34SG', 12, 'V12', 435.9, 5840, 5580, 48.0],
  ['16V34SG', '34SG', 16, 'V16', 581.2, 7830, 7491, 48.9],
  ['20V34SG', '34SG', 20, 'V20', 726.5, 9795, 9388, 48.9],
  ['20V31SG', '31SG', 20, 'V20', 649.1, 11779, 11377, 51.5],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Wärtsilä')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, series, cyl, config, displ, kwe50, kwe60, eff] of MODELS) {
  const slug = 'wartsila-' + model.toLowerCase()
  const fields = {
    series, fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 750, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kwe_50hz: kwe50, prime_power_kva_50hz: round1(kwe50 / 0.8),
    prime_power_kwe_60hz: kwe60, prime_power_kva_60hz: round1(kwe60 / 0.8), power_kw: kwe50,
    description: `Wärtsilä ${model} — ${displ} L ${config} four-stroke lean-burn spark-ignited gas `
      + `engine generating set (Wärtsilä ${series}), for power plants. ${kwe50} kWe at 750 rpm / 50 Hz, `
      + `${kwe60} kWe at 720 rpm / 60 Hz; electrical efficiency ${eff}%.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'Wärtsilä', model, status: 'active', origin: 'Finland',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} Wärtsilä gas engines`)
