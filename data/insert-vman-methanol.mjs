// (1) Refine VMAN gas displacements to the exact values from the 2026 Sustainable Gas&Methanol
//     catalog, and (2) add VMAN's new HMM methanol-engine series (M100 methanol) — a first
//     methanol fuel type in the DB. Added to the EXISTING 'VMAN' brand. 1500 rpm / 50 Hz.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10

// Exact gas displacements [model, displ_L]
const GAS_DISP = [
  ['CT07', 6.5], ['CET12', 12.8], ['CET13', 12.8], ['DT15NG', 15.07], ['DT15BG', 15.07],
  ['DT22', 22.61], ['DT30', 30.14], ['DT30+', 30.14], ['DT58', 57.2],
]
for (const [model, d] of GAS_DISP) {
  const { data, error } = await supabase.from('engines').update({ displacement_l: d }).eq('brand', 'VMAN').eq('model', model).select('id')
  if (error) console.error(`✗ ${model}: ${error.message}`); else console.log(`· ${model} displ -> ${d} L (${data?.length ?? 0})`)
}

// New methanol engines [model, cyl, config, displ, bore, stroke, kWe]
const METH = [
  ['HMM06F', 4, 'L4', 5.91, 112, 150, 100],
  ['HMM13F', 6, 'L6', 12.82, 130, 161, 280],
]
let ins = 0
for (const [model, cyl, config, displ, bore, stroke, kwe] of METH) {
  const slug = 'vman-' + model.toLowerCase()
  const { data: ex } = await supabase.from('engines').select('id').eq('slug', slug)
  if (ex && ex.length) { console.log('exists', model); continue }
  const { error } = await supabase.from('engines').insert({
    slug, brand: 'VMAN', model, status: 'active', origin: 'China', emissions_standard: 'Unregulated',
    series: 'HMM Methanol', fuel_type: 'Methanol', ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8), power_kw: kwe,
    description: `VMAN ${model} — ${displ} L ${config} (${bore} × ${stroke} mm) turbocharged inter-cooled `
      + `methanol (M100) generator engine (VMAN HMM series, developed on the CET platform with Bosch control). `
      + `${kwe} kWe at 1500 rpm / 50 Hz (1800 rpm / 60 Hz available); sustainable low-carbon power generation.`,
  })
  if (error) console.error('✗', model, error.message); else ins++
}
console.log(`✓ inserted ${ins} VMAN methanol engines`)
