# EPA Expansion Batch 17

## Scope

This tranche resolves the final three records in the 2024+ mapped-brand,
constant-speed EPA priority queue. Each is published as an exact EPA
certification-model page rather than being forced onto an uncertain commercial
alias.

## Exact Additions

| Brand | Model | Configuration | EPA output |
|---|---|---|---:|
| FPT | `F4HE9685B*J` | 6.728 L inline-6, turbocharged and intercooled | 172 kWm |
| Yanmar | `3MTGAG` | 1.995 L inline-4, turbocharged | 28 kWm |
| Yanmar | `3MTGP` | 1.995 L inline-4, turbocharged | 28 kWm |

All three records use 1800 RPM as their primary speed. The stored power values
are EPA-certified mechanical output, not inferred generator electrical output.

## FPT Conflict Resolution

EPA rows from 2012 through 2016 list `F4HE9685B*J` as a four-cylinder 4.485 L
engine even though the family name identifies 6.7 L. From 2017 through 2026,
every row consistently identifies:

- Six inline cylinders
- 104 mm bore and 132 mm stroke
- 6.728 L displacement
- 172 kWm at 1800 RPM
- U.S. EPA Tier 3

The current page therefore uses the consistent ten-year six-cylinder record.
The official FPT G-Drive Power Generation Line-Up is linked as the broader N67
family reference.

## Yanmar Certification Models

`3MTGAG` and `3MTGP` recur in EPA annual data with the same 84 x 90 mm,
1.995 L turbocharged inline-four configuration and 28 kWm output. Their
commercial-name crosswalk remains undocumented, so the database preserves the
exact EPA model identifiers.

The `3MTGP` page also links the official California Air Resources Board 2016
Yanmar executive order, which lists `3MTGP` at 37.5 hp / 1800 RPM in the
matching 2.0 L family.

## Verified Coverage Result

| Metric | Before | After |
|---|---:|---:|
| Exact manufacturer/brand matches | 227 | 230 |
| Verified commercial family matches | 54 | 55 |
| Mapped-manufacturer coverage | 52.3% | 52.8% |
| Generator-priority review queue | 3 | 0 |
| Not represented | 527 | 523 |

The additional family match is why the represented gain is four after adding
three exact pages.

## Next Audit Boundary

The zero queue applies specifically to recent (`2024+`) constant-speed models
from EPA manufacturers already mapped to database brands. The remaining 523
unrepresented combinations include older certifications, variable-speed
equipment, unmapped manufacturers and models outside the current
generator-drive priority definition. They should be triaged separately rather
than treated as equally valuable additions.
