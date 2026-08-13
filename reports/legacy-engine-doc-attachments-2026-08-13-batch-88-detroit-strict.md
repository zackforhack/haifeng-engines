# Legacy Engine Document Attachments - Batch 88 Detroit Strict

Date: 2026-08-13

## Result

- Strict source pages verified: `3`
- Strict datasheet links inserted: `3`
- Links skipped as existing strict/exact duplicates: `0`
- Missing/refused engine rows: `0`
- Strict legacy coverage before: `338/781 (43.3%)`
- Strict legacy coverage after: `341/781 (43.7%)`
- Remaining strict links needed for 60%: `128`

## Document Attachments

| Document | Type | Source / URL | Target rows | Source bytes |
| --- | --- | --- | ---: | ---: |
| Detroit Diesel 2-53 Engine Configuration Specifications Page | datasheet | https://dieselpro.com/blog/engine-configurations-overview-of-inline-and-v-type-detroit-diesel-53-series-engine-models-2-53-3-53-4-53-6v-53-and-8v-53/ | 1 | 479218 |
| Detroit Diesel Series 53 Specs Table - 6-53 Row | datasheet | https://chevytrucks.org/detroit-diesel-series-53-engine-guide/ | 1 | 331006 |
| Detroit Diesel 8.2L Fuel Pincher Specifications Page | datasheet | https://dieselpro.com/blog/general-information-for-detroit-diesel-8-2l-engines/ | 1 | 435012 |

## Linked Engine Rows

| Brand | Engine slug | Source key | Status |
| --- | --- | --- | --- |
| Detroit Diesel | `detroit-diesel-2-53` | detroit-diesel-2-53-dieselpro-specs | inserted |
| Detroit Diesel | `detroit-diesel-6-53` | detroit-diesel-6-53-chevytrucks-specs | inserted |
| Detroit Diesel | `detroit-diesel-8-2l-fuel-pincher` | detroit-diesel-82-fuel-pincher-dieselpro-specs | inserted |



## Validation Notes

- Diesel Pro page exposes the exact 2-53 section with cylinder count, bore, stroke, displacement and compression-ratio data.
- ChevyTrucks page exposes a Series 53 specification table with an exact 6-53 column covering displacement, configuration, bore/stroke, compression, horsepower and torque.
- Diesel Pro page exposes exact Detroit Diesel 8.2L/Fuel Pincher identity plus V8 configuration, bore/stroke, displacement and compression-ratio specifications.
- Detroit Diesel 4V-53 remains a strict gap because the accessible source found during this pass validates a 4-53/inline-or-V family table rather than a clean exact 4V-53 row.
- Komatsu 95/105/125 candidates remain excluded from this batch because promising pages were blocked by JS challenge or did not expose durable public source text for exact validation.
