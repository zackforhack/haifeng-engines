# Legacy Engine Quality Hardening

Date: 2026-08-04

## Purpose

After reaching 3,000 engine rows, this pass audited the newly imported legacy/discontinued models for weak or suspicious fields. The focus was to improve quality without inventing model-specific specifications.

## Corrections And Enrichment

### Volvo Penta

Actions:

- Corrected Volvo Penta 2001 from 2 cylinders to 1 cylinder.
- Added sourced horsepower, rated rpm, cylinder count, and production-year fields for older MD, 2000 Series, AQD, TMD, TAMD, KAD, and large TAMD marine models where reliable source data was available.
- Left fields blank where sources validate the model but do not provide a reliable model-specific value.

Sources used:

- Volvo Penta official marine product archive
- Volvo Penta 2001/2002/2003/2003T workshop manual
- Hoffmann Wassersport Volvo Penta model guide
- Volvo Penta TAMD63/TAMD74 operator manuals
- Volvo Group press releases for TAMD72, TAMD74C, and TAMD165
- Volvo Penta TAMD122P and TAMD162/163 workshop/manual references

### Caterpillar

Actions:

- Added representative horsepower for older Caterpillar D334, D342, D343, D346, D348, D349, and D333C rows.
- Kept older Caterpillar part-compatibility/model rows where Caterpillar or legacy engine listings validate the model designation.

Sources used:

- Caterpillar parts compatibility pages
- NauticExpo Caterpillar D334 Propulsion brochure page
- EngNet legacy Caterpillar engine listing
- Caterpillar official 3406C product page for 3400-family spec validation

### DEUTZ

Actions:

- Replaced the too-generic `TD 2011` row with the source-listed `TD 2011 L4 I` model.
- Added displacement, cylinder count, power, rpm, and compression-ratio fields for DEUTZ 2011 rows where DEUTZ 2011 specification tables provide exact values.
- Added representative power for DEUTZ F 4L 914 and F 6L 914 from DEUTZ archive/listing sources.

Sources used:

- DEUTZ official engine data-sheet archive
- DEUTZ 2011 Series published specification table
- DEUTZ Americas previous-generation engine listings

## Files

Implemented in:

- `data/harden-legacy-engine-model-quality-2026-08.mjs`

Also corrected source candidate definitions in:

- `data/add-legacy-engine-models-to-3000-2026-08.mjs`

## QA Expectation

This pass should reduce medium low-completeness warnings substantially while preserving the rule that unsourced values stay blank.

