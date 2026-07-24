# EPA-Certified Expansion Batch 02

This batch converts the strongest remaining Caterpillar and Discovery Energy
(Rehlko/Kohler) candidates into database records. EPA certification data is used
to identify the certified model; commercial ratings come from current manufacturer
sources.

## Added

| EPA model | Database page | Commercial source | Emissions treatment |
|---|---|---|---|
| KDI1903M | `/engines/kohler-kdi1903m` | Rehlko 15REOZK G5-434 | Current Tier 4 Final stationary-emergency family |
| KDI2504ESM | `/engines/kohler-kdi2504esm` | Rehlko 20REOZK G5-435 | Current Tier 4 Final family; older families are not merged into the current configuration |
| KDI 2504TM/G18 | `/engines/kohler-kdi2504tm` | Rehlko 30REOZK G5-436 | Tier 2; `/G18` is a certification trim of the commercial base model |
| KDI 3404TM/G18, G18A, G18B | `/engines/kohler-kdi3404tm` | Rehlko 60REOZK G5-439 | Tier 3; slash suffixes are certification trims |
| C32B | `/engines/caterpillar-c32b` | Cat C32B industrial product page | Current regulated 895 kW Tier 4 Final / 839 kW Stage V configuration |

## Reviewed, Not Added

| EPA model or group | Decision | Reason |
|---|---|---|
| QSK38-G | Represented by existing commercial variants | Cummins markets generator-drive variants such as QSK38-G1 through G5; the EPA umbrella name is not a separate saleable model |
| QSK50-G | Represented by existing commercial variants | Existing QSK50-G2 through G7 pages are more specific than the EPA umbrella name |
| QSK38 G16/G17/G18/G22/G23/G24 | Defer | Certification/engine codes require a matching Cummins commercial ratings sheet before separate pages are justified |
| C32B low-fuel-consumption generator packages | Document only | Package brochures prove generator application but do not replace the regulated industrial engine rating |
| KDI3404TCR | Already present | The existing TCR page represents the CARB/SCAQMD engine; it must remain separate from the 49-state TM engine |

## Matching Rule

The audit now classifies an EPA slash-suffixed model as a represented base trim
only when:

1. the EPA model explicitly contains `/`;
2. the normalized text before `/` exactly matches a database model; and
3. the EPA manufacturer maps to the same database brand.

This resolves KDI certification trims without applying broad prefix matching to
unrelated manufacturer codes.

## Primary Sources

- Rehlko G5-434: <https://techcomm.rehlko.com/techcomm/pdf/g5434.pdf>
- Rehlko G5-435: <https://techcomm.rehlko.com/techcomm/pdf/g5435.pdf>
- Rehlko G5-436: <https://techcomm.rehlko.com/techcomm/pdf/g5436.pdf>
- Rehlko TP-6970: <https://techcomm.rehlko.com/techcomm/pdf/tp6970.pdf>
- Rehlko G5-439: <https://techcomm.rehlko.com/techcomm/pdf/g5439.pdf>
- Cat C32B industrial engine: <https://www.cat.com/en_US/products/new/power-systems/industrial/industrial-diesel-engines/126381.html>
- Cat C32B generator application brochure: <https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE20248->
