// Additional Jichai models found via distributor listings + the CNPC catalog (jichai.cnpc.com.cn
// is JS-anti-bot protected). Completes the 190 diesel range (8V190/20V190) and adds the 26/32
// medium-speed gas series in 6L & 9L (260×320 mm; 12V/16V already in DB). Additive (no delete).
//   190 series: 190×210 mm = 5.954 L/cyl.  26/32 series: 260×320 mm = 16.99 L/cyl.
// 26/32 gas power derives at the confirmed 250 kW/cyl (12V26/32=3000, 16V26/32=4000).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, kind, cyl, config, displ_L, bore, stroke, kWe, rpm, kwMin, est]
const MODELS = [
  ['8V190', 'diesel', 8, 'V8', 47.6, 190, 210, 500, 1500, 400, true],
  ['20V190', 'diesel', 20, 'V20', 119.0, 190, 210, 2000, 1500, 1600, true],
  ['6L26/32', 'gas', 6, 'L6', 101.9, 260, 320, 1500, 1000, 1400, false],
  ['9L26/32', 'gas', 9, 'L9', 152.9, 260, 320, 2250, 1000, 2100, false],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let ins = 0, upd = 0
for (const [model, kind, cyl, config, displ, bore, stroke, kw, rpm, kwMin, est] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const gas = kind === 'gas'
  const fields = {
    series: bore + ' series', fuel_type: gas ? 'Natural Gas' : 'Diesel',
    ignition_type: gas ? 'Spark Ignition' : 'Compression Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: rpm, cylinders: cyl, configuration: config, displacement_l: displ,
    ...(gas ? {} : { compression_ratio: 14 }),
    prime_power_kwe_50hz: kw, prime_power_kva_50hz: round1(kw / 0.8), power_kw: kw,
    description: `Jichai ${model} — ${displ} L ${config} (${bore} × ${stroke} mm) ${gas ? 'spark-ignited gas' : 'turbocharged diesel'} `
      + `generator engine (CNPC Jichai). ${kwMin}–${kw} kWe${est ? ' (approx.)' : ''} at ${rpm} rpm`
      + `${gas ? '; runs natural gas, biogas or coal-mine gas (CBM)' : ''}. CNPC's flagship engine line for oilfield and stationary power.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Jichai', model, status: 'active', origin: 'China', emissions_standard: 'Unregulated', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ inserted ${ins}, updated ${upd} Jichai models`)
