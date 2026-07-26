# EPA Spark-Ignited 1800 RPM Coverage Baseline

Source workbook: `EPA Spark Ignited Report.xlsx`
Source SHA-256: `47faef9a835b5148db5f02e6ee6a4569436749a47e65c70b95b7f170eb10431a`
Catalog snapshot engines: **2,715**
Catalog snapshot SHA-256: `ea48adcaf0449838968ac2c7ebf61a343f396cf2a8b576cd62d1dca211225672`

## Scope And Limitation

- Kept only rows where `Max Engine Test Speed (RPM)` is exactly 1800.
- Deduplicated repeated fuel and test-cycle rows into annual EPA engine families.
- Followed `Carryover Engine Family` references to group recurring annual certifications into lineages.
- The workbook has no engine-model column. Therefore this report does not claim exact model coverage.
- Configuration candidates require a mapped manufacturer, gas-fueled catalog page, 1800/60 Hz capability, matching cylinder count and displacement within 3%.
- When the EPA lineage has one unambiguous aspiration method, an explicitly conflicting catalog configuration is excluded.
- A strong candidate has either a documented lineage-to-model crosswalk or a catalog mechanical-power value within 15% of an EPA maximum-power node.
- Documented source-field conflicts are corrected only for matching; raw EPA values remain in the JSON output.

## Summary

- Exact-1800 source rows: **4,347**
- Annual manufacturer/family identities: **1,488**
- Carryover lineages: **328**
- Manufacturers: **31**
- Lineages with at least one stationary test: **256**
- Lineages under mapped catalog manufacturers: **323**
- Documented source-field corrections used for matching: **10**
- Documented lineage-to-model crosswalks: **5**

### Stationary Coverage Candidates

- Strong configuration candidates: **249**
- Configuration candidates without close power confirmation: **0**
- Researched and quarantined configuration exceptions: **7**
- Mapped manufacturer but no configuration candidate: **0**
- Unmapped manufacturer lineages: **0**
- Recent 2024+ stationary gaps: **0**
- Recent 2024+ mobile-only gaps excluded from the queue: **14**

### All Exact-1800 Lineages

- Strong configuration candidates: **283**
- Other configuration candidates: **13**
- Researched and quarantined configuration exceptions: **7**
- Mapped manufacturer but no configuration candidate: **21**
- Unmapped manufacturer lineages: **4**

Candidate counts are discovery metrics, not verified coverage percentages. Exact model names must be obtained from EPA certificates or manufacturer documentation before insertion.

## Documented Source Corrections

| Manufacturer | Root family | Raw displacement L | Raw cylinders | Matching correction |
|---|---|---|---|---|
| Cummins Inc. | HCEXB38.0AAA | 37.7 | 16 | cylinders 12 - EPA reports 16 cylinders; Cummins identifies the 37.7 L KTA38GC platform as a V12. |
| ENER-G Rudox LLC | FRDXB65.5MGS | 49.1 | 16 | displacement 65.37 L - EPA reports 49.1 L for a V16 family coded 65.5; the Rudox ERM1000GS datasheet identifies its Mitsubishi GS16R-PTK, and MHI publishes that V16 engine at 65.37 L. |
| Generac Power Systems, Inc. | JGNXB02.42N1 | 6.8 | 4 | displacement 2.4 L - EPA reports 6.8 L with four cylinders; Generac identifies the QT025A family as a 2.4 L inline-four and the family code itself contains 02.4. |
| Power Solutions International | APWRB18.3NGP | 14.6 | 10 | displacement 18.3 L - EPA reports 14.6 L; the family code and official PSI 18L catalog identify an 18.3 L V10 at approximately 422 kWm. |
| Power Solutions International, Inc. | APWRB18.3NGP | 14.6 | 10 | displacement 18.3 L - EPA reports 14.6 L; the family code and official PSI 18L catalog identify an 18.3 L V10 at approximately 422 kWm. |
| Power Solutions International, Inc. | BPWRB18.3NGP | 14.6 | 10 | displacement 18.3 L - EPA reports 14.6 L; the family code and official PSI 18L catalog identify an 18.3 L V10 at approximately 422 kWm. |
| Power Solutions International, Inc. | DPWRB18.3NGP | 14.6 | 10 | displacement 18.3 L - EPA reports 14.6 L; the family code and official PSI 18L catalog identify an 18.3 L V10 at 422 kWm. |
| Power Solutions International, Inc. | EPWRB18.3NGP | 14.6 | 10 | displacement 18.3 L - EPA reports 14.6 L; the family code and official PSI 18L catalog identify an 18.3 L V10 at 422 kWm. |
| Power Solutions International, Inc. | FPWRB18.3NGP | 14.6 | 10 | displacement 18.3 L - EPA reports 14.6 L; the family code and official PSI 18L catalog identify an 18.3 L V10 at 422 kWm. |
| Weichai America Corporation | PWCAB16.7GTA | 12.5 | 8 | displacement 16.7 L - EPA reports 12.5 L; the family code and official PSI 17L catalog identify a 16.7 L V8 at 460 kWm. |

## Documented Lineage Crosswalks

| Manufacturer | Root family | Catalog model | Catalog URL | Verification basis |
|---|---|---|---|---|
| Arrow Engine Company | MARWB05.4A54 | Arrow A54E | `/engines/arrow-a54e` | Arrow's A54E specification and EPA certification scope identify the same 5.4 L inline-six naturally aspirated platform. |
| Cummins Inc. | ECEXB02.4AAA | Cummins C20N6 | `/engines/cummins-c20n6` | Cummins Power Generation's EPA compliance statement identifies the C20N6, QSJ2.4 engine and ECEXB02.4AAA family directly. |
| Generac Power Systems, Inc. | EGNXB08.92C5 | Generac MGG100M | `/engines/generac-mgg100m` | Multiple independent equipment records identify MGG100M packages with a Generac 8.9 L V8 nameplate carrying EPA family EGNXB08.92C5, 150 hp and 1800 RPM. |
| Kubota Corporation | DKBXB02.52FM | Kubota WG2503-LN-E3 | `/engines/kubota-wg2503-ln-e3` | Kubota's WG2503-LN-E3 documentation and the EPA lineage identify the same 2.5 L inline-four naturally aspirated stationary platform. |
| Origin Engines | RORGB03.6PTA | Origin Engines 3.6L Turbo | `/engines/origin-engines-3-6l-turbo` | Origin's 3.6 L turbo generator configuration and EPA annual data identify the same 3.6 L inline-four turbocharged platform. |

## Manufacturer Baseline

| EPA manufacturer | Database brand | Annual families | Carryover lineages | Stationary lineages | Stationary strong candidates | Stationary other candidates | Researched exceptions | Stationary no candidate | Stationary unmapped |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Generac Power Systems, Inc. | Generac | 511 | 101 | 87 | 86 | 0 | 1 | 0 | 0 |
| Power Solutions International, Inc. | PSI | 152 | 35 | 27 | 26 | 0 | 1 | 0 | 0 |
| Caterpillar Inc. | Caterpillar | 91 | 34 | 27 | 27 | 0 | 0 | 0 | 0 |
| Cummins Inc. | Cummins | 202 | 27 | 20 | 20 | 0 | 0 | 0 | 0 |
| Discovery Energy, LLC. | Kohler | 69 | 22 | 6 | 6 | 0 | 0 | 0 | 0 |
| Guascor Energy S.A.U. | Guascor | 64 | 15 | 15 | 15 | 0 | 0 | 0 | 0 |
| Origin Engines | Origin Engines | 48 | 13 | 7 | 7 | 0 | 0 | 0 | 0 |
| Rolls-Royce Solutions America Inc | MTU | 74 | 13 | 10 | 8 | 0 | 2 | 0 | 0 |
| Zenith Power Products | Zenith Power Products | 30 | 7 | 7 | 6 | 0 | 1 | 0 | 0 |
| Weichai America Corporation | PSI, Weichai | 27 | 6 | 4 | 4 | 0 | 0 | 0 | 0 |
| 2G Heek GmbH | 2G | 17 | 5 | 5 | 5 | 0 | 0 | 0 | 0 |
| ENER-G Rudox LLC | ENER-G, MAN, Mitsubishi | 14 | 5 | 5 | 5 | 0 | 0 | 0 | 0 |
| INNIO Waukesha Gas Engines Inc. | Waukesha | 22 | 5 | 5 | 4 | 0 | 1 | 0 | 0 |
| Mesa Natural Gas Solutions, LLC | Mesa | 11 | 5 | 5 | 5 | 0 | 0 | 0 | 0 |
| IMPCO Technologies, Inc. | IMPCO | 20 | 4 | 4 | 4 | 0 | 0 | 0 | 0 |
| KEM Equipment, Inc. | KEM | 20 | 4 | 1 | 1 | 0 | 0 | 0 | 0 |
| Westerbeke Corporation | Unmapped | 15 | 4 | 0 | 0 | 0 | 0 | 0 | 0 |
| Arrow Engine Company | Arrow | 14 | 3 | 2 | 2 | 0 | 0 | 0 | 0 |
| INNIO Jenbacher GmbH & CO OG | Jenbacher | 20 | 3 | 3 | 3 | 0 | 0 | 0 | 0 |
| Power Solutions International | PSI | 9 | 3 | 3 | 3 | 0 | 0 | 0 | 0 |
| DNGV Co., Ltd. | DNGV | 3 | 2 | 2 | 2 | 0 | 0 | 0 | 0 |
| Deutz AG | Deutz | 17 | 2 | 2 | 2 | 0 | 0 | 0 | 0 |
| Tennessee Propulsion Products, LLC | Isuzu | 7 | 2 | 1 | 1 | 0 | 0 | 0 | 0 |
| AB Volvo Penta | Volvo Penta | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| Baseline Energy Services, LP | PSI | 2 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| Enchanted Rock, LLC | Mesa | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| Gridiron, LLC | Unmapped | 1 | 1 | 1 | 0 | 0 | 1 | 0 | 0 |
| Kubota Corporation | Kubota | 4 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| Scale Microgrid Solutions Operating, LLC | MAN | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| Tecogen | Origin Engines, Tecogen | 10 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| Yanmar Power Technology Co., Ltd. | Yanmar | 11 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |

## Recent Discovery Queue

These 2024+ stationary lineages have no same-brand displacement, cylinder and aspiration-compatible candidate or use an unmapped certification manufacturer. Mobile-only certification lineages are excluded.

| Latest year | Manufacturer | Root family | Stationary test | Displacement L | Cylinders | Max power kW | Status |
|---:|---|---|---|---|---|---|---|
| - | None | None | - | - | - | - | - |

## Remaining Stationary Research Exceptions

These 7 researched stationary lineages have been investigated and deliberately quarantined. They are not claimed as catalog matches because available evidence is insufficient or conflicts with the nearest model. Any remaining unresearched gaps also appear here.

| Latest year | Manufacturer | Root family | Displacement L | Cylinders | Max power kW | EPA test numbers | Status | Research finding |
|---:|---|---|---|---|---|---|---|---|
| 2026 | INNIO Waukesha Gas Engines Inc. | TDRSB24.0LTP | 24.0 | 8 | 550 | TDRSBM0091275, TDRSBM0091276, TDRSBM0091277, TDRSBM0091278, TDRSBM0091279 | researched_configuration_exception | INNIO's official Waukesha power-rating guide publishes current 24 L H24 generator-drive ratings of 400 or 440 kWb at 1800 RPM. The EPA lineage reaches 550 kW and includes mobile and stationary test modes, so the catalog H24 models cannot be claimed as this lineage without a matching certificate or calibration sheet. |
| 2026 | Power Solutions International, Inc. | SPSIB04.3TNP | 4.3 | 6 | 75, 89.6 | SPSIBM0082615, SPSIBM0082616, SPSIBM0082617, SPSIBM0082618, SPSIBM0082619, SPSIBM0082620, TPSIBM0083695, TPSIBM0083696, TPSIBM0083697, TPSIBM0083698, TPSIBM0083699, TPSIBM0083700 | researched_configuration_exception | PSI's current stationary owner manual acknowledges a 4.3 L V6 turbo configuration, but its public power-systems catalog and downloadable 4.3 L generator sheet publish only the naturally aspirated 61 kW model. This 2025-2026 EPA lineage is explicitly turbocharged and reaches 75 and 89.6 kW, so it remains quarantined until PSI publishes a commercial model and stationary rating sheet. |
| 2023 | Gridiron, LLC | PGRIB02.2CHP | 2.2 | 4 | 30.2 | PGRIBM0067615, PGRIBM0067616, PGRIBM0067617 | researched_configuration_exception | DOE CHP eCatalog identifies Gridiron PowerPlant H24 and HA65 packages and says they use purpose-built gaseous engines, but it does not publish an engine model or enough configuration data to crosswalk this 2.2 L family. |
| 2022 | Rolls-Royce Solutions America Inc | DMDDB06.8GBX | 6.8 | 10 | 89.4 | DMDDBM0013495, DMDDBM0013496, FMDDBM0019659, FMDDBM0019660, GMDDBM0028235, GMDDBM0028236, HMDDBM0031382, HMDDBM0031383, JMDDBM0036406, JMDDBM0036407, KMDDBM0041814, KMDDBM0041815, LMDDBM0047902, LMDDBM0047903, MMDDBM0054947, MMDDBM0054948, NMDDBM0060866, NMDDBM0060867 | researched_configuration_exception | The cataloged MTU 10V0068 GS100 is turbocharged, while EPA identifies this 6.8 L V10 lineage as naturally aspirated. A historical MTU specification or certificate is required before adding the model. |
| 2018 | Generac Power Systems, Inc. | GGNXB08.92C6 | 8.9 | 8 | 69.19 | GGNXBM0029320, GGNXBM0029321, GGNXBM0029322, GGNXBM0029323, HGNXBM0034070, HGNXBM0034071, HGNXBM0034072, HGNXBM0034073, JGNXBM0035211, JGNXBM0035212, JGNXBM0035213, JGNXBM0035214 | researched_configuration_exception | The closest catalog configuration is Generac's naturally aspirated 8.9 L SG080, but its published 91 kWm rating is 31.5% above the EPA family's 69.19 kW node. Searches of Generac documentation and archived equipment records did not identify a commercial model for GGNXB08.92C6, so the family remains quarantined. |
| 2015 | Zenith Power Products | EZPPB12.9TAC | 12.9 | 6 | 280 | EZPPBM0020198, EZPPBM0020199, EZPPBM0020200, EZPPBM0020201, FZPPBM0022608, FZPPBM0022609, FZPPBM0022610 | researched_configuration_exception | Zenith's published TA6120 is an 11.8 L engine and its EPA lineage starts in 2017. It must not be used as a substitute for this distinct 2014-2015 12.9 L family without a historical certificate or manual. |
| 2014 | Rolls-Royce Solutions America Inc | EMDDB06.8GBX | 6.8 | 10 | 89.4 | EMDDBM0016706, EMDDBM0016707 | researched_configuration_exception | The cataloged MTU 10V0068 GS100 is turbocharged, while EPA identifies this 2014 6.8 L V10 family as naturally aspirated. A historical MTU specification or certificate is required before adding the model. |

## Recent Mobile-Only Exclusions

These 2024+ lineages lack a same-brand catalog configuration candidate, but the EPA workbook classifies them only under mobile, marine, or small-SI equipment test modes. They are intentionally excluded from generator-engine coverage until a separate manufacturer source documents a stationary or generator application.

| Latest year | Manufacturer | Root family | Displacement L | Cylinders | Max power kW | EPA application/test mode | Status |
|---:|---|---|---|---|---|---|---|
| 2026 | Arrow Engine Company | RARWB03.1STA | 3.1 | 3 | 74 | Part 1054 Phase 1 Class II | mapped_manufacturer_no_configuration_candidate |
| 2026 | Cummins Inc. | NCEXB05.9ARC | 5.9 | 6 | 63.2 | Part 1054 Phase 1 Class II, Part 90 Phase 1 | mapped_manufacturer_no_configuration_candidate |
| 2026 | Discovery Energy, LLC. | KKHXB06.2NLP | 6.2 | 8 | 77.5 | Part 1054 Phase 1 Class II, Part 90 Phase 1 | mapped_manufacturer_no_configuration_candidate |
| 2026 | Discovery Energy, LLC. | MKHXB2.237NA | 2.2 | 4 | 28.3, 30.3 | Part 1054 Phase 1 Class II, Part 90 Phase 1 | mapped_manufacturer_no_configuration_candidate |
| 2026 | Discovery Energy, LLC. | SKHXB02.2HNL | 2.2 | 4 | 52 | Part 1054 Phase 1 Class II | mapped_manufacturer_no_configuration_candidate |
| 2026 | Discovery Energy, LLC. | SKHXB02.2TNL | 2.2 | 4 | 54 | Part 1054 Phase 1 Class II | mapped_manufacturer_no_configuration_candidate |
| 2026 | Discovery Energy, LLC. | TKHXB02.2CNL | 2.2 | 4 | 52 | Part 1054 Phase 1 Class II | mapped_manufacturer_no_configuration_candidate |
| 2026 | KEM Equipment, Inc. | JKEMB04.0OBD | 4.0 | 4 | 42 | Mobile Part 1048 | mapped_manufacturer_no_configuration_candidate |
| 2026 | KEM Equipment, Inc. | SKEMB07.3OBD | 7.3 | 4 | 146.5 | Mobile Part 1048 | mapped_manufacturer_no_configuration_candidate |
| 2026 | Power Solutions International, Inc. | SPSIB04.3EMT | 4.3 | 6 | 51, 75, 96.5 | Part 1054 Phase 1 Class II | mapped_manufacturer_no_configuration_candidate |
| 2026 | Rolls-Royce Solutions America Inc | HMDDB02.5GBV | 2.5 | 4 | 47.8 | Part 1054 Phase 1 Class II, Part 90 Phase 1 | mapped_manufacturer_no_configuration_candidate |
| 2026 | Rolls-Royce Solutions America Inc | HMDDB02.5GBX | 2.5 | 4 | 35.8 | Part 1054 Phase 1 Class II, Part 90 Phase 1 | mapped_manufacturer_no_configuration_candidate |
| 2026 | Westerbeke Corporation | MX7XB2.182MP | 2.2 | 4 | 26 | Mobile Part 1048 | unmapped_manufacturer |
| 2024 | Discovery Energy, LLC. | GKHXB2.237DT | 2.2 | 4 | 45, 47.6, 47.8 | Part 1054 Phase 1 Class II, Part 90 Phase 1 | mapped_manufacturer_no_configuration_candidate |

## Next Step

Resolve the remaining stationary research exceptions by opening the corresponding EPA certificate or manufacturer certification listing. Add or crosswalk a model only when the exact commercial identity, fuel, displacement, power node and stationary/generator application agree.
