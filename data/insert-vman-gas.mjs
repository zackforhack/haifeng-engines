// VMAN gas genset engines, from the VMAN Gas Genset Catalog 2026. Added to the EXISTING 'VMAN'
// brand (alongside the VMAN diesels). Three platforms: CT (compact inline), CET (AVL inline-6),
// DT (90° V, 130 mm bore for DT15/22/30, 170 mm for DT58; multi-fuel NG/biogas/LPG). Model number
// = displacement in L (validated by a consistent ~18–20 kW/L power density). Configs confirmed:
// DT22=V12, DT30=V16, DT58=V12, CET=inline-6; DT15=V8 / CT07=inline-6 derived from the platform.
// Genset COP electrical power (kWe) from the catalog; kVA = kWe/0.8. 1500 rpm / 50 Hz.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, fuel, cyl, config, displ_L, bore, kWe]
const MODELS = [
  ['CT07', 'Natural Gas', 6, 'L6', 7, 105, 100],
  ['CET12', 'Natural Gas', 6, 'L6', 12, null, 200],
  ['CET13', 'Natural Gas', 6, 'L6', 13, null, 250],
  ['DT15NG', 'Natural Gas', 8, 'V8', 15, 130, 280],
  ['DT15BG', 'Biogas', 8, 'V8', 15, 130, 250],
  ['DT22', 'Natural Gas', 12, 'V12', 22, 130, 400],
  ['DT30', 'Natural Gas', 16, 'V16', 30, 130, 500],
  ['DT30+', 'Natural Gas', 16, 'V16', 30, 130, 550],
  ['DT58', 'Natural Gas', 12, 'V12', 58, 170, 1200],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'VMAN')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let upd = 0, ins = 0
for (const [model, fuel, cyl, config, displ, bore, kwe] of MODELS) {
  // "+" -> "plus" so DT30+ doesn't collapse to the same slug as DT30
  const slug = 'vman-' + model.toLowerCase().replace(/\+/g, '-plus').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const series = model.startsWith('CT') ? 'CT' : model.startsWith('CET') ? 'CET' : 'DT'
  const dt = series === 'DT'
  const fields = {
    series: series + ' Gas', fuel_type: fuel, ignition_type: 'Spark Ignition', cooling_method: 'Liquid-Cooled',
    rpm_rated: 1500, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kwe_50hz: kwe, prime_power_kva_50hz: round1(kwe / 0.8), power_kw: kwe,
    description: `VMAN ${model} — ${displ} L ${config}${bore ? ` (${bore} mm bore)` : ''} spark-ignited `
      + `gas generator engine (VMAN ${series} series). ${kwe} kWe at 1500 rpm / 50 Hz for cogeneration`
      + `${dt ? '; multi-fuel (natural gas, biogas, LPG)' : series === 'CET' ? '; AVL-developed platform' : ''}.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'VMAN', model, status: 'active', origin: 'China', emissions_standard: 'Unregulated', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ updated ${upd}, inserted ${ins} VMAN gas engines`)
