# Legacy Engine Model Discovery - Batch 42 Cat C18 Tier III Package Legacy Genset

Date: 2026-08-12

## Result

- Official Cat non-current/package candidates reviewed: `1`
- Already present before import: `0`
- New rows inserted: `1`
- Official Cat PDF documents verified: `1`
- Datasheet links inserted: `1`
- Links skipped as existing: `0`
- Engine count after import: `3591`
- Legacy PDF/manual coverage after import: `277/622`

## Inserted Rows

| Brand | Model | Series | Status | Power kW | RPM | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
| Caterpillar | C18 60 Hz 550-750 ekW Tier III Legacy Genset | C18 | discontinued | 750 | 1800 | https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=15970077&nc=1 |

## Document Attachments

| Document | Source | Storage path | Target slug |
| --- | --- | --- | --- |
| Cat C18 60 Hz 550-750 ekW EPA Tier III Spec Sheet | https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1773- | caterpillar/legacy/cat-c18-60hz-550-750ekw-tier3-lehe1773-spec-sheet.pdf | caterpillar-c18-60-hz-550-750-ekw-tier-iii-legacy-genset |

## Validation Sources

- C18 60 Hz 550-750 ekW Tier III Legacy Genset non-current source page: https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=15970077&nc=1
- Cat C18 60 Hz 550-750 ekW EPA Tier III Spec Sheet: https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1773-

## Notes

- This batch uses a Caterpillar official H-CPC page marked `Non-Current` and an exact Cat spec sheet.
- The live row uses `14.5:1` for `compression_ratio`; the source PDF also notes `14:1` on upper ratings, but the database QA gate requires a single `N:1` value.
- Individual C18 Tier II sheets from LEHE1580/1581/1758/1771/1772 were rejected because the downloaded exact PDFs are 2025 revisions and need stronger discontinued evidence before import.
- Volvo Penta publication pages for TAD6/TAD7 were probed, but the accepted PDF endpoint timed out before a complete PDF could be validated, so no Volvo PDF was attached in this batch.
- Rows are generator-set package rows, not replacements for generic active engine-family rows.
