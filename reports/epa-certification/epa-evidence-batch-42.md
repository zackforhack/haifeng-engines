# EPA Evidence Enrichment Batch 42

Date: 2026-07-25

## Scope

This batch enriches the two Mercedes-Benz OM 900 Series pages added from EPA
annual certification data. Archived MTU Onsite Energy specification sheets
provide exact 60 Hz generator applications using Mercedes-Benz engines.

| Engine | MTU generator set | Speed | Engine max | Prime output | Prime kVA |
| --- | --- | ---: | ---: | ---: | ---: |
| OM 924 LA | 4R0120 DS125 | 1800 RPM | 134 kWm | 111 kWe | 139 |
| OM 926 LA | 6R0120 DS180 | 1800 RPM | 225 kWm | 163 kWe | 204 |

Both sheets identify the engines as EPA Tier 3 certified and specify a
`17.5:1` compression ratio. Full-load prime fuel consumption is 25.7 L/h for
the OM 924 LA set and 44.7 L/h for the OM 926 LA set.

The OM 926 LA EPA power node is stored as 224 kWm in the certification file,
while the MTU sheet states 225 kWm. This one-kilowatt difference is treated as
source rounding because the model, displacement, speed, emissions tier, and
application all match.

## Rating Boundary

Only prime ratings are added. The related standby generator configurations
use 147 kWm for OM 924 LA and a higher mechanical node for OM 926 LA. Those
standby values are outside the selected 134/224 kWm EPA records and are
therefore not copied to these pages.

## PDF Provenance

The documents are original MTU Onsite Energy / Rolls-Royce specification
sheets, archived by Woodstock Power after MTU retired the original asset
URLs.

## Reproduce

```bash
set -a
source .env.local
node data/enrich-epa-evidence-batch-42.mjs
node data/enrich-epa-evidence-batch-42.mjs --apply
```
