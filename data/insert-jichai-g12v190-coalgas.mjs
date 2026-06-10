// Jichai G12V190 coal-mine-gas (瓦斯/CBM) gensets (500-600 kW), official CNPC Jichai page. External
// mixing + electronic AFR for variable CBM concentration (8%-40%); low-conc units add fine-water-mist
// safe ground transport. V12, 190×210 mm = 71.4 L, 1000 rpm, NOx ≤1200 mg/Nm³.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
// [model, engKw, kWe, genset]
const MODELS = [
  ['G12V190ZLDW-2', 550, 500, '500GF-WK'],
  ['G12V190ZLWd4-2', 660, 600, '600GF-Wd (400V) / 600GF9-WdK (10.5kV)'],
]
for (const [model, engKw, kwe, genset] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const row = {
    brand: 'Jichai', model, status: 'active', origin: 'China', series: '190 series',
    fuel_type: 'Coal Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1000, cylinders: 12, configuration: 'V12', displacement_l: 71.4, emissions_standard: 'Unregulated',
    power_kw: engKw, prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8),
    description: `Jichai ${model} — 71.4 L V12 (190 × 210 mm) spark-ignited coal-mine-gas (瓦斯/CBM) generator `
      + `engine (CNPC Jichai G12V190 series, genset ${genset}). ${engKw} kW engine / ${kwe} kWe at 1000 rpm / 50 Hz; `
      + `external mixing with electronic AFR control for 8%–40% gas concentration, NOx ≤1200 mg/Nm³@5%O₂.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else console.log('· updated', model) }
  else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else console.log('✓ inserted', model) }
}
