# Legacy Engine Model Discovery - Batch 43 Volvo RAAD Orphan Archived Gensets

Date: 2026-08-12

## Result

- RAAD archived Volvo Penta genset pages reviewed: `3`
- New legacy rows inserted: `3`
- Already present before import: `0`
- Datasheet/Product Bulletin PDFs attached: `0`
- Engine count after import: `3594`
- Legacy PDF/manual coverage after import: `277/625`

## Inserted Rows

| Brand | Model | Series | Status | Max kW from RAAD page | RPM | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
| Volvo Penta | TAD740GE | D7 Power Generation | discontinued | 251 | 1800 | https://www.raad-eng.com/techdata/volvo/engines/tad740ge.html |
| Volvo Penta | TAD741GE | D7 Power Generation | discontinued | 228 | 1800 | https://www.raad-eng.com/techdata/volvo/engines/tad741ge.html |
| Volvo Penta | TD710G | Early D7 Power Generation | discontinued | 168 | 1800 | https://www.raad-eng.com/techdata/volvo/engines/td710ge.html |

## Validation Sources

- RAAD archived Volvo Penta engines index: https://www.raad-eng.com/techdata/volvo/engines/
- TAD740GE archived page: https://www.raad-eng.com/techdata/volvo/engines/tad740ge.html
- TAD741GE archived page: https://www.raad-eng.com/techdata/volvo/engines/tad741ge.html
- TD710G archived page: https://www.raad-eng.com/techdata/volvo/engines/td710ge.html

## Rejected/Unavailable Documents

- https://www.raad-eng.com/techdata/volvo/prodbull/tad740ge.pdf returned 404 during probing.
- https://www.raad-eng.com/techdata/volvo/prodbull/TAD741GE_rgb.pdf is linked from the archived page but is not listed in the surviving Product Bulletin index.
- https://www.raad-eng.com/techdata/volvo/prodbull/td710g.pdf returned 404 during probing.
- The related Technical Data folder URLs returned 404 during probing, so no datasheet/manual link was attached in this batch.

## Notes

- This batch is limited to archived Volvo Penta genset pages under RAAD's Volvo technical library; marine-only Volvo rows are intentionally excluded.
- New records use conservative metadata from the archived page text only. Rows with dead document links are intentionally kept without PDFs until a surviving exact Product Bulletin or Technical Data PDF can be validated.
