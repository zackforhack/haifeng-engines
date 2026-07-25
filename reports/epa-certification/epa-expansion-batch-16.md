# EPA Expansion Batch 16

## Scope

This tranche resolves six opaque Yanmar certification names through a reviewed
EPA-to-commercial crosswalk. It also corrects a Yanmar displacement error and
adds four official model datasheets. No public duplicate pages were created.

## Reviewed Aliases

| EPA certification name | Existing database page | Evidence |
|---|---|---|
| `5ENGAA` | `3TNM74F-NG6GE` | 0.993 L, 9 kW EPA node, Tier 4 Final |
| `4WNGAA`, `4WNGPA` | `3TNV80F-NG6GE` | 1.267 L, 11 kW EPA node, Tier 4 Final |
| `4HNGFM`, `4HNGPM` | `3TNV88F-UG6GE` | 1.642 L, 16 kW EPA node, Tier 4 Final |
| `3NNGAG` | `4TNV88-CL` | Same 2.19 L EPA families, 22-24 kW, Tier 4 Final |

The first three groups align with Yanmar's official 1800 RPM generator
datasheets. `3NNGAG` and `4TNV88-CL` occur in the same annual EPA engine
families and share displacement, aspiration and emissions tier.

## Data Corrections

Both `3TNM74F-NGGE` and `3TNM74F-NG6GE` stored `0.954 L`. Yanmar's official
datasheet specifies an 84 mm by 77 mm bore and stroke and `0.993 L`
displacement. Both pages now store `0.993 L`, and their descriptions identify
the generator family without inferring additional electrical ratings.

The `3TNV80F-NG6GE` description was also expanded with its verified 1.267 L,
1800 RPM and Tier 4 Final context.

## Official Datasheets

Four official Yanmar PDFs were uploaded and linked across seven relevant pages:

- `3TNM74F-NGGE`
- `3TNV80F-NGGE`
- `3TNV88F-UGGE`
- `4TNV88C` Tier 4

The corresponding `NG6GE` and `UG6GE` frequency variants reuse the same
family datasheets where appropriate.

## Verified Coverage Result

| Metric | Before | After |
|---|---:|---:|
| Reviewed certification aliases | 64 | 70 |
| Mapped-manufacturer coverage | 51.6% | 52.3% |
| Generator-priority review queue | 9 | 3 |
| Not represented | 533 | 527 |

## Remaining Priority Records

- Yanmar `3MTGAG` and `3MTGP`: both are 1.995 L, 28 kW, Tier 4 records.
  The public `4TNV84T` family has the same displacement, but current Yanmar
  material identifies its generator-emissions offering as lower regulated.
  These aliases remain deferred until an official certification crosswalk is
  available.
- FPT `F4HE9685B*J`: the EPA workbook contains both 4.485 L and 6.728 L rows
  under the same model code. It remains deferred pending certificate-level
  resolution.
