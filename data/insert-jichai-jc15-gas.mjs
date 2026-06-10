// Jichai JC15 gas series (140-series gas), official CNPC Jichai page. L6, 140×165 mm (15.2 L),
// 1500 rpm, GB20891 Stage III, 0.27 Nm³/kWh. T = 天然气 natural gas (JC15T/JC15T1),
// Z = 沼气 biogas (JC15Z/JC15Z1). Replaces the earlier generic "6140" placeholder.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
await supabase.from('engines').delete().eq('brand', 'Jichai').eq('model', '6140')  // retire placeholder
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
// [model, fuel, genset, engKw, kWe]
const MODELS = [
  ['JC15T1', 'Natural Gas', '250GF30-T', 300, 250],
  ['JC15T', 'Natural Gas', '300GF30-T', 350, 300],
  ['JC15Z1', 'Biogas', '250GF30-N', 300, 250],
  ['JC15Z', 'Biogas', '300GF30-N', 350, 300],
]
for (const [model, fuel, genset, engKw, kwe] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase()
  const row = {
    brand: 'Jichai', model, status: 'active', origin: 'China', series: '140 series',
    fuel_type: fuel, ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: 6, configuration: 'L6', displacement_l: 15.2, emissions_standard: 'China III (GB20891)',
    power_kw: engKw, prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8),
    description: `Jichai ${model} — 15.2 L L6 (140 × 165 mm) spark-ignited lean-burn gas generator engine `
      + `(CNPC Jichai 140/JC15 series, genset ${genset}). ${engKw} kW engine / ${kwe} kWe at 1500 rpm, `
      + `runs ${fuel === 'Biogas' ? 'biogas (沼气)' : 'natural gas'}; GB20891 Stage III, 0.27 Nm³/kWh.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else console.log('· updated', model) }
  else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else console.log('✓ inserted', model) }
}
