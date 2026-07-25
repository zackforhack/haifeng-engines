# EPA Evidence Batch 46: John Deere and Volvo Penta

Date: 2026-07-25

## Result

- Added four exact John Deere manufacturer datasheets to nine engine pages.
- Added three Volvo Penta manufacturer-issued technical documents to four
  engine pages.
- Reduced John Deere pages without a datasheet from 38 to 29.
- Reduced Volvo Penta pages without a datasheet from five to one.
- Kept MTU's 37 unresolved pages unchanged after a family-scope audit.
- Data QA: zero issues across 2,585 engines and 149 alternators.

## John Deere

The previous discovery scripts skipped engines that already had a brochure and
did not test Deere's `_60Hz`, `_PWL`, or `_PVL` filename patterns. The new
dry-run-first importer downloads candidates and requires the normalized PDF
text to contain the exact database model before it can create a relation.

| Exact model | Database pages | Manufacturer document |
| --- | ---: | --- |
| 3029HFG89 | 2 | `3029HFG89_60Hz.pdf` |
| 3029TFG89 | 2 | `3029TFG89_60Hz.pdf` |
| 4045HFG04 | 3 | `4045HFG04_PWL.pdf` |
| 6068HFG05 | 2 | `6068HFG05_PVL.pdf` |

All four files are served by `deere.com` and are stored under
`john-deere/official-spec-sheets/`.

## Volvo Penta

The Volvo documents are manufacturer-issued product bulletins or technical
data sheets mirrored by engine distributors. Each PDF was downloaded during
the dry run and checked for every exact model token before upload.

| Exact model | Document |
| --- | --- |
| TWD1643GE | Volvo Penta TWD1643GE Product Bulletin |
| TWD1663GE | Volvo Penta TWD1663GE Product Bulletin |
| TWD1672GE | Volvo Penta TWD1672GE/TWD1673GE Technical Data |
| TWD1673GE | Volvo Penta TWD1672GE/TWD1673GE Technical Data |

Sources:

- `https://www.raad-eng.com/techdata/volvo/prodbull/twd1643ge.pdf`
- `https://sra-moteur.com/uploads/catalogue/produits/documentations/twd1663ge-twd1663ge.pdf`
- `https://www.volvopenta-mexico.com.mx/generacion/TWD1672GE.pdf`

`TWD1683GE-B` remains unresolved. The available current `TWD1683GE` Stage V /
Tier 4 Final sheet is not valid evidence for the older `-B` certification
variant.

## MTU Scope Audit

The local MTU Series 2000 Gx5 sheet explicitly covers G25/G65 at 50 Hz and
G45/G85 at 60 Hz. Those pages were already linked. It was not extended to
G15/G75 or other suffix variants. Existing Gx1, Gx4, Gx5, Gx6, and P-series
documents were likewise kept within their explicitly published model scopes.

## Reproduction

```bash
node data/enrich-john-deere-datasheets-2026-07.mjs
node data/enrich-john-deere-datasheets-2026-07.mjs --apply
node data/enrich-volvo-penta-datasheets-2026-07.mjs
node data/enrich-volvo-penta-datasheets-2026-07.mjs --apply
npm run data:qa
```
