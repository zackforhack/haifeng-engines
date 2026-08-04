# Legacy Engine Model Discovery - Batch 02

Date: 2026-08-04

## Purpose

This batch expands the catalog with discontinued engine models that still have strong long-tail search value. The target pattern is exact model-code traffic from owners, mechanics, rebuilders, generator users, marine users, and parts buyers searching for older engines by designation.

These records prioritize legacy/discontinued status, mechanical specifications, and recognizable model families. Most rows intentionally avoid invented generator kWe ratings unless the source specifically supports generator-set usage.

## Brands And Models Added

### Perkins

Added discontinued Perkins heritage and 1000 Series models:

- A4.236
- T4.236
- A4.248
- 6.354
- T6.354
- 6.3544
- T6.3544
- 1004-40
- 1004-40T
- 1004-4T
- 1006-6
- 1006-6T

Why this matters: Perkins model numbers such as 4.236, 6.354, 1004, and 1006 are still searched for overhaul, swap, generator, marine, and parts contexts. Perkins' own heritage pages confirm the discontinued status and the significance of these series.

### Lister / Petter / Lister Petter

Added discontinued stationary and small industrial engines:

- Lister 9/1 (JP1)
- Lister 21/2 (JP2)
- Lister 30/3 (JP3)
- Lister 40/4 (JP4)
- Lister 616 (JP6)
- Petter AA1
- Petter AB1
- Petter AC1
- Petter AC2
- Lister Petter TS1
- Lister Petter TS2
- Lister Petter TS3
- Lister Petter TX2
- Lister Petter TX3

Why this matters: Lister and Petter legacy engines are a strong restoration, off-grid, genset, pump, and agricultural parts niche. These engines are old enough that exact model pages can rank for very specific service and replacement searches.

### Isuzu / Hino / Komatsu

Added Japanese legacy industrial diesel models:

- Isuzu 6BB1
- Isuzu 4BD1
- Isuzu 4BD1T
- Isuzu 6BD1
- Hino H06C
- Hino H07C
- Hino H07D
- Komatsu 6D95L-1
- Komatsu S6D95L-1
- Komatsu S6D105-1
- Komatsu S6D125-1

Why this matters: these model codes appear in older trucks, excavators, loaders, cranes, marine conversions, and generator/power-unit contexts. The search demand is often parts-led and model-specific.

### Waukesha

Added legacy gas engines:

- Waukesha F817G
- Waukesha F1197G

Why this matters: Waukesha legacy gas engines are searched by operators of older natural-gas compression, pump, and stationary power equipment. The F-series model codes map to older Waukesha designation systems and are useful exact-match SEO targets.

## Source Notes

- Perkins 4.236 heritage page confirms August 1964 start, family scale, 80 hp rating, and supersession by the 1000 Series.
- Perkins 6.354 heritage page confirms 1960-1996 production, more than one million units, and 120 bhp rating.
- Perkins T6.354 and 1000 Series specification pages were used for model-level displacement, power, speed, and turbo/NA details.
- Lister/Petter production date tables were used for old model production years, ratings, cooling type, weight, and displacement.
- Isuzu 6BB1 JSAE profile and model specification pages were used for displacement, dimensions, compression ratio, and power.
- Hino H06/H07 specialist parts references were used for family displacement, bore/stroke, and application context.
- Komatsu 95/105/125 service manual references were used for displacement, cylinder count, and representative power ratings.
- Waukesha historical model-designation and parts references were used for F-series identification, displacement, power range, and gas-engine configuration.

## Import File

Implemented in:

- `data/add-legacy-engine-models-batch-02.mjs`

Expected record count:

- 39 legacy/discontinued engine rows

