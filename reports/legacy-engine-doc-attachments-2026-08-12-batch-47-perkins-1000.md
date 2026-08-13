# Legacy Engine Document Attachments - Batch 47 Perkins 1000

Date: 2026-08-12

## Result

- Validated Perkins legacy documents reviewed: `1`
- Datasheet/manual links inserted: `3`
- Links skipped as existing: `0`
- Missing target engines: `0`
- Engine count after attachment: `3596`
- Legacy PDF/manual coverage after attachment: `281/627`

## Document Attachment

| Document | Source | Storage path | Target rows |
| --- | --- | --- | ---: |
| Perkins 1000 Series Handbook | https://www.boatfreemanuals.com/app/download/11674303691/Perkins+1000+Series+Handbook_compressed.pdf?t=1631007179 | perkins/legacy/perkins-1000-series-handbook.pdf | 3 |

## Linked Engine Rows

| Engine slug | Status |
| --- | --- |
| perkins-1004-40 | linked |
| perkins-1004-40t | linked |
| perkins-1004-4t | linked |



## Rejected / Deferred Perkins Documents

| Candidate | Reason |
| --- | --- |
| Perkins 4.236 marine handbook | Downloaded PDF is real, but the extracted text is scan/OCR-poor and the document is marine-specific; not attached to industrial/genset legacy rows in this batch. |
| Perkins 4.108/6.354 marine operator manual | Downloaded PDF is real, but the extracted text layer is effectively empty; not attached without stronger exact model-token validation. |

## Validation Sources

- BoatFreeManuals Perkins page: https://www.boatfreemanuals.com/motors/perkins/
- Perkins 1000 Series Handbook direct PDF: https://www.boatfreemanuals.com/app/download/11674303691/Perkins+1000+Series+Handbook_compressed.pdf?t=1631007179

## Notes

- This is a document-coverage batch only; no new engine rows or specifications were inserted.
- The handbook text explicitly describes the Perkins 1000 Series as industrial and agricultural engines and names generator-set numbering conventions, so it is suitable for the uncovered 1004 legacy industrial rows.
- Marine-only Perkins PDFs found on the same source page were not linked because they did not pass the same exact text-validation threshold for these industrial/genset rows.
