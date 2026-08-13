# Legacy Engine Model Discovery - Batch 18 Volvo D16

Date: 2026-08-11

## Result

- Source-validated Volvo Penta D16 legacy candidates reviewed: `8`
- Already present before import: `0`
- New rows inserted: `8`
- Engine count after import: `3465`
- Legacy PDF/manual coverage after import: `147/496`

## Inserted Rows

| Brand | Model | Series | Status | Power kW | Displacement L | RPM |
| --- | --- | --- | --- | ---: | ---: | ---: |
| Volvo Penta | TAD1630G | Legacy D16 Power Generation | discontinued | 395 | 16.123 | 1500 |
| Volvo Penta | TAD1630GE | Legacy D16 Power Generation | discontinued | 395 | 16.123 | 1500 |
| Volvo Penta | TAD1630P | Legacy D16 Industrial | discontinued | 330 | 16.123 | 1800 |
| Volvo Penta | TAD1630V | Legacy D16 Industrial | discontinued | 330 | 16.123 | 1800 |
| Volvo Penta | TAD1631G | Legacy D16 Power Generation | discontinued | 435 | 16.123 | 1500 |
| Volvo Penta | TAD1631GE | Legacy D16 Power Generation | discontinued | 435 | 16.123 | 1500 |
| Volvo Penta | TWD1630P | Legacy D16 Industrial | discontinued | 288 | 16.123 | 1800 |
| Volvo Penta | TWD1630V | Legacy D16 Industrial | discontinued | 288 | 16.123 | 1800 |

## Validation Sources

- ManualsLib Volvo Penta TAD1630G workshop manual index: https://www.manualslib.com/manual/1840742/Volvo-Penta-Tad1630g.html
- Manualzz Volvo Penta TWD1630V workshop manual mirror: https://manualzz.com/doc/html/55752033/volvo-penta-td164kae--tid162ap--twd1620g--twd1630v-worksh...
- K MOTORSHOP Volvo Penta D16 engine cross-reference list: https://www.kmotorshop.com/en/device/motor-list/5051
- K MOTORSHOP MAHLE piston-ring application listing: https://www.kmotorshop.com/en/article-detail/view/155839/piston-ring-kit-037rs001460n0-mahle-3837146-877356
- Volvo Penta industrial power generation product archive: https://www.volvopenta.com/en-us/industrial/power-generation-engines/power-generation-engine-range/power-gen-product-archive/

## Notes

- This batch is limited to older Volvo Penta D16 industrial and generator-drive rows; marine-only TAMD/TMD rows are intentionally excluded.
- TWD1630G and TWD1630GE were reviewed but intentionally excluded because batch 08 already imported those rows.
- Exact model identity is validated by Volvo Penta workshop-manual indexes; power and displacement values come from K MOTORSHOP cross-reference rows and MAHLE application listings.
- Volvo Penta's current industrial archive does not expose this older TAD/TWD1630-1631 service family, supporting discontinued/legacy treatment.
