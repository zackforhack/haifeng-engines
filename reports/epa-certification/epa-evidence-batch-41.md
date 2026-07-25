# EPA Evidence Enrichment Batch 41

Date: 2026-07-25

## Mitsubishi S16R-Y2PTAW2-1 Rudox Tier 4 Final

- Database page: `/engines/mitsubishi-s16r-y2ptaw2-1-rudox-tier4f`
- Application evidence: EPA annual certification data identifies the specific
  ENER-G Rudox configuration as U.S. EPA Tier 4 Final.
- Rating evidence: the official Mitsubishi Heavy Industries
  `S16R-Y2PTAW2` specification sheet.
- Frequency and speed: 60 Hz at 1800 RPM.
- Prime rating: 1982 kWm, 1883 kWe, 2354 kVA.
- Standby rating: 2180 kWm, 2071 kWe, 2589 kVA.
- Datasheet storage path:
  `mitsubishi/spec-sheets/s16r-y2ptaw2.pdf`.

The MHI sheet supports the engine-family ratings, but does not establish the
Rudox emissions package by itself. The record therefore retains its
variant-specific Tier 4 Final classification from EPA certification data;
the standard Mitsubishi model's emissions classification is not changed.

## Reproduce

```bash
set -a
source .env.local
node data/enrich-epa-evidence-batch-41.mjs
node data/enrich-epa-evidence-batch-41.mjs --apply
```
