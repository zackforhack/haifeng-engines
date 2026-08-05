# GenProBase Engine Model Import

Date: 2026-08-05

Source: https://www.genprobase.com/api/products?all=1&page=1&pageSize=10000

## Result

- Source rows fetched: `1314`
- Unique normalized GenProBase brand/model groups: `990`
- Already present before import: `735`
- New rows inserted: `255`
- Engine count after import: `3350`

## New Rows By Brand

- Baudouin: `102`
- Cummins: `95`
- Perkins: `47`
- FPT: `6`
- Mitsubishi: `2`
- SDEC: `2`
- Scania: `1`

## Notes

- GenProBase is an online discovery source, not an OEM datasheet source.
- Rows are marked as active generator-drive diesel models.
- Descriptions include GenProBase provenance and should be followed by OEM datasheet attachment where available.
- Import logic compares normalized `brand + model` against the live database and skips existing rows.

## Sample Of Inserted Rows

| Brand | Model | Power kW | RPM | Emissions |
| --- | --- | ---: | ---: | --- |
| Perkins | 403A11G1 | 9 | 1500 | Unregulated |
| Perkins | 403F15G | 14 | 1800 | U.S. EPA Final Tier 4 |
| Perkins | 403A15G1 | 13 | 1500 | Unregulated |
| Baudouin | 4M06G2D0/S | 25 |  | Unregulated |
| Baudouin | 4M08G1D4/5 | 20 | 1500 | China IV |
| Baudouin | 4M08G2D3/6 | 23 | 1800 | EU Stage IIIA |
| Perkins | 404A22G1 | 20 | 1500 | Unregulated |
| Baudouin | 4M08G3D4/5 | 27.5 | 1500 | China IV |
| Baudouin | 4M06G20/6 | 25 | 1800 | Unregulated |
| Baudouin | 4M06G4D0/S | 30 |  | Unregulated |
| Baudouin | 4M08G4D3/6 | 33 | 1800 | EU Stage IIIA |
| Baudouin | 4M06G25/6 | 30 | 1800 | Unregulated |
| Perkins | 1103D33G3 | 32 | 1500 | EU Stage IIIA |
| Baudouin | 4M06G6D0/S | 41 |  | Unregulated |
| Baudouin | 4M08G7D4/5 | 36 | 1500 | China IV |
| Cummins | B3.9CS4GT3 | 55 | 1500 | China IV |
| Baudouin | 4M08G6D3/6 | 369 | 1800 | EU Stage IIIA |
| Baudouin | 4M06G8D0/S | 47 |  | Unregulated |
| Baudouin | 4M08G9D4/5 | 44 | 1500 | China IV |
| Perkins | 1103C33TG2 | 46 | 1500 | EU Stage II |
| Baudouin | 4M06G10D0/S | 63 |  | Unregulated |
| Baudouin | 4M09G1D4/5 | 55 | 1500 | China IV |
| Perkins | 1104C44G2 | 52 | 1800 | U.S. EPA Tier 2 |
| Baudouin | 4M06G50/6 | 58 | 1800 | Unregulated |
| Cummins | 4BTAA3.3G14 | 63 | 1500 | EU Stage IIIA |
| Perkins | 1104C44TG2 | 67 |  | EU Stage II |
| Perkins | 1104C44TG3 | 59 | 1500 | EU Stage II |
| Perkins | 1104D44TG3 | 59 | 1500 | EU Stage IIIA |
| Cummins | B3.9CS4GT2 | 82 | 1500 | China IV |
| Baudouin | 4M06G55/6 | 63 | 1800 | Unregulated |
| Baudouin | 4M09G3D4/5 | 66 | 1500 | China IV |
| Cummins | QSB5G1 | 88 |  | U.S. EPA Tier 3 / EU Stage IIIA / China III |
| Baudouin | 4M10G2D0/S | 80 |  | Unregulated |
| Cummins | B3.9CS4GT1 | 83 | 1500 | China IV |
| Perkins | 1104C44TG1 | 67 | 1800 | U.S. EPA Tier 2 |
| Cummins | QSB5G10 | 93 |  | U.S. EPA Final Tier 4 / EU Stage IIIA |
| Cummins | QSB5G2 | 96 |  | U.S. EPA Tier 3 / EU Stage IIIA / China III |
| Cummins | B5.9CS4GT3 | 94 | 1500 | China IV |
| Baudouin | 4M10G2D3/6 | 80 | 1800 | EU Stage IIIA |
| Baudouin | 4M10G4D0/S | 95 |  | Unregulated |
| Baudouin | 4M09G5D4/5 | 88 | 1500 | China IV |
| Perkins | 1104C44TAG1 | 79 | 1500 | EU Stage II |
| Cummins | QSB5G3 | 108 |  | U.S. EPA Tier 3 / EU Stage IIIA / China III |
| Cummins | QSB5G4 | 119 |  | U.S. EPA Tier 3 / EU Stage IIIA / China III |
| Baudouin | 4M10G4D3/6 | 95 | 1800 | EU Stage IIIA |
| Cummins | QSB5G5 | 131 |  | U.S. EPA Tier 3 / EU Stage IIIA / China III |
| Cummins | QSB5G13 | 131 |  | U.S. EPA Tier 3 / EU Stage IIIA / China III |
| Cummins | QSB7G1 | 129 |  | U.S. EPA Tier 3 / EU Stage IIIA / China III |
| Cummins | B5.9CS4GT2 | 117 | 1500 | China IV |
| Baudouin | 4M10G6D0/S | 115 |  | Unregulated |
| Baudouin | 4M09G7D4/5 | 105 | 1500 | China IV |
| Cummins | QSB5G11 | 126 |  | U.S. EPA Final Tier 4 / EU Stage IIIA |
| Cummins | B5.9CS4GT1 | 129 | 1500 | China IV |
| Baudouin | 4M12G1D4/5 | 117 | 1500 | China IV |
| Baudouin | 4M10G6D3/6 | 115 | 1800 | EU Stage IIIA |
| Baudouin | 4M12G3D4/5 | 125 | 1500 | China IV |
| Cummins | QSB5G12 | 154 |  | U.S. EPA Final Tier 4 / EU Stage IIIA |
| Baudouin | 6M11G2D0/S | 152 |  | Unregulated |
| Cummins | QSB5G6 | 155 |  | U.S. EPA Tier 3 / EU Stage IIIA / China III |
| Cummins | QSB7G2 | 174 |  | U.S. EPA Tier 3 / EU Stage IIIA / China III |
| Baudouin | 4M12G5D4/5 | 138 | 1500 | China IV |
| Baudouin | 4M12G2D3/6 | 145 | 1800 | EU Stage IIIA |
| Baudouin | 6M11G4D0/S | 180 |  | Unregulated |
| Baudouin | 4M12G7D4/5 | 148 | 1500 | China IV |
| Cummins | B6.7CS4GT2 | 170 | 1500 | China IV |
| Cummins | B6.7G17 | 183 |  | U.S. EPA Final Tier 4 / EU Stage V |
| Cummins | QSB7G3 | 186 |  | U.S. EPA Tier 3 / EU Stage IIIA / China III |
| Cummins | QSB7G8 | 180 |  | U.S. EPA Final Tier 4 / EU Stage IIIA |
| Cummins | B6.7CS4GT1 | 188 | 1500 | China IV |
| Baudouin | 6M12G1D4/5 | 185 | 1500 | China IV |
| Cummins | QSB7G9 | 234 |  | U.S. EPA Final Tier 4 / EU Stage IIIA |
| Cummins | QSL9G1 | 242 |  | U.S. EPA Tier 3 / EU Stage IIIA / China III |
| FPT | F2CE0685A*D | 284.9 |  | Unregulated |
| Baudouin | 6M16G2D0/S | 238 |  | Unregulated |
| Baudouin | 6M12G2D3/6 | 200 | 1800 | EU Stage IIIA |
| Perkins | 1506AE88TAG1 | 198 | 1500 | Unregulated |
| Cummins | B6.7G18 | 237 |  | U.S. EPA Final Tier 4 / EU Stage V |
| Cummins | L9CS4GT2 | 252 | 1500 | China IV |
| Cummins | QSL9G2 | 280 |  | U.S. EPA Tier 3 / EU Stage IIIA / China III |
| Baudouin | 6M16G4D0/S | 264 |  | Unregulated |

## Existing Rows Skipped

`735`
