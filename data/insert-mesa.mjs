// Mesa Natural Gas Solutions (USA) PowerCore / GX gas generator engines, from mesapowersolutions.com.
// New brand. EPA-certified spark-ignited NG/propane engines built on Hyundai Construction Equipment
// V12 blocks (21.9 L, bore 128 × stroke 142 mm), Mesa-engineered fuel/control systems.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, cyl, config, displ_L, standby60, engKw60, engKw50, valvesNote]
const MODELS = [
  ['GV22PU', 12, 'V12', 21.9, 450, 510, 452, '2 valves/cyl'],
  ['GX22', 12, 'V12', 21.9, 540, 612, 542, '4 valves/cyl, ~20% more power'],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Mesa')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let upd = 0, ins = 0
for (const [model, cyl, config, displ, s60, k60, k50, note] of MODELS) {
  const slug = 'mesa-' + model.toLowerCase()
  const s50 = Math.round(s60 * (k50 / k60))
  const fields = {
    series: 'PowerCore', fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1800, cylinders: cyl, configuration: config, displacement_l: displ,
    emissions_standard: 'EPA Certified', certifications: ['EPA'], power_kw: k60,
    standby_power_kwe_60hz: s60, standby_power_kva_60hz: round1(s60 / 0.8),
    standby_power_kwe_50hz: s50, standby_power_kva_50hz: round1(s50 / 0.8),
    prime_power_kwe_60hz: Math.round(s60 / 1.1), prime_power_kva_60hz: round1((s60 / 1.1) / 0.8),
    description: `Mesa ${model} — ${displ} L ${config} (128 × 142 mm, ${note}) EPA-certified spark-ignited `
      + `natural-gas / propane generator engine, built on a Hyundai block. Up to ${s60} kW standby (60 Hz) / `
      + `${s50} kW (50 Hz); engine output ${k60} kW (684 hp) at 60 Hz.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Mesa', model, status: 'active', origin: 'United States', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ updated ${upd}, inserted ${ins} Mesa gas engines`)
