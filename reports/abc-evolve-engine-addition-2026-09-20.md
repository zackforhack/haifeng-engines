# ABC Evolve engine addition

Reviewed 2026-09-20. Added 6 models; ABC count 24 → 30. Verified all six public rows and 11 unique model/source links.

## Findings

The 16EV23 announcement is dated 1 September 2026, not the review date. All six requested models were absent on initial inspection. Public model pages exist for the three inline engines and 20EV23; the two newer V engines are supported by official launch announcements. Download catalogues are form-gated, so no forms were submitted and no PDF downloads are claimed.

| Model | Layout | Published maximum mechanical output | Calculated upper output (not stored as verified power) |
|---|---|---:|---:|
| 4EL23 | L4 | 1320 kW | — |
| 6EL23 | L6 | 2160 kW | — |
| 8EL23 | L8 | 2880 kW | — |
| 12EV23 | V12 | Not found in a public model sheet | 4320 kW = 12 × 360 |
| 16EV23 | V16 | Not found in a public model sheet | 5760 kW = 16 × 360 |
| 20EV23 | V20 | 7200 kW | — |

## Data boundaries

- 4EL23: single-stage only, 330 kW/cylinder; the other models offer single- or two-stage turbocharging.
- Generic power contains published mechanical output only. Newer-model calculated outputs are explicitly labelled in descriptions, with numeric power left null.
- Maximum 1200 rpm is stored only where the model page publishes it; rated speed is not inferred.
- Bore/stroke-derived displacement is recorded only for 6EL23, 8EL23 and 12EV23, where the reviewed source explicitly gives 230 × 310 mm.
- No inherited weights, dimensions, generator frequency/duty/electrical ratings, gas-specific variants or certification claims for the newer V models.
- Fuel category describes the liquid-fuel baseline. Conversion to pilot-ignited dual fuel or spark-ignited gas depends on configuration.
- Existing ABC records were not modified. Import is insert-only and rerunnable.

## Official sources

- 4el23: https://www.abc-engines.com/en/markets/marine-propulsion/product/4el23
  - Snapshot: data/sources/abc-evolve-2026-09/4el23.txt; SHA-256: d74b2aa26c7a374d7b5c2631435124d41be413ff1a4d8d9ba97078a191d635d4
- 6el23: https://www.abc-engines.com/en/markets/marine-propulsion/product/6el23
  - Snapshot: data/sources/abc-evolve-2026-09/6el23.txt; SHA-256: d88e01a3ea3108e1cfd8af31e3dff5f8ee8de239c007136c5ab1f5a5a8a3c8a4
- 8el23: https://www.abc-engines.com/en/markets/marine-propulsion/product/8el23
  - Snapshot: data/sources/abc-evolve-2026-09/8el23.txt; SHA-256: 9dc9a3412a9ebfa2166c288f58471a8288fd99ec0489418d40c3d9bab560d158
- 20ev23: https://www.abc-engines.com/en/markets/marine-propulsion/product/20ev23
  - Snapshot: data/sources/abc-evolve-2026-09/20ev23.txt; SHA-256: a8a1c7343bf9b1ad577f6f972a069839e15834ab7c02368e01f756e667dd5fbb
- 12ev23-launch: https://www.abc-engines.com/en/news/abc-introduces-the-evolve-12ev23
  - Snapshot: data/sources/abc-evolve-2026-09/12ev23-launch.txt; SHA-256: b2bd0c2b9040d0343601d668db56e331e9def87c4049159aafb4a9b20015ebbe
- 16ev23-launch: https://www.abc-engines.com/en/news/abc-completes-the-evolve-v-engine-range-with-the-launch-of-the-16ev23
  - Snapshot: data/sources/abc-evolve-2026-09/16ev23-launch.txt; SHA-256: 67aac53905697acf6b76808210c0a71cbe298cfeb21bc909e9a7a847885d741d
