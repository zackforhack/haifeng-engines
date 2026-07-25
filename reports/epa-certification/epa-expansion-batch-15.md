# EPA Expansion Batch 15

## Scope

This tranche resolves the 17 generator-priority EPA records that could be
verified without inventing a model crosswalk. It was applied as one Supabase
batch and is intentionally held in a local commit to avoid an intermediate
Vercel deployment.

## Exact Additions

| Brand | Models |
|---|---|
| Volvo Penta | `TWD1683GE-B` |
| Cummins | `QSK19-C`, `S17`, `QSK23-C`, `QSM11-C` |
| Kubota | `V2403-CR-NT-BG-EF`, `V2403-CR-NTI-BG-EF`, `V3800-CR-TI-BG-ET` |

The eight pages store the maximum EPA-certified 1800 RPM mechanical output in
`power_kw`. Their descriptions preserve the full certified `kWm` range where
the workbook contains multiple configurations. No generator electrical output
was inferred from EPA data.

The Volvo `TWD1683GE-B` Tier 2 record remains distinct from the current
Stage V / Tier 4 Final `TWD1683GE`. The Cummins `-C` records also remain
distinct from existing generator-drive variants with materially different
ratings or emissions.

## Reviewed Aliases

- Kubota `V3300-BG-EF` maps to `V3300-E3-BG`.
- Perkins `C1.1` maps to the existing 1.132 L Tier 4 Final `S773L-F`.
- Perkins `C1.5` maps to the existing 1.496 L Tier 4 Final `403F-15`.

These aliases are restricted by EPA manufacturer and normalized certification
name. They do not create duplicate public engine pages.

## Reviewed Family Matches

- Cummins `QSL` maps to the existing Tier 3 `QSL9` generator-drive family.
- Perkins `C2.2` maps to Tier 4 Final `404J` pages.
- Perkins `C7.1` maps to Tier 4 Final `1206F` pages.
- Weichai filings for `6M33`, `12M33` and `16M33` map to the corresponding
  Baudouin M33 pages. Official Weichai product material identifies these as
  Baudouin families within the Weichai group.

Each family rule requires both the reviewed brand prefix and a compatible U.S.
EPA emissions label on the target page.

## Official Document

The Cummins `S17` page now links the official Cummins S17 60 Hz EPA Tier 2
generator-set specification. The file confirms the 16.8 L inline-six,
dual-turbo platform and its 600-1000 kWe generator range. The electrical range
is kept separate from the EPA workbook's certified mechanical output.

## Verified Coverage Result

| Metric | Before | After |
|---|---:|---:|
| Exact manufacturer/brand matches | 219 | 227 |
| Reviewed certification aliases | 61 | 64 |
| Verified commercial family matches | 48 | 54 |
| Mapped-manufacturer coverage | 49.5% | 51.6% |
| Generator-priority review queue | 26 | 9 |
| Not represented | 546 | 533 |

The catalog-wide QA reports zero issues across 2,433 engines and 149
alternators.

## Deferred Priority Records

Nine recent constant-speed records remain:

- Eight Yanmar names (`3MTGAG`, `3MTGP`, `3NNGAG`, `4HNGFM`, `4HNGPM`,
  `4WNGAA`, `4WNGPA`, `5ENGAA`) are internal certification identifiers.
  They need a manufacturer crosswalk before they can be mapped to commercial
  TNV generator models.
- FPT `F4HE9685B*J` is deferred because EPA rows conflict on displacement
  (4.485 L and 6.728 L). It must not be aliased or published until that
  conflict is resolved from the certificate or an official FPT document.
