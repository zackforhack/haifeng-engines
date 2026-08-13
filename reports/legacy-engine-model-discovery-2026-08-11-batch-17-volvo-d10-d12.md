# Legacy Engine Model Discovery - Batch 17 Volvo D10/D12

Date: 2026-08-11

## Result

- Source-validated Volvo Penta D10/D12 legacy candidates reviewed: `15`
- Already present before import: `0`
- New rows inserted: `15`
- Engine count after import: `3457`
- Legacy PDF/manual coverage after import: `147/488`

## Inserted Rows

| Brand | Model | Series | Status | Power kW | Displacement L | RPM |
| --- | --- | --- | --- | ---: | ---: | ---: |
| Volvo Penta | TAD1030GE | Legacy D10 Power Generation | discontinued |  | 9.6 | 1500 |
| Volvo Penta | TAD1031G | Legacy D10 Power Generation | discontinued |  | 9.6 | 1500 |
| Volvo Penta | TAD1031GE | Legacy D10 Power Generation | discontinued |  | 9.6 | 1500 |
| Volvo Penta | TAD1032GE | Legacy D10 Power Generation | discontinued | 235 | 9.6 | 1800 |
| Volvo Penta | TAD1230G | Legacy D12 Power Generation | discontinued | 294 | 11.98 | 1500 |
| Volvo Penta | TAD1230GE | Legacy D12 Power Generation | discontinued | 294 | 11.98 | 1500 |
| Volvo Penta | TAD1230P | Legacy D12 Power Generation | discontinued | 294 | 11.98 | 1500 |
| Volvo Penta | TAD1230V | Legacy D12 Industrial | discontinued | 295 | 11.98 | 2100 |
| Volvo Penta | TAD1231GE | Legacy D12 Power Generation | discontinued | 260 | 11.98 | 1500 |
| Volvo Penta | TAD1232GE | Legacy D12 Power Generation | discontinued | 300 | 11.98 | 1500 |
| Volvo Penta | TWD1210V | Legacy D12 Industrial | discontinued | 193 | 11.98 | 2100 |
| Volvo Penta | TWD1211V | Legacy D12 Industrial | discontinued | 232 | 11.98 | 2100 |
| Volvo Penta | TWD1230V | Legacy D12 Industrial | discontinued | 295 | 11.98 | 2100 |
| Volvo Penta | TWD1230VE | Legacy D12 Industrial VE | discontinued | 295 | 11.98 | 2100 |
| Volvo Penta | TWD1231VE | Legacy D12 Industrial VE | discontinued | 247 | 11.98 | 2100 |

## Validation Sources

- Volvo Group TAD1032GE power-generation release: https://www.volvogroup.com/en/news-and-media/news/2002/jan/news-20587.html
- ManualsLib Volvo Penta TD/TAD/TWD 10-liter workshop manual index: https://www.manualslib.es/manual/298480/Volvo-Penta-Td1030Me.html?page=128
- PDFCoffee Volvo Penta 10-liter service and technical-data mirror: https://pdfcoffee.com/tad740-1032-1630-1631-amp-twd740-1210-1232-1630-pdf-free.html
- Manualzz Volvo Penta D12 workshop manual mirror: https://manualzz.com/doc/6324077/volvo-penta-tad1240-ge--tad1241-ge-ve--tad1242-ge-ve--twd...
- Manualzz Volvo Penta D12 technical-description mirror: https://manualzz.com/doc/html/54992456/volvo-penta-tad1240ge--tad1242ve--twd1240ve-technical-des...
- K MOTORSHOP Volvo Penta engine cross-reference list: https://www.kmotorshop.com/en/device/motor-list/5051
- Volvo Penta industrial power generation product archive: https://www.volvopenta.com/en-us/industrial/power-generation-engines/power-generation-engine-range/power-gen-product-archive/

## Notes

- This batch is limited to Volvo Penta industrial and generator-drive D10/D12 rows; no marine propulsion-only TAMD/TMD rows are included.
- TWD1210G and TWD1211G were reviewed but intentionally excluded because batch 08 already added those rows; the V/VE industrial siblings are included here as separate legacy owner-search targets.
- TAD1032GE has official Volvo Group launch evidence for exact model, 10-liter displacement, 235 kW at 1800 rpm, and EPA Tier 2 context.
- TAD1030GE, TAD1031G, and TAD1031GE are model-identity rows backed by Volvo Penta workshop/service-manual indexes; rating fields remain blank until exact public rating tables are attached.
- D12 power and displacement values come from cross-reference listings and manual-family validation; TAD1230G/GE/P/V, TAD1231GE, TAD1232GE, TWD1210V, TWD1211V, TWD1230V/VE, and TWD1231VE are treated as separate legacy owner-search targets.
