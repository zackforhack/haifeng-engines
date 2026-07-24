# EPA Nonroad CI 1800 RPM Engine Coverage

Source workbook: `nonroad-compression-ignition-2011-present (1).xlsx`

## Method

- Kept only `Model Info` rows where `Rated Speed (RPM)` is exactly 1800.
- Joined manufacturer, certificate, tier, compliance standard and fuel from `Family Info` using model year and engine family.
- Deduplicated recurring annual certifications by EPA manufacturer plus normalized engine model.
- Counted a database model as present only when its normalized model and verified manufacturer-to-brand mapping both matched.
- Exact model matches under another brand and similar suffix variants remain review items.

## Summary

- 1800 RPM source rows: **15,773**
- Distinct EPA manufacturer/model combinations: **970**
- Exact manufacturer/brand matches: **68**
- Exact matches whose database page uses 1800 as its primary RPM: **10**
- Exact model under another database brand: **9**
- Not found by exact model: **893**
- Models from mapped manufacturers: **834**
- Exact coverage within mapped manufacturers: **8.2%**
- Unmatched models with a 2024+ certification: **474**
- Models with at least one constant-speed certification: **716**
- Variable-speed-only models retained for reference: **230**
- Generator-priority review queue (2024+, mapped brand, constant speed): **335**

The primary RPM field does not prove that a page lacks 60 Hz ratings; many catalog pages use 1500 RPM as the primary value while storing separate 60 Hz fields. Those pages need a second rating-level comparison before any RPM correction.

## Manufacturer Mapping Notes

- `Discovery Energy, LLC.` is compared with the existing `Kohler` brand. Rehlko's official [engine warranty page](https://www.engines.rehlko.com/warranty) identifies Discovery Energy as the responsible company and states that Kohler Engines is now Rehlko.
- `HD Construction Equipment Co., Ltd.` is compared with the existing `Hyundai` brand. Its [official network page](https://www.hd-ce.com/en/network) lists the current company and its engine production and R&D operations.

## Generator-Priority Gaps by Brand

| Database brand | 2024+ constant-speed models without exact match |
|---|---:|
| Liebherr | 53 |
| MTU | 53 |
| Cummins | 41 |
| Perkins | 27 |
| FPT | 24 |
| Yanmar | 20 |
| Kubota | 19 |
| Caterpillar | 17 |
| Mitsubishi | 16 |
| Isuzu | 11 |
| Deutz | 10 |
| Baudouin | 9 |
| Kohler | 9 |
| Hyundai | 8 |
| John Deere | 8 |
| Kirloskar | 6 |
| Weichai | 3 |
| Volvo Penta | 1 |

## Manufacturer Coverage

| EPA manufacturer | Database brand | EPA models | Exact matches | Other-brand exact | Not found | Probable aliases |
|---|---|---:|---:|---:|---:|---:|
| Rolls-Royce Solutions America Inc | MTU | 155 | 0 | 0 | 155 | 29 |
| Cummins Inc. | Cummins | 80 | 14 | 0 | 66 | 19 |
| Perkins Engines Co Ltd | Perkins | 79 | 6 | 6 | 67 | 8 |
| FPT Industrial S.p.A. | FPT | 68 | 0 | 0 | 68 | 0 |
| IHI Agri-Tech Corporation | Unmapped | 58 | 0 | 3 | 55 | 0 |
| Liebherr Machines Bulle SA | Liebherr | 56 | 0 | 0 | 56 | 2 |
| Discovery Energy, LLC. | Kohler | 48 | 0 | 0 | 48 | 10 |
| Yanmar Power Technology Co., Ltd. | Yanmar | 42 | 0 | 0 | 42 | 4 |
| Kubota Corporation | Kubota | 37 | 0 | 0 | 37 | 0 |
| Caterpillar Inc. | Caterpillar | 35 | 14 | 0 | 21 | 1 |
| Motorenfabrik Hatz GmbH & Co. KG | Hatz | 29 | 11 | 0 | 18 | 1 |
| AB Volvo Penta | Volvo Penta | 28 | 21 | 0 | 7 | 7 |
| Deutz AG | Deutz | 28 | 0 | 0 | 28 | 0 |
| HD Construction Equipment Co., Ltd. | Hyundai | 26 | 0 | 0 | 26 | 0 |
| Isuzu Motors Limited | Isuzu | 24 | 0 | 0 | 24 | 0 |
| Daedong Corporation | Unmapped | 19 | 0 | 0 | 19 | 0 |
| Deere & Company | John Deere | 19 | 0 | 0 | 19 | 5 |
| Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | Mitsubishi | 19 | 0 | 0 | 19 | 6 |
| Scania CV AB | Scania | 11 | 0 | 0 | 11 | 0 |
| Komatsu Ltd. | Komatsu | 10 | 0 | 0 | 10 | 1 |
| Mercedes Benz | Unmapped | 10 | 0 | 0 | 10 | 0 |
| KUKJE MACHINERY CO., LTD | Unmapped | 9 | 0 | 0 | 9 | 0 |
| Societe Internationale des Moteurs-Baudouin | Baudouin | 9 | 0 | 0 | 9 | 0 |
| Lister Petter Limited | Lister Petter | 7 | 0 | 0 | 7 | 0 |
| Kirloskar Americas Corporation | Kirloskar | 6 | 0 | 0 | 6 | 0 |
| Shandong Huayuan Laidong Engine Co.,LTD. | Unmapped | 6 | 0 | 0 | 6 | 0 |
| Tianjin Lovol Engines Co., Ltd. | Lovol | 6 | 0 | 0 | 6 | 0 |
| International Motors, LLC | Unmapped | 5 | 0 | 0 | 5 | 0 |
| TYM Corporation | Unmapped | 5 | 0 | 0 | 5 | 0 |
| Daimler Truck AG | Unmapped | 4 | 0 | 0 | 4 | 0 |
| Lion (China) Engine Science and Technology Co.,Ltd. | Unmapped | 4 | 0 | 0 | 4 | 0 |
| Yangdong Co., Ltd. | Unmapped | 4 | 0 | 0 | 4 | 0 |
| MAN Truck & Bus AG | MAN | 3 | 1 | 0 | 2 | 0 |
| Suzhou Jinding Machinery Manufacturing Co., Ltd. | Unmapped | 3 | 0 | 0 | 3 | 0 |
| Volvo Construction Equipment | Unmapped | 3 | 0 | 0 | 3 | 0 |
| Weichai Power Co.,Ltd. | Weichai | 3 | 0 | 0 | 3 | 0 |
| Zhejiang Xinchai Co., Ltd. | Xinchai | 3 | 1 | 0 | 2 | 2 |
| Detroit Diesel Corporation | Detroit Diesel | 2 | 0 | 0 | 2 | 1 |
| PSA Peugeot Citroen | Unmapped | 2 | 0 | 0 | 2 | 0 |
| Wuxi Kipor Power Co., Ltd. | Unmapped | 2 | 0 | 0 | 2 | 0 |
| ENER-G Rudox LLC | Unmapped | 1 | 0 | 0 | 1 | 0 |
| FAW JIEFANG AUTOMOTIVE CO.,LTD,WUXI DIESEL ENGINE WORKS | FAWDE | 1 | 0 | 0 | 1 | 0 |
| Greaves Farymann Diesel GmbH | Unmapped | 1 | 0 | 0 | 1 | 0 |

## Priority Review

These are recent constant-speed EPA-certified models from mapped manufacturers that were not found as exact manufacturer/brand matches. The full records, including variable-speed-only models and candidate aliases, are in `epa-1800rpm-model-match.json`.

| Latest year | Manufacturer | EPA model | Tier | Power kW | Probable database model |
|---:|---|---|---|---:|---|
| 2027 | HD Construction Equipment Co., Ltd. | DM02AP | Tier 3 | 55 |  |
| 2026 | AB Volvo Penta | TWD1683GE-B | Tier 2 | 685 | Volvo Penta TWD1683GE (0.947) |
| 2026 | Caterpillar Inc. | 1506 | Tier 3 | 358 |  |
| 2026 | Caterpillar Inc. | 1706D | Tier 3 | 357 |  |
| 2026 | Caterpillar Inc. | 1706J | Tier 4 (Final or Phase In) | 340 |  |
| 2026 | Caterpillar Inc. | 2206D | Tier 3 | 463 |  |
| 2026 | Caterpillar Inc. | 2206F | Tier 4 (Final or Phase In) | 423 |  |
| 2026 | Caterpillar Inc. | 2406J | Tier 4 (Final or Phase In) | 429 |  |
| 2026 | Caterpillar Inc. | 2506C | Tier 2 | 645 |  |
| 2026 | Caterpillar Inc. | 2506D | Tier 3 | 532 |  |
| 2026 | Caterpillar Inc. | 2806C | Tier 2 | 829 |  |
| 2026 | Caterpillar Inc. | 2806F | Tier 4 (Final or Phase In) | 580 |  |
| 2026 | Caterpillar Inc. | 3512E | Tier 4 (Final or Phase In) | 1864 |  |
| 2026 | Caterpillar Inc. | 3516E | Tier 2 | 3372 |  |
| 2026 | Caterpillar Inc. | 5006C | Tier 2 | 887 |  |
| 2026 | Caterpillar Inc. | 5008C | Tier 2 | 1107 |  |
| 2026 | Caterpillar Inc. | 5012C | Tier 2 | 1677 |  |
| 2026 | Caterpillar Inc. | 5016C | Tier 2 | 2283 |  |
| 2026 | Caterpillar Inc. | C32B | Tier 2, Tier 4 (Final or Phase In) | 1769 |  |
| 2026 | Cummins Inc. | 4BT3.3G4 | Interim Tier 4, Tier 3 | 46 |  |
| 2026 | Cummins Inc. | 4BT3.3G5 | Interim Tier 4, Tier 3 | 51 |  |
| 2026 | Cummins Inc. | 4BTAA3.3G12 | Tier 3 | 74 |  |
| 2026 | Cummins Inc. | 4BTAA3.3G17 | Tier 3 | 65 |  |
| 2026 | Cummins Inc. | 4BTAA3.3G18 | Tier 3 | 53 |  |
| 2026 | Cummins Inc. | 4BTAA3.3G7 | Tier 3 | 74 |  |
| 2026 | Cummins Inc. | KD05L04T-6DDS | Tier 3 | 154 |  |
| 2026 | Cummins Inc. | KD07L06T-6DDS | Tier 3 | 242 |  |
| 2026 | Cummins Inc. | KD09L06T-6DDS | Tier 3 | 346 |  |
| 2026 | Cummins Inc. | QSB4.5 | Tier 3, Tier 4 (Final or Phase In) | 155 |  |
| 2026 | Cummins Inc. | QSB6.7 | Interim Tier 4, Tier 3, Tier 4 (Final or Phase In) | 245 | Cummins QSB6.7-G3 (0.857) |
| 2026 | Cummins Inc. | QSB7-G4 | Tier 3 | 214 |  |
| 2026 | Cummins Inc. | QSK19-C | Tier 2, Tier 3, Tier 4 (Final or Phase In) | 567 |  |
| 2026 | Cummins Inc. | QSK23 | Tier 2, Tier 4 (Final or Phase In) | 962 |  |
| 2026 | Cummins Inc. | QSK23-G7 NR2 | Tier 2 | 910 |  |
| 2026 | Cummins Inc. | QSK38-G | Tier 2 | 1376 | Cummins QSK38-G1 (0.923) |
| 2026 | Cummins Inc. | QSK38-G16 | Tier 2 | 1129 | Cummins QSK38-G1 (0.933) |
| 2026 | Cummins Inc. | QSK38-G17 | Tier 2 | 1399 | Cummins QSK38-G1 (0.933) |
| 2026 | Cummins Inc. | QSK38-G18 | Tier 2 | 1659 | Cummins QSK38-G1 (0.933) |
| 2026 | Cummins Inc. | QSK50 | Interim Tier 4, Tier 4 (Final or Phase In) | 1655 | Cummins QSK50-G2 (0.833) |
| 2026 | Cummins Inc. | QSK50-G | Tier 2 | 1749 | Cummins QSK50-G2 (0.923) |
| 2026 | Cummins Inc. | QSK50-G22 | Tier 2 | 1682 | Cummins QSK50-G2 (0.933) |
| 2026 | Cummins Inc. | QSK50-G23 | Tier 2 | 1947 | Cummins QSK50-G2 (0.933) |
| 2026 | Cummins Inc. | QSK50-G24 | Tier 2 | 2204 | Cummins QSK50-G2 (0.933) |
| 2026 | Cummins Inc. | QSK60 | Interim Tier 4, Tier 4 (Final or Phase In) | 2446 | Cummins QSK60G (0.909) |
| 2026 | Cummins Inc. | QSK78 | Interim Tier 4, Tier 2, Tier 4 (Final or Phase In) | 3312 |  |
| 2026 | Cummins Inc. | QSK78-G | Tier 2 | 3029 |  |
| 2026 | Cummins Inc. | QSK78-G10 | Tier 2 | 2760 |  |
| 2026 | Cummins Inc. | QSK95 | Tier 2 | 3922 |  |
| 2026 | Cummins Inc. | QSL8.9 | Interim Tier 4, Tier 3, Tier 4 (Final or Phase In) | 346 | Cummins QSL8.9-G2 (0.857) |
| 2026 | Cummins Inc. | QST30 | Interim Tier 4, Tier 4 (Final or Phase In) | 1111 |  |
| 2026 | Cummins Inc. | QST30-G | Tier 2 | 1111 |  |
| 2026 | Cummins Inc. | QSX15 | Tier 3, Tier 4 (Final or Phase In) | 563 |  |
| 2026 | Cummins Inc. | QSX15-G | Interim Tier 4, Tier 2, Tier 3 | 563 |  |
| 2026 | Cummins Inc. | S17 | Tier 2 | 1099 |  |
| 2026 | Deere & Company | 3029 | Tier 3, Tier 4 (Final or Phase In) | 55 |  |
| 2026 | Deere & Company | 4039 | Tier 4 (Final or Phase In) | 126 |  |
| 2026 | Deere & Company | 4045 | Interim Tier 4, Tier 3, Tier 4 (Final or Phase In) | 147 |  |
| 2026 | Deere & Company | 6068 | Interim Tier 4, Tier 3, Tier 4 (Final or Phase In) | 248 |  |
| 2026 | Deere & Company | 6090 | Interim Tier 4, Tier 3, Tier 4 (Final or Phase In) | 364 |  |
| 2026 | Deere & Company | 6136 | Tier 4 (Final or Phase In) | 505 |  |
| 2026 | Deere & Company | 6180 | Tier 3 | 710 |  |
| 2026 | Deutz AG | TCD2013L04 2V | Tier 3 | 114 |  |
| 2026 | Deutz AG | TCD2013L06 2V | Tier 3 | 180 |  |
| 2026 | Deutz AG | TCD2013L06 4V | Tier 3 | 260 |  |
| 2026 | Discovery Energy, LLC. | KDI 2504TM/G18 | Tier 2 | 36 |  |
| 2026 | Discovery Energy, LLC. | KDI 3404TCR/70G | Tier 3 | 70 | Kohler KDI3404TCR (0.870) |
| 2026 | Discovery Energy, LLC. | KDI 3404TM/G18 | Tier 3 | 70 |  |
| 2026 | Discovery Energy, LLC. | KDI 3404TM/G18A | Tier 3 | 60 |  |
| 2026 | Discovery Energy, LLC. | KDI 3404TM/G18B | Tier 3 | 50 |  |
| 2026 | Discovery Energy, LLC. | KDI1903ESM | Tier 2, Tier 4 (Final or Phase In) | 21 |  |
| 2026 | Discovery Energy, LLC. | KDI1903M | Tier 4 (Final or Phase In) | 18 |  |
| 2026 | Discovery Energy, LLC. | KDI2504ESM | Tier 2, Tier 4 (Final or Phase In) | 29 |  |
| 2026 | Discovery Energy, LLC. | KSD-NATG 1403/18 | Tier 4 (Final or Phase In) | 17 |  |
| 2026 | FPT Industrial S.p.A. | F2CCA615A*H | Tier 3 | 290 |  |
| 2026 | FPT Industrial S.p.A. | F2CCP615A*H | Tier 3 | 330 |  |
| 2026 | FPT Industrial S.p.A. | F2CE9685A*E | Tier 3 | 290 |  |
| 2026 | FPT Industrial S.p.A. | F2CE9685C*E | Tier 3 | 290 |  |
| 2026 | FPT Industrial S.p.A. | F2CE9685E*E | Tier 3 | 230 |  |
| 2026 | FPT Industrial S.p.A. | F4GE9455A*J | Tier 3 | 69 |  |
| 2026 | FPT Industrial S.p.A. | F4GE9455B*J | Tier 3 | 59 |  |
| 2026 | FPT Industrial S.p.A. | F4GE9485A*J | Tier 3 | 98 |  |
| 2026 | FPT Industrial S.p.A. | F4GE9685A*J | Tier 3 | 148 |  |
| 2026 | FPT Industrial S.p.A. | F4HE0485B*J | Tier 3 | 125 |  |
| 2026 | FPT Industrial S.p.A. | F4HE0485C*J | Tier 3 | 90 |  |
| 2026 | FPT Industrial S.p.A. | F4HE0685A*J | Tier 3 | 220 |  |
| 2026 | FPT Industrial S.p.A. | F4HE0685F*J | Tier 3 | 210 |  |
| 2026 | FPT Industrial S.p.A. | F4HE0685G*J | Tier 3 | 165 |  |
| 2026 | FPT Industrial S.p.A. | F4HE9685A*J | Tier 3 | 208 |  |
| 2026 | FPT Industrial S.p.A. | F4HE9685B*J | Tier 3 | 172 |  |
| 2026 | FPT Industrial S.p.A. | F4HGE415A*V | Tier 4 (Final or Phase In) | 125 |  |
| 2026 | FPT Industrial S.p.A. | F4HGE613Z*V | Tier 4 (Final or Phase In) | 124 |  |
| 2026 | FPT Industrial S.p.A. | F4HGE615C*V | Tier 4 (Final or Phase In) | 175 |  |
| 2026 | FPT Industrial S.p.A. | F4HGE615D*V | Tier 4 (Final or Phase In) | 230 |  |
| 2026 | FPT Industrial S.p.A. | F5HGL415A*X | Tier 4 (Final or Phase In) | 55 |  |
| 2026 | FPT Industrial S.p.A. | F5MGL415A*V | Tier 4 (Final or Phase In) | 105 |  |
| 2026 | FPT Industrial S.p.A. | F5MGL415B*V | Tier 4 (Final or Phase In) | 94 |  |
| 2026 | FPT Industrial S.p.A. | F5MGL415C*V | Tier 4 (Final or Phase In) | 71 |  |
| 2026 | HD Construction Equipment Co., Ltd. | DX05G | Tier 3 | 197 |  |
| 2026 | HD Construction Equipment Co., Ltd. | DX05PG | Tier 4 (Final or Phase In) | 200 |  |
| 2026 | HD Construction Equipment Co., Ltd. | DX08G | Tier 3 | 294 |  |
| 2026 | HD Construction Equipment Co., Ltd. | DX12G | Tier 3 | 441 |  |
| 2026 | HD Construction Equipment Co., Ltd. | DX15G | Tier 2 | 662 |  |
| 2026 | HD Construction Equipment Co., Ltd. | DX15GA | Tier 3 | 560 |  |
| 2026 | HD Construction Equipment Co., Ltd. | DX22 | Tier 2 | 995 |  |
| 2026 | Isuzu Motors Limited | BP-4LE2X | Tier 4 (Final or Phase In) | 49 |  |
| 2026 | Isuzu Motors Limited | BQ-6HK1X | Tier 4 (Final or Phase In) | 194 |  |
| 2026 | Isuzu Motors Limited | BQ-6WG1X | Tier 4 (Final or Phase In) | 382 |  |
| 2026 | Isuzu Motors Limited | BR-4HK1X | Tier 4 (Final or Phase In) | 127 |  |
| 2026 | Isuzu Motors Limited | BR-4JJ1X | Tier 4 (Final or Phase In) | 71 |  |
| 2026 | Isuzu Motors Limited | BZ-4LE2T | Tier 4 (Final or Phase In) | 30 |  |
| 2026 | Isuzu Motors Limited | KH-6HK1X | Tier 3 | 198 |  |
| 2026 | Isuzu Motors Limited | KI-4HK1X | Tier 3 | 129 |  |
| 2026 | Isuzu Motors Limited | KJ-4JJ1X | Tier 3 | 73 |  |
| 2026 | Isuzu Motors Limited | KV-4LE1T | Interim Tier 4 | 35 |  |
| 2026 | Isuzu Motors Limited | LV-4LE2 | Interim Tier 4 | 26 |  |
| 2026 | Kirloskar Americas Corporation | 2R550NA1 | Tier 4 (Final or Phase In) | 12 |  |
| 2026 | Kirloskar Americas Corporation | 3R550NA1 | Tier 4 (Final or Phase In) | 17 |  |
| 2026 | Kirloskar Americas Corporation | 4K1080TA1 | Tier 3, Tier 4 (Final or Phase In) | 115 |  |
| 2026 | Kirloskar Americas Corporation | 4R810NA1 | Tier 2, Tier 4 (Final or Phase In) | 35 |  |
| 2026 | Kirloskar Americas Corporation | 4R810TA1 | Tier 3, Tier 4 (Final or Phase In) | 70 |  |
| 2026 | Kirloskar Americas Corporation | 4R810TA2 | Tier 3, Tier 4 (Final or Phase In) | 48 |  |
| 2026 | Kubota Corporation | D1005-BG-EF | Tier 4 (Final or Phase In) | 11 |  |
| 2026 | Kubota Corporation | D1005-EF | Tier 4 (Final or Phase In) | 11 |  |
| 2026 | Kubota Corporation | D1105-BG-EF | Tier 4 (Final or Phase In) | 13 |  |
| 2026 | Kubota Corporation | D1105-EF | Tier 4 (Final or Phase In) | 13 |  |
| 2026 | Kubota Corporation | D1503-M-BG-EF | Tier 4 (Final or Phase In) | 18 |  |
| 2026 | Kubota Corporation | D1703-M-BG-ET | Interim Tier 4 | 20 |  |
| 2026 | Kubota Corporation | D1803-CR-TI-BG-EF | Tier 4 (Final or Phase In) | 28 |  |
| 2026 | Kubota Corporation | V1505-BG-EF | Tier 4 (Final or Phase In) | 18 |  |
| 2026 | Kubota Corporation | V2203-M-BG-ET | Interim Tier 4 | 28 |  |
| 2026 | Kubota Corporation | V2403-CR-NT-BG-EF | Tier 4 (Final or Phase In) | 37 |  |
| 2026 | Kubota Corporation | V2403-CR-NTI-BG-EF | Tier 4 (Final or Phase In) | 54 |  |
| 2026 | Kubota Corporation | V2403-CR-TI-BG-EF | Tier 4 (Final or Phase In) | 37 |  |
| 2026 | Kubota Corporation | V3300-BG-EF | Interim Tier 4 | 36 |  |
| 2026 | Kubota Corporation | V3600-T-BG-ET | Interim Tier 4, Tier 3 | 52 |  |
| 2026 | Kubota Corporation | V3800-CR-TI-BG-ET | Tier 3 | 67 |  |
| 2026 | Kubota Corporation | V3800-DI-T-BG-ET | Interim Tier 4, Tier 3 | 55 |  |
| 2026 | Kubota Corporation | Z482-D2-EF | Tier 4 (Final or Phase In) | 5 |  |
| 2026 | Liebherr Machines Bulle SA | D9612 A7-02 | Tier 2 | 1114 | Liebherr D9612 (0.714) |
| 2026 | Liebherr Machines Bulle SA | D9616 A7-02 | Tier 2 | 1450 |  |
| 2026 | Liebherr Machines Bulle SA | D9620 A7-02 | Tier 2 | 1910 |  |
| 2026 | Liebherr Machines Bulle SA | D976 A7-02 | Tier 2 | 820 |  |
| 2026 | Liebherr Machines Bulle SA | D9812G | Tier 2, Tier 4 (Final or Phase In) | 2700 |  |
| 2026 | Liebherr Machines Bulle SA | D9816G | Tier 2, Tier 4 (Final or Phase In) | 3490 |  |
| 2026 | Liebherr Machines Bulle SA | D9820G | Tier 2 | 4290 |  |
| 2026 | Liebherr Machines Bulle SA | D9912G | Tier 2 | 2700 |  |
| 2026 | Liebherr Machines Bulle SA | D9916G | Tier 2 | 3490 |  |
| 2026 | Liebherr Machines Bulle SA | KD103V20-6AES | Tier 2 | 3758 |  |
| 2026 | Liebherr Machines Bulle SA | KD103V20-6CES | Tier 2 | 4290 |  |
| 2026 | Liebherr Machines Bulle SA | KD18L06-6AES | Tier 2 | 670 |  |

## Interpretation

- EPA certification records identify certified engine configurations, not generator-set electrical ratings.
- A shared base model can have different certification families, power ratings, aftertreatment and model years.
- Candidate additions should be validated against the EPA certificate and a manufacturer datasheet before database insertion.

