import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// FAWDE — FAW Jiefang Wuxi Diesel Engine Works (Wuxi, China). Chinese genset
// diesel engine maker (15-413 kVA), used by Himoinsa cost lines and many
// Chinese genset packagers. New brand, same category as Weichai/Yuchai/SDEC.
//
// Source: FAWDE genset engine spec table (50Hz + 60Hz, prime/standby kW/kVA,
// displacement, cylinders). Genset ratings electrical (ekW); kVA given as
// ekW/0.8, kWm derived = ekW/0.9. Model = base engine family (the published
// per-frequency suffixes like -24D/-90D are tuning variants of these).

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)

// [model, disp_l, cyls, config, prime50, standby50, prime60, standby60]  (kWe)
const rows = [
  ['4DW81',    2.0, 4, 'In-line 4, Turbocharged',              12,   13,   15,  17],
  ['4DW91',    2.4, 4, 'In-line 4, Turbocharged',              16,   17.6, 22,  24],
  ['4DW92',    2.7, 4, 'In-line 4, Turbocharged',              24,   26,   null, null],
  ['4DX22',    3.1, 4, 'In-line 4, Turbocharged',              30,   33,   null, null],
  ['4DX23',    3.9, 4, 'In-line 4, Turbocharged',              48,   53,   55,  61],
  ['CA4DF2',   4.0, 4, 'In-line 4, Turbocharged Intercooled',  68,   75,   85,  94],
  ['CA6DF2',   6.0, 6, 'In-line 6, Turbocharged Intercooled',  96,  106,   null, null],
  ['CA6DL1',   7.0, 6, 'In-line 6, Turbocharged Intercooled', 144,  158,   null, null],
  ['CA6DM2',   9.7, 6, 'In-line 6, Turbocharged Intercooled', 240,  264,  270, 297],
  ['CA6DM3',  11.6, 6, 'In-line 6, Turbocharged Intercooled', 300,  330,  300, 330],
]

const kva = (kwe) => (kwe == null ? null : r1(kwe / 0.8))
const kwm = (kwe) => (kwe == null ? null : r1(kwe / 0.9))

const records = rows.map(([model, displacement_l, cylinders, configuration, p50, s50, p60, s60]) => ({
  slug:                    `fawde-${model.toLowerCase()}`,
  brand:                   'FAWDE',
  model,
  series:                  model.startsWith('CA6DM') ? 'CA6DM Series'
                         : model.startsWith('CA6D')  ? 'CA6D Series'
                         : model.startsWith('CA4D')  ? 'CA4D Series'
                         : model.startsWith('4DX')   ? '4DX Series'
                         : '4DW Series',
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'China',
  emissions_standard:      'Unregulated',
  displacement_l,
  cylinders,
  configuration,
  rpm_rated:               1500,
  prime_power_kwe_50hz:    p50, prime_power_kva_50hz:   kva(p50), prime_power_kw_50hz:   kwm(p50),
  standby_power_kwe_50hz:  s50, standby_power_kva_50hz: kva(s50), standby_power_kw_50hz: kwm(s50),
  prime_power_kwe_60hz:    p60, prime_power_kva_60hz:   kva(p60), prime_power_kw_60hz:   kwm(p60),
  standby_power_kwe_60hz:  s60, standby_power_kva_60hz: kva(s60), standby_power_kw_60hz: kwm(s60),
  description: `FAWDE (FAW Wuxi) ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${s50} kWe standby at 50Hz${s60 ? ` / ${s60} kWe at 60Hz` : ''}.`,
}))

console.log(`Inserting ${records.length} FAWDE engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
