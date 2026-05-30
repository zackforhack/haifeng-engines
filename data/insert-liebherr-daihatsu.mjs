import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)

// ── Liebherr (Liebherr Machines Bulle, Switzerland) ─────────────────────────
// High-speed diesel engines for power generation (and co-developer of Kohler
// KD). Source: Liebherr product portfolio — values are ENGINE mechanical kW;
// genset kWe derived = kWm x 0.96 (flagged estimated on detail page).
// [model, cyls, config, disp_l, standby_kwm, prime_kwm]
const liebherr = [
  ['D934',  4,  'In-line 4, Turbocharged Intercooled', 7.0,  200, 180],
  ['D936',  6,  'In-line 6, Turbocharged Intercooled', 10.5, 300, 270],
  ['D946',  6,  'In-line 6, Turbocharged Intercooled', 12.0, 400, 360],
  ['D976',  6,  'In-line 6, Turbocharged Intercooled', 18.0, 650, 580],
  ['D9508', 8,  'V8, Turbocharged Intercooled',        16.2, 550, 495],
  ['D9512', 12, 'V12, Turbocharged Intercooled',       24.2, 800, 720],
  ['D9612', 12, 'V12, Turbocharged Intercooled',       27.0, 1000, 900],
]

// ── Daihatsu Diesel (Japan) ─────────────────────────────────────────────────
// Medium-speed marine/stationary genset engines (DK series, 600-750 rpm).
// Source: Daihatsu genset catalog — generator kWe given directly (no estimate).
// Displacement from bore x stroke. [model, cyls, config, disp_l, rpm, standby_kwe]
const daihatsu = [
  ['6DK-20e',  6,  'In-line 6, Medium-speed, Turbocharged',  56.5, 720, 900],
  ['6DK-26e',  6,  'In-line 6, Medium-speed, Turbocharged',  121,  720, 1765],
  ['8DK-28e',  8,  'In-line 8, Medium-speed, Turbocharged',  192,  720, 2650],
  ['6DK-36e',  6,  'In-line 6, Medium-speed, Turbocharged',  293,  600, 3380],
  ['8DK-36e',  8,  'In-line 8, Medium-speed, Turbocharged',  391,  600, 4345],
  ['12DK-36e', 12, 'V12, Medium-speed, Turbocharged',        587,  600, 6370],
]

const records = []

for (const [model, cylinders, configuration, displacement_l, s_kwm, p_kwm] of liebherr) {
  const s_kwe = r1(s_kwm * 0.96), p_kwe = r1(p_kwm * 0.96)
  records.push({
    slug: `liebherr-${model.toLowerCase()}`, brand: 'Liebherr', model,
    series: model.startsWith('D95') || model.startsWith('D96') ? 'D95/96 V-Series' : 'D9 Series',
    status: 'active', fuel_type: 'Diesel', origin: 'Switzerland',
    emissions_standard: 'Euro Stage V', displacement_l, cylinders, configuration, rpm_rated: 1500,
    prime_power_kw_50hz: p_kwm, prime_power_kwe_50hz: p_kwe, prime_power_kva_50hz: r1(p_kwe/0.8),
    standby_power_kw_50hz: s_kwm, standby_power_kwe_50hz: s_kwe, standby_power_kva_50hz: r1(s_kwe/0.8),
    description: `Liebherr ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${s_kwm} kWm standby at 1500rpm. Euro Stage V. kWe estimated at 96% alternator efficiency.`,
  })
}

for (const [model, cylinders, configuration, displacement_l, rpm, s_kwe] of daihatsu) {
  const p_kwe = r1(s_kwe * 0.92)
  records.push({
    slug: `daihatsu-${model.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, brand: 'Daihatsu', model,
    series: model.includes('-36') ? 'DK-36 Series' : model.includes('-28') ? 'DK-28 Series' : model.includes('-26') ? 'DK-26 Series' : 'DK-20 Series',
    status: 'active', fuel_type: 'Diesel', origin: 'Japan',
    emissions_standard: 'Unregulated', displacement_l, cylinders, configuration, rpm_rated: rpm,
    prime_power_kwe_50hz: p_kwe, prime_power_kva_50hz: r1(p_kwe/0.8), prime_power_kw_50hz: r1(p_kwe/0.92),
    standby_power_kwe_50hz: s_kwe, standby_power_kva_50hz: r1(s_kwe/0.8), standby_power_kw_50hz: r1(s_kwe/0.92),
    description: `Daihatsu ${model} ${displacement_l}L ${cylinders}-cylinder medium-speed (${rpm}rpm) diesel engine for marine/stationary generator sets. ${s_kwe} kWe. Unregulated.`,
  })
}

console.log(`Inserting ${records.length} Liebherr + Daihatsu engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, brand, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.brand} ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
