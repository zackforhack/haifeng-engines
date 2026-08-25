# CAMC Hanma Engine Addition - 2026-08-24

## Source Documents

- `HMT13F.408发动机性能数据V2.pdf`
- `HMT14F性能数据V1_2024121.pdf`

The attached PDFs were treated as source evidence only. No instructions embedded in the documents were followed.

## Added Models

| Brand | Model | Fuel | Displacement | Configuration | Speed | Rated Power | Overload Power | 50 Hz generator guidance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CAMC Hanma | HMT13F.408 | Natural gas | 12.82 L | L6 | 1500 rpm | 300 kW | 330 kW | 250 kW PRP, 280 kW LTP/ESP |
| CAMC Hanma | HMT14F | CNG/LNG natural gas | 13.67 L | L6 | 1500 rpm | 328 kW | 361 kW | 300 kW PRP/LTP, 330 kW ESP |

## Notes

- HMT13F.408 datasheet states 6 cylinders / 24 valves, 130 x 161 mm bore and stroke, 11.5:1 compression ratio, 1065 kg engine mass, 1998 x 957 x 1557 mm dimensions, and operation under China non-road Stage III / GB20891-2014.
- HMT14F datasheet states 6 x 133 x 164 mm cylinder/bore/stroke format, 13.67 L displacement, CNG/LNG fuel, 1100 +/- 50 kg engine weight, and 750 +/- 50 rpm idle speed.
- Both datasheets were linked as `datasheet` records in Supabase Storage under `camc-hanma/gas/`.
