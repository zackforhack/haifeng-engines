# Legacy Engine Model Discovery - Batch 01

Date: 2026-08-04

Purpose: add a first additive batch of legacy and low-coverage engine models to improve catalog depth for brand hubs, model search, and long-tail generator/repower queries.

## Selection Rationale

- Prioritized under-covered brands in the live catalog where legacy model queries are likely: Deutz, Doosan, Mahindra, Ashok Leyland, Mercedes-Benz, Ford, and International.
- Preferred generator-drive models when source material included 1500/1800 rpm or kVA/kWe data.
- Used mechanical `power_kw` only for industrial/on-highway legacy models where source material did not support electrical generator ratings.
- Marked most legacy rows as `discontinued`; retained `limited` where models or derivative service engines remain visible through generator/industrial suppliers.

## Inserted Models

| Brand | Models | Notes |
| --- | --- | --- |
| Deutz | F2L912, F3L912, F3L913, F4L912, F4L912T, F4L913, BF4L913, F6L912, F6L912T, F6L913, BF6L913, BF6L913C | Air-cooled FL 912/913 generator-drive family, 1500/1800 rpm mechanical ratings. |
| Doosan | DB58, D1146, D1146T, DP086TA, P086TI-1, P086TI | Older Doosan D/P generator-drive diesel models, using available genset kWe/kVA where source-backed. |
| Mahindra | 61145 GM, 61375 GM, 61695 GM | Powerol 6-cylinder 82.5-125 kVA generation range. |
| Ashok Leyland | ALGP WO4D, ALGP 400, ALGP 402 | Legacy industrial G-drive models with 50 Hz electrical ratings. |
| Mercedes-Benz | OM 352, OM 366 A, OM 366 LA, OM 401 | Legacy industrial/vocational diesels, mechanical power only. |
| Ford | 2715E, 2704ET, 2722E | Ford Dorset/Dover legacy industrial diesels, mechanical power only. |
| International | DT360, DT466, DT530 | International/Navistar wet-sleeve DT family models, mechanical power only. |

## Sources Reviewed

- DEUTZ official/authorized pages for F 3 L 912 and related 912 Gen family data:
  - https://www.deutz.com/de/produkte/engine-finder/engine-detail/f-3-l-912-2/
  - https://deutz.com.ua/products/f-3-l-912-2/
  - https://pdf.directindustry.de/pdf/deutz/912-gen-motor/5761-119186.html
- DEUTZ FL912/FL913 generator application sheet:
  - https://www.scribd.com/document/430801044/DEUTZ-FL912-FL913-Series-Diesel-Engine-For-Generator-Set-Application-FD-Power-Co-pdf
- Doosan generator-drive data:
  - https://toyotaforklift.com.vn/en/p086ti-p382.html
  - https://www.manualslib.com/manual/3896050/Doosan-P086t1.html
  - https://www.emsa.gen.tr/en/doosan/doosan-3faz-50hz/e-do-st-0220
  - https://www.hd-hyundaiengine.com/cn/engine/generator-detail/10
- Mahindra Powerol generator tables:
  - https://tea-india.org/mmpowers
  - https://www.mahindrapowerol.com/gensets/gensets-75-125kva.html
- Ashok Leyland industrial/genset sources:
  - https://ru.scribd.com/presentation/438070441/Ashok-Leyland
  - https://www.ashokleyland.com/in/powersolution/powergen/cpcb4diesel-genset
- Mercedes-Benz legacy engine sources:
  - https://mercedes-benz-publicarchive.com/marsClassic/en/instance/picture/OM-366-LA.xhtml?oid=186386169
  - https://mbmanuals.com/engines/om366eng.htm
  - https://mbmanuals.com/engines/om401eng.htm
  - https://www.drom.ru/catalog/mercedes-benz/engine/om-352/
- Ford legacy Dorset/Dover sources:
  - https://www.timikengines.com/identify-your-engine/
  - https://barringtondieselclub.co.za/ford/ford-2700-engines.html
  - https://archive.commercialmotor.com/article/23rd-january-1982/26/fords-new-dover-engine-operators-experience
- International/Navistar DT family sources:
  - https://www.dieselhub.com/tech/dt466.html
  - https://manualzz.com/doc/6338754/international-dt-530--ht-530-diesel-engine-user-manual
  - https://www.itstillruns.com/specifications-international-dt360-engine-7702079.html

## Follow-Up Targets

- Find datasheets or brochures that can be attached to the new rows instead of leaving them as source-only catalog entries.
- Continue with low-count brands where legacy models are common in the used generator market: Hino, Komatsu, VM Motori, Daihatsu, Greaves, Kirloskar, Waukesha, MWM, and MAN.
- Revisit Ford and International rows if generator-specific alternator/package sheets are found; today they are intentionally mechanical-power records.
