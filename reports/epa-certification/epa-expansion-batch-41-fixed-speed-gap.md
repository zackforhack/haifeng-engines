# EPA Expansion Batch 41: Blank-Operation Fixed-Speed Gap

Date: 2026-07-25

## Scope

This batch resolves the 11 EPA identities whose `Engine Operation` field is
blank but whose exact model appears only at 1800 RPM or at the conventional
1500/1800 RPM generator speeds.

## Database Changes

| Brand | Model | EPA speed nodes | EPA 1800 RPM power |
|---|---|---|---:|
| Daedong | 3HG4 | 1500, 1800 | 20-22 kWm |
| Daedong | 3HTIG4 | 1500, 1800 | 39 kWm |
| Daedong | 4HTG4 | 1500, 1800 | 40-45 kWm |
| Daedong | 4HTIG4 | 1500, 1800 | 51 kWm |
| FPT | F5BFL415A*B | 1800 | 93 kWm |
| FPT | F5BFL415B*B | 1800 | 73 kWm |
| FPT | F5BFL415A*C | 1800 | 73 kWm |
| FPT | F5BFL415B*C | 1800 | 93 kWm |
| FPT | F5HGL465A*X | 1800 | 50 kWm |
| FPT | F5HGL465B*X | 1800 | 40 kWm |
| Kubota | V2203L-DI-EF | 1800 | 18 kWm |

The FPT technical calibration codes are retained as exact pages. They were
not forced onto commercial F34 model pages because a defensible one-to-one
cross-reference was not available for every calibration.

The EPA workbook writes the Kubota model as `V2203LBDI-EF`; Kubota's official
lookup writes `V2203L-DI-EF`. The analyzer crosswalk treats these as the same
identity.

## Evidence

- EPA Annual Certification Data workbook:
  `nonroad-compression-ignition-2011-present (1).xlsx`
- [Daedong official diesel-engine lineup](https://ko.daedong.co.kr/engine)
- [FPT official Stage V / Tier 4 Final power-generation portfolio](https://www.fptindustrial.com/-/media/FPT/Brochures/Engines/Engines_for_Power_Generation_Stage_V_ENG.pdf?rev=607ea433726b4e7abdf7eda9004070d1)
- [Kubota official emissions-certificate lookup](https://www.kubotaengine.com/engines/emission-certificates/emissions-certificates-lookup/)

The FPT portfolio is stored as a family brochure and linked to all six FPT
technical-code pages. It supports the F34 generator application and emissions
family, while the exact technical-code ratings remain sourced from the EPA
workbook.

## Reproduction

```bash
set -a
source .env.local
node data/add-epa-fixed-speed-gap-batch.mjs
node data/add-epa-fixed-speed-gap-batch.mjs --apply
node data/export-engines-json.mjs /tmp/haifeng-engines.json
python3 data/analyze-epa-1800rpm.py \
  --epa-xlsx "/Users/ziqianhuang/Downloads/nonroad-compression-ignition-2011-present (1).xlsx" \
  --engines-json /tmp/haifeng-engines.json \
  --output-dir reports/epa-certification
npm run data:qa
```

## Result

- Supabase records inserted: **11**
- Official FPT brochure relations created: **6**
- Live catalog after insertion: **2,596 engines and 149 alternators**
- Explicit constant-speed coverage: **716 of 716**
- Blank-operation fixed-speed coverage: **14 of 14**
- Remaining fixed-speed review queue: **0**
- Data QA: **0 issues**
