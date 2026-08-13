# Legacy Engine Model Discovery - Batch 31 Volvo Off-road Archive

Date: 2026-08-11

## Result

- Source-validated Volvo Penta off-road archive candidates reviewed: `5`
- Already present before import: `0`
- New rows inserted: `5`
- Engine count after import: `3542`
- Legacy PDF/manual coverage after import: `221/573`

## Inserted Rows

| Brand | Model | Series | Status | Cyl | Power kW | Displacement L |
| --- | --- | --- | --- | ---: | ---: | ---: |
| Volvo Penta | D9-500 | D9 Industrial Off-road | discontinued | 6 | 373 | 9.4 |
| Volvo Penta | D9-575 | D9 Industrial Off-road | discontinued | 6 | 429 | 9.4 |
| Volvo Penta | TAD1250VE | D12 Industrial VE | discontinued | 6 |  | 12.13 |
| Volvo Penta | TAD1251VE | D12 Industrial VE | discontinued | 6 |  | 12.13 |
| Volvo Penta | TAD1252VE | D12 Industrial VE | discontinued | 6 |  | 12.13 |

## Validation Sources

- Volvo Penta D9 official archive: https://www.volvopenta.com/industrial/industrial-engines/off-road-engine-range/off-road-product-archive/d9/
- Volvo Penta D12 official archive: https://www.volvopenta.com/industrial/industrial-engines/off-road-engine-range/off-road-product-archive/d12/

## Notes

- These are Volvo Penta official archive rows, not marine-only listings.
- D9 rows are added from the official D9 archive variants `D9-500` and `D9-575`, with the model suffix converted from horsepower to approximate kW for the searchable numeric field.
- TAD1250VE, TAD1251VE and TAD1252VE are added from the official D12 off-road archive variants. Exact per-variant kW fields are intentionally left blank until a first-party or clearly traceable technical sheet is attached.
- This batch improves source-validated model depth. It does not claim new PDF/datasheet coverage because Volvo's archive pages link users to support/manual search rather than a direct public PDF asset on the archive page.
