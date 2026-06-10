// Jichai (济柴 / CNPC Jichai Power) engines — accurate lineup from the official CNPC Jichai gas
// catalog + jinanengine diesel page. Replaces the earlier estimated set. Multi-bore: 140 (high
// speed), 190 / 200 (mid-high speed, incl. long-stroke L-series), 26/32 = 260×320 (medium speed).
// Gas engines also run biogas and coal-mine gas (CBM). kVA = kWe/0.8.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// [model, kind, cyl, config, displ_L, bore, stroke, gensetKw, rpm, kwMin]
const MODELS = [
  // Diesel — classic 190 series (1500 rpm)
  ['6190', 'diesel', 6, 'L6', 35.7, 190, 210, 250, 1500, 160],
  ['12V190', 'diesel', 12, 'V12', 71.45, 190, 210, 800, 1500, 600],
  ['16V190', 'diesel', 16, 'V16', 95.3, 190, 210, 1300, 1500, 1000],
  // Natural gas (also biogas / coal-mine gas), 1000 rpm unless noted
  ['6140', 'gas', 6, 'L6', 15.2, 140, 165, 300, 1500, 300],
  ['12V190ZDT', 'gas', 12, 'V12', 71.5, 190, 210, 600, 1000, 400],
  ['C12V190ZLT', 'gas', 12, 'V12', 78.3, 190, 230, 750, 1000, 500],
  ['H16V190ZLT', 'gas', 16, 'V16', 97.53, 190, 215, 1500, 1000, 1100],
  ['L12V200ZLT', 'gas', 12, 'V12', 96.1, 200, 255, 1200, 1000, 1200],
  ['L16V190ZLT', 'gas', 16, 'V16', 115.7, 190, 255, 1600, 1000, 1500],
  ['L20V190ZLT', 'gas', 20, 'V20', 144.6, 190, 255, 2000, 1000, 1000],
  ['12V26/32', 'gas', 12, 'V12', 203.9, 260, 320, 3000, 1000, 2700],
  ['16V26/32', 'gas', 16, 'V16', 271.8, 260, 320, 4000, 1000, 3600],
]

// Replace the earlier estimated Jichai rows.
await supabase.from('engines').delete().eq('brand', 'Jichai')

let ins = 0
for (const [model, kind, cyl, config, displ, bore, stroke, kw, rpm, kwMin] of MODELS) {
  const slug = 'jichai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const gas = kind === 'gas'
  const fields = {
    series: bore + ' series', fuel_type: gas ? 'Natural Gas' : 'Diesel',
    ignition_type: gas ? 'Spark Ignition' : 'Compression Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: rpm, cylinders: cyl, configuration: config, displacement_l: displ,
    ...(gas ? {} : { compression_ratio: 14 }),
    prime_power_kwe_50hz: kw, prime_power_kva_50hz: round1(kw / 0.8), power_kw: kw,
    description: `Jichai ${model} — ${displ} L ${config} (${bore} × ${stroke} mm) ${gas ? 'spark-ignited gas' : 'turbocharged diesel'} `
      + `generator engine (CNPC Jichai). ${kwMin}–${kw} kWe at ${rpm} rpm`
      + `${gas ? '; runs natural gas, biogas or coal-mine gas (CBM)' : ''}. CNPC's flagship engine line for oilfield and stationary power.`,
  }
  const { error } = await supabase.from('engines').insert({
    slug, brand: 'Jichai', model, status: 'active', origin: 'China', emissions_standard: 'Unregulated', ...fields,
  })
  if (error) console.error('✗', model, error.message); else ins++
}
console.log(`✓ inserted ${ins} Jichai engines (replaced old set)`)
