// Jichai H16V190 DIESEL series (1400-2200 kW), official CNPC Jichai page. V16, 190×215 mm
// (97.53 L). High-boost ECU common-rail, GB20891 Stage III. Engines H16V190ZLD-2 (1600kW@1000rpm),
// H16V190ZLD (2200kW@1500), AH16V190ZLD (2400kW@1500). Genset 400V-10.5kV. kVA = kWe/0.8.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, engKw, kWe, rpm, fuelRate]
const MODELS = [
  ['H16V190ZLD-2', 1600, 1400, 1000, 202],
  ['H16V190ZLD', 2200, 2000, 1500, 205],
  ['AH16V190ZLD', 2400, 2200, 1500, 205],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let ins = 0, upd = 0
for (const [model, engKw, kwe, rpm, fr] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const fields = {
    series: '190 series', fuel_type: 'Diesel', ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: rpm, cylinders: 16, configuration: 'V16', displacement_l: 97.53, compression_ratio: 14,
    emissions_standard: 'China III (GB20891)', power_kw: engKw, prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8),
    description: `Jichai ${model} — 97.53 L V16 (190 × 215 mm) high-boost turbocharged diesel generator engine `
      + `(CNPC Jichai H16V190 series). ${engKw} kW engine / ${kwe} kWe genset (400 V–10.5 kV) at ${rpm} rpm, `
      + `GB20891 Stage III, ≤${fr} g/kWh.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Jichai', model, status: 'active', origin: 'China', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
// correct generic 16V190 stroke/displacement (215mm -> 97.53L, not the earlier 95.3 estimate)
const { data: g } = await supabase.from('engines').update({ displacement_l: 97.53 }).eq('brand', 'Jichai').eq('model', '16V190').select('id')
console.log(`✓ inserted ${ins}, updated ${upd} H16V190 diesel; corrected generic 16V190 displ (${g?.length ?? 0})`)
