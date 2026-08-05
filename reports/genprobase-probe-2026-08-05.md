# GenProBase Probe

Date: 2026-08-05

Source probed: https://www.genprobase.com/

## Public Surface

- `https://www.genprobase.com/` serves a Chinese diesel-engine selector app: `发电机组专业资源大本营 - 柴油发动机选型`.
- `robots.txt` and `sitemap.xml` returned 404.
- Public data endpoint found in `static/js/api.js`:
  - `GET /api/products?all=1&page=1&pageSize=10000`
- `GET /api/export-products` requires login.

## Source Data Summary

- Public product rows pulled: `1,314`
- Unique normalized brand/model pairs: `990`
- Brands exposed by source:
  - Cummins / 康明斯: `397` rows
  - Baudouin / 博杜安: `267` rows
  - SDEC / 上柴: `249` rows
  - Perkins / 珀金斯: `217` rows
  - Volvo / 沃尔沃: `87` rows
  - Scania / 斯堪尼亚: `67` rows
  - Shanghai MHI / 上海菱重: `16` rows
  - FPT / 菲亚特: `14` rows

## Comparison Against Haifeng Database

- Haifeng live engine rows checked: `3,095`
- Exact normalized brand/model matches already present: `735`
- Likely missing brand/model pairs: `255`

Likely missing by brand:

| Brand | Likely missing models |
| --- | ---: |
| Baudouin | 102 |
| Cummins | 95 |
| Perkins | 47 |
| FPT | 6 |
| Mitsubishi | 2 |
| SDEC | 2 |
| Scania | 1 |

## Source Integrity Checks

- Missing brand/model/frequency/speed/displacement/cylinders/emission: `0`
- Missing `standby_kwe`: `2 / 1,314`
- Missing `prime_kwe`: `15 / 1,314`
- Exact duplicate row keys: `8`
- Bad numeric or negative-range flags: `0`

Interpretation: GenProBase is good as a discovery source, but it is not an OEM source. Do not import directly without OEM or official distributor cross-validation.

## Candidate Sample For Cross-Validation

| Brand | Model | Source rows | Frequency | Emission | Standby kWe | Displacement L | Cylinders |
| --- | --- | ---: | --- | --- | ---: | ---: | --- |
| Baudouin | 4M06G2D0/S | 2 | 50Hz, 60Hz | none listed | 16-20 | 2.3 | 4L |
| Baudouin | 4M08G1D4/5 | 1 | 50Hz | CN IV | 16 | 3.17 | 4L |
| Baudouin | 4M08G2D3/6 | 1 | 60Hz | EU SIIIA | 16 | 3.17 | 4L |
| Baudouin | 4M06G4D0/S | 2 | 50Hz, 60Hz | none listed | 20-25 | 2.3 | 4L |
| Baudouin | 4M06G6D0/S | 2 | 50Hz, 60Hz | none listed | 28-33 | 2.3 | 4L |
| Cummins | B3.9CS4GT3 | 1 | 50Hz | CN IV | 33 | 3.9 | 4L |
| Cummins | 4BTAA3.3G14 | 1 | 50Hz | EU SIIIA | 53 | 3.3 | 4L |
| Cummins | QSB5G1 | 2 | 50Hz, 60Hz | EPA T3 / EU SIIIA / CN III | 56-60 | 4.5 | 4L |
| Cummins | QSB5G10 | 2 | 50Hz, 60Hz | EPA T4F / EU SIIIA | 63-73 | 4.5 | 4L |
| Perkins | 403A11G1 | 1 | 50Hz | none listed | 8 | 1.1 | 3L |
| Perkins | 403F15G | 1 | 60Hz | EPA T4F | 12 | 1.5 | 3L |
| Perkins | 404A22G1 | 1 | 50Hz | none listed | 18 | 2.2 | 4L |
| Perkins | 1103D33G3 | 1 | 50Hz | EU SIIIA | 28 | 3.3 | 3L |
| FPT | F2CE0685A*D | 4 | 50Hz, 60Hz | none listed | 176-242 | 8.7 | L6 |
| FPT | F3HC0685C*D | 2 | 50Hz, 60Hz | none listed | 440 | 10.3 | L6 |
| Mitsubishi | S12R-PTAR1-C | 1 | 50Hz | none listed | 1200 | 49.03 | 12V |
| Mitsubishi | S16R2-A2PTAW-C | 1 | 50Hz | CN III | 2000 | 79.9 | 16V |
| SDEC | SC25G610D2 | 1 | 50Hz | CN II | 400 | 25.8 | V12 |
| SDEC | SC25G690D2 | 1 | 50Hz | CN II | 450 | 25.8 | V12 |
| Scania | DC13 507A 625 | 2 | 50Hz, 60Hz | none listed | 528 | 12.7 | 6L |

## Haifeng Integrity Validation

- `npm run test:database`
  - Passed: `3095 engines`, `149 alternators`, `3891 PDF links`, `75 engine brands`.
- `DATA_QA_FAIL_ON=high npm run data:qa`
  - Passed: `0 issues across 3095 engines and 149 alternators`.
