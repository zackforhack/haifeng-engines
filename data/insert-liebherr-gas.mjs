// Liebherr gas engine (Liebherr Machines Bulle, Switzerland), from the official G9620 short
// description. Added to the EXISTING 'Liebherr' brand. V20, bore 135 × stroke 170 mm, 48.7 L,
// 44% mechanical efficiency. ISO output 1060 kW (50 Hz/1500 rpm) / 1070 kW (60 Hz/1800 rpm);
// genset kWe derived at 0.97. kVA = kWe/0.8.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const MODELS = [['G9620', 20, 'V20', 48.7, 1060, 1070]]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Liebherr')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let upd = 0, ins = 0
for (const [model, cyl, config, displ, kw50, kw60] of MODELS) {
  const slug = 'liebherr-' + model.toLowerCase()
  const e50 = Math.round(kw50 * 0.97), e60 = Math.round(kw60 * 0.97)
  const fields = {
    series: 'G9620', fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: cyl, configuration: config, displacement_l: displ, power_kw: kw50,
    prime_power_kw_50hz: kw50, prime_power_kwe_50hz: e50, prime_power_kva_50hz: round1(e50 / 0.8),
    prime_power_kw_60hz: kw60, prime_power_kwe_60hz: e60, prime_power_kva_60hz: round1(e60 / 0.8),
    description: `Liebherr ${model} — ${displ} L ${config} (135 × 170 mm) lean-burn spark-ignited natural-gas `
      + `engine for CHP/power generation. ISO output ${kw50} kW at 1500 rpm / 50 Hz (~${e50} kWe), ${kw60} kW at `
      + `1800 rpm / 60 Hz; 44% mechanical efficiency.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Liebherr', model, status: 'active', origin: 'Switzerland', emissions_standard: 'Unregulated', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ updated ${upd}, inserted ${ins} Liebherr gas engines`)
