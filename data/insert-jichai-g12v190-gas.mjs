// Jichai G12V190 first-gen mechanical external-mix natural gas gensets (400-550 kW), official CNPC
// Jichai page. V12, 190×210 mm (π/4·19²·21 = 5.95 L/cyl → 71.4 L), 1000 rpm, single-point injection /
// post-turbo membrane mixing, NOx ≤1200 mg/Nm³@5%O2, heat rate ≤11000 kJ/kWh. Retires generic 12V190.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
await supabase.from('engines').delete().eq('brand', 'Jichai').eq('model', '12V190')  // retire placeholder
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
// [model, engKw, kWe, genset]
const MODELS = [
  ['12V190DT2-2', 450, 400, '400GF-T'],
  ['12V190ZDT-2', 550, 500, '500GF18-TK1 / 500GF-T6'],
  ['12V190ZDT1-2', 600, 550, '550GF-TK'],
]
for (const [model, engKw, kwe, genset] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const row = {
    brand: 'Jichai', model, status: 'active', origin: 'China', series: '190 series',
    fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1000, cylinders: 12, configuration: 'V12', displacement_l: 71.4, emissions_standard: 'Unregulated',
    power_kw: engKw, prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8),
    description: `Jichai ${model} — 71.4 L V12 (190 × 210 mm) spark-ignited natural gas generator engine `
      + `(CNPC Jichai G12V190 first-generation external-mix series, genset ${genset}). ${engKw} kW engine / `
      + `${kwe} kWe at 1000 rpm; single-point injection with post-turbo membrane mixing, NOx ≤1200 mg/Nm³@5%O₂.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else console.log('· updated', model) }
  else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else console.log('✓ inserted', model) }
}
