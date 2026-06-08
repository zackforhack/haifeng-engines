// Liyu Power (利豫动力, Changsha) large gas generator sets, from liyupower.com.
// Three frames (LY1200 / LY1600 / LY2000) — one 170 mm-bore gas-engine platform whose
// power scales 1200/1600/2000 kW at ~100 kW/cyl, i.e. V12 / V16 / V20. We add the three
// most distinct gas fuels per frame: natural gas (-T), biogas (-Z), low-conc. CBM (-WL).
// Stamford alternator, ABB turbo, ~10 kV MV output. kVA derived at 0.8 PF. No price data.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// series -> [cylinders, configuration]
const SERIES = { LY1200: [12, 'V12'], LY1600: [16, 'V16'], LY2000: [20, 'V20'] }

// [model, series, fuel, kWe, dualFreq(50/60Hz natural-gas)]
const MODELS = [
  ['LY1200AGL/M/H-T', 'LY1200', 'Natural Gas', 1200, true],
  ['LY1200AGL/M/H-Z', 'LY1200', 'Biogas', 1150, false],
  ['LY1200AGL/M/H-WL', 'LY1200', 'Coal Gas', 1100, false],
  ['LY1600AGL/M/H-T', 'LY1600', 'Natural Gas', 1600, true],
  ['LY1600AGL/M/H-Z', 'LY1600', 'Biogas', 1550, false],
  ['LY1600AGL/M/H-WL', 'LY1600', 'Coal Gas', 1500, false],
  ['LY2000AGL/M/H-T', 'LY2000', 'Natural Gas', 2000, true],
  ['LY2000AGL/M/H-Z', 'LY2000', 'Biogas', 1900, false],
  ['LY2000AGL/M/H-WL', 'LY2000', 'Coal Gas', 1850, false],
]
const FUEL_NOTE = { 'Natural Gas': 'natural gas', 'Biogas': 'biogas', 'Coal Gas': 'low-concentration coal-mine gas (CBM)' }

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Liyu Power')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, series, fuel, kwe, dual] of MODELS) {
  const slug = 'liyu-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const [cyl, config] = SERIES[series]
  const kva = round1(kwe / 0.8)
  const fields = {
    series, fuel_type: fuel, ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled', rpm_rated: 1500,
    cylinders: cyl, configuration: config,
    prime_power_kwe_50hz: kwe, prime_power_kva_50hz: kva,
    ...(dual ? { prime_power_kwe_60hz: kwe, prime_power_kva_60hz: kva } : {}),
    description: `${series} series ${config} gas genset (170 mm bore) running on ${FUEL_NOTE[fuel]}; `
      + `${kwe} kWe (${kva} kVA) at ${dual ? '50/60 Hz' : '50 Hz'}, ~10 kV, Stamford alternator with ABB turbocharging.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'Liyu Power', model, status: 'active', origin: 'China',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} Liyu Power gas gensets`)
