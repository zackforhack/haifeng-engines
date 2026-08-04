# Legacy Engine Model Goal - 3,000 Engines

Date: 2026-08-04

## Goal

Increase the live engine catalog to 3,000 total engine rows by adding discontinued or legacy engine models that are cross-validated online. No model codes in this batch are invented.

Starting live count before this goal:

- 2,788 engines

Target:

- 3,000 engines

Required net increase:

- 212 new engine rows

## Import Strategy

The import file contains more than 212 validated candidates and calculates the live Supabase engine count before importing. It skips candidate slugs already present in the database and imports only the number of missing rows required to reach the target.

Import file:

- `data/add-legacy-engine-models-to-3000-2026-08.mjs`

## Validation Sources

### Detroit Diesel

Sources:

- Diesel Parts Direct Detroit Diesel engine model guide
- Diesel Parts Direct Detroit Diesel specification-sheet index
- DieselNet / Detroit Diesel Corporation 1998 phase-down announcement

Validation notes:

- The 53, 71, 92, and 149 two-cycle families are validated as real Detroit Diesel model series.
- DieselNet reports Detroit Diesel's shift away from two-cycle products, including the 53, 71, 92, and 149 series, with the transition expected to complete by mid-1999.
- These exact models have high owner-search intent for rebuilds, injectors, blowers, marine engines, generators, and reman parts.

### Volvo Penta

Sources:

- Volvo Penta marine product archive
- Marine Diesel Parts Volvo Penta model index
- Volvo Penta exchange-components guide excerpts for marine older engines

Validation notes:

- Volvo Penta's archive explicitly describes legacy marine engines as no longer in production but still supported.
- Older Volvo Penta model codes such as MD, TMD, TAMD, AQAD, AD, KAD, and KAMD are preserved because boat owners search these exact designations for spares, manuals, and repower decisions.

### Caterpillar

Sources:

- Diesel Parts Direct Caterpillar specification-sheet index
- Caterpillar official parts compatibility pages
- Diesel Pro Caterpillar marine and industrial model index
- Lamy Power Caterpillar technical sheet page for legacy 3400-family marine engines

Validation notes:

- The batch uses older Caterpillar 300, 3000, 3100, 3200, 3300, and 3400 model families from published model/specification indexes and parts compatibility sources.
- Rows are targeted at exact model searches such as 3304B DIT, 3306B DITA, 3408, and 3412.

### DEUTZ

Sources:

- DEUTZ official engine data-sheet archive
- Diesel Parts Direct DEUTZ specification-sheet index
- DEUTZ 912/913 service-manual excerpts

Validation notes:

- The batch uses DEUTZ archive families such as 2011, 912, 913, 914, 1013, and 1015.
- These model codes are valuable for air-cooled industrial diesel replacement and rebuild searches.

### John Deere

Sources:

- Powerline Components John Deere engine identification guide
- John Deere current industrial engine page, used to separate modern PowerTech model conventions from older numbered engine families

Validation notes:

- The batch uses older John Deere 300, 350, 400, 450, 500, 550, and 650 engine identification families.
- Exact old model codes such as 3152, 4219, 6359, 6466, and 6081 are retained for parts and rebuild search intent.

### Cummins, Kubota, Waukesha Fallback Candidates

Sources:

- ProDieselParts Cummins engine model index
- Cummins G-Drive pages for older non-regulated/mechanical models
- Kubota Engine Parts Direct manuals index
- Kubota official product pages for older Tier 1/Tier 2 model variants
- Waukesha Engine Historical Society model-designation pages
- Cooper Machinery Services Waukesha VHP history

Validation notes:

- These candidates are included as overflow if existing database rows overlap with the higher-priority Detroit, Volvo Penta, Caterpillar, DEUTZ, and John Deere candidates.
- The script imports only as many missing rows as needed to reach 3,000 total engines.

## QA Expectations

Expected risks:

- Some legacy pages will have lower completeness scores where source pages validate model existence and application but do not publish full dimensions or power curves.
- This is acceptable for long-tail SEO model coverage as long as there are no critical/high QA issues and no invented fields.

Post-import checks to run:

- `node --check data/add-legacy-engine-models-to-3000-2026-08.mjs`
- `npm run test:database`
- `DATA_QA_FAIL_ON=high npm run data:qa`

