# Legacy Engine Model Discovery - Batch 04

Date: 2026-08-04

## Purpose

Continue expanding source-validated discontinued engine coverage beyond 3,052 engines. This batch prioritizes old model-code pages with unusually strong owner, restorer, generator, marine auxiliary, and parts-search intent.

## Candidate Groups

### Lister / Petter / Lister Petter

Added older stationary, industrial, and marine auxiliary models from published production-date and technical-data tables:

- Petter AA1M
- Petter AB1W
- Petter AC1MGR Marine
- Petter AC2MGR Marine
- Petter AC1W
- Lister Petter CR3
- Lister Petter CRK3
- Lister Petter CS4
- Lister Petter CS6
- Lister Petter CST6
- Lister CS 3/1
- Lister CS 5/1
- Lister CS 10/2
- Lister CS 3.5/1
- Lister CS 6/1
- Lister CS 12/2
- Lister CS 8/1
- Lister CS 16/2
- Lister FR1
- Lister FR2
- Lister FR3
- Lister FR4
- Lister FR6

Sources used: Old Timer Engines Lister/Petter technical table and Stationary Engine Parts CS/production-date references.

### MAN

Added legacy MAN D-Series and LE generator-drive variants:

- D2848 LE201
- D2848 LE203
- D2848 LE211
- D2848 LE213
- D2840 LE201
- D2840 LE203
- D2840 LE211
- D2840 LE213
- D2842 LE201
- D2842 LE203
- D2842 LE211
- D2842 LE213
- D2866
- D2866 LE201
- D2866 LE203
- D2876 LE201
- D2876 LE202
- D2876 LE203

Sources used: MAN D2848/D2840/D2842 operating instructions, MAN D2876 service/manual references, MAN D2866 specifications, and legacy MAN D-Series marine/genset parts references.

### Wärtsilä

Added ageing Vasa 32 service-demand models:

- Vasa 6R32
- Vasa 12V32

Sources used: Wärtsilä Vasa 32 performance-upgrade reference for ageing 6R32 and 12V32 installations.

## Import File

Implemented in:

- `data/add-legacy-engine-models-batch-04.mjs`

Expected record count before live de-duplication:

- 43 candidate rows

The script de-duplicates against live `engines.slug` and supports a dry run before applying:

- `node data/add-legacy-engine-models-batch-04.mjs`
- `node data/add-legacy-engine-models-batch-04.mjs --apply`

