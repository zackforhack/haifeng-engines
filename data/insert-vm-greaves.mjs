import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const kwe = (kva) => (kva == null ? null : r1(kva * 0.8))
const kwm = (kva) => (kva == null ? null : r1((kva * 0.8) / 0.9))

// ── VM Motori (Cento, Italy; Stellantis) ────────────────────────────────────
// Confirmed engine models + displacement/cylinders. Genset standby kVA is a
// REPRESENTATIVE estimate scaled from displacement (VM's standalone genset
// ratings aren't cleanly published). [model, cyls, disp, config, emissions, sb_kva]
const vm = [
  ['D703E2',  3, 2.1, 'In-line 3, Naturally Aspirated',            'Euro Stage II',   35],
  ['D754TE3', 4, 3.0, 'In-line 4, Turbocharged',                   'Euro Stage IIIA', 55],
  ['R754',    4, 3.0, 'In-line 4, Turbocharged, Common Rail',      'Euro Stage V',    70],
  ['D756',    6, 4.5, 'In-line 6, Turbocharged',                   'Euro Stage IIIA', 90],
]

// ── Greaves Cotton (India) ──────────────────────────────────────────────────
// Genset model designations and kVA are documented; displacement is APPROXIMATE
// (Greaves does not publish per-model displacement clearly). India 50Hz/CPCB.
// [model, cyls, disp_approx, config, sb_kva]
const greaves = [
  ['GPWII-PII-15X',   3, 2.5,  'In-line 3',                  15],
  ['GPWII-PII-25E',   3, 2.8,  'In-line 3, Turbocharged',    25],
  ['GPWII-PII-62.5',  4, 4.0,  'In-line 4, Turbocharged',    62.5],
  ['GPWII-PII-200',   6, 11.0, 'In-line 6, Turbocharged',    200],
  ['GPWII-PII-250',   6, 11.0, 'In-line 6, Turbocharged',    250],
]

const records = []

for (const [model, cylinders, displacement_l, configuration, emissions_standard, sb] of vm) {
  const p = r1(sb * 0.9)
  records.push({
    slug: `vm-motori-${model.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, brand: 'VM Motori', model,
    series: 'D700 Series', status: 'active', fuel_type: 'Diesel', origin: 'Italy',
    emissions_standard, displacement_l, cylinders, configuration, rpm_rated: 1500,
    prime_power_kwe_50hz: kwe(p), prime_power_kva_50hz: p, prime_power_kw_50hz: kwm(p),
    standby_power_kwe_50hz: kwe(sb), standby_power_kva_50hz: sb, standby_power_kw_50hz: kwm(sb),
    description: `VM Motori ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ~${sb} kVA standby at 50Hz (representative rating). ${emissions_standard}.`,
  })
}

for (const [model, cylinders, displacement_l, configuration, sb] of greaves) {
  const p = r1(sb * 0.9)
  records.push({
    slug: `greaves-${model.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, brand: 'Greaves', model,
    series: 'Greaves Power', status: 'active', fuel_type: 'Diesel', origin: 'India',
    emissions_standard: 'Unregulated', displacement_l, cylinders, configuration, rpm_rated: 1500,
    prime_power_kwe_50hz: kwe(p), prime_power_kva_50hz: p, prime_power_kw_50hz: kwm(p),
    standby_power_kwe_50hz: kwe(sb), standby_power_kva_50hz: sb, standby_power_kw_50hz: kwm(sb),
    description: `Greaves ${model} ${displacement_l}L (approx.) ${cylinders}-cylinder diesel engine for generator sets. ${sb} kVA standby / ${kwe(sb)} kWe at 50Hz. Indian CPCB market.`,
  })
}

console.log(`Inserting ${records.length} VM Motori + Greaves engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, brand, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.brand} ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
