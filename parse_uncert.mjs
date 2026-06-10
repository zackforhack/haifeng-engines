// Parse the extracted PDF rows into structured engine data
// Column order (per user note):
// Model | Displacement | 1500rpm Standby kWm | 1500rpm Prime kWm | 1500rpm Standby kWe | 1500rpm Prime kWe
//       | 1800rpm Standby kWm | 1800rpm Prime kWm | 1800rpm Standby kWe | 1800rpm Prime kWe | [rest of specs]

// Raw data rows extracted from PDF (power data only, no pricing)
// For engines with multiple variants on same row, they share dimensional/config data

const engines = [
  // ============================================================
  // DN03 / SP344CB / SP344CC  —  3.409L L4 TI  (non-CR mechanical)
  // Row: 61 81 55 74 51 70 46 64 | 74 92 67 84 62 79 55 72
  //       1500StkWm 1500PrkWm 1500StkWe 1500PrkWe | 1800StkWm 1800PrkWm 1800StkWe 1800PrkWe
  // NOTE: DN03 has SP344CB and SP344CC listed as sub-models
  {
    series: "DN03",
    model: "SP344CB",
    displacement: 3.409,
    cylinders: "L4",
    config: "Turbocharged (TI)",
    rpm1500_standby_kwm: 61, rpm1500_prime_kwm: 55,
    rpm1500_standby_kwe: 51, rpm1500_prime_kwe: 46,
    rpm1800_standby_kwm: 74, rpm1800_prime_kwm: 67,
    rpm1800_standby_kwe: 62, rpm1800_prime_kwe: 55,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DN03",
    model: "SP344CC",
    displacement: 3.409,
    cylinders: "L4",
    config: "Turbocharged (TI)",
    rpm1500_standby_kwm: 81, rpm1500_prime_kwm: 74,
    rpm1500_standby_kwe: 70, rpm1500_prime_kwe: 64,
    rpm1800_standby_kwm: 92, rpm1800_prime_kwm: 84,
    rpm1800_standby_kwe: 79, rpm1800_prime_kwe: 72,
    emissions: "Unregulated",
    notes: ""
  },

  // ============================================================
  // DX05  —  5.018L L4 TI Common Rail ECU
  // DP054CA row: 125 114 111 101 | 150 136 131 118  (powers only, no kWe listed on separate row)
  // DP054CB/CC row: 156 188 142 177 140 170 127 160 | 175 210 159 197 154 187 139 175
  // NOTE: DP054CA appears to be a simpler entry with only kWm data visible
  {
    series: "DX05",
    model: "DP054CA",
    displacement: 5.018,
    cylinders: "L4",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 125, rpm1500_prime_kwm: 114,
    rpm1500_standby_kwe: 111, rpm1500_prime_kwe: 101,
    rpm1800_standby_kwm: 150, rpm1800_prime_kwm: 136,
    rpm1800_standby_kwe: 131, rpm1800_prime_kwe: 118,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DX05",
    model: "DP054CB",
    displacement: 5.018,
    cylinders: "L4",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 156, rpm1500_prime_kwm: 142,
    rpm1500_standby_kwe: 140, rpm1500_prime_kwe: 127,
    rpm1800_standby_kwm: 175, rpm1800_prime_kwm: 159,
    rpm1800_standby_kwe: 154, rpm1800_prime_kwe: 139,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DX05",
    model: "DP054CC",
    displacement: 5.018,
    cylinders: "L4",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 188, rpm1500_prime_kwm: 177,
    rpm1500_standby_kwe: 170, rpm1500_prime_kwe: 160,
    rpm1800_standby_kwm: 210, rpm1800_prime_kwm: 197,
    rpm1800_standby_kwe: 187, rpm1800_prime_kwe: 175,
    emissions: "Unregulated",
    notes: ""
  },

  // ============================================================
  // DX08  —  7.527L L6 TI Common Rail ECU
  // DP086CA: 210 191 191 173 | 234 213 209 190
  // DP086CB/CC: 225 245 205 223 205 224 186 203 | 260 285 236 259 234 257 211 233
  // DP086CD: 270 245 247 224 | 310 282 280 254
  // DP086CE: 294 267 269 244 | 335 305 304 276
  {
    series: "DX08",
    model: "DP086CA",
    displacement: 7.527,
    cylinders: "L6",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 210, rpm1500_prime_kwm: 191,
    rpm1500_standby_kwe: 191, rpm1500_prime_kwe: 173,
    rpm1800_standby_kwm: 234, rpm1800_prime_kwm: 213,
    rpm1800_standby_kwe: 209, rpm1800_prime_kwe: 190,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DX08",
    model: "DP086CB",
    displacement: 7.527,
    cylinders: "L6",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 225, rpm1500_prime_kwm: 205,
    rpm1500_standby_kwe: 205, rpm1500_prime_kwe: 186,
    rpm1800_standby_kwm: 260, rpm1800_prime_kwm: 236,
    rpm1800_standby_kwe: 234, rpm1800_prime_kwe: 211,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DX08",
    model: "DP086CC",
    displacement: 7.527,
    cylinders: "L6",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 245, rpm1500_prime_kwm: 223,
    rpm1500_standby_kwe: 224, rpm1500_prime_kwe: 203,
    rpm1800_standby_kwm: 285, rpm1800_prime_kwm: 259,
    rpm1800_standby_kwe: 257, rpm1800_prime_kwe: 233,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DX08",
    model: "DP086CD",
    displacement: 7.527,
    cylinders: "L6",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 270, rpm1500_prime_kwm: 245,
    rpm1500_standby_kwe: 247, rpm1500_prime_kwe: 224,
    rpm1800_standby_kwm: 310, rpm1800_prime_kwm: 282,
    rpm1800_standby_kwe: 280, rpm1800_prime_kwe: 254,
    emissions: "Unregulated",
    notes: "SAE #1M flywheel"
  },
  {
    series: "DX08",
    model: "DP086CE",
    displacement: 7.527,
    cylinders: "L6",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 294, rpm1500_prime_kwm: 267,
    rpm1500_standby_kwe: 269, rpm1500_prime_kwe: 244,
    rpm1800_standby_kwm: 335, rpm1800_prime_kwm: 305,
    rpm1800_standby_kwe: 304, rpm1800_prime_kwe: 276,
    emissions: "Unregulated",
    notes: ""
  },

  // ============================================================
  // DE08  —  8.071L L6 TI  (mechanical governor / electronic speed governor)
  // P086TI-1 / P086TI: 164 199 149 177 148 180 134 164 | 191 223 174 203 170 200 154 181
  // DP086LA: 224 204 204 185 | 253 230 228 206
  {
    series: "DE08",
    model: "P086TI-1",
    displacement: 8.071,
    cylinders: "L6",
    config: "Turbocharged Intercooled (TI), Mechanical/Electronic Governor",
    rpm1500_standby_kwm: 164, rpm1500_prime_kwm: 149,
    rpm1500_standby_kwe: 148, rpm1500_prime_kwe: 134,
    rpm1800_standby_kwm: 191, rpm1800_prime_kwm: 174,
    rpm1800_standby_kwe: 170, rpm1800_prime_kwe: 154,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DE08",
    model: "P086TI",
    displacement: 8.071,
    cylinders: "L6",
    config: "Turbocharged Intercooled (TI), Mechanical/Electronic Governor",
    rpm1500_standby_kwm: 199, rpm1500_prime_kwm: 177,
    rpm1500_standby_kwe: 180, rpm1500_prime_kwe: 164,
    rpm1800_standby_kwm: 223, rpm1800_prime_kwm: 203,
    rpm1800_standby_kwe: 200, rpm1800_prime_kwe: 181,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DE08",
    model: "DP086LA",
    displacement: 8.071,
    cylinders: "L6",
    config: "Turbocharged Intercooled (TI), Electronic Governor",
    rpm1500_standby_kwm: 224, rpm1500_prime_kwm: 204,
    rpm1500_standby_kwe: 204, rpm1500_prime_kwe: 185,
    rpm1800_standby_kwm: 253, rpm1800_prime_kwm: 230,
    rpm1800_standby_kwe: 228, rpm1800_prime_kwe: 206,
    emissions: "Unregulated",
    notes: ""
  },

  // ============================================================
  // DX12(M)  —  11.051L L6 TI
  // DP126LB: 362 327 334 301 | 402 366 368 334
  {
    series: "DX12 (M)",
    model: "DP126LB",
    displacement: 11.051,
    cylinders: "L6",
    config: "Turbocharged Intercooled (TI)",
    rpm1500_standby_kwm: 362, rpm1500_prime_kwm: 327,
    rpm1500_standby_kwe: 334, rpm1500_prime_kwe: 301,
    rpm1800_standby_kwm: 402, rpm1800_prime_kwm: 366,
    rpm1800_standby_kwe: 368, rpm1800_prime_kwe: 334,
    emissions: "Unregulated",
    notes: ""
  },

  // ============================================================
  // DX12  —  11.051L L6 TI Common Rail ECU
  // Row has 3 models: DP126CA / DP126CB / DP126CD
  // Powers: 321 362 414 | 292 329 376 | 288 326 375 | 260 295 339  (1500 SB kWm / 1500 PR kWm / 1500 SB kWe / 1500 PR kWe)
  //       : 375 402 458 | 341 365 416 | 331 356 409 | 299 321 369  (1800 SB kWm / 1800 PR kWm / 1800 SB kWe / 1800 PR kWe)
  {
    series: "DX12",
    model: "DP126CA",
    displacement: 11.051,
    cylinders: "L6",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 321, rpm1500_prime_kwm: 292,
    rpm1500_standby_kwe: 288, rpm1500_prime_kwe: 260,
    rpm1800_standby_kwm: 375, rpm1800_prime_kwm: 341,
    rpm1800_standby_kwe: 331, rpm1800_prime_kwe: 299,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DX12",
    model: "DP126CB",
    displacement: 11.051,
    cylinders: "L6",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 362, rpm1500_prime_kwm: 329,
    rpm1500_standby_kwe: 326, rpm1500_prime_kwe: 295,
    rpm1800_standby_kwm: 402, rpm1800_prime_kwm: 365,
    rpm1800_standby_kwe: 356, rpm1800_prime_kwe: 321,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DX12",
    model: "DP126CD",
    displacement: 11.051,
    cylinders: "L6",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 414, rpm1500_prime_kwm: 376,
    rpm1500_standby_kwe: 375, rpm1500_prime_kwe: 339,
    rpm1800_standby_kwm: 458, rpm1800_prime_kwm: 416,
    rpm1800_standby_kwe: 409, rpm1800_prime_kwe: 369,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DX12",
    model: "DP126CE",
    displacement: 11.051,
    cylinders: "L6",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 441, rpm1500_prime_kwm: 401,
    rpm1500_standby_kwe: 400, rpm1500_prime_kwe: 363,
    rpm1800_standby_kwm: 502, rpm1800_prime_kwm: 449,
    rpm1800_standby_kwe: 450, rpm1800_prime_kwe: 400,
    emissions: "Unregulated",
    notes: ""
  },

  // ============================================================
  // DV15  —  14.618L V8 TI  (mechanical / electronic governor)
  // 3 models: P158LE / DP158LC / DP158LD
  // Powers: 414 449 510 | 363 408 464 | 374 407 466 | 326 368 423
  //       : 458 513 556 | 402 466 505 | 408 460 501 | 355 415 453
  {
    series: "DV15",
    model: "P158LE",
    displacement: 14.618,
    cylinders: "V8",
    config: "Turbocharged Intercooled (TI), Mechanical Governor",
    rpm1500_standby_kwm: 414, rpm1500_prime_kwm: 363,
    rpm1500_standby_kwe: 374, rpm1500_prime_kwe: 326,
    rpm1800_standby_kwm: 458, rpm1800_prime_kwm: 402,
    rpm1800_standby_kwe: 408, rpm1800_prime_kwe: 355,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DV15",
    model: "DP158LC",
    displacement: 14.618,
    cylinders: "V8",
    config: "Turbocharged Intercooled (TI), Electronic Governor",
    rpm1500_standby_kwm: 449, rpm1500_prime_kwm: 408,
    rpm1500_standby_kwe: 407, rpm1500_prime_kwe: 368,
    rpm1800_standby_kwm: 513, rpm1800_prime_kwm: 466,
    rpm1800_standby_kwe: 460, rpm1800_prime_kwe: 415,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DV15",
    model: "DP158LD",
    displacement: 14.618,
    cylinders: "V8",
    config: "Turbocharged Intercooled (TI), Electronic Governor",
    rpm1500_standby_kwm: 510, rpm1500_prime_kwm: 464,
    rpm1500_standby_kwe: 466, rpm1500_prime_kwe: 423,
    rpm1800_standby_kwm: 556, rpm1800_prime_kwm: 505,
    rpm1800_standby_kwe: 501, rpm1800_prime_kwe: 453,
    emissions: "Unregulated",
    notes: ""
  },

  // ============================================================
  // DX15  —  15.133L V8 TI Common Rail ECU
  // 3 models: DP158CC / DP158CD-1 / DP158CD
  // Powers: 542 580 612 | 493 527 556 | 496 532 562 | 450 482 509
  //       : 618 662 562 | 609 -- -- | 558 600 -- | 506 550 --
  // NOTE: DP158CD 1800rpm data is "--" (not available)
  {
    series: "DX15",
    model: "DP158CC",
    displacement: 15.133,
    cylinders: "V8",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 542, rpm1500_prime_kwm: 493,
    rpm1500_standby_kwe: 496, rpm1500_prime_kwe: 450,
    rpm1800_standby_kwm: 618, rpm1800_prime_kwm: 609,
    rpm1800_standby_kwe: 558, rpm1800_prime_kwe: 506,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DX15",
    model: "DP158CD-1",
    displacement: 15.133,
    cylinders: "V8",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 580, rpm1500_prime_kwm: 527,
    rpm1500_standby_kwe: 532, rpm1500_prime_kwe: 482,
    rpm1800_standby_kwm: 662, rpm1800_prime_kwm: null,
    rpm1800_standby_kwe: 600, rpm1800_prime_kwe: 550,
    emissions: "Unregulated",
    notes: "1800rpm prime kWm not listed"
  },
  {
    series: "DX15",
    model: "DP158CD",
    displacement: 15.133,
    cylinders: "V8",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 612, rpm1500_prime_kwm: 556,
    rpm1500_standby_kwe: 562, rpm1500_prime_kwe: 509,
    rpm1800_standby_kwm: null, rpm1800_prime_kwm: null,
    rpm1800_standby_kwe: null, rpm1800_prime_kwe: null,
    emissions: "Unregulated",
    notes: "1800rpm data not available (--)"
  },

  // ============================================================
  // DV22  —  21.927L V12 TI  (mechanical / electronic governor)
  // 3 models: DP222LA / DP222LB / DP222LC
  // Powers: 664 723 604 | 657 -- 606 | 662 -- -- | 599 --  (1500 SB/PR kWm, 1500 SB/PR kWe - some partial)
  // Actually from PDF: 664 723 | 604 657 | -- 606 | 662 | 549 599
  //   1800: 737 782 828 | 670 711 753 | 661 703 747 | 597 636 676
  // Let me re-parse carefully:
  // Row text: 664 723 604 657 -- 606 662 549 599 | 737 782 828 670 711 753 661 703 747 597 636 676
  // Pattern: SB_kWm(3 models) PR_kWm(3 models) SB_kWe(3 models) PR_kWe(3 models)
  // 1500: SB_kWm: 664, 723, -- | PR_kWm: 604, 657, -- | SB_kWe: 606, 662, -- | PR_kWe: 549, 599, --
  //   Wait, that's only 2 valid values for some. Let me re-read:
  // "664 723 604 657 -- 606 662 549 599"  -> 9 values for 3 models
  //   Model1: 664, 604, 662(?), 549 - no...
  // Better grouping by 3: SB_kWm[664,723,?] PR_kWm[604,657,?] -> but "-- 606" is ambiguous
  // From PDF: DP222LA=664, DP222LB=723, DP222LC=604 (1500 SB kWm)
  //           DP222LA=657, DP222LB=--, DP222LC=606 (1500 PR kWm)  -- DP222LB has no prime data?
  //           DP222LA=662, DP222LB=?  -- incomplete
  // Actually re-reading: "664 723 604 657 -- 606 662 549 599"
  //   More likely: [SB_kWm: 664, 723] [PR_kWm: 604, 657] [SB_kWe: --, 606, 662] [PR_kWe: 549, 599]
  //   OR the "--" is DP222LB 1500 PR kWm
  // I'll go with 2 clear models for 1500rpm where "--" = N/A for DP222LB
  {
    series: "DV22",
    model: "DP222LA",
    displacement: 21.927,
    cylinders: "V12",
    config: "Turbocharged Intercooled (TI), Mechanical/Electronic Governor",
    rpm1500_standby_kwm: 664, rpm1500_prime_kwm: 604,
    rpm1500_standby_kwe: null, rpm1500_prime_kwe: null,
    rpm1800_standby_kwm: 737, rpm1800_prime_kwm: 670,
    rpm1800_standby_kwe: 661, rpm1800_prime_kwe: 597,
    emissions: "Unregulated",
    notes: "1500rpm kWe not clearly separated in source"
  },
  {
    series: "DV22",
    model: "DP222LB",
    displacement: 21.927,
    cylinders: "V12",
    config: "Turbocharged Intercooled (TI), Mechanical/Electronic Governor",
    rpm1500_standby_kwm: 723, rpm1500_prime_kwm: 657,
    rpm1500_standby_kwe: null, rpm1500_prime_kwe: null,
    rpm1800_standby_kwm: 782, rpm1800_prime_kwm: 711,
    rpm1800_standby_kwe: 703, rpm1800_prime_kwe: 636,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DV22",
    model: "DP222LC",
    displacement: 21.927,
    cylinders: "V12",
    config: "Turbocharged Intercooled (TI), Electronic Governor",
    rpm1500_standby_kwm: null, rpm1500_prime_kwm: 606,
    rpm1500_standby_kwe: 662, rpm1500_prime_kwe: 599,
    rpm1800_standby_kwm: 828, rpm1800_prime_kwm: 753,
    rpm1800_standby_kwe: 747, rpm1800_prime_kwe: 676,
    emissions: "Unregulated",
    notes: "1500rpm standby kWm listed as '--' in source"
  },

  // ============================================================
  // DX22  —  21.927L V12 TI Common Rail ECU
  // DP222CA / DP222CB: 727 790 663 705 667 727 608 646 | 836 890 762 810 755 806 685 730
  // DP222CC: 875 790 807 727 | 995 900 905 816
  {
    series: "DX22",
    model: "DP222CA",
    displacement: 21.927,
    cylinders: "V12",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 727, rpm1500_prime_kwm: 663,
    rpm1500_standby_kwe: 667, rpm1500_prime_kwe: 608,
    rpm1800_standby_kwm: 836, rpm1800_prime_kwm: 762,
    rpm1800_standby_kwe: 755, rpm1800_prime_kwe: 685,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DX22",
    model: "DP222CB",
    displacement: 21.927,
    cylinders: "V12",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 790, rpm1500_prime_kwm: 705,
    rpm1500_standby_kwe: 727, rpm1500_prime_kwe: 646,
    rpm1800_standby_kwm: 890, rpm1800_prime_kwm: 810,
    rpm1800_standby_kwe: 806, rpm1800_prime_kwe: 730,
    emissions: "Unregulated",
    notes: ""
  },
  {
    series: "DX22",
    model: "DP222CC",
    displacement: 21.927,
    cylinders: "V12",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 875, rpm1500_prime_kwm: 790,
    rpm1500_standby_kwe: 807, rpm1500_prime_kwe: 727,
    rpm1800_standby_kwm: 995, rpm1800_prime_kwm: 900,
    rpm1800_standby_kwe: 905, rpm1800_prime_kwe: 816,
    emissions: "Unregulated",
    notes: ""
  },

  // ============================================================
  // DX37  —  36.900L V12 TI Common Rail ECU
  // DP372CA / DP372CB / DP372CC: 1110 1240 980 1009 1127 891 1024 1146 901 1040 817 928
  //   1500: SB_kWm[1110,1240,?] PR_kWm[980,1009,?] SB_kWe[1127,891] PR_kWe[1024,1146,901,1040]... unclear
  // Let me re-read PDF row: "1110 1240 980 1009 1127 891 1024 1146 901 1040 817 928"
  //   -> 12 values for 3 models x 4 columns (1500 SB_kWm, 1500 PR_kWm, 1500 SB_kWe, 1500 PR_kWe)
  //   CA: 1110, 980, 1024(SBkWe?), 817(PRkWe?)  -- but 1127 and 891 are in between...
  // More likely layout: SB_kWm: 1110, 1240, [missing?] | PR_kWm: 980, 1009, 1127 | ...
  // Actually the PDF text likely interleaves: for 3 models, each has SB_kWm then PR_kWm
  //   -> 1110(CA SB), 1240(CB SB), [CC SB?] 980(CA PR), 1009(CB PR), 1127(CC PR)...
  // From 1800rpm row: "1120 1320 1420 1018 1200 1291 1016 1205 1300 1092 1178 920"
  //   -> 1800 SB_kWm: 1120, 1320, 1420 | 1800 PR_kWm: 1018, 1200, 1291 | 1800 SB_kWe: 1016, 1205, 1300 | 1800 PR_kWe: 1092(?no...)
  //   Actually: 1120(CA),1320(CB),1420(CC) = SB_kWm | 1018(CA),1200(CB),1291(CC) = PR_kWm
  //            | 1016(CA),1205(CB),1300(CC) = SB_kWe | 1092(?no, wait that's too high...)
  //   Hmm, 920 is last, maybe: 1092(CA),1178(CB),920(CC)... but 920 < 1016 which is SB_kWe
  // Let me recount from the 1500rpm values: 12 values / 3 models = 4 values each
  //   CA: 1110, 980, 1024, 817?  No...
  // The PDF row for DX37:
  // "1110 1240 980 1009 1127 891 1024 1146 901 1040 817 928"
  // => I think these are: SB_kWm_CA=1110, SB_kWm_CB=1240, PR_kWm_CA=980, PR_kWm_CB=1009, PR_kWm_CC=1127
  //    SB_kWe_CA=891(?), SB_kWe_CB=1024, ...this is getting complex
  // The most logical reading for a 3-model block (mirroring DX12 / DX22 structure):
  //   1500 SB_kWm: CA=1110, CB=1240, CC=?    <- only 2 visible before next group
  //   1500 PR_kWm: CA=980, CB=1009, CC=1127
  //   1500 SB_kWe: CA=891, CB=1024, CC=1146
  //   1500 PR_kWe: CA=901(?no, that's after 1146)...
  // Re-reading: "1110 1240 980 1009 1127 891 1024 1146 901 1040 817 928"
  // Count: 1110(1) 1240(2) 980(3) 1009(4) 1127(5) 891(6) 1024(7) 1146(8) 901(9) 1040(10) 817(11) 928(12)
  // For 3 models with 4 power columns each = 12 ✓
  // Reading as groups of 3 (one per model per column):
  //   SB_kWm: 1110, 1240, 980  <- but 980 seems too low for SB vs 1110
  // OR reading as pairs (model interleaved):
  //   CA: 1110, 1009, 1127, 1146, 901(???)  -- doesn't work
  // Most likely (matching DX22 pattern where pairs = SB then PR per model):
  //   CA: SB=1110, PR=980  |  CB: SB=1240, PR=1009  |  CC: SB=?, PR=1127
  //   Then kWe:  CA: SB=891(?), PR=?  ...
  // I'll go with the most logical column-first reading:
  //   [1500 SBkWm]: 1110(CA), 1240(CB), 980(CC -- seems low but possible as lower variant)
  //   WAIT: but the 1800 row clearly shows 3 ascending values: 1120, 1320, 1420 which makes CA<CB<CC sense
  //   So 1500 SBkWm should also be ascending. 980 can't be CC if 1240>1110.
  // Let me try: the 12 values split as 3+3+3+3:
  //   [SBkWm]: 1110, 1240, [SB CC missing or = value from another group]
  //   Actually I suspect CC 1500 SB kWm is just not in those first positions...
  // FINAL INTERPRETATION (column-major, 3 models):
  //   SB_kWm: 1110(CA), 1240(CB), 980(CC?)  <- CC is lower power variant? Unlikely.
  // OR perhaps it's NOT 3 models on the 1500rpm line - the PDF may show:
  //   CA and CB on main row, CC may have different/limited 1500rpm data
  //
  // Looking at 1800rpm: 1120 1320 1420 | 1018 1200 1291 | 1016 1205 1300 | 1092 1178 920(?)
  //   Wait: 920 < 1016... so last group can't be kWe. Let me count: 12 values:
  //   SB_kWm[1120,1320,1420] PR_kWm[1018,1200,1291] SB_kWe[1016,1205,1300] PR_kWe[1092,1178,920]
  //   But 920 PR_kWe with 1300 SB_kWe doesn't make sense (PR<SB but 920 << 1016)
  //   Unless last 3 are something else... Actually for DX37 DP372CD/CE on next row:
  //   "1350 1440 1227 1309 1250 1335 1134 1212 -- -- -- -- 80/-- 85/-- 195/-- 205/-- 533/-- 540/-- 208/-- 299/--"
  //   So the 1800rpm values for CD/CE are partial (-- for some)
  //
  // I'll go with the clean 3-model reading for the main DX37 row:
  // 1500rpm: [SBkWm: 1110, 1240, ?] [PRkWm: 980, 1009, 1127] [SBkWe: 891(?), 1024, 1146] [PRkWe: 901(?), 1040, ?]
  // This is ambiguous. I'll present the raw numbers and note the uncertainty.

  {
    series: "DX37",
    model: "DP372CA",
    displacement: 36.900,
    cylinders: "V12",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 1110, rpm1500_prime_kwm: 980,
    rpm1500_standby_kwe: 1024, rpm1500_prime_kwe: 817,
    rpm1800_standby_kwm: 1120, rpm1800_prime_kwm: 1018,
    rpm1800_standby_kwe: 1016, rpm1800_prime_kwe: null,
    emissions: "Unregulated",
    notes: "See raw values note"
  },
  {
    series: "DX37",
    model: "DP372CB",
    displacement: 36.900,
    cylinders: "V12",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 1240, rpm1500_prime_kwm: 1009,
    rpm1500_standby_kwe: 1127, rpm1500_prime_kwe: 928,
    rpm1800_standby_kwm: 1320, rpm1800_prime_kwm: 1200,
    rpm1800_standby_kwe: 1205, rpm1800_prime_kwe: null,
    emissions: "Unregulated",
    notes: "See raw values note"
  },
  {
    series: "DX37",
    model: "DP372CC",
    displacement: 36.900,
    cylinders: "V12",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: null, rpm1500_prime_kwm: 1127,
    rpm1500_standby_kwe: 891, rpm1500_prime_kwe: null,
    rpm1800_standby_kwm: 1420, rpm1800_prime_kwm: 1291,
    rpm1800_standby_kwe: 1300, rpm1800_prime_kwe: null,
    emissions: "Unregulated",
    notes: "Some 1500rpm values unclear from layout"
  },
  {
    series: "DX37",
    model: "DP372CD",
    displacement: 36.900,
    cylinders: "V12",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 1350, rpm1500_prime_kwm: 1227,
    rpm1500_standby_kwe: 1250, rpm1500_prime_kwe: 1134,
    rpm1800_standby_kwm: null, rpm1800_prime_kwm: null,
    rpm1800_standby_kwe: null, rpm1800_prime_kwe: null,
    emissions: "Unregulated",
    notes: "1800rpm data listed as '--'"
  },
  {
    series: "DX37",
    model: "DP372CE",
    displacement: 36.900,
    cylinders: "V12",
    config: "Turbocharged Intercooled (TI), Common Rail ECU",
    rpm1500_standby_kwm: 1440, rpm1500_prime_kwm: 1309,
    rpm1500_standby_kwe: 1335, rpm1500_prime_kwe: 1212,
    rpm1800_standby_kwm: null, rpm1800_prime_kwm: null,
    rpm1800_standby_kwe: null, rpm1800_prime_kwe: null,
    emissions: "Unregulated",
    notes: "1800rpm data listed as '--'"
  },
];

// Print as a clean table
console.log("=".repeat(140));
console.log(
  "Series".padEnd(12),
  "Model".padEnd(14),
  "Disp(L)".padEnd(9),
  "Cyl".padEnd(5),
  "1500_SB_kWm".padEnd(13),
  "1500_PR_kWm".padEnd(13),
  "1500_SB_kWe".padEnd(13),
  "1500_PR_kWe".padEnd(13),
  "1800_SB_kWm".padEnd(13),
  "1800_PR_kWm".padEnd(13),
  "1800_SB_kWe".padEnd(13),
  "1800_PR_kWe".padEnd(13),
  "Emissions"
);
console.log("-".repeat(140));

for (const e of engines) {
  const f = v => (v === null ? "N/A" : String(v)).padEnd(13);
  console.log(
    e.series.padEnd(12),
    e.model.padEnd(14),
    String(e.displacement).padEnd(9),
    e.cylinders.padEnd(5),
    f(e.rpm1500_standby_kwm),
    f(e.rpm1500_prime_kwm),
    f(e.rpm1500_standby_kwe),
    f(e.rpm1500_prime_kwe),
    f(e.rpm1800_standby_kwm),
    f(e.rpm1800_prime_kwm),
    f(e.rpm1800_standby_kwe),
    f(e.rpm1800_prime_kwe),
    e.emissions
  );
}

console.log("\n\n=== NOTES / ANOMALIES ===");
for (const e of engines) {
  if (e.notes) console.log(`  ${e.model}: ${e.notes}`);
}

console.log("\n\n=== RAW DX37 VALUES FROM PDF (for manual verification) ===");
console.log("DX37 main row (CA/CB/CC) 1500rpm block: 1110 1240 980 1009 1127 891 1024 1146 901 1040 817 928");
console.log("DX37 main row (CA/CB/CC) 1800rpm block: 1120 1320 1420 1018 1200 1291 1016 1205 1300 1092 1178 920");
console.log("DX37 CD/CE row 1500rpm block: 1350 1440 1227 1309 1250 1335 1134 1212");
console.log("DX37 CD/CE row 1800rpm block: -- (all dashes)");
