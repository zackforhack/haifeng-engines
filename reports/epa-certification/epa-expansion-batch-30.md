# EPA Expansion Batch 30

## Scope

This batch resolves all constant-speed EPA records filed under
`IHI Agri-Tech Corporation`.

- IHI constant-speed certification records reviewed: **45**
- New Shibaura engine pages inserted: **11**
- Reviewed single-model aliases: **40**
- Exact Shibaura/Perkins matches: **4**
- Reviewed multi-model certification groups: **1**
- Remaining unmatched IHI constant-speed records: **0**

## Manufacturer Decision

IHI announced in 2018 that it was selling IHI Agri-Tech's small-engine
business and its engine joint-venture interests to Caterpillar. The
announcement states that manufacture, sale and service of Shibaura engines
would pass to Perkins Japan. The analyzer therefore maps IHI Agri-Tech
certifications to the `Shibaura` and `Perkins` catalog brands.

References:

- [IHI small-engine business transfer announcement](https://www.ihi.co.jp/en/all_news/2018/industrial_general_machine/1191251_2051.html)
- [Official IHI Agri-Tech Shibaura product page](https://www.ihi.co.jp/iat/en/shibaura/index.html)

## New Shibaura Pages

| Series | Models |
| --- | --- |
| E Series | `E673L-C`, `E673L-F` |
| S Series | `S773L-D`, `S773L-F` |
| N Series | `N843-D`, `N843-F`, `N844-D`, `N844L-D`, `N3LDI-T`, `N4LDI-T`, `N4LDI-TA` |

The pages retain EPA-certified 1800 RPM mechanical output, displacement,
aspiration and emissions tier. Calibration identifiers such as `E36-18C`,
`N315-18C`, `3LT201800C` and `361800C` map to their actual Shibaura engine
models.

## Perkins Cross-References

EPA rows using Perkins-style names are mapped to existing catalog pages only
where the displacement, configuration and certification relationship agree.
Examples include:

- `402F-05` and `C0.5` to `402F-05(C0.5)`
- `404D-22` calibrations to `404D-22G`
- `404D-22TA` calibrations to `404D-22TAG`
- `ER49DI` calibrations to `404F-E22TA`

The mixed `C2.2` record is considered represented only when all three relevant
Perkins pages exist: `404D-22G`, `404D-22TAG` and `404F-E22TA`.

## Verification

- Supabase export after insertion: **2,538 engines**
- IHI constant-speed records represented: **45 of 45**
- Remaining unmapped-manufacturer constant-speed records: **49**
- Mapped-manufacturer represented coverage: **76.7%**

Primary data source: EPA Annual Certification Data for Vehicles, Engines, and
Equipment, `nonroad-compression-ignition-2011-present (1).xlsx`.
