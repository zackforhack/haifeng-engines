# Haifeng Engine Datasheet Coverage Handoff

Updated: 2026-08-02 (Asia/Shanghai)

## Active Goal

Increase dedicated/exclusive engine datasheet coverage to at least 80% using only discovered real public OEM/model-specific datasheet PDFs.

Current authoritative report: `reports/datasheet-coverage/2026-08-02.json`

- Engines: 2,715
- Overall datasheet coverage: 2,190 / 2,715 = 80.7%
- Dedicated/exclusive coverage: 1,023 / 2,715 = 37.7%
- 80% exclusive target: 2,172 rows
- Remaining needed: 1,149 verified one-row links
- PDF links / unique stored files: 3,812 / 1,305
- Generated Haifeng model datasheet links: 0

## Hard Guardrails

- Backend/data only: Supabase data, integrity QA, import/update scripts, datasheets, engine coverage, backend tests.
- Do not edit frontend files. Known unrelated frontend work: `app/engines/[slug]/page.tsx`, `components/TrackedExternalLink.tsx`.
- Do not stage, commit, push, or deploy without explicit approval.
- Before every file edit and every database write: re-read this file and run `git status --short`.
- Use `apply_patch` for file edits.
- Use only real public online PDFs. OEM-hosted preferred.
- Distributor-hosted PDFs are acceptable only when the PDF itself is OEM-authored and exact/model-specific.
- Reject generated/self-created PDFs, manuals, mirror sites, family/range PDFs, emissions certs, generic brochures, vendor/genset package sheets, and shared files that would game row-exclusive coverage.

## Verification Contract

For every candidate PDF:

1. Confirm PDF bytes (`%PDF`).
2. Extract text with `pdftotext -layout`.
3. Verify exact model tokens, OEM/provenance tokens, and spec/rating tokens.
4. Reject if sibling/range tokens show the PDF covers multiple current rows.
5. Dry run importers first.
6. Before applying an importer, re-read this file and run `git status --short`.
7. After applied imports, run `node data/pdf-coverage.mjs`, `npm run test:database`, and `npm run data:qa`.

Load Supabase env, when needed, from the original checkout:

```bash
set -a; source /Users/ziqianhuang/haifeng-engines/.env.local; ...
```

## Working Memory Rules

- Treat this file as the compact working memory.
- Detailed accepted/rejected evidence lives in `reports/datasheet-coverage/oem-discovery-2026-08-01.md`; query it with targeted `rg`, do not dump it wholesale.
- Leave untracked backend helper scripts and coverage reports in place as evidence/import tooling.
- Do not delete or stage repo cleanup artifacts unless the user explicitly asks for repository cleanup.

## Latest Verified Import

Latest applied importer: `data/attach-scania-kaihua-official-dc16-gap-spec-sheets-2026-08.mjs`

Imported verified Scania-authored DC16 power-generation spec sheets from Kaihua public download records:

- `scania-dc16-093a-02-51`
- `scania-dc16-078a-02-44`

Post-import verification passed: `node data/pdf-coverage.mjs`, `npm run test:database`, `npm run data:qa`.

## Current Cleanup State

- Prepared prune/reassign helpers rechecked on 2026-08-02 for Cummins, Cummins/Deutz, Yanmar, Baudouin/Weichai, PSI/Mitsubishi, and Mitsubishi China-variant links; dry runs report 0 remaining removals.
- `prune-exclusive-datasheet-sibling-links-2026-08.mjs` and `reassign-baudouin-60hz-exclusive-datasheets-2026-08.mjs` are stale because their expected old links are already gone/moved.
- Shared-file cleanup found no safe row-exclusive gain; do not promote shared/range technical docs just to move the metric.

## High-Signal Rejections

Do not revisit these unless a new direct public OEM PDF appears:

- Broad dead zones: SDEC, VMAN, Lister Petter, broad Volvo/FPT/Cummins/MTU gaps.
- Recently rechecked brands with manuals, mirrors, shared docs, HTML-only specs, blocked pages, certs, or no public PDFs: Baudouin, Perkins, Rehlko/Kohler/KDW, Hatz, Yanmar, FPT, Shibaura, Komatsu, Tecogen, Hino, 2G, Kirloskar, Daihatsu, Origin Engines, Liyu, Yuchai, Jichai, Mitsubishi, Ford industrial, VM Motori, Zenith, Niigata/IHI, Kawasaki, Bergen, John Deere, Mahindra, International, Googol, Detroit Diesel.
- Known shared/range traps: PSI 8.8L, Generac `RG02224`/`RG02724`, MTU Series 1600 product-list PDFs, Volvo Penta `TAD880-882GE`, DEUTZ `TCD 2013 for generator sets`, MWM `TCG 3016`/`3020`/`2032B` brochures, Scania `DC13 505A/506A`.
- Known exact-HTML/no-public-PDF traps: Perkins `404J-E22TAG`, John Deere `3029HG530`/`6090HFG84`, Mesa `GX22`, Lister Petter product pages.
- Known mismatch/404 traps: Volvo `TWD1683GE` is not `TWD1683GE-B`; Kirloskar `KFP4R-UF15` PDFs do not contain `4R1040TA`; Baifa `6M11G110/6` URL returned non-PDF; Yanmar guessed current-gap URLs returned 404.
- Weichai official enumeration found exact PDFs for nearby variants, not current gaps: `16M33D1680E310`, `16M33D1800E310`, `12M33D1240E310`, scanned `12M33D1450E310`; no usable `16M33D1530E310`, `20M33D2210E310`, or `12M33D1320E310`.
- Cummins `mart.cummins.com` scans found real one-model PDFs only for non-current-gap rows such as `4BTAA3.3-G12` through `G18`, `6CTAA8.3-G7`, `6LTAA9.5-G1/G3`, and `KTA19-G4`; follow-up `0064100`-`0064230` scan found no current-gap one-row sheets.

## Next Move

Use `reports/datasheet-coverage/missing-exclusive-2026-08-02.json` and target one compact likely-OEM-PDF cluster. Current promising dry-run-only candidates are the Emean crawler scripts, but Emean is distributor-hosted, so accept output only if the PDF text itself proves OEM-authored exact model-specific content:

- `data/crawl-emean-small-brand-engine-datasheets-2026-08.mjs`
- `data/crawl-emean-cummins-engine-datasheets-2026-08.mjs`
- `data/crawl-emean-weichai-engine-datasheets-2026-08.mjs`

Keep the goal active until dedicated/exclusive coverage reaches at least 80% and is verified.
