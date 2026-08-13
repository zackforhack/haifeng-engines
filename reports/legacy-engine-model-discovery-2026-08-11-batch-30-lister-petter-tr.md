# Legacy Engine Model Discovery - Batch 30 Lister Petter TR Series

Date: 2026-08-11

## Result

- Source-validated Lister Petter TR candidates reviewed: `3`
- Already present before import: `0`
- New rows inserted: `3`
- TR Series PDF documents reviewed: `2`
- Datasheet/manual links inserted: `6`
- Links skipped as existing: `0`
- Missing document target rows: `0`
- Engine count after import: `3537`
- Legacy PDF/manual coverage after import: `221/568`

## Inserted Rows

| Brand | Model | Series | Status | Cyl | Cooling | Configuration |
| --- | --- | --- | --- | ---: | --- | --- |
| Lister Petter | Lister Petter TR1 | TR Series | discontinued | 1 | Air-Cooled | Single-cylinder naturally aspirated air-cooled direct-injection diesel |
| Lister Petter | Lister Petter TR2 | TR Series | discontinued | 2 | Air-Cooled | Twin-cylinder naturally aspirated air-cooled direct-injection diesel |
| Lister Petter | Lister Petter TR3 | TR Series | discontinued | 3 | Air-Cooled | Three-cylinder naturally aspirated air-cooled direct-injection diesel |

## Document Attachments

| Document | Source | Storage path | Linked rows |
| --- | --- | --- | ---: |
| Lister Petter T Series TS/TR/TX Workshop Manual Edition 12 | https://www.winget.co.uk/document/LISTER%20PETTER%20T%20SERIES%20WORKSHOP%20MANUAL%20EDITION%2012%20MAY%202005.pdf | lister-petter/legacy/lister-petter-t-series-workshop-manual-edition-12-2005.pdf | 3 |
| Lister Petter TR1/TR2/TR3 TR Series Technical Data Sheet | https://engine.od.ua/ufiles/LISTER-PETTER-TR1-TR2-TR3-TR-Series-TDS.pdf | lister-petter/legacy/lister-petter-tr1-tr2-tr3-tr-series-tds.pdf | 3 |

## Linked Engine Rows

| Document | Engine slugs |
| --- | --- |
| Lister Petter T Series TS/TR/TX Workshop Manual Edition 12 | lister-petter-lister-petter-tr1<br>lister-petter-lister-petter-tr2<br>lister-petter-lister-petter-tr3 |
| Lister Petter TR1/TR2/TR3 TR Series Technical Data Sheet | lister-petter-lister-petter-tr1<br>lister-petter-lister-petter-tr2<br>lister-petter-lister-petter-tr3 |

## Validation Sources

- https://engine.od.ua/lister
- Lister Petter T Series TS/TR/TX Workshop Manual Edition 12: https://www.winget.co.uk/document/LISTER%20PETTER%20T%20SERIES%20WORKSHOP%20MANUAL%20EDITION%2012%20MAY%202005.pdf
- Lister Petter TR1/TR2/TR3 TR Series Technical Data Sheet: https://engine.od.ua/ufiles/LISTER-PETTER-TR1-TR2-TR3-TR-Series-TDS.pdf

## Notes

- This batch adds only the missing TR rows. Existing TS/TX rows already had T Series manual coverage from batch 11.
- The Winget-hosted workshop manual PDF text explicitly identifies `TS, TR, TX`, `TS/TR1`, `TS/TR2`, and `TS/TR3`, and describes TS/TR engines as one-, two- and three-cylinder naturally aspirated flywheel-fan air-cooled direct-injection engines.
- The Engine.od.ua TR Series technical data sheet is a scanned/image PDF; it is validated by the source page link, PDF header, size, and exact filename rather than copied OCR text.
