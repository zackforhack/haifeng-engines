// Jichai 140-series DIESEL gensets, from the official CNPC Jichai 140系列柴油发电机组 page.
// Bore 140 × stroke 165 mm (2.54 L/cyl): JC15D = L6 (15.2 L), JC30D = V12 (30.5 L). GB20891
// Stage III (China nonroad III), 1500 rpm, fuel rate ≤190 g/kWh. Stores engine kW (power_kw) +
// genset kWe (prime_power_kwe_50hz). kVA = kWe/0.8.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, genset, cyl, config, displ, engKw, kWe, weight, L, W, H]
const MODELS = [
  ['JC15D', '400GF30', 6, 'L6', 15.2, 457, 400, 4600, 3570, 1274, 1700],
  ['JC15D2', '450GF30', 6, 'L6', 15.2, 503, 450, 4600, 3570, 1274, 1700],
  ['JC30D', '800GF30', 12, 'V12', 30.5, 916, 800, 12000, 5500, 1840, 2620],
  ['JC30D1', '850GF30', 12, 'V12', 30.5, 950, 850, 12000, 5500, 1840, 2620],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let ins = 0, upd = 0
for (const [model, genset, cyl, config, displ, engKw, kwe, wt, L, W, H] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase()
  const fields = {
    series: '140 series', fuel_type: 'Diesel', ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: cyl, configuration: config, displacement_l: displ, weight_kg: wt,
    length_mm: L, width_mm: W, height_mm: H, emissions_standard: 'China III (GB20891)',
    power_kw: engKw, prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8),
    description: `Jichai ${model} — ${displ} L ${config} (140 × 165 mm) common-rail turbocharged diesel `
      + `generator engine (CNPC Jichai 140 series, genset ${genset}). ${engKw} kW engine / ${kwe} kWe genset at `
      + `1500 rpm, GB20891 Stage III, ≤190 g/kWh.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Jichai', model, status: 'active', origin: 'China', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ inserted ${ins}, updated ${upd} Jichai 140-series diesel`)
