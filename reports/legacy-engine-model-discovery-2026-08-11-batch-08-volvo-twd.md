# Legacy Engine Model Discovery - Batch 08 Volvo TWD

Date: 2026-08-11

## Result

- Source-validated Volvo Penta legacy TWD candidates reviewed: `9`
- Already present before import: `0`
- New rows inserted: `9`
- Engine count after import: `3388`

## Inserted Rows

| Brand | Model | Series | Power kW | 50 Hz Prime/Standby kWm | 60 Hz Prime/Standby kWm | Displacement L | RPM |
| --- | --- | --- | ---: | --- | --- | ---: | ---: |
| Volvo Penta | TWD610G | Legacy TWD Genset | 151 | 118/151 | 132/145 |  | 1500 |
| Volvo Penta | TWD710G | Legacy TWD Genset | 202 | 163/183 | 172/202 | 6.73 | 1500 |
| Volvo Penta | TWD740GE | Legacy TWD Genset | 239 | 189/207 | 218/239 | 7.28 | 1500 |
| Volvo Penta | TWD1010G | Legacy TWD Genset | 265 | 207/230 | 234/265 |  | 1500 |
| Volvo Penta | TWD1210G | Legacy TWD Genset | 318 | 272/298 | 287/318 | 11.98 | 1500 |
| Volvo Penta | TWD1211G | Legacy TWD Genset | 346 | 292/318 | 315/346 | 11.98 | 1500 |
| Volvo Penta | TWD1630G | Legacy TWD Genset | 451 | 364/403 | 397/451 | 16.12 | 1500 |
| Volvo Penta | TWD1630GE | Legacy TWD Genset | 501 | 413/453 | 456/501 | 16.12 | 1500 |
| Volvo Penta | TWD1240VE | Legacy TWD Industrial | 310 | / | / | 12.13 | 2100 |

## Validation Sources

- https://dhmecha.en.ec21.com/VOLVO_PENTA_DIESEL_ENGINE--27886_27893.html
- https://pdfcoffee.com/tad740-1032-1630-1631-amp-twd740-1210-1232-1630-pdf-free.html
- https://www.scribd.com/document/705062046/G330-DOOSAN-Ingersoll-Rand-1
- https://www.scribd.com/document/667034852/7734905
- https://manualzz.com/doc/6324077/volvo-penta-tad1240-ge--tad1241-ge-ve--tad1242-ge-ve--twd...
- https://manualzz.com/doc/o/8rrwe/volvo-penta-tad-1240ge--tad-1241ge-ve--tad-1242ge-ve--twd...-%3Cb%3Egeneral-information-%3C-b%3E
- https://sra-moteur.com/en/occasion/detail/65/twd1240ve

## Notes

- This batch is legacy industrial and generator-drive Volvo Penta TWD content only.
- Older generator horsepower values were converted to kWm with 1 hp = 0.7457 kW and rounded to the nearest kW.
- TWD1631GE is intentionally deferred: parts pages mention it, but I did not find enough model-specific rating/service-manual evidence to add it safely in this pass.
- No marine propulsion-only rows are included.
