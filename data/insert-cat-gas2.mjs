// More Caterpillar gas generator engines — small 3300/3400 + large 3600 series — from cat.com /
// dealer spec data. Added to the EXISTING 'Caterpillar' brand (alongside the 3500 gas added earlier).
// 3600 = bore 280 × stroke 300 mm (18.47 L/cyl), low-speed 1000 rpm. Headline = genset ekW (range
// noted); kVA = kWe/0.8.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, cyl, config, displ_L, ekW, rpm, boreStroke, note]
const MODELS = [
  ['G3306', 6, 'L6', 10.5, 75, 1500, '121 × 152 mm', '75 ekW continuous'],
  ['G3406', 6, 'L6', 14.6, 155, 1500, '137 × 165 mm', '108–240 ekW across ratings'],
  ['G3408', 8, 'V8', 18.0, 250, 1500, '137 × 152 mm', '~250 ekW'],
  ['G3412', 12, 'V12', 27.0, 500, 1500, '137 × 152 mm', '400–750 ekW across ratings'],
  ['G3606', 6, 'L6', 110.8, 1300, 1000, '280 × 300 mm', '~1300–1400 ekW'],
  ['G3612', 12, 'V12', 221.6, 2615, 1000, '280 × 300 mm', '2615–2900 ekW'],
  ['G3616', 16, 'V16', 295.5, 3500, 1000, '280 × 300 mm', '3050–3900 ekW'],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Caterpillar')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let upd = 0, ins = 0
for (const [model, cyl, config, displ, ekW, rpm, bs, note] of MODELS) {
  const slug = 'caterpillar-' + model.toLowerCase()
  const series = model.startsWith('G36') ? '3600' : model.startsWith('G34') ? '3400' : '3300'
  const fields = {
    series, fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: rpm, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kwe_50hz: ekW, prime_power_kva_50hz: round1(ekW / 0.8), power_kw: ekW,
    description: `Caterpillar ${model} — ${displ} L ${config} (${bs}) 4-stroke spark-ignited natural-gas `
      + `generator-set engine (Cat ${series} series). ${note}, ${rpm} rpm.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Caterpillar', model, status: 'active', origin: 'United States', emissions_standard: 'Unregulated', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ updated ${upd}, inserted ${ins} more Caterpillar gas engines`)
