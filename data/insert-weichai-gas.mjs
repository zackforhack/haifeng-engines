// Weichai 2024 domestic power-generation gas engines (from the official .xls).
// Uses genset prime kWe (建议机组功率·常用); engine prime kW where given; derives kVA.
// Price column intentionally excluded. Updates existing rows in place; inserts new.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// [model, genset prime kWe, engine prime kW (or null), fuel]
const MODELS = [
  ['WP4D40E200NG', 30, 35, 'Natural Gas'], ['WP4D77E300NG', 60, 70, 'Natural Gas'],
  ['WP6D132E300NG', 100, 120, 'Natural Gas'], ['WP10D200E300NG', 150, 182, 'Natural Gas'],
  ['WP13D317E300NG', 250, 288, 'Natural Gas'], ['WP13D317E300PG', 250, 288, 'LPG'],
  ['6M33D450E310NG', 400, 450, 'Natural Gas'], ['12M26D605E300NG', 500, 550, 'Natural Gas'],
  ['12M33D900E310NG', 800, 900, 'Natural Gas'], ['12M33D880A0BG', 800, 880, 'Biogas'],
  ['16M33D1280NG10', 1100, null, 'Natural Gas'], ['12M55D1588A0NG', 1400, null, 'Natural Gas'],
  ['WP4D44E201NG', 30, 40, 'Natural Gas'], ['WP4D77E301NG', 60, 70, 'Natural Gas'],
  ['WP6D132E301NG', 100, 120, 'Natural Gas'], ['WP10D238E301NG', 180, 216, 'Natural Gas'],
  ['WP13D317E301NG', 250, 288, 'Natural Gas'], ['6M33D480E311NG', 400, 480, 'Natural Gas'],
  ['12M26D660E301NG', 550, 600, 'Natural Gas'], ['12M33D960E311NG', 850, 960, 'Natural Gas'],
  ['16M33D1280NG11', 1100, null, 'Natural Gas'],
]
const FAM = {
  WP4: [4.1, 4, 'L4'], WP6: [6.1, 6, 'L6'], WP10: [10, 6, 'L6'], WP13: [13, 6, 'L6'],
  '6M33': [19.8, 6, 'V6'], '12M26': [31.2, 12, 'V12'], '12M33': [39.6, 12, 'V12'],
  '16M33': [52.8, 16, 'V16'], '12M55': [66, 12, 'V12'],
}

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Weichai')
const bySlug = new Map(existing.map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, kwe, kw, fuel] of MODELS) {
  const slug = 'weichai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const power = {
    fuel_type: fuel, ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled', rpm_rated: 1500,
    prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8),
    ...(kw != null ? { prime_power_kw_50hz: kw } : {}),
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(power).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const fam = FAM[model.match(/^(WP\d+|\d+M\d+)/)[1]]
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'Weichai', model, status: 'active', origin: 'China',
      emissions_standard: 'Unregulated', configuration: fam[2], cylinders: fam[1], displacement_l: fam[0],
      ...power,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} Weichai gas engines`)
