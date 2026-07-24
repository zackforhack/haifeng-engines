# EPA-Certified Engine Expansion: Batch 01

This batch reviews 20 records from the 2024+ constant-speed priority queue in
`epa-1800rpm-model-match.json`. A model is inserted only when its commercial
identity, 1800 RPM capability, emissions status and technical specifications
are supported by both EPA certification data and an official manufacturer
source.

## Decisions

| EPA model | Brand | Decision | Database target | Reason |
|---|---|---|---|---|
| 3H50TICD | Hatz | Add new | `/engines/hatz-3h50ticd` | Distinct DPF-equipped commercial model; official 1500/1800 RPM constant-speed ratings |
| 4H50TICD | Hatz | Add new | `/engines/hatz-4h50ticd` | Distinct DPF-equipped commercial model; official 1500/1800 RPM constant-speed ratings |
| TWD1643GE | Volvo Penta | Add new | `/engines/volvo-penta-twd1643ge` | Official dual-speed generator model with published 50/60 Hz output |
| TWD1683GE-B | Volvo Penta | Defer | — | Official warranty and EPA identity confirmed, but no model-specific public rating sheet located |
| C9.3B | Caterpillar | Add new | `/engines/caterpillar-c9-3b` | Official 1800-2200 RPM industrial rating and Tier 4 Final documentation |
| C13B | Caterpillar | Add new | `/engines/caterpillar-c13b` | Official 1800-2100 RPM industrial rating and Tier 4 Final documentation |
| C32B | Caterpillar | Defer | — | EPA rows combine Tier 2/Tier 4 and multiple power ranges; exact generator configuration needs reconciliation |
| 1706J | Caterpillar | Defer | — | EPA-certified configuration found, but no matching commercial generator-drive sheet verified |
| 2206F | Caterpillar | Defer | — | EPA-certified configuration found, but no matching commercial generator-drive sheet verified |
| 2406J | Caterpillar | Defer | — | EPA-certified configuration found, but no matching commercial generator-drive sheet verified |
| KDI 3404TCR/70G | Kohler/Rehlko | Alias candidate | `kohler-kdi3404tcr` | Base engine exists; `/70G` is a certification/rating suffix and must not create a duplicate page |
| KDI 3404TM/G18 | Kohler/Rehlko | Defer | — | Distinct TM commercial base model is absent; official generator rating sheet still required |
| KDI 3404TM/G18A | Kohler/Rehlko | Defer | — | Certification trim of absent KDI3404TM base model |
| KDI 3404TM/G18B | Kohler/Rehlko | Defer | — | Certification trim of absent KDI3404TM base model |
| KDI 2504TM/G18 | Kohler/Rehlko | Defer | — | Distinct TM commercial base model is absent; official generator rating sheet still required |
| KDI1903M | Kohler/Rehlko | Defer | — | Commercial identity confirmed, but generator-drive output sheet still required |
| KDI1903ESM | Kohler/Rehlko | Defer | — | EPA record spans Tier 2 and Tier 4 families; exact configuration must be separated |
| QSK38-G | Cummins | Family represented | QSK38 series | EPA umbrella designation covers multiple commercial G-Drive ratings; do not create a generic duplicate |
| QSK50-G | Cummins | Family represented | QSK50 series | EPA umbrella designation covers multiple commercial G-Drive ratings; do not create a generic duplicate |
| QSB6.7 | Cummins | Defer | — | EPA base engine spans Tier 3, Interim Tier 4 and Tier 4 Final; existing G3 page is not an emissions-equivalent alias |

## Inserted-Record Sources

- EPA Annual Certification Data workbook, filtered to constant-speed 1800 RPM records.
- [Hatz H-Series official datasheet](https://www.hatz.com/images/downloads/downloadcenter/datasheets/Hatz_data_sheet_H-series_2022-10_en_70257173.pdf)
- [Volvo Penta TWD1643GE official product announcement](https://www.volvopenta.com/en-us/about-us/news-page/2006/dec/news-14066/)
- [Volvo Penta D16 power-generation brochure](https://www.volvopenta.com/-/media/volvopenta/home/pdfs-with-external-links-to-them/d16-power-gen-eng.pdf)
- [Cat C9.3B official product page](https://www.cat.com/en_GB/products/new/power-systems/industrial/industrial-diesel-power-units/1000022829.html)
- [Cat C9.3B official datasheet](https://emc.cat.com/n/api/pubdirect?media_string_id=MSS-IND-1000022860-004.pdf)
- [Cat C13B official product page](https://www.cat.com/en_US/products/new/power-systems/industrial/industrial-diesel-engines/89679639553.html)
- [Cat C13B official datasheet](https://emc.cat.com/pubdirect.ashx?media_string_id=LEHH0599-00.pdf)

## Guardrails

- EPA mechanical power is not converted into electrical kWe or kVA.
- Hatz ISO fuel-stop figures are stored as mechanical standby fields, not as
  electrical output.
- Cat industrial maximum power remains mechanical-only and is not presented as
  a generator-set electrical rating.
- Deferred records remain in the audit queue until a model-specific official
  source resolves the configuration.
