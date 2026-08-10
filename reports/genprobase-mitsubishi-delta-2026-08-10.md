# GenProBase Mitsubishi Delta

Date: 2026-08-10

Source: https://genprobase.com/api/products?all=1&page=1&pageSize=10000

## Result

- New GenProBase public product rows since the prior probe: `17` under source brand `三菱`
- Exact Mitsubishi rows already present in Haifeng: `14`
- Validated new rows inserted: `2`
- Engine count after import: `3359`

## Inserted Rows

| Brand | Model | Prime kWe 50 Hz | Standby kWe 50 Hz | Validation |
| --- | --- | ---: | ---: | --- |
| Mitsubishi | S12R-PTA3 | 1200 | 1300 | https://www.mhi.com/group/mhiesa/products/diesel-generator-sets/diesel-generator-sets-mgs1700r-2 |
| Mitsubishi | S16R-PTA3 | 1600 | 1800 | https://www.mhi.com/group/mhiesa/diesel-generator-480v-60hz-standby-3 |

## Held Candidate

| Brand | Model | Reason |
| --- | --- | --- |
| Mitsubishi | S16R-PTAA2-Y1 | GenProBase lists the model, but public validation found stronger evidence for the related S16R-Y1PTAA2 naming family than for this exact hyphenation. Hold until OEM or distributor evidence confirms the exact model string. |

## Notes

- GenProBase added a plain `三菱` bucket after the August 5 probe; the original importer already handled `上海菱重`.
- `三菱` is normalized to `Mitsubishi`; no Chinese brand label is inserted.
- `S12R-PTA3` and `S16R-PTA3` were cross-validated against public Mitsubishi Heavy Industries Engine System Asia pages before insertion.
- Existing comparison uses normalized `brand + model`; `-C` Shanghai-MHI variants are treated as separate variants and do not block exact Mitsubishi model rows.
- Already-present matching rows checked: `3357`.
