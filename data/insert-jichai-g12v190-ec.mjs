// Jichai G12V190 electronically-controlled (ZLDT) NG gensets (500-550 kW), official CNPC Jichai page.
// Second-gen: external mixing + electronic closed-loop AFR / lean-burn. V12, 190×210 mm = 71.4 L.
// ZLDT-2 = 50Hz/1000rpm/500kWe (500GF-TK1); ZLDT-1 = 60Hz/1200rpm/550kWe (550GF-T4).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
// [model, engKw, rpm, hz, kWe, genset]
const MODELS = [
  ['G12V190ZLDT-2', 550, 1000, 50, 500, '500GF-TK1'],
  ['G12V190ZLDT-1', 640, 1200, 60, 550, '550GF-T4'],
]
for (const [model, engKw, rpm, hz, kwe, genset] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const row = {
    brand: 'Jichai', model, status: 'active', origin: 'China', series: '190 series',
    fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: rpm, cylinders: 12, configuration: 'V12', displacement_l: 71.4, emissions_standard: 'Unregulated',
    power_kw: engKw,
    [`prime_power_kwe_${hz}hz`]: kwe, [`prime_power_kva_${hz}hz`]: round1(kwe / 0.8),
    description: `Jichai ${model} — 71.4 L V12 (190 × 210 mm) spark-ignited natural gas generator engine `
      + `(CNPC Jichai G12V190 electronic-control lean-burn series, genset ${genset}). ${engKw} kW engine / `
      + `${kwe} kWe at ${rpm} rpm / ${hz} Hz; external mixing with electronic closed-loop air-fuel ratio control, NOx ≤1200 mg/Nm³@5%O₂.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else console.log('· updated', model) }
  else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else console.log('✓ inserted', model) }
}
