# Legacy Engine Document Attachments - Batch 87 Isuzu Strict

Date: 2026-08-13

## Result

- Strict source pages verified: `4`
- Strict datasheet links inserted: `4`
- Links skipped as existing strict/exact duplicates: `0`
- Missing/refused engine rows: `0`
- Strict legacy coverage before: `334/781 (42.8%)`
- Strict legacy coverage after: `338/781 (43.3%)`
- Remaining strict links needed for 60%: `131`

## Document Attachments

| Document | Type | Source / URL | Target rows | Source bytes |
| --- | --- | --- | ---: | ---: |
| Isuzu 4BD1 Technical Specifications Page | datasheet | https://enginetechspecs.com/isuzu_4bd1_technical_specs.html | 1 | 63919 |
| Isuzu 3.9L 4BD1T Diesel Specifications Page | datasheet | https://www.dieselhub.com/specs/isuzu-3.9l-4bd1.html | 1 | 13654 |
| JSAE Automotive Technology 330 Selection Isuzu 6BB1 Specifications Page | datasheet | https://www.jsae.or.jp/autotech/10-5.php | 1 | 37328 |
| Isuzu 6BD1 Engine Specification Table Page | datasheet | https://shanghai-ydtech.com/product/isuzu-6bd1-engine-isuzu-6bd1-engine/ | 1 | 123622 |

## Linked Engine Rows

| Brand | Engine slug | Source key | Status |
| --- | --- | --- | --- |
| Isuzu | `isuzu-4bd1` | isuzu-4bd1-enginetechspecs-page | inserted |
| Isuzu | `isuzu-4bd1t` | isuzu-4bd1t-dieselhub-specs | inserted |
| Isuzu | `isuzu-6bb1` | isuzu-6bb1-jsae-330-selection | inserted |
| Isuzu | `isuzu-6bd1` | isuzu-6bd1-ydtech-spec-table | inserted |



## Validation Notes

- EngineTechSpecs page exposes exact 4BD1 identity plus displacement, bore/stroke, compression-ratio and power-range specification content.
- DieselHub page exposes exact 4BD1T model identity, production-year context, configuration and tabular displacement, compression, bore/stroke, horsepower and torque fields.
- JSAE historical technology page identifies the exact 6BB1 model and publishes output, torque and fuel-consumption data with Isuzu historical-reference context.
- YD Technology product page is a commercial source, but the page exposes an exact 6BD1 technical table with model, displacement, bore/stroke, compression, rated power and torque.
- This batch only upgrades existing discontinued Isuzu rows. It does not add engine records or infer adjacent B-series variants.
- The 6BD1 source is marked strict because it exposes a public exact-model technical table; it is still a commercial product page rather than an OEM brochure.
