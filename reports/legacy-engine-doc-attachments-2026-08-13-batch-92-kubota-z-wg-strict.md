# Legacy Engine Document Attachments - Batch 92 Kubota Z/WG Strict

Date: 2026-08-13

## Result

- Strict source pages verified by web inspection: `3`
- Strict datasheet links inserted: `3`
- Links skipped as existing strict/exact duplicates: `0`
- Missing/refused engine rows: `0`
- Strict legacy coverage before: `354/781 (45.3%)`
- Strict legacy coverage after: `357/781 (45.7%)`
- Remaining strict links needed for 60%: `112`

## Document Attachments

| Document | Type | Source / URL | Target rows | Source bytes |
| --- | --- | --- | ---: | ---: |
| Kubota Z400 Engine Technical Data Page | datasheet | https://tractorgearbox.com/kubota_z400_engine_specs.html | 1 | n/a - local curl blocked |
| Kubota Z430 Engine Technical Data Page | datasheet | https://tractorgearbox.com/kubota_z430_engine_specs.html | 1 | n/a - local curl blocked |
| Kubota WG750 Engine Technical Data Page | datasheet | https://tractorgearbox.com/kubota_wg750_engine_specs.html | 1 | n/a - local curl blocked |

## Linked Engine Rows

| Brand | Engine slug | Source key | Status |
| --- | --- | --- | --- |
| Kubota | `kubota-z400` | kubota-z400-tractorgearbox | inserted |
| Kubota | `kubota-z430` | kubota-z430-tractorgearbox | inserted |
| Kubota | `kubota-wg750` | kubota-wg750-tractorgearbox | inserted |



## Source Validation

- Page title and body identify Kubota Z400 and list vertical water-cooled diesel type, 2 cylinders, 0.399 L displacement, 64.0 mm bore, 62.2 mm stroke, 10.0 hp / 7.5 kW at 3200 rpm, plus service specifications.
- Page title and body identify Kubota Z430 and list engine model, diesel type, displacement, bore/stroke, rated engine power, rated engine speed and service specifications.
- Page title and body identify Kubota WG750 and list 4-cycle vertical OHV gasoline type, 3 cylinders, 740 cc displacement, 68.0 mm bore/stroke, 24.5 hp / 18.3 kW at 3600 rpm, fuel type gasoline, compression ratio 9.0:1 and service data.

## Validation Notes

- TractorGearbox page exposes exact Z400 identity, displacement, bore/stroke, rated power and rated speed.
- TractorGearbox page exposes exact Z430 identity with engine specification and service-data fields.
- TractorGearbox page exposes exact WG750 identity, gasoline fuel type, displacement, bore/stroke, rated power, rated speed and compression ratio.
- Excluded Kubota WG600-B and DH850-B candidates because the current database gap rows are base model names; this batch does not treat suffix-specific application pages as exact strict coverage for base rows.
- This batch only upgrades exact discontinued Kubota Z400, Z430 and WG750 rows and does not infer adjacent Kubota ZB, KND, VH, DH or small single-cylinder models.
