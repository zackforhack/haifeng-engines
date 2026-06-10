import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
const model = 'H16V190ZLZ-2', slug = 'jichai-h16v190zlz-2'
const row = {
  brand: 'Jichai', model, status: 'active', origin: 'China', series: '190 series',
  fuel_type: 'Biogas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
  rpm_rated: 1000, cylinders: 16, configuration: 'V16', displacement_l: 97.53, emissions_standard: 'Unregulated',
  power_kw: 1200, prime_power_kwe_50hz: 1000, prime_power_kva_50hz: round1(1000 / 0.8),
  description: `Jichai ${model} — 97.53 L V16 (190 × 215 mm) spark-ignited biogas (沼气) generator engine `
    + `(CNPC Jichai H16V190 Miller-cycle lean-burn series, gensets 1000GF-Z / 1000GF9-Z). 1200 kW engine / 1000 kWe `
    + `at 1000 rpm / 50 Hz; high-boost intake, closed-loop AFR; for landfill, wastewater, livestock and food-processing biogas; heat rate ≤10000 kJ/kWh, NOx ≤500 mg/Nm³@5%O₂.`,
}
if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else console.log('· updated', model) }
else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else console.log('✓ inserted', model) }
