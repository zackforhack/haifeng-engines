// Jichai 260 gas gensets, official CNPC Jichai page. 4-stroke turbo, two-stage intercool, multi-point
// injection, closed-loop AFR. 260×320 mm = 16.99 L/cyl → 12V 203.9 L / 16V 271.8 L. 900rpm/60Hz +
// 1000rpm/50Hz, electric eff ≥43%, heat rate ≤8100, IMO Tier II / China marine II. Genset model nos:
// 12V → 2700GF (2700kW@60Hz) / 3000GF (3000kW@50Hz); 16V → 3600GF (3600kW@60Hz) / 4000GF (4000kW@50Hz).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
// [model, cyl, config, displ, kWe50, kWe60, gensets]
const MODELS = [
  ['12V26/32-G', 12, 'V12', 203.9, 3000, 2700, '3000GF (1000rpm/50Hz) / 2700GF (900rpm/60Hz)'],
  ['16V26/32-G', 16, 'V16', 271.8, 4000, 3600, '4000GF (1000rpm/50Hz) / 3600GF (900rpm/60Hz)'],
]
for (const [model, cyl, config, displ, kwe50, kwe60, gensets] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const row = {
    brand: 'Jichai', model, status: 'active', origin: 'China', series: '260 series',
    fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1000, cylinders: cyl, configuration: config, displacement_l: displ, emissions_standard: 'IMO Tier II',
    power_kw: kwe50,
    prime_power_kwe_50hz: kwe50, prime_power_kva_50hz: round1(kwe50 / 0.8),
    prime_power_kwe_60hz: kwe60, prime_power_kva_60hz: round1(kwe60 / 0.8),
    description: `Jichai ${model} — ${displ} L ${config} (260 × 320 mm) spark-ignited natural gas generator engine `
      + `(CNPC Jichai 260 gas series, gensets ${gensets}). ${kwe50} kWe @ 1000 rpm/50 Hz, ${kwe60} kWe @ 900 rpm/60 Hz; `
      + `turbocharged with two-stage intercooling, multi-point injection, closed-loop AFR; electrical efficiency ≥43%, `
      + `heat rate ≤8100 kJ/kWh, 35,000 h overhaul interval; IMO Tier II / China marine Stage II.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else console.log('· updated', model) }
  else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else console.log('✓ inserted', model) }
}
