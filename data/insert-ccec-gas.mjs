// CCEC (Chongqing Cummins Engine Co.) natural-gas generator engines, from the 2026 CCEC gas
// product lineup. Added to the EXISTING 'Cummins' brand. K-series gas engines based on Cummins
// KTA blocks: K19N (KTA19, L6, 18.9 L), K38N (KTA38, V12, 37.8 L), K50N (KTA50, V16, 50.3 L).
// Also offered for biogas (-B, CH4≥45%) and associated petroleum gas — noted in the description.
// Stores gas-engine continuous kW (prime_power_kw) + recommended genset kWe (prime_power_kwe);
// 50 Hz and 60 Hz ratings are equal in the lineup. PRICE COLUMN INTENTIONALLY EXCLUDED.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// family -> [cylinders, configuration, displacement_l]
const FAM = { K19N: [6, 'L6', 18.9], K38N: [12, 'V12', 37.8], K50N: [16, 'V16', 50.3] }
// [model, family, engineKw (continuous), gensetKwe]
const MODELS = [
  ['K19N-G1', 'K19N', 343, 300], ['K19N-G3', 'K19N', 393, 350], ['K19N-G4', 'K19N', 450, 400],
  ['K38N-G5', 'K38N', 572, 500], ['K38N-G6', 'K38N', 680, 600],
  ['K38N-G7', 'K38N', 785, 700], ['K38N-G8', 'K38N', 890, 800],
  ['K50N-G9', 'K50N', 990, 900], ['K50N-G10', 'K50N', 1100, 1000],
  ['K50N-G11H', 'K50N', 1200, 1100], ['K50N-G12H', 'K50N', 1300, 1200],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Cummins')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, fam, engKw, kwe] of MODELS) {
  const [cyl, config, displ] = FAM[fam]
  const slug = 'cummins-' + model.toLowerCase()
  const kva = round1(kwe / 0.8)
  const fields = {
    series: fam, fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kw_50hz: engKw, prime_power_kwe_50hz: kwe, prime_power_kva_50hz: kva,
    prime_power_kw_60hz: engKw, prime_power_kwe_60hz: kwe, prime_power_kva_60hz: kva, power_kw: engKw,
    description: `Cummins ${model} (CCEC / Chongqing Cummins) — ${displ} L ${config} lean-burn spark-ignited `
      + `gas generator engine. ${engKw} kW continuous engine output, ${kwe} kWe recommended genset power at `
      + `1500 rpm (50 Hz) / 1800 rpm (60 Hz). Also offered for biogas (CH₄ ≥ 45%) and associated petroleum gas.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'Cummins', model, status: 'active', origin: 'China',
      emissions_standard: 'Unregulated', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} CCEC (Cummins) gas engines`)
