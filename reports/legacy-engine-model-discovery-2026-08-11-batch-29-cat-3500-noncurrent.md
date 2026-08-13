# Legacy Engine Model Discovery - Batch 29 Cat 3500 Non-Current

Date: 2026-08-11

## Result

- Source-validated Caterpillar 3500-series non-current candidates reviewed: `3`
- Already present before import: `0`
- New rows inserted: `3`
- Cat PDF documents reviewed: `2`
- Datasheet links inserted: `3`
- Links skipped as existing: `0`
- Missing document target rows: `0`
- Engine count after import: `3534`
- Legacy PDF/manual coverage after import: `218/565`

## Inserted Rows

| Brand | Model | Series | Status | Cyl | Power kW | Displacement L |
| --- | --- | --- | --- | ---: | ---: | ---: |
| Caterpillar | 3512 | 3500 Series | discontinued | 12 | 1120 |  |
| Caterpillar | 3512B | 3500 Series | discontinued | 12 | 1500 | 58.56 |
| Caterpillar | 3516B | 3500 Series | discontinued | 16 | 2250 | 78.08 |

## Document Attachments

| Document | Source | Storage path | Linked rows |
| --- | --- | --- | ---: |
| Cat 3512 50 Hz Low Fuel Consumption Spec Sheet | https://s7d2.scene7.com/is/content/Caterpillar/CM20170816-15296-07801 | caterpillar/legacy/cat-3512-50hz-low-fuel-consumption-spec-sheet.pdf | 1 |
| Cat Electric Power Ratings Guide - 3500 Non-Current Rows | https://s7d2.scene7.com/is/content/Caterpillar/CM20180319-16263-55470 | caterpillar/legacy/cat-electric-power-ratings-guide-3500-noncurrent.pdf | 2 |

## Linked Engine Rows

| Document | Engine slugs |
| --- | --- |
| Cat 3512 50 Hz Low Fuel Consumption Spec Sheet | caterpillar-3512 |
| Cat Electric Power Ratings Guide - 3500 Non-Current Rows | caterpillar-3512b<br>caterpillar-3516b |

## Validation Sources

- Cat 3512 non-current product page: https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000001870&nc=1
- Cat 3512B non-current product page: https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000028970&nc=1
- Cat 3516B non-current product page: https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=15969841&nc=1
- Cat 3512 50 Hz Low Fuel Consumption Spec Sheet: https://s7d2.scene7.com/is/content/Caterpillar/CM20170816-15296-07801
- Cat Electric Power Ratings Guide - 3500 Non-Current Rows: https://s7d2.scene7.com/is/content/Caterpillar/CM20180319-16263-55470

## Notes

- Each row is backed by a Caterpillar H-CPC product page marked `Non-Current`.
- The 3512 row is attached to the model-specific Cat 3512 spec sheet; the 3512B and 3516B rows are attached to Cat's Electric Power Ratings Guide, which lists exact 3512B and 3516B diesel ratings.
- The Cat 3512 H-CPC page title and linked PDF validate the 3512 generator row. Its embedded engine-spec table contains unrelated C32 text, so this batch uses the page title, non-current status and Cat 3512 PDF for the row rather than copying that table.
