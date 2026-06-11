// Enrich PSI rows from PSI's official engine spec-sheet PDFs (psiengines.com, downloaded Jun 2026).
// Adds compression_ratio, dry weight (kg), exact displacement, bore×stroke + induction (in
// description), and the NG standby/prime kWe+kWm @ 50/60 Hz rating matrix where the sheet states it.
// Keyed by slug so it targets each existing row precisely. Power left untouched where the sheet
// portion was not unambiguous. LPG / High-Output (HO) ratings noted in the description text.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const r1 = (n) => Math.round(n * 10) / 10

// p = [stby50kWe, stby50kWm, stby60kWe, stby60kWm, prime50kWe, prime50kWm, prime60kWe, prime60kWm] (NG); null entries skipped
const D = [
  // GAS (Natural Gas / Propane) ─ slug, displ, cr, wtkg, bore, stroke, induction, p, note
  ['psi-gas-2-4l',   2.35, 9.5,  136, 86.5, 100, 'naturally aspirated',  [20,26,25,32, null,null,null,null], 'LPG standby 22/30 kWe (50/60 Hz)'],
  ['psi-gas-2-4l-t', 2.35, 9.5,  136, 86.5, 100, 'turbocharged & air-cooled', [null,null,40,50, null,null,null,null], '60 Hz rated; LPG standby 40 kWe'],
  ['psi-gas-4-3l',   4.29, 9.8,  195, 101.6, 88.4,'naturally aspirated',  [40,48,50,58, 35,43,40,52], 'LPG standby 40/50 kWe'],
  ['psi-gas-4-5l',   4.50, 9.75, 500, 105, 130,  'naturally aspirated',  null, 'LPG prime 36/40 kWe (50/60 Hz)'],
  ['psi-gas-5-7l',   5.74, 9.4,  196, 101.6, 88.4,'naturally aspirated',  [55,65,60,78, 50,58,55,70], 'LPG standby 60/70 kWe'],
  ['psi-gas-5-7l-t', 5.74, 9.4,  196, 101.6, 88.4,'turbocharged & air-to-air charge-cooled', [65,75,80,97, null,null,null,null], 'T (single-stage) rating'],
  ['psi-gas-5-7l-tcac',5.74,9.4, 196, 101.6, 88.4,'turbocharged & air-to-air charge-cooled (TCAC)', [85,100,100,122, null,null,null,null], 'LPG standby 80/90 kWe'],
  ['psi-gas-6-7l',   6.75, 9.8,  680, 105, 130,  'naturally aspirated',  [null,null,null,null, 55,66,70,80], 'LPG prime 60/70 kWe'],
  ['psi-gas-6-7l-t', 6.75, 9.8,  680, 105, 130,  'turbocharged & air-to-air charge-cooled', [null,null,null,null, null,null,85,99], '60 Hz prime 85 kWe'],
  ['psi-gas-8-1l',   8.06, 10.5, 998, 111, 139,  'naturally aspirated',  [null,null,null,null, 55,67,75,88], 'LPG standby 65/80 kWe'],
  ['psi-gas-8-1l-t', 8.06, 10.5, 998, 111, 139,  'turbocharged & air-to-air charge-cooled', [110,131,125,150, null,null,null,null], 'LPG prime 80/95 kWe'],
  ['psi-gas-8-8l',   8.80, 10.0, null,110.5,114.3,'naturally aspirated',  [75,91,80,109, null,null,null,null], 'LPG standby 100/115 kWe'],
  ['psi-gas-8-8l-t', 8.80, 10.0, null,110.5,114.3,'turbocharged & air-to-air charge-cooled', null, 'see 8.8 T/TCAC sheet'],
  ['psi-gas-8-8l-tcac',8.80,10.0,null,110.5,114.3,'turbocharged & air-to-air charge-cooled (TCAC)', [125,162,150,195, null,null,null,null], 'TCAC-HO 200 kWe @ 60 Hz; LPG standby 110/130 kWe'],
  ['psi-gas-10l',    9.73, 10.5, 1070,126, 130,  'naturally aspirated',  null, null],
  ['psi-gas-10l-t',  9.73, 10.5, 1180,126, 130,  'turbocharged & air-cooled', [null,null,null,null, 180,200,170,200], 'LPG prime 135/140 kWe'],
  ['psi-gas-11l',    11.05,10.5, 1179,123, 155,  'turbocharged & air-to-air charge-cooled', [150,180,175,200, null,null,null,null], 'LPG standby 115/135 kWe'],
  ['psi-gas-13l',    12.54,9.75, 1050,126, 165.1,'turbocharged & air-cooled', [223,250,262,299, 205,230,207,240], 'High-Output NG standby 250/300 kWe (50/60 Hz)'],
  ['psi-gas-14l',    14.60,10.5, 1429,128, 142,  'turbocharged & air-to-air charge-cooled', [240,275,300,340, 210,250,250,290], 'High-Output NG standby 350 kWe @ 60 Hz; LPG standby 150/200 kWe'],
  ['psi-gas-20l',    19.60,10.5, 2110,150, 185,  'turbocharged & air-to-air charge-cooled', [400,460,500,570, 365,414,400,450], 'LPG standby 250/300 kWe'],
  ['psi-gas-22l',    21.93,10.5, 1650,128, 142,  'turbocharged & air-to-air charge-cooled', [350,397,450,510, 300,340,375,434], 'High-Output NG standby 500 kWe @ 60 Hz; LPG prime 210/250 kWe'],
  ['psi-gas-32l',    31.80,10.5, 3124,150, 150,  'turbocharged & air-to-air charge-cooled', [525,600,650,720, 450,510,525,612], 'LPG prime 300/350 kWe'],
  ['psi-gas-40l',    39.23,10.5, 3390,150, 185,  'turbocharged & air-to-air charge-cooled', [650,740,800,920, 585,666,725,828], 'LPG standby 430/500 kWe'],
  ['psi-gas-53l',    52.31,10.5, 5500,150, 185,  'turbocharged & air-to-air charge-cooled', [850,987,1050,1185, 775,888,925,1067], 'High-Output NG standby 1250 kWe @ 60 Hz; LPG prime 575/700 kWe'],
  // DIESEL ─ enrich physical specs only (rating tiers already encoded per row)
  ['psi-psi-20l-d-600kwe', 19.62,15.0, 2110,150,185, 'turbocharged & intercooled', null, null],
  ['psi-psi-20l-d-650kwe', 19.62,15.0, 2110,150,185, 'turbocharged & intercooled', null, null],
  ['psi-psi-40l-d-1000kwe',39.24,15.0, 3390,150,185, 'turbocharged & intercooled', null, null],
  ['psi-psi-40l-d-1300kwe',39.24,15.0, 3390,150,185, 'turbocharged & intercooled', null, null],
  ['psi-psi-53l-d-1500kwe',52.32,15.0, 4800,150,185, 'turbocharged & intercooled', null, null],
  ['psi-psi-53l-d-1750kwe',52.32,15.0, 4800,150,185, 'turbocharged & intercooled', null, null],
  ['psi-psi-88l-d-2800kwe',87.50,16.5,11500,180,215, 'turbocharged & intercooled', null, null],
  ['psi-psi-88l-d-3000kwe',87.50,16.5,11500,180,215, 'turbocharged & intercooled', null, null],
  ['psi-psi-88l-d-3300kwe',87.50,16.5,11500,180,215, 'turbocharged & intercooled', null, null],
]

const { data: rows } = await supabase.from('engines').select('id, slug, model, configuration, fuel_type, description').eq('brand', 'PSI')
const bySlug = new Map(rows.map((r) => [r.slug, r]))
let n = 0, skipped = []
for (const [slug, displ, cr, wt, bore, stroke, induction, p, note] of D) {
  const row = bySlug.get(slug)
  if (!row) { skipped.push(slug); continue }
  const upd = { displacement_l: displ, compression_ratio: cr, bore_stroke_note: undefined }
  if (wt != null) upd.weight_kg = wt
  if (cr != null) upd.compression_ratio = cr
  delete upd.bore_stroke_note
  // power matrix (NG)
  if (p) {
    const [s5e,s5m,s6e,s6m,p5e,p5m,p6e,p6m] = p
    if (s5e!=null){ upd.standby_power_kwe_50hz=s5e; upd.standby_power_kw_50hz=s5m; upd.standby_power_kva_50hz=r1(s5e/0.8) }
    if (s6e!=null){ upd.standby_power_kwe_60hz=s6e; upd.standby_power_kw_60hz=s6m; upd.standby_power_kva_60hz=r1(s6e/0.8) }
    if (p5e!=null){ upd.prime_power_kwe_50hz=p5e; upd.prime_power_kw_50hz=p5m; upd.prime_power_kva_50hz=r1(p5e/0.8) }
    if (p6e!=null){ upd.prime_power_kwe_60hz=p6e; upd.prime_power_kw_60hz=p6m; upd.prime_power_kva_60hz=r1(p6e/0.8) }
  }
  // fresh authoritative description
  const fuel = row.fuel_type === 'Diesel' ? 'diesel' : 'natural gas / propane'
  const headline = p
    ? (p[0]!=null ? `${p[0]} kWe standby / ${p[4]??'–'} kWe prime @ 50 Hz` : (p[6]!=null?`${p[6]} kWe prime @ 60 Hz`:''))
    : ''
  upd.description = `PSI ${row.model} — ${displ} L ${row.configuration} (${bore} × ${stroke} mm bore × stroke) `
    + `${induction} ${fuel} generator engine, ${cr}:1 compression${wt!=null?`, ${wt} kg dry`:''}. `
    + `${headline ? headline + '. ' : ''}From the official PSI ${row.model} spec sheet${note ? ` (${note})` : ''}.`
  const { error } = await supabase.from('engines').update(upd).eq('id', row.id)
  if (error) console.error('✗', slug, error.message); else { n++; console.log('· enriched', slug) }
}
console.log(`\n✓ enriched ${n} PSI rows`); if (skipped.length) console.log('skipped (slug not found):', skipped.join(', '))
