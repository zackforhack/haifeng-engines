# EPA Expansion Batch 29

## Scope

This batch closes the 2011 mapped-brand, constant-speed review tier from the
EPA Annual Certification Data workbook.

- EPA certification records reviewed: **7**
- New engine pages inserted: **3**
- Remaining 2011 mapped-brand constant-speed queue: **0**
- Remaining mapped-brand constant-speed queues from 2011 onward: **0**

## New Engine Pages

| Brand | Model | EPA-certified output |
| --- | --- | --- |
| Kubota | `V3800-DI-TI-BG-ET` | 68 kWm at 1800 RPM |
| Lovol | `D4ETA` | 78, 90 and 96 kWm at 1800 RPM |
| Lovol | `D6ETA` | 115, 124 and 129 kWm at 1800 RPM |

All three engine families are listed under U.S. EPA Tier 3.

## Matching Decision

The EPA workbook names the Lovol calibrations as `D4ETA/78/1800`,
`D4ETA/90/1800`, `D4ETA/96/1800`, `D6ETA/115/1800`,
`D6ETA/124/1800` and `D6ETA/129/1800`. The slash suffixes encode certified
power and speed, while the commercial engine families are `D4ETA` and
`D6ETA`.

The catalog therefore uses one page per engine family. The analyzer's reviewed
slash-suffix rule maps all six certification rows to the appropriate base
model. The Kubota configuration is retained as a separate exact page because
its direct-injection designation differs from the common-rail V3800 records.

## Verification

- Supabase export after insertion: **2,527 engines**
- EPA 1800 RPM source rows: **15,773**
- Distinct EPA manufacturer/model combinations: **970**
- Mapped-manufacturer represented coverage: **76.6%**
- 2011 mapped-brand constant-speed queue: **0**

Source: EPA Annual Certification Data for Vehicles, Engines, and Equipment,
`nonroad-compression-ignition-2011-present (1).xlsx`.
