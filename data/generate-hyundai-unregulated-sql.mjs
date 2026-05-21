// Generates hyundai-unregulated-insert.sql from 2026 Hyundai uncertified engine price list
// PDF: 2026 现代柴油机-无排放认证（20260508）DX37 CN.pdf
// kWe values taken directly from PDF; kVA = round(kWe / 0.8)
import fs from 'fs'

const kva = kwe => kwe != null ? Math.round(kwe / 0.8) : null
const slug = model => `hyundai-${model.toLowerCase().replace(/\./g, '')}`

// [model, series, disp_l, cylinders, config, emissions, rpm_rated,
//  sb50kWm, pm50kWm, sb50kWe, pm50kWe,
//  sb60kWm, pm60kWm, sb60kWe, pm60kWe]
// All engines: Unregulated (no emission certification)
// Config: 'Turbocharged' = mechanical governor; 'Turbocharged, Common Rail' = ECU/CR
const CR = 'Turbocharged, Common Rail'
const TI = 'Turbocharged'
const UN = 'Unregulated'

const engines = [
  // ── SP344 (3.4L, 4-cyl, mechanical) ─────────────────────────────────────
  ['SP344CB','SP344 Series',3.4,4,TI,UN,1500, 61,55,51,46, 74,67,62,55],
  ['SP344CC','SP344 Series',3.4,4,TI,UN,1500, 81,74,70,64, 92,84,79,72],
  // ── DP054 (5.0L, 4-cyl, common rail) ─────────────────────────────────────
  ['DP054CA','DP054 Series',5.0,4,CR,UN,1500, 125,114,111,101, 150,136,131,118],
  ['DP054CB','DP054 Series',5.0,4,CR,UN,1500, 156,142,140,127, 175,159,154,139],
  ['DP054CC','DP054 Series',5.0,4,CR,UN,1500, 188,177,170,160, 210,197,187,175],
  // ── DP086 (7.5L, 6-cyl, common rail) ─────────────────────────────────────
  ['DP086CA','DP086 Series',7.5,6,CR,UN,1500, 210,191,191,173, 234,213,209,190],
  ['DP086CB','DP086 Series',7.5,6,CR,UN,1500, 225,205,205,186, 260,236,234,211],
  ['DP086CC','DP086 Series',7.5,6,CR,UN,1500, 245,223,224,203, 285,259,257,233],
  ['DP086CD','DP086 Series',7.5,6,CR,UN,1500, 270,245,247,224, 310,282,280,254],
  ['DP086CE','DP086 Series',7.5,6,CR,UN,1500, 294,267,269,244, 335,305,304,276],
  // ── P086TI (8.1L, 6-cyl, mechanical) ─────────────────────────────────────
  ['P086TI-1','P086TI Series',8.1,6,TI,UN,1500, 164,149,148,134, 191,174,170,154],
  ['P086TI',  'P086TI Series',8.1,6,TI,UN,1500, 199,177,180,164, 223,203,200,181],
  // ── DP086LA (8.1L, 6-cyl, mechanical-governor) ───────────────────────────
  ['DP086LA','DP086 Series',8.1,6,TI,UN,1500, 224,204,204,185, 253,230,228,206],
  // ── DP126 (11.1L, 6-cyl) ─────────────────────────────────────────────────
  ['DP126LB','DP126 Series',11.1,6,TI,UN,1500, 362,327,334,301, 402,366,368,334],
  ['DP126CA','DP126 Series',11.1,6,CR,UN,1500, 321,292,288,260, 375,341,331,299],
  ['DP126CB','DP126 Series',11.1,6,CR,UN,1500, 362,329,326,295, 402,365,356,321],
  ['DP126CD','DP126 Series',11.1,6,CR,UN,1500, 414,376,375,339, 458,416,409,369],
  ['DP126CE','DP126 Series',11.1,6,CR,UN,1500, 441,401,400,363, 502,449,450,400],
  // ── P158LE (14.6L, V8, mechanical) ───────────────────────────────────────
  ['P158LE','P158LE Series',14.6,8,TI,UN,1500, 414,363,374,326, 458,402,408,355],
  // ── DP158 (15.1L, V8) ─────────────────────────────────────────────────────
  ['DP158LC','DP158 Series',15.1,8,TI,UN,1500, 449,408,407,368, 513,466,460,415],
  ['DP158LD','DP158 Series',15.1,8,TI,UN,1500, 510,464,466,423, 556,505,501,453],
  // ── DP158 high-output (15.1L, common rail, 50Hz only) ────────────────────
  ['DP158CC', 'DP158 Series',15.1,null,CR,UN,1500, 542,493,496,450, 618,562,558,506],
  ['DP158CD-1','DP158 Series',15.1,null,CR,UN,1500, 580,527,532,482, null,null,null,null],
  ['DP158CD', 'DP158 Series',15.1,null,CR,UN,1500, 612,556,562,509, 662,609,600,550],
  // ── DP222 L-series (21.9L, V12, mechanical) ──────────────────────────────
  ['DP222LA','DP222 Series',21.9,12,TI,UN,1500, 737,670,661,597, null,null,null,null],
  ['DP222LB','DP222 Series',21.9,12,TI,UN,1500, 664,604,606,549, 782,711,703,636],
  ['DP222LC','DP222 Series',21.9,12,TI,UN,1500, 723,657,662,599, 828,753,747,676],
  // ── DP222 C-series (21.9L, V12, common rail) ─────────────────────────────
  ['DP222CA','DP222 Series',21.9,12,CR,UN,1500, 727,663,667,608, 836,762,755,685],
  ['DP222CB','DP222 Series',21.9,12,CR,UN,1500, 790,705,727,646, 890,810,806,730],
  ['DP222CC','DP222 Series',21.9,12,CR,UN,1500, 875,790,807,727, 995,900,905,816],
  // ── DP372 (36.9L, V12, common rail) ──────────────────────────────────────
  ['DP372CA','DP372 Series',36.9,12,CR,UN,1500,  980, 891, 901, 817, 1120,1018,1016, 920],
  ['DP372CB','DP372 Series',36.9,12,CR,UN,1500, 1110,1009,1024, 928, 1320,1200,1205,1092],
  ['DP372CC','DP372 Series',36.9,12,CR,UN,1500, 1240,1127,1146,1040, 1420,1291,1300,1178],
  ['DP372CD','DP372 Series',36.9,12,CR,UN,1500, 1350,1227,1250,1134, null,null,null,null],
  ['DP372CE','DP372 Series',36.9,12,CR,UN,1500, 1440,1309,1335,1212, null,null,null,null],
]

const v = x => x == null ? 'NULL' : x

const rows = engines.map(([model, series, disp, cyls, config, emissions, rpm,
  sb50kWm, pm50kWm, sb50kWe, pm50kWe,
  sb60kWm, pm60kWm, sb60kWe, pm60kWe]) => {

  const sb50kVA = kva(sb50kWe), pm50kVA = kva(pm50kWe)
  const sb60kVA = kva(sb60kWe), pm60kVA = kva(pm60kWe)

  const desc = `Hyundai ${model} ${disp}L${cyls ? ` ${cyls}-cylinder` : ''} diesel engine for generator sets. Unregulated (no emission certification).`

  return `('${slug(model)}', 'Hyundai', '${model}', '${series}', 'active', 'South Korea',
  ${v(cyls)}, ${disp}, '${config}', ${rpm}, '${emissions}',
  ${v(sb50kWm)}, ${v(sb50kWe)}, ${v(sb50kVA)},
  ${v(pm50kWm)}, ${v(pm50kWe)}, ${v(pm50kVA)},
  ${v(sb60kWm)}, ${v(sb60kWe)}, ${v(sb60kVA)},
  ${v(pm60kWm)}, ${v(pm60kWe)}, ${v(pm60kVA)},
  '${desc}')`
})

const sql = `-- Hyundai uncertified (unregulated) engine inserts
-- Source: 2026 Hyundai DX37 CN price list (无排放认证)
-- kWe values taken directly from PDF; kVA = kWe ÷ 0.8 power factor
-- Both standby and prime power provided at 50Hz and 60Hz where available
-- All engines: Status active, Origin South Korea, Unregulated emissions

INSERT INTO engines (
  slug, brand, model, series, status, origin,
  cylinders, displacement_l, configuration, rpm_rated, emissions_standard,
  standby_power_kw_50hz, standby_power_kwe_50hz, standby_power_kva_50hz,
  prime_power_kw_50hz, prime_power_kwe_50hz, prime_power_kva_50hz,
  standby_power_kw_60hz, standby_power_kwe_60hz, standby_power_kva_60hz,
  prime_power_kw_60hz, prime_power_kwe_60hz, prime_power_kva_60hz,
  description
) VALUES
${rows.join(',\n\n')};
`

fs.writeFileSync('/Users/ziqianhuang/haifeng-engines/data/hyundai-unregulated-insert.sql', sql)
console.log(`Written ${engines.length} engines to hyundai-unregulated-insert.sql`)
