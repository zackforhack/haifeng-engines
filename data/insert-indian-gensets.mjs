import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Indian genset diesel engines: Kirloskar (DV large series), Mahindra Powerol
// (new brand), Ashok Leyland (new brand). Indian-market 50Hz/1500rpm.
//
// Sources: KOEL 320-625 kVA range page (DV series, exact displacement);
// Mahindra Powerol genset pages (engine model + displacement); Ashok Leyland
// genset range pages (engine model + cylinders).
// Genset electrical: standby kVA documented; kWe = kVA x 0.8; kWm = kWe/0.9;
// prime kVA = standby x 0.9. Indian CPCB market — labelled Unregulated
// (non-EPA/Euro). 60Hz not offered (India domestic). Some Ashok Leyland
// displacements estimated (noted).

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const kwe = (kva) => (kva == null ? null : r1(kva * 0.8))
const kwm = (kva) => (kva == null ? null : r1((kva * 0.8) / 0.9))

// [brand, model, series, disp_l, cyls, config, standby50_kva, dispApprox]
const rows = [
  // ── Kirloskar DV series (large) ──────────────────────────────────────────
  ['Kirloskar', 'DV8TA',  'DV Series', 15.92, 8,  'V8, Turbocharged Aftercooled',  400, false],
  ['Kirloskar', 'DV10TA', 'DV Series', 19.89, 10, 'V10, Turbocharged Aftercooled', 500, false],
  ['Kirloskar', 'DV12TA', 'DV Series', 23.88, 12, 'V12, Turbocharged Aftercooled', 625, false],
  // ── Mahindra Powerol ─────────────────────────────────────────────────────
  ['Mahindra', '4905 GMA-C2',   'Powerol',        3.532, 4, 'In-line 4, Naturally Aspirated',          62.5, false],
  ['Mahindra', 'mPower41565G',  'mPOWER Series',  4.8,   4, 'In-line 4, Turbocharged',                 100,  false],
  ['Mahindra', 'mPower61565G',  'mPOWER Series',  7.2,   6, 'In-line 6, Turbocharged',                 125,  false],
  ['Mahindra', 'mPower63105G',  'mPOWER Series',  9.3,   6, 'In-line 6, Turbocharged, Common Rail',    250,  false],
  // ── Ashok Leyland (new brand) ────────────────────────────────────────────
  ['Ashok Leyland', 'H4G4DE100', 'H Series',  5.0, 4, 'In-line 4, Turbocharged',            100, true],
  ['Ashok Leyland', 'H6G4DE125', 'H Series',  7.0, 6, 'In-line 6, Turbocharged',            125, true],
  ['Ashok Leyland', 'H6G4DE160', 'H Series',  7.0, 6, 'In-line 6, Turbocharged',            160, true],
  ['Ashok Leyland', 'AL8NTIDG6', 'AL Series', 7.98, 6, 'In-line 6, Turbocharged Intercooled', 250, false],
]

const records = rows.map(([brand, model, series, displacement_l, cylinders, configuration, s50, dispApprox]) => {
  const p50 = r1(s50 * 0.9)
  return {
    slug:                    `${brand.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${model.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`.replace(/-+/g,'-').replace(/-$/,''),
    brand,
    model,
    series,
    status:                  'active',
    fuel_type:               'Diesel',
    origin:                  'India',
    emissions_standard:      'Unregulated',
    displacement_l,
    cylinders,
    configuration,
    rpm_rated:               1500,
    prime_power_kwe_50hz:    kwe(p50), prime_power_kva_50hz:   p50, prime_power_kw_50hz:   kwm(p50),
    standby_power_kwe_50hz:  kwe(s50), standby_power_kva_50hz: s50, standby_power_kw_50hz: kwm(s50),
    description: `${brand} ${model} ${displacement_l}L${dispApprox ? ' (approx.)' : ''} ${cylinders}-cylinder diesel engine for generator sets. ${s50} kVA standby / ${kwe(s50)} kWe at 50Hz. Indian CPCB market.`,
  }
})

console.log(`Inserting ${records.length} Indian genset engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, brand, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.brand} ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
