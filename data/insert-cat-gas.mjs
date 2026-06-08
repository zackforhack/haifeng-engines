// Caterpillar gas generator-set engines (3500 series), from cat.com + the G3516 spec sheet.
// Added to the EXISTING 'Caterpillar' brand (alongside Cat diesels). 4-stroke spark-ignited
// natural-gas V-engines, bore 170 mm × stroke 190 mm (confirmed on G3516: V16 = 67.4 L → 4.21
// L/cyl). Headline = top-of-range electrical output (ekW) from Cat's model pages; G3516 = 1040
// ekW @ 60 Hz/1800 rpm confirmed. kVA = kWe/0.8.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// [model, cyl, config, displ_L, ekWmax, ekWmin]
const MODELS = [
  ['G3512', 12, 'V12', 50.5, 1000, 525],
  ['G3516', 16, 'V16', 67.4, 1500, 800],
  ['G3520', 20, 'V20', 84.2, 2500, 1750],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Caterpillar')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, cyl, config, displ, kweMax, kweMin] of MODELS) {
  const slug = 'caterpillar-' + model.toLowerCase()
  const fields = {
    series: '3500', fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kwe_50hz: kweMax, prime_power_kva_50hz: round1(kweMax / 0.8), power_kw: kweMax,
    description: `Caterpillar ${model} — ${displ} L ${config} (170 × 190 mm) 4-stroke spark-ignited `
      + `natural-gas generator-set engine (Cat 3500 series). ${kweMin}–${kweMax} ekW across ratings/variants `
      + `(standard & high-efficiency H), 1500 rpm (50 Hz) / 1800 rpm (60 Hz).`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'Caterpillar', model, status: 'active', origin: 'United States',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} Caterpillar gas engines`)
