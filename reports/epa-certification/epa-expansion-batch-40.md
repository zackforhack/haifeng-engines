# EPA Expansion Batch 40

## Scope

This batch resolves the final unmapped constant-speed EPA records from
`Wuxi Kipor Power Co., Ltd.` and `ENER-G Rudox LLC`.

- Constant-speed certification records reviewed: **3**
- New exact engine pages inserted: **3**
- Remaining unmapped-manufacturer constant-speed records: **0**

## New Pages

| Brand | Model | EPA certification |
| --- | --- | --- |
| Kipor | `KD488ZA` | Interim Tier 4 |
| Kipor | `KD488ZAG` | Interim Tier 4 |
| Mitsubishi / ENER-G Rudox | `S16R-Y2PTAW2-1` | Tier 4 Final |

The two Kipor models share a 2.190 L inline-four turbocharged platform rated
27 kWm at 1800 RPM in model years 2011 and 2012. Kipor generator literature
corroborates the KD488ZA architecture, 88 x 90 mm bore and stroke, and 2.190 L
displacement:

- [Kipor KD488ZA generator specification](https://www.generadoreskipor.com/kipor-generadores-grupos-electrogenos/generadores-kipor-0150-generadores-diesel-1500-rpm030-KDE22S_.pdf)

The ENER-G Rudox record is a specific 2021 Tier 4 Final certification of the
Mitsubishi S16R-Y2PTAW2-1 at 2180 kWm and 1800 RPM. It is stored separately
from the standard Mitsubishi version because MHI's public specification lists
the base engine under a different emissions certification:

- [Official MHI S16R-Y2PTAW2 specification](https://engine-genset.mhi.com/hubfs/00.%20Website/02.%20Industrial/02.%20Products/Contant%20Speed/000.%20Documents/Mitsubishi%20Diesel%20Engine%20-%20S16R-Y2PTAW2.pdf?hsLang=en)

EPA annual certification data remains the authority for the Rudox Tier 4
Final label.

## Verification

- Supabase export after insertion: **2,585 engines**
- Unmapped constant-speed EPA records represented: **3 of 3**
- Remaining unmapped-manufacturer constant-speed records: **0**

Primary data source: EPA Annual Certification Data for Vehicles, Engines, and
Equipment, `nonroad-compression-ignition-2011-present (1).xlsx`.
