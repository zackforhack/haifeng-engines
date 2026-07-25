# EPA Expansion Batch 39

## Scope

This batch resolves the duplicated Mercedes-Benz constant-speed identities
filed under `Mercedes Benz` and `Daimler Truck AG`.

- EPA manufacturer/model combinations reviewed: **4**
- Distinct Mercedes-Benz engine pages inserted: **2**
- Remaining unmatched Mercedes-Benz/Daimler constant-speed records: **0**
- Remaining unmapped-manufacturer constant-speed records: **3**

## New Mercedes-Benz Pages

| Model | Configuration | EPA-certified 1800 RPM range |
| --- | --- | ---: |
| `OM 924 LA` | 4.801 L inline-4 | 88–147 kWm |
| `OM 926 LA` | 7.201 L inline-6 | 162–247 kWm |

Both engines are turbocharged and charge-cooled. EPA annual data lists Tier 3
constant-speed configurations from 2015 through 2024. The manufacturer label
changes from `Mercedes Benz` to `Daimler Truck AG`, but the model identities,
engine codes, displacement, bore and stroke remain continuous.

Daimler Truck's official material corroborates the Mercedes-Benz identities
and core architecture:

- [Daimler Truck OM 926 LA history and displacement](https://www.daimlertruck.com/en/newsroom/pressrelease/25th-anniversary-of-the-mercedes-benz-atego-a-truck-as-versatile-as-the-transport-tasks-in-distribution-haulage-52536028)
- [Mercedes-Benz OM 924 LA technical brochure](https://www.mercedes-benz-bus.com/content/dam/mb/ng/en/models/of-1722/OF_1722_Euro3.pdf)

EPA annual certification data remains the authority for the constant-speed
power nodes and U.S. emissions labels.

## Verification

- Supabase export after insertion: **2,582 engines**
- Mercedes-Benz/Daimler constant-speed identities represented: **4 of 4**
- Remaining unmapped-manufacturer constant-speed records: **3**

Primary data source: EPA Annual Certification Data for Vehicles, Engines, and
Equipment, `nonroad-compression-ignition-2011-present (1).xlsx`.
