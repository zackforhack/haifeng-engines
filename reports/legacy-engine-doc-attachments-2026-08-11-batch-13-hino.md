# Legacy Engine Document Attachments - Batch 13 Hino

Date: 2026-08-11

## Result

- Validated Hino legacy documents reviewed: `7`
- Datasheet/manual links inserted: `11`
- Links skipped as existing: `0`
- Missing engine rows: `0`
- Engine count after attachment: `3394`
- Legacy PDF/manual coverage after attachment: `144/425`

## Document Attachments

| Document | Source | Storage path | Linked rows | Verification |
| --- | --- | --- | ---: | --- |
| Hino H06C/H06CT Workshop Manual | https://drive.google.com/file/d/1r0FiUpbxtXeL-WtWzgNBKwV8TgkJ6tXZ/view?usp=sharing | hino/legacy/hino-h06c-h06ct-workshop-manual.pdf | 2 | PDF text verified |
| Hino H07C/H07CT/H07D/H07DT Workshop Manual | https://drive.google.com/file/d/1leK01VKr2w3EE0rgyoHfZIpJyLnRuTlM/view?usp=sharing | hino/legacy/hino-h07c-h07ct-h07d-h07dt-workshop-manual.pdf | 4 | PDF text verified |
| Hino J08C-TP/J08C-TR Engine Service Manual | https://drive.google.com/file/d/1TJqiXt25zJGZWtpXv79XivsXyLZqIidV/view?usp=sharing | hino/legacy/hino-j08c-tp-tr-engine-service-manual.pdf | 1 | PDF text verified |
| Hino W04C-T Workshop Manual | https://drive.google.com/file/d/1bqqJxhxmIlOWoYWtyyF_HHj-JQpUxEIa/view?usp=sharing | hino/legacy/hino-w04c-t-workshop-manual.pdf | 1 | Source-page label and PDF header/size verified; PDF text layer is scanned/watermark-heavy |
| Hino W04C-TI Workshop Manual | https://drive.google.com/file/d/1D_YiZl_PZA59I1D4iWEIlJpAps5DNk08/view?usp=sharing | hino/legacy/hino-w04c-ti-workshop-manual.pdf | 1 | Source-page label and PDF header/size verified; PDF text layer is scanned/watermark-heavy |
| Hino W04D Workshop Manual | https://drive.google.com/file/d/1o6iHSy_wF-VZJ5MuUA5FsYCl5aNATBBq/view?usp=sharing | hino/legacy/hino-w04d-workshop-manual.pdf | 1 | Source-page label and PDF header/size verified; linked to existing W04D-J family row |
| Hino W06D-TI Workshop Manual | https://drive.google.com/file/d/18yKEd43aYxsJq1T0qIhEQItSK8m9tUu8/view?usp=sharing | hino/legacy/hino-w06d-ti-workshop-manual.pdf | 1 | Source-page label and PDF header/size verified; PDF text layer is scanned/watermark-heavy |

## Linked Engine Rows

| Document | Engine slugs |
| --- | --- |
| Hino H06C/H06CT Workshop Manual | hino-h06c<br>hino-h06ct |
| Hino H07C/H07CT/H07D/H07DT Workshop Manual | hino-h07c<br>hino-h07ct<br>hino-h07d<br>hino-h07dt |
| Hino J08C-TP/J08C-TR Engine Service Manual | hino-j08c |
| Hino W04C-T Workshop Manual | hino-w04c-t |
| Hino W04C-TI Workshop Manual | hino-w04c-ti |
| Hino W04D Workshop Manual | hino-w04d-j |
| Hino W06D-TI Workshop Manual | hino-w06d-ti |

## Validation Sources

- https://www.truck-freeworkshop.com/hino/
- http://hino-h06.com/hino-h06c-h06ct-workshop-manual-.html
- http://hino-h07.com/hino-h07c-engine-parts.html
- https://drive.google.com/file/d/1r0FiUpbxtXeL-WtWzgNBKwV8TgkJ6tXZ/view?usp=sharing
- https://drive.google.com/file/d/1leK01VKr2w3EE0rgyoHfZIpJyLnRuTlM/view?usp=sharing
- https://drive.google.com/file/d/1TJqiXt25zJGZWtpXv79XivsXyLZqIidV/view?usp=sharing
- https://drive.google.com/file/d/1bqqJxhxmIlOWoYWtyyF_HHj-JQpUxEIa/view?usp=sharing
- https://drive.google.com/file/d/1D_YiZl_PZA59I1D4iWEIlJpAps5DNk08/view?usp=sharing
- https://drive.google.com/file/d/1o6iHSy_wF-VZJ5MuUA5FsYCl5aNATBBq/view?usp=sharing
- https://drive.google.com/file/d/18yKEd43aYxsJq1T0qIhEQItSK8m9tUu8/view?usp=sharing

## Notes

- This batch links documents only to existing Hino rows already marked `discontinued`.
- The H07 PDF text explicitly covers H07C, H07CT, H07D, and H07DT, so it is linked across those four legacy rows.
- The J08C document explicitly covers J08C-TP and J08C-TR; it is linked to the current generic J08C row rather than creating unverified subtype rows.
- The W04C-T, W04C-TI, W04D, and W06D-TI PDFs are valid PDFs but have scanned/watermark-heavy text extraction, so their exactness is validated from the public source-page labels and Drive file IDs.
- The broad `HINO Engine Manual W04_W06` item was reviewed but not used because the downloaded file is a RAR archive, not a PDF suitable for `engine_pdfs`.
