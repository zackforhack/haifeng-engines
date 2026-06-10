// Jichai L16V200 gas gensets, official CNPC Jichai page. V16, 200×255 mm (8.01 L/cyl → 128.2 L,
// matching the L12V200 = 96.1 L platform). Engine 1760 kW, BMEP 1.648 MPa, >40% thermal eff,
// 1000 rpm, 10.5 kV. NG variant L16V200ZLT-2 (1600 kWe) + coal-mine-gas L16V200ZLWd-2 (1500 kWe).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
// [model, fuel, genset, kWe]
const MODELS = [
  ['L16V200ZLT-2', 'Natural Gas', '1600GF20-T', 1600],
  ['L16V200ZLWd-2', 'Coal Gas', '1500GF20-Wd', 1500],
]
for (const [model, fuel, genset, kwe] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const row = {
    brand: 'Jichai', model, status: 'active', origin: 'China', series: '200 series',
    fuel_type: fuel, ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1000, cylinders: 16, configuration: 'V16', displacement_l: 128.2, emissions_standard: 'Unregulated',
    power_kw: 1760, prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8),
    description: `Jichai ${model} — 128.2 L V16 (200 × 255 mm) spark-ignited gas generator engine (CNPC Jichai `
      + `L16V200 series, genset ${genset}). 1760 kW engine / ${kwe} kWe at 1000 rpm, 10.5 kV; BMEP 1.648 MPa, `
      + `thermal efficiency >40%; runs ${fuel === 'Coal Gas' ? 'coal-mine gas (瓦斯/CBM)' : 'natural gas, biogas or coal-mine gas'}.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else console.log('· updated', model) }
  else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else console.log('✓ inserted', model) }
}
