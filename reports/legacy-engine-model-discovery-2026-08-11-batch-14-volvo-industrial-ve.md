# Legacy Engine Model Discovery - Batch 14 Volvo Industrial VE

Date: 2026-08-11

## Result

- Source-validated Volvo Penta industrial VE candidates reviewed: `6`
- Already present before import: `0`
- New rows inserted: `6`
- Engine count after import: `3400`
- Legacy PDF/manual coverage after import: `144/431`

## Inserted Rows

| Brand | Model | Series | Status | Power kW | Displacement L | RPM |
| --- | --- | --- | --- | ---: | ---: | ---: |
| Volvo Penta | TD420VE | Early Volvo Penta 4-7 L Industrial | discontinued | 74.9 | 4.04 | 2500 |
| Volvo Penta | TAD420VE | Early Volvo Penta 4-7 L Industrial | discontinued | 103 | 4.04 | 2500 |
| Volvo Penta | TAD520VE | Early Volvo Penta 4-7 L Industrial | discontinued | 118 | 4.8 | 2300 |
| Volvo Penta | TAD660VE | D6 Industrial VE | discontinued | 147 | 5.7 | 2300 |
| Volvo Penta | TAD750VE | D7 Industrial VE | discontinued | 200 | 7.15 | 2300 |
| Volvo Penta | TAD760VE | D7 Industrial VE | discontinued | 181 | 7.15 | 2300 |

## Validation Sources

- https://www.volvogroup.com/en/news-and-media/news/2001/apr/news-20559.html
- https://manualzz.com/doc/html/57476384/volvo-penta-tad530--tad531--tad730--tad731--tad732-worksh...
- https://www.manualslib.com/manual/1622503/Volvo-Tad650ve.html
- https://www.lectura-specs.com/en/model/components/engines-volvo-penta/tad660ve-11703130
- https://www.lectura-specs.com/en/model/components/engines-volvo-penta/tad750ve-11703136
- https://www.lectura-specs.com/en/model/components/engines-volvo-penta/tad760ve-11703137
- https://www.volvopenta.com/en-us/industrial/industrial-engines/off-road-engine-range/d5-eu-stage-v-epa-tier-4f/

## Notes

- This batch is limited to industrial/mobile VE rows, not marine TAMD/TMD models.
- The 2001 Volvo Group launch page directly names TD420VE, TAD420VE, and TAD520VE and gives their rated power, peak torque, rated speed, and displacement.
- LECTURA provides production windows ending in 2019/2021 for TAD660VE, TAD750VE, and TAD760VE, supporting discontinued status.
- Manualzz and ManualsLib workshop-manual pages cross-check the model family identity across TD/TAD420, TD/TAD520, TAD650/TAD660, TAD750, and TAD760 industrial manuals.
- TAD650VE was reviewed but deferred until a production-ended source is found; an old manual/parts catalog alone is not enough for this import threshold.
