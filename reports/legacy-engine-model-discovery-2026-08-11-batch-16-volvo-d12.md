# Legacy Engine Model Discovery - Batch 16 Volvo D12

Date: 2026-08-11

## Result

- Source-validated Volvo Penta D12 legacy candidates reviewed: `5`
- Already present before import: `0`
- New rows inserted: `5`
- Engine count after import: `3442`
- Legacy PDF/manual coverage after import: `147/473`

## Inserted Rows

| Brand | Model | Series | Status | Power kW | 50 Hz Prime/Standby kWm | 60 Hz Prime/Standby kWm | Displacement L | RPM |
| --- | --- | --- | --- | ---: | --- | --- | ---: | ---: |
| Volvo Penta | TAD1240GE | D12 Power Generation | discontinued | 310 | 260/ | /304 | 12.13 | 1800 |
| Volvo Penta | TAD1241GE | D12 Power Generation | discontinued | 323 | 300/ | /352 | 12.13 | 1800 |
| Volvo Penta | TAD1242GE | D12 Power Generation | discontinued | 352 | 352/387 | 391/430 | 12.13 | 1800 |
| Volvo Penta | TAD1241VE | D12 Industrial VE | discontinued | 343 | / | / | 12.13 | 1800 |
| Volvo Penta | TAD1242VE | D12 Industrial VE | discontinued | 383 | / | / | 12.13 | 1800 |

## Validation Sources

- Volvo Group D12 industrial launch release: https://www.volvogroup.com/en/news-and-media/news/2001/apr/news-20561.html
- Manualzz Volvo Penta D12 workshop manual mirror: https://manualzz.com/doc/6324077/volvo-penta-tad1240-ge--tad1241-ge-ve--tad1242-ge-ve--twd...
- ManualsLib Volvo Penta TAD1240GE installation manual index: https://www.manualslib.com/manual/4542784/Volvo-Penta-Tad1240ge.html
- Manualzz Volvo Penta TAD1242GE technical description mirror: https://manualzz.com/doc/html/54992456/volvo-penta-tad1240ge--tad1242ve--twd1240ve-technical-des...
- Scribd-indexed Volvo Penta TAD1241GE technical data: https://www.scribd.com/document/360166778/TAD1241GE-pdf
- Scribd-indexed Volvo Penta TAD1241VE technical data: https://www.scribd.com/document/303570281/Engine-Datasheet
- K MOTORSHOP Volvo Penta engine cross-reference list: https://www.kmotorshop.com/en/device/motor-list/5051
- Volvo Penta industrial power generation product archive: https://www.volvopenta.com/en-us/industrial/power-generation-engines/power-generation-engine-range/power-gen-product-archive/

## Notes

- This batch is limited to Volvo Penta D12 industrial and power-generation engines; no marine propulsion-only rows are included.
- The official Volvo Group 2001 release validates the D12 industrial launch, TWD1240VE context, the TAD1240/1241/1242GE power-generation designations, ratings, and EPA/CARB Tier II / TA-Luft emissions context.
- Manualzz and ManualsLib mirrors validate the exact D12 service-manual coverage for TAD1240GE, TAD1241GE/VE, TAD1242GE/VE, and TWD1240VE.
- TAD1241GE, TAD1241VE, TAD1242GE, and TAD1242VE rating fields are cross-checked against indexed technical-data or engine cross-reference pages; fields are kept conservative where exact official rated-output tables were not publicly exposed.
- Volvo Penta's current industrial power-generation archive only lists later D5/D7 archive ranges in the browsed result, supporting legacy/discontinued treatment for these older D12 rows.
