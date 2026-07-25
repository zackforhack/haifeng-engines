# EPA Evidence Enrichment Batch 44: Kubota Datasheet Rebuild

Date: 2026-07-25

## Result

The legacy Kubota importer was audited and rebuilt after its base-model regex
was found to return an empty key for common hyphenated models. That empty key
allowed unrelated product IDs to enter the same fallback candidate pool.

- Kubota engine pages audited: **65**
- Legacy managed datasheet links: **38**
- Exact verified links rebuilt: **33**
- Intentionally unmatched pages: **32**
- Upload or relation failures: **0**
- Unsupported legacy links removed: **5**

## New Matching Rule

A Kubota database model is eligible only when both of these values match an
official Kubota product record:

1. Engine-family prefix before the emissions code.
2. Numeric Kubota emissions generation (`E2`, `E3`, `E4`, or `E5`).

Examples:

- `D1803-CR-TI-E4-BG` matches official `D1803-CR-TI-E4B`.
- `V3800DI-T-E3BG-CHN-1` matches official `V3800DI-T-E3B`.
- `V2403-CR-NT-BG-EF` remains unmatched because `EF` does not establish a
  numeric Kubota generation.
- `V2003-M-BG-ET` remains unmatched for the same reason.

The importer no longer falls back to a base-only candidate. This deliberately
reduces document coverage where the available sheet cannot be proven to match
the page's emissions generation.

## Scope

Only `engine_pdfs` relations whose storage path begins with
`kubota/spec-sheets/` were replaced. Engine records, ratings, emissions data,
manually managed documents, and storage objects were not deleted.

## Verification

```text
Rebuilt 33 verified Kubota links; 32 intentionally unmatched; 0 failed.
0 issues across 2585 engines and 149 alternators.
```

## Reproduce

```bash
set -a
source .env.local
node data/upload-kubota-specsheets.mjs
node data/upload-kubota-specsheets.mjs --apply
npm run data:qa
```
