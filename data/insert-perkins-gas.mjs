// Perkins 4000 Series gas engines (spark-ignition), from Perkins/distributor spec data. Added to
// the EXISTING 'Perkins' brand. Bore 160 × stroke 190 mm (3.82 L/cyl), turbocharged lean-burn for
// CHP/power generation. Headline = top genset kWe; kVA = kWe/0.8. 1500 rpm (50 Hz).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const round1 = (n) => Math.round(n * 10) / 10
// [model, cyl, config, displ_L, kWeMax, kWeMin]
const MODELS = [
  ['4006TESI', 6, 'L6', 22.9, 400, 300],
  ['4008TESI', 8, 'V8', 30.5, 500, 400],
  ['4012-46TWG2A', 12, 'V12', 45.8, 1000, 750],
]
const { data: existing } = await supabase.from('engines').select('id, slug').eq('brand', 'Perkins')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e.id]))
let upd = 0, ins = 0
for (const [model, cyl, config, displ, kweMax, kweMin] of MODELS) {
  const slug = 'perkins-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const fields = {
    series: '4000 Series Gas', fuel_type: 'Natural Gas', ignition_type: 'Spark Ignition',
    cooling_method: 'Liquid-Cooled', rpm_rated: 1500, cylinders: cyl, configuration: config, displacement_l: displ,
    prime_power_kwe_50hz: kweMax, prime_power_kva_50hz: round1(kweMax / 0.8), power_kw: kweMax,
    description: `Perkins ${model} — ${displ} L ${config} (160 × 190 mm) turbocharged spark-ignited natural-gas/`
      + `biogas engine (Perkins 4000 Series Gas). ${kweMin}–${kweMax} kWe at 1500 rpm / 50 Hz, for CHP / power generation.`,
  }
  if (bySlug.has(slug)) { const { error } = await supabase.from('engines').update(fields).eq('id', bySlug.get(slug)); if (error) console.error('✗', model, error.message); else upd++ }
  else { const { error } = await supabase.from('engines').insert({ slug, brand: 'Perkins', model, status: 'active', origin: 'United Kingdom', emissions_standard: 'Unregulated', ...fields }); if (error) console.error('✗', model, error.message); else ins++ }
}
console.log(`✓ updated ${upd}, inserted ${ins} Perkins gas engines`)
