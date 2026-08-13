# Legacy Engine Model Discovery - Batch 25 DEUTZ Official Archive

Date: 2026-08-11

## Result

- Source-validated DEUTZ legacy candidates reviewed: `18`
- Already present before import: `0`
- New rows inserted: `18`
- Official DEUTZ archive PDFs reviewed: `7`
- Datasheet links inserted: `23`
- Links skipped as existing: `0`
- Missing document target rows: `0`
- Engine count after import: `3519`
- Legacy PDF/manual coverage after import: `185/550`

## Inserted Rows

| Brand | Model | Series | Status | Displacement L | Cylinders | Cooling |
| --- | --- | --- | --- | ---: | ---: | --- |
| Deutz | BF4M2012 | 2012 Series | discontinued | 4.038 | 4 | Liquid-Cooled |
| Deutz | BF4M2012 C | 2012 Series | discontinued | 4.038 | 4 | Liquid-Cooled |
| Deutz | BF6M2012 C | 2012 Series | discontinued | 6.057 | 6 | Liquid-Cooled |
| Deutz | BF4M1013 EC | 1013 Series | discontinued | 4.764 | 4 | Liquid-Cooled |
| Deutz | BF4M1013 FC | 1013 Series | discontinued | 4.764 | 4 | Liquid-Cooled |
| Deutz | BF6M1013 EC | 1013 Series | discontinued | 7.146 | 6 | Liquid-Cooled |
| Deutz | BF6M1013 FC | 1013 Series | discontinued | 7.146 | 6 | Liquid-Cooled |
| Deutz | BF6M1015 C | 1015 Series | discontinued | 11.906 | 6 | Liquid-Cooled |
| Deutz | BF6M1015 CP | 1015 Series | discontinued | 11.906 | 6 | Liquid-Cooled |
| Deutz | BF8M1015 C | 1015 Series | discontinued | 15.874 | 8 | Liquid-Cooled |
| Deutz | BF8M1015 CP | 1015 Series | discontinued | 15.874 | 8 | Liquid-Cooled |
| Deutz | BF4L914 | 914 Series | discontinued | 4.086 | 4 | Air-Cooled |
| Deutz | BF6L914 | 914 Series | discontinued | 6.128 | 6 | Air-Cooled |
| Deutz | BF6L914 C | 914 Series | discontinued | 6.128 | 6 | Air-Cooled |
| Deutz | D 2011 L04 O | 2011 Series | discontinued | 3.108 | 4 | Oil-Cooled |
| Deutz | D 2011 L04 W | 2011 Series | discontinued | 3.108 | 4 | Liquid-Cooled |
| Deutz | D914 L04 | 914 Series | discontinued | 4.086 | 4 | Air-Cooled |
| Deutz | D914 L06 | 914 Series | discontinued | 6.128 | 6 | Air-Cooled |

## Document Attachments

| Document | Source | Storage path | Linked rows |
| --- | --- | --- | ---: |
| DEUTZ BF 2012 Official Archive Datasheet | https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/legacy/bfm_2012_mobile_machinery_en.pdf | deutz/legacy/deutz-bf-2012-official-archive-datasheet.pdf | 3 |
| DEUTZ BFM 1013 Official Archive Datasheet | https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/legacy/BFM_1013_Mobile_machinery_EN.pdf | deutz/legacy/deutz-bfm-1013-official-archive-datasheet.pdf | 4 |
| DEUTZ BFM 1015 Official Archive Datasheet | https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/legacy/bfm_1015_mobile_machinery_en.pdf | deutz/legacy/deutz-bfm-1015-official-archive-datasheet.pdf | 4 |
| DEUTZ B/F 914 Official Archive Datasheet | https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/legacy/BFL_914_Mobile_machinery_EN.pdf | deutz/legacy/deutz-bfl-914-official-archive-datasheet.pdf | 3 |
| DEUTZ D/TCD 2011 Official Archive Datasheet | https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/legacy/TCD_2011_Mobile_machinery_EN.pdf | deutz/legacy/deutz-d-tcd-2011-official-archive-datasheet.pdf | 5 |
| DEUTZ BFM 2011 Official Archive Mobile Datasheet | https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/legacy/BFM_2011_Mobile_machinery_EN.pdf | deutz/legacy/deutz-bfm-2011-official-archive-mobile-datasheet.pdf | 2 |
| DEUTZ D 914 Official Archive Datasheet | https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/mobile_machinery/d_914_mobile_machinery_en.pdf | deutz/legacy/deutz-d914-official-archive-datasheet.pdf | 2 |

## Validation Sources

- Official DEUTZ Engine Data Sheets Archive: https://www.deutz.com/germany/en/products/engines-archive/
- DEUTZ BF 2012 Official Archive Datasheet: https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/legacy/bfm_2012_mobile_machinery_en.pdf
- DEUTZ BFM 1013 Official Archive Datasheet: https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/legacy/BFM_1013_Mobile_machinery_EN.pdf
- DEUTZ BFM 1015 Official Archive Datasheet: https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/legacy/bfm_1015_mobile_machinery_en.pdf
- DEUTZ B/F 914 Official Archive Datasheet: https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/legacy/BFL_914_Mobile_machinery_EN.pdf
- DEUTZ D/TCD 2011 Official Archive Datasheet: https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/legacy/TCD_2011_Mobile_machinery_EN.pdf
- DEUTZ BFM 2011 Official Archive Mobile Datasheet: https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/legacy/BFM_2011_Mobile_machinery_EN.pdf
- DEUTZ D 914 Official Archive Datasheet: https://www.deutz.com/fileadmin/contents/global/produkte/datasheets/en/mobile_machinery/d_914_mobile_machinery_en.pdf

## Notes

- This batch uses DEUTZ's official legacy datasheet archive rather than reseller listings for the inserted model identities.
- Rows are skipped idempotently when a normalized DEUTZ model identity already exists in the database.
- Exact power ratings are left blank in row data unless already present elsewhere; this pass focuses on model identity, family, displacement and document coverage from official archived datasheets.
- Existing uncovered discontinued DEUTZ rows are included as document targets only when the official PDF explicitly covers the family.
