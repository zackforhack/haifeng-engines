// FPT Industrial (Italy) natural-gas G-Drive genset engines, from fptindustrial.com. Added to the
// EXISTING 'FPT' brand. Turbocharged spark-ignited NG, inline-6. Genset ratings given at 60 Hz
// (1800 rpm; engines are 1500/1800 switchable). kVA = kWe/0.8.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, cyl, config, displ_L, bore, stroke, prime60, standby60]
const MODELS = [
  ['N67 NG', 6, 'L6', 6.7, 104, 132, 187, null],
  ['CURSOR 9 NG', 6, 'L6', 8.7, 117, 135, 275, 304],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'FPT')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let upd = 0, ins = 0
for (const [model, cyl, config, displ, bore, stroke, p60, s60] of MODELS) {
  const slug = 'fpt-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const fields = {
    series: model.split(' ')[0], fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition',
    cooling_method: 'Liquid-Cooled', rpm_rated: 1800, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kwe_60hz: p60, prime_power_kva_60hz: round1(p60 / 0.8), power_kw: p60,
    ...(s60 != null ? { standby_power_kwe_60hz: s60, standby_power_kva_60hz: round1(s60 / 0.8) } : {}),
    description: `FPT ${model} — ${displ} L ${config} (${bore} × ${stroke} mm) turbocharged spark-ignited `
      + `natural-gas G-Drive genset engine. ${p60} kWe prime${s60 != null ? ` / ${s60} kWe standby` : ''} at `
      + `1800 rpm / 60 Hz (1500/1800 rpm switchable for 50/60 Hz).`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'FPT', model, status: 'active', origin: 'Italy', emissions_standard: 'Unregulated', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ updated ${upd}, inserted ${ins} FPT gas engines`)
