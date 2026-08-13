# Legacy Engine Model Discovery - Batch 19 Kubota Discontinued

Date: 2026-08-11

## Result

- Source-validated Kubota discontinued candidates reviewed: `20`
- Already present before import: `0`
- New rows inserted: `20`
- Engine count after import: `3485`
- Legacy PDF/manual coverage after import: `147/516`

## Inserted Rows

| Brand | Model | Series | Status | Fuel | Cyl | Displacement L |
| --- | --- | --- | --- | --- | ---: | ---: |
| Kubota | Z400 | Old Super Mini Series | discontinued | Diesel | 2 | 0.4 |
| Kubota | Z430 | Old Super Mini Series | discontinued | Diesel | 2 | 0.43 |
| Kubota | Z500 | Old Super Mini Series | discontinued | Diesel | 2 | 0.5 |
| Kubota | Z600 | Old Super Mini Series | discontinued | Diesel | 2 | 0.6 |
| Kubota | ZH600 | Old Super Mini Series | discontinued | Diesel | 2 | 0.6 |
| Kubota | D600 | Old Super Mini Series | discontinued | Diesel | 3 | 0.6 |
| Kubota | D640 | Old Super Mini Series | discontinued | Diesel | 3 | 0.64 |
| Kubota | D650 | Old Super Mini Series | discontinued | Diesel | 3 | 0.65 |
| Kubota | D750 | Old Super Mini Series | discontinued | Diesel | 3 | 0.75 |
| Kubota | D850 | Old Super Mini Series | discontinued | Diesel | 3 | 0.85 |
| Kubota | DH850 | Old Super Mini Series | discontinued | Diesel | 3 | 0.85 |
| Kubota | D950 | Old Super Mini Series | discontinued | Diesel | 3 | 0.95 |
| Kubota | V800 | Old Super Mini Series | discontinued | Diesel | 4 | 0.8 |
| Kubota | V1100 | Old Super Mini Series | discontinued | Diesel | 4 | 1.1 |
| Kubota | VH1100 | Old Super Mini Series | discontinued | Diesel | 4 | 1.1 |
| Kubota | V1200 | Old Super Mini Series | discontinued | Diesel | 4 | 1.2 |
| Kubota | WG600 | Legacy WG Gas Series | discontinued | Gasoline | 3 | 0.6 |
| Kubota | WG750 | Legacy WG Gas Series | discontinued | Gasoline | 3 | 0.75 |
| Kubota | DF750 | Legacy DF Gas Series | discontinued | Gasoline / Propane (LPG) | 3 | 0.75 |
| Kubota | DG750 | Legacy DG LPG Series | discontinued | Propane (LPG) | 3 | 0.75 |

## Validation Sources

- Kubota Genuine Parts Catalog distributor revision: https://www.scribd.com/document/853905131/Kubota-Kits-Juntas-Pistones-etc-Genuine-Parts-Catalog-Distributor-Rev-May-2010-1
- Kubota Engine Parts Direct manuals index: https://kubotaenginepartsdirect.com/manuals/
- GCIRON Kubota Z400/D600/V800 operator manual listing: https://www.gciron.com/Kubota_Parts_KU_19461_89163_OPR_MNL_Z400_D600_V800_p/ku-19461-89163.htm

## Notes

- This batch is limited to Kubota models with explicit non-current or discontinued source evidence.
- Kubota Genuine Parts Catalog separates current production from non-current production and defines Z/D/V cylinder-code logic; it also lists WG/DF/DG manual and parts-index rows.
- Kubota Engine Parts Direct explicitly labels the imported base models as Discontinued Engine Series.
- No proprietary Kubota manual PDFs are attached or redistributed in this batch; the report links source pages only.
- Fuel naming follows the project canonical vocabulary: LPG-facing rows use `Propane (LPG)`.
