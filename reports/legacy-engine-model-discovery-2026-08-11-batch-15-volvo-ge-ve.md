# Legacy Engine Model Discovery - Batch 15 Volvo GE/VE

Date: 2026-08-11

## Result

- Source-validated Volvo Penta GE/VE candidates reviewed: `8`
- Already present before import: `0`
- New rows inserted: `8`
- Exact PDFs linked: `3`
- Exact PDF links skipped as existing: `0`
- Engine count after import: `3408`
- Legacy PDF/manual coverage after import: `147/439`

## Inserted Rows

| Brand | Model | Series | Status | Power kW | Displacement L | RPM | PDF |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Volvo Penta | TD520GE | Early D5 Power Generation | discontinued | 89 | 4.76 | 1800 | https://www.volvopenta-mexico.com.mx/generacion/TD520GE.pdf |
| Volvo Penta | TAD520GE | Early D5 Power Generation | discontinued | 101 | 4.76 | 1800 | https://www.raad-eng.com/techdata/volvo/prodbull/tad520ge.pdf |
| Volvo Penta | TD520VE | Early D5 Industrial VE | discontinued |  | 4.76 | 2300 |  |
| Volvo Penta | TD720GE | Early D7 Power Generation | discontinued | 134 | 7.15 | 1800 |  |
| Volvo Penta | TAD720GE | Early D7 Power Generation | discontinued | 154 | 7.15 | 1800 | https://www.raad-eng.com/techdata/volvo/prodbull/tad720ge.pdf |
| Volvo Penta | TD720VE | Early D7 Industrial VE | discontinued |  | 7.15 | 2300 |  |
| Volvo Penta | TAD722VE | Early D7 Industrial VE | discontinued | 200 | 7.15 | 2300 |  |
| Volvo Penta | TAD730GE | Early D7 Power Generation | discontinued | 136 | 7.15 | 1800 |  |

## Datasheet Attachments

| Engine | Source sheet | Storage path |
| --- | --- | --- |
| TD520GE | https://www.volvopenta-mexico.com.mx/generacion/TD520GE.pdf | volvo/legacy/ge-ve-batch-15/td520ge-volvo-penta-mexico-datasheet.pdf |
| TAD520GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad520ge.pdf | volvo/legacy/ge-ve-batch-15/tad520ge-raad-product-bulletin.pdf |
| TAD720GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad720ge.pdf | volvo/legacy/ge-ve-batch-15/tad720ge-raad-product-bulletin.pdf |

## Validation Sources

- https://manualzz.com/doc/4422352/volvo-penta-tad530--tad620--tad720--tad730--td520--td720-...
- https://manualzz.com/doc/44056997/volvo-penta-td520-ge--ve--tad520-ge--ve--tad530-ge--tad53...
- https://www.volvopenta.com/about-us/news-page/2003/may/news-20664/
- https://www.volvopenta.com/en-us/industrial/power-generation-engines/power-generation-engine-range/power-gen-product-archive/
- https://www.volvopenta-mexico.com.mx/motores-generacion-electrica/
- https://www.raad-eng.com/techdata/volvo/engines/tad520ge.html
- https://www.raad-eng.com/techdata/volvo/engines/tad720ge.html

## Notes

- This batch is limited to Volvo Penta industrial and power-generation GE/VE rows; marine-only TAMD/TMD/KAD records are intentionally excluded.
- `TD520GE`, `TD720GE`, and `TAD730GE` are validated from the Volvo Penta 4-7 Liter EDC4 operator manual tables.
- `TAD520GE` and `TAD720GE` are validated against exact RAAD archived Volvo Penta genset product bulletins and the Volvo Penta workshop-manual model list.
- `TD520VE` and `TD720VE` are added with conservative fields only: model identity, displacement family, cylinder count, and industrial configuration are source-backed, but power ratings are left blank until an exact rated-output source is found.
- `TAD722VE` is validated by Volvo Penta's 2003 launch release and the Volvo Penta operator manual table. The 200 kW row represents the mid rating; the official release also mentions 180 kW and 220 kW versions.
