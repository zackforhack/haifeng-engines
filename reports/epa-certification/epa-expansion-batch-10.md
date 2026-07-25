# EPA Expansion Batch 10

## Scope

This batch adds the 29 MTU generator-engine models in the current EPA priority
queue as exact 1800 RPM commercial model pages.

## Live Database Changes

- Added 11 Series 1600 models covering 6R, 8V and 10V configurations.
- Added six current Series 1600 V12 configurations.
- Added seven Series 2000 V12, V16 and V18 configurations.
- Added five Series 4000 V12 configurations.
- Preserved MTU application suffixes such as `S`, `3B` and `3D`.
- Used each model's latest EPA-certified 1800 RPM mechanical power.
- Classified prime and standby mechanical ratings only where the MTU
  application designation makes that rating explicit.

## Official Documents

Public MTU documents are attached to 13 of the new pages:

- Series 1600 6R power-generation operating instructions.
- 12V1600 Gx0/Gx1 60 Hz gendrive specification.
- 16V2000 Gx6 60 Hz gendrive specification.
- 18V2000G76S generator-set specification.
- Series 4000 Gx4 60 Hz gendrive specification.

The remaining pages retain EPA certification as the primary source and do not
receive a loosely related document.

## Expected Coverage Result

| Metric | Before | Expected after |
|---|---:|---:|
| Exact manufacturer/brand matches | 92 | 121 |
| Mapped-manufacturer coverage | 31.3% | 34.8% |
| Generator-priority review queue | 176 | 147 |
| Not represented | 700 | 671 |

## Sources

- EPA Annual Certification Data for Vehicles, Engines, and Equipment,
  nonroad compression-ignition workbook.
- MTU Power Generation Products List.
- MTU public gendrive specifications and operating instructions.
