# Legacy Engine Model Discovery - Batch 40 Cat 3512/C32/3516B Package Legacy Gensets

Date: 2026-08-12

## Result

- Official Cat non-current/package candidates reviewed: `4`
- Already present before import: `0`
- New rows inserted: `4`
- Official Cat PDF documents verified: `4`
- Datasheet links inserted: `4`
- Links skipped as existing: `0`
- Engine count after import: `3584`
- Legacy PDF/manual coverage after import: `270/615`

## Inserted Rows

| Brand | Model | Series | Status | Power kW | RPM | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
| Caterpillar | 3512 50 Hz 1000-1400 kVA Legacy Genset | 3512 | discontinued | 1120 | 1500 | https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000001870&nc=1 |
| Caterpillar | C32 60 Hz 830-1000 ekW Legacy Genset | C32 | discontinued | 1000 | 1800 | https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000028915&nc=1 |
| Caterpillar | 3516B 50 Hz 1750-2250 kVA Legacy Genset | 3516B | discontinued | 1800 | 1500 | https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000033459&nc=1 |
| Caterpillar | 3516B 50 Hz 2000-2500 kVA Legacy Genset | 3516B | discontinued | 2000 | 1500 | https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000033459&nc=1 |

## Document Attachments

| Document | Source | Storage path | Target slug |
| --- | --- | --- | --- |
| Cat 3512 50 Hz 1000-1400 kVA Low Fuel Consumption Spec Sheet | https://s7d2.scene7.com/is/content/Caterpillar/CM20170816-15296-07801 | caterpillar/legacy/cat-3512-50hz-1000-1400kva-lehe1291-spec-sheet.pdf | caterpillar-3512-50-hz-1000-1400-kva-legacy-genset |
| Cat C32 60 Hz 830-1000 ekW Low Fuel Consumption Spec Sheet | https://s7d2.scene7.com/is/content/Caterpillar/CM20180321-36240-65002 | caterpillar/legacy/cat-c32-60hz-830-1000ekw-lehe1626-spec-sheet.pdf | caterpillar-c32-60-hz-830-1000-ekw-legacy-genset |
| Cat 3516B 50 Hz 1750-2250 kVA Low Fuel/Low Emissions Spec Sheet | https://s7d2.scene7.com/is/content/Caterpillar/CM20180613-31502-61470 | caterpillar/legacy/cat-3516b-50hz-1750-2250kva-lehe1281-spec-sheet.pdf | caterpillar-3516b-50-hz-1750-2250-kva-legacy-genset |
| Cat 3516B 50 Hz 2000-2500 kVA Low Fuel/Low Emissions Spec Sheet | https://s7d2.scene7.com/is/content/Caterpillar/CM20180613-31329-22820 | caterpillar/legacy/cat-3516b-50hz-2000-2500kva-lehe1282-spec-sheet.pdf | caterpillar-3516b-50-hz-2000-2500-kva-legacy-genset |

## Validation Sources

- 3512 50 Hz 1000-1400 kVA Legacy Genset non-current source page: https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000001870&nc=1
- C32 60 Hz 830-1000 ekW Legacy Genset non-current source page: https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000028915&nc=1
- 3516B 50 Hz 1750-2250 kVA Legacy Genset non-current source page: https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000033459&nc=1
- 3516B 50 Hz 2000-2500 kVA Legacy Genset non-current source page: https://h-cpc.cat.com/cmms/v2?&f=product&it=product&cid=402&lid=en&sc=US&gid=18260932&pid=1000033459&nc=1
- Cat 3512 50 Hz 1000-1400 kVA Low Fuel Consumption Spec Sheet: https://s7d2.scene7.com/is/content/Caterpillar/CM20170816-15296-07801
- Cat C32 60 Hz 830-1000 ekW Low Fuel Consumption Spec Sheet: https://s7d2.scene7.com/is/content/Caterpillar/CM20180321-36240-65002
- Cat 3516B 50 Hz 1750-2250 kVA Low Fuel/Low Emissions Spec Sheet: https://s7d2.scene7.com/is/content/Caterpillar/CM20180613-31502-61470
- Cat 3516B 50 Hz 2000-2500 kVA Low Fuel/Low Emissions Spec Sheet: https://s7d2.scene7.com/is/content/Caterpillar/CM20180613-31329-22820

## Notes

- This batch uses Caterpillar official H-CPC pages marked `Non-Current` and exact Cat spec sheets.
- A stale 3516B upgradeable-package Scene7 link was rejected before import because it returned 404.
- Rows are generator-set package rows, not replacements for generic active engine-family rows.
- kVA-only Cat package rows use 0.8 power factor for `power_kw`.
