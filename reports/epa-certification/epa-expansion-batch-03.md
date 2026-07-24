# EPA-Certified Expansion Batch 03

Batch 3 adds the complete current Rehlko KSD 1403 family and corrects EPA
coverage accounting for commercial family names that are more specific than the
EPA workbook model.

## Added

| Commercial model | Database page | Manufacturer evidence |
|---|---|---|
| KSD1403NA | `/engines/kohler-ksd1403na` | Rehlko KSD Series datasheet; 1.391 L, naturally aspirated, Stage V / Tier 4 Final |
| KSD1403TC | `/engines/kohler-ksd1403tc` | Rehlko KSD Series datasheet; turbocharged, 1800-3000 RPM |
| KSD1403TCA | `/engines/kohler-ksd1403tca` | Rehlko KSD Series datasheet; turbocharged and aftercooled, 1800-3000 RPM |

The EPA workbook model `KSD-NATG 1403/18` is linked explicitly to
`KSD1403NA`. The certification record and commercial datasheet agree on
manufacturer, 1.391 L displacement, naturally aspirated architecture and
sub-19 kW output. The `/18` certification trim is rated at 1800 RPM.

## Audit Corrections

- `Caterpillar Inc.` can represent either Caterpillar or Perkins commercial
  pages because Caterpillar is the EPA certificate holder for several Perkins
  engine families.
- Family-prefix matching is restricted to reviewed manufacturer/brand pairs:
  Caterpillar-to-Perkins, Cummins-to-Cummins, Perkins-to-Perkins and
  Yanmar-to-Yanmar.
- Family matching requires at least five normalized characters and a strictly
  longer database model. It does not treat short names such as `C32` as a match
  for `C32B`.
- Non-literal certification aliases remain an explicit allowlist rather than a
  fuzzy rule.

## Rating Policy

The three KSD pages store manufacturer-published mechanical engine output only.
No kWe or kVA values are generated from the EPA power rating. Generator
electrical ratings require a package-specific manufacturer sheet.

## Primary Sources

- Rehlko KSD Series datasheet:
  <https://techcomm.rehlko.com/$web/techcomm/pdf/REHLKO_KSD_1403_rev.04_07_26_web.pdf>
- Rehlko KSD1403NA product page:
  <https://www.engines.rehlko.com/products/KSD1403NA>
- Rehlko KSD1403TCA product page:
  <https://www.engines.rehlko.com/products/KSD1403TCA>
- Perkins 1706J official product page:
  <https://www.perkins.com/en_GB/products/product-range/1700-series/1706.html>
