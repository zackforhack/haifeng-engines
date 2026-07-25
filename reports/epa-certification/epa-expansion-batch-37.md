# EPA Expansion Batch 37

## Scope

This batch resolves all constant-speed EPA records filed under
`Yangdong Co., Ltd.`.

- Yangdong constant-speed certification records reviewed: **4**
- New exact Yangdong generator-engine pages inserted: **4**
- Remaining unmatched Yangdong constant-speed records: **0**
- Remaining unmapped-manufacturer constant-speed records: **10**

## New Yangdong Pages

| Models | EPA certification |
| --- | --- |
| `YD385ZLD`, `YD480ZLD` | Tier 4 Final |
| `YND485ZLD`, `YSD490ZLD` | Interim Tier 4 |

All four are turbocharged, air-aftercooled, liquid-cooled generator engines
certified at 1800 RPM. The EPA workbook identifies electronic EGR on the
YSD490ZLD family and no exhaust aftertreatment device on these records.

The `YND485ZLD` changed physical configuration under the same model name:
EPA data lists 2.043 L with an 85 x 90 mm bore and stroke in 2011, then
2.156 L with an 85 x 95 mm bore and stroke in 2012. The database page uses
the latest 2012 displacement and documents both configurations.

Yangdong's generator-engine catalog corroborates its 1500/1800 RPM product
program and the YD385 family's 1.532 L three-cylinder configuration:

- [Yangdong generator diesel engines](https://www.yangdong.net/)
- [Yangdong YD385 generator engine specifications](https://www.yangdong.net/other-engines/385-diesel-engine/385-generator-diesel-engine.html)

EPA annual certification data remains the authority for the exact ZLD
models, ratings and emissions labels.

## Verification

- Supabase export after insertion: **2,577 engines**
- Yangdong constant-speed records represented: **4 of 4**
- Remaining unmapped-manufacturer constant-speed records: **10**

Primary data source: EPA Annual Certification Data for Vehicles, Engines, and
Equipment, `nonroad-compression-ignition-2011-present (1).xlsx`.
