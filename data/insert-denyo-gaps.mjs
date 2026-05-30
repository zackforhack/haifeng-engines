import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Model-level gaps found in the Denyo DCA-series deep-dive.
// Source: Denyo DCA Series spec table (genset kVA Continuous=prime / Standby,
// at 50Hz/1500 and 60Hz/1800, with exact engine model + displacement).
// Classic Isuzu BG1/JG1 industrial series + Komatsu 102 series + Kubota D1403.
// kVA from table; kWe = kVA x 0.8; kWm = kWe/0.9.

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const kwe = (kva) => (kva == null ? null : r1(kva * 0.8))
const kwm = (kva) => (kva == null ? null : r1((kva * 0.8) / 0.9))

// [brand, model, series, disp_l, cyls, config, p50kva, s50kva, p60kva, s60kva]
const rows = [
  // ── Isuzu classic BG1 / JG1 industrial series ────────────────────────────
  ['Isuzu', '4JG1T', 'JG1 Series', 3.059, 4, 'In-line 4, Direct Injected, Turbocharged', 37,  38.9, 45,  47.3],
  ['Isuzu', '4BG1T', 'BG1 Series', 4.329, 4, 'In-line 4, Direct Injected, Turbocharged', 50,  55,   60,  66],
  ['Isuzu', '6BG1',  'BG1 Series', 6.494, 6, 'In-line 6, Direct Injected',               65,  68.3, 75,  78.8],
  ['Isuzu', '6BG1T', 'BG1 Series', 6.494, 6, 'In-line 6, Direct Injected, Turbocharged', 80,  88,   100, 110],
  // ── Komatsu 102 series ───────────────────────────────────────────────────
  ['Komatsu', 'SA6D102E',  '102 Series', 5.88, 6, 'In-line 6, Turbocharged',             100, 110,  125, 138],
  ['Komatsu', 'SAA6D102E', '102 Series', 5.88, 6, 'In-line 6, Turbocharged Aftercooled', 125, 138,  150, 165],
  // ── Kubota D1403 ─────────────────────────────────────────────────────────
  ['Kubota', 'D1403', 'D1403 Series', 1.393, 3, 'In-line 3, Indirect Injected',          10.5, 11,  13,  13.7],
]

const records = rows.map(([brand, model, series, displacement_l, cylinders, configuration,
                           p50, s50, p60, s60]) => ({
  slug:                    `${brand.toLowerCase()}-${model.toLowerCase()}`,
  brand,
  model,
  series,
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'Japan',
  emissions_standard:      'Unregulated',
  displacement_l,
  cylinders,
  configuration,
  rpm_rated:               1500,
  prime_power_kwe_50hz:    kwe(p50), prime_power_kva_50hz:   p50, prime_power_kw_50hz:   kwm(p50),
  standby_power_kwe_50hz:  kwe(s50), standby_power_kva_50hz: s50, standby_power_kw_50hz: kwm(s50),
  prime_power_kwe_60hz:    kwe(p60), prime_power_kva_60hz:   p60, prime_power_kw_60hz:   kwm(p60),
  standby_power_kwe_60hz:  kwe(s60), standby_power_kva_60hz: s60, standby_power_kw_60hz: kwm(s60),
  description: `${brand} ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${kwe(s60)} kWe standby at 60Hz / ${kwe(s50)} kWe at 50Hz. Used in Denyo DCA gensets.`,
}))

console.log(`Inserting ${records.length} Denyo-gap engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, brand, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.brand} ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
