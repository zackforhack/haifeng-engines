# EPA Coverage Revalidation - 2026-07-25

## Inputs

- EPA workbook: `nonroad-compression-ignition-2011-present (1).xlsx`
- Workbook SHA-256:
  `9e78cf00ca4f930899fed3d66101145f32dade525e8e68d5394b3df56cf5593c`
- Initial live Supabase export: **2,585 engines**
- Export SHA-256:
  `d0fc4745b228ae0f7ef52242a7c604fad3775315519660fb68225c1528f858ff`
- Post-resolution live Supabase export: **2,596 engines**
- Post-resolution export SHA-256:
  `d9796558216cdfe644797536660bad1312779dfb4126a4cfbe7eb4c2979c34f2`

## Verified Coverage

- Exact-1800 source rows: **15,773**
- Distinct EPA manufacturer/model identities: **970**
- Identities explicitly certified for constant-speed operation: **716**
- Explicit constant-speed identities represented: **716**
- Explicit constant-speed coverage: **100.0%**
- Missing explicit constant-speed identities: **0**
- Unmapped explicit constant-speed manufacturers: **0**

The live re-run reproduced the previous constant-speed result. Every
represented identity resolves to at least one current database page.

## Blank-Operation Review And Resolution

EPA leaves `Engine Operation` blank for 22 identities in the exact-1800
population. Reviewing every speed listed for each exact model produced:

- Resolved to existing Yanmar pages using same-family and same-power evidence:
  **3**
- Added as reviewed Daedong, FPT and Kubota pages in expansion batch 41:
  **11**
- Represented fixed-speed identities: **14 of 14**
- Remaining unrepresented fixed-speed identities: **0**
- Mixed-speed or unmapped models not treated as fixed-speed generator
  candidates: **8**

The 11 identities resolved in expansion batch 41 are:

| Manufacturer | EPA model | Workbook speeds RPM | Latest year | Status |
|---|---|---|---:|---|
| Daedong | 3HG4 | 1500, 1800 | 2025 | Exact page added |
| Daedong | 3HTIG4 | 1500, 1800 | 2025 | Exact page added |
| Daedong | 4HTG4 | 1500, 1800 | 2026 | Exact page added |
| Daedong | 4HTIG4 | 1500, 1800 | 2026 | Exact page added |
| FPT | F5BFL415A*B | 1800 | 2022 | Exact technical-code page added |
| FPT | F5BFL415B*B | 1800 | 2022 | Exact technical-code page added |
| FPT | F5BFL415A*C | 1800 | 2025 | Exact technical-code page added |
| FPT | F5BFL415B*C | 1800 | 2025 | Exact technical-code page added |
| FPT | F5HGL465A*X | 1800 | 2025 | Exact technical-code page added |
| FPT | F5HGL465B*X | 1800 | 2025 | Exact technical-code page added |
| Kubota | V2203LBDI-EF | 1800 | 2026 | Mapped to official V2203L-DI-EF page |

Kubota's official emissions-certificate lookup confirms the
`V2203L-DI-EF(e)` family from 2023 through 2026:
<https://www.kubotaengine.com/engines/emission-certificates/emissions-certificates-lookup/>.

## Scope Conclusion

The explicit EPA constant-speed diesel scope and the additional blank-operation
fixed-speed scope are complete. Variable-speed-only models are not missing
generator pages merely because an EPA test point occurs at 1800 RPM.
