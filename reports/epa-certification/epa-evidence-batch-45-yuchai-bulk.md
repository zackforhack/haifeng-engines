# EPA Evidence Enrichment Batch 45: Yuchai Bulk Datasheets

Date: 2026-07-25

## Result

The official Yuchai matching-parameter sheet archive supplied locally was
indexed by the model token embedded in each filename and matched against exact
database model names.

- Source PDF files scanned: **196**
- Distinct specification-sheet model tokens: **104**
- English sheets selected: **88**
- Chinese-only sheets selected: **16**
- Exact database model matches: **104**
- Source tokens without a database match: **0**
- Sheets uploaded and linked: **104**
- Upload or relation failures: **0**
- Total Yuchai database pages: **201**
- Yuchai pages with a datasheet after the batch: **104**

English sheets were preferred when both English and Chinese versions existed.
Load-characteristic curve files were excluded because they are not complete
matching-parameter sheets.

## Matching Controls

- A filename had to contain the Yuchai model token and the matching-parameter
  sheet marker.
- The extracted token had to equal the database model exactly.
- One known filename typo, `YCMK360-D30`, was mapped explicitly to
  `YC6MK360-D30`.
- No family-level or approximate matching was used.
- Ratings and emissions fields were not changed.

## Verification

```text
Linked 104 Yuchai spec sheets (0 failed).
Yuchai engines: 201
Engines with datasheet: 104
0 issues across 2585 engines and 149 alternators.
```

## Reproduce

```bash
set -a
source .env.local
node data/upload-yuchai-specsheets.mjs --dry
node data/upload-yuchai-specsheets.mjs
npm run data:qa
```
