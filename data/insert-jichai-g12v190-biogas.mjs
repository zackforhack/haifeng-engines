// Jichai G12V190 biogas (沼气) genset, official CNPC Jichai page. External mixing + electronic AFR,
// adapts to varying methane content; for landfill/wastewater/livestock/food-processing biogas.
// V12, 190×210 mm = 71.4 L, 1000 rpm, NOx ≤1200. G12V190ZLDZ2-2: 660kW engine / 500kWe (600GF-N).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
const model = 'G12V190ZLDZ2-2', slug = 'jichai-g12v190zldz2-2'
const row = {
  brand: 'Jichai', model, status: 'active', origin: 'China', series: '190 series',
  fuel_type: 'Biogas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
  rpm_rated: 1000, cylinders: 12, configuration: 'V12', displacement_l: 71.4, emissions_standard: 'Unregulated',
  power_kw: 660, prime_power_kwe_50hz: 500, prime_power_kva_50hz: round1(500 / 0.8),
  description: `Jichai ${model} — 71.4 L V12 (190 × 210 mm) spark-ignited biogas (沼气) generator engine `
    + `(CNPC Jichai G12V190 series, genset 600GF-N). 660 kW engine / 500 kWe at 1000 rpm / 50 Hz; external mixing `
    + `with electronic air-fuel ratio control, adapts to varying methane content for landfill, wastewater, livestock `
    + `and food-processing biogas; NOx ≤1200 mg/Nm³@5%O₂.`,
}
if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else console.log('· updated', model) }
else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else console.log('✓ inserted', model) }
