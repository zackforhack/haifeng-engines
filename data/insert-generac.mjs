// Generac industrial gaseous (natural gas) generator engines, from generac.com. New brand. The
// SG/MG lineup spans 7 engine platforms (each used across many SG/MG model numbers); we add one
// row per platform with the kW range. Spark-ignited; SG = standby rating, prime derived at /1.1.
// kVA = kW/0.8. 60 Hz / 1800 rpm (US market).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, cyl, config, displ_L, standbyKwMax, standbyKwMin]
const MODELS = [
  ['SG080', 4, 'L4', 4.5, 80, 35],
  ['SG150', 6, 'L6', 8.8, 150, 100],
  ['SG300', 8, 'V8', 14.2, 300, 150],
  ['SG450', 12, 'V12', 21.9, 450, 350],
  ['SG500', 12, 'V12', 25.8, 500, 500],
  ['SG750', 12, 'V12', 33.9, 750, 625],
  ['SG1000', 20, 'V20', 49.0, 1000, 1000],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Generac')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let upd = 0, ins = 0
for (const [model, cyl, config, displ, kwMax, kwMin] of MODELS) {
  const slug = 'generac-' + model.toLowerCase()
  const prime = Math.round(kwMax / 1.1)
  const fields = {
    series: 'SG/MG', fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800, cylinders: cyl, configuration: config, displacement_l: displ, power_kw: kwMax,
    standby_power_kwe_60hz: kwMax, standby_power_kva_60hz: round1(kwMax / 0.8),
    prime_power_kwe_60hz: prime, prime_power_kva_60hz: round1(prime / 0.8),
    description: `Generac ${model} — ${displ} L ${config} spark-ignited natural-gas industrial generator engine `
      + `(Generac gaseous SG/MG platform). ${kwMin}–${kwMax} kWe standby across SG/MG ratings, 1800 rpm / 60 Hz.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Generac', model, status: 'active', origin: 'United States', emissions_standard: 'Unregulated', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ updated ${upd}, inserted ${ins} Generac gas engines`)
