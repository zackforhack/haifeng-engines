// PSI (Power Solutions International) gas engines, from the PSI Power Systems 2024 product
// brochure. U.S. EPA factory-certified spark-ignition engines on natural gas (also propane).
// Adds to the EXISTING 'PSI' brand (which already has the PSI L-D diesels). Headline = natural-gas
// rating; prime + standby electrical (kWe) and mechanical (kWm) at 50 Hz (1500 rpm) and 60 Hz
// (1800 rpm). kVA = kWe / 0.8. Cylinders/config/displacement from the brochure's detail pages.
// (40L 50 Hz prime cell in the source is a typo — kWe 875 > kWm 666 — so it is omitted.)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
const kva = (kwe) => (kwe == null ? null : round1(kwe / 0.8))

// [model, displ_L, cyl, config, aspiration,
//   p50kwe,p50kwm, s50kwe,s50kwm, p60kwe,p60kwm, s60kwe,s60kwm]   (null = not offered)
const N = null
const MODELS = [
  ['PSI 2.4L', 2.4, 4, 'L4', 'Naturally aspirated', N, N, 20, 26, N, N, 25, 32],
  ['PSI 2.4L T', 2.4, 4, 'L4', 'Turbocharged', N, N, N, N, N, N, 40, 50],
  ['PSI 4.3L', 4.3, 6, 'V6', 'Naturally aspirated', 35, 43, 40, 48, 40, 52, 50, 58],
  ['PSI 4.5L', 4.5, 4, 'L4', 'Naturally aspirated', 35, 44, 41, 45, 40, 50, 45, 50],
  ['PSI 5.7L', 5.7, 8, 'V8', 'Naturally aspirated', 50, 58, 55, 65, 55, 70, 60, 78],
  ['PSI 5.7L T', 5.7, 8, 'V8', 'Turbocharged', N, N, 65, 75, N, N, 80, 97],
  ['PSI 5.7L TCAC', 5.7, 8, 'V8', 'Turbocharged + charge-air-cooled', N, N, 85, 100, N, N, 100, 122],
  ['PSI 6.7L', 6.7, 6, 'L6', 'Naturally aspirated', 55, 66, 58, 66, 70, 80, 70, 80],
  ['PSI 6.7L T', 6.7, 6, 'L6', 'Turbocharged', 90, 106, 100, 120, 100, 120, 125, 145],
  ['PSI 8.1L', 8.1, 6, 'L6', 'Naturally aspirated', 55, 67, 60, 74, 75, 88, 85, 100],
  ['PSI 8.1L T', 8.1, 6, 'L6', 'Turbocharged', 110, 131, 125, 145, 125, 150, 155, 176],
  ['PSI 8.8L', 8.8, 8, 'V8', 'Naturally aspirated', 75, 91, 85, 101, 80, 109, 100, 121],
  ['PSI 8.8L T', 8.8, 8, 'V8', 'Turbocharged', N, N, 100, 122, N, N, 125, 147],
  ['PSI 8.8L TCAC', 8.8, 8, 'V8', 'Turbocharged + charge-air-cooled', N, N, 125, 162, N, N, 150, 195],
  ['PSI 10L', 9.7, 6, 'L6', 'Naturally aspirated', 85, 100, 85, 100, 100, 118, 100, 118],
  ['PSI 10L T', 9.7, 6, 'L6', 'Turbocharged', 180, 200, 200, 230, 170, 200, 204, 236],
  ['PSI 11L', 11.1, 6, 'L6', 'Turbocharged + aftercooled', 150, 180, 175, 200, 175, 200, 200, 235],
  ['PSI 13L', 12.5, 6, 'L6', 'Turbocharged + aftercooled', 205, 230, 223, 250, 207, 240, 262, 299],
  ['PSI 14L', 14.6, 8, 'V8', 'Turbocharged + aftercooled', 210, 248, 240, 275, 250, 291, 300, 342],
  ['PSI 17L', 16.7, 8, 'V8', 'Turbocharged + aftercooled', 275, 320, 275, 320, 350, 420, 400, 460],
  ['PSI 18L', 18.3, 10, 'V10', 'Turbocharged + aftercooled', N, N, 270, 320, N, N, 350, 422],
  ['PSI 20L', 19.6, 6, 'L6', 'Turbocharged + aftercooled', 365, 414, 400, 460, 400, 450, 500, 570],
  ['PSI 22L', 21.9, 12, 'V12', 'Turbocharged + aftercooled', 280, 340, 320, 378, 375, 434, 450, 510],
  ['PSI 32L', 31.8, 12, 'V12', 'Turbocharged + aftercooled', 450, 510, 525, 600, 525, 600, 650, 720],
  ['PSI 40L', 39.2, 12, 'V12', 'Turbocharged + aftercooled', N, N, 650, 740, 725, 828, 800, 920],
  ['PSI 53L', 52.8, 16, 'V16', 'Turbocharged + aftercooled', 775, 888, 850, 987, 925, 1067, 1050, 1185],
]

const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'PSI')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))

let upd = 0, ins = 0
for (const [model, displ, cyl, config, asp, p50e, p50m, s50e, s50m, p60e, p60m, s60e, s60m] of MODELS) {
  const slug = 'psi-gas-' + model.replace(/^PSI /, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const pw = {}
  if (p50e != null) Object.assign(pw, { prime_power_kw_50hz: p50m, prime_power_kwe_50hz: p50e, prime_power_kva_50hz: kva(p50e) })
  if (s50e != null) Object.assign(pw, { standby_power_kw_50hz: s50m, standby_power_kwe_50hz: s50e, standby_power_kva_50hz: kva(s50e) })
  if (p60e != null) Object.assign(pw, { prime_power_kw_60hz: p60m, prime_power_kwe_60hz: p60e, prime_power_kva_60hz: kva(p60e) })
  if (s60e != null) Object.assign(pw, { standby_power_kw_60hz: s60m, standby_power_kwe_60hz: s60e, standby_power_kva_60hz: kva(s60e) })
  const headlineKwe = s60e ?? s50e ?? p60e ?? p50e
  const fields = {
    fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800, cylinders: cyl, configuration: config, displacement_l: displ,
    emissions_standard: 'EPA Certified', certifications: ['EPA'], power_kw: p50m ?? p60m ?? s50m ?? s60m, ...pw,
    description: `PSI ${model} — ${displ} L ${config} spark-ignition gas engine, ${asp.toLowerCase()}, `
      + `running on natural gas or propane (LPG). Up to ${headlineKwe} kWe standby; 50/60 Hz `
      + `(1500/1800 rpm). U.S. EPA factory-certified for power generation.`,
  }
  if (bySlug.has(slug)) {
    const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug))
    if (error) console.error(`✗ ${model}: ${error.message}`); else upd++
  } else {
    const { error } = await supabase.from('engines').insert({
      slug, brand: 'PSI', model, status: 'active', origin: 'United States', ...fields,
    })
    if (error) console.error(`✗ ${model}: ${error.message}`); else ins++
  }
}
console.log(`✓ updated ${upd}, inserted ${ins} PSI gas engines`)
