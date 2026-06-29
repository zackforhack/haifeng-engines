// Waukesha gas engines (INNIO Waukesha, Waukesha, Wisconsin USA), from waukeshaengine.com
// spec pages + fact sheets. Spark-ignition natural-gas engines for power generation.
//   VGF  (bore 152×165 mm, 8.6:1): F18 I6 / H24 I8 / L36 V12 / P48 V16 — continuous kWe @ 60 Hz.
//   275GL+ (bore 275×300 mm): 12V (3750 bhp) / 16V (5000 bhp), low-speed 1000 rpm.
// kVA = kWe / 0.8. (VHP series omitted: primarily gas-compression / mechanical-drive.)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const crText = (cr) => cr == null ? null : `${cr}:1`

// [model, series, cyl, config, displ_L, compression, rpm, freq, kWe, kWm(or null), bhp(or null)]
const MODELS = [
  ['VGF F18GSI', 'VGF', 6, 'L6', 18, 8.6, 1800, '60', 310, null, null],
  ['VGF H24GSI', 'VGF', 8, 'L8', 24, 8.6, 1800, '60', 415, null, null],
  ['VGF L36GSI', 'VGF', 12, 'V12', 36, 8.6, 1800, '60', 560, null, null],
  ['VGF P48GSI', 'VGF', 16, 'V16', 48, 8.6, 1800, '60', 750, null, null],
  ['275GL+ 12V', '275GL+', 12, 'V12', 214, null, 1000, '50', 2712, 2796, 3750],
  ['275GL+ 16V', '275GL+', 16, 'V16', 285, null, 1000, '50', 3616, 3728, 5000],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Waukesha')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, series, cyl, config, displ, cr, rpm, freq, kwe, kwm, bhp] of MODELS) {
  const slug = 'waukesha-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const kva = round1(kwe / 0.8)
  const pw = freq === '60'
    ? { prime_power_kwe_60hz: kwe, prime_power_kva_60hz: kva, ...(kwm ? { prime_power_kw_60hz: kwm } : {}) }
    : { prime_power_kwe_50hz: kwe, prime_power_kva_50hz: kva, ...(kwm ? { prime_power_kw_50hz: kwm } : {}) }
  const fields = {
    series, fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: rpm, cylinders: cyl, configuration: config, displacement_l: displ,
    ...(cr != null ? { compression_ratio: crText(cr) } : {}), power_kw: kwm ?? kwe, ...pw,
    description: `Waukesha ${model} — ${displ} L ${config} spark-ignition natural-gas engine (${series} series), `
      + `${kwe} kWe at ${rpm} rpm / ${freq} Hz${bhp ? ` (${bhp} bhp)` : ''}; lean-burn, for power generation.`,
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
console.log(`✓ updated ${upd}, inserted ${ins} Waukesha gas engines`)
