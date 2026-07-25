# EPA Expansion Batch 32

## Scope

This batch resolves all constant-speed EPA records filed under
`KUKJE MACHINERY CO., LTD`.

- KUKJE constant-speed certification records reviewed: **6**
- New exact KUKJE generator-engine pages inserted: **6**
- Remaining unmatched KUKJE constant-speed records: **0**
- Remaining unmapped-manufacturer constant-speed records: **34**

## New KUKJE Pages

| Series | Models |
| --- | --- |
| A Series | `A1100-Gen`, `A1700-Gen`, `A2300-Gen`, `A2300T-Gen`, `A2400T-Gen1` |
| D Series | `D3400T-Gen1` |

The EPA model names explicitly identify generator configurations. The pages
retain exact displacement, aspiration, 1800 RPM mechanical output and
certification tier rather than merging them into similarly named tractor
engines.

An independent generator selection catalog also lists the KUKJE A1700, A2300
and A2300T generator families at 1800 RPM:

- [Dassen generator catalog with KUKJE ratings](https://www.dassen.co.kr/download/catalog.pdf)

EPA annual certification data remains the authority for the emissions labels
stored in the database.

## Verification

- Supabase export after insertion: **2,553 engines**
- KUKJE constant-speed records represented: **6 of 6**
- Remaining unmapped-manufacturer constant-speed records: **34**

Primary data source: EPA Annual Certification Data for Vehicles, Engines, and
Equipment, `nonroad-compression-ignition-2011-present (1).xlsx`.
