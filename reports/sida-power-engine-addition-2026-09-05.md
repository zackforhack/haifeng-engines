# Sida Power Engine Addition

Date: 2026-09-05

## Result

- Brand: `Sida Power`
- Rows inserted/refreshed: `10`
- Document links inserted: `22`
- Engine count: `3780 -> 3790`
- Local workbook verified: `10` sheets, `3175366` bytes
- Local brochure verified: `4569278` bytes

## External Validation

| Source | URL | Verified tokens |
| --- | --- | --- |
| Sida Power homepage | https://www.sida-engine.com/ | `Jiangsu Sida Power Machinery Group Co., Ltd.`, `founded in 1984`, `annual production capacity of 200,000` |
| Sida Power diesel generator category | https://www.sida-engine.com/diesel-generator/ | `SIDA is one of the most professional diesel generator manufacturers`, `Diesel Generator Engines` |
| Sida Power diesel generator engines page | https://www.sida-engine.com/diesel-generator/diesel-generator-engines.html | `Diesel Generator Engines`, `Diesel Engine for Gensets`, `Original: Jiangsu, China`, `IATF16949` |
| Sida Power four-stroke diesel engine page | https://www.sida-engine.com/diesel-generator/four-stroke-diesel-engine.html | `4BWZ`, `four-stroke diesel engine`, `Sida Power diesel engine` |
| Sida Power 4DE diesel engine sets page | https://www.sida-engine.com/diesel-generator/diesel-engine-sets.html | `4DE series diesel engine`, `Engine model:4DE`, `Displacement (L):2.8` |

## Rows

| Model | Generator pairings | Engine 50 Hz PRP/ESP | Genset 50 Hz PRP/ESP | Action | Linked docs |
| --- | --- | --- | --- | --- | --- |
| 4AW | BW17E/BW20E | 17/19 kWm | 15/16 kWe | inserted | 2 |
| 4BW | BW21E/BW25E | 21/23 kWm | 16/18 kWe | inserted | 2 |
| 4BWZ | BW30E/BW35E | 30/33 kWm | 24/26 kWe | inserted | 3 |
| 4DW | DW25E/DW30E | 25/28 kWm | 20/22 kWe | inserted | 2 |
| 4DEZ | DE38E/DE44E | 40/44 kWm | 32/36 kWe | inserted | 3 |
| 4BMZ | BM46E/BM55E | 50/55 kWm | 40/45 kWe | inserted | 2 |
| 4BMZ1 | BM65E/BM75E | 65/70 kWm | 52/56 kWe | inserted | 2 |
| 4BMZL | BM80E/BM90E | 80/85 kWm | 64/68 kWe | inserted | 2 |
| 4FWZL | FW88RE/FW100RE | 88/96 kWm | 70/76 kWe | inserted | 2 |
| 4FWZL1 | FW110RE/FW120RE | 110/115 kWm | 90/92 kWe | inserted | 2 |

## Notes

- Source workbook: `/Users/ziqianhuang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/aassdfg684_5b6a/temp/RWTemp/2026-09/badcf9119cb09045c6514656a09c88a0/四达动力发电机组用柴油机配套参数（Supporting parameters of diesel engine for Sida power generator set）.xlsx`
- Source brochure: `/Users/ziqianhuang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/aassdfg684_5b6a/msg/file/2026-09/16P.pdf`
- Workbook kVA cells were reviewed, but database kVA fields are calculated from the source kWe values at 0.8 power factor to satisfy the catalog QA convention.
- The rows use actual diesel engine models as `model` and keep generator-set pairings in `series` and descriptions for search coverage.
