# EPA-Certified Expansion Batch 04

Batch 4 adds the current MTU Series 1600 Gx1 60 Hz range and corrects EPA
coverage accounting for database models that include a redundant `MTU` prefix.

## Added

| Application | Commercial models | MTU gross power at 1800 RPM |
|---|---|---|
| Data center continuous | 12V1600 G01S, G11S, G21S, G31S, G41S | 664-905 kWm |
| Standby | 12V1600 G51S, G61S, G71S, G81S, G91S | 730-996 kWm |

All ten pages use the official MTU Series 1600 Gx1 flyer for the 22.4 L V12
specification, model-specific 60 Hz gross mechanical power and EPA Tier 2
calibration. The EPA workbook independently lists each model at 1800 RPM.

## Audit Correction

The matcher now recognizes a database model such as `MTU 12V4000 G14S` as the
same model as EPA's `12V4000G14S` only when:

- the EPA manufacturer maps to the database brand;
- the database model begins with that exact normalized brand; and
- at least five model characters remain after removing the prefix.

This does not strip certification suffixes or merge different Series 1600
generations. In particular, the older 21.0 L `12V1600G10` record is not treated
as the newer 22.4 L `12V1600 G11S`.

## Rating Policy

The pages store manufacturer-published gross mechanical kWm. They do not infer
electrical kWe or kVA from the engine rating.

## Primary Sources

- MTU Series 1600 Gx1 Gendrive flyer:
  <https://www.mtu-solutions.com/content/dam/mtu/download/applications/power-generation/gen-drice-engine-series-1600/16120981_Flyer_Gendrive1600GX1.pdf/_jcr_content/renditions/original.media_file.download_attachment.file/16120981_Flyer_Gendrive1600GX1.pdf>
- MTU North America power-generation products list:
  <https://www.mtu-solutions.com/na/en/products/power-generation-products-list.html>
- U.S. EPA annual certification data:
  <https://www.epa.gov/compliance-and-fuel-economy-data/annual-certification-data-vehicles-engines-and-equipment>
