# Legacy Engine Model Discovery - Batch 03

Date: 2026-08-04

## Purpose

Continue expanding long-tail discontinued engine coverage after the 3,000-engine milestone. This batch focuses on exact model-code searches where owners, mechanics, marine users, and parts buyers still search old engines by designation.

## Candidate Groups

### Ford Dorset / Dover

Validated Ford 2700 Dorset and 2720 Dover industrial/marine engines:

- 2701E
- 2703E
- 2704E
- 2701C
- 2711E
- 2712E
- 2713E
- 2714E
- 2723
- 2725
- 2726T
- 2728T

Sources used: Ford 2700/2720 manual indexes and Timik Engines' Dorset/Dover identification guide.

### International Harvester / Case IH

Validated IH 6-cylinder diesel, turbo diesel, and intercooled turbo diesel models:

- D-236
- D-282
- D-301
- D-310
- D-312
- D-358
- D-360
- D-361
- D-407
- D-414
- D-436
- D-466
- DT-239
- DT-358
- DT-361
- DT-402
- DT-407
- DT-414
- DT-429
- DT-436
- DT-466B
- DTI-466
- DTI-466B
- DTI-466C

Sources used: Case IH/CNH parts catalogs for six-cylinder and turbo-diesel engines, plus International Harvester large diesel service references.

### Hino

Validated older Hino W, H, and J-series diesel models:

- H06CT
- H07CT
- H07DT
- W04C
- W04C-T
- W04C-TI
- W04D-J
- W06D
- W06D-TI
- J05C
- J08C

Sources used: Hino H06/H07 specialist specification references, Hino workshop manual indexes, and J08C/J05C service-manual references.

### Komatsu

Validated Komatsu 95 Series diesel models:

- 3D95S-W-1
- 4D95L-1
- 4D95S-W-1
- 6D95L-1
- SA6D95L-1
- SAA6D95LE-1

Sources used: Komatsu 95 Series workshop-manual coverage for the 3D95, 4D95, 6D95, S6D95, SA6D95, and SAA6D95 families.

## Import File

Implemented in:

- `data/add-legacy-engine-models-batch-03.mjs`

Expected new record count before live de-duplication:

- 53 candidate rows

The script de-duplicates against live `engines.slug` and supports a dry run before applying:

- `node data/add-legacy-engine-models-batch-03.mjs`
- `node data/add-legacy-engine-models-batch-03.mjs --apply`

