# Legacy Engine Model Discovery - Batch 10 Perkins 1000 Series Document Depth

Date: 2026-08-11

## Result

- Source-validated Perkins 1000 Series candidates reviewed: `1`
- Already present before import: `0`
- New rows inserted: `1`
- Datasheets linked: `3`
- Datasheet links skipped as existing: `0`
- Engine count after import: `3394`

## Inserted Rows

| Brand | Model | Series | Power kW | Displacement L | RPM | Source sheet |
| --- | --- | --- | ---: | ---: | ---: | --- |
| Perkins | 1004-4 | 1000 Series | 63.5 | 3.99 | 2600 | https://www.dieselpartsdirect.com/documents/perkins/1000-series-63.5kw.pdf |

## Datasheet Attachments

| Engine | Source sheet | Storage path |
| --- | --- | --- |
| 1004-4 | https://www.dieselpartsdirect.com/documents/perkins/1000-series-63.5kw.pdf | perkins/legacy/dpd-perkins-1004-4-industrial-63-5kw.pdf |
| 1006-6 | https://www.dieselpartsdirect.com/documents/perkins/1000-series-96.5kw.pdf | perkins/legacy/dpd-perkins-1006-6-industrial-96-5kw.pdf |
| 1006-6T | https://www.dieselpartsdirect.com/documents/perkins/1000-series-119kw.pdf | perkins/legacy/dpd-perkins-1006-6t-industrial-119kw.pdf |

## Validation Sources

- https://www.dieselpartsdirect.com/perkins-specification-sheets
- https://www.perkins.com/en_GB/company/heritage/products/perkins-1006.html
- https://www.perkins.com/en_GB/campaigns/powernews/global-focus/focus-on-perkins-heritage.html
- https://www.dieselpartsdirect.com/perkins-1000-series-engines

## Notes

- This batch uses exact Diesel Parts Direct Perkins specification sheets for each attached model.
- `1004-4` is added as a distinct exact model rather than merging it into existing `1004-40` or `1004-4T` rows.
- `704-30` was reviewed but intentionally deferred: there is parts/spec support, but I did not find a discontinued-production source strong enough for this legacy import threshold.
