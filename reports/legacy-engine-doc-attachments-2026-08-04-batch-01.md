# Legacy Engine Datasheet / Brochure Attachment Batch 01

Date: 2026-08-04

## Result

- Added `69` new `engine_pdfs` links for discontinued legacy engine rows.
- Uploaded and linked `51` validated public PDFs.
- Covered brands in this pass:
  - Caterpillar: `25 / 38` discontinued rows now have datasheets.
  - Detroit Diesel: `22 / 38` discontinued rows now have a datasheet or brochure.
  - Deutz: `22 / 29` discontinued rows now have datasheets.

## Coverage Lift

Baseline before this pass:

- Discontinued engines with any PDF: `16 / 390` (`4.1%`)
- Discontinued engines with datasheet PDFs: `13 / 390` (`3.3%`)

After this pass:

- Discontinued engines with any PDF: `85 / 390` (`21.8%`)
- Discontinued engines with datasheet PDFs: `78 / 390` (`20.0%`)
- Total PDF links in database: `3891`

## Source Policy

- Sources were checked online before attachment.
- The script validates that each downloaded file starts with the `%PDF` magic bytes before upload.
- Model rows were linked only where the PDF title or technical table clearly covered the model or model family.
- Volvo Penta manuals were not uploaded in this pass because Volvo Penta publication pages display redistribution restrictions.

## Source Pages

- Caterpillar specification sheet index: https://www.dieselpartsdirect.com/caterpillar-engines-specification-sheets
- Detroit Diesel specification sheet index: https://www.dieselpartsdirect.com/detroit-diesel-engines-specification-sheets
- Deutz specification sheet index: https://www.dieselpartsdirect.com/deutz-specification-sheets

## Implementation

- Script: `data/attach-legacy-engine-docs-batch-01-2026-08.mjs`
- Storage bucket: `engine-pdfs`
- Storage path families:
  - `caterpillar/legacy/...`
  - `detroit-diesel/legacy/...`
  - `deutz/legacy/...`

## Validation

- `npm run test:database`
  - Passed: `3095 engines`, `149 alternators`, `3891 PDF links`, `75 engine brands`.
- `DATA_QA_FAIL_ON=high npm run data:qa`
  - Passed: `0 issues across 3095 engines and 149 alternators`.
