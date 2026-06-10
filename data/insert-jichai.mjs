// Jichai (济柴 / CNPC Jichai Power, formerly Jinan Diesel Engine) 190-series engines — the famous
// Chinese big-bore line for oilfield/power generation. New brand. Bore 190 × stroke 210 mm
// (5.95 L/cyl, confirmed via 12V190 = 71.45 L). Both diesel and gas (gas also runs biogas/CBM).
// kVA = kWe/0.8. Diesel gensets 1500 rpm; gas gensets 1000 rpm.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, kind, cyl, config, displ_L, kWe, rpm, kwMin]
const MODELS = [
  // Diesel (190 series, 1500 rpm)
  ['6190ZLD', 'diesel', 6, 'L6', 35.7, 400, 1500, 200],
  ['G12V190ZL', 'diesel', 12, 'V12', 71.45, 600, 1500, 600],
  ['H16V190ZL', 'diesel', 16, 'V16', 95.3, 1300, 1500, 1000],
  ['20V190', 'diesel', 20, 'V20', 119.0, 2000, 1500, 1600],
  // Gas / biogas / CBM (190 series, 1000 rpm)
  ['G12V190ZDT', 'gas', 12, 'V12', 71.45, 800, 1000, 500],
  ['H16V190ZDT', 'gas', 16, 'V16', 95.3, 1000, 1000, 1000],
  ['L20V190ZL', 'gas', 20, 'V20', 119.0, 2000, 1000, 1000],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jichai')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let upd = 0, ins = 0
for (const [model, kind, cyl, config, displ, kwe, rpm, kwMin] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase()
  const gas = kind === 'gas'
  const fields = {
    series: '190', fuel_type: gas ? 'Natural Gas' : 'Diesel',
    ignition_type: gas ? 'Spark Ignition' : 'Compression Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: rpm, cylinders: cyl, configuration: config, displacement_l: displ,
    ...(gas ? {} : { compression_ratio: 14 }),
    prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8), power_kw: kwe,
    description: `Jichai ${model} — ${displ} L ${config} (190 × 210 mm) ${gas ? 'spark-ignited gas' : 'turbocharged diesel'} `
      + `generator engine (CNPC Jichai 190 series). ${kwMin}–${kwe} kWe at ${rpm} rpm`
      + `${gas ? '; runs natural gas, biogas or coal-mine gas (CBM)' : ''}. Widely used in oilfield and stationary power.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Jichai', model, status: 'active', origin: 'China', emissions_standard: 'Unregulated', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ updated ${upd}, inserted ${ins} Jichai engines`)
