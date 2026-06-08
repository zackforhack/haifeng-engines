// Jenbacher gas engines (INNIO Jenbacher, Jenbach, Austria), from jenbacher.com / Clarke Energy
// spec pages + official Type-3/4/6 datasheets. Lean-burn spark-ignition gas engines for power
// gen / CHP. Displacement per cylinder confirmed from datasheets: Type 2 = 135×145 (2.08 L/cyl),
// Type 3 = 135×170 (2.43), Type 4 = 145×185 (3.06), Type 6 = 190×220 (6.24, J620 = 124.75 L).
// Headline = max electrical output (kWe); kVA = kWe/0.8. All 1500 rpm (50 Hz); T2/T3/T4 also 60 Hz.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// [model, series, cyl, config, vAngle, displ_L, kWeMax, kWeMin, effPct]
const MODELS = [
  ['J208', 'Type 2', 8, 'L8', 'inline', 16.6, 360, 250, 41.8],
  ['J312', 'Type 3', 12, 'V12', '70° V', 29.2, 635, 393, 43.0],
  ['J316', 'Type 3', 16, 'V16', '70° V', 38.9, 851, 703, 43.0],
  ['J320', 'Type 3', 20, 'V20', '70° V', 48.6, 1155, 999, 43.5],
  ['J412', 'Type 4', 12, 'V12', '70° V', 36.7, 934, 749, 44.0],
  ['J416', 'Type 4', 16, 'V16', '70° V', 49.0, 1248, 999, 44.0],
  ['J420', 'Type 4', 20, 'V20', '70° V', 61.2, 1562, 1411, 44.0],
  ['J612', 'Type 6', 12, 'V12', '60° V', 74.9, 2007, 1818, 45.6],
  ['J616', 'Type 6', 16, 'V16', '60° V', 99.8, 2677, 2430, 46.5],
  ['J620', 'Type 6', 20, 'V20', '60° V', 124.8, 3360, 3041, 45.9],
  ['J624', 'Type 6', 24, 'V24', '60° V', 149.7, 4507, 4507, 47.1],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Jenbacher')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, series, cyl, config, vang, displ, kweMax, kweMin, eff] of MODELS) {
  const slug = 'jenbacher-' + model.toLowerCase()
  const range = kweMin === kweMax ? `${kweMax}` : `${kweMin}–${kweMax}`
  const fields = {
    series, fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kwe_50hz: kweMax, prime_power_kva_50hz: round1(kweMax / 0.8), power_kw: kweMax,
    description: `Jenbacher ${model} — ${displ} L ${config} (${vang}) lean-burn gas engine (${series}), `
      + `multi-fuel: natural gas, biogas, landfill/sewage gas and special gases. Up to ${kweMax} kWe `
      + `(${range} kWe across versions) at 1500 rpm / 50 Hz, electrical efficiency up to ${eff}%; for power generation / CHP.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'Jenbacher', model, status: 'active', origin: 'Austria',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} Jenbacher gas engines`)
