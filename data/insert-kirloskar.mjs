import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Kirloskar (KOEL — Kirloskar Oil Engines Ltd, India) R1040/R1080 series.
// India's leading diesel engine maker; this R-series is the genset/industrial
// line used by Wildcat Power Gen's Roughneck (30-100 kW Tier 3 diesel) among
// many others.
//
// Source: Kirloskar R1040 Series engine brochure — mechanical HP ratings per
// IS 10002 / BS 5514 / DIN 6271 / ISO 3046 (Continuous ICXN = prime,
// Fuel Stop IFN = standby). Bore 105 x stroke 120mm.
//
// The brochure publishes MECHANICAL hp only (no genset kVA), so electrical
// ratings here are derived: kWm = hp x 0.7457, kWe = kWm x 0.9 (alternator
// efficiency), kVA = kWe / 0.8. kWe values are therefore estimates.
// Emissions per brochure: Euro I&II / US Tier I&II (off-road); marked Tier 2.

const HP_TO_KW = 0.7457
const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)

// [model, disp_l, cyls, config, p50hp, s50hp, p60hp, s60hp]
const rows = [
  ['3R1040',    3.1, 3, 'In-line 3, Naturally Aspirated',           38,  42,  43,  47],
  ['4R1040',    4.2, 4, 'In-line 4, Naturally Aspirated',           52,  57,  61,  68],
  ['4R1040T',   4.2, 4, 'In-line 4, Turbocharged',                  72,  79,  85,  93],
  ['4R1040TA',  4.2, 4, 'In-line 4, Turbocharged Aftercooled',     105, 115, null, null],
  ['6R1080T',   6.5, 6, 'In-line 6, Turbocharged',                 125, 140, 133, 148],
  ['6R1080TA',  6.5, 6, 'In-line 6, Turbocharged Aftercooled',     141, 171, 168, 185],
]

function hpRatings(p_hp, s_hp) {
  if (p_hp == null) return { kwm: null, kwe: null, kva: null, skwm: null, skwe: null, skva: null }
  const kwm  = r1(p_hp * HP_TO_KW)
  const kwe  = r1(kwm * 0.9)
  const kva  = r1(kwe / 0.8)
  const skwm = r1(s_hp * HP_TO_KW)
  const skwe = r1(skwm * 0.9)
  const skva = r1(skwe / 0.8)
  return { kwm, kwe, kva, skwm, skwe, skva }
}

const records = rows.map(([model, displacement_l, cylinders, configuration, p50, s50, p60, s60]) => {
  const a = hpRatings(p50, s50)  // 50Hz / 1500 rpm
  const b = hpRatings(p60, s60)  // 60Hz / 1800 rpm
  return {
    slug:                    `kirloskar-${model.toLowerCase()}`,
    brand:                   'Kirloskar',
    model,
    series:                  model.startsWith('6R') ? 'R1080 Series' : 'R1040 Series',
    status:                  'active',
    fuel_type:               'Diesel',
    origin:                  'India',
    emissions_standard:      'U.S. EPA Tier 2',
    displacement_l,
    cylinders,
    configuration,
    rpm_rated:               1500,
    prime_power_kw_50hz:     a.kwm,  prime_power_kwe_50hz:   a.kwe,  prime_power_kva_50hz:   a.kva,
    standby_power_kw_50hz:   a.skwm, standby_power_kwe_50hz: a.skwe, standby_power_kva_50hz: a.skva,
    prime_power_kw_60hz:     b.kwm,  prime_power_kwe_60hz:   b.kwe,  prime_power_kva_60hz:   b.kva,
    standby_power_kw_60hz:   b.skwm, standby_power_kwe_60hz: b.skwe, standby_power_kva_60hz: b.skva,
    description: `Kirloskar (KOEL) ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${a.skwe ?? b.skwe} kWe standby. EPA Tier 2. kWe estimated from rated mechanical output.`,
  }
})

console.log(`Inserting ${records.length} Kirloskar engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
