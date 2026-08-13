# Legacy Engine Document Attachments - Batch 90 Kubota V/Z Strict

Date: 2026-08-13

## Result

- Strict source pages verified: `4`
- Strict datasheet links inserted: `4`
- Links skipped as existing strict/exact duplicates: `0`
- Missing/refused engine rows: `0`
- Strict legacy coverage before: `346/781 (44.3%)`
- Strict legacy coverage after: `350/781 (44.8%)`
- Remaining strict links needed for 60%: `119`

## Document Attachments

| Document | Type | Source / URL | Target rows | Source bytes |
| --- | --- | --- | ---: | ---: |
| Kubota V1100 Engine Technical Data Page | datasheet | https://tractorgearbox.com/kubota_v1100_engine_specs.html | 1 | 52984 |
| Kubota V1200 Engine Technical Data Page | datasheet | https://tractorgearbox.com/kubota_v1200_engine_specs.html | 1 | 52830 |
| Kubota Z500 Engine Technical Data Page | datasheet | https://tractorgearbox.com/kubota_z500_engine_specs.html | 1 | 53396 |
| Kubota Z600 Engine Technical Data Page | datasheet | https://tractorgearbox.com/kubota_z600_engine_specs.html | 1 | 53588 |

## Linked Engine Rows

| Brand | Engine slug | Source key | Status |
| --- | --- | --- | --- |
| Kubota | `kubota-v1100` | kubota-v1100-tractorgearbox | inserted |
| Kubota | `kubota-v1200` | kubota-v1200-tractorgearbox | inserted |
| Kubota | `kubota-z500` | kubota-z500-tractorgearbox | inserted |
| Kubota | `kubota-z600` | kubota-z600-tractorgearbox | inserted |



## Validation Notes

- TractorGearbox page exposes exact V1100 identity, bore/stroke, displacement, power, torque and compression-ratio data.
- TractorGearbox page exposes exact V1200 identity, bore/stroke, displacement, power, torque and compression-ratio data.
- TractorGearbox page exposes exact Z500 identity, bore/stroke, displacement, power, torque and compression-ratio data.
- TractorGearbox page exposes exact Z600 identity, bore/stroke, displacement, power, torque and compression-ratio data.
- This batch only upgrades exact discontinued Kubota V/Z rows and does not infer `VH1100`, `V800`, `Z400`, `Z430`, or ZB/KND/WG/DF rows.
- `kubota-v800` was excluded because the probed candidate URL returned 404; `kubota-vh1100` was excluded because the validated source is V1100, not VH1100.
