// Cummins gas generator-set engines, from official Cummins spec sheets. Added to the EXISTING
// 'Cummins' brand (alongside Cummins diesels). Lean-burn spark-ignited natural-gas gensets:
//   QSK60G  — V16, 60.2 L (bore 159 × stroke 190 mm),    995–1540 kWe
//   QSV91G  — V18, 91.6 L (bore 180 × stroke 200 mm),  1540–2000 kWe
//   HSK78G  — V12, 78.0 L (bore 190 × stroke 230 mm),  1600–2000 kWe
// Headline = top of published genset kWe range; kVA = kWe/0.8. 1500 rpm (50 Hz) / 1800 (60 Hz).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// [model, cyl, config, displ_L, bore, stroke, kWeMax, kWeMin]
const MODELS = [
  ['QSK60G', 16, 'V16', 60.2, 159, 190, 1540, 995],
  ['QSV91G', 18, 'V18', 91.6, 180, 200, 2000, 1540],
  ['HSK78G', 12, 'V12', 78.0, 190, 230, 2000, 1600],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Cummins')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, cyl, config, displ, bore, stroke, kweMax, kweMin] of MODELS) {
  const slug = 'cummins-' + model.toLowerCase()
  const fields = {
    series: model.replace(/G$/, ''), fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition',
    cooling_method: 'Liquid-Cooled', rpm_rated: 1500, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kwe_50hz: kweMax, prime_power_kva_50hz: round1(kweMax / 0.8), power_kw: kweMax,
    description: `Cummins ${model} — ${displ} L ${config} (${bore} × ${stroke} mm) lean-burn spark-ignited `
      + `natural-gas generator-set engine. ${kweMin}–${kweMax} kWe across ratings, 1500 rpm (50 Hz) / `
      + `1800 rpm (60 Hz); for prime, continuous and CHP power.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'Cummins', model, status: 'active', origin: 'United States',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} Cummins gas engines`)
