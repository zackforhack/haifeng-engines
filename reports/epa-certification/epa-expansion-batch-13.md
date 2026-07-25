# EPA Expansion Batch 13

## Scope

This consolidated tranche covers 42 recent constant-speed EPA gaps across five
manufacturers without triggering an intermediate Vercel deployment.

## Exact Additions

| Brand | Exact models |
|---|---:|
| FPT | 11 |
| Perkins | 7 |
| Isuzu | 11 |
| Deutz | 10 |
| Yanmar | 2 |
| **Total** | **41** |

Every exact page uses the EPA workbook's latest certified 1800 RPM mechanical
power node. No electrical prime or standby rating is inferred from that value.

## Reviewed Alias

Perkins `403F-15(C1.5)` is mapped to the new `403F-15` page. Both EPA records
share the same 1.496 L displacement, certification tier, engine codes, power
range and 1800 RPM operation.

## Document Reuse

The migration links official documents already stored in Supabase:

- FPT G-Drive Power Generation Line-Up 2025.
- Perkins Regulated Engine Selection Chart 2026.
- Isuzu Engines & Power Units Product Line-up 2026.
- Deutz TCD2013L06 engine datasheet for the matching L6 family.
- Yanmar TNV Series product brochure.

No duplicate manufacturer PDF uploads are required.

## Verified Coverage Result

| Metric | Before | After |
|---|---:|---:|
| Exact manufacturer/brand matches | 147 | 188 |
| Reviewed certification aliases | 59 | 60 |
| Mapped-manufacturer coverage | 39.0% | 44.2% |
| Generator-priority review queue | 112 | 70 |
| Not represented | 636 | 590 |

The new exact pages also resolved four related commercial-family or
cross-brand records, which is why the represented gain exceeds 42.

## Deferred Records

- FPT `F4HE9685B*J` is deferred because the EPA rows conflict on 4.485 L
  versus 6.728 L displacement.
- Eight opaque Yanmar certification names are deferred until they can be
  cross-walked to public commercial model names.

This is a data-integrity boundary: ambiguous certification identifiers are not
published as user-facing engine pages.
