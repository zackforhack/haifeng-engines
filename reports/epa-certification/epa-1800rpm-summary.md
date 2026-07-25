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
- Counted commercial family variants only through reviewed manufacturer, brand and prefix rules; short families also require an EPA emissions label on the matched page.
- Counted non-literal certification aliases only from the reviewed `CERTIFICATION_ALIASES` map.
- Counted certification groups only when every commercial model in the reviewed `CERTIFICATION_ALIAS_GROUPS` map was present.
- Exact model matches under another brand and other similar suffix variants remain review items.

## Summary

- 1800 RPM source rows: **15,773**
- Distinct EPA manufacturer/model combinations: **970**
- Exact manufacturer/brand matches: **353**
- Matches after removing a redundant database brand prefix: **34**
- Slash-suffixed certification trims represented by a verified base model: **20**
- Reviewed manufacturer certification trims: **44**
- Reviewed certification aliases: **219**
- Fully represented certification groups: **8**
- Verified commercial family matches: **55**
- Exact matches whose database page uses 1800 as its primary RPM: **295**
- Exact model under another database brand: **2**
- Not represented after reviewed matching rules: **235**
- Models from mapped manufacturers: **964**
- Represented coverage within mapped manufacturers: **76.0%**
- Unmatched models with a 2024+ certification: **124**
- Models with at least one constant-speed certification: **716**
- Represented constant-speed certification coverage: **716 of 716 (100.0%)**
- Unrepresented constant-speed models: **0**
- Constant-speed models under an unmapped manufacturer: **0**
- Variable-speed-only models retained for reference: **230**
- Generator-priority review queue (2024+, mapped brand, constant speed): **0**
- Next-tier review queue (2020–2023, mapped brand, constant speed): **0**
- Legacy 2019 review queue (mapped brand, constant speed): **0**
- Legacy 2018 review queue (mapped brand, constant speed): **0**
- Legacy 2017 review queue (mapped brand, constant speed): **0**
- Legacy 2016 review queue (mapped brand, constant speed): **0**
- Legacy 2015 review queue (mapped brand, constant speed): **0**
- Legacy 2014 review queue (mapped brand, constant speed): **0**
- Legacy 2013 review queue (mapped brand, constant speed): **0**
- Legacy 2012 review queue (mapped brand, constant speed): **0**
- Legacy 2011 review queue (mapped brand, constant speed): **0**

The primary RPM field does not prove that a page lacks 60 Hz ratings; many catalog pages use 1500 RPM as the primary value while storing separate 60 Hz fields. Those pages need a second rating-level comparison before any RPM correction.

## Manufacturer Mapping Notes

- `Discovery Energy, LLC.` is compared with the existing `Kohler` brand. Rehlko's official [engine warranty page](https://www.engines.rehlko.com/warranty) identifies Discovery Energy as the responsible company and states that Kohler Engines is now Rehlko.
- `HD Construction Equipment Co., Ltd.` is compared with the existing `Hyundai` brand. Its [official network page](https://www.hd-ce.com/en/network) lists the current company and its engine production and R&D operations.
- `Caterpillar Inc.` is also compared with `Perkins` for reviewed family-prefix matches. Official Perkins product documentation identifies commercial models such as `1706J-E93TA` and `2406J-E13TA` behind the shorter EPA family names.
- `Cummins Inc.` exact generator-drive pages retain commercial `G` and `NR2` suffixes. Three reviewed aliases map generic `-G` certification names to existing QSK78, QST30 and QSX15 family pages where displacement, certification tiers and 1800 RPM operation already agree.
- `Mitsubishi Heavy Industries Engine & Turbocharger, Ltd.` EPA records shorten six Tier 2 generator models by omitting their `Y2` application codes. Reviewed aliases map only to existing Y2PTAW 60 Hz pages whose EPA engine code, displacement and certified 1800 RPM power node agree.
- `FPT Industrial S.p.A.` uses internal EPA certification codes for its Tier 3 engines. Twelve reviewed aliases are mapped to N45, N67 and Cursor 9 commercial pages only where displacement, certification family and published power node agree with FPT's official power-generation brochure.
- `Liebherr Machines Bulle SA` is compared with both `Liebherr` and `Kohler`. Liebherr's official co-development announcement identifies the six KD commercial engine families manufactured for Kohler generator sets.
- `Kubota Corporation` EPA model names use certification suffixes such as `-EF` and `-ET`, while Kubota's public generator catalog uses commercial `E4-BG` and `E3-BG` names. Sixteen reviewed aliases require matching displacement, aspiration, emissions tier and Kubota-published 1800 RPM output.
- `Perkins Engines Co Ltd` EPA records omit the generator-drive `G` suffix and may append the shared Caterpillar base-engine name in parentheses. Seventeen reviewed aliases map those records only to Perkins commercial pages with matching family, displacement, emissions tier and manufacturer-published 1800 RPM power node.
- `Rolls-Royce Solutions America Inc` is represented under the `MTU` database brand. Exact 60 Hz commercial model pages retain MTU's `S`, `3B` and `3D` application suffixes and use the latest 1800 RPM power node in the EPA workbook. Fifteen reviewed aliases cover EPA certification names whose only difference is the presence or absence of the verified `3B` or `3D` suffix, supplemented by public MTU gendrive specifications and operating instructions where available.
- `Yanmar Power Technology Co., Ltd.` uses several EPA certification configuration names that differ from its TNV generator product names. Seventeen reviewed aliases map only where displacement, aspiration, emissions tier and the certified power node agree with Yanmar's official generator and industrial-engine documentation.

## Generator-Priority Gaps by Brand

| Database brand | 2024+ constant-speed models without represented match |
|---|---:|
| None | 0 |

## Manufacturer Coverage

| EPA manufacturer | Database brand | EPA models | Exact | Brand prefix | Base trims | Cert. trims | Cert. aliases | Families | Other-brand exact | Not found | Probable |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Rolls-Royce Solutions America Inc | MTU | 155 | 42 | 34 | 0 | 0 | 70 | 0 | 0 | 9 | 0 |
| Cummins Inc. | Cummins | 80 | 48 | 0 | 0 | 0 | 6 | 14 | 0 | 12 | 1 |
| Perkins Engines Co Ltd | Perkins | 79 | 31 | 0 | 0 | 0 | 21 | 10 | 2 | 15 | 2 |
| FPT Industrial S.p.A. | FPT | 68 | 12 | 0 | 0 | 0 | 12 | 0 | 0 | 44 | 1 |
| IHI Agri-Tech Corporation | Perkins, Shibaura | 58 | 4 | 0 | 0 | 0 | 40 | 0 | 0 | 13 | 2 |
| Liebherr Machines Bulle SA | Kohler, Liebherr | 56 | 7 | 0 | 0 | 44 | 4 | 0 | 0 | 1 | 0 |
| Discovery Energy, LLC. | Kohler | 48 | 5 | 0 | 14 | 0 | 4 | 0 | 0 | 25 | 0 |
| Yanmar Power Technology Co., Ltd. | Yanmar | 42 | 8 | 0 | 0 | 0 | 26 | 5 | 0 | 3 | 0 |
| Kubota Corporation | Kubota | 37 | 11 | 0 | 0 | 0 | 21 | 0 | 0 | 5 | 1 |
| Caterpillar Inc. | Caterpillar | 35 | 22 | 0 | 0 | 0 | 0 | 11 | 0 | 2 | 0 |
| Motorenfabrik Hatz GmbH & Co. KG | Hatz | 29 | 22 | 0 | 0 | 0 | 1 | 0 | 0 | 6 | 1 |
| AB Volvo Penta | Volvo Penta | 28 | 23 | 0 | 0 | 0 | 2 | 0 | 0 | 3 | 3 |
| Deutz AG | Deutz | 28 | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 17 | 0 |
| HD Construction Equipment Co., Ltd. | Hyundai | 26 | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 16 | 2 |
| Isuzu Motors Limited | Isuzu | 24 | 14 | 0 | 0 | 0 | 3 | 0 | 0 | 7 | 0 |
| Daedong Corporation | Daedong | 19 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 0 |
| Deere & Company | John Deere | 19 | 10 | 0 | 0 | 0 | 1 | 5 | 0 | 3 | 0 |
| Mitsubishi Heavy Industries Engine & Turbocharger, Ltd. | Mitsubishi | 19 | 10 | 0 | 0 | 0 | 6 | 0 | 0 | 3 | 0 |
| Scania CV AB | Scania | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 11 | 0 |
| Komatsu Ltd. | Komatsu | 10 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 9 | 1 |
| Mercedes Benz | Mercedes-Benz | 10 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 8 | 0 |
| KUKJE MACHINERY CO., LTD | Kukje | 9 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 3 |
| Societe Internationale des Moteurs-Baudouin | Baudouin | 9 | 2 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 |
| Lister Petter Limited | Lister Petter | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Kirloskar Americas Corporation | Kirloskar | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Shandong Huayuan Laidong Engine Co.,LTD. | Laidong | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Tianjin Lovol Engines Co., Ltd. | Lovol | 6 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | 0 |
| International Motors, LLC | International | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| TYM Corporation | TYM | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Daimler Truck AG | Mercedes-Benz | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 |
| Lion (China) Engine Science and Technology Co.,Ltd. | Lion | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Yangdong Co., Ltd. | Yangdong | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| MAN Truck & Bus AG | MAN | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 |
| Suzhou Jinding Machinery Manufacturing Co., Ltd. | JDP | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Volvo Construction Equipment | Unmapped | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 |
| Weichai Power Co.,Ltd. | Weichai | 3 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 |
| Zhejiang Xinchai Co., Ltd. | Xinchai | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Detroit Diesel Corporation | Detroit Diesel | 2 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |
| PSA Peugeot Citroen | Unmapped | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 |
| Wuxi Kipor Power Co., Ltd. | Kipor | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ENER-G Rudox LLC | Mitsubishi | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| FAW JIEFANG AUTOMOTIVE CO.,LTD,WUXI DIESEL ENGINE WORKS | FAWDE | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Greaves Farymann Diesel GmbH | Unmapped | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |

## Priority Review

These are recent constant-speed EPA-certified models from mapped manufacturers that were not found as exact, brand-prefix, base-trim, reviewed certification-trim, reviewed certification-alias or verified commercial-family matches. The full records, including variable-speed-only models and candidate aliases, are in `epa-1800rpm-model-match.json`.

| Latest year | Manufacturer | EPA model | Tier | Power kW | Probable database model |
|---:|---|---|---|---:|---|
| - | None | None | - | - | - |

## Interpretation

- EPA certification records identify certified engine configurations, not generator-set electrical ratings.
- A shared base model can have different certification families, power ratings, aftertreatment and model years.
- Candidate additions should be validated against the EPA certificate and a manufacturer datasheet before database insertion.

