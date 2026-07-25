# EPA Evidence Enrichment Batch 43: MHI Bulk Datasheets

Date: 2026-07-25

## Result

The repository's MHI catalog importer crawled the current official Mitsubishi
constant-speed engine catalog and matched every discovered product to an
existing database record.

- Official MHI catalog models discovered: **59**
- Exact database matches: **59**
- Product pages with a model-specific specification sheet: **58**
- Official sheets uploaded and linked: **58 of 58**
- MHI catalog models without a published sheet: **1** (`S16R-PTAA2`)
- Total Mitsubishi database pages after the batch: **100**
- Mitsubishi pages with at least one MHI specification sheet: **81**
- Total MHI specification-sheet relations: **85**

The relation count is higher than the page count because a small number of
regional or application variants retain more than one applicable MHI document.

## Controls

- Catalog and product pages were read from `engine-genset.mhi.com`.
- Only exact catalog-path-to-database-slug matches were accepted.
- China-specific `-C` variants were excluded from generic MHI matching because
  their specifications and emissions configurations can differ.
- Each downloaded asset was validated as a PDF before upload.
- Existing model-specific datasheet links were replaced idempotently.
- No ratings or emissions fields were changed by this batch.

## Verification

```text
Linked 58/58 official MHI datasheets.
0 issues across 2585 engines and 149 alternators.
```

## Reproduce

```bash
set -a
source .env.local
node data/upload-mitsubishi-specsheets.mjs
node data/upload-mitsubishi-specsheets.mjs --apply
npm run data:qa
```
