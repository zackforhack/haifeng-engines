// Generates scania-insert.sql from 2025 Scania power generation engine handbook
// PDF: 2025下半年斯堪尼亚发动机手册1125-s.pdf
// kW = mechanical shaft power, kWe = electrical output, kVA = kWe ÷ 0.8 PF
import fs from 'fs'

const slug  = m => `scania-${m.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
const v     = x => x == null ? 'NULL' : x

const CR  = 'Turbocharged, Common Rail'   // diesel common rail
const GAS = 'Turbocharged, Spark Ignition' // CNG/LNG gas engine

// Emissions shorthands
const EUV  = 'EU Stage V'
const CN4  = 'China IV'
const UN   = 'Unregulated'
const T4F  = 'US Tier 4f'
const EU3A = 'EU Stage IIIA'

// Data: [model, series, disp_l, cylinders, config, emissions, rpm_rated,
//        pm50kWm, pm50kWe, pm50kVA,   sb50kWm, sb50kWe, sb50kVA,
//        pm60kWm, pm60kWe, pm60kVA,   sb60kWm, sb60kWe, sb60kVA]
// NULL = not available for that column
const engines = [

  // ── DC13 505A · EU Stage V · 13L · inline-6 ─────────────────────────────
  // Prime (PRP) only — no standby/ESP rating in handbook
  ['DC13 505A 300','DC13 Series',13.0,6,CR,EUV,1500,  269,240,300, null,null,null,  275,240,300, null,null,null],
  ['DC13 505A 350','DC13 Series',13.0,6,CR,EUV,1500,  312,280,350, null,null,null,  318,280,350, null,null,null],
  ['DC13 505A 400','DC13 Series',13.0,6,CR,EUV,1500,  355,320,400, null,null,null,  361,320,400, null,null,null],
  ['DC13 505A 450','DC13 Series',13.0,6,CR,EUV,1500,  398,360,450, null,null,null,  404,360,450, null,null,null],
  ['DC13 505A 500','DC13 Series',13.0,6,CR,EUV,1500,  437,400,500, null,null,null,  443,400,500, null,null,null],

  // ── DC13 506A · China IV · 13L · inline-6 ───────────────────────────────
  ['DC13 506A 300','DC13 Series',13.0,6,CR,CN4,1500,  269,240,300, null,null,null,  275,240,300, null,null,null],
  ['DC13 506A 350','DC13 Series',13.0,6,CR,CN4,1500,  312,280,350, null,null,null,  318,280,350, null,null,null],
  ['DC13 506A 400','DC13 Series',13.0,6,CR,CN4,1500,  355,320,400, null,null,null,  361,320,400, null,null,null],
  ['DC13 506A 450','DC13 Series',13.0,6,CR,CN4,1500,  398,360,450, null,null,null,  404,360,450, null,null,null],
  ['DC13 506A 500','DC13 Series',13.0,6,CR,CN4,1500,  437,400,500, null,null,null,  443,400,500, null,null,null],

  // ── DC13 507A · Unregulated · 13L · inline-6 ────────────────────────────
  // Has both PRP (prime) and ESP (standby/备用)
  ['DC13 507A 300','DC13 Series',13.0,6,CR,UN,1500,  269,240,300, 295,264,330,  275,240,300, 301,264,330],
  ['DC13 507A 350','DC13 Series',13.0,6,CR,UN,1500,  312,280,350, 342,308,385,  318,280,350, 348,308,385],
  ['DC13 507A 400','DC13 Series',13.0,6,CR,UN,1500,  355,320,400, 389,352,440,  361,320,400, 395,352,440],
  ['DC13 507A 450','DC13 Series',13.0,6,CR,UN,1500,  398,360,450, 437,396,495,  404,360,450, 443,396,495],
  ['DC13 507A 500','DC13 Series',13.0,6,CR,UN,1500,  437,400,500, 479,440,550,  443,400,500, 485,440,550],
  ['DC13 507A 550','DC13 Series',13.0,6,CR,UN,1500,  479,440,550, 526,484,605,  485,440,550, 532,484,605],
  ['DC13 507A 600','DC13 Series',13.0,6,CR,UN,1500,  522,480,600, 573,528,660,  528,480,600, 579,528,660],

  // ── DC16 320A · EU Stage V · 16.4L · V8 ─────────────────────────────────
  // Prime only (no standby in handbook)
  ['DC16 320A 02-61','DC16 Series',16.4,8,CR,EUV,1500,  398,360,450, null,null,null,  408,360,450, null,null,null],
  ['DC16 320A 02-62','DC16 Series',16.4,8,CR,EUV,1500,  439,400,500, null,null,null,  449,402,503, null,null,null],
  ['DC16 320A 02-63','DC16 Series',16.4,8,CR,EUV,1500,  481,440,550, null,null,null,  491,442,553, null,null,null],

  // ── DC16 084A · US Tier 4f · 16.4L · V8 · 60 Hz only ───────────────────
  // 1800 rpm / 60 Hz only; kW mechanical not stated in table — using kWe×1.1 estimate
  ['DC16 084A 01-01A','DC16 Series',16.4,8,CR,T4F,1800,  null,null,null, null,null,null,  null,325,406, null,null,null],
  ['DC16 084A 01-01B','DC16 Series',16.4,8,CR,T4F,1800,  null,null,null, null,null,null,  null,389,486, null,null,null],
  ['DC16 084A 01-01C','DC16 Series',16.4,8,CR,T4F,1800,  null,null,null, null,null,null,  null,404,505, null,null,null],

  // ── DC16 071A · EU Stage IIIA / China III / CPCB-II · 16.4L · V8 ────────
  // Prime only
  ['DC16 071A 02-01','DC16 Series',16.4,8,CR,EU3A,1500,  438,400,500, null,null,null,  483,432,540, null,null,null],
  ['DC16 071A 02-02','DC16 Series',16.4,8,CR,EU3A,1500,  480,439,549, null,null,null,  483,432,540, null,null,null],

  // ── DC16 093A · Fuel Optimised (Unregulated) · 16.4L · V8 ───────────────
  // PRP + ESP
  ['DC16 093A 02-51','DC16 Series',16.4,8,CR,UN,1500,  451,407,514, 496,454,567,  447,400,501, 492,442,553],
  ['DC16 093A 02-52','DC16 Series',16.4,8,CR,UN,1500,  486,444,555, 535,490,613,  489,440,550, 538,486,608],
  ['DC16 093A 02-53','DC16 Series',16.4,8,CR,UN,1500,  529,485,606, 582,534,668,  532,480,600, 585,530,663],
  ['DC16 093A 02-54','DC16 Series',16.4,8,CR,UN,1500,  558,512,640, 614,565,706,  576,521,652, 634,576,720],

  // ── DC16 078A · Fuel Optimised (Unregulated) · 16.4L · V8 ───────────────
  // PRP + ESP
  ['DC16 078A 02-41','DC16 Series',16.4,8,CR,UN,1500,  536,480,600, 587,528,660,  534,480,600, 585,528,660],
  ['DC16 078A 02-42','DC16 Series',16.4,8,CR,UN,1500,  578,520,650, 634,572,715,  576,520,650, 632,572,715],
  ['DC16 078A 02-43','DC16 Series',16.4,8,CR,UN,1500,  621,560,700, 680,616,770,  620,562,702, 680,618,773],
  ['DC16 078A 02-44','DC16 Series',16.4,8,CR,UN,1500,  644,580,725, 706,640,800,  640,580,725, 702,640,800],
  ['DC16 078A 02-45','DC16 Series',16.4,8,CR,UN,1500,  644,600,750, 706,660,825,  640,600,750, 702,660,825],

  // ── OC16 071A · Gas Engine · 16.4L · V8 · CNG/LNG ───────────────────────
  // Spark ignition; table gives kW (electrical) and kVA only, no separate kWe column
  // Prime and continuous ratings (no ESP/standby)
  ['OC16 071A 02-81','OC16 Series',16.4,8,GAS,UN,1500,  333,333,364, null,null,null,  372,372,409, null,null,null],
  ['OC16 071A 02-82','OC16 Series',16.4,8,GAS,UN,1500,  372,372,409, null,null,null,  411,411,455, null,null,null],
  ['OC16 071A 02-83','OC16 Series',16.4,8,GAS,UN,1500,  407,407,455, null,null,null,  426,426,477, null,null,null],
  ['OC16 071A 02-91','OC16 Series',16.4,8,GAS,UN,1500,  360,360,395, null,null,null,  360,360,395, null,null,null],
]

const rows = engines.map(([model, series, disp, cyls, config, emissions, rpm,
  pm50kWm, pm50kWe, pm50kVA, sb50kWm, sb50kWe, sb50kVA,
  pm60kWm, pm60kWe, pm60kVA, sb60kWm, sb60kWe, sb60kVA]) => {

  const isGas   = config === GAS
  const fuelStr = isGas ? ' gas (CNG/LNG/biogas)' : ' diesel'
  const cylStr  = cyls ? ` ${cyls}-cylinder` : ''
  const desc    = `Scania ${model} ${disp}L${cylStr}${fuelStr} engine for generator sets. ${emissions} emissions.`

  return `('${slug(model)}', 'Scania', '${model}', '${series}', 'active', 'Sweden',
  ${v(cyls)}, ${disp}, '${config}', ${rpm}, '${emissions}',
  ${v(sb50kWm)}, ${v(sb50kWe)}, ${v(sb50kVA)},
  ${v(pm50kWm)}, ${v(pm50kWe)}, ${v(pm50kVA)},
  ${v(sb60kWm)}, ${v(sb60kWe)}, ${v(sb60kVA)},
  ${v(pm60kWm)}, ${v(pm60kWe)}, ${v(pm60kVA)},
  '${desc}')`
})

const sql = `-- Scania power generation engine inserts
-- Source: 2025 Scania Engine Handbook (2025下半年斯堪尼亚发动机手册1125-s.pdf)
-- DC13 Series: 13L inline-6, 1500/1800 rpm
-- DC16 Series: 16.4L V8, 1500/1800 rpm (DC16 084A is 1800 rpm / 60 Hz only)
-- OC16 Series: 16.4L V8 gas engine (CNG/LNG/biogas), spark ignition
-- kW = mechanical shaft power; kWe = electrical output; kVA = kWe ÷ 0.8 PF
-- PRP (prime) and ESP (standby) where available; certified engines have PRP only

INSERT INTO engines (
  slug, brand, model, series, status, origin,
  cylinders, displacement_l, configuration, rpm_rated, emissions_standard,
  standby_power_kw_50hz, standby_power_kwe_50hz, standby_power_kva_50hz,
  prime_power_kw_50hz,   prime_power_kwe_50hz,   prime_power_kva_50hz,
  standby_power_kw_60hz, standby_power_kwe_60hz, standby_power_kva_60hz,
  prime_power_kw_60hz,   prime_power_kwe_60hz,   prime_power_kva_60hz,
  description
) VALUES
${rows.join(',\n\n')};
`

fs.writeFileSync('/Users/ziqianhuang/haifeng-engines/data/scania-insert.sql', sql)
console.log(`Written ${engines.length} engines to scania-insert.sql`)
