# Legacy Engine Document Attachments - Batch 80 Perkins/International Strict Docs

Date: 2026-08-12

## Result

- Strict technical/brochure documents verified: `4`
- Strict document links inserted: `4`
- Existing links upgraded to strict type updated: `6`
- Links skipped as existing: `0`
- Missing engine rows: `0`
- Strict legacy coverage before: `291/781 (37.3%)`
- Strict legacy coverage after: `301/781 (38.5%)`
- Remaining strict links needed for 60%: `168`

## Document Attachments

| Document | Type | Source / URL | Storage / URL | Linked rows | Bytes |
| --- | --- | --- | --- | ---: | ---: |
| Perkins 4.236 Series Technical Data Reference | datasheet | https://doczz.net/doc/1282433/perkins-4.236-series | https://doczz.net/doc/1282433/perkins-4.236-series#technical-data | 4 | 88107 |
| International MaxxForce DT/9/10 I-6 Ratings Brochure | brochure | https://news.international.com/news?item=61&asPDF=1 | international/legacy/maxxforce-dt-9-10-i6-family-newsroom-2006.pdf | 3 | 25363 |
| International MaxxForce 11/13 Big Bore Ratings Brochure | brochure | https://news.international.com/news?item=42&asPDF=1 | international/legacy/maxxforce-11-13-big-bore-ratings-2007.pdf | 2 | 24290 |
| International MaxxForce 15 Production/Ratings Brochure | brochure | https://news.international.com/news?item=472&asPDF=1 | international/legacy/maxxforce-15-production-availability-2011.pdf | 1 | 24123 |

## Linked Engine Rows

| Document | Engine slugs |
| --- | --- |
| Perkins 4.236 Series Technical Data Reference | perkins-4-236<br>perkins-t4-236<br>perkins-4-248<br>perkins-4-2482 |
| International MaxxForce DT/9/10 I-6 Ratings Brochure | international-maxxforce-dt<br>international-maxxforce-9<br>international-maxxforce-10 |
| International MaxxForce 11/13 Big Bore Ratings Brochure | international-maxxforce-11<br>international-maxxforce-13 |
| International MaxxForce 15 Production/Ratings Brochure | international-maxxforce-15 |

## Validation Notes

- Perkins 4.236-family strict credit is limited to the exact `4.236`, `T4.236`, `4.248`, and `4.2482` rows because the source names those four models and includes technical-data fields such as displacement, compression ratio and cylinder count.
- International MaxxForce rows use official International/Navistar newsroom PDFs as brochure/rating references. These are not labeled as datasheets; they are strict brochure links because the PDFs validate exact model names, applications and horsepower/rating ranges.
- Existing links were upgraded only when the same exact source was already attached as non-strict `manual`/`other` evidence and the source qualified as a strict `datasheet` or `brochure`.
- Linked only to the four exact 4.236-family models named in the source technical-data text; A4.236/A4.248 rows remain manual-only because this source does not name them in the model list.
- Official International/Navistar newsroom PDF treated as a brochure/rating announcement because it validates exact model names, applications and horsepower ranges.
- Official International/Navistar newsroom PDF treated as a brochure/rating announcement for the exact MaxxForce 11 and 13 big-bore rows.
- Official International/Navistar newsroom PDF treated as a brochure/rating announcement for the exact MaxxForce 15 row.
