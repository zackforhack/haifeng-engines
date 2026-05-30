import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Lovol (Foton Lovol Heavy Industry, China; Weichai-owned) — major Chinese
// diesel engine maker. New brand. Genset engines are Perkins-licensed
// (1003/1004/1006 = Perkins 1000-series, 1106C = Perkins 1106), so
// displacements are known.
//
// Source: Lovol genset spec listings (agestarem / elecmama). ESP=standby,
// PRP=prime kVA at 50Hz/1500. Genset electrical: kWe = kVA x 0.8, kWm = kWe/0.9.
// 60Hz estimated (~1.2x). Emissions: export/China — Unregulated.

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const kwe = (kva) => (kva == null ? null : r1(kva * 0.8))
const kwm = (kva) => (kva == null ? null : r1((kva * 0.8) / 0.9))

// [model, disp_l, cyls, config, prime50_kva, standby50_kva]
const rows = [
  ['1003G',         3.3, 3, 'In-line 3, Naturally Aspirated',          30,  33],
  ['1003TG',        3.3, 3, 'In-line 3, Turbocharged',                 50,  55],
  ['1004G',         4.4, 4, 'In-line 4, Naturally Aspirated',          41,  45],
  ['1004TG',        4.4, 4, 'In-line 4, Turbocharged',                 80,  88],
  ['1006TG1A',      5.9, 6, 'In-line 6, Turbocharged',                110, 120],
  ['1006TG2A',      6.0, 6, 'In-line 6, Turbocharged',                125, 138],
  ['1006TAG',       6.0, 6, 'In-line 6, Turbocharged Aftercooled',    150, 165],
  ['1106C-P6TAG3',  7.0, 6, 'In-line 6, Turbocharged Aftercooled',    178, 196],
  ['1106C-P6TAG4',  7.0, 6, 'In-line 6, Turbocharged Aftercooled',    200, 220],
]

const records = rows.map(([model, displacement_l, cylinders, configuration, p50, s50]) => {
  const p60 = r1(p50 * 1.2)
  const s60 = r1(s50 * 1.2)
  return {
    slug:                    `lovol-${model.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')}`,
    brand:                   'Lovol',
    model,
    series:                  model.startsWith('1106') ? '1100 Series'
                           : model.startsWith('1006') ? '1000 Series (6cyl)'
                           : model.startsWith('1004') ? '1000 Series (4cyl)'
                           : '1000 Series (3cyl)',
    status:                  'active',
    fuel_type:               'Diesel',
    origin:                  'China',
    emissions_standard:      'Unregulated',
    displacement_l,
    cylinders,
    configuration,
    rpm_rated:               1500,
    prime_power_kwe_50hz:    kwe(p50), prime_power_kva_50hz:   p50, prime_power_kw_50hz:   kwm(p50),
    standby_power_kwe_50hz:  kwe(s50), standby_power_kva_50hz: s50, standby_power_kw_50hz: kwm(s50),
    prime_power_kwe_60hz:    kwe(p60), prime_power_kva_60hz:   p60, prime_power_kw_60hz:   kwm(p60),
    standby_power_kwe_60hz:  kwe(s60), standby_power_kva_60hz: s60, standby_power_kw_60hz: kwm(s60),
    description: `Lovol ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${kwe(s50)} kWe standby at 50Hz (60Hz estimated). Perkins-licensed design. Unregulated.`,
  }
})

console.log(`Inserting ${records.length} Lovol engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
