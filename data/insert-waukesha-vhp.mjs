// Waukesha VHP Series Five gas engines, from waukeshaengine.com fact sheets + the VHP Series Five
// brochure. Heavy-duty spark-ignition NG engines (gas compression / mechanical drive / power gen),
// all bore 238×216 mm (9.375×8.5"), 1200 rpm. Displacement decodes from the model number in cu.in
// (F3524 = 3524 in³ = 57.7 L I6; L7042/44 = 7040 in³ = 115.4 L V12; P9394 = 9394 in³ = 153.9 L V16).
// Published power is mechanical (bhp / kWb); electrical kWe derived at 0.96. kVA = kWe/0.8.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const kwe = (kwb) => Math.round(kwb * 0.96)

// [model, cyl, config, displ_L, hp, kWb]   (1200 rpm = 60 Hz; mechanical rating)
const MODELS = [
  ['VHP F3524GSI', 6, 'L6', 57.7, 950, 708],
  ['VHP L7042GSI', 12, 'V12', 115.4, 1500, 1119],
  ['VHP L7044GSI', 12, 'V12', 115.4, 1900, 1416],
  ['VHP P9394GSI', 16, 'V16', 153.9, 2500, 1864],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Waukesha')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, cyl, config, displ, hp, kwb] of MODELS) {
  const slug = 'waukesha-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const e = kwe(kwb)
  const fields = {
    series: 'VHP', fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1200, cylinders: cyl, configuration: config, displacement_l: displ,
    power_kw: kwb, prime_power_kw_60hz: kwb, prime_power_kwe_60hz: e, prime_power_kva_60hz: round1(e / 0.8),
    description: `Waukesha ${model} — ${displ} L ${config} spark-ignition natural-gas engine (VHP Series Five), `
      + `${hp} bhp (${kwb} kWb, ~${e} kWe) at 1200 rpm; heavy-duty for gas compression, mechanical drive and power generation.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'Waukesha', model, status: 'active', origin: 'United States',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} Waukesha VHP engines`)
