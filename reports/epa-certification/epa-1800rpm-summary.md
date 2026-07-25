# EPA Nonroad CI 1800 RPM Engine Coverage

Source workbook: `nonroad-compression-ignition-2011-present (1).xlsx`

## Method

- Kept only `Model Info` rows where `Rated Speed (RPM)` is exactly 1800.
- Joined manufacturer, certificate, tier, compliance standard and fuel from `Family Info` using model year and engine family.
- Deduplicated recurring annual certifications by EPA manufacturer plus normalized engine model.
- Counted a database model as present only when its normalized model and verified manufacturer-to-brand mapping both matched.
- Counted a redundant leading database brand as represented only when the remaining normalized model had at least five characters.
- Counted slash-suffixed certification trims as represented only when the explicit base model before `/` matched the verified database brand.
- Counted non-slash certification trims only through reviewed manufacturer, brand and suffix-pattern rules.
- Counted commercial family variants only for explicit EPA-manufacturer/database-brand mappings and a normalized family prefix of at least five characters.
- Counted non-literal certification aliases only from the reviewed `CERTIFICATION_ALIASES` map.
- Exact model matches under another brand and other similar suffix variants remain review items.

## Summary

- 1800 RPM source rows: **15,773**
- Distinct EPA manufacturer/model combinations: **970**
- Exact manufacturer/brand matches: **121**
- Matches after removing a redundant database brand prefix: **27**
- Slash-suffixed certification trims represented by a verified base model: **14**
- Reviewed manufacturer certification trims: **44**
- Reviewed certification aliases: **50**
- Verified commercial family matches: **34**
- Exact matches whose database page uses 1800 as its primary RPM: **63**
- Exact model under another database brand: **9**
- Not represented after reviewed matching rules: **671**
- Models from mapped manufacturers: **834**
- Represented coverage within mapped manufacturers: **34.8%**
- Unmatched models with a 2024+ certification: **277**
- Models with at least one constant-speed certification: **716**
- Variable-speed-only models retained for reference: **230**
- Generator-priority review queue (2024+, mapped brand, constant speed): **147**

The primary RPM field does not prove that a page lacks 60 Hz ratings; many catalog pages use 1500 RPM as the primary value while storing separate 60 Hz fields. Those pages need a second rating-level comparison before any RPM correction.

## Manufacturer Mapping Notes

- `Discovery Energy, LLC.` is compared with the existing `Kohler` brand. Rehlko's official [engine warranty page](https://www.engines.rehlko.com/warranty) identifies Discovery Energy as the responsible company and states that Kohler Engines is now Rehlko.
- `HD Construction Equipment Co., Ltd.` is compared with the existing `Hyundai` brand. Its [official network page](https://www.hd-ce.com/en/network) lists the current company and its engine production and R&D operations.
- `Caterpillar Inc.` is also compared with `Perkins` for reviewed family-prefix matches. Official Perkins product documentation identifies commercial models such as `1706J-E93TA` and `2406J-E13TA` behind the shorter EPA family names.
- `FPT Industrial S.p.A.` uses internal EPA certification codes for its Tier 3 engines. Twelve reviewed aliases are mapped to N45, N67 and Cursor 9 commercial pages only where displacement, certification family and published power node agree with FPT's official power-generation brochure.
- `Liebherr Machines Bulle SA` is compared with both `Liebherr` and `Kohler`. Liebherr's official co-development announcement identifies the six KD commercial engine families manufactured for Kohler generator sets.
- `Kubota Corporation` EPA model names use certification suffixes such as `-EF` and `-ET`, while Kubota's public generator catalog uses commercial `E4-BG` and `E3-BG` names. Fifteen reviewed aliases require matching displacement, aspiration, emissions tier and Kubota-published 1800 RPM output.
- `Perkins Engines Co Ltd` EPA records omit the generator-drive `G` suffix and may append the shared Caterpillar base-engine name in parentheses. Ten reviewed aliases map those records only to Perkins ElectropaK pages with matching family, displacement, emissions tier and manufacturer-published 1800 RPM power node.
- `Rolls-Royce Solutions America Inc` is represented under the `MTU` database brand. Exact 60 Hz commercial model pages retain MTU's `S`, `3B` and `3D` application suffixes and use the latest 1800 RPM power node in the EPA workbook, supplemented by public MTU gendrive specifications and operating instructions where available.
- `Yanmar Power Technology Co., Ltd.` uses several EPA certification configuration names that differ from its TNV generator product names. Nine reviewed aliases map only where displacement, aspiration, emissions tier and the certified power node agree with Yanmar's official generator and industrial-engine documentation.

## Generator-Priority Gaps by Brand

| Database brand | 2024+ constant-speed models without represented match |
|---|---:|
| Cummins | 24 |
| Mitsubishi | 16 |
| FPT | 12 |
| Perkins | 12 |
| Isuzu | 11 |
| Deutz | 10 |
| Yanmar | 10 |
| Baudouin | 9 |
| Hyundai | 8 |
| John Deere | 8 |
| Kohler | 7 |
| Caterpillar | 6 |
| Kirloskar | 6 |
| Liebherr | 6 |
| Kubota | 4 |
| Weichai | 3 |
| Volvo Penta | 1 |

## Manufacturer Coverage

| EPA manufacturer | Database brand | EPA models | Exact | Brand prefix | Base trims | Cert. trims | Cert. aliases | Families | Other-brand exact | Not found | Probable |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Rolls-Royce Solutions America Inc | MTU | 155 | 39 | 27 | 0 | 0 | 0 | 0 | 0 | 89 | 19 |
| Cummins Inc. | Cummins | 80 | 23 | 0 | 0 | 0 | 0 | 13 | 0 | 44 | 11 |
| Perkins Engines Co Ltd | Perkins | 79 | 6 | 0 | 0 | 0 | 10 | 6 | 6 | 51 | 2 |
| FPT Industrial S.p.A. | FPT | 68 | 0 | 0 | 0 | 0 | 12 | 0 | 0 | 56 | 0 |
| IHI Agri-Tech Corporation | Unmapped | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 55 | 0 |
| Liebherr Machines Bulle SA | Kohler, Liebherr | 56 | 2 | 0 | 0 | 44 | 3 | 0 | 0 | 7 | 0 |
| Discovery Energy, LLC. | Kohler | 48 | 2 | 0 | 14 | 0 | 1 | 0 | 0 | 31 | 2 |
| Yanmar Power Technology Co., Ltd. | Yanmar | 42 | 0 | 0 | 0 | 0 | 9 | 4 | 0 | 29 | 0 |
| Kubota Corporation | Kubota | 37 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 22 | 0 |
| Caterpillar Inc. | Caterpillar | 35 | 15 | 0 | 0 | 0 | 0 | 11 | 0 | 9 | 1 |
| Motorenfabrik Hatz GmbH & Co. KG | Hatz | 29 | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 18 | 1 |
| AB Volvo Penta | Volvo Penta | 28 | 21 | 0 | 0 | 0 | 0 | 0 | 0 | 7 | 7 |
| Deutz AG | Deutz | 28 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 28 | 0 |
| HD Construction Equipment Co., Ltd. | Hyundai | 26 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 26 | 0 |
| Isuzu Motors Limited | Isuzu | 24 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 24 | 0 |
| Daedong Corporation | Unmapped | 19 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 19 | 0 |
| Deere & Company | John Deere | 19 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 19 | 5 |
| Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | Mitsubishi | 19 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 19 | 6 |
| Scania CV AB | Scania | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 11 | 0 |
| Komatsu Ltd. | Komatsu | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 1 |
| Mercedes Benz | Unmapped | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 0 |
| KUKJE MACHINERY CO., LTD | Unmapped | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 9 | 0 |
| Societe Internationale des Moteurs-Baudouin | Baudouin | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 9 | 0 |
| Lister Petter Limited | Lister Petter | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 7 | 0 |
| Kirloskar Americas Corporation | Kirloskar | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 6 | 0 |
| Shandong Huayuan Laidong Engine Co.,LTD. | Unmapped | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 6 | 0 |
| Tianjin Lovol Engines Co., Ltd. | Lovol | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 6 | 0 |
| International Motors, LLC | Unmapped | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 0 |
| TYM Corporation | Unmapped | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 0 |
| Daimler Truck AG | Unmapped | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 |
| Lion (China) Engine Science and Technology Co.,Ltd. | Unmapped | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 |
| Yangdong Co., Ltd. | Unmapped | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 |
| MAN Truck & Bus AG | MAN | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 |
| Suzhou Jinding Machinery Manufacturing Co., Ltd. | Unmapped | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 |
| Volvo Construction Equipment | Unmapped | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 |
| Weichai Power Co.,Ltd. | Weichai | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 |
| Zhejiang Xinchai Co., Ltd. | Xinchai | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 2 |
| Detroit Diesel Corporation | Detroit Diesel | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 1 |
| PSA Peugeot Citroen | Unmapped | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 |
| Wuxi Kipor Power Co., Ltd. | Unmapped | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 |
| ENER-G Rudox LLC | Unmapped | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| FAW JIEFANG AUTOMOTIVE CO.,LTD,WUXI DIESEL ENGINE WORKS | FAWDE | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| Greaves Farymann Diesel GmbH | Unmapped | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |

## Priority Review

These are recent constant-speed EPA-certified models from mapped manufacturers that were not found as exact, brand-prefix, base-trim, reviewed certification-trim, reviewed certification-alias or verified commercial-family matches. The full records, including variable-speed-only models and candidate aliases, are in `epa-1800rpm-model-match.json`.

| Latest year | Manufacturer | EPA model | Tier | Power kW | Probable database model |
|---:|---|---|---|---:|---|
| 2027 | HD Construction Equipment Co., Ltd. | DM02AP | Tier 3 | 55 |  |
| 2026 | AB Volvo Penta | TWD1683GE-B | Tier 2 | 685 | Volvo Penta TWD1683GE (0.947) |
| 2026 | Caterpillar Inc. | 1506 | Tier 3 | 358 |  |
| 2026 | Caterpillar Inc. | 2206F | Tier 4 (Final or Phase In) | 423 |  |
| 2026 | Caterpillar Inc. | 3512E | Tier 4 (Final or Phase In) | 1864 |  |
| 2026 | Caterpillar Inc. | 3516E | Tier 2 | 3372 |  |
| 2026 | Caterpillar Inc. | 5006C | Tier 2 | 887 |  |
| 2026 | Caterpillar Inc. | 5016C | Tier 2 | 2283 |  |
| 2026 | Cummins Inc. | 4BT3.3G4 | Interim Tier 4, Tier 3 | 46 |  |
| 2026 | Cummins Inc. | 4BT3.3G5 | Interim Tier 4, Tier 3 | 51 |  |
| 2026 | Cummins Inc. | 4BTAA3.3G12 | Tier 3 | 74 |  |
| 2026 | Cummins Inc. | 4BTAA3.3G17 | Tier 3 | 65 |  |
| 2026 | Cummins Inc. | 4BTAA3.3G18 | Tier 3 | 53 |  |
| 2026 | Cummins Inc. | 4BTAA3.3G7 | Tier 3 | 74 |  |
| 2026 | Cummins Inc. | KD05L04T-6DDS | Tier 3 | 154 |  |
| 2026 | Cummins Inc. | KD07L06T-6DDS | Tier 3 | 242 |  |
| 2026 | Cummins Inc. | KD09L06T-6DDS | Tier 3 | 346 |  |
| 2026 | Cummins Inc. | QSB7-G4 | Tier 3 | 214 |  |
| 2026 | Cummins Inc. | QSK19-C | Tier 2, Tier 3, Tier 4 (Final or Phase In) | 567 |  |
| 2026 | Cummins Inc. | QSK23-G7 NR2 | Tier 2 | 910 |  |
| 2026 | Cummins Inc. | QSK38-G16 | Tier 2 | 1129 | Cummins QSK38-G1 (0.933) |
| 2026 | Cummins Inc. | QSK50-G22 | Tier 2 | 1682 | Cummins QSK50-G2 (0.933) |
| 2026 | Cummins Inc. | QSK50-G23 | Tier 2 | 1947 | Cummins QSK50-G2 (0.933) |
| 2026 | Cummins Inc. | QSK78-G | Tier 2 | 3029 | Cummins QSK78 (0.909) |
| 2026 | Cummins Inc. | QSK78-G10 | Tier 2 | 2760 | Cummins QSK78 (0.769) |
| 2026 | Cummins Inc. | QST30-G | Tier 2 | 1111 | Cummins QST30 (0.909) |
| 2026 | Cummins Inc. | QSX15-G | Interim Tier 4, Tier 2, Tier 3 | 563 | Cummins QSX15 (0.909) |
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
| 2026 | Discovery Energy, LLC. | KDI1903ESM | Tier 2, Tier 4 (Final or Phase In) | 21 | Kohler KDI1903M (0.889) |
| 2026 | FPT Industrial S.p.A. | F2CE9685E*E | Tier 3 | 230 |  |
| 2026 | FPT Industrial S.p.A. | F4GE9485A*J | Tier 3 | 98 |  |
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
| 2026 | Kubota Corporation | V2403-CR-NT-BG-EF | Tier 4 (Final or Phase In) | 37 |  |
| 2026 | Kubota Corporation | V2403-CR-NTI-BG-EF | Tier 4 (Final or Phase In) | 54 |  |
| 2026 | Kubota Corporation | V3300-BG-EF | Interim Tier 4 | 36 |  |
| 2026 | Kubota Corporation | V3800-CR-TI-BG-ET | Tier 3 | 67 |  |
| 2026 | Liebherr Machines Bulle SA | D976 A7-02 | Tier 2 | 820 |  |
| 2026 | Liebherr Machines Bulle SA | D9912G | Tier 2 | 2700 |  |
| 2026 | Liebherr Machines Bulle SA | D9916G | Tier 2 | 3490 |  |
| 2026 | Liebherr Machines Bulle SA | KD18L06-6AES | Tier 2 | 670 |  |
| 2026 | Liebherr Machines Bulle SA | KD18L06-6BES | Tier 2 | 785 |  |
| 2026 | Liebherr Machines Bulle SA | KD18L06-6CES | Tier 2 | 820 |  |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | D04EG-MECH-TAA | Tier 3 | 68 |  |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | D04EG-T | Tier 4 (Final or Phase In) | 54 |  |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | L2E | Tier 4 (Final or Phase In) | 6 |  |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | L3E | Tier 4 (Final or Phase In) | 9 |  |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | S12A2-PTAW | Tier 2 | 900 | Mitsubishi S12R-A2PTAW (0.947) |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | S12H-PTAW | Tier 2 | 1140 | Mitsubishi S12H-PTA (0.933) |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | S12R-PTAW | Tier 2 | 1403 | Mitsubishi S12R-PTA (0.933) |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | S16R-PTAW | Tier 2 | 1750 | Mitsubishi S16R2-PTAW (0.941) |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | S16R-PTAW2 | Tier 2 | 2180 | Mitsubishi S16R-PTA2 (0.941) |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | S3L2 | Tier 4 (Final or Phase In) | 14 |  |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | S4L2 | Tier 4 (Final or Phase In) | 18 |  |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | S4S | Interim Tier 4, Tier 3 | 35 |  |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | S4S-DTB | Interim Tier 4, Tier 3 | 45 |  |
| 2026 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | S6R-PTAW | Tier 2 | 685 | Mitsubishi S6R-PTA (0.923) |
| 2026 | Perkins Engines Co Ltd | 1206F-E70TA(C7.1) | Tier 4 (Final or Phase In) | 122 |  |
| 2026 | Perkins Engines Co Ltd | 1206F-E70TTA(C7.1) | Tier 4 (Final or Phase In) | 239 |  |
| 2026 | Perkins Engines Co Ltd | 402F-05(C0.5) | Tier 4 (Final or Phase In) | 4 |  |
| 2026 | Perkins Engines Co Ltd | 403F-07(C0.7) | Tier 4 (Final or Phase In) | 7 |  |
| 2026 | Perkins Engines Co Ltd | 403F-15(C1.5) | Tier 4 (Final or Phase In) | 15 |  |
| 2026 | Perkins Engines Co Ltd | C1.5 | Tier 4 (Final or Phase In) | 18 |  |
| 2026 | Perkins Engines Co Ltd | C2.2 | Interim Tier 4, Tier 4 (Final or Phase In) | 36 |  |
| 2026 | Perkins Engines Co Ltd | C7.1 | Interim Tier 4, Tier 4 (Final or Phase In) | 180 |  |
| 2026 | Societe Internationale des Moteurs-Baudouin | 12M33 | Tier 2 | 1420 |  |
| 2026 | Societe Internationale des Moteurs-Baudouin | 12M55 | Tier 2 | 2752 |  |
| 2026 | Societe Internationale des Moteurs-Baudouin | 16M33 | Tier 2 | 1893 |  |
| 2026 | Societe Internationale des Moteurs-Baudouin | 16M55 | Tier 2 | 3600 |  |
| 2026 | Societe Internationale des Moteurs-Baudouin | 20M33 | Tier 2 | 2460 |  |
| 2026 | Societe Internationale des Moteurs-Baudouin | 20M55 | Tier 2 | 4550 |  |
| 2026 | Societe Internationale des Moteurs-Baudouin | 20M61 | Tier 2 | 5450 |  |
| 2026 | Societe Internationale des Moteurs-Baudouin | 6M33 | Tier 2 | 726 |  |
| 2026 | Societe Internationale des Moteurs-Baudouin | 8M33 | Tier 2 | 946 |  |
| 2026 | Yanmar Power Technology Co., Ltd. | 3MTGAG | Interim Tier 4, Tier 4 (Final or Phase In) | 28 |  |
| 2026 | Yanmar Power Technology Co., Ltd. | 3MTGP | Interim Tier 4, Tier 4 (Final or Phase In) | 28 |  |
| 2026 | Yanmar Power Technology Co., Ltd. | 3NNGAG | Tier 4 (Final or Phase In) | 22 |  |
| 2026 | Yanmar Power Technology Co., Ltd. | 3TNV76-CL | Tier 4 (Final or Phase In) | 12 |  |
| 2026 | Yanmar Power Technology Co., Ltd. | 4HNGFM | Tier 4 (Final or Phase In) | 16 |  |
| 2026 | Yanmar Power Technology Co., Ltd. | 4HNGPM | Tier 4 (Final or Phase In) | 16 |  |
| 2026 | Yanmar Power Technology Co., Ltd. | 4TNV88-CL | Interim Tier 4, Tier 4 (Final or Phase In) | 24 |  |
| 2026 | Yanmar Power Technology Co., Ltd. | 4WNGAA | Tier 4 (Final or Phase In) | 11 |  |
| 2026 | Yanmar Power Technology Co., Ltd. | 4WNGPA | Tier 4 (Final or Phase In) | 11 |  |
| 2026 | Yanmar Power Technology Co., Ltd. | 5ENGAA | Tier 4 (Final or Phase In) | 9 |  |
| 2025 | Deere & Company | 6135 | Interim Tier 4, Tier 3, Tier 4 (Final or Phase In) | 563 |  |
| 2025 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | D03CJ-TAA | Tier 4 (Final or Phase In) | 35 |  |
| 2025 | Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | D04CJ-TAA | Tier 4 (Final or Phase In) | 55 |  |
| 2025 | Perkins Engines Co Ltd | 1204F-E44TTAN(C4.4) | Tier 4 (Final or Phase In) | 129 |  |
| 2025 | Weichai Power Co.,Ltd. | 12M33 | Tier 2 | 1375 |  |
| 2025 | Weichai Power Co.,Ltd. | 16M33 | Tier 2 | 1850 |  |
| 2025 | Weichai Power Co.,Ltd. | 6M33 | Tier 2 | 710 |  |
| 2024 | Cummins Inc. | QSK23-C | Tier 2 | 708 | Cummins QSK23 (0.909) |
| 2024 | Cummins Inc. | QSL | Tier 3 | 346 |  |
| 2024 | Cummins Inc. | QSM11-C | Tier 3 | 298 |  |
| 2024 | Cummins Inc. | QSZ13-G9 | Tier 3 | 500 |  |
| 2024 | Deutz AG | TAD550GE | Tier 3 | 98 |  |
| 2024 | Deutz AG | TAD551GE | Tier 3 | 114 |  |
| 2024 | Deutz AG | TAD750GE | Tier 3 | 150 |  |
| 2024 | Deutz AG | TAD751GE | Tier 3 | 174 |  |
| 2024 | Deutz AG | TAD752GE | Tier 3 | 212 |  |
| 2024 | Deutz AG | TAD753GE | Tier 3 | 233 |  |
| 2024 | Deutz AG | TAD754GE | Tier 3 | 260 |  |
| 2024 | Perkins Engines Co Ltd | 403F-15 | Tier 4 (Final or Phase In) | 15 |  |
| 2024 | Perkins Engines Co Ltd | C1.1 | Tier 4 (Final or Phase In) | 12 |  |
| 2024 | Perkins Engines Co Ltd | S773L-F | Tier 4 (Final or Phase In) | 11 |  |

## Interpretation

- EPA certification records identify certified engine configurations, not generator-set electrical ratings.
- A shared base model can have different certification families, power ratings, aftertreatment and model years.
- Candidate additions should be validated against the EPA certificate and a manufacturer datasheet before database insertion.

