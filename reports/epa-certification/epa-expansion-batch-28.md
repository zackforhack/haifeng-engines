# EPA Expansion Batch 28

## Scope

This batch closes the 2012 mapped-brand, constant-speed review tier from the
EPA Annual Certification Data workbook.

- EPA certification records reviewed: **39**
- New engine pages inserted: **21**
- Reviewed single-model aliases added: **15**
- Reviewed Lister Petter certification groups added: **7**
- Remaining 2012 mapped-brand constant-speed queue: **0**

## New Engine Pages

| Brand | Models |
| --- | --- |
| Caterpillar | `3516C-HD` |
| John Deere | `6068H` |
| Deutz | `D914L03` |
| Kohler | `KDW1603GE (1800 RPM)`, `KDW2204TGE` |
| Isuzu | `BU-4JJ1T` |
| Kubota | `V2003-M-BG-ET`, `V2003-M-T-BG-ET`, `V2403-M-BG-ET` |
| Lister Petter | `LPWS2`, `LPWS3`, `LPWS4`, `LPWST4` |
| Hatz | `3M41Z`, `4M41Z`, `4M42`, `4M42Z` |
| Yanmar | `3CA1-G`, `3TNM72-G` |
| Xinchai | `A498BZD1`, `A498BZD2` |

## Reviewed Cross-References

- Kohler `LDW1603GE` and `LDW2204TGE` are historical Lombardini names for
  the equivalent KDW certification configurations.
- Isuzu `BV-4LE1`, `BV-4LE1T` and `BV-4LE2` map to the existing
  `KV-4LE1`, `KV-4LE1T` and `LV-4LE2` pages with matching displacement,
  certified power and emissions tier.
- Five Kubota `BG-ET` certification names map to existing commercial
  generator-drive pages with matching engine family, displacement and Tier 4
  status.
- Yanmar `3CB1-G`, `3JTGA`, `3JTGAK`, `3KNGA` and `3MTGAK` map to reviewed
  commercial or exact certification pages with matching displacement, power
  class and emissions tier.

## Lister Petter Certification Groups

EPA model values `408`, `418`, `443`, `458`, `468`, `474` and `479` are
certification-group identifiers. The workbook's `Engine Code` field identifies
the actual engines:

| EPA group | Required catalog models |
| --- | --- |
| `418` | `LPWS2` |
| `468` | `LPWS2`, `LPWS3`, `LPWS4` |
| `408`, `443`, `458`, `474`, `479` | `LPWS2`, `LPWS3`, `LPWS4`, `LPWST4` |

The analyzer now marks one of these groups represented only when every required
commercial model exists. This avoids creating duplicate pages named after
certification-group numbers.

## Verification

- Supabase export after insertion: **2,524 engines**
- EPA 1800 RPM source rows: **15,773**
- Distinct EPA manufacturer/model combinations: **970**
- Mapped-manufacturer represented coverage: **75.8%**
- 2012 mapped-brand constant-speed queue: **0**

Source: EPA Annual Certification Data for Vehicles, Engines, and Equipment,
`nonroad-compression-ignition-2011-present (1).xlsx`.
