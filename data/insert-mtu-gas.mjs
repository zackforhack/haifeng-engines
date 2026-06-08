// MTU (Rolls-Royce mtu, Friedrichshafen) Series 4000 natural-gas GenDrive engines, from the
// MTU Series 4000 gas spec sheet (50 Hz). Added to the EXISTING 'MTU' brand. 90° V, bore 170 ×
// stroke 210 mm (4.77 L/cyl), spark-ignited lean-burn. Headline = top GS L64 electrical output
// (kWe); range spans the L32/L33/L64 ratings. kVA = kWe/0.8. 1500 rpm (50 Hz).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// [model, cyl, config, displ_L, kWeMax, kWeMin]
const MODELS = [
  ['8V4000 GS', 8, 'V8', 38.2, 1012, 776],
  ['12V4000 GS', 12, 'V12', 57.2, 1523, 1169],
  ['16V4000 GS', 16, 'V16', 76.3, 2028, 1560],
  ['20V4000 GS', 20, 'V20', 95.3, 2535, 1948],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'MTU')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, cyl, config, displ, kweMax, kweMin] of MODELS) {
  const slug = 'mtu-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const fields = {
    series: 'Series 4000', fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kwe_50hz: kweMax, prime_power_kva_50hz: round1(kweMax / 0.8), power_kw: kweMax,
    description: `MTU ${model} — ${displ} L ${config} (170 × 210 mm) lean-burn spark-ignited natural-gas `
      + `GenDrive engine (mtu Series 4000). ${kweMin}–${kweMax} kWe across L32/L33/L64 ratings at 1500 rpm / 50 Hz, `
      + `electrical efficiency up to ~44%; NOx < 500 mg/Nm³.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'MTU', model, status: 'active', origin: 'Germany',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} MTU gas engines`)
