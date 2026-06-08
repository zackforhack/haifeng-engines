// MAN gas engines (E-series) for power generation, from the MAN 2025 gas-engine list +
// the Power Gas brochure spec table. German-built (MAN Engines, Nuremberg) spark-ignition gas
// engines. Adds to the EXISTING 'MAN' brand (which already has MAN diesels). The 2025 list gives
// MECHANICAL output (kW); we store that in prime_power_kw_* and derive electrical kWe = kWm × 0.96
// (high-efficiency genset alternator) and kVA = kWe / 0.8. 1500 rpm = 50 Hz, 1800 rpm = 60 Hz.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const kwe = (kwm) => (kwm == null ? null : Math.round(kwm * 0.96))
const kva = (e) => (e == null ? null : round1(e / 0.8))

// family -> [displacement_l, cylinders, configuration, bore_mm]
const FAM = {
  E0834: [4.6, 4, 'L4', 108], E0836: [6.9, 6, 'L6', 108], E2876: [12.8, 6, 'L6', 128],
  E3268: [17.2, 8, 'V8', 132], E3262: [25.8, 12, 'V12', 132], E3872: [29.6, 12, 'V12', 138],
}
// [model, family, mech kW @1500 (50Hz), mech kW @1800 (60Hz), combustion]  (st=stoichiometric/λ=1, m=lean-burn)
const MODELS = [
  ['E 0834 E302', 'E0834', 54, 62, 'st'], ['E 0834 E312', 'E0834', 37, 45, 'm'],
  ['E 0834 LE302', 'E0834', 68, 68, 'm'], ['E 0834 LE312', 'E0834', 68, 68, 'm'],
  ['E 0836 E302', 'E0836', 75, 85, 'st'], ['E 0836 E312', 'E0836', 56, 64, 'm'],
  ['E 0836 LE302', 'E0836', 110, 110, 'm'],
  ['E 2876 E312', 'E2876', 150, 170, 'st'], ['E 2876 LE302', 'E2876', 210, 210, 'm'],
  ['E 3268 LE212', 'E3268', 370, 390, 'm'], ['E 3268 LE242', 'E3268', 320, 340, 'm'],
  ['E 3262 E302', 'E3262', 275, 300, 'st'], ['E 3262 LE202', 'E3262', 550, 580, 'm'],
  ['E 3262 LE232', 'E3262', 450, 450, 'm'], ['E 3262 LE252', 'E3262', 530, 530, 'm'],
  ['E 3872 LE201', 'E3872', 735, null, 'm'], ['E 3872 LE202', 'E3872', null, 840, 'm'],
]
const COMB = { st: 'stoichiometric (λ=1, 3-way catalyst)', m: 'lean-burn' }

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'MAN')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, fam, m50, m60, comb] of MODELS) {
  const slug = 'man-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const [displ, cyl, config, bore] = FAM[fam]
  const fields = {
    series: fam, fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: m50 != null ? 1500 : 1800, cylinders: cyl, configuration: config, displacement_l: displ,
    ...(m50 != null ? { prime_power_kw_50hz: m50, prime_power_kwe_50hz: kwe(m50), prime_power_kva_50hz: kva(kwe(m50)) } : {}),
    ...(m60 != null ? { prime_power_kw_60hz: m60, prime_power_kwe_60hz: kwe(m60), prime_power_kva_60hz: kva(kwe(m60)) } : {}),
    power_kw: m50 ?? m60,
    description: `MAN ${model} — ${displ} L ${config} (${bore} mm bore) spark-ignition natural-gas engine, `
      + `${COMB[comb]}. Mechanical output ${m50 ?? m60} kW`
      + `${m50 != null ? ' at 1500 rpm / 50 Hz' : ' at 1800 rpm / 60 Hz'}`
      + `${m50 != null && m60 != null ? `, ${m60} kW at 1800 rpm / 60 Hz` : ''}`
      + ` (electrical ~${kwe(m50 ?? m60)} kWe); for power generation / CHP.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'MAN', model, status: 'active', origin: 'Germany',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} MAN gas engines`)
