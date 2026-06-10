// Jichai H16V190 coal-mine-gas (瓦斯/CBM) gensets (1000 kW), official CNPC Jichai page. Miller-cycle,
// high-boost, lean-burn, closed-loop AFR; adapts to 8%-40% CBM concentration. V16, 190×215 mm = 97.53 L,
// 1000 rpm, NOx ≤500. ZLW-2 (1000GF-W/1000GF9-W) + ZLWd1-2 (1000GF9-Wd, low-concentration).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
// [model, genset, note]
const MODELS = [
  ['H16V190ZLW-2', '1000GF-W (400V) / 1000GF9-W (10.5kV)', 'standard coal-mine gas'],
  ['H16V190ZLWd1-2', '1000GF9-Wd (10.5kV)', 'low-concentration coal-mine gas'],
]
for (const [model, genset, note] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const row = {
    brand: 'Jichai', model, status: 'active', origin: 'China', series: '190 series',
    fuel_type: 'Coal Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1000, cylinders: 16, configuration: 'V16', displacement_l: 97.53, emissions_standard: 'Unregulated',
    power_kw: 1200, prime_power_kwe_50hz: 1000, prime_power_kva_50hz: round1(1000 / 0.8),
    description: `Jichai ${model} — 97.53 L V16 (190 × 215 mm) spark-ignited coal-mine-gas (瓦斯/CBM) generator `
      + `engine (CNPC Jichai H16V190 Miller-cycle lean-burn series, genset ${genset}). 1200 kW engine / 1000 kWe at `
      + `1000 rpm / 50 Hz; ${note}, adapts to 8%–40% gas concentration, heat rate ≤10000 kJ/kWh, NOx ≤500 mg/Nm³@5%O₂.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else console.log('· updated', model) }
  else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else console.log('✓ inserted', model) }
}
