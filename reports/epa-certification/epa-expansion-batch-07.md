# EPA-Certified Expansion Batch 07

Batch 7 corrects eleven existing FPT Tier 3 commercial pages and adds reviewed
crosswalks for twelve FPT EPA certification-code names.

## Data Corrections

The legacy FPT import treated one source number as kVA and derived electrical
power from it. FPT's current brochure publishes separate kWm, kWe and kVA
columns. This batch replaces the derived values with the exact 60 Hz,
1800 RPM manufacturer values for:

- NEF45SM1X, NEF45SM2X, NEF45 TE1P and NEF45 TE2P
- NEF67 TM1X, NEF67 TE1PV, NEF67 TE2PV and NEF67 TE3PV
- C87 TE3F and C87 TE1PV
- C13 TE2F

It also confirms that NEF45 TE2P is a four-cylinder 4.5 L engine, not the
six-cylinder engine recorded by the original importer.

## EPA Code Crosswalk

FPT's EPA records use internal certification model names rather than the
commercial N45, N67 and Cursor 9 names. The audit now recognizes only the
reviewed code/power nodes below:

| EPA code | Commercial page |
|---|---|
| F2CCA615A*H | C87 TE3F |
| F2CCP615A*H | C87 TE1PV |
| F2CE9685A*E, F2CE9685C*E | C87 TE3F |
| F4GE9455A*J | NEF45SM2X |
| F4GE9455B*J | NEF45SM1X |
| F4GE9685A*J | NEF67 TM1X |
| F4HE0485B*J | NEF45 TE2P |
| F4HE0485C*J | NEF45 TE1P |
| F4HE0685A*J | NEF67 TE3PV |
| F4HE0685F*J | NEF67 TE2PV |
| F4HE0685G*J | NEF67 TE1PV |

The crosswalk is an explicit allowlist based on manufacturer, displacement,
Tier 3 family and matching published power node. It is not a fuzzy matcher.

Four ambiguous Tier 3 codes and all reviewed Tier 4 codes remain in the queue.
They require a commercial-model cross-reference before they can be represented
without creating duplicate or incorrectly attributed pages.

## Primary Sources

- FPT Industrial Power Generation Brochure:
  <https://www.fptindustrial.com/-/media/FPT/Brochures/Engines/POWER-GEN/FPT_Power_Generation_Brochure_EN.pdf?rev=-1>
- U.S. EPA annual certification data:
  <https://www.epa.gov/compliance-and-fuel-economy-data/annual-certification-data-vehicles-engines-and-equipment>
