// Jichai L20V190 natural gas genset (2000 kW), official CNPC Jichai page. AFR closed-loop lean-burn,
// smart cooling, low-pressure-gas capable. V20, 190×255 mm = 144.6 L. L20V190ZLT-2: 2100kW engine /
// 2000kWe (2000GF10-T, 10.5kV, 50Hz), 1000rpm, heat rate ≤9000, NOx ≤469. Replaces earlier generic.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// retire any earlier L20V190 gas variant that isn't the official -2 code
await supabase.from('engines').delete().eq('brand', 'Jichai').ilike('model', 'L20V190%').neq('model', 'L20V190ZLT-2')
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
const model = 'L20V190ZLT-2', slug = 'jichai-l20v190zlt-2'
const row = {
  brand: 'Jichai', model, status: 'active', origin: 'China', series: '190 series',
  fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
  rpm_rated: 1000, cylinders: 20, configuration: 'V20', displacement_l: 144.6, emissions_standard: 'Unregulated',
  power_kw: 2100, prime_power_kwe_50hz: 2000, prime_power_kva_50hz: round1(2000 / 0.8),
  description: `Jichai ${model} — 144.6 L V20 (190 × 255 mm) spark-ignited natural gas generator engine `
    + `(CNPC Jichai L20V190 lean-burn series, genset 2000GF10-T, 10.5 kV). 2100 kW engine / 2000 kWe at 1000 rpm / 50 Hz; `
    + `closed-loop air-fuel ratio control, smart cooling, low-pressure-gas capable, heat rate ≤9000 kJ/kWh, NOx ≤469 mg/Nm³@5%O₂.`,
}
if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else console.log('· updated', model) }
else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else console.log('✓ inserted', model) }
