# Bauer Generator Probe

Date: 2026-08-05

Source site: https://bauer-generator.de/

## Result

- Public WordPress sitemap checked: https://bauer-generator.de/page-sitemap.xml
- Public media API checked: https://bauer-generator.de/wp-json/wp/v2/media?search=pdf&per_page=100
- Exact Ricardo engine models found in Bauer GFS datasheet PDFs: `7`
- Already present before import: `0`
- New rows inserted: `7`
- Engine count after import: `3357`

- Bauer PDF datasheet links inserted: `8`
- Bauer PDF links already present: `0`

## Added / Planned Rows

| Brand | Model | Source generator datasheet | Power kW | Displacement L | Cylinders | RPM |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Ricardo | ZH490D | GFS-12 / GFS-16 | 22 | 2.54 | 4 | 1500 |
| Ricardo | ZH4100D | GFS-24 | 30.1 | 3.61 | 4 | 1500 |
| Ricardo | ZH4102ZD | GFS-40 | 44 | 3.76 | 4 | 1500 |
| Ricardo | ZH4105ZD | GFS-50 | 56 | 4.15 | 4 | 1500 |
| Ricardo | ZH6105ZLD | GFS-80 | 100 | 6.49 | 6 | 1500 |
| Ricardo | ZH6105AZLD | GFS-90 | 110 | 6.75 | 6 | 1500 |
| Ricardo | ZH6105IZLD | GFS-120 | 132 | 7.02 | 6 | 1500 |

## Quality Notes

- The GFS-6 and GFS-8 datasheets were intentionally not imported as engine models because Bauer gives only an 8 kW one-cylinder diesel description, not an exact engine model.
- Each linked Bauer PDF is text-validated before upload by checking that it contains the expected Ricardo engine model string.
- Bauer labels these engines as Non Emission Certified; database rows normalize that to `Unregulated`.
- Independent web cross-checks found the same Ricardo/Weifang model family and matching displacement/power ranges for ZH490, ZH4100/ZH4105, and ZH6105 variants.
