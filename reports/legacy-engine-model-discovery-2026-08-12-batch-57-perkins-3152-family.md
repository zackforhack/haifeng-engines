# Legacy Engine Model Discovery - Batch 57 Perkins 3.152 Family

Date: 2026-08-12

## Result

- Source-validated Perkins 3.152 candidates reviewed: `2`
- Already present before import: `0`
- New rows inserted: `2`
- Manual/reference links inserted: `3`
- Links skipped as existing: `0`
- Missing document target rows: `0`
- Engine count after import: `3619`
- Legacy PDF/manual coverage after import: `305/650`

## Inserted Rows

| Brand | Model | Series | Status | Cyl | Displacement L | Configuration |
| --- | --- | --- | --- | ---: | ---: | --- |
| Perkins | D3.152 | 3.152 Series | discontinued | 3 | 2.5 | Inline-3 naturally aspirated diesel |
| Perkins | T3.1524 | 3.152 Series | discontinued | 3 | 2.5 | Inline-3 turbocharged diesel |

## Manual Attachments

| Document | Source | Target models |
| --- | --- | --- |
| Perkins 3.152 Series User Handbook | https://www.manualslib.com/manual/3210613/Perkins-3-152-Series.html | 3.1524, D3.152, T3.1524 |

## Validation Sources

- Perkins engine-identification support: https://b2b.perkins.com/support/identify-your-engine
- Perkins 3.152 Series user handbook mirror: https://www.manualslib.com/manual/3210613/Perkins-3-152-Series.html

## Evidence Notes

- Perkins current engine-identification support lists `3.152 Series` in the series selector and `3.152` in the older engine-type table.
- The 3.152 Series user handbook page title/meta and manual text explicitly cover `3.1524`, `T3.1524`, and `D3.152`.
- The existing `3.1524` row already had a datasheet; this batch adds the handbook reference to connect the sibling variants without replacing that datasheet.
- No 4.108, 4.236, or 6.354 variants are imported in this batch; those families need separate exact-model evidence before insertion.
