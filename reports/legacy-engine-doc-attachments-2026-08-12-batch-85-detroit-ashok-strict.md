# Legacy Engine Document Attachments - Batch 85 Detroit/Ashok Strict

Date: 2026-08-12

## Result

- Strict source pages verified: `2`
- Strict datasheet links inserted: `4`
- Links skipped as existing strict/exact duplicates: `0`
- Missing/refused engine rows: `0`
- Strict legacy coverage before: `325/781 (41.6%)`
- Strict legacy coverage after: `329/781 (42.1%)`
- Remaining strict links needed for 60%: `140`

## Document Attachments

| Document | Brand | Type | Source / URL | Target rows | Source bytes |
| --- | --- | --- | --- | ---: | ---: |
| Detroit Diesel 53 Series General Specifications Page | Detroit Diesel | datasheet | https://www.manualslib.com/manual/4071484/Detroit-Diesel-53-Series.html?page=10 | 3 | 319636 |
| Ashok Leyland ALGP WO4D Specification Page | Ashok Leyland | datasheet | https://www.akashpowergensets.com/algpwo4d.html | 1 | 38081 |

## Linked Engine Rows

| Brand | Engine slug | Source key | Status |
| --- | --- | --- | --- |
| Detroit Diesel | `detroit-diesel-3-53` | detroit-diesel-53-series-general-specifications | inserted |
| Detroit Diesel | `detroit-diesel-4-53` | detroit-diesel-53-series-general-specifications | inserted |
| Detroit Diesel | `detroit-diesel-6v-53` | detroit-diesel-53-series-general-specifications | inserted |
| Ashok Leyland | `ashok-leyland-algp-wo4d` | ashok-leyland-algp-wo4d-specifications | inserted |



## Validation Notes

- ManualsLib page 10 is linked only to exact model tokens visible on the General Specifications page. 2-53, 4V-53 and 6-53 remain strict gaps until exact tokens are validated.
- Akash Power Gensets page exposes exact ALGP WO4D product/spec fields, including ratings, displacement, bore, stroke and compression ratio.
- Detroit Diesel 2-53, 4V-53 and 6-53 were deliberately excluded because this source page did not expose those exact row tokens in the validated table text.
- Ashok Leyland ALGP 400 and ALGP 402 remain strict gaps until open exact specification tokens are validated.
