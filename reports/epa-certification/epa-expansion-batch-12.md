# EPA Expansion Batch 12

## Scope

This batch adds ten exact Mitsubishi EPA engine models and six reviewed
commercial-model mappings from the 1800 RPM generator-priority queue.

## Live Database Changes

- Added `D04EG-MECH-TAA` and `D04EG-T`.
- Added the EPA-certified `L2E`, `L3E`, `S3L2` and `S4L2` models.
- Added `S4S` and `S4S-DTB`.
- Added `D03CJ-TAA` and `D04CJ-TAA`.
- Used the latest EPA-certified 1800 RPM mechanical output.
- Added Mitsubishi-published 60 Hz prime and standby ratings only for the six
  multi-purpose generator models covered by its official generator brochure.

## Reviewed Commercial Mappings

- `S12A2-PTAW` to `S12A2-Y2PTAW-2`.
- `S12H-PTAW` to `S12H-Y2PTAW-1`.
- `S12R-PTAW` to `S12R-Y2PTAW-1`.
- `S16R-PTAW` to `S16R-Y2PTAW-1`.
- `S16R-PTAW2` to `S16R-Y2PTAW2`.
- `S6R-PTAW` to `S6R-Y2PTAW`.

The EPA workbook's engine-code field contains these longer `Y2PTAW`
commercial designations, and each target page agrees on displacement,
Tier 2 certification and 1800 RPM operation.

## Official Documents

- Mitsubishi Multi-Purpose Generator Engine specification.
- Mitsubishi CJ/EG Series specification.
- Mitsubishi SS Series S4S specification.

## Verified Coverage Result

| Metric | Before | After |
|---|---:|---:|
| Exact manufacturer/brand matches | 137 | 147 |
| Reviewed certification aliases | 53 | 59 |
| Mapped-manufacturer coverage | 37.1% | 39.0% |
| Generator-priority review queue | 128 | 112 |
| Not represented | 652 | 636 |

## Data Boundaries

EPA-certified mechanical output is not treated as an electrical generator-set
rating. Prime and standby fields remain empty unless Mitsubishi publishes the
corresponding 1800 RPM generator rating for that commercial model.
