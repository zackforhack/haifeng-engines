# BEINEI engine addition

Date: 2026-09-18

Added 16 models; verified all 16 public BEINEI records and 32 document links. Both uploaded originals passed SHA-256 download verification.

Brand: BEINEI / 北内 / Beijing Beinei Diesel Engine Co., Ltd.

## Source handling

The supplied 2026 table is authoritative for all imported model specifications. The older 20-page brochure establishes manufacturer identity and family context. Fourteen models are air-cooled and two (4D22, 4D22T) are water-cooled. Model names remain exactly as supplied; they are not merged with Deutz models or renamed to the brochure's BN4D22 variants.

The generic power field stores the listed 1500 rpm mechanical power. Every other published speed/power pair, bore and stroke, and aspiration is preserved in the description. No prime/standby, generator kWe/kVA, maximum RPM, emissions or certification values were inferred. Blank high-speed cells remain unspecified. BF6L913C retains 130 kW at 1800 rpm and 125 kW at 2300 rpm exactly as supplied.

## Models

| Model | kW @ 1500 rpm | kW @ 1800 rpm | Additional kW @ rpm |
|---|---:|---:|---|
| F2L912 | 14 | 17 | 20 @ 2300 |
| F3L912 | 24 | 28 | 36 @ 2300 |
| F4L912 | 32 | 38 | 46 @ 2300 |
| F4L913 | 34 | 40 | 50 @ 2300 |
| F4L912T | 41 | 48 | Not supplied |
| F4L914 | 41 | 46 | 50 @ 2300 |
| F6L912 | 48 | 60 | 74 @ 2300 |
| F6L913 | 51 | 65 | 79 @ 2300 |
| F6L912T | 61 | 72 | Not supplied |
| F6L914 | 62 | 73 | 79 @ 2300 |
| BF4L913 | 57 | 66 | 66 @ 2300 |
| BF6L913 | 88 | 106 | 112 @ 2300 |
| BF6L914 | 89 | 106 | 112 @ 2300 |
| BF6L913C | 114 | 130 | 125 @ 2300 |
| 4D22 | 18 | 21 | 34 @ 3000 |
| 4D22T | 24 | 28 | Not supplied |

## Source files

Logo: `public/brand-logos/beinei.jpg` (200 × 80 JPEG), retrieved from https://www.dwfdj.cn/upload/product/3750_636218253408909863.jpg and visually matched to the supplied BEINEI brochure. Registered under the database brand name `BEINEI` in `lib/brand-logos.ts`.

Validation: catalog integrity passed with 3,806 engines, 149 alternators, 4,587 document links and 80 engine brands. The live F2L912 page returned HTTP 200 and included the supplied specifications and source links.

- data/sources/beinei/product-brochure.pdf; SHA-256: cf67d4e7e169188c0d9cf796374e1abe17e36747714f56ba0e7bdf88d3d0791d
- data/sources/beinei/2026-engine-lineup.png; SHA-256: 9766bf88e68984bd4c2596cc58ff32ab14574b358d38b9f6fc5f88d0c299417c
