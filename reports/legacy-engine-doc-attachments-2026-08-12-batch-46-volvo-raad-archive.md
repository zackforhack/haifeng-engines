# Legacy Engine Doc Attachments - Batch 46 Volvo RAAD Archive

Date: 2026-08-12

## Result

- RAAD archived engine pages validated: `0`
- RAAD Product Bulletin PDFs validated: `16`
- New legacy rows inserted: `0`
- PDF links attached: `16`
- Existing PDF links skipped: `0`
- Missing target engines skipped: `0`
- Engine count after batch: `3596`
- Legacy PDF/manual coverage after batch: `278/627`

## Row Imports

| Brand | Model | Status | Action | Source page | Source PDF |
| --- | --- | --- | --- | --- | --- |


## PDF Attachments

| Engine | Source PDF | Storage path | Status |
| --- | --- | --- | --- |
| TAD530GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad530ge.pdf | volvo/legacy/raad-batch-46/tad530ge.pdf | linked |
| TAD531GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad531ge.pdf | volvo/legacy/raad-batch-46/tad531ge.pdf | linked |
| TAD532GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad532ge.pdf | volvo/legacy/raad-batch-46/tad532ge.pdf | linked |
| TD720GE | https://www.raad-eng.com/techdata/volvo/prodbull/td720ge.pdf | volvo/legacy/raad-batch-46/td720ge.pdf | linked |
| TAD730GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad730ge.pdf | volvo/legacy/raad-batch-46/tad730ge.pdf | linked |
| TAD731GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad731ge.pdf | volvo/legacy/raad-batch-46/tad731ge.pdf | linked |
| TAD732GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad732ge.pdf | volvo/legacy/raad-batch-46/tad732ge.pdf | linked |
| TAD733GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad733ge.pdf | volvo/legacy/raad-batch-46/tad733ge.pdf | linked |
| TAD734GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad734ge.pdf | volvo/legacy/raad-batch-46/tad734ge.pdf | linked |
| TAD1240GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad1240ge.pdf | volvo/legacy/raad-batch-46/tad1240ge.pdf | linked |
| TAD1241GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad1241ge.pdf | volvo/legacy/raad-batch-46/tad1241ge.pdf | linked |
| TAD1242GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad1242ge.pdf | volvo/legacy/raad-batch-46/tad1242ge.pdf | linked |
| TAD1640GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad1640ge.pdf | volvo/legacy/raad-batch-46/tad1640ge.pdf | linked |
| TAD1641GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad1641ge.pdf | volvo/legacy/raad-batch-46/tad1641ge.pdf | linked |
| TAD1642GE | https://www.raad-eng.com/techdata/volvo/prodbull/tad1642ge.pdf | volvo/legacy/raad-batch-46/tad1642ge.pdf | linked |
| TWD1643GE | https://www.raad-eng.com/techdata/volvo/prodbull/twd1643ge.pdf | volvo/legacy/raad-batch-46/twd1643ge.pdf | linked |

## Rejected / Deferred Volvo Archive Items

| Model | Reason |
| --- | --- |
| TWD1643GE | The RAAD PDF is exact, but the archived HTML page is a TWD1630G page and does not itself validate TWD1643GE, so Batch 46 only links the PDF if the exact live row already exists. |
| TAD1030GE | Archived page is exact, but no surviving RAAD Product Bulletin PDF is present in the Product Bulletin index. |
| TAD1031GE | Archived page is exact, but no surviving RAAD Product Bulletin PDF is present in the Product Bulletin index. |
| TAD1032GE | Archived page is exact, but no surviving RAAD Product Bulletin PDF is present in the Product Bulletin index. |
| TAD1630GE | Archived page is exact, but no surviving RAAD Product Bulletin PDF is present in the Product Bulletin index. |
| TAD1631GE | Archived page is exact, but no surviving RAAD Product Bulletin PDF is present in the Product Bulletin index. |
| TAD740GE | Archived page is exact, but the linked TAD740GE Product Bulletin PDF is not present in the surviving RAAD Product Bulletin index. |
| TAD741GE | Archived page is exact, but the linked TAD741GE RGB Product Bulletin PDF is not present in the surviving RAAD Product Bulletin index. |
| TWD710G | Archived page is exact, but no surviving RAAD Product Bulletin PDF is available in the index. |
| TWD740GE | Archived page is exact, but no surviving RAAD Product Bulletin PDF is available in the index. |
| TWD1630G | Archived page exists, but the surviving PDF under that page is for the distinct TWD1643GE model. |

## Validation Sources

- RAAD archived Volvo Penta engines index: https://www.raad-eng.com/techdata/volvo/engines/
- RAAD archived Volvo Penta Product Bulletin index: https://www.raad-eng.com/techdata/volvo/prodbull/

## Notes

- This batch is limited to Volvo Penta industrial and power-generation Product Bulletin material. Marine-only Volvo Penta rows are intentionally excluded.
- Each PDF was downloaded as a complete PDF and checked with `pdftotext` for exact model tokens before linking.
- Existing rows are not duplicated; PDF links are attached to the matching live engine row by exact Volvo Penta model code.
