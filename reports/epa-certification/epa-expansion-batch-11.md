# EPA Expansion Batch 11

## Scope

This batch adds 16 exact Cummins generator-drive models and three reviewed
commercial-family mappings from the EPA 1800 RPM priority queue.

## Live Database Changes

- Added six B3.3 generator-drive variants.
- Added three current KD Series models.
- Added `QSB7-G4`, `QSK23-G7 NR2`, `QSK38-G16`, `QSK50-G22`,
  `QSK50-G23`, `QSK78-G10` and `QSZ13-G9`.
- Used the latest EPA-certified 1800 RPM mechanical output.
- Added official prime and standby ratings for `4BTAA3.3G12` and
  `QSK23-G7 NR2`.

## Reviewed Family Mappings

- `QSK78-G` to the existing `QSK78` family page.
- `QST30-G` to the existing `QST30` family page.
- `QSX15-G` to the existing `QSX15` family page.

## Official Documents

- Cummins `4BTAA3.3-G12` 60 Hz specification sheet.
- Cummins `QSK23-G7` 60 Hz EPA Tier 2 specification sheet.
- Cummins Centum QSK38 specification sheet.

## Verified Coverage Result

| Metric | Before | After |
|---|---:|---:|
| Exact manufacturer/brand matches | 121 | 137 |
| Reviewed certification aliases | 50 | 53 |
| Mapped-manufacturer coverage | 34.8% | 37.1% |
| Generator-priority review queue | 147 | 128 |
| Not represented | 671 | 652 |

## Deferred Models

The following broad industrial certification names remain under review:

- `QSL`
- `QSM11-C`
- `QSK19-C`
- `QSK23-C`
- `S17`

They combine multiple power nodes or applications and should not be represented
as a single generator rating without an official commercial crosswalk.
