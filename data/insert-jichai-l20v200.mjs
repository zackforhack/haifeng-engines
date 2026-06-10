// Jichai L20V200 gas gensets, official CNPC Jichai page. V20, 200×255 mm (8.01 L/cyl → 160.2 L),
// 1000 rpm, 10.5 kV, BMEP 1.65 MPa, >40% thermal eff. NG L20V200ZLT-2 (2200kW eng / 2000kWe) +
// coal-mine-gas L20V200ZLWd-2 (1800kW eng / 1700kWe).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
// [model, fuel, genset, engKw, kWe]
const MODELS = [
  ['L20V200ZLT-2', 'Natural Gas', '2000GF20-T', 2200, 2000],
  ['L20V200ZLWd-2', 'Coal Gas', '1700GF20-Wd', 1800, 1700],
]
for (const [model, fuel, genset, engKw, kwe] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const row = {
    brand: 'Jichai', model, status: 'active', origin: 'China', series: '200 series',
    fuel_type: fuel, ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1000, cylinders: 20, configuration: 'V20', displacement_l: 160.2, emissions_standard: 'Unregulated',
    power_kw: engKw, prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8),
    description: `Jichai ${model} — 160.2 L V20 (200 × 255 mm) spark-ignited gas generator engine (CNPC Jichai `
      + `L20V200 series, genset ${genset}). ${engKw} kW engine / ${kwe} kWe at 1000 rpm, 10.5 kV; BMEP 1.65 MPa, `
      + `thermal efficiency >40%; runs ${fuel === 'Coal Gas' ? 'coal-mine gas (瓦斯/CBM)' : 'natural gas, biogas or coal-mine gas'}.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else console.log('· updated', model) }
  else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else console.log('✓ inserted', model) }
}
