# EPA-Certified Expansion Batch 05

Batch 5 adds five missing Liebherr D96/D98 commercial engines, corrects two
existing Liebherr records and resolves reviewed Kohler KD certification trims.

## Added

| Model | Configuration | Displacement | Published maximum power |
|---|---:|---:|---:|
| D9616 | V16 | 36.0 L | 1,450 kWm |
| D9620 | V20 | 45.0 L | 1,910 kWm |
| D9812 | V12 | 62.0 L | 2,700 kWm |
| D9816 | V16 | 82.7 L | 3,490 kWm |
| D9820 | V20 | 103.4 L | 4,290 kWm |

Existing D9612 and D976 pages were updated with the official current mechanical
power range and EPA certification coverage found in the annual data.

## OEM And Certification Matching

Liebherr's official announcement confirms that it co-developed the six Kohler
KD engine families and manufactures them exclusively for Kohler generator sets.
The EPA certificate holder is therefore Liebherr while the commercial database
page correctly remains under Kohler.

The audit recognizes only reviewed KD suffix structures:

- Tier 2 examples such as `KD27V12-6AES`
- Tier 4 Final examples such as `KD27V12-6CNP`
- Updated base variants such as `KD62V12A-6CES`

The rule requires the full commercial KD base model and an allowlisted suffix
pattern. It does not use fuzzy matching.

EPA `D9812G`, `D9816G` and `D9820G` are explicit reviewed aliases for the
commercial D98 pages. Their cylinder count, displacement, power range and
manufacturer all agree.

## Rating Policy

The Liebherr pages store manufacturer-published maximum mechanical power. They
do not infer electrical kWe or kVA from the EPA or engine rating.

## Primary Sources

- Liebherr combustion engines product-line brochure:
  <https://www.liebherr.com/shared/media/components/documents/combustion-engines/liebherr-combustion-engines-product-line-brochure-en-web.pdf>
- Liebherr D9612 power-generation page:
  <https://www.liebherr.com/en-gb/components/solutions/combustion-engines/product-portfolio-diesel-engines/d9612-power-generation-8918883>
- Liebherr and Kohler KD co-development announcement:
  <https://www.liebherr.com/en-ph/n/co-development-by-kohler-and-liebherr-new-kohler-g-drive-diesel-engine-range-delivers-world-class-power-24021-5934641>
- U.S. EPA annual certification data:
  <https://www.epa.gov/compliance-and-fuel-economy-data/annual-certification-data-vehicles-engines-and-equipment>
