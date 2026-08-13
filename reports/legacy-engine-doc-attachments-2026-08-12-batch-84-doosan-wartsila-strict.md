# Legacy Engine Document Attachments - Batch 84 Doosan/Wärtsilä Strict

Date: 2026-08-12

## Result

- Strict source pages verified: `3`
- Strict datasheet/brochure links inserted: `5`
- Links skipped as existing strict/exact duplicates: `3`
- Missing/refused engine rows: `0`
- Strict legacy coverage before: `320/781 (41%)`
- Strict legacy coverage after: `325/781 (41.6%)`
- Remaining strict links needed for 60%: `144`

## Document Attachments

| Document | Brand | Type | Source / URL | Target rows | Source bytes |
| --- | --- | --- | --- | ---: | ---: |
| Doosan D1146/D1146T/P086TI Engine Specification Page | Doosan | datasheet | https://www.manualslib.com/manual/3896050/Doosan-P086t1.html?page=14 | 3 | 425830 |
| Doosan D1146/D1146T/P086TI Engine Power Page | Doosan | datasheet | https://www.manualslib.com/manual/3896050/Doosan-P086t1.html?page=15 | 3 | 400368 |
| Wärtsilä Vasa 32 Performance Upgrade Brochure Page | Wärtsilä | brochure | https://www.wartsila.com/services-catalogue/engine-services-4-stroke/wartsila-vasa-32ln-performance-upgrade | 2 | 60745 |

## Linked Engine Rows

| Brand | Engine slug | Source key | Status |
| --- | --- | --- | --- |
| Doosan | `doosan-d1146` | doosan-d1146-p086ti-engine-specification | inserted |
| Doosan | `doosan-d1146t` | doosan-d1146-p086ti-engine-specification | inserted |
| Doosan | `doosan-p086ti` | doosan-d1146-p086ti-engine-specification | inserted |
| Wärtsilä | `wartsila-vasa-6r32` | wartsila-vasa-32ln-performance-upgrade | inserted |
| Wärtsilä | `wartsila-vasa-12v32` | wartsila-vasa-32ln-performance-upgrade | inserted |
| Doosan | `doosan-d1146` | doosan-d1146-d1146t-p086ti-engine-power | existing |
| Doosan | `doosan-d1146t` | doosan-d1146-d1146t-p086ti-engine-power | existing |
| Doosan | `doosan-p086ti` | doosan-d1146-d1146t-p086ti-engine-power | existing |


## Validation Notes

- ManualsLib page 14 is treated as a strict spec page because the page title and rendered text expose the exact D1146, D1146T and P086TI specification table fields.
- Page 15 validates rating context for the same exact engine families. The DB row doosan-p086ti-1 is deliberately excluded because the source uses P086TI-I, not the numeric-1 DB token.
- Official Wärtsilä services page names Vasa 6R32 and 12V32 installations and exposes a download-leaflet CTA for the performance-upgrade brochure.
- Doosan `doosan-db58`, `doosan-dp086ta` and `doosan-p086ti-1` remain strict gaps until exact source tokens are validated.
- Wärtsilä evidence is an official manufacturer services/brochure page, not a third-party manual mirror.
