import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Model-level gaps found in the Himoinsa industrial-range deep-dive.
// Source: Himoinsa Technical Data — Industrial Range (genset electrical
// kVA/kW PRP=prime, ESP=standby, at 50Hz/1500 and 60Hz/1800).
// Genset ratings electrical (ekW); kVA = ekW/0.8, kWm = ekW/0.9.
//
// Displacement notes:
//   MTU 1600  : 1.753 L/cyl exact (bore 122 x stroke 150) → 10V=17.5, 12V=21.0
//   FPT C16   : Cursor 16 = 15.9L V8 (known)
//   Baudouin 4M11 : 4.5L 4-cyl (known)
//   Hatz air-cooled & Doosan DP180 : displacement ESTIMATED (noted per record)

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const kva = (k) => (k == null ? null : r1(k / 0.8))
const kwm = (k) => (k == null ? null : r1(k / 0.9))

// [brand, model, series, disp_l, cyls, config, emissions, origin, dispApprox,
//  p50, s50, p60, s60]  (kWe; null where not offered at that frequency)
const rows = [
  // ── MTU Series 1600 ──────────────────────────────────────────────────────
  ['MTU', '10V1600G10', 'Series 1600', 17.5, 10, 'V10, Turbocharged Intercooled', 'U.S. EPA Tier 2', 'Germany', false, 365, 403, null, null],
  ['MTU', '10V1600G20', 'Series 1600', 17.5, 10, 'V10, Turbocharged Intercooled', 'U.S. EPA Tier 2', 'Germany', false, 406, 447, 463, 508],
  ['MTU', '12V1600G10', 'Series 1600', 21.0, 12, 'V12, Turbocharged Intercooled', 'U.S. EPA Tier 2', 'Germany', false, 481, 528, 508, 555],
  ['MTU', '12V1600G20', 'Series 1600', 21.0, 12, 'V12, Turbocharged Intercooled', 'U.S. EPA Tier 2', 'Germany', false, 531, 584, 554, 610],

  // ── Hatz air-cooled (1D / 41-series) — displacement approximate ──────────
  ['Hatz', '1D81C', '1D Series', 0.667, 1, 'Single-cylinder, Air-cooled',     'U.S. EPA Tier 4 Interim', 'Germany', true, 3.8, 4.2, 4.6, 5.1],
  ['Hatz', '2L41C', '41 Series', 1.5,  2, 'In-line 2, Air-cooled',            'Euro Stage IIIA',         'Germany', true, 11.6, 12.7, 14.5, 16.2],
  ['Hatz', '2M41',  '41 Series', 1.6,  2, 'In-line 2, Air-cooled',            'Euro Stage IIIA',         'Germany', true, 12.7, 14.0, 15.7, 17.5],
  ['Hatz', '3L41C', '41 Series', 2.3,  3, 'In-line 3, Air-cooled',            'Euro Stage IIIA',         'Germany', true, 18.0, 20.0, 22.0, 25.0],
  ['Hatz', '3M41',  '41 Series', 2.5,  3, 'In-line 3, Air-cooled',            'Euro Stage IIIA',         'Germany', true, 20.0, 22.0, 25.0, 28.0],
  ['Hatz', '4L41C', '41 Series', 3.1,  4, 'In-line 4, Air-cooled',            'Euro Stage IIIA',         'Germany', true, 24.0, 27.0, 30.0, 33.0],
  ['Hatz', '4M41',  '41 Series', 3.3,  4, 'In-line 4, Air-cooled',            'Euro Stage IIIA',         'Germany', true, 26.0, 28.0, 32.0, 35.0],

  // ── FPT Cursor 16 ────────────────────────────────────────────────────────
  ['FPT', 'C16 TE1W', 'Cursor 16', 15.9, 8, 'V8, Turbocharged Intercooled', 'Euro Stage IIIA', 'Italy', false, 478, 525, 494, 545],

  // ── Doosan DP180 (catalogued under Hyundai) — displacement approximate ───
  ['Hyundai', 'DP180LA', 'DP180 Series', 18.3, 6, 'In-line 6, Turbocharged Intercooled', 'Unregulated', 'South Korea', true, 461, 507, 506, 555],
  ['Hyundai', 'DP180LB', 'DP180 Series', 18.3, 6, 'In-line 6, Turbocharged Intercooled', 'Unregulated', 'South Korea', true, 513, 564, 548, 604],

  // ── Baudouin 4M11 ────────────────────────────────────────────────────────
  ['Baudouin', '4M11G120', '4M11 Series', 4.5, 4, 'In-line 4, Turbocharged Intercooled', 'Unregulated', 'France', false, 87, 96, 96, 106],
]

const records = rows.map(([brand, model, series, displacement_l, cylinders, configuration,
                           emissions_standard, origin, dispApprox, p50, s50, p60, s60]) => ({
  slug:                    `${brand.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${model.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`.replace(/-+/g,'-'),
  brand,
  model,
  series,
  status:                  'active',
  fuel_type:               'Diesel',
  origin,
  emissions_standard,
  displacement_l,
  cylinders,
  configuration,
  rpm_rated:               1500,
  prime_power_kwe_50hz:    p50, prime_power_kva_50hz:   kva(p50), prime_power_kw_50hz:   kwm(p50),
  standby_power_kwe_50hz:  s50, standby_power_kva_50hz: kva(s50), standby_power_kw_50hz: kwm(s50),
  prime_power_kwe_60hz:    p60, prime_power_kva_60hz:   kva(p60), prime_power_kw_60hz:   kwm(p60),
  standby_power_kwe_60hz:  s60, standby_power_kva_60hz: kva(s60), standby_power_kw_60hz: kwm(s60),
  description: `${brand} ${model} ${displacement_l}L${dispApprox ? ' (approx.)' : ''} ${cylinders}-cylinder diesel engine for generator sets. ${s50} kWe standby at 50Hz${s60 ? ` / ${s60} kWe at 60Hz` : ''}. ${emissions_standard}.`,
}))

console.log(`Inserting ${records.length} Himoinsa-gap engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, brand, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.brand} ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
