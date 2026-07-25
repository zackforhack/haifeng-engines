# EPA Expansion Batch 14

## Scope

This tranche resolves 44 recent constant-speed EPA coverage gaps across seven
database brands. It was applied as one Supabase batch and does not trigger an
intermediate Vercel deployment.

## Exact Additions

| Brand | Exact models |
|---|---:|
| Hyundai | 8 |
| Caterpillar | 6 |
| John Deere | 3 |
| Kirloskar | 6 |
| Kohler | 4 |
| Liebherr | 2 |
| Baudouin | 2 |
| **Total** | **31** |

Each page preserves the EPA workbook's certified 1800 RPM mechanical power
range. The maximum certified `kWm` is stored as the representative power value;
no generator electrical output is inferred.

## Reviewed Family Matches

The EPA workbook uses short family names for models that already have multiple
commercial generator-drive pages in the database:

- John Deere `3029`, `4045`, `6068`, `6090`, and `6136`.
- Baudouin `6M33`, `8M33`, `12M33`, `12M55`, `16M33`, `16M55`, and `20M33`.

The analyzer now recognizes only these explicit manufacturer, brand and prefix
combinations. A candidate database page must also carry a compatible U.S. EPA
emissions label, so an unregulated variant cannot satisfy certification
coverage.

## Reviewed Alias

Liebherr `D976 A7-02` maps to the existing `D976` page. Both records identify
the 17.96 L inline-six family, Tier 2 certification and the same 670-820 kWm
1800 RPM range.

## Document Reuse

The migration links official documents already stored in Supabase where the
document clearly covers the model or family:

- Hyundai HCE engine and DX power-generation brochures, plus the DM02 sheet.
- Caterpillar Electric Power Ratings Guide.
- Rehlko/Kohler KDI1903 specification and KD Series brochure.
- Liebherr Combustion Engines Product Line.

No document was attached to a new page when the existing file did not clearly
cover that model.

## Verified Coverage Result

| Metric | Before | After |
|---|---:|---:|
| Exact manufacturer/brand matches | 188 | 219 |
| Reviewed certification aliases | 60 | 61 |
| Verified commercial family matches | 36 | 48 |
| Mapped-manufacturer coverage | 44.2% | 49.5% |
| Generator-priority review queue | 70 | 26 |
| Not represented | 590 | 546 |

All 44 target records now resolve, and the catalog-wide data QA reports zero
issues across 2,425 engines and 149 alternators.

## Remaining Priority Queue

The remaining recent constant-speed review set is dominated by opaque
certification identifiers rather than straightforward missing commercial
models:

- Yanmar internal configuration names require manufacturer crosswalks.
- Cummins and Kubota records need reviewed aliases or distinct-page decisions.
- One FPT record remains deferred because EPA rows conflict on displacement.
- Volvo Penta and Weichai/Baudouin records are likely alias or ownership-family
  mappings and should be handled without duplicate pages.

