import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
async function upsert(slug, row) {
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', slug, error.message); else console.log('· updated', slug) }
  else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', slug, error.message); else console.log('✓ inserted', slug) }
}

// --- H16V190 engine page: engine-level weight/dims (13000kg, 3510×3036×2344) for all 4 variants;
//     correct AH16V190ZLD engine kW to 2200; add AH16V190ZLD1 (2400 kW). ---
const H = [
  ['h16v190zld-2', 'H16V190ZLD-2', 1600, 1400, 1000, 202],
  ['h16v190zld',   'H16V190ZLD',   2200, 2000, 1500, 205],
  ['ah16v190zld',  'AH16V190ZLD',  2200, 2000, 1500, 205],
  ['ah16v190zld1', 'AH16V190ZLD1', 2400, 2200, 1500, 205],
]
for (const [sfx, model, engKw, kwe, rpm, fr] of H) {
  await upsert('jichai-' + sfx, {
    brand: 'Jichai', model, status: 'active', origin: 'China', series: '190 series',
    fuel_type: 'Diesel', ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: rpm, cylinders: 16, configuration: 'V16', displacement_l: 97.53, compression_ratio: 14,
    emissions_standard: 'China III (GB20891)', weight_kg: 13000, length_mm: 3510, width_mm: 3036, height_mm: 2344,
    power_kw: engKw, prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8),
    description: `Jichai ${model} — 97.53 L V16 (190 × 215 mm) high-boost turbocharged diesel generator engine `
      + `(CNPC Jichai H16V190 series). ${engKw} kW engine / ${kwe} kWe genset (400 V–10.5 kV) at ${rpm} rpm, `
      + `GB20891 Stage III, ≤${fr} g/kWh.`,
  })
}

// --- JC130 / JC170 marine-class medium-speed gensets (MGO/MDO/HFO, IMO Tier II, 750/720 rpm).
//     Bore/stroke not published -> displacement left null. ---
const M = [
  ['jc130', 'JC130', 6, 'L6', 2100, 2000, 1900, 'CCFJ-2000 / CCFJ-1900'],
  ['jc170', 'JC170', 8, 'L8', 2800, 2700, 2500, 'CCFJ-2700 / CCFJ-2500'],
]
for (const [sfx, model, cyl, config, engKw, kwe50, kwe60, gensets] of M) {
  await upsert('jichai-' + sfx, {
    brand: 'Jichai', model, status: 'active', origin: 'China', series: model,
    fuel_type: 'Diesel', ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 750, cylinders: cyl, configuration: config, emissions_standard: 'IMO Tier II',
    power_kw: engKw, prime_power_kwe_50hz: kwe50, prime_power_kva_50hz: round1(kwe50 / 0.8),
    prime_power_kwe_60hz: kwe60, prime_power_kva_60hz: round1(kwe60 / 0.8),
    description: `Jichai ${model} — ${cyl}-cylinder medium-speed marine/land diesel generator engine `
      + `(CNPC Jichai ${model} series, gensets ${gensets}). ${engKw} kW engine / ${kwe50} kWe (50 Hz) / ${kwe60} kWe `
      + `(60 Hz) at 750/720 rpm; runs MGO/MDO/HFO; IMO Tier II / China II; 35,000 h overhaul interval.`,
  })
}
