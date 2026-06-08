// Yuchai 2025 power-generation gas engines (from the official .xlsx lineup).
// Uses genset rated kWe (建议机组额定功率); engine kW + rpm from 额定功率/转速; derives kVA.
// Price column excluded. Updates existing rows in place; inserts new.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// [model, fuel, engine kW, rpm, genset kWe]
const MODELS = [
  ['YC4D90N-D30', 'Natural Gas', 60, 1500, 50], ['YC4G135N-D30', 'Natural Gas', 90, 1500, 80],
  ['YC6G205N-D30', 'Natural Gas', 138, 1500, 120], ['YC6MK315N-D30', 'Natural Gas', 210, 1500, 180],
  ['YC6K420N-D30', 'Natural Gas', 281, 1500, 250], ['YC6K350N-D30', 'Biogas', 235, 1500, 200],
  ['YC6T450N-D30', 'Natural Gas', 300, 1500, 280], ['YC6TD600N-D30', 'Natural Gas', 400, 1500, 350],
  ['YC6TD600N-D31', 'Natural Gas', 400, 1500, 350], ['YC6TF800N-D30', 'Natural Gas', 535, 1500, 450],
  ['YC6C935N-D30', 'Natural Gas', 625, 1500, 500], ['YC12VTD1350N-D30', 'Natural Gas', 900, 1500, 800],
  ['YC12VTD1350N-D31', 'Biogas', 900, 1500, 800], ['YC12VC1680N-D31', 'Natural Gas', 1120, 1000, 1000],
  ['YC12VC1680N-D32', 'Biogas', 1120, 1000, 1000], ['YC16VTD1680N-D30', 'Natural Gas', 1120, 1500, 1000],
  ['YC16VTD1830N-D30', 'Natural Gas', 1220, 1500, 1100], ['YC16VC2470N-D30', 'Natural Gas', 1650, 1000, 1500],
  ['YC16VC3300N-D30', 'Natural Gas', 2205, 1500, 2000],
]
// family -> [displacement, cylinders, config]  (null displacement = unknown platform)
const FAM = {
  YC4D: [4.214, 4, 'L4'], YC4G: [null, 4, 'L4'], YC6G: [null, 6, 'L6'],
  YC6MK: [10.338, 6, 'L6'], YC6K: [15.25, 6, 'L6'], YC6T: [16.35, 6, 'L6'],
  YC6TD: [19.598, 6, 'L6'], YC6TF: [31.75, 6, 'L6'], YC6C: [39.584, 6, 'L6'],
  YC12VTD: [39.2, 12, 'V12'], YC12VC: [79.17, 12, 'V12'], YC16VTD: [52.26, 16, 'V16'], YC16VC: [105.558, 16, 'V16'],
}

const { data: existing } = await supabase.from('engines').select('id, slug').ilike('brand', 'Yuchai')
const bySlug = new Map(existing.map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, fuel, kw, rpm, kwe] of MODELS) {
  const slug = 'yuchai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const power = {
    fuel_type: fuel, ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled', rpm_rated: rpm,
    prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8), prime_power_kw_50hz: kw,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(power).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const fam = FAM[model.match(/^(YC\d+[A-Z]+?)\d/)[1]]
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'Yuchai', model, status: 'active', origin: 'China',
      emissions_standard: 'Unregulated', displacement_l: fam[0], cylinders: fam[1], configuration: fam[2],
      ...power,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} Yuchai gas engines`)
