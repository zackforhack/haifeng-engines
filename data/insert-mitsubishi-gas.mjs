// Mitsubishi (MHI) GSR-series natural-gas generator engines, from the Mitsubishi Natural Gas
// Engine Lineup brochure. Added to the EXISTING 'Mitsubishi' brand (which already has the
// GS16R2-PTK-C plus the S-series diesels). Spark-ignited lean-burn. kVA = kWe/0.8.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// [model, cyl, config, displ_L, bore, stroke, kWeMax, kWeMin]
const MODELS = [
  ['GS6R2', 6, 'L6', 30, 170, 220, 450, 450],
  ['GS16R', 16, 'V16', 65, 170, 180, 815, 815],
  ['GS16R2', 16, 'V16', 80, 170, 220, 1500, 1000],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Mitsubishi')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, cyl, config, displ, bore, stroke, kweMax, kweMin] of MODELS) {
  const slug = 'mitsubishi-' + model.toLowerCase()
  const range = kweMin === kweMax ? `${kweMax}` : `${kweMin}–${kweMax}`
  const fields = {
    series: 'GSR', fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kwe_50hz: kweMax, prime_power_kva_50hz: round1(kweMax / 0.8), power_kw: kweMax,
    description: `Mitsubishi ${model} — ${displ} L ${config} (${bore} × ${stroke} mm) lean-burn spark-ignited `
      + `natural-gas generator engine (MHI GSR series). ${range} kWe at 1500 rpm; for power generation / CHP.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'Mitsubishi', model, status: 'active', origin: 'Japan',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} Mitsubishi gas engines`)
