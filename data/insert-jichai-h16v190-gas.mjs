// Jichai H16V190 natural gas gensets (1000-1500 kW), official CNPC Jichai page. Miller-cycle, high-
// boost, lean-burn, closed-loop AFR. V16, 190×215 mm = 97.53 L (matches the H16V190 diesel block).
// ZLT-2 = 50Hz/1000rpm/1100kWe (1100GF-T 400V + 1100GF1-T 10.5kV); ZLT-1 = 60Hz/1200rpm/1500kWe (1500GF-T).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
// [model, engKw, rpm, hz, kWe, genset]
const MODELS = [
  ['H16V190ZLT-2', 1200, 1000, 50, 1100, '1100GF-T (400V) / 1100GF1-T (10.5kV)'],
  ['H16V190ZLT-1', 1600, 1200, 60, 1500, '1500GF-T'],
]
for (const [model, engKw, rpm, hz, kwe, genset] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const row = {
    brand: 'Jichai', model, status: 'active', origin: 'China', series: '190 series',
    fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: rpm, cylinders: 16, configuration: 'V16', displacement_l: 97.53, emissions_standard: 'Unregulated',
    power_kw: engKw,
    [`prime_power_kwe_${hz}hz`]: kwe, [`prime_power_kva_${hz}hz`]: round1(kwe / 0.8),
    description: `Jichai ${model} — 97.53 L V16 (190 × 215 mm) spark-ignited natural gas generator engine `
      + `(CNPC Jichai H16V190 Miller-cycle lean-burn series, genset ${genset}). ${engKw} kW engine / ${kwe} kWe `
      + `at ${rpm} rpm / ${hz} Hz; high-boost intake, closed-loop air-fuel ratio control, heat rate ≤10000 kJ/kWh, NOx ≤500 mg/Nm³@5%O₂.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else console.log('· updated', model) }
  else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else console.log('✓ inserted', model) }
}
