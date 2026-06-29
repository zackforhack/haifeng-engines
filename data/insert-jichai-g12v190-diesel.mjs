// Jichai G12V190 DIESEL series (800 kW genset), from the official CNPC Jichai page. Upgraded from
// the "gold-medal" Z12V190. V12, 190×210 mm (71.45 L). Genset 800 kWe, 400 V–10.5 kV; engines
// G12V190ZLD3 (1000 kW) / AG12V190ZLD (900 kW). 1500 rpm, GB20891 Stage III. kVA = kWe/0.8.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, engKw, kWe, fuelRate, weight, L, W, H]
const MODELS = [
  ['G12V190ZLD3', 1000, 800, 205, 14500, 6273, 2200, 2842],
  ['AG12V190ZLD', 900, 800, 208, 14800, 6450, 2200, 2842],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let ins = 0, upd = 0
for (const [model, engKw, kwe, fr, wt, L, W, H] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase()
  const fields = {
    series: '190 series', fuel_type: 'Diesel', ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: 12, configuration: 'V12', displacement_l: 71.45, weight_kg: wt,
    length_mm: L, width_mm: W, height_mm: H, emissions_standard: 'China III (GB20891)', compression_ratio: '14:1',
    power_kw: engKw, prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8),
    description: `Jichai ${model} — 71.45 L V12 (190 × 210 mm) common-rail turbocharged diesel generator `
      + `engine (CNPC Jichai G12V190 series, upgraded from the Z12V190). ${engKw} kW engine / ${kwe} kWe genset `
      + `(400 V–10.5 kV) at 1500 rpm, GB20891 Stage III, ≤${fr} g/kWh.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Jichai', model, status: 'active', origin: 'China', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ inserted ${ins}, updated ${upd} Jichai G12V190 diesel`)
