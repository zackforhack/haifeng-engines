# EPA Constant-Speed Coverage Closeout

## Result

The reviewed EPA 1800 RPM generator-engine expansion is complete for the
constant-speed scope.

- Distinct EPA manufacturer/model combinations reviewed: **970**
- Models with at least one constant-speed certification: **716**
- Constant-speed models represented in the database: **716**
- Constant-speed coverage: **100.0%**
- Unrepresented constant-speed models: **0**
- Constant-speed models under an unmapped manufacturer: **0**

## Coverage Methods

The 716 represented models comprise:

| Match method | Models |
| --- | ---: |
| Exact manufacturer/brand and model | 348 |
| Reviewed certification alias | 219 |
| Verified commercial family | 51 |
| Reviewed certification trim | 44 |
| Redundant brand prefix removed | 34 |
| Verified base trim | 12 |
| Fully represented certification group | 8 |

Aliases, trims and family matches were accepted only after manufacturer,
configuration, displacement, emissions and generator-application review. The
full evidence trail remains in the numbered batch reports and
`epa-1800rpm-model-match.json`.

## Excluded Scope

The source workbook still contains EPA identities that are not represented,
but these do not have a constant-speed certification:

- Variable-speed-only industrial and mobile engines
- Records whose family data does not identify constant-speed operation
- Certification identities that should not be presented as conventional
  fixed-speed generator-drive models without further application evidence

These records remain in the JSON analysis for reference. They are excluded
from the generator-engine expansion queue to prevent nominal 1800 RPM test
points from being mistaken for certified constant-speed generator ratings.

## Verification

- Live Supabase catalog: **2,585 engines and 149 alternators**
- Data QA: **0 issues**
- Production build: **passed**
- Unmapped constant-speed manufacturer queue: **0**

Primary data source: EPA Annual Certification Data for Vehicles, Engines, and
Equipment, `nonroad-compression-ignition-2011-present (1).xlsx`.
