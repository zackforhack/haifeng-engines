// Generates hyundai-insert.sql from raw PDF data
// PDF provides kWm and kWe directly — kVA computed here as round(kWe / 0.8)
import fs from 'fs'

const kva = kwe => kwe != null ? Math.round(kwe / 0.8) : null
const slug = model => `hyundai-${model.toLowerCase()}`

// [model, disp_l, cylinders, config, emissions, rpm_rated (null=1500),
//  sb50kWm, pm50kWm, sb50kWe, pm50kWe,
//  sb60kWm, pm60kWm, sb60kWe, pm60kWe]
// K = EPA Tier 2 (DP126/DP158K) or EPA Tier 3 (DP054/DP086K)
// P = EPA Tier 4 Final, V = Euro Stage V, S = EPA Tier 3

const engines = [
  // ── DP023 (1.8L, 3-cyl) ─────────────────────────────────────────────
  ['DP023CAP','DP023 Series',1.8,3,'Turbocharged, Common Rail','EPA Tier 4 Final', 30,27,26,23, 38,34,34,30],
  ['DP023CAV','DP023 Series',1.8,3,'Turbocharged, Common Rail','Euro Stage V',      30,28,26,24, 42,38,37,34],
  // ── DP024 (2.4L, 4-cyl) ─────────────────────────────────────────────
  ['DP024CAP','DP024 Series',2.4,4,'Turbocharged, Common Rail','EPA Tier 4 Final', 42,39,37,34, 50,46,44,41],
  ['DP024CAV','DP024 Series',2.4,4,'Turbocharged, Common Rail','Euro Stage V',      48,46,42,41, 55,50,49,43],
  // ── DP034 (3.4L, 4-cyl) ─────────────────────────────────────────────
  ['DP034CAP','DP034 Series',3.4,4,'Turbocharged, Common Rail','EPA Tier 4 Final', 51,51,44,44, 55,55,46,46],
  ['DP034CCP','DP034 Series',3.4,4,'Turbocharged, Common Rail','EPA Tier 4 Final', 78,74,69,64, 92,85,80,73],
  ['DP034CAV','DP034 Series',3.4,4,'Turbocharged, Common Rail','Euro Stage V',      55,55,48,48, 55,55,46,46],
  ['DP034CCV','DP034 Series',3.4,4,'Turbocharged, Common Rail','Euro Stage V',      78,74,69,64, 92,85,80,73],
  // ── DP054 (5.0L, 4-cyl) ─────────────────────────────────────────────
  ['DP054CAK','DP054 Series',5.0,4,'Turbocharged','EPA Tier 3',                    140,127,125,113, 150,136,131,118],
  ['DP054CBK','DP054 Series',5.0,4,'Turbocharged','EPA Tier 3',                    179,163,162,147, 197,179,175,158],
  ['DP054CAP','DP054 Series',5.0,4,'Turbocharged, Common Rail','EPA Tier 4 Final', 125,114,111,101, 150,136,131,118],
  ['DP054CBP','DP054 Series',5.0,4,'Turbocharged, Common Rail','EPA Tier 4 Final', 156,142,140,127, 175,159,154,139],
  ['DP054CCP','DP054 Series',5.0,4,'Turbocharged, Common Rail','EPA Tier 4 Final', 183,177,165,160, 200,197,177,175],
  ['DP054CAV','DP054 Series',5.0,4,'Turbocharged, Common Rail','Euro Stage V',      125,114,111,101, 150,136,131,118],
  ['DP054CBV','DP054 Series',5.0,4,'Turbocharged, Common Rail','Euro Stage V',      156,142,140,127, 175,159,154,139],
  ['DP054CCV','DP054 Series',5.0,4,'Turbocharged, Common Rail','Euro Stage V',      183,177,165,160, 200,197,177,175],
  // ── DP086 (7.5L, 6-cyl) ─────────────────────────────────────────────
  ['DP086CAK','DP086 Series',7.5,6,'Turbocharged','EPA Tier 3',                    210,191,191,173, 234,213,209,190],
  ['DP086CBK','DP086 Series',7.5,6,'Turbocharged','EPA Tier 3',                    225,205,205,186, 260,236,234,211],
  ['DP086CCK','DP086 Series',7.5,6,'Turbocharged','EPA Tier 3',                    263,239,240,218, 294,267,266,240],
  ['DP086CBP','DP086 Series',7.5,6,'Turbocharged, Common Rail','EPA Tier 4 Final', 225,205,205,186, 260,236,234,211],
  ['DP086CCP','DP086 Series',7.5,6,'Turbocharged, Common Rail','EPA Tier 4 Final', 245,223,224,203, 285,259,257,233],
  ['DP086CDP','DP086 Series',7.5,6,'Turbocharged, Common Rail','EPA Tier 4 Final', 270,245,247,224, 307,279,278,251],
  ['DP086CBV','DP086 Series',7.5,6,'Turbocharged, Common Rail','Euro Stage V',      225,205,205,186, 260,236,234,211],
  ['DP086CCV','DP086 Series',7.5,6,'Turbocharged, Common Rail','Euro Stage V',      245,223,224,203, 285,259,257,233],
  ['DP086CDV','DP086 Series',7.5,6,'Turbocharged, Common Rail','Euro Stage V',      270,245,247,224, 307,279,278,251],
  // ── DP126 (11.1L, 6-cyl, 50Hz only) ─────────────────────────────────
  ['DP126CAK','DP126 Series',11.1,6,'Turbocharged','EPA Tier 2',                   375,341,331,299, null,null,null,null],
  ['DP126CBK','DP126 Series',11.1,6,'Turbocharged','EPA Tier 2',                   402,365,356,321, null,null,null,null],
  ['DP126CCK','DP126 Series',11.1,6,'Turbocharged','EPA Tier 2',                   441,401,393,355, null,null,null,null],
  // ── DP158 (15.1L, 6-cyl) ─────────────────────────────────────────────
  ['DP158CAK','DP158 Series',15.1,null,'Turbocharged','EPA Tier 2',                459,417,418,378, 522,475,468,423],
  ['DP158CBK','DP158 Series',15.1,null,'Turbocharged','EPA Tier 2',                503,457,459,416, 560,509,504,455],
  ['DP158CCS','DP158 Series',15.1,null,'Turbocharged','EPA Tier 3',                618,562,558,506, null,null,null,null],
  ['DP158CDS','DP158 Series',15.1,null,'Turbocharged','EPA Tier 3',                662,609,600,550, null,null,null,null],
  // ── DP222 (21.9L) ────────────────────────────────────────────────────
  ['DP222CAS','DP222 Series',21.9,null,'Turbocharged','EPA Tier 3',                727,663,667,607, 836,762,755,685],
  ['DP222CBS','DP222 Series',21.9,null,'Turbocharged','EPA Tier 3',                790,705,727,645, 890,810,806,730],
  ['DP222CCS','DP222 Series',21.9,null,'Turbocharged','EPA Tier 3',                875,790,807,727, 995,900,905,816],
]

const v = x => x == null ? 'NULL' : x

const rows = engines.map(([model, series, disp, cyls, config, emissions,
  sb50kWm, pm50kWm, sb50kWe, pm50kWe,
  sb60kWm, pm60kWm, sb60kWe, pm60kWe]) => {

  const sb50kVA = kva(sb50kWe), pm50kVA = kva(pm50kWe)
  const sb60kVA = kva(sb60kWe), pm60kVA = kva(pm60kWe)

  const desc = `Hyundai ${model} ${disp}L ${cyls ? cyls+'-cylinder ' : ''}diesel engine for generator sets. ${emissions} certified.`

  return `('${slug(model)}', 'Hyundai', '${model}', '${series}', 'active', 'South Korea',
  ${v(cyls)}, ${disp}, '${config}', 1500, '${emissions}',
  ${v(sb50kWm)}, ${v(sb50kWe)}, ${v(sb50kVA)},
  ${v(pm50kWm)}, ${v(pm50kWe)}, ${v(pm50kVA)},
  ${v(sb60kWm)}, ${v(sb60kWe)}, ${v(sb60kVA)},
  ${v(pm60kWm)}, ${v(pm60kWe)}, ${v(pm60kVA)},
  '${desc}')`
})

const sql = `-- Hyundai DP series generator engine inserts
-- Source: Hyundai 2026 OEM certified engines price list
-- kWe values taken directly from PDF; kVA = kWe ÷ 0.8 power factor
-- Both standby and prime power provided
-- All engines: Status active, Origin South Korea

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

fs.writeFileSync('/Users/ziqianhuang/haifeng-engines/data/hyundai-insert.sql', sql)
console.log(`Written ${engines.length} engines to hyundai-insert.sql`)
