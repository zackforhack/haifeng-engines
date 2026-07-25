# EPA-Certified Expansion Batch 08

Batch 8 corrects seven existing Perkins ElectropaK pages and adds ten reviewed
EPA-to-commercial model crosswalks.

## Rating Corrections

Official Perkins electric-power documents provide separate gross mechanical,
net mechanical, kWe and kVA values. The database now stores:

- Published maximum gross mechanical power in `power_kw`
- Net mechanical prime/standby power in the 60 Hz `kWm` fields
- Perkins-published generator output in the 60 Hz `kWe` and `kVA` fields

Corrected pages:

- 1106D-E70TAG2, TAG3, TAG4 and TAG5
- 1204J-E44TTAG2
- 1206J-E70TTAG3 and TTAG4

This fills previously missing 60 Hz ratings for 1206J-E70TTAG3 and restores
the current 1800 RPM gross/net values for the other models.

## EPA Code Crosswalk

Perkins EPA records frequently omit the generator-drive `G` suffix and append
the related Caterpillar base-engine name in parentheses. The audit now
recognizes ten explicit aliases:

| EPA designation | Perkins commercial page |
|---|---|
| 403D-11(C1.1) | 403D-11G |
| 403F-11(C1.1) | 403F-11G |
| 404D-22TA(C2.2) | 404D-22TAG |
| 404J-E22TA(C2.2) | 404J-E22TAG |
| 1104D-44T(C4.4) | 1104D-44TG1 |
| 1104D-E44T(C4.4) | 1104D-E44TG1 |
| 1104D-E44TA(C4.4) | 1104D-E44TAG2 |
| 1106D-E70TA / C7.1 | 1106D-E70TAG5 |
| 1204J-E44TTA(C4.4) | 1204J-E44TTAG2 |
| 1206J-E70TTA(C7.1) | 1206J-E70TTAG4 |

Each alias is an explicit allowlist entry with matching manufacturer, family,
displacement, emissions tier and 1800 RPM power node. No fuzzy match is counted
as represented.

## Primary Sources

- Perkins 1106D-E70TAG Electric Power Engines:
  <https://s7d2.scene7.com/is/content/Caterpillar/CM20210126-a40e3-cffa5>
- Perkins 1204J-E44TTAG2 Electric Power Engines:
  <https://s7d2.scene7.com/is/content/Caterpillar/CM20201201-5a9e6-70e85>
- Perkins 1206J-E70TTAG Electric Power Engines:
  <https://s7d2.scene7.com/is/content/Caterpillar/CM20201201-02bf5-2b016>
- U.S. EPA annual certification data:
  <https://www.epa.gov/compliance-and-fuel-economy-data/annual-certification-data-vehicles-engines-and-equipment>
