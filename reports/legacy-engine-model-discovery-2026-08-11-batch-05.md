# Legacy Engine Model Discovery - Batch 05

Date: 2026-08-11

## Result

- Source-validated Perkins legacy candidates reviewed: `5`
- Already present before import: `0`
- New rows inserted: `5`
- Engine count after import: `3364`
- Datasheet links inserted: `5`
- Datasheet links skipped as existing: `0`

## Inserted Rows

| Brand | Model | Series | Power kW | Displacement L | RPM | Source sheet |
| --- | --- | --- | ---: | ---: | ---: | --- |
| Perkins | 3.1524 | 3.152 Series | 30.5 | 2.5 | 1800 | https://www.dieselpartsdirect.com/documents/perkins/3.152.pdf |
| Perkins | 903-27 | 900 Series | 34 | 2.7 | 1800 | https://www.dieselpartsdirect.com/documents/perkins/900-series-34kw.pdf |
| Perkins | 903-27T | 900 Series | 48 | 2.7 | 2250 | https://www.dieselpartsdirect.com/documents/perkins/900-series-48kw.pdf |
| Perkins | 1004TG1 | 1000 Series | 69.5 | 3.99 | 1800 | https://www.dieselpartsdirect.com/documents/perkins/1000-series-64kw.pdf |
| Perkins | 1006-6TW | 1000 Series | 136 | 6 | 2600 | https://www.dieselpartsdirect.com/documents/perkins/1000-series-136kw.pdf |

## Validation Sources

- Diesel Parts Direct Perkins specification sheet index: https://www.dieselpartsdirect.com/perkins-specification-sheets
- Perkins official heritage article for the 3.152 and 4.236 lineage: https://www.perkins.com/en_GB/campaigns/powernews/global-focus/focus-on-perkins-heritage.html
- Perkins official heritage article for the 1006: https://www.perkins.com/en_GB/company/heritage/products/perkins-1006.html
- Perkins Long Service Club 3.152 / 900 Series production-history note: https://sites.google.com/view/perkinslongserviceclub/heritage-snippets/a-record-innings-p3-d3-152-900-series-engines
- Diesel Parts Direct 900 Series support page: https://www.dieselpartsdirect.com/perkins-900-series-engines

## Notes

- This batch intentionally avoids adding broad family rows where a more exact model already exists.
- `3.152` was not inserted as a vague family row; the source sheet is for the exact `3.1524` ElectropaK.
- `4.236`, `6.3544`, `1006-6`, and `1006-6T` were skipped because exact or more specific legacy rows were already present.
- Older 1100 Series rows from the same index were held back because they overlap heavily with active generator-drive records and need a separate current-vs-legacy review.
