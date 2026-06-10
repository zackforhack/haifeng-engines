import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
const model = 'L20V190ZLZ-2', slug = 'jichai-l20v190zlz-2'
const row = {
  brand: 'Jichai', model, status: 'active', origin: 'China', series: '190 series',
  fuel_type: 'Biogas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
  rpm_rated: 1000, cylinders: 20, configuration: 'V20', displacement_l: 144.6, emissions_standard: 'Unregulated',
  power_kw: 1600, prime_power_kwe_50hz: 1500, prime_power_kva_50hz: round1(1500 / 0.8),
  description: `Jichai ${model} — 144.6 L V20 (190 × 255 mm) spark-ignited biogas (沼气) generator engine `
    + `(CNPC Jichai L20V190 lean-burn series, genset 1500GF-Z, 10.5 kV). 1600 kW engine / 1500 kWe at 1000 rpm / 50 Hz; `
    + `closed-loop AFR, smart cooling, low-pressure-gas capable; for landfill, wastewater, livestock and food-processing biogas; heat rate ≤9000 kJ/kWh, NOx ≤469 mg/Nm³@5%O₂.`,
}
if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else console.log('· updated', model) }
else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else console.log('✓ inserted', model) }
