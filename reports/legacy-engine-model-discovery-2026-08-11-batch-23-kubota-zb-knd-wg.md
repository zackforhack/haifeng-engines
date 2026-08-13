# Legacy Engine Model Discovery - Batch 23 Kubota ZB/KND/WG

Date: 2026-08-11

## Result

- Source-validated Kubota ZB/KND/WG discontinued candidates reviewed: `10`
- Already present before import: `0`
- New rows inserted: `10`
- Engine count after import: `3437`
- Legacy PDF/manual coverage after import: `147/468`

## Inserted Rows

| Brand | Model | Series | Status | Fuel | Cyl | Displacement L |
| --- | --- | --- | --- | --- | ---: | ---: |
| Kubota | ZB400 | ZB Series | discontinued | Diesel | 2 | 0.4 |
| Kubota | ZB500 | ZB Series | discontinued | Diesel | 2 | 0.5 |
| Kubota | ZB600 | ZB Series | discontinued | Diesel | 2 | 0.6 |
| Kubota | KND600 | KND Series | discontinued | Diesel | 1 |  |
| Kubota | KND700 | KND Series | discontinued | Diesel | 1 |  |
| Kubota | KND800 | KND Series | discontinued | Diesel | 1 |  |
| Kubota | KND900 | KND Series | discontinued | Diesel | 1 |  |
| Kubota | KND1500 | KND Series | discontinued | Diesel | 1 |  |
| Kubota | DF1005 | WG/DF Gas Series | discontinued | Gasoline / Propane (LPG) | 3 | 1 |
| Kubota | WG1005 | WG/DF Gas Series | discontinued | Gasoline / Propane (LPG) | 3 | 1 |

## Validation Sources

- Kubota Engine Parts Direct manuals index: https://kubotaenginepartsdirect.com/manuals/
- Kubota Genuine Parts Catalog distributor revision: https://www.scribd.com/document/853905131/Kubota-Kits-Juntas-Pistones-etc-Genuine-Parts-Catalog-Distributor-Rev-May-2010-1
- Kubota Engine Discovery ZB400 gallery: https://discovery.engine.kubota.com/jp/gallery/zb400/
- Kubota model-number identification: https://engine.kubota.com/en/support/modelnumber/index.html
- Plough Book Sales Kubota old engine literature list: https://www.ploughbooksales.com.au/62.htm
- Kubota WG Series fuel-family page: https://engine.kubota.com/products/category?c=Kubota+WG+Series&ln=en

## Notes

- Kubota Engine Parts Direct explicitly labels ZB400, ZB500, ZB600, DF1005, and WG1005 as Discontinued Engine Series.
- KND rows are treated as legacy/discontinued because Kubota Genuine Parts Catalog validates the KND model spelling and old engine manual coverage, while Kubota Engine Parts Direct appears to list the same discontinued family with NKD spelling. These should be live-dry-run checked before apply.
- Kubota model-number guidance validates cylinder-code and fuel-code handling: Z = two-cylinder diesel, DF = gasoline/LPG dual fuel, and WG is the spark-ignited gas-engine family.
- KND displacement and power fields are intentionally left blank until a clean public specification table is available.
- No proprietary Kubota manual PDFs are attached or redistributed in this batch; the report links source pages only.
