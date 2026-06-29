import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
async function upsert(slug, row) {
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(row).eq('id', bySlug.get(slug)); if (error) console.error('✗', slug, error.message); else console.log('· updated', slug) }
  else { const { error } = await supabase.from('engines').insert({ slug, ...row }); if (error) console.error('✗', slug, error.message); else console.log('✓ inserted', slug) }
}

// --- 260 DIESEL series (260×320 = 16.99 L/cyl; 9L/12V/16V; 900/1000 rpm; IMO II / China marine II;
//     diesel/HFO-capable). Named with "-D" to distinguish from the gas 26/32 rows. ---
const D260 = [
  ['9l26-32-d', '9L26/32-D', 9, 'L9', 152.9, 3000, 2600],
  ['12v26-32-d', '12V26/32-D', 12, 'V12', 203.9, 4000, 3600],
  ['16v26-32-d', '16V26/32-D', 16, 'V16', 271.8, 5300, 4800],
]
for (const [sfx, model, cyl, config, displ, kwe50, kwe60] of D260) {
  await upsert('jichai-' + sfx, {
    brand: 'Jichai', model, status: 'active', origin: 'China', series: '260 series',
    fuel_type: 'Diesel', ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1000, cylinders: cyl, configuration: config, displacement_l: displ, emissions_standard: 'IMO Tier II',
    power_kw: kwe50, prime_power_kwe_50hz: kwe50, prime_power_kva_50hz: round1(kwe50 / 0.8),
    prime_power_kwe_60hz: kwe60, prime_power_kva_60hz: round1(kwe60 / 0.8),
    description: `Jichai ${model} — ${displ} L ${config} (260 × 320 mm) common-rail turbocharged DIESEL `
      + `generator engine (CNPC Jichai 260 series). ${kwe60}–${kwe50} kWe at 900/1000 rpm (60/50 Hz), `
      + `400 V–13.8 kV; IMO Tier II / China marine II, ≤180 g/kWh.`,
  })
}

// --- H12V190 DIESEL (1000-1500 kW genset). V12, 190×215 = 73.16 L. China III, ≤202 g/kWh.
//     Engine net weight 9300 kg (engine page). ---
const H12 = [
  ['h12v190zld1', 'H12V190ZLD1', 1200, 1000],
  ['h12v190zld2', 'H12V190ZLD2', 1360, 1200],
  ['h12v190zld',  'H12V190ZLD',  1740, 1500],
  ['ah12v190zld', 'AH12V190ZLD', 1740, 1500],
]
for (const [sfx, model, engKw, kwe] of H12) {
  await upsert('jichai-' + sfx, {
    brand: 'Jichai', model, status: 'active', origin: 'China', series: '190 series',
    fuel_type: 'Diesel', ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: 12, configuration: 'V12', displacement_l: 73.16, compression_ratio: '14:1',
    emissions_standard: 'China III (GB20891)', weight_kg: 9300, length_mm: 2950, width_mm: 1980, height_mm: 2206,
    power_kw: engKw, prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8),
    description: `Jichai ${model} — 73.16 L V12 (190 × 215 mm) ECU common-rail turbocharged diesel generator `
      + `engine (CNPC Jichai H12V190 series). ${engKw} kW engine / ${kwe} kWe genset (400 V–10.5 kV) at 1500 rpm, `
      + `GB20891 Stage III, ≤202 g/kWh.`,
  })
}
