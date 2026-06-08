// PUSH (重普新能源 / Chongpu New Energy) gas generator sets, from the official brochure.
// Three series:
//   PUSH-GZ  biogas (沼气)        — GP-series engines, MV gensets, 机组额定功率 = genset rated kWe
//   PUSH-GW  coal-mine gas (瓦斯) — GP-series engines, MV gensets
//   PUSH-M   natural gas (MT) / biogas (MZ) — MWM TCG engines, 电功率 = electrical kWe
// Derives kVA = kWe / 0.8. No price data published. Inserts new; updates existing by slug.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// [model, series, fuel, engineModel, cylinders, config, kWe, length, width, height, weight]
const MODELS = [
  // PUSH-GZ biogas
  ['PUSH1000GZ', 'PUSH-GZ', 'Biogas', 'GP6L210GZA3', 6, 'L6', 1000, 7085, 2200, 3232, 28000],
  ['PUSH1300GZ', 'PUSH-GZ', 'Biogas', 'GP8L210GZA3', 8, 'V8', 1300, 7809, 2200, 3341, 32000],
  ['PUSH1500GZ', 'PUSH-GZ', 'Biogas', 'GP12L210GZA3', 12, 'V12', 1500, 8400, 2200, 3341, 36000],
  // PUSH-GW coal-mine gas (瓦斯)
  ['PUSH1000GW', 'PUSH-GW', 'Coal Gas', 'GP6L210GWA3', 6, 'L6', 1000, 7085, 2200, 3232, 28000],
  ['PUSH1300GW', 'PUSH-GW', 'Coal Gas', 'GP8L210GWA3', 8, 'V8', 1300, 7809, 2200, 3341, 32000],
  ['PUSH1500GW', 'PUSH-GW', 'Coal Gas', 'GP12L210GWA3', 12, 'V12', 1500, 8400, 2200, 3341, 36000],
  // PUSH-M natural gas (MT) — MWM TCG engines
  ['PUSH600MT', 'PUSH-M', 'Natural Gas', 'TCG2010V12', 12, 'V12', 600, null, null, null, null],
  ['PUSH800MT', 'PUSH-M', 'Natural Gas', 'TCG2016V12', 12, 'V12', 800, null, null, null, null],
  ['PUSH1000MT', 'PUSH-M', 'Natural Gas', 'TCG2016V16', 16, 'V16', 1000, null, null, null, null],
  // PUSH-M biogas (MZ) — MWM TCG engines
  ['PUSH600MZ', 'PUSH-M', 'Biogas', 'TCG2016V12', 12, 'V12', 600, null, null, null, null],
  ['PUSH800MZ', 'PUSH-M', 'Biogas', 'TCG2016V16', 16, 'V16', 800, null, null, null, null],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'PUSH')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, series, fuel, engineModel, cyl, config, kwe, len, wid, hgt, wgt] of MODELS) {
  const slug = 'push-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const fields = {
    series, fuel_type: fuel, ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: cyl, configuration: config,
    prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8),
    weight_kg: wgt, length_mm: len, width_mm: wid, height_mm: hgt,
    description: `${series} series gas genset powered by the ${engineModel} engine; ${kwe} kWe prime (${round1(kwe / 0.8)} kVA) at 1500 rpm / 50 Hz.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'PUSH', model, status: 'active', origin: 'China',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} PUSH gas gensets`)
