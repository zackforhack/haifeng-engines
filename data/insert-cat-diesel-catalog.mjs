// Caterpillar diesel engines from the official Cat 2024 Electric Power Ratings Guide (LEXE7582).
// Adds the engine platforms the catalog uses that we lacked: small C1.1/C1.5; the C175 high-speed
// V16/V20 (175×220 = 5.35 L/cyl → 85.6/107.0 L); and the 3600 large-bore series (280×300 = 18.47
// L/cyl → 3606 110.8 / 3608 147.8 / 3612 221.6 / 3616 295.5 L), the diesel siblings of the G36xx gas.
// 50 Hz figures are catalog kVA × 0.8 pf = ekW; 60 Hz figures are catalog ekW directly.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const r1 = (n) => n == null ? null : Math.round(n * 10) / 10

// [model, cyl, config, displ, rpm, s50, p50, s60, p60, emissions, origin, note]
const M = [
  ['C1.1',     3, 'L3',   1.1,  1500, 7.6,  6.8,  8.8,  8,    'Euro Stage IIIA',      'Japan',         'compact 3-cylinder industrial diesel'],
  ['C1.5',     3, 'L3',   1.5,  1500, 10.8, 10,   13,   12,   'Euro Stage IIIA',      'Japan',         'compact 3-cylinder industrial diesel'],
  ['C175-16', 16, 'V16',  85.6, 1500, 2400, 2180, 3000, 2725, 'U.S. EPA Final Tier 4','United States', 'high-speed V16 (175×220 mm); EPA Tier 4 Final / EPA Stationary Emergency'],
  ['C175-20', 20, 'V20',  107.0,1500, 3120, 2800, 3900, 3500, 'U.S. EPA Final Tier 4','United States', 'high-speed V20 (175×220 mm); EPA Tier 4 Final / EPA Stationary Emergency'],
  ['3606',     6, 'L6',   110.8,1000, 2150, 1940, 2000, 1820, 'U.S. EPA Tier 2',      'United States', 'medium-speed inline-6 (280×300 mm); marketed as C280-6 (IMO/EPA Tier 2) marine'],
  ['3608',     8, 'V8',   147.8,1000, 2860, 2600, 2660, 2420, 'U.S. EPA Tier 2',      'United States', 'medium-speed V8 (280×300 mm); marketed as C280-8 (IMO/EPA Tier 2) marine'],
  ['3612',    12, 'V12',  221.6,1000, 4300, 3880, 4000, 3640, 'U.S. EPA Tier 2',      'United States', 'medium-speed V12 (280×300 mm); marketed as C280-12 (IMO/EPA Tier 2) marine'],
  ['3616',    16, 'V16',  295.5,1000, 5720, 5200, 5320, 4840, 'U.S. EPA Tier 2',      'United States', 'medium-speed V16 (280×300 mm); marketed as C280-16 (IMO/EPA Tier 2) marine'],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand','Caterpillar')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let ins = 0, upd = 0
for (const [model, cyl, config, displ, rpm, s50, p50, s60, p60, emissions, origin, note] of M) {
  const slug = 'caterpillar-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const row = {
    brand: 'Caterpillar', model, status: 'active', origin, series: model.startsWith('C1') ? 'C Series' : model.startsWith('C175') ? 'C175' : '3600 Series',
    fuel_type: 'Diesel', ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: rpm, cylinders: cyl, configuration: config, displacement_l: displ, emissions_standard: emissions,
    power_kw: p50,
    standby_power_kwe_50hz: s50, standby_power_kva_50hz: r1(s50 / 0.8),
    prime_power_kwe_50hz: p50,   prime_power_kva_50hz: r1(p50 / 0.8),
    standby_power_kwe_60hz: s60, standby_power_kva_60hz: r1(s60 / 0.8),
    prime_power_kwe_60hz: p60,   prime_power_kva_60hz: r1(p60 / 0.8),
    description: `Caterpillar ${model} — ${displ} L ${config} turbocharged-aftercooled diesel generator engine `
      + `(Cat ${model.startsWith('C1')?'C-Series':model.startsWith('C175')?'C175':'3600'} series). ${s50} ekW standby / ${p50} ekW prime @ 50 Hz, `
      + `${s60} / ${p60} ekW @ 60 Hz; ${note}. Source: Cat 2024 Electric Power Ratings Guide.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else { upd++; console.log('· updated', model) } }
  else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', model, error.message); else { ins++; console.log('✓ inserted', model) } }
}
console.log(`\n✓ inserted ${ins}, updated ${upd} Caterpillar diesel models`)
