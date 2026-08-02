# OEM Dedicated Datasheet Discovery

Generated: 2026-08-01

Goal: increase dedicated/exclusive datasheet coverage toward 80% using only real
public OEM/model-specific PDFs.

## Applied

- Caterpillar G3412C:
  - Source: `https://s7d2.scene7.com/is/content/Caterpillar/LEHW0033-00`
  - Storage: `caterpillar/spec-sheets/g3412c-le-gas-engine.pdf`
  - Verification: PDF text contains `G3412C LE`.
  - Data correction: removed the plain `G3412` sheet from the `G3412C` row.
- Caterpillar 3512E:
  - Source: `https://s7d2.scene7.com/is/content/Caterpillar/CM20210219-ffe0c-d12bb`
  - Storage: `caterpillar/spec-sheets/3512e-marine-aux-dep-1700-ekw.pdf`
  - Verification: PDF text contains `3512E` and `Marine Auxiliary/DEP Engine`.
- Caterpillar G3412:
  - Existing storage object `caterpillar/g3412-gas-datasheet.pdf` was verified
    as the plain `G3412` PDF and is now exclusively linked after removing the
    incorrect `G3412C` link.
- Waukesha / INNIO:
  - Source product pages:
    - `https://www.waukeshaengine.com/gas-engines/vhp/`
    - `https://www.waukeshaengine.com/gas-engines/275gl-plus/`
    - `https://www.waukeshaengine.com/gas-engines/vgf/`
  - Verified and linked 8 public OEM fact sheets:
    - `waukesha/factsheets/vhp-p9394gsi-s5.pdf`
    - `waukesha/factsheets/vhp-l7044gsi-s5.pdf`
    - `waukesha/factsheets/vhp-l7042gsi-s5.pdf`
    - `waukesha/factsheets/vhp-f3524gsi-s5.pdf`
    - `waukesha/factsheets/275gl-12v-esm2-mechanical-drive.pdf`
    - `waukesha/factsheets/275gl-16v-esm2.pdf`
    - `waukesha/factsheets/vgf-h24se.pdf`
    - `waukesha/factsheets/vgf-p48se.pdf`
  - Verification: each source response was a PDF and `pdftotext` contained the
    expected model tokens (`P9394GSI`, `L7044GSI`, `L7042GSI`, `F3524GSI`,
    `12V 275GL`, `16V 275GL`, `H24SE`, `P48SE`).
- Baudouin 60 Hz correction batch:
  - Existing stored real Baudouin `PowerKit Engine Datasheet` PDFs had been
    linked to neighboring 50 Hz primary rows by the older importer.
  - Reassigned 12 stored PDFs to their exact 60 Hz model rows after verifying
    every PDF text contained the exact `/6` model token:
    - `baudouin/spec-sheets/12M33G1100-6.pdf`
    - `baudouin/spec-sheets/12M33G1200-6.pdf`
    - `baudouin/spec-sheets/12M33G1300-6.pdf`
    - `baudouin/spec-sheets/16M33G1650-6.pdf`
    - `baudouin/spec-sheets/16M33G1750-6.pdf`
    - `baudouin/spec-sheets/4M10G83-6.pdf`
    - `baudouin/spec-sheets/6M11G176-6.pdf`
    - `baudouin/spec-sheets/6M21G330-6.pdf`
    - `baudouin/spec-sheets/6M21G390-6.pdf`
    - `baudouin/spec-sheets/6M21G460-6.pdf`
    - `baudouin/spec-sheets/6M33G633-6.pdf`
    - `baudouin/spec-sheets/8M33G800-6.pdf`
- Baudouin official lean-burn gas spec sheets:
  - Source product pages:
    - `https://baudouin.com/engine_product/6m11-3/`
    - `https://baudouin.com/engine_product/6m16-6/`
    - `https://baudouin.com/engine_product/6m21-3/`
    - `https://baudouin.com/engine_product/6m33-4/`
    - `https://baudouin.com/engine_product/12m55-2/`
    - `https://baudouin.com/engine_product/16m33-2/`
  - Verified and linked 6 public OEM spec-sheet PDFs:
    - `baudouin/official-gas-spec-sheets/6m11g4n0-5.pdf`
    - `baudouin/official-gas-spec-sheets/6m16g4n0-5.pdf`
    - `baudouin/official-gas-spec-sheets/6m21g4n0-5.pdf`
    - `baudouin/official-gas-spec-sheets/6m33g6n0-5.pdf`
    - `baudouin/official-gas-spec-sheets/12m55g6n0-5.pdf`
    - `baudouin/official-gas-spec-sheets/16m33g6n0-5.pdf`
  - Verification: every source response began with `%PDF`; `pdftotext -layout`
    contained the exact model token plus `Baudouin.com` and gas-engine markers.
    The `6M21` OEM sheet has the correct `6M21G4N0/5` rating row but carries a
    `6M16G4N0/5` token in its dimensions table; this was documented in the
    importer instead of silently ignored.
  - Rejected from the same official source: `12M33G10N0/5` and
    `12M33G10B0/5` sheets also contain still-missing `/6` catalog model tokens
    (`12M33G14N0/6`, `12M33G14B0/6`), so they were not imported as exclusive
    one-row datasheets.
- Perkins engine data sheets hosted by Americas Generators:
  - Source product pages:
    - `https://americasgenerators.com/750-kw-triton-diesel-generator-tp-p750-t2-ul-tier-2-ul-listed/`
    - `https://americasgenerators.com/875-kw-triton-diesel-generator-tp-p875-t1-international-use/`
  - Verified and linked 2 Perkins-authored engine data PDFs:
    - `perkins/americas-engine-data-sheets/2806c-e18ttag7.pdf`
    - `perkins/americas-engine-data-sheets/4008tag2.pdf`
  - Verification: both source responses began with `%PDF`; `pdftotext -layout`
    contained the exact model token, `Perkins Engines Company Limited`, and
    engine-data/specification markers. The separate generator-set PDFs on those
    pages were not imported.
- Caterpillar 3516C-HD:
  - Source page:
    `https://h-cpc.cat.com/cmms/v2?cid=402&f=product&gid=18434701&it=product&lid=en&nc=1&pid=18459192&sc=M450`
  - Source PDF:
    `https://s7d2.scene7.com/is/content/Caterpillar/CM20240910-36bf4-cb1a6`
  - Storage:
    `caterpillar/spec-sheets/3516c-hd-offshore-generator-set.pdf`
  - Verification: PDF text contains `3516C`, `HD`, and
    `Offshore Generator Set`.
- Caterpillar oilfield generator set spec sheets:
  - Source pages:
    - `https://www.hawthornecat.com/item/g3512/`
    - `https://www.hawthornecat.com/item/g3520/`
  - Source PDFs:
    - `https://s7d2.scene7.com/is/content/Caterpillar/CM20210630-80c97-a706a`
    - `https://s7d2.scene7.com/is/content/Caterpillar/CM20210409-4be59-15f2d`
  - Storage:
    - `caterpillar/spec-sheets/g3512-drilling-genset-spec-sheet.pdf`
    - `caterpillar/spec-sheets/g3520-oil-gas-generator-set-spec-sheet.pdf`
  - Verification: both source responses were PDFs; `pdftotext` contained the
    exact model token (`G3512` or `G3520`) and Caterpillar/Cat markers.
- Caterpillar 3516E:
  - Source page:
    `https://www.cat.com/en_US/products/new/power-systems/electric-power/diesel-generator-sets/1000024629.html`
  - Source PDF:
    `https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1299-`
  - Storage:
    `caterpillar/spec-sheets/3516e-50hz-low-fuel-consumption-spec-sheet.pdf`
  - Verification: source response was a PDF; `pdftotext` contained `3516E`,
    `Cat`, and `Caterpillar` markers.
- Caterpillar gas generator set spec sheets hosted by Soar Power:
  - Source page:
    `https://www.soar.hk/nggenset3_en/`
  - Verified and linked 2 public Cat/Caterpillar-authored model-specific PDFs:
    - Source: `https://www.soar.hk/pdf/G3516H.2027kW_english.pdf`
      Storage: `caterpillar/soar-gas-spec-sheets/g3516h-2027kw-english.pdf`
    - Source: `https://www.soar.hk/pdf/G3520C.CHP.2000kW_chinese.pdf`
      Storage:
      `caterpillar/soar-gas-spec-sheets/g3520c-chp-2000kw-chinese.pdf`
  - Verification: each response began with `%PDF`; `pdftotext` contained the
    exact model token (`G3516H` or `G3520C`) and Cat/Caterpillar markers. The
    importer rejects sibling gas tokens such as `G3520H`, `G3512H`, `CG170`,
    and `CG260`.
  - Rejected from the same source: `G3520H.2519kW_english.pdf` returned HTML,
    not PDF bytes; shared CG170/CG260 range PDFs were not imported for
    dedicated/exclusive coverage.
- Caterpillar official H-series gas data sheets:
  - Source pages:
    - `https://h-cpc.cat.com/cmms/v2?cid=402&f=product&gid=18327284&it=product&lid=en&nc=1&pid=1000034459&sc=T210`
    - `https://h-cpc.cat.com/cmms/v2?cid=402&f=product&gid=18327284&it=product&lid=en&nc=1&pid=104683&sc=X355`
  - Verified and linked 2 public Cat/Caterpillar model-specific PDFs:
    - Source: `https://emc.cat.com/n/api/pubdirect?media_string_id=LEHE1443-`
      Storage:
      `caterpillar/official-gas-datasheets/g3512h-50hz-natural-gas.pdf`
    - Source:
      `https://s7d2.scene7.com/is/content/Caterpillar/CM20190905-e6c89-25b86`
      Storage:
      `caterpillar/official-gas-datasheets/g3520h-50hz-natural-gas.pdf`
  - Verification: each response began with `%PDF`; `pdftotext` contained the
    exact model token (`G3512H` or `G3520H`) and Cat/Caterpillar markers. The
    importer rejects sibling gas tokens such as `G3516H`, `G3520C`, `CG170`,
    and `CG260`.
- Caterpillar official G3516 gas engine spec sheet:
  - Source page:
    `https://h-cpc.cat.com/cmms/v2?cid=402&f=product&gid=18434723&it=product&lid=en&nc=1&pid=18443940&sc=US`
  - Source PDF:
    `https://s7d2.scene7.com/is/content/Caterpillar/LEHW0036-00`
  - Storage:
    `caterpillar/official-gas-engine-spec-sheets/g3516-le-petroleum-engine.pdf`
  - Verification: source response began with `%PDF`; `pdftotext` contained
    `G3516`, `Cat`, and `Caterpillar`, while sibling tokens such as `G3512`,
    `G3520`, `G3508`, `G3412`, `CG170`, and `CG260` were absent.
- Cummins exact gas generator set sheets:
  - Source pages:
    - `https://onpointgen.com/equipment/generators/cummins/c125-n6/`
    - `https://onpointgen.com/equipment/generators/cummins/c100-n6/`
  - Source PDFs:
    - `https://rockymountaingeneratorsupply.com/userfiles/2002/C125N6%20Spec%20Sheet.pdf`
    - `https://www.depco.com/wp-content/uploads/2023/02/Cummins-C100N6-Data-Sheet.pdf`
  - Storage:
    - `cummins/gas/exact-spec-sheets/c125n6-spec-sheet.pdf`
    - `cummins/gas/exact-spec-sheets/c100n6-data-sheet.pdf`
  - Verification: both source responses were PDFs; `pdftotext` contained the
    exact model token and Cummins markers. The importer rejects C-series PDFs
    that contain additional C-series model tokens, so shared range sheets were
    not counted as dedicated/exclusive.
- mtu official Gendrive spec sheet:
  - Source product list:
    `https://www.mtu-solutions.com/eu/en/products/power-generation-products-list.suffix.html/Model%20Name%3DSeries%202000.html`
  - Source PDF:
    `https://www.mtu-solutions.com/content/dam/mtu/products/power-generation/powergeneration-product-list-latest/32310341_MTU_Gendrive_spec_16V2000Gx06_3B_3G_W2A.pdf/_jcr_content/renditions/original./32310341_MTU_Gendrive_spec_16V2000Gx06_3B_3G_W2A.pdf`
  - Storage:
    `mtu/official-gendrive-spec-sheets/16v2000g26s-gx6-w2a.pdf`
  - Verification: the official embedded product-list JSON mapped this PDF only
    to the missing `16V 2000 G26S` product row. The response began with
    `%PDF`; `pdftotext` contained `16V 2000 G26S` and `mtu`, while sibling
    tokens such as `12V 2000 G26S`, `18V 2000 G26S`, `16V 2000 G26F`,
    `16V 2000 G76S`, and `16V 2000 G86S` were absent.
- Liebherr official D976 power-generation engine PDF:
  - Source page:
    `https://www.liebherr.com/en-au/components/solutions/combustion-engines/product-portfolio-diesel-engines/d976-power-generation-8858374`
  - Source PDF:
    `https://assets-cdn.liebherr.com/versions/cc38f271-69f5-4485-adee-4eb644a1812c/original/Brochure-Genset_6pages-OK_FINAL-12032026.pdf`
  - Storage:
    `liebherr/official-engine-datasheets/d976-power-generation.pdf`
  - Verification: source response began with `%PDF`; `pdftotext` contained
    `D976` and `Liebherr`, while sibling tokens such as `D936`, `D946`,
    `D9508`, `D9612`, `D9812`, `D9816`, and `D9820` were absent.
- Liebherr official D96 power-generation engine PDFs:
  - Source pages:
    - `https://www.liebherr.com/en-gb/components/solutions/combustion-engines/product-portfolio-diesel-engines/d9612-power-generation-8918883`
    - `https://www.liebherr.com/en-gb/components/solutions/combustion-engines/product-portfolio-diesel-engines/d9616-power-generation-8918884`
    - `https://www.liebherr.com/en-gb/components/solutions/combustion-engines/product-portfolio-diesel-engines/d9620-power-generation-8968686`
  - Verified and linked 3 public Liebherr model-specific engine PDFs:
    - Source: `https://assets-cdn.liebherr.com/versions/b4632d44-a734-4eca-a467-6fafdba8b8c9/original/`
      Storage:
      `liebherr/official-engine-datasheets/d9612-power-generation.pdf`
    - Source: `https://assets-cdn.liebherr.com/versions/4124b14e-a651-4c5f-9acb-3b1a8a0d4181/original/`
      Storage:
      `liebherr/official-engine-datasheets/d9616-power-generation.pdf`
    - Source: `https://assets-cdn.liebherr.com/versions/157d514c-a0d0-4a7d-a748-45a87839d038/original/`
      Storage:
      `liebherr/official-engine-datasheets/d9620-power-generation.pdf`
  - Verification: each source response began with `%PDF`; `pdftotext`
    contained the exact model token (`D9612`, `D9616`, or `D9620`) and
    `Liebherr`, while nearby D96/D98 sibling tokens such as `D976`, `D9812`,
    `D9816`, and `D9820` were absent.
  - Post-refresh note: these links are legitimate OEM PDFs, but the latest
    dedicated/exclusive coverage refresh still reported 926 exclusive rows; the
    current missing Liebherr set is concentrated in other D93/D94/D95/D98/D99
    rows.
- Perkins / Baifa-hosted OEM engine data sheet:
  - Source index:
    `https://www.baifapower.com/Enginespecsheet/`
  - Source PDF:
    `https://www.baifapower.com/static/upload/download/fadongji/1106A-70TAG4-1500rpm.pdf`
  - Storage:
    `perkins/baifa-engine-spec-sheets/1106a-70tag4-1500rpm.pdf`
  - Verification: source response was a PDF; `pdftotext` contained
    `1106A-70TAG4`, `Perkins`, and `ElectropaK`. The importer rejects adjacent
    Perkins model tokens such as `1106A-70TG1`, `1106A-70TAG1`,
    `1106A-70TAG2`, `1106A-70TAG3`, and `1106D-E70TAG4`.
- Cummins official G-Drive specification sheets:
  - Source pages:
    - `https://www.cummins.com/en-ame/g-drive-engines/products/diesel-qsl9-series`
    - `https://www.cummins.com/en-na/g-drive-engines/products/diesel-electronic-b-series`
  - Verified and linked 2 public Cummins model-specific PDFs:
    - Source:
      `https://mart.cummins.com/imagelibrary/data/assetfiles/0070372.pdf`
      Storage: `cummins/official-gdrive-spec-sheets/qsl9-g3.pdf`
    - Source:
      `https://mart.cummins.com/imagelibrary/data/assetfiles/0070819.pdf`
      Storage: `cummins/official-gdrive-spec-sheets/qsb7-g4.pdf`
  - Verification: each source response began with `%PDF`; `pdftotext`
    contained the exact model token (`QSL9-G3` or `QSB7-G4`), `Cummins`, and
    `Specification Sheet`. The importer rejects neighboring tokens such as
    `QSL9-G2`, `QSL9-G5`, `QSB7-G5`, `QSB7-G18`, and `QSB7-G19`.
- Cummins official Mechanical B-Series specification sheets:
  - Source page:
    `https://www.cummins.com/en-na/g-drive-engines/products/diesel-mechanical-b-series`
  - Verified and linked 2 public Cummins model-specific PDFs:
    - Source:
      `https://mart.cummins.com/imagelibrary/data/assetfiles/0064177.pdf`
      Storage: `cummins/official-b-series-spec-sheets/4btaa33-g17.pdf`
    - Source:
      `https://mart.cummins.com/imagelibrary/data/assetfiles/0064178.pdf`
      Storage: `cummins/official-b-series-spec-sheets/4btaa33-g18.pdf`
  - Verification: each source response began with `%PDF`; `pdftotext`
    contained the exact model token (`4BTAA3.3-G17` or `4BTAA3.3-G18`),
    `Cummins`, and `Specification Sheet`. The importer rejects neighboring
    tokens such as `4BTAA3.3-G12`, `4BTAA3.3-G13`, `4BTAA3.3-G14`,
    `4BTAA3.3-G15`, `4BTAA3.3-G16`, and the paired sibling `G17`/`G18`.
- Rehlko / Kohler official KD engine info sheets:
  - Source page:
    `https://www.powersystems.rehlko.com/brochures-literature?industries=dataCenters&literaturetype=brochure&productline=diesel`
  - Verified and linked 6 public Rehlko/Kohler model-specific PDFs:
    - Source:
      `https://resources.rehlko.com/industrial/pdf/kd_series_data_kd27v12.pdf`
      Storage:
      `kohler/rehlko-official-kd-engine-info-sheets/kd27v12.pdf`
    - Source:
      `https://resources.rehlko.com/industrial/pdf/kd_series_data_kd36v16.pdf`
      Storage:
      `kohler/rehlko-official-kd-engine-info-sheets/kd36v16.pdf`
    - Source:
      `https://resources.rehlko.com/industrial/pdf/kd_series_data_kd45v20.pdf`
      Storage:
      `kohler/rehlko-official-kd-engine-info-sheets/kd45v20.pdf`
    - Source:
      `https://resources.rehlko.com/industrial/pdf/kd_series_data_kd83v16.pdf`
      Storage:
      `kohler/rehlko-official-kd-engine-info-sheets/kd83v16.pdf`
    - Source:
      `https://resources.rehlko.com/industrial/pdf/kd_series_data_kd62v12.pdf`
      Storage:
      `kohler/rehlko-official-kd-engine-info-sheets/kd62v12.pdf`
    - Source:
      `https://resources.rehlko.com/industrial/pdf/KD_Series_Sellsheet.pdf`
      Storage:
      `kohler/rehlko-official-kd-engine-info-sheets/kd103v20.pdf`
  - Verification: each response began with `%PDF`; `pdftotext -layout`
    contained the exact KD model token, `Kohler`, `KD Series`, and `Engine`.
    The importer rejects sibling KD tokens such as `KD62V12`, `KD103V20`,
    and the other applied KD models.
- Xinchai official product datasheets:
  - Source catalog:
    `https://www.xinchaiengine.com/products.html`
  - Verified and linked 8 public model-specific product datasheet PDFs:
    - Source:
      `https://jrrorwxhijopli5p.ldycdn.com/3B11YD41%E6%80%A7%E8%83%BD%E5%8F%82%E6%95%B0%28%E4%B8%AD%E6%96%87%29+3000-aidmoBpiKnmRlkSpikliojkj.pdf`
      Storage: `xinchai/official-product-datasheets/3b11yd41.pdf`
    - Source:
      `https://rprorwxhijopli5q.ldycdn.com/4D35ZD-aidmjBpiKnmRliSmjqimolpl.pdf?dp=`
      Storage: `xinchai/official-product-datasheets/4d35zd.pdf`
    - Source:
      `https://rprorwxhijopli5q.ldycdn.com/4E30YD-aidmnBpiKnmRliSpkqopjlik.pdf?dp=`
      Storage: `xinchai/official-product-datasheets/4e30yd.pdf`
    - Source:
      `https://rprorwxhijopli5q.ldycdn.com/4K41LD-aidmpBpiKnmRliSmjqirqljj.pdf?dp=`
      Storage: `xinchai/official-product-datasheets/4k41ld.pdf`
    - Source:
      `https://rprorwxhijopli5q.ldycdn.com/A498BD-aidmpBpiKnmRliSmjqimollk.pdf?dp=`
      Storage: `xinchai/official-product-datasheets/a498bd.pdf`
    - Source:
      `https://rprorwxhijopli5q.ldycdn.com/A498BZD-aidmnBpiKnmRliSmjqiqolkk.pdf?dp=`
      Storage: `xinchai/official-product-datasheets/a498bzd.pdf`
    - Source:
      `https://rprorwxhijopli5q.ldycdn.com/C490BD-aidmrBpiKnmRliSpjqpnmlil.pdf?dp=`
      Storage: `xinchai/official-product-datasheets/c490bd.pdf`
    - Source:
      `https://rprorwxhijopli5q.ldycdn.com/NC485BD-aidmpBpiKnmRliSmjqikolrj.pdf?dp=`
      Storage: `xinchai/official-product-datasheets/nc485bd.pdf`
  - Verification: each response began with `%PDF`; `pdftotext -layout`
    contained the exact model token and datasheet/specification markers such as
    `Main Technical Parameters`, `基本规格`, or `功率`. The importer rejects
    nearby Xinchai sibling tokens such as `4D35LD`, `4K41RD`, `A4K41ZD`,
    `A498BZD1`, and `A498BZD2`.
  - Rejected from the same official catalog pass: the `4D35LD` page points to
    the `4D35ZD` PDF, the `4K41RD` page points to the `4K41ZD` PDF, and the
    `4N28ZD` product page exposed no direct PDF URL.
- Perkins exact OEM technical data sheets:
  - Source pages:
    - `https://tickets.wellandpower.net/hc/en-us/articles/360002174037-All-About-the-Perkins-1106A-70TG1-Engine`
    - `https://tickets.wellandpower.net/hc/en-us/articles/360002183977-All-About-the-Perkins-2806A-E18TTAG4-Engine`
    - `https://tickets.wellandpower.net/hc/en-us/articles/360002184157-All-About-the-Perkins-2806A-E18TTAG5-Engine`
    - `https://tickets.wellandpower.net/hc/en-us/articles/360002186257-All-About-the-Perkins-4008TAG1A-Engine`
    - `https://tickets.wellandpower.net/hc/en-us/articles/360002193278-All-About-the-Perkins-4008TAG2A-Engine`
    - `https://tickets.wellandpower.net/hc/en-us/articles/360002187117-All-About-the-Perkins-4012-46TWG3A-Engine`
    - `https://tech-expo.ru/engines/perkins-4016tag2a/`
  - Verified and linked 7 public Perkins-authored exact technical data sheets:
    - `perkins/welland-exact-spec-sheets/1106a-70tg1.pdf`
    - `perkins/welland-exact-spec-sheets/2806a-e18ttag4.pdf`
    - `perkins/welland-exact-spec-sheets/2806a-e18ttag5.pdf`
    - `perkins/welland-exact-spec-sheets/4008tag1a.pdf`
    - `perkins/welland-exact-spec-sheets/4008tag2a.pdf`
    - `perkins/welland-exact-spec-sheets/4012-46twg3a.pdf`
    - `perkins/secondary-exact-spec-sheets/4016tag2a.pdf`
  - Verification: every response began with `%PDF`; `pdftotext -layout`
    contained the exact DB model token, `www.perkins.com` or
    `Perkins Engines Company Limited`, and technical/specification markers.
    The importer rejects nearby sibling tokens such as `1106A-70TAG2`,
    `2806A-E18TTAG6`, `4008TAG2`, `4012-46TAG2A`, and `4016TAG1A`. The
    `4016TAG2A` file is hosted by Techexpo, but its extracted PDF text is
    Perkins-authored (`PN2181/11/18`, produced in England by Perkins Engines
    Company Limited).
- Yanmar America:
  - Source catalog:
    `https://yanmarengines.com/diesel-water-cooled-engines/`
  - Verified and linked 14 public OEM sales/spec sheets:
    - `yanmar/official-sales-sheets/3tnm74f-ngge.pdf`
    - `yanmar/official-sales-sheets/3tnv80f-ngge.pdf`
    - `yanmar/official-sales-sheets/3tnv88f-ugge.pdf`
    - `yanmar/official-sales-sheets/4tnv84t-bgges.pdf`
    - `yanmar/official-sales-sheets/2tnv70-hge.pdf`
    - `yanmar/official-sales-sheets/3tnv70-hge.pdf`
    - `yanmar/official-sales-sheets/3tnv76-gge.pdf`
    - `yanmar/official-sales-sheets/3tnv76-hge.pdf`
    - `yanmar/official-sales-sheets/3tnv82a-gge.pdf`
    - `yanmar/official-sales-sheets/4tnv88-bgges.pdf`
    - `yanmar/official-sales-sheets/4tnv98c-gge.pdf`
    - `yanmar/official-sales-sheets/4tnv98-zgges.pdf`
    - `yanmar/official-sales-sheets/4tnv98t-zgges.pdf`
    - `yanmar/official-sales-sheets/4tnv98ct-gge.pdf`
  - Verification: each source response was a PDF and `pdftotext` contained the
    expected model token (`3TNM74F-NGGE`, `3TNV80F-NGGE`,
    `3TNV88F-UGGE`, `4TNV84T-BGGES`, `4TNV88-BGGES`,
    `2TNV70-HGE`, `3TNV70-HGE`, `3TNV76-GGE`, `3TNV76-HGE`,
    `3TNV82A-GGE`, `4TNV98C-GGE`, `4TNV98-ZGGES`,
    `4TNV98T-ZGGES`, `4TNV98CT-GGE`).
  - Data correction: removed three stale shared links from `NG6GE`/`UG6GE`
    variant rows where the stored PDF text verified only the non-`6` model.
  - Post-refresh note: these links are legitimate OEM PDFs, but the latest
    dedicated/exclusive coverage refresh still reported 926 exclusive rows; the
    batch did not move the current goal metric.
- HD Hyundai Infracore:
  - Source seed page:
    `https://www.hd-hyundaiengine.com/en/engine/generator-detail/26`
  - The seed page exposes official generator detail IDs for the current
    Hyundai generator-engine lineup. Each detail page exposes a direct
    `/hd-infra-engine/file/down/<uuid>` PDF download.
  - Verified and linked 58 public OEM `Spec Sheet` PDFs under:
    `hyundai/official-generator-spec-sheets/`
  - Verification: every source response was a PDF and `pdftotext` contained
    the exact DB model token, including representative disambiguated variants
    such as `DP086CBV`, `DP034CCP`, `DP158CD-1`, `DP222CAS`,
    `DP126CAK`, `DP086CCK`, `P086TI-1`, and `DP222CBS`.
  - Result: Hyundai exclusive/dedicated datasheet coverage is now
    67 / 82 (81.7%).
  - Rows not linked in this Hyundai pass because no matching current official
    detail page was exposed: `DP372CB`, `DP372CC`, `DP372CD`, `DP372CE`,
    `DP372CA`, `DM02AP`, `DX05G`, `DX05PG`, `DX08G`, `DX12G`, `DX15G`,
    `DX15GA`, `DX22`, `P180FE`, `P222FE`.
- Perkins / Triton-hosted OEM engine data sheets:
  - Source catalog:
    `https://tritonpower.com/product-sitemap.xml`
  - Triton product pages expose `Engine Data Sheet` PDF links. The accepted
    files are Perkins-authored sheets containing `Perkins`, `www.perkins.com`,
    an ElectropaK/electric-unit marker, and the exact DB model token.
  - Verified and linked 11 exact public Perkins engine datasheets:
    - `perkins/triton-oem-engine-datasheets/perkins-1104d-e44tg1.pdf`
    - `perkins/triton-oem-engine-datasheets/perkins-1104d-e44tag2.pdf`
    - `perkins/triton-oem-engine-datasheets/perkins-1106d-e70tag2.pdf`
    - `perkins/triton-oem-engine-datasheets/perkins-1106d-e70tag4.pdf`
    - `perkins/triton-oem-engine-datasheets/perkins-1106d-e70tag5.pdf`
    - `perkins/triton-oem-engine-datasheets/perkins-1706d-e93tag1.pdf`
    - `perkins/triton-oem-engine-datasheets/perkins-1706d-e93tag2.pdf`
    - `perkins/triton-oem-engine-datasheets/perkins-2206d-e13tag3.pdf`
    - `perkins/triton-oem-engine-datasheets/perkins-1104d-e44tag1.pdf`
    - `perkins/triton-oem-engine-datasheets/perkins-2206d-e13tag2.pdf`
    - `perkins/triton-oem-engine-datasheets/perkins-2806c-e18tag3.pdf`
  - Dry-run/application scope: 11 model-token-matching Triton product pages,
    55 visible `Engine Data Sheet` links, 11 same-model PDF URLs checked,
    11 exact Perkins/OEM-model matches linked. The `1104D-E44TAG2` sheet uses
    the older `Produced in England ... Perkins Engines Company Limited` marker
    instead of an extracted `www.perkins.com` marker.
- Baifa public engine spec-sheet index:
  - Source index:
    `https://www.baifapower.com/Enginespecsheet/`
  - The visible index links use uppercase `/FADONGJI/`; direct local requests to
    those paths redirect to the Baifa HTML shell. Rewriting the same indexed
    links to lowercase `/fadongji/` returned real PDF bytes for a verified
    subset.
  - Verified and linked 36 public model-specific engine spec sheets:
    - 4 Volvo Penta sheets:
      `TAD840GE-B`, `TAD841GE`, `TAD842GE`, `TAD843GE`
    - 18 Baudouin `PowerKit Engine Datasheet` PDFs:
      `4M10G2D3/5`, `4M10G4D3/5`, `4M10G6D3/5`, `4M10G66/6`,
      `6M21G2D3/5`, `6M21G6D3/5`, `6M21G8D3/5`, `6M21G400/5`,
      `12M55G2250/6`, `12M55G2500/6`, `12M55G3000/5`,
      `16M33G1400/6`, `16M55G4000/5`, `16M55G2800/6`,
      `16M55G2640/6`, `20M33G2250/5`, `20M33G2000/6`,
      `20M33G2200/6`
    - 14 Perkins sheets:
      `1103A-33G`, `1103A-33TG1`, `1103A-33TG2`, `1106A-70TAG2`,
      `1106A-70TAG3`, `1106D-E70TAG3`, `4008-30TAG3`,
      `4012-46TAG2A`, `4012-46TAG3A`, `4012-46TWG2A`,
      `4016-61TRG1`, `4016TAG1A`, `4016-61TRG2`, `4016-61TRG3`
  - Verification: every accepted response began with `%PDF`; `pdftotext`
    contained the exact DB model token and brand markers (`Volvo`/`Penta`,
    `Baudouin`/`PowerKit`, or `Perkins`). Three indexed URLs were rejected
    because local downloads returned HTML instead of PDF bytes.
- Integrity cleanup: Baudouin spec-sheet cross-links:
  - Verified five stored public Baudouin PDFs with `pdftotext`; each contains
    the exact Baudouin model token and `Baudouin`, while sampled linked Weichai
    model tokens were absent:
    - `baudouin/spec-sheets/12M33G1500-5.pdf`
    - `baudouin/spec-sheets/16M33G2000-5.pdf`
    - `baudouin/spec-sheets/6M33G750-5.pdf`
    - `baudouin/spec-sheets/12M26G1000-5.pdf`
    - `baudouin/spec-sheets/8M33G1100-5.pdf`
  - Removed 32 incorrect Weichai `engine_pdfs` links from those Baudouin
    sheets. The Baudouin rows and storage objects were left untouched.
- Integrity cleanup: Mitsubishi non-`-C` spec sheets linked to China `-C`
  variants:
  - Verified 11 stored public MHI PDFs with `pdftotext`; each contains the
    exact base Mitsubishi model and `Mitsubishi`, while the corresponding `-C`
    model token was absent.
  - Removed 11 incorrect China-variant links and preserved the exact base-model
    links. This follows the MHI importer rule that China-specific `-C` variants
    are not covered by the public MHI non-`-C` catalog sheets.
- Integrity cleanup: Yanmar exact PDFs linked to sibling variants:
  - Verified `yanmar/4tnv98c-gge.pdf` and `yanmar/3tnv88-gge.pdf` with
    `pdftotext`. The exact base model tokens were present, while linked sibling
    tokens such as `4TNV98CT-GGE`, `4TNV98C-IYE`, and `3TNV88-GGHWC` were
    absent.
  - Removed 4 incorrect sibling links and preserved the exact base-model links.
- Integrity cleanup: Cummins exact PDFs linked to sibling ratings:
  - Verified five stored Cummins PDFs with `pdftotext`; each contains `Cummins`
    and the exact base rating token while the linked sibling rating token was
    absent:
    - `cummins/spec-sheets/kta38-g4-specsheet.pdf`
    - `cummins/spec-sheets/kta50-g3-specsheet.pdf`
    - `cummins/spec-sheets/kta50-g8-specsheet.pdf`
    - `cummins/spec-sheets/qsk19-g5-specsheet.pdf`
    - `cummins/spec-sheets/qsk38-g5-specsheet.pdf`
  - Removed 5 incorrect sibling-rating links and preserved the exact base-rating
    links.
- Integrity cleanup: PSI/Mitsubishi exact PDFs linked to sibling variants:
  - Verified five stored PSI PDFs and one stored Mitsubishi PDF with
    `pdftotext`; each contains the base model token and brand marker while the
    linked higher-output or suffix variant token was absent.
  - Removed 6 incorrect sibling links and preserved the exact base-model links:
    - `mitsubishi/spec-sheets/s16r-y2ptaw2.pdf`
    - `psi/PSI-PSYSTEMS_13LT-Gas_Engine-3.pdf`
    - `psi/PSI-PSYSTEMS_14L-Gas_Engine.pdf`
    - `psi/PSI-PSYSTEMS_22L-Gas_Engine-2.pdf`
    - `psi/PSI-PSYSTEMS_5.7LCAC-Gas_Engine-3.pdf`
    - `psi/PSI-PSYSTEMS_53L-Gas_Engine.pdf`
- Integrity cleanup: Cummins/Deutz exact PDFs linked to sibling rows:
  - Verified three stored PDFs with `pdftotext`; each contains the exact keep
    model and brand marker while the linked sibling/rating tokens were absent:
    - `cummins/spec-sheets/qsl9-gdrive.pdf` contains `QSL9-G7` and `Cummins`,
      not the linked `QSL8.9-*` or `QSL9-G3` sibling ratings.
    - `cummins/spec-sheets/qsk23-g5-60hz-epa-tier-2.pdf` contains `QSK23-G5`
      and `Cummins`, not the linked `QSK23-G5 NR2` token.
    - `deutz/spec-sheets/motordatenblatt-deutz-tcd2013l06.pdf` contains
      `TCD2013L06 4V`, not the linked `TAD750GE`-`TAD754GE`, `TCD2013L06 2V`,
      or plain `TCD2013L6` rows.
  - Removed 15 incorrect sibling links and preserved the exact base/model links.
- Integrity cleanup: Perkins/Mesa exact PDFs linked to sibling rows:
  - Ran a read-only audit across 178 shared datasheet files touching
    missing-exclusive rows. Twelve possible single-token candidates were
    inspected manually; broad brochures and family sheets were rejected.
  - Verified three stored public spec/datasheet PDFs with `pdftotext`; each
    contains the exact keep model token while the linked sibling token was
    absent:
    - `perkins/spec-sheets/404J-electric-power.pdf` contains `404J-22G`, not
      `404J-E22TAG`.
    - `perkins/spec-sheets/1706J-E93TAG-electric-power.pdf` contains
      `1706J-E93TAG1`, not `1706J-E93TAG2`.
    - `mesa/mesa-gv22pu-spec-sheet.pdf` is titled `GV22PU Engine` and contains
      `GV22PU`, not `GX22`.
  - Removed 4 incorrect sibling document links and preserved the exact
    model-specific links, creating 3 additional exclusive datasheet rows.

Coverage moved from 719 to 926 engines with at least one exclusively linked
datasheet file across the Caterpillar, Waukesha, Baudouin, Yanmar, Hyundai,
Perkins/Triton, Baifa, Cummins gas, Cummins official G-Drive/B-Series, and
integrity-cleanup, Rehlko/Kohler, Xinchai, and Perkins Welland/Techexpo
batches.

## Checked But Not Applied

- VMAN:
  - `https://www.vman-engine.com/download` lists model-specific data sheet
    documents, but direct requests to `/download_yanzheng` return password
    errors. Not attached without credentials.
  - Rechecked the live page for the large missing-exclusive VMAN group. The
    official data sheet entries are exposed as `data-url` IDs such as `151`
    (D11), `158` (D15), `164` (D22), and `330` (C03), but
    `/download_yanzheng?id=<id>&yan=` returns `{"code":-2,...,"password error"}`.
    No public PDF bytes were available without credentials.
- Lister Petter:
  - WordPress media API returned application media, but no model-token matches
    across the live Lister Petter rows.
- Origin Engines:
  - Official `4.3L` spec sheet is already linked. Other public product pages
    did not expose direct PDF spec sheets.
- Generac:
  - RG product pages expose public spec sheets, but the remaining RG documents
    are shared 22-38 kW family PDFs already represented as shared links.
- MWM:
  - Official pages expose series brochures such as TCG 2020, not one PDF per
    engine row.
- Volvo Penta:
  - Official downloads include product bulletins, but tested publications such
    as `47711616` are shared across multiple GE-B models.
  - Checked Volvo Penta Mexico public `Hoja Técnica` tables:
    - `https://www.volvopenta-mexico.com.mx/motores-industriales/`
    - `https://www.volvopenta-mexico.com.mx/motores-generacion-electrica/`
  - The industrial PDFs are public Volvo Penta data sheets, but sampled files
    are range-level documents such as `TAD570-572VE`, `TAD870-873VE`, and
    `TAD1381-1385VE`, not one file per catalog row. The generation page exposes
    some exact GE PDFs, but the missing-exclusive matches found there
    (`TWD1672GE` and `TWD1673GE`) share sibling model text in the same PDF, so
    they were not imported as dedicated/exclusive evidence.
  - Rechecked current Volvo Penta product pages and publication endpoints:
    - D8 Stage V `47712910` returned a real PDF, but it is a shared
      `TAD880-882GE` bulletin containing `TAD880GE`, `TAD881GE`, and
      `TAD882GE`.
    - D8 Stage IIIA/EPA Tier 3 `47713385` returned a real PDF, but it is a
      shared `TAD851-853GE` bulletin.
    - D8 Stage II `47713334` returned a real PDF, but it is a shared
      `TAD840GE-B / TAD841-843GE` bulletin.
    - D13 `47709295`, `47709296`, `47709297`, `47709312`, `47709011`, and
      `47709012` are exact public Volvo Penta product bulletins for
      `TAD1350GE`-`TAD1355GE`, but those catalog rows already had exclusive
      stored datasheets (`volvo/tad1350ge.pdf` through `volvo/tad1355ge.pdf`),
      so no duplicate links were added.
- DEUTZ:
  - Official archive is useful, but tested BFL 2011 technical sheet already
    supports multiple models and is already linked as a shared file.
- Waukesha / INNIO:
  - Earlier pass was stale; current product pages expose stable direct PDF URLs.
  - VHP, 275GL+, H24SE and P48SE were applied. Remaining VGF GSI rows still
    need exact fact sheets; the VGF public page exposed only H24SE and P48SE.
- John Deere:
  - Ran the existing bounded official specsheets prober against the 10
    no-datasheet Deere rows.
  - Result: 0 public model-specific Deere PDF hits under
    `https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/specsheets`.
  - Checked 12 Triton `TP-JD` / `TP-RJD` product pages. They expose
    John Deere engine PDFs such as `4045hfg04.pdf`, but those are model-level
    sheets already represented by shared links across duplicate kVA rows, not
    rating-specific evidence for exclusive coverage.
- Baudouin:
  - Official product pages expose series-level PDFs such as `6M16`, not one
    PDF per engine rating row.
  - DIYPower product pages expose exact Baudouin `DPK-TDS-EN...PowerKit Engine
    Datasheet` PDFs for six models, but those six models already have exclusive
    Baudouin spec-sheet links in storage.
- Hatz:
  - Official downloads expose series-level datasheets (`H-Series`, `F-Series`,
    `B-Series`, etc.), not one PDF per catalog model.
- MAN recheck:
  - Official MAN pages for `E3262 LE202`, `E0836 LE202`, and hydrogen-approved
    gas-engine variants expose HTML technical data and use-case pages, but
    exact searches did not expose direct public model-specific PDF datasheets.
    No MAN PDF was imported.
- Liebherr D98 lower-confidence probe:
  - Official Liebherr pages expose exact D9812/D9816 mining-engine PDFs, but
    the current accepted batch was limited to power-generation D96 PDFs. The
    D98 mining files were left for separate review rather than mixing
    application contexts into this import.
- Baifa / Kubota / Triton reruns:
  - Re-ran the Baifa strict index matcher: 3 exact candidates were discovered
    (`6M11G110-6.pdf`, `2806A-E18TAG5.pdf`, `4008-TAG2.pdf`), but each served
    HTML instead of `%PDF` bytes and was rejected.
  - Re-ran the Kubota official-product importer: 13 one-to-one product IDs all
    returned HTTP 404; the remaining official Kubota files are shared across
    multiple database variants and were not imported for exclusive coverage.
  - Re-ran the Triton Perkins crawler: no missing-exclusive Perkins model
    tokens appeared in the product sitemap, so no candidate PDF URLs were
    checked.
- Cummins:
  - Public product finder exposes product/rating tables in HTML and points users
    toward PowerSuite/QuickServe for complete technical documents; direct public
    exact-PDF links were not exposed in the crawled HTML.
  - Current Cummins G-Drive pages such as
    `https://www.cummins.com/en-na/g-drive-engines/products/diesel-mechanical-b-series`
    expose exact rating rows and `Spec Sheet` controls in rendered/searchable
    content. Direct local `curl` access to the page is Cloudflare challenge
    HTML, so the importer uses only directly verified `mart.cummins.com`
    PDF bytes rather than page-scraped links.
  - Official Cummins generator pages such as
    `https://www.cummins.com/en-na/generators/products/20-815kw-60hz-standby-gaseous-generator-sets`
    expose many C-series `Spec Sheet` controls, but the links resolve to
    `eng2e.seismic.com` viewer pages. A public viewer token endpoint returned
    tenant metadata, but the engagement metadata request to `eng2e.seismic.com`
    timed out and the equivalent `cummins.seismic.com` endpoint redirected to
    authentication. No Seismic HTML/viewer link was imported without public PDF
    bytes.
  - The Cummins mirror page
    `https://app3.test.gdc-rad.com/generators/products/20-815kw-60hz-standby-gaseous-generator-sets`
    exposes public Seismic `Spec Sheet` viewer links for many `C*` gas rows,
    but local direct requests return HTML viewer pages rather than PDF bytes.
    Those were not imported.
  - Distributor probes found exact Cummins-authored PDFs for `C125N6` and
    `C100N6`, which were applied above. Other probed C-series links were
    rejected because they returned 404/403, parts manuals, or shared range
    sheets covering multiple models such as `C45N6`-`C100N6` or
    `C400N6`-`C500N6B`.
  - After applying the official Mechanical B-Series `4BTAA3.3-G17` and
    `4BTAA3.3-G18` PDFs, a bounded adjacent official asset probe confirmed
    `0064174`-`0064176` are real Cummins sheets for `4BTAA3.3-G14` through
    `4BTAA3.3-G16`, but those rows are not in the refreshed missing-exclusive
    set. The remaining nearby missing rows are `4BT3.3G4`, `4BT3.3G5`, and
    `4BTAA3.3G7`; search only surfaced manual/submittal mirrors or
    generator-set documents, so no additional B-Series PDF was imported.
- Baifa public engine spec-sheet index:
  - Uppercase `/FADONGJI/` URLs still redirect local download attempts to HTML.
    The applied batch used only lowercase `/fadongji/` URLs that returned real
    `%PDF` bytes and passed exact text verification.
  - Rejected indexed files in this pass:
    `6M11G110-6.pdf`, `2806A-E18TAG5.pdf`, and `4008-TAG2.pdf`.
  - One matched Cummins `4BTA3.9-G2` file was skipped because the catalog has
    two missing-exclusive rows with the same model token, so attaching one
    shared file would not improve dedicated/exclusive coverage.
  - Follow-up fuzzy Perkins checks found one valid exact file for
    `1106A-70TAG4`, which was applied above. Other fuzzy candidates were not
    imported: `403F-11G`, `1106A-70TG1`, `2806A-E18TTAG5`, and `403F-15`
    returned HTML instead of PDF bytes; `4008TAG1A`, `4008TAG2A`, and
    `4008TAG2` were shared/multi-model files; `4016-61TRG3X` resolved to a PDF
    whose extracted text named adjacent `4016-61TRG3`, not the exact `X`
    variant.
  - Re-parsed the live Baifa index against the refreshed missing-exclusive
    report after the Cummins B-Series import. The visible brand sections remain
    Cummins, Volvo Penta, Baudouin, MTU, and Perkins; no Yuchai, Weichai,
    Jichai, SDEC, or Kubota section was exposed. The only refreshed exact-name
    hits were Perkins `2806A-E18TTAG5` and `4008TAG2`, and both lowercase
    direct download attempts still returned HTML (`<!DOCTYPE`) instead of
    `%PDF` bytes, so no link was imported.
- Caterpillar gas product pages:
  - Rechecked Cat product pages for remaining `G3512H`, `G3516H`, `G3520C`,
    `G3520H`, `CG132B`, `CG170`, and `CG260` rows.
  - The pages expose product specs in HTML and shared ratings-guide PDFs, but no
    model-specific public `Spec Sheet` PDFs were exposed in the crawled product
    download sections. Display-name near-matches such as `G3516A` for catalog
    row `G3516+` and `CG170-12 K` for `CG170-12` were not imported.
  - Rechecked older `3306`/`3408` gaps:
    - Official Cat `LEHW0026-00` and `LEHW0027-00` are real `G3306 Gas
      Petroleum Engine` PDFs, but the catalog row `caterpillar-3306` is a
      diesel/Tier 2 generator-set engine row, so these were rejected.
    - Diesel Parts Direct hosts Cat-authored `3306B` PDFs, but the verified
      `cat-3306b-dita-genset.pdf` file is a marine 50 Hz generator set sheet,
      not a match for the catalog's 60 Hz diesel generator-set row.
    - Likely Diesel Parts Direct `3408` direct URLs returned 404.
- Kubota:
  - Re-ran the strict official product-PDF importer against the refreshed
    missing-exclusive set.
  - Result: 13 one-to-one product IDs now return HTTP 404 from
    `engine.kubota.com`; remaining official product PDFs are shared across
    multiple DB variants and were not linked for exclusive coverage.
  - Rechecked the current Kubota Engine America site. Product resource PDFs are
    available for base engine pages, but many remaining rows are China/build
    variants or emissions-certificate-only matches. Those were not imported as
    dedicated datasheets.
- Yanmar America:
  - Rechecked remaining missing-exclusive Yanmar rows against the live sitemap
    and predictable official upload paths such as
    `Sales-Sheet-<model>.pdf` and `2020/09/<model>.pdf`.
  - The remaining `NG6GE`/`UG6GE` and older GGE/GGECC rows either have no exact
    public product page or returned HTTP 404 for predictable PDF paths. Existing
    public PDFs cover adjacent non-`6` or shared models only, so no new links
    were added.
- SDEC:
  - Checked `https://www.sdeciepower.com/download.htm`,
    `https://sdeciepower.com/2018/download.html`, and
    `https://www.sdeciepower.com/downloadzip.html`.
  - The legacy page exposes many `data-content` spreadsheet files (`.xls`/
    `.xlsx`) for parts-catalog/engine rows and some manuals, while the 2018 page
    exposes `data-url` placeholders with `data-type` values. No public
    model-specific datasheet PDF URLs were exposed for import.
- Rehlko / Kohler:
  - Official product pages for `KDW1603` and `KDW2204T` expose public
    `SpecPDFFileName` PDFs:
    - `https://resources.rehlko.com/enginesus/pdf/kdw1630hs.pdf`
    - `https://resources.rehlko.com/enginesus/pdf/kdw2204ths.pdf`
  - Both files are real Kohler specification PDFs and contain `KDW1603` or
    `KDW2204T`, respectively.
  - Not applied because the missing catalog rows are `KDW1603GE (1800 RPM)` and
    `KDW2204TGE`; exact `GE` product slugs returned Rehlko product-not-found
    pages, and the PDFs do not name the `GE` variants.
  - Rejected `https://resources.kohler.com/power/kohler/enginesUS/pdf/KDI3404_TCR_EN.pdf`
    for this goal. The response is a real PDF, but extracted text identifies it
    as `KDI 3404 TCR OWNER MANUAL`, not a model datasheet. Related KDI files
    found through Diesel-Bec were also owner manuals or broad documents.
- Baudouin direct-pattern recheck:
  - Rechecked the 79 remaining Baudouin missing-exclusive rows against the
    known EMSA and Gucbir direct PDF patterns:
    - `https://www.emsa.gen.tr/images/brochures/TECHNICAL%20DOCUMENTS/ENGINE%20DATASHEET/Baudouin/{50%20Hz|60%20Hz}/{MODEL}_DataSheet_Gb.pdf`
    - `https://www.gucbirjenerator.com/engine/baudouin/{MODEL}.pdf`
  - A bounded dry probe checked 174 candidate URLs and accepted 0 new PDFs.
    Existing known EMSA PDFs still resolve, so the zero result is specific to
    the remaining missing-exclusive model set, not a source outage.
- Lister Petter:
  - Official `listerpetter.com/product/<model>/` pages exist for many current
    Venus/Starlite rows and expose model-level specifications in HTML.
  - Search and page checks did not expose public model-specific PDF datasheets;
    other results were manuals, DirectIndustry HTML mirrors, or no-catalog
    pages. No PDF links were imported.
  - Source-level checks of official datasheet category pages such as
    `/lp-datasheets/mars-max-series/`, `/lp-datasheets/venus-series/`, and
    `/lp-datasheets/starlite-engine-series/` found no direct `.pdf` URLs; the
    visible download action routes to `/lisp/lp-login/`.
- Shared-link audit expansion:
  - Re-ran the stored-PDF sibling audit without the earlier 20-link cap.
  - Scope: 189 shared files that include at least one `datasheet` link and touch
    at least one missing-exclusive row.
  - Result: 7 single-token candidates surfaced, but all were rejected on manual
    inspection because the actual PDFs are broad brochures, family/range sheets,
    or generator-set specifications rather than one-model engine datasheets:
    - FPT `ON ROAD` range brochure
    - Rehlko/Kohler `15REOZK` industrial generator set specification
    - PSI `8.8L T/TCAC` gas engine sheet
    - Liebherr construction/industry combustion-engine brochure
    - Mitsubishi `CJ/EG SERIES` multi-engine sheet
    - Baudouin `6M11` family PowerKit sheet
    - Baudouin `6M16` family PowerKit sheet
- Perkins official product pages:
  - Official pages such as
    `https://www.perkins.com/en_GB/products/new/perkins/electric-power-generation/diesel-engines/123500.html`
    expose exact model HTML specifications for missing rows like
    `404J-E22TAG`.
  - The local downloader is blocked by Akamai, and the indexed page exposes a
    `cloud_download` control for the HTML spec section but no direct public PDF
    URL. No PDF was imported.
  - Rechecked official current product pages for `403J`, `404J`, `1206J`,
    `1706J`, and `2806A` candidates. Rendered/indexed content exposed product
    specs but no directly verifiable public model-specific PDF bytes. The
    official `5006AC` PDF was rejected for dedicated/exclusive coverage because
    it covers both `5006AC-E23TAG1` and `5006AC-E23TAG2` in one shared file.
- FPT:
  - Exact searches for missing-exclusive model codes such as `F5HGL415A*X`,
    `N67TEVP06.00`, `F34TEVP04.00`, and `C13ETVP03.A363` found generator-set
    pages, parts pages, Scribd copies, or broad FPT Stage V line-up PDFs.
  - No FPT-authored one-model engine datasheet PDF was verified for import.
- Yuchai:
  - Official `en.yuchaidiesel.com` / `www.yuchaidiesel.com` G-drive product
    pages expose series-level HTML technical tables. Some pages also expose
    downloadable official product-handbook PDFs; the checked YC6MK/YC6MJ file
    covered multiple model variants in one family document rather than a
    one-model datasheet.
  - Search results for exact missing rows such as `YC6TD1100-D30` were Scribd
    uploads or genset-vendor sheets, so they were rejected for the OEM PDF
    datasheet goal.
  - Rechecked the official `YC6T/YC6TD` page. It exposes exact HTML table rows
    including `YC6TD1100-D30`, but the product-manual download flow is gated
    behind a lead form and no direct public PDF bytes were exposed.
- Weichai:
  - Official Weichai `WP2.3` pages expose HTML product/rating tables for rows
    such as `WP2.3D25E200`, but no direct public model-specific engine PDF was
    exposed in the checked official content.
  - Checked an EMEAN/Fujian EPOS page that advertised
    `WEICHAI engine WP2.3D25E200.pdf`. The downloaded file was a real PDF and
    an engine datasheet for `WP2.3D25E200`. This source was originally held
    back under the stricter OEM-authored-only rule; after the goal was reset to
    use real online exact engine datasheet PDFs and reject only generated,
    family/shared, manual, certificate, and genset-vendor datasheets, EMEAN
    exact engine datasheets were imported in the dedicated Weichai batch below.
- Jichai:
  - Official `jichai.com` product pages such as
    `https://www.jichai.com/product/190_series_600kw2200kw/2000_series_600kw.html`
    expose model/rating specifications in searchable HTML for rows such as
    `12V190ZDT`, but no public `.pdf` datasheet link was visible in the indexed
    content. Direct local fetches returned a `forbidVisit` shell rather than a
    usable product page.
  - Related searches for `12V190ZDT`, `12V190ZDT-2`, and `12V190ZLDT` surfaced
    distributor HTML pages, spare-parts pages, generator-set pages, or Scribd
    copies. None provided a clean public model-specific OEM PDF datasheet.
- Daedong:
  - Official `daedong-kioti.com/engine` lists missing model tokens such as
    `3A165G` and `3C100G`, but the exposed downloads are EPA/CARB certificates,
    not engine datasheet PDFs.
  - Search results for `3A165`, `3C100`, and `4A220` were Scribd manuals,
    training decks, or third-party spec pages. No Daedong-hosted one-model PDF
    datasheet was verified.
- Shibaura:
  - Official IHI/Shibaura pages expose product-series catalogs and HTML specs,
    while public searches for `N4LDI-TA`, `N843-D`, and `S773L-F` primarily
    surfaced service manuals or broad catalogs.
  - No one-model Shibaura datasheet PDF was verified for the remaining
    missing-exclusive rows.
- Kirloskar:
  - Public `testkfp.kirloskar.com` directories expose real KOEL PDFs such as
    `Engine data sheet for KFP4R-UF05.pdf`, but sampled PDFs identify the
    fire-pump package code (`KFP4R-UF05`) and do not contain exact catalog
    model tokens such as `4R810NA1`.
  - Scribd-hosted Kirloskar sheets and public price/certificate documents were
    rejected. No exact missing Kirloskar engine model PDF was imported.
- DEUTZ:
  - Official DEUTZ engine archive PDFs are real `Technical Data Sheets`, but
    sampled files are family sheets containing multiple engine types on the
    same PDF (for example `BFL 2011` covers `F2L 2011`, `F3L 2011`,
    `F4L 2011`, and `BF4L 2011`).
  - A Central Diesel page exposes HTML specs and an `Engine Performance Curves`
    link for `TCD 2013 L06 4V`, but direct local access is Cloudflare-blocked
    and the exact PDF URL could not be verified. No import was made.
- Scania:
  - Rechecked the seven remaining Scania missing-exclusive rows. Public search
    results for exact models (`DC13 505A`, `DC13 506A`, `DC13 507A`,
    `DC16 078A`, `DC16 093A`) were Scribd uploads, Lectura generated
    datasheets, dealer listings, or broad Scania product-range documents.
  - No clean Scania-hosted or Scania-authored one-row PDF source was verified,
    so the shared existing Scania datasheets were left unchanged.
- Mitsubishi/MHI:
  - Re-ran the live MHI constant-speed catalog dry-run. The catalog still
    exposes 59 official product pages, 58 with specification-sheet PDFs, and
    all 59 map to database slugs.
  - No safe new import was made from that pass because the remaining Mitsubishi
    missing-exclusive rows are mostly China `-C` variants, shared gas-family
    rows, or one distributor/Tier4 row whose exact suffix is not named by the
    public MHI base-model sheet. This preserves the earlier cleanup that
    removed public non-`-C` MHI spec sheets from China-specific variant rows.
- Cummins rejected probe:
  - Tested `https://topone-power.com/wp-content/uploads/KTA50-G16B.pdf` as a
    possible dealer-hosted exact Cummins sheet. The response saved with a PDF
    filename but was HTML, not `%PDF`, so it was rejected.
  - Rechecked the stale Top One direct-PDF pattern for `KTA50-G16B.pdf` and
    `M15-G3.pdf`. Both now 301-redirect through WordPress to tag HTML pages
    (`/tag/kta50/` and `/tag/kta50-g3/`) rather than returning PDF bytes, so
    the older `download-upload-ccec-individual-specsheets.mjs` source claim is
    no longer usable for real online PDF imports.
  - Probed the official Cummins asset cluster
    `https://mart.cummins.com/imagelibrary/data/assetfiles/0064172.pdf`
    through `0064190.pdf`. The live PDFs were real Cummins `Specification
    Sheet` documents, but the newly observed exact models (`4BTAA3.3-G12`
    through `G16`, `6CTAA8.3-G7`, `6LTAA9.5-G3`, `KTA19-G4`,
    `QSZ13-G5`/`G6`/`G7`, and `X2.5-G2`) are already covered or not present in
    the refreshed missing-exclusive set, so no new database links were added.
- MTU official product-list recheck:
  - Parsed the live official `power-generation-products-list.html` embedded
    JSON tables: diesel generator sets, gas generator sets, and Gendrive
    engines across 50 Hz and 60 Hz tabs.
  - The official table exposes many PDF links, but the missing-exclusive MTU
    hits are still shared family/rating sheets such as `12V1600 Gx0/Gx1`,
    `8V/12V/16V/20V4000 GS`, and `12V/16V/20V4000 Gx4`. These PDFs are valid
    mtu documents, but they are not one-model engine datasheets.
  - No new one-model mapping beyond the already applied `16V 2000 G26S`
    Gendrive sheet was verified.
- John Deere official pattern dry-run:
  - Re-ran `data/enrich-john-deere-datasheets-2026-07.mjs` against the current
    database. It probed official Deere `engines-and-drivetrain/specsheets`
    URL variants for the ten John Deere rows that still have no document:
    `3029T`, `4024H`, `4039`, `4045H`, `4045T`, `5030H`, `6068H`, `6090H`,
    `6135`, and `6180`.
  - Result: 0 exact official sheets found; no upload or database write was
    performed.
- Volvo Penta exact-bulletin dry-run:
  - Re-ran `data/enrich-volvo-penta-datasheets-2026-07.mjs`. It verified three
    real Volvo Penta-authored product bulletins from distributor mirrors:
    `TWD1643GE`, `TWD1663GE`, and the shared `TWD1672GE/TWD1673GE` technical
    data PDF.
  - Not applied for this goal: `TWD1643GE` and `TWD1663GE` are not in the
    current missing-exclusive set, while `TWD1672GE/TWD1673GE` is a two-model
    PDF and therefore does not improve dedicated/exclusive coverage.
- Waukesha / WPI resource-library probe:
  - Parsed `https://www.klimaexcavating.com/help-resource/`, which exposes
    cached `/source/<hash>/*.pdf` downloads for several Waukesha resources.
  - Verified real PDF bytes for `WAU-F18GSI-LCR_HCR.pdf`,
    `VGF-F18SE-1.pdf`, `WAU-L5794GSI.pdf`, `WAU-L7042GSI-S4.pdf`, and
    `WAU-L7044GSI-S5.pdf`.
  - Not applied for this goal: the remaining Waukesha missing-exclusive rows
    are the VGF `F18GL/GLD`, `H24GL/GLD`, `L36GSI/GSID`, and `P48GSI/GSID`
    rows. The exact WPI VHP `L5794GSI` / `L7042GSI` / `L7044GSI` sheets map to
    rows that already have exclusive Waukesha factsheets, while the VGF file
    names multiple VGF models and does not provide a one-row dedicated
    datasheet for the remaining GL/GSI rows.
- Generac official product-page probe:
  - Parsed current official Generac pages for `RG02224` and `RG02724`.
  - Both pages expose the same official spec-sheet URL:
    `https://www.generac.com/globalassets/products/residential/standby-generators/spec-sheets/22kw-27kw-32kw-38kw-protector-qs-standby-generator-specsheet.pdf`.
  - Not applied for this goal: this is the existing shared 22-38 kW Protector
    QS range sheet pattern, not a dedicated PDF for `RG02224`, `RG02724`,
    `RG03224`, or `RG03824`.
- Cummins / Baifa legacy-pattern probe:
  - Rechecked old Baifa direct Cummins patterns such as
    `https://www.baifapower.com/static/upload/download/fadongji/QSB3.9-G31.pdf`.
  - The response redirected to the Baifa HTML shell (`<!DOCTYPE...`) instead of
    returning `%PDF` bytes, so no QSB/QSL rows were imported from the stale
    `upload-cummins-missing-specsheets.mjs` pattern.
- HD Hyundai Infracore refreshed dry-run:
  - Re-ran the official Hyundai generator detail-page matcher after the latest
    coverage refresh. It produced 0 applicable current rows.
  - Skipped remaining rows because no matching official detail page was exposed:
    `DP372CB`, `DP372CC`, `DP372CD`, `DP372CE`, `DP372CA`, `DM02AP`, `DX05G`,
    `DX05PG`, `DX08G`, `DX12G`, `DX15G`, `DX15GA`, `DX22`, `P180FE`, and
    `P222FE`.
- Volvo Penta current download-widget recheck:
  - Official Volvo Penta product pages expose publication endpoints for
    Stage V/off-road and power-generation rows, but the remaining
    missing-exclusive matches tested were range bulletins rather than one-row
    PDFs.
  - Rejected official shared publications such as `TAD1381-1385VE` and
    `TAD580-583VE`; also rejected the Volvo Penta Mexico
    `TWD1672GE/TWD1673GE` PDF because it is one two-model bulletin, not a
    dedicated file for either row.
- Cummins C-series and QSB/QSK recheck:
  - Exact searches for remaining C-series gas rows surfaced Seismic viewer
    pages, manual mirrors, vendor generator-set submittals, or broad Cummins
    range sheets. Directly verifiable public PDF bytes were not available for a
    one-model engine datasheet.
  - QSB/QSK searches likewise produced vendor generator-set pages, manuals, or
    broad third-party documents. No OEM/model-specific datasheet PDF was
    imported.
- SDEC / Caterpillar / Hatz / DEUTZ / Lister Petter strict-PDF recheck:
  - SDEC official pages expose searchable family HTML tables and downloads for
    manuals or parts catalogues, but no one-model datasheet PDF bytes.
  - Caterpillar pages for remaining CG/G gas rows expose HTML specs and download
    widgets, but no directly verified model-specific PDF for the current
    missing-exclusive rows.
  - Hatz and DEUTZ official resources found in this pass were manuals,
    installation drawings, emissions/certificate pages, or family technical
    sheets, not one-row datasheet PDFs.
  - Lister Petter official product pages provide exact HTML specifications for
    many Venus/Starlite rows, but no public model-specific PDF datasheets were
    exposed.
- Cummins-CPT official QSB product-download probe:
  - Source pages:
    - `https://www.cummins-cpt.com/pd.jsp?fromColId=108&id=32`
    - `https://www.cummins-cpt.com/pd.jsp?fromColId=108&id=33`
    - `https://www.cummins-cpt.com/pd.jsp?fromColId=108&id=34`
  - Decoded the site file-download IDs and verified direct `%PDF` bytes for
    current missing rows including `QSB3.9-G31`, `QSB3.9-G33`,
    `QSB3.9-G35`, `QSB3.9-G37`, `QSB3.9-G39`, `QSB5.9-G30`,
    `QSB5.9-G31`, `QSB5.9-G33`, `QSB6.7-G3`, `QSB6.7-G4`,
    `QSB6.7-G31`, and `QSB6.7-G32`.
  - Not applied for this goal: the PDFs are official `快速手册` quick
    application manuals, not datasheet-titled PDFs. Their first pages contain
    engine/performance data tables, but the files also include wiring and parts
    catalogue sections. Several also contain sibling model tokens in shared
    wiring or parts sections, so they fail the strict dedicated/exclusive
    datasheet rule instead of being counted as one-row datasheets.
- Caterpillar G3516/G3516A official download probe:
  - Source pages:
    - `https://h-cpc.cat.com/cmms/v2?cid=402&f=product&gid=18327284&it=product&lid=en&nc=1&pid=113920&sc=CA`
    - `https://h-cpc.cat.com/cmms/v2?cid=402&f=product&gid=18327284&it=product&lid=en&nc=1&pid=18486985&sc=M620`
  - Confirmed official Cat media IDs for `G3516 NOx Selectable Spec Sheet`
    (`LEHE20863-`), `G3516 EPA Certified Spec Sheet` (`LEHE20847-`), and
    `G3516A Natural Gas Data Sheet` (`LEXE1549-`).
  - Not applied for this goal: the remaining Caterpillar row is
    `G3516+`, while the verified current official downloads identify
    `G3516` or `G3516A`; no exact `G3516+` PDF was verified.
- Yanmar and FPT targeted recheck:
  - Yanmar searches for remaining no-datasheet rows such as `3TNV80F-NG6GE`,
    `3TNV88F-UG6GE`, and `4TNV84T-GGFC` surfaced official Yanmar parts pages,
    vendor genset sheets, and marketplace pages, but no public Yanmar-authored
    model-specific engine datasheet PDF bytes.
  - FPT exact-code searches for rows such as `F36ETVP03.A94`,
    `F34TEVP04.00`, and `C13ETVP03.A363` surfaced generator-set data sheets
    from OEM packagers and manual mirrors, not public FPT-authored
    model-specific engine datasheet PDFs.
- Weichai official English datasheet probe:
  - Accepted and applied one official one-model engine datasheet:
    `12M33D1240E310` from
    `https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202601/t20260120_121972.htm`.
    The PDF URL is
    `https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202601/W020260120477561768142.pdf`.
    Text verification found `%PDF` bytes, repeated `12M33D1240E310`, and
    `Engine Datasheet` / `发动机数据单` markers with no sibling model token hits.
  - Not applied: the same page also lists `12M33D1450E310`, which is not a
    current missing row. The mobile `16M33` page exposes visible datasheet
    labels for `16M33D1680E310` and `16M33D1800E310`, but its raw HTML uses
    `C:\fakepath\...` links plus `uploadpic` filenames that did not resolve to
    stable public PDF URLs in this pass.
- EMEAN/Fujian EPOS-hosted exact Weichai engine datasheets:
  - Source category trees:
    - `https://www.emeanpower.com/WEICHAI-16KW-880KW/`
    - `https://www.emeanpower.com/WEICHAI-800KW-1600KW/`
  - Verified and linked 24 public, exact, model-specific Weichai engine
    datasheet PDFs under `weichai/emean-engine-datasheets/`.
  - The first manual batch linked 11 PDFs:
    `WP2.3D25E200`, `WP2.3D33E200`, `WP2.3D41E201`,
    `WP2.3D40E200`, `WP2.3D48E200`, `12M26D968E200`,
    `12M33D1108E200`, `12M33D1210E200`, `12M33D1320E200`,
    `16M33D1680E310`, and `16M33D1980E310`.
  - The bounded category crawler linked 13 more PDFs:
    `12M26D792E200`, `12M26D902E200`, `12M33D1500E310`,
    `16M33D1580E310`, `16M33D1800E310`, `6M33D572E200`,
    `6M33D633E200`, `6M33D725E310`, `WP12D353E200`,
    `WP13D385E200`, `WP4.1D113E200`, `WP4.1D66E200`, and
    `WP4.1D80E200`.
  - Verification: every accepted response began with `%PDF`; `pdftotext
    -layout` contained the exact DB model token plus `Engine Datasheet` and
    `发动机数据单` markers, with no sibling missing-exclusive Weichai model token
    hits. The crawler rejected 8 exact-name EMEAN files (`WP10D200E200`,
    `WP10D238E200`, `WP10D264E200`, `WP10D320E200`, `WP13D440E310`,
    `WP13D490E310`, `WP6D132E200`, and `WP6D152E200`) because their extracted
    text did not include the strict engine-datasheet marker.
- EMEAN Cummins category crawl:
  - Source category trees:
    - `https://www.emeanpower.com/CUMMINS-16KW-780KW/`
    - `https://www.emeanpower.com/CUMMINS-800KW-1200KW/`
  - Parsed 75 product URLs and found 64 EMEAN engine datasheet candidates.
    None matched the current Cummins missing-exclusive rows exactly, so no
    Cummins database rows were imported from this source.
- Baifa current-gap rerun:
  - Repointed `data/attach-baifa-engine-spec-sheets-2026-08.mjs` to the
    refreshed `missing-exclusive-2026-08-02.json` report.
  - Dry run found only one current exact remaining candidate:
    `Baudouin 6M11G110/6`.
  - Not applied: the Baifa URL
    `https://www.baifapower.com/static/upload/download/fadongji/6M11G110-6.pdf`
    returned non-PDF bytes.
- Cummins-CPT official quick application manuals:
  - Source index: `https://www.cummins-cpt.com/h-col-108.html`
  - The product pages expose official quick-manual PDF download anchors; the
    importer resolves them through the site's own file-download endpoint.
  - Verified and linked 5 public Cummins/CPT/DCEC one-model PDF manuals:
    - `cummins/cpt-quick-manuals/qsb3-9-g3.pdf`
    - `cummins/cpt-quick-manuals/qsb5-9-g3.pdf`
    - `cummins/cpt-quick-manuals/qsb6-7-g4.pdf`
    - `cummins/cpt-quick-manuals/qsl8-9-g30.pdf`
    - `cummins/cpt-quick-manuals/qsl8-9-g4.pdf`
  - Verification: every accepted response began with `%PDF`; `pdftotext
    -layout` contained the exact DB model token plus quick application manual,
    performance-data, and Cummins/CPT/DCEC OEM markers.
  - Rejected from the same official source: 17 otherwise relevant QSB/QSL quick
    manuals contained sibling missing-exclusive Cummins model tokens such as
    `QSB3.9-G31/G33/G35/G37/G39`, `QSB5.9-G30/G31/G33`,
    `QSB6.7-G31/G32`, `QSL8.9-G2/G3/G4`, or `QSL8.9-G30/G33/G34`, so they
    were not counted as dedicated/exclusive one-row datasheets.
- Volvo Penta Mexico official/regional industrial PDF probe:
  - Source page:
    `https://www.volvopenta-mexico.com.mx/motores-industriales/`
  - Parsed 85 visible `Descargar PDF` links and matched 23 current
    missing-exclusive Volvo Penta rows.
  - Not applied: dry verification accepted 0 PDFs. Live files for rows such as
    `TAD570VE/TAD571VE/TAD572VE`, `TAD870VE/TAD871VE/TAD872VE/TAD873VE`,
    `TAD1170VE/TAD1171VE/TAD1172VE`, `TAD1371VE` through `TAD1375VE`, and
    `TAD1670VE/TAD1671VE/TAD1672VE` are Volvo-authored range sheets that
    contain sibling model tokens. Several short-name links such as `1180.pdf`,
    `1182.pdf`, `1183.pdf`, `583.pdf`, and `884.pdf` returned 404.
- mtu official product-list recheck:
  - Source page:
    `https://www.mtu-solutions.com/eu/en/products/power-generation-products-list.suffix.html/Model%20Name%3DSeries%201600.html`
  - Extracted 8 official `MTU_Gendrive_spec` PDF URLs from the page source.
  - Not applied: the available official PDFs are encoded range sheets such as
    `12V1600Gx0_Gx1`, `12V16V18V2000Gx06`, `12V16V20V4000Gx04`, and
    `16V2000Gx6`, not exact one-model missing-exclusive PDFs.
- Yuchai official product-manual probe:
  - Official Yuchai product pages expose family product-manual PDF URLs in raw
    HTML, for example `YC6T/YC6TD` at
    `https://www.yuchaidiesel.com/product/pro-detail-1129.htm`.
  - Not applied for this goal: the verified Yuchai pages/PDFs are family
    manuals with many sibling models, so they do not satisfy the
    dedicated/exclusive one-model datasheet requirement.
- VMAN official download-center probe:
  - Source page: `https://www.vman-engine.com/download`
  - The page lists many official data-sheet document entries, including C03,
    C04, C07, C10, CE10, D11, D15, D22, and DE58 families. The visible links
    are password-gated anchors such as `data-url="330"`.
  - Not applied: the site's own download endpoint
    `https://www.vman-engine.com/download_yanzheng?id=330&yan=` returned
    `password error`. These look like promising OEM PDFs, but they are not
    publicly retrievable without the download password.
- Primepower/SDEC exact-model probe:
  - Candidate page:
    `https://www.primepowergenset.com/en/download/SDEC-SC4H180D2.html`
  - Not applied: the live response was a 141-byte redirect shell, not a PDF or
    a page exposing a stable PDF URL. Secondary SDEC/genset-vendor PDFs remain
    rejected unless the file itself is clearly engine-only and OEM-authored.
- Origin Engines official WordPress/media probe:
  - Checked official pages for current missing-exclusive Origin rows:
    `3.6L Naturally Aspirated`, `3.6L Turbo`, `6.2L Naturally Aspirated`,
    `6.2L Turbo`, `9.1L Turbo`, and `10.3L Turbo`.
  - The only public PDF asset found through the official media API was
    `https://originengines.com/wp-content/uploads/2023/01/Origin-4.3L-Spec-Sheet.pdf`,
    which does not match a current missing-exclusive row. The relevant current
    rows are represented by HTML/spec images, not PDFs, so no import was made.
- Lister Petter official WordPress/media probe:
  - Checked current product pages and media API searches for exact LP/SA model
    PDF assets such as `LP443G6` and `SA423G1`.
  - Not applied: exact model pages are HTML product/spec pages with PNG assets.
    The application-PDF media search found no LP443/SA423 exact PDFs; only the
    shared `G Drive Engine Range Guide V2509` and `G Drive Engine Jupiter Range
    Guide` PDFs surfaced, and the range guide is already linked as shared
    documentation.
- John Deere / Diesel-Bec distributor PDF probe:
  - Source page: `https://diesel-bec.com/en/products/outboard-engines/`
  - The page exposes John Deere Industrial PDF links, but the current
    industrial links resolve to broad John Deere engine selection-guide PDFs,
    not one-row/rating-specific datasheets. Current John Deere missing-exclusive
    rows are mostly duplicate catalog rows by engine model and rating, so a
    single exact model PDF legitimately supports multiple rows and must not be
    duplicated just to game the exclusive metric.
- Rehlko/Kohler PDF probe from Diesel-Bec:
  - The same Diesel-Bec page exposes official `resources.kohler.com` PDFs for
    KDI/KD engine families.
  - Not applied: `KDI3404_TCR_EN.pdf` is an owner manual, not a datasheet. The
    `KDI1903_2504TCR` and `KDI1903_2504M` PDFs cover two model tokens each, so
    they are useful shared technical references but do not satisfy the strict
    dedicated/exclusive datasheet goal. Other KD/KDW links checked were owner
    manuals rather than datasheets.

## Latest Verification

- 2026-08-02 live rerun:
  - Regenerated `reports/datasheet-coverage/2026-08-02.*` from live Supabase.
  - Current exclusive/dedicated datasheet coverage remains 964 / 2,715 (35.5%).
  - Dry-ran prepared Yanmar, Rehlko/Kohler, Liebherr, Caterpillar H-series,
    and sibling-pruning scripts against live Supabase. The verified Yanmar,
    Rehlko/Kohler, Liebherr, and Caterpillar records are already covered or no
    longer in the missing-exclusive set; Cummins, Yanmar, and Baudouin/Weichai
    pruning dry runs found 0 remaining removable sibling links.
  - Rechecked VMAN official product/download pages. The page publicly exposes
    many model data-sheet entries, but the actual `/uploads/...` PDF path is
    still returned only after `/download_yanzheng` password validation.
  - Downloaded and inspected the Diesel Parts Direct `cat-3306b-dita-genset.pdf`
    candidate. It is a real PDF containing Caterpillar 3306B generator-set
    specifications, but it has a reseller cover page and is a marine 50 Hz
    generator-set sheet rather than an exact match for the catalog's 60 Hz
    `caterpillar-3306` row, so it was not imported.
  - Checked likely Diesel Parts Direct `3408` direct PDF patterns; tested URLs
    returned 404.
- `node data/pdf-coverage.mjs`
  - Exclusive/dedicated datasheet coverage: 964 / 2,715 (35.5%)
  - Remaining needed for 80%: 1,208 additional exclusive rows.
  - Generated Haifeng model datasheet links: 0
- `npm run test:database`
  - Passed: 2,715 engines, 149 alternators, 3,753 PDF links, 75 engine brands.
- `npm run data:qa`
  - Completed with 4 existing low-severity logo wordmark fallback issues and no
    critical/high issues.
- Targeted public storage checks passed for:
  - `caterpillar/spec-sheets/g3412c-le-gas-engine.pdf`
  - `caterpillar/spec-sheets/3512e-marine-aux-dep-1700-ekw.pdf`
  - `caterpillar/spec-sheets/3516c-hd-offshore-generator-set.pdf`
  - `caterpillar/g3412-gas-datasheet.pdf`
  - all 8 `waukesha/factsheets/*.pdf` files listed above.
  - all 12 Baudouin 60 Hz `baudouin/spec-sheets/*-6.pdf` files listed above.
  - all 14 Yanmar `yanmar/official-sales-sheets/*.pdf` files listed above.
  - all 58 Hyundai `hyundai/official-generator-spec-sheets/*.pdf` files.
  - all 11 Perkins `perkins/triton-oem-engine-datasheets/*.pdf` files listed
    above.
  - all 36 Baifa-indexed exact PDFs linked by
    `data/attach-baifa-engine-spec-sheets-2026-08.mjs`.
  - `caterpillar/spec-sheets/3516e-50hz-low-fuel-consumption-spec-sheet.pdf`.
  - both `caterpillar/official-gas-datasheets/*.pdf` files listed above.
  - `caterpillar/official-gas-engine-spec-sheets/g3516-le-petroleum-engine.pdf`.
  - `mtu/official-gendrive-spec-sheets/16v2000g26s-gx6-w2a.pdf`.
  - `liebherr/official-engine-datasheets/d976-power-generation.pdf`.
  - `liebherr/official-engine-datasheets/d9612-power-generation.pdf`.
  - `liebherr/official-engine-datasheets/d9616-power-generation.pdf`.
  - `liebherr/official-engine-datasheets/d9620-power-generation.pdf`.
  - `cummins/gas/exact-spec-sheets/c125n6-spec-sheet.pdf`.
  - `cummins/gas/exact-spec-sheets/c100n6-data-sheet.pdf`.
  - `cummins/official-gdrive-spec-sheets/qsl9-g3.pdf`.
  - `cummins/official-gdrive-spec-sheets/qsb7-g4.pdf`.
  - `cummins/official-b-series-spec-sheets/4btaa33-g17.pdf`.
  - `cummins/official-b-series-spec-sheets/4btaa33-g18.pdf`.
  - all 5 Cummins-CPT official quick application manuals listed above.
  - `perkins/baifa-engine-spec-sheets/1106a-70tag4-1500rpm.pdf`.
  - all 6 Rehlko/Kohler
    `kohler/rehlko-official-kd-engine-info-sheets/*.pdf` files listed above.
  - all 8 Xinchai
    `xinchai/official-product-datasheets/*.pdf` files listed above.
  - all 7 Perkins Welland/Techexpo exact technical data sheets listed above.
  - all 24 EMEAN/Fujian EPOS-hosted exact Weichai engine datasheets listed
    above.

## 2026-08-02 Current-Gap Pass

- Live Supabase coverage refresh after the previous cleanup batch:
  - Dedicated/exclusive datasheet coverage was **964 / 2,715 (35.5%)** before
    this pass.
  - Overall datasheet coverage was **2,167 / 2,715 (79.8%)**.
- Hatz official pages:
  - Source pages:
    - `https://hatz.com/en-global/products/engines/h-series`
    - `https://hatz.com/en-global/downloads/manuals-workshop-datasheet`
  - Not applied: the public Hatz downloads are family/range datasheets,
    manuals, or service folding cards, not one-model datasheet PDFs for the
    current missing-exclusive rows.
- Baifa current-gap rerun:
  - Re-ran `data/attach-baifa-engine-spec-sheets-2026-08.mjs` against
    `missing-exclusive-2026-08-02.json`.
  - Not applied: the only current candidate,
    `https://www.baifapower.com/static/upload/download/fadongji/6M11G110-6.pdf`,
    returned non-PDF bytes.
- Volvo Penta official product-page probe:
  - Verified the official publications flow via
    `https://pubs.volvopenta.com/ProdDocs/Home/Disclaimer?publication=47711591&lang=en-US`
    and `https://pubs.volvopenta.com/publications/47711591`.
  - The downloaded PDF was a real Volvo Penta product leaflet for
    `TWD1683GE`, but it did not contain the exact current missing catalog model
    `TWD1683GE-B`, so it was not linked.
  - Also verified `publication=47712910` from the D8 Stage V page. The PDF
    label says `TAD880GE`, but the text is a shared `TAD880-882GE` product
    bulletin containing `TAD880GE`, `TAD881GE`, and `TAD882GE`; rejected for
    dedicated/exclusive coverage.
- Cummins-CPT official quick application manuals:
  - Updated `data/crawl-cummins-cpt-quick-manuals-2026-08.mjs` to use the
    current `missing-exclusive-2026-08-02.json` report.
  - Verified and linked 7 public one-model Cummins/CPT/DCEC PDFs:
    - `cummins/cpt-quick-manuals/qsb3-9-g2.pdf`
    - `cummins/cpt-quick-manuals/qsb5-9-g2.pdf`
    - `cummins/cpt-quick-manuals/qsb6-7-g3.pdf`
    - `cummins/cpt-quick-manuals/qsl8-9-g2.pdf`
    - `cummins/cpt-quick-manuals/qsl8-9-g3.pdf`
    - `cummins/cpt-quick-manuals/qsl8-9-g33.pdf`
    - `cummins/cpt-quick-manuals/qsl8-9-g34.pdf`
  - Verification: each PDF response began with `%PDF`; `pdftotext -layout`
    contained the exact model token, Cummins/CPT/DCEC OEM markers, and engine
    performance-data sections. The crawler rejected 10 sibling/range quick
    manuals that contained additional current missing Cummins model tokens.
- Emean Cummins current-gap rerun:
  - Updated `data/crawl-emean-cummins-engine-datasheets-2026-08.mjs` to use the
    current `missing-exclusive-2026-08-02.json` report.
  - Crawled 75 product pages and found 64 engine-datasheet candidates, but 0
    current missing-exclusive Cummins matches.
- Post-apply coverage refresh:
  - Overall datasheet coverage reached **2,172 / 2,715 (80.0%)**.
  - Dedicated/exclusive datasheet coverage increased to **971 / 2,715
    (35.8%)**.
  - Generated Haifeng model datasheet links remained **0**.
- Verification after the database write:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,760
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with 4 existing low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.

## 2026-08-02 Follow-Up Current-Gap Sweep

- Updated remaining backend discovery/import scripts that still referenced the
  stale `missing-exclusive-2026-08-01.json` snapshot so future runs use
  `missing-exclusive-2026-08-02.json`.
- Emean current-gap crawls:
  - `data/crawl-emean-small-brand-engine-datasheets-2026-08.mjs` crawled FAWDE,
    Isuzu, and Yangdong product pages and found 0 exact current missing-exclusive
    matches.
  - `data/crawl-emean-weichai-engine-datasheets-2026-08.mjs` found 8 current
    Weichai candidates but rejected all 8. A sampled PDF was a real six-page
    engine datasheet for `WP10D200E200`, but it was Fujian EPOS/Emean-branded,
    not Weichai/OEM-authored, so it remains out of scope for the real-OEM
    dedicated datasheet goal.
- Stale/currently covered script dry runs:
  - `data/attach-xinchai-official-product-datasheets-2026-08.mjs` stopped
    because all 8 records are no longer missing exclusive coverage.
  - `data/attach-baudouin-official-gas-spec-sheets-2026-08.mjs`,
    `data/attach-cummins-official-b-series-spec-sheets-2026-08.mjs`,
    `data/attach-cummins-official-gdrive-spec-sheets-2026-08.mjs`, and
    `data/attach-weichai-official-engine-datasheets-2026-08.mjs` all stopped on
    currently covered records after moving to the August 2 missing report.
  - Rehlko/Kohler, Liebherr, Caterpillar, Yanmar, Perkins Welland, and mtu dry
    runs verified their known public PDFs, but those exact rows are already
    exclusive in the current report; no duplicate links were applied.
- Integrity/pruning dry runs:
  - Cummins, Yanmar, and Baudouin/Weichai cross-link pruning found 0 remaining
    removable links.
  - The general sibling-prune script is stale for `perkins/spec-sheets/404J-
    electric-power.pdf` because the expected removable link is already absent.
- Additional web/source checks:
  - MTU product-list search confirms the official public list exposes
    `16V 2000 G26S` downloads, which are already linked, but did not surface an
    exact official `12V2000G26S` PDF for the current missing row.
  - Official Weichai and Yuchai public pages expose current model tables as HTML
    or family/product pages; no new exact model PDF endpoints were found in this
    sweep.

## 2026-08-02 Dedicated/Exclusive Follow-Up

- Re-ran strict existing dry-run verifiers against the current
  `missing-exclusive-2026-08-02.json` report:
  - `data/attach-baifa-engine-spec-sheets-2026-08.mjs` found 1 exact current
    candidate (`Baudouin 6M11G110/6`), but the Baifa URL returned non-PDF bytes.
  - `data/crawl-cummins-cpt-quick-manuals-2026-08.mjs` found 10 current
    Cummins-CPT quick-manual candidates. All 10 were rejected because the PDFs
    contained sibling current-missing model tokens, so they are not row-exclusive
    datasheets under the strict metric.
  - `data/crawl-volvo-penta-mexico-industrial-pdfs-2026-08.mjs` found 23
    current Volvo Penta candidates from 85 official Mexico PDF links. All 23
    were rejected: most were shared multi-model bulletins and the remainder
    returned HTTP 404.
- Fresh official-source checks:
  - Jenbacher official pages expose exact product pages for `J412`, `J420`, and
    `J612`, but the public resource links are shared type sheets or gated
    brochure forms. The `Product Brochure J420 D/E` page is official and exact
    by title, but its PDF is behind a Marketo/download-token flow; no direct
    public PDF bytes were imported.
  - Liebherr official pages expose exact HTML product pages for D98/D99 engines.
    Current D99 power-generation pages inspected (`D9912`, `D9916`) expose image
    assets and HTML specs, not direct PDF datasheets. D98 mining pages are
    application-specific mining pages and were left out of the power-generation
    catalog rows unless a matching public PDF can be verified separately.
  - Rehlko/Kohler literature search surfaced official KD-series generator and
    engine info sheets, but the remaining current Kohler gaps are small-engine
    `KDI/KDW/KSD` rows or already-shared KD rows; no new one-row engine-only PDF
    was verified.
  - Yunnei, DEUTZ, Kukje, Googol, Yuchai, and Jichai targeted searches surfaced
    HTML product tables, generator/equipment listings, manuals, Scribd/manual
    mirrors, or family/range PDFs rather than public OEM one-model datasheet
    PDFs.
- No database writes were applied in this follow-up block. Dedicated/exclusive
  coverage therefore remains **971 / 2,715 (35.8%)**; the 80% row-exclusive
  target still requires **1,201** additional verified one-row datasheet links.

## 2026-08-02 Public-OEM Media API Imports

- Jenbacher/INNIO public media API:
  - Public endpoint queried:
    `https://www.jenbacher.com/en/wp-json/wp/v2/media?search=J420&per_page=50`.
  - Accepted one direct official PDF:
    `https://www.jenbacher.com/wp-content/uploads/2025/02/innio_jenbacher_j420_brochure_210x297mm_rz_screen_ijb-122001-en.pdf`.
  - Verification: downloaded bytes began with `%PDF`; `pdftotext -layout`
    contained `J420 D/E`, `Jenbacher`, `INNIO`, and `Technical data`; no current
    missing Jenbacher sibling tokens (`J312`, `J316`, `J320`, `J412`, `J416`,
    `J612`, `J616`, `J620`, `J624`) were present.
  - Linked to `jenbacher-j420` as
    `jenbacher/official-brochures/j420-de-product-brochure.pdf`.
  - Follow-up searches for `J412`, `J612`, `J312`, `J316`, `J416`, `J616`,
    `J620`, and `J624` did not surface equivalent one-model public PDFs. `J320`
    returned INNIO press-release PDFs rather than engine datasheets.
- Waukesha public media API:
  - Queried exact and alternate model tokens through
    `https://www.waukeshaengine.com/wp-json/wp/v2/media`.
  - Accepted four official Waukesha/INNIO model-specific PDFs for the remaining
    Waukesha exclusive gaps:
    - `waukesha/factsheets/vgf24gl.pdf` from
      `https://www.waukeshaengine.com/wp-content/uploads/IWK-123029-VGF24GL.pdf`.
    - `waukesha/factsheets/vgf-l36gsi.pdf` from
      `https://www.waukeshaengine.com/wp-content/uploads/IWK-123064-VGF-L36GSI.pdf`.
    - `waukesha/factsheets/vgf-p48gsi.pdf` from
      `https://www.waukeshaengine.com/wp-content/uploads/IWK-123060-VGF-P48GSI.pdf`.
    - `waukesha/factsheets/vgf18gl.pdf` from
      `https://www.waukeshaengine.com/wp-content/uploads/IWK-123021-VGF18GL.pdf`.
  - Verification: all four downloads began with `%PDF`; extracted text contained
    the exact product/engine tokens (`VGF24GL`/`H24GL`, `VGF L36GSI`,
    `VGF P48GSI`, `VGF18GL`/`F18GL`) plus Waukesha/INNIO authorship language;
    sibling tokens were rejected by the import script.
  - Note: two catalog slugs (`waukesha-vgf-h24gsi`, `waukesha-vgf-f18gsi`) use
    older `GSI`-style slug text while their catalog display models are GL/GLD;
    the links were matched to the display model text, not the misleading slug.
- Stale/covered candidate checks:
  - `data/attach-cummins-official-b-series-spec-sheets-2026-08.mjs` and
    `data/attach-perkins-americas-engine-data-sheets-2026-08.mjs` stopped
    because their records are already no longer current exclusive gaps.
  - `data/attach-waukesha-exclusive-factsheets-2026-08.mjs` verified 8 public
    Waukesha PDFs, but all 8 target rows already count as exclusive; no duplicate
    rows were applied.
- Hyundai official source check:
  - Official HD Hyundai pages expose public `PU180TI_Spec sheet_Eng.pdf` and
    `PU222TI_Spec sheet_Eng.pdf` download endpoints, but the current remaining
    catalog gaps are `P180FE` and `P222FE`.
  - Rejected for the strict metric because `PU180TI`/`PU222TI` are not exact
    matches for the older `FE` rows.
  - Existing `data/attach-hyundai-official-generator-spec-sheets-2026-08.mjs`
    already handles this by skipping Hyundai rows without an official matching
    detail-page model token.
- Caterpillar current-gap check:
  - Reviewed the existing Caterpillar official import scripts against the
    refreshed current gap list. The scripts target rows such as `G3516`,
    `G3512H`, `G3520H`, `3516C HD`, and `3516E`, which are not the current
    Caterpillar exclusive gaps after prior imports.
  - No Caterpillar rows were applied in this batch.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **971 / 2,715
    (35.8%)** to **976 / 2,715 (35.9%)**.
  - Overall datasheet coverage remains **2,172 / 2,715 (80.0%)**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database writes:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,765
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with the same 4 pre-existing low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **976**.
  - Additional required verified one-row datasheet links: **1,196**.

## 2026-08-02 Yanmar Current-Gap Media Scan

- Yanmar public WordPress media API:
  - Scanned current `missing-exclusive-2026-08-02.json` Yanmar rows against
    `https://yanmarengines.com/wp-json/wp/v2/media`.
  - Accepted two direct Yanmar-hosted exact model PDFs:
    - `yanmar/official-spec-sheets/3tnm68-hge.pdf` from
      `https://yanmarengines.com/wp-content/uploads/2020/09/3TNM68-HGE.pdf`.
    - `yanmar/official-spec-sheets/3tnv70-gge.pdf` from
      `https://yanmarengines.com/wp-content/uploads/2020/09/3TNV70-GGE.pdf`.
  - Verification: both downloads began with `%PDF`; extracted text contained
    the exact model token, `YANMAR`, and `Dimensions`/`Performance Data`; sibling
    tokens were rejected by `data/attach-yanmar-current-gap-spec-sheets-2026-08.mjs`.
  - Rejected current-row suffix mismatches:
    - `Sales-Sheet-4TNV86CT-GGE.pdf` for current catalog row `4TNV86CT`.
    - `3TNM72-GGE.pdf` for current catalog row `3TNM72-G`.
    - These are real Yanmar PDFs, but not exact model matches under the
      dedicated/exclusive goal.
- Stale/currently covered checks:
  - `data/attach-yanmar-official-sales-sheets-2026-08.mjs` verified 14 public
    Yanmar PDFs, but none of its target slugs are current exclusive gaps after
    the refreshed coverage report. No rows were applied from that stale script.
  - `data/attach-rehlko-official-kd-engine-info-sheets-2026-08.mjs` verified 6
    public Rehlko/Kohler KD PDFs, but all 6 records are already no longer
    missing exclusive coverage.
  - `data/attach-kubota-exclusive-product-pdfs-2026-08.mjs` found 33 official
    Kubota product matches and 13 one-engine targets, but all 13 direct Kubota
    product PDF endpoints returned HTTP 404. The remaining official Kubota
    matches were shared product PDFs and were not linked for exclusive coverage.
- Hatz source check:
  - Google/indexed official Hatz pages expose current product datasheet pages
    such as `https://hatz.com/en-global/products/engines/h-series`, plus manuals
    and installation drawings.
  - No direct one-model public datasheet PDF bytes were accepted in this pass;
    manuals, installation drawings, certificates, and shared series pages remain
    out of scope for the strict dedicated/exclusive metric.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **976 / 2,715
    (35.9%)** to **978 / 2,715 (36.0%)**.
  - Overall datasheet coverage remains **2,172 / 2,715 (80.0%)**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database writes:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,767
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with the same 4 pre-existing low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **978**.
  - Additional required verified one-row datasheet links: **1,194**.

## 2026-08-02 Official Weichai Gap Datasheet Pass

- Weichai official English power-kit pages:
  - Bounded crawl covered the public Weichai power-kit category and detail pages
    under `https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/`.
  - Accepted and linked four direct Weichai-hosted exact model datasheets:
    - `weichai/official-gap-datasheets/12m55d2450e310.pdf` from
      `https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202309/W020260120473802503665.pdf`.
    - `weichai/official-gap-datasheets/16m55d2900e310.pdf` from
      `https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202309/W020260120474194250739.pdf`.
    - `weichai/official-gap-datasheets/16m55d3300e310.pdf` from
      `https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202309/W020260120474194259030.pdf`.
    - `weichai/official-gap-datasheets/20m33d2020e310.pdf` from
      `https://en.weichai.com/cpyfw/wmdyw/dlzc/fddj/wcpp_tjcp/202309/W020260120473574624504.pdf`.
  - Verification:
    - All four responses began with `%PDF`.
    - The three text PDFs extracted exact model tokens plus `Engine Datasheet`
      and `发动机数据单` markers with sibling-token rejection.
    - The `20M33D2020E310` PDF is image-based; `pdftoppm` + `tesseract --psm
      11` verified the first page contains the exact model token, `WEICHAI`,
      and `Engine Datasheet`. Visual inspection of the rendered page confirmed
      the same exact model.
- Rejected/not applied:
  - The same official crawl found current Weichai rows on HTML-only pages for
    `WP3.2`, `WP4.1`, `WP7`, `WP10`, `WP13`, `6M33`, and `8M33`; no direct
    public PDF bytes were exposed on those pages.
  - `20M33D2210E310` was not imported: the page reuses the same scanned
    `20M33D2020E310` PDF URL, and the `uploadpic` alternate
    `U020260120473564717450.pdf` returned HTTP 404.
  - VMAN official downloads remain gated: public `data-url` entries on
    `https://www.vman-engine.com/download` still return `password error` from
    `/download_yanzheng` without credentials, so no VMAN PDFs were imported.
  - Baifa/Triton/Xinchai reruns produced no new current links: the single Baifa
    current exact candidate returned HTML instead of `%PDF`, Triton had no
    remaining Perkins gap URLs in its sitemap, and Xinchai exact targets are
    already covered.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **978 / 2,715
    (36.0%)** to **982 / 2,715 (36.2%)**.
  - Overall datasheet coverage remains **2,172 / 2,715 (80.0%)**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database writes:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,771
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with the same 4 pre-existing low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **982**.
  - Additional required verified one-row datasheet links: **1,190**.

## 2026-08-02 Cummins C500N6B Exact Data-Sheet Pass

- Cummins-authored C500N6B data sheet hosted by CSDG:
  - Source page:
    `https://csdieselgenerators.com/used-cummins-c500n6b-natural-gas-generator-285-hrs--epa-certified-%2A%2A%2A%2A%2Aeta-july-15--2026%2A%2A%2A%2A%2A-5041.html`
  - Source PDF:
    `https://csdieselgenerators.com/Images/Generators/5041/cummins-c500n6b-data-sheet-1776614050.pdf`
  - Storage:
    `cummins/gas/exact-spec-sheets/c500n6b-data-sheet.pdf`
  - Verification:
    - Response began with `%PDF`.
    - Extracted text contains `C500N6B`, `Cummins`, `Generator set data sheet`,
      and `NAD-C500N6B`.
    - Sibling/range tokens such as `C400N6`, `C450N6`, `C200N6`, `C350N6`,
      `C550N6`, and `C600N6` were absent.
  - Imported with `data/attach-cummins-c500n6b-data-sheet-2026-08.mjs`.
- Rejected/not applied in this pass:
  - Official Cummins `GTA28E` page exposes Seismic `Spec Sheet` links for
    `C400N6`, `C450N6`, and `C500N6B`, but the public links resolve to
    JavaScript/HTML viewer pages rather than public PDF bytes.
  - The CSDG `cummins-c500n6b-spec-sheet-1776614037.pdf` was not imported for
    exclusive coverage because it is a shared specification sheet covering
    `C400N6`, `C450N6`, and `C500N6B`.
  - Liebherr D9812/D9816 mining downloads were rechecked; the public PDFs are
    family brochures containing multiple D95/D96/D97/D98 models, so they do not
    satisfy the one-model dedicated/exclusive rule.
  - Yuchai, Lister Petter, Daedong, Shibaura, and Hyundai spot checks found
    HTML product pages, manuals/mirrors, shared family/range documents, gated
    pages, or generator-vendor sheets; no additional accepted engine-only,
    exact-model PDF bytes were verified.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **982 / 2,715
    (36.2%)** to **983 / 2,715 (36.2%)**.
  - Overall datasheet coverage remains **2,172 / 2,715 (80.0%)**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database write:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,772
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with the same 4 pre-existing low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **983**.
  - Additional required verified one-row datasheet links: **1,189**.

## 2026-08-02 Cummins C150N6 / C200N6B Exact Data-Sheet Pass

- Cummins-authored C150N6 data sheet hosted by CSDG:
  - Source page:
    `https://csdieselgenerators.com/new-cummins-c150n6-qsj8.9g-natural-gas--propane-generator--epa-certified-4236.html`
  - Source PDF:
    `https://csdieselgenerators.com/Images/Generators/4236/Cummins-C150N6-data-sheet.pdf`
  - Storage:
    `cummins/gas/exact-spec-sheets/c150n6-data-sheet.pdf`
  - Verification:
    - Response began with `%PDF`.
    - Extracted text contains `C150N6`, `Cummins`, `Generator Set Data Sheet`,
      and `NAS-6304`.
    - Sibling/range tokens such as `C125N6`, `C175N6B`, `C200N6B`, `C400N6`,
      `C450N6`, `C500N6B`, and `C600N6` were absent.
  - Imported with `data/attach-cummins-c150n6-data-sheet-2026-08.mjs`.
- Cummins-authored C200N6B data sheet hosted by CSDG:
  - Source page:
    `https://csdieselgenerators.com/used-cummins-c200n6b-qsj8.9g-natural-gas--propane-generator--547-hrs--epa-certified-4620.html`
  - Source PDF:
    `https://csdieselgenerators.com/Images/Generators/4620/Cummins-C200N6B-Data-Sheet.pdf`
  - Storage:
    `cummins/gas/exact-spec-sheets/c200n6b-data-sheet.pdf`
  - Verification:
    - Response began with `%PDF`.
    - Embedded text uses a garbled font encoding, so the importer renders the
      PDF pages with `pdftoppm` and verifies OCR with `tesseract`.
    - OCR contains `C200N6B`, `Cummins`, `Generator Set Data Sheet`, and
      `NAD-6633`.
    - Bounded sibling-token checks reject standalone `C125N6`, `C150N6`,
      `C175N6B`, `C200N6`, `C400N6`, `C450N6`, `C500N6B`, `C600N6`, etc.,
      without treating the `C200N6` prefix inside `C200N6B` as a sibling hit.
  - Imported with `data/attach-cummins-c200n6b-data-sheet-2026-08.mjs`.
- Rejected/not applied in this pass:
  - The CSDG `new-cummins-c200n6b-submittal-1777322610.pdf` was not imported:
    it is a large submittal package and includes shared `C125N6`, `C150N6`,
    `C175N6B`, and `C200N6B` specification content.
  - The CSDG `Cummins-C200N6B-spec-sheet.pdf` was not imported for exclusive
    coverage because it is the shared 125/150/175/200 kW Cummins specification
    sheet, not a one-model data sheet.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **983 / 2,715
    (36.2%)** to **985 / 2,715 (36.3%)**.
  - Overall datasheet coverage remains **2,172 / 2,715 (80.0%)**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database writes:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,774
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with the same 4 pre-existing low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **985**.
  - Additional required verified one-row datasheet links: **1,187**.

## 2026-08-02 Cummins C80N6 Exact Data-Sheet Pass

- Cummins-authored C80N6 data sheet hosted by CSDG:
  - Source page:
    `https://www.csdieselgenerators.com/used-cummins-c80-n6-qsj5.9-g3-natural-gas--propane-generator--84-hrs--epa-certified-3607.html`
  - Source PDF:
    `https://www.csdieselgenerators.com/Images/Generators/3607/Cummins-80kW-C80N6-data-sheet.pdf`
  - Storage:
    `cummins/gas/exact-spec-sheets/c80n6-data-sheet.pdf`
  - Verification:
    - Response began with `%PDF`.
    - Extracted text contains `C80 N6`, `Cummins`, `Generator set data sheet`,
      and `NAD-6097-EN`.
    - The PDF text has the exact model data-sheet page and did not contain
      neighboring C-series tokens such as `C45N6`, `C50N6`, `C60N6`, `C70N6`,
      `C100N6`, `C150N6`, or `C200N6B`.
  - Imported with `data/attach-cummins-c80n6-data-sheet-2026-08.mjs`.
- Rejected/not applied in this pass:
  - CSDG C45/C50/C60/C70 searches surfaced visible shared spec sheets and
    submittals, but no separate exact one-model data-sheet PDF comparable to
    the accepted C80N6 file.
  - The CSDG `Cummins-GGHF-spec-sheet.pdf` was not imported for exclusive
    coverage because it is a shared Cummins specification sheet covering
    `GGHE` and `GGHF`.
  - Kubota official product-PDF dry run found 13 current one-row candidates,
    but all current PDF URLs returned HTTP 404; shared official Kubota product
    PDFs were deliberately not linked for exclusive coverage.
  - Yanmar official sales/spec sheets verified successfully in dry run, but
    none of those 14 rows remain in the current missing-exclusive report, so no
    no-op import was applied.
  - Rehlko/Kohler KD info sheets verified successfully in dry run, but all six
    rows are already no longer missing exclusive datasheets.
  - Baifa broad index found one current exact row (`Baudouin 6M11G110/6`), but
    the advertised URL returned HTML instead of `%PDF`; the standalone Perkins
    `1106A-70TAG4` verifier is already applied and no longer missing.
  - Emean Weichai crawl found eight current missing-exclusive matches, but all
    eight PDFs failed the required Weichai `Engine Datasheet` marker check.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **985 / 2,715
    (36.3%)** to **986 / 2,715 (36.3%)**.
  - Overall datasheet coverage remains **2,172 / 2,715 (80.0%)**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database write:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,775
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with the same 4 pre-existing low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **986**.
  - Additional required verified one-row datasheet links: **1,186**.

## 2026-08-02 Cummins C50N6 Exact Specification-Sheet Pass

- Cummins-authored C50N6 specification sheet hosted by CSDG:
  - Source page:
    `https://csdieselgenerators.com/new-cummins-c50n6-qsj5.9g-natural-gas--propane-generator--epa-certified-single-phase-4877.html`
  - Source PDF:
    `https://csdieselgenerators.com/Images/Generators/4877/New-Cummins-C50N6-Spec-Sheet.pdf`
  - Storage:
    `cummins/gas/exact-spec-sheets/c50n6-spec-sheet.pdf`
  - Verification:
    - Response began with `%PDF` when fetched with browser-equivalent headers.
    - Extracted text contains `C50N6`, `Cummins`, `SPECIFICATION SHEET`,
      `NAS-6168-EN`, and `power.cummins.com`.
    - Neighboring C-series tokens such as `C45N6`, `C60N6`, `C70N6`,
      `C80N6`, `C100N6`, `C125N6`, and `C150N6` were absent.
  - Imported with `data/attach-cummins-c50n6-spec-sheet-2026-08.mjs`.
- Rejected/not applied in this pass:
  - Volvo Penta Mexico official PDF crawl found 23 current missing-exclusive
    matches from 85 official PDF links, but accepted 0: live PDFs were either
    shared sibling sheets (`TAD1170/1171/1172`, `TAD1371-1375`,
    `TAD1670-1672`, `TAD570-572`, `TAD870-873`) or returned HTTP 404
    (`TAD1180VE`, `TAD1182VE`, `TAD1183VE`, `TAD583VE`, `TAD884VE`).
  - Emean small-brand crawl checked FAWDE, Isuzu, and Yangdong pages and found
    75 engine datasheet candidates, but 0 current exact missing-exclusive
    matches.
  - Emean Cummins crawl found 64 engine datasheet candidates, but 0 current
    exact missing-exclusive matches.
  - Triton/Perkins crawl checked 0 current missing model-token product pages
    and found 0 engine data-sheet links.
  - Cummins B-series and Waukesha VGF scripts are stale/no-op: their listed
    rows are already no longer missing exclusive datasheets.
  - Liebherr and mtu official scripts still verify their PDFs, but their five
    listed slugs are already absent from the current missing-exclusive report,
    so no duplicate/no-op import was applied.
  - VMAN official download pages list promising OEM data-sheet documents, but
    the actual download endpoint returned `password error` for public requests;
    no gated PDF was imported.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **986 / 2,715
    (36.3%)** to **987 / 2,715 (36.4%)**.
  - Overall datasheet coverage remains **2,172 / 2,715 (80.0%)**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database write:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,776
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with the same 4 pre-existing low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **987**.
  - Additional required verified one-row datasheet links: **1,185**.

## 2026-08-02 Post-C50 Dedicated Source Sweep

- Shared-link diagnostics:
  - Read-only Supabase inspection confirmed the largest remaining
    missing-exclusive groups are dominated by legitimate shared family/selection
    PDFs, especially SDEC (171 rows on one Shanghai Diesel/SDEC brochure), VMAN
    (87 rows on the diesel-engine catalog), Lister Petter (68 rows on the G
    Drive range guide), Yunnei (55 rows on a catalog), Perkins selection charts,
    Googol catalog, Weichai family catalog, John Deere generator-drive selection
    guide, Volvo Penta family bulletins, and Cummins gaseous range sheets.
  - These are not database mistakes by themselves; the strict metric excludes
    them because the same PDF supports multiple engine rows.
- John Deere exact-page check:
  - Official public John Deere pages expose exact model HTML/spec pages such as
    `6068HFG05`, and public search confirms their model/spec content.
  - No direct one-model static PDF endpoint was found behind the public page
    fetch; the visible exact data is web-rendered/printable HTML and therefore
    was not imported for this PDF-only goal.
- Caterpillar exact-page check:
  - Official Cat pages such as `CG170B-12` expose exact public HTML specs and
    `Download`/`Print` controls.
  - Browser-indexed page content did not expose a direct PDF link, and direct
    browser-header page fetches returned CDN blocking/empty response. No
    importable Cat one-model PDF bytes were verified from this path.
- Cummins C60/C70 follow-up:
  - Public searches for `C60N6`, `C70N6`, `NAS-6169-EN`, and adjacent Cummins
    Quiet Connect document numbers surfaced Scribd/manual/device-report mirrors
    and submittal packages, plus references to shared C-series documents.
  - No acceptable OEM-hosted or accepted-precedent CSDG exact one-model PDF URL
    was verified beyond the already imported C50N6/C80N6/C150N6/C200N6B/C500N6B
    sheets.
- Baudouin media-library check:
  - Official `6M31` page exposes only shared 50 Hz/60 Hz rating cards and a
    brochure; those documents contain multiple current missing model tokens.
  - Public WordPress media API searches for `6M31`, `4M07`, `20M55`, and
    `20M61` returned no exact datasheet PDFs. `20M55`/`20M61` results were
    product images only.
- SDEC/DEUTZ broad web checks:
  - SDEC searches for exact models such as `SC7H220D2` and `SC13E550D2`
    surfaced generator-vendor/equipment TDS pages, catalog mirrors, or
    non-OEM documents rather than public SDEC one-model engine PDFs.
  - DEUTZ exact searches mostly surfaced official emissions-certification pages
    and certificates, not datasheets; certificates were not counted as
    dedicated datasheets.
- No database writes were applied in this sweep. Dedicated/exclusive coverage
  remains **987 / 2,715 (36.4%)**; reaching **2,172** exclusive rows still
  requires **1,185** additional verified one-row/model-specific PDF links.

## 2026-08-02 PSI Official Gas Spec Sheet Import

- Source discovery:
  - PSI's public WordPress media API exposed PSI-hosted PDF spec sheets under
    `https://psiengines.com/wp-content/uploads/...`.
  - Dry-run validation downloaded each PDF with browser headers, checked the
    `%PDF` signature, extracted text with `pdftotext`, and required exact
    PSI/model/data-sheet tokens before linking.
- Accepted exact PSI-hosted PDFs:
  - `psi-gas-5-7l-tcac` (`5.7L TCAC`) ->
    `https://psiengines.com/wp-content/uploads/2025/08/PSI-PSYSTEMS_5.7LCAC-Gas_Engine-3.pdf`
    with `5.7LCAC`, `PSI 5.7-LITER ENGINE DATA`, `STANDBY`, `TCAC`, and
    `Power Solutions International`.
  - `psi-gas-13l-ho` (`13L HO`) ->
    `https://psiengines.com/wp-content/uploads/2026/05/PSI-PSYSTEMS_13LT-Gas_Engine-3.pdf`
    with `13LT`, `PSI 13-LITER ENGINE DATA`, `STANDBY HO`, and
    `Power Solutions International`.
  - `psi-gas-14l-ho` (`14L HO`) ->
    `https://psiengines.com/wp-content/uploads/2025/08/PSI-PSYSTEMS_14L-Gas_Engine.pdf`
    with `14L`, `PSI 14-LITER ENGINE DATA`, `HIGH OUTPUT`, and
    `Power Solutions International`.
  - `psi-gas-22l-ho` (`22L HO`) ->
    `https://psiengines.com/wp-content/uploads/2025/08/PSI-PSYSTEMS_22L-Gas_Engine-2.pdf`
    with `22L`, `PSI 22-LITER ENGINE DATA`, `HIGH OUTPUT`, and
    `Power Solutions International`.
  - `psi-gas-53l-ho` (`53L HO`) ->
    `https://psiengines.com/wp-content/uploads/2025/08/PSI-PSYSTEMS_53L-Gas_Engine.pdf`
    with `53L`, `PSI 53-LITER ENGINE DATA`, `STANDBY HO`, and
    `Power Solutions International`.
- Rejected PSI 8.8L candidates for exclusive counting:
  - `PSI-PSYSTEMS_8.8-T-TCAC-Gas_Engine.pdf` includes `8.8L T/TCAC`,
    regular `TCAC`, and `TCAC-HO` content, while both regular and HO rows
    remain current missing-exclusive records.
  - `PSI-PSYSTEMS_8.8T-TCAC-Gas_Engine.pdf` is also shared across the 8.8L
    T/TCAC variants. No exact PDF for `psi-gas-8-8l-tcac-ho` was found; the
    matching public asset located in PSI media was a PNG, not a PDF.
- Database import:
  - Script: `data/attach-psi-official-gas-spec-sheets-2026-08.mjs`.
  - Applied 5 PSI datasheet links after dry-run validation.
  - Stored files under `psi/official-gas-spec-sheets/`.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **987 / 2,715
    (36.4%)** to **992 / 2,715 (36.5%)**.
  - Overall datasheet coverage increased from **2,172 / 2,715 (80.0%)** to
    **2,177 / 2,715 (80.2%)**.
  - PSI datasheet coverage increased from **40 / 47 (85.1%)** to **45 / 47
    (95.7%)**.
  - PSI exclusive/dedicated coverage increased from **22 / 47 (46.8%)** to
    **27 / 47 (57.4%)**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database write:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,781
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with 4 low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **992**.
  - Additional required verified one-row datasheet links: **1,180**.

## 2026-08-02 Cummins QSK50-G24 Candidate Prepared

- Accepted and imported:
  - CSDG page:
    `https://csdieselgenerators.com/new-cummins-c1750d6e-qsk50-g24-diesel-generator--epa-tier-2-5052.html`.
  - Page evidence: product details list engine manufacturer `Cummins`, engine
    model `QSK50-G24 NR2`, package model `C1750D6E`, and a direct document
    link named `cummins-c1750d6e-data-sheet-1778116018.pdf`.
  - Direct PDF:
    `https://csdieselgenerators.com/Images/Generators/5052/cummins-c1750d6e-data-sheet-1778116018.pdf`.
  - Web/PDF evidence: the PDF is indexed as `application/pdf`, has 3 pages,
    and extracted text contains `cummins.com`, `C1750D6E`, `DIESEL GENERATOR
    SET DATA SHEET`, `Manufacturer Cummins Inc.`, `Model QSK50 - G24`, and
    bulletin `NAD-6744`.
  - Import script prepared:
    `data/attach-cummins-qsk50-g24-data-sheet-2026-08.mjs`.
  - Dry-run and apply verification: the live script downloaded the PDF,
    confirmed required text tokens, rejected sibling tokens, uploaded the file
    to Supabase Storage, and linked
    `cummins/diesel/exact-data-sheets/qsk50-g24-c1750d6e-data-sheet.pdf`.
- Rejected neighboring/source checks:
  - CSDG `QSK78-G10` page exposes `Cummins-DQLE-spec-sheet.pdf`, but the PDF
    text is a Cummins QSK78 series/DQLE-DQLF package specification sheet and
    does not contain the exact current catalog engine token `QSK78-G10`.
  - PSI official diesel PDFs for `20L-D`, `40L-D`, `53L-D`, and `88L-D` are
    real PSI-hosted PDFs, but they are model/rating-range sheets. They map to
    duplicate same-model catalog rows, so assigning one shared model PDF to a
    single arbitrary row would inflate the exclusive metric. They were not
    imported for this strict row-exclusive goal.

## 2026-08-02 Cummins Official QSK60G Data-Sheet Import

- Source:
  - Official Cummins QSK60G gas generator product page:
    `https://www.cummins.com/en-apac/generators/products/qsk60g-gas-generator-series`.
  - The page exposes direct `Data Sheet` links for current missing-exclusive
    rows `C1000N6`, `C1250N6`, `C1350N6`, `C1000N6C`, `C1100N6C`, and
    `C1400N6C`.
- Accepted and imported:
  - `cummins-c1000n6` from
    `https://www.cummins.com/sites/default/files/2020-02/C1000N6%20-%20D-6455.pdf`,
    stored as `cummins/gas/official-qsk60g-data-sheets/c1000n6-d-6455.pdf`.
  - `cummins-c1250n6` from
    `https://www.cummins.com/sites/default/files/2020-02/C1250N6%20-%20D-6454.pdf`,
    stored as `cummins/gas/official-qsk60g-data-sheets/c1250n6-d-6454.pdf`.
  - `cummins-c1350n6` from
    `https://www.cummins.com/sites/default/files/2020-02/C1350N6%20-%20D-6453.pdf`,
    stored as `cummins/gas/official-qsk60g-data-sheets/c1350n6-d-6453.pdf`.
  - Verification: all three responses began with `%PDF`; extracted text
    contained the exact catalog model token, `QSK60G`, `Cummins`, `Data Sheet`,
    and the corresponding document number (`D-6455`, `D-6454`, `D-6453`).
    The import script rejected sibling model tokens across the three verified
    rows.
  - Script: `data/attach-cummins-official-qsk60g-data-sheets-2026-08.mjs`.
- Deferred / not imported:
  - The same official Cummins page links `C1000 N6C - D-6203`,
    `C1100 N6C - D-6204`, and `C1400 N6C - D-6452`, but all three direct PDF
    URLs returned HTTP 503 during live dry-run. No bytes were verified or
    imported for those rows.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **992 / 2,715
    (36.5%)** before the QSK50/QSK60G pair to **996 / 2,715 (36.7%)**.
  - Cummins exclusive coverage increased to **183 / 282 (64.9%)**.
  - Overall datasheet coverage remains **2,177 / 2,715 (80.2%)**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database writes:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,785
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with 4 low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **996**.
  - Additional required verified one-row datasheet links: **1,176**.

## 2026-08-02 Cummins Official HSK78G Data-Sheet Import

- Source:
  - Official Cummins HSK78G gas generator product page:
    `https://www.cummins.com/en-apac/generators/products/hsk78g-gas-generator-series`.
- Accepted and imported:
  - `cummins-c1600n6cd` from
    `https://www.cummins.com/sites/default/files/2019-12/D-6417f_Marketing.pdf`,
    stored as `cummins/gas/official-hsk78g-data-sheets/c1600n6cd-d-6417f.pdf`.
  - `cummins-c1800n6cd` from
    `https://www.cummins.com/sites/default/files/2019-12/D-6413f_Marketing.pdf`,
    stored as `cummins/gas/official-hsk78g-data-sheets/c1800n6cd-d-6413f.pdf`.
  - `cummins-c2000n6cd` from
    `https://www.cummins.com/sites/default/files/2019-12/D-6409f_Marketing.pdf`,
    stored as `cummins/gas/official-hsk78g-data-sheets/c2000n6cd-d-6409f.pdf`.
  - Verification: all three responses began with `%PDF`; extracted text
    contained the exact catalog model token, `HSK78G`, `Cummins`,
    `Generator Set Data Sheet`, and the corresponding document number
    (`D-6417`, `D-6413`, or `D-6409`). The import script rejected sibling
    tokens across the three verified rows.
  - Script: `data/attach-cummins-official-hsk78g-data-sheets-2026-08.mjs`.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased to **999 / 2,715
    (36.8%)**.
  - Cummins exclusive coverage increased to **186 / 282 (66.0%)**.
  - Overall datasheet coverage remains **2,177 / 2,715 (80.2%)**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database writes:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,788
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with 4 low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **999**.
  - Additional required verified one-row datasheet links: **1,173**.

## 2026-08-02 Cummins C60N6 RMG Exact Specification-Sheet Pass

- Cummins-authored C60N6 specification sheet hosted by Rocky Mountain Generator
  Supply:
  - Source page:
    `https://rockymountaingeneratorsupply.com/products/6081/RS60-Connect-Series-Liquid-Cooled-60kW-120-240V-3-Phase-Part-A054F835`.
  - Source PDF:
    `https://rockymountaingeneratorsupply.com/userfiles/2002/C60N6%20Spec%20Sheet.pdf`.
  - Storage:
    `cummins/gas/exact-spec-sheets/c60n6-rmg-spec-sheet.pdf`.
  - Verification:
    - Response began with `%PDF`.
    - Extracted text contains `C60N6`, `Cummins`, `Specification sheet`,
      `NAS-6169-b-EN`, and `power.cummins.com`.
    - Neighboring C-series tokens such as `C45N6`, `C50N6`, `C70N6`,
      `C80N6`, `C100N6`, `C125N6`, and `C150N6` were absent.
  - Imported with `data/attach-cummins-c60n6-rmg-spec-sheet-2026-08.mjs`.
- Rejected/not applied in this pass:
  - Adjacent guessed Rocky Mountain direct URLs for `C45N6` and `C70N6` served
    the site's HTML shell instead of `%PDF` bytes, so they were not imported.
  - The previously deferred official Cummins QSK60G `N6C` PDFs still returned
    HTTP 503 and remain unverified.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **999 / 2,715
    (36.8%)** to **1,000 / 2,715 (36.8%)**.
  - Cummins exclusive coverage increased to **187 / 282 (66.3%)**.
  - Overall datasheet coverage remains **2,177 / 2,715 (80.2%)**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database write:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,789
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with 4 low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **1,000**.
  - Additional required verified one-row datasheet links: **1,172**.

## 2026-08-02 Cummins RMG Quiet Connect Specification-Sheet Batch

- Cummins-authored Quiet Connect specification sheets hosted by Rocky Mountain
  Generator Supply:
  - Source page:
    `https://rockymountaingeneratorsupply.com/Residential-Generators`.
  - Accepted direct PDFs:
    - `cummins-c25n6`:
      `https://rockymountaingeneratorsupply.com/userfiles/2002/C25N6%20Spec%20Sheet.pdf`,
      stored as `cummins/gas/exact-spec-sheets/c25n6-rmg-spec-sheet.pdf`.
    - `cummins-c30n6`:
      `https://rockymountaingeneratorsupply.com/userfiles/2002/C30N6%20Spec%20Sheet.pdf`,
      stored as `cummins/gas/exact-spec-sheets/c30n6-rmg-spec-sheet.pdf`.
    - `cummins-c36n6`:
      `https://rockymountaingeneratorsupply.com/userfiles/2002/C36N6%20Spec%20Sheet.pdf`,
      stored as `cummins/gas/exact-spec-sheets/c36n6-rmg-spec-sheet.pdf`.
    - `cummins-c40n6`:
      `https://rockymountaingeneratorsupply.com/userfiles/2002/C40N6%20Spec%20Sheet.pdf`,
      stored as `cummins/gas/exact-spec-sheets/c40n6-rmg-spec-sheet.pdf`.
  - Verification:
    - All four responses began with `%PDF`.
    - Extracted text contains the exact target model (`C25 N6`, `C30 N6`,
      `C36 N6`, or `C40 N6`), `Cummins`, `Specification sheet`, and the
      corresponding NAS document number (`NAS-5775d-EN`, `NAS-5776d-EN`,
      `NAS-5777d-EN`, or `NAS-5778d-EN`).
    - Neighboring C-series tokens were rejected by the import script before
      upload/linking.
  - Imported with
    `data/attach-cummins-rmg-quiet-connect-spec-sheets-2026-08.mjs`.
- Rejected/not applied in this pass:
  - Guessed Rocky Mountain direct URLs for `C20N6`, alternate `C20 N6`,
    `C45N6`, and `C70N6` served HTML shells instead of `%PDF` bytes.
  - The visible RMG `C70 D2RE` product page exposes package PDFs, but that
    package names a trailerized unit and `QSB5-G11`; it is not an exact match
    for the catalog's `C70N6` row.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **1,000 / 2,715
    (36.8%)** to **1,004 / 2,715 (37.0%)**.
  - Cummins exclusive coverage increased to **191 / 282 (67.7%)**.
  - Overall datasheet coverage remains **2,177 / 2,715 (80.2%)**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database writes:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,793
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with 4 low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **1,004**.
  - Additional required verified one-row datasheet links: **1,168**.

## 2026-08-02 Post-RMG Strict Source Sweep

- Existing stored single-link non-datasheet audit:
  - Rechecked the current report for single-link non-`datasheet` files attached
    to rows that still lack exclusive datasheets.
  - Accepted 0 for reclassification. The remaining candidates are manuals,
    case studies, range guides, technical presentations, or technical-review
    articles rather than one-model datasheets/spec sheets:
    `2g/case-studies/agenitor-312-windmill-holsteins.pdf`,
    `cummins/brochures/lean-burn-natural-gas-powerhour.pdf`,
    `ener-g/guides/ener-g-natural-gas-range-2015.pdf`,
    `generac/manuals/mgg100m-operating-manual.pdf`,
    Hatz operator manuals, `mitsubishi/technical-reviews/gsr-series-hydrogen-
    engine-development.pdf`, and `psi/manuals/psi-legacy-3-0l-engine-service-
    manual.pdf`.
  - A short-lived exact-spec reclassification script was deliberately removed
    after dry-run guards showed its Isuzu/Mesa candidates are already absent
    from the refreshed missing-exclusive set and would not advance this goal.
- Cummins QSK60G N6C official endpoints:
  - Retried direct official URLs for `C1000 N6C - D-6203`,
    `C1100 N6C - D-6204`, `C1400 N6C - D-6452`, plus adjacent guessed
    `C1250 N6C - D-6205` and `C1500 N6C - D-6206`.
  - Accepted 0. Every response was a short HTML document (`<!DOCTYPE...`),
    not `%PDF` bytes.
- Liyu Power:
  - Checked `https://www.liyupower.com/ly1200-series.html` and related LY1600 /
    LY2000 product pages.
  - The product pages expose exact technical data in HTML, but the downloadable
    PDF is the shared bilingual Liyu Power brochure. It is not a one-model
    datasheet for `LY1200AGL/M/H-*`, `LY1600AGL/M/H-*`, or
    `LY2000AGL/M/H-*`, so no row-exclusive PDF was imported.
- Guascor:
  - Rechecked the official gas-engine page:
    `https://guascor-energy.com/products/marine-products/gas-engines/`.
  - Accepted 0. The page exposes exact model HTML and one shared
    `S-series Gas engines and gensets` PDF; the WordPress media API is blocked
    by site security. No public one-model PDF bytes were verified.
- Rehlko / Kohler:
  - Retested guessed KDI/KSD PDF patterns and the known
    `KDI3404_TCR_EN.pdf` endpoint.
  - Accepted 0. `KDI3404_TCR_EN.pdf` is an owner manual, guessed KDI/KSD exact
    filenames returned HTML/XML bodies, and no missing `KDI/KSD` one-model
    datasheet PDF was verified.
- MAN:
  - Checked official MAN product pages such as
    `https://www.man.eu/engines/en/products/power-generation/gas/man-motor-e3268.html`.
  - Accepted 0. Exact model data is embedded in HTML; no direct PDF URL was
    exposed in the fetched page.
- Ford / WINCO:
  - Checked WINCO pages and direct guessed `MSG425`/`10-1094 EFI Spec Sheet`
    PDF paths.
  - Accepted 0. The direct guessed engine-PDF paths returned HTML, while the
    reachable WINCO spec-sheet PDF is for the `PPG28` generator package rather
    than a Ford `MSG425` engine datasheet.
- Perkins / Kaihua:
  - Checked the Kaihua `1706J-E93TAG2 Datasheet` page:
    `https://www.kaihuagenset.com/news/Download/Engine-Data-Sheet/Perkins/302kW-1500rpm-1706J-E93TAG2-Datasheet.html`.
  - Accepted 0. The page is HTML-only in the fetched source and guessed direct
    PDF paths returned HTML bodies instead of `%PDF`.
- Isuzu:
  - Checked the official `pre-validated-genset-ready-power-units` page through
    web search/browser and retried direct current-row PDF patterns with
    browser-like `curl` headers.
  - Accepted 0. The exposed official PDFs are shared genset-ready power-unit
    sheets (for example combined `4LE2X/4LE2T`) rather than one-model PDF
    datasheets for the current missing-exclusive rows; direct guessed filenames
    failed TLS/download verification.

No database writes were applied in this strict source sweep. Dedicated/exclusive
coverage remains **1,004 / 2,715 (37.0%)**; reaching **2,172** exclusive rows
still requires **1,168** additional verified one-row datasheet links.

## 2026-08-02 Doosan / HD Official Gas Spec-Sheet Import

- Source:
  - Official HD Construction Equipment engine detail pages under
    `https://www.hd-hyundaiengine.com/en/engine/generator-detail/`.
  - These pages expose current model-specific `Spec Sheet` PDF downloads for
    the four Doosan gas-engine rows still missing exclusive datasheets.
- Accepted and imported:
  - `doosan-ge08ti` from detail page `36`:
    `https://www.hd-hyundaiengine.com/hd-infra-engine/file/down/7f3cbceb-be2e-445e-aa0d-956bb9aa4a75`,
    stored as
    `doosan/hd-official-gas-spec-sheets/ge08ti-gen-pack-d-spec-sheet.pdf`.
  - `doosan-gv158ti` from detail page `38`:
    `https://www.hd-hyundaiengine.com/hd-infra-engine/file/down/404189b3-a955-4f19-8f1f-f203649eee98`,
    stored as
    `doosan/hd-official-gas-spec-sheets/gv158ti-gen-pack-b-spec-sheet.pdf`.
  - `doosan-gv180ti` from detail page `39`:
    `https://www.hd-hyundaiengine.com/hd-infra-engine/file/down/5fe63f72-546a-427a-845b-deaf13d3d247`,
    stored as
    `doosan/hd-official-gas-spec-sheets/gv180ti-gen-pack-bv-spec-sheet.pdf`.
  - `doosan-gv222ti` from detail page `40`:
    `https://www.hd-hyundaiengine.com/hd-infra-engine/file/down/d1068ea3-ca36-4c95-a39c-413cbb9b8d77`,
    stored as
    `doosan/hd-official-gas-spec-sheets/gv222ti-gen-pack-c-spec-sheet.pdf`.
- Verification:
  - The source pages contain the exact model token and exact source filenames:
    `HCE_GE08TI_GEN_PACK-D_Spec Sheet.pdf`,
    `HCE_GV158TI_GEN_PACK-B_Spec Sheet.pdf`,
    `HCE_GV180TI_GEN_PACK-BV_Spec Sheet.pdf`, and
    `HCE_GV222TI_GEN_PACK-C_Spec Sheet.pdf`.
  - All four direct downloads began with `%PDF`.
  - `pdftotext -layout` found each exact model token plus `GEN-PACK`,
    `HD Hyundai`, and `Specifications`.
  - The importer rejected sibling gas model tokens across `GE08TI`, `GE12TI`,
    `GV158TI`, `GV180TI`, and `GV222TI` before upload/linking.
  - Script:
    `data/attach-doosan-hd-official-gas-spec-sheets-2026-08.mjs`.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **1,004 / 2,715
    (37.0%)** to **1,008 / 2,715 (37.1%)**.
  - Overall datasheet coverage increased from **2,177 / 2,715 (80.2%)** to
    **2,181 / 2,715 (80.3%)**.
  - PDF links / unique stored files increased to **3,797 / 1,290**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database writes:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,797
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with the same 4 low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **1,008**.
  - Additional required verified one-row datasheet links: **1,164**.

## 2026-08-02 Scania Official DC13 507A Gap Spec-Sheet Import

- Source:
  - Official Scania power-generation PDF path under
    `https://www.scania.com/content/dam/www/market/master/products/power-solutions/engine-pdfs-next-generation/power-generation/`.
  - The earlier Scania upload script noted no individual sheets for the
    `DC13 507A 550` and `DC13 507A 600` rows, but current official URLs now
    return public PDF bytes.
- Accepted and imported:
  - `scania-dc13-507a-550`:
    `https://www.scania.com/content/dam/www/market/master/products/power-solutions/engine-pdfs-next-generation/power-generation/DC13-507A_550-605kVA.pdf`,
    stored as `scania/spec-sheets/DC13-507A_550-605kVA.pdf`.
  - `scania-dc13-507a-600`:
    `https://www.scania.com/content/dam/www/market/master/products/power-solutions/engine-pdfs-next-generation/power-generation/DC13-507A_600-660kVA.pdf`,
    stored as `scania/spec-sheets/DC13-507A_600-660kVA.pdf`.
- Verification:
  - Both direct downloads began with `%PDF`.
  - `pdftotext -layout` found `Scania`, `POWER GENERATION engine`,
    `DC13 507A`, and the exact rating tokens `550-605 kVA` or
    `600-660 kVA`.
  - The importer rejected sibling current-missing Scania model tokens before
    upload/linking, so the two new files count as one-row exclusive datasheets.
  - Script:
    `data/attach-scania-official-dc13-507a-gap-spec-sheets-2026-08.mjs`.
- Rejected from the same Scania pass:
  - `DC13 505A 450` / `DC13 506A 450`: official PDF is a shared two-model
    sheet, so it was not imported for dedicated/exclusive coverage.
  - Guessed `DC16 093A 02-51`, `DC16 078A 02-44`, and `DC16 078A 02-45`
    public URL patterns returned HTTP 404.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **1,008 / 2,715
    (37.1%)** to **1,010 / 2,715 (37.2%)**.
  - Overall datasheet coverage remains **2,181 / 2,715 (80.3%)**.
  - PDF links / unique stored files increased to **3,799 / 1,292**.
  - Generated Haifeng model datasheet links remain **0**.
- Verification after the database writes:
  - `npm run test:database` passed with 2,715 engines, 149 alternators, 3,799
    PDF links, and 75 engine brands.
  - `npm run data:qa` completed with the same 4 low-severity
    `brand_logo_wordmark_fallback` issues and no critical/high issues.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **1,010**.
  - Additional required verified one-row datasheet links: **1,162**.

## 2026-08-02 MWM / Guascor Official Gap Spec-Sheet Import

- Sources:
  - MWM official gas-engine `TCG 3016` page:
    `https://www.mwm.net/en/gas-engines-gensets/gas-engine-tcg-3016/`.
  - Guascor Energy official `Tri-fuel mobile solution` page:
    `https://guascor-energy.com/tri-fuel-mobile-solution/`.
- Accepted and imported:
  - `mwm-tcg-3016-v16-s`:
    `https://www.mwm.net/files/upload/mwm/issuu/MWM18010-OnePager-MWM-TCG-3016_EN_10_screen_dv.pdf`,
    stored as `mwm/official-spec-sheets/tcg-3016-v16-s-onepager.pdf`.
  - `guascor-g-56sl`:
    `https://guascor-energy.com/wp-content/uploads/2023/10/6036_Tri-fuel-mobile-solution_en_.pdf`,
    stored as
    `guascor/official-spec-sheets/g-56sl-tri-fuel-mobile-solution.pdf`.
- Verification:
  - Both source downloads began with `%PDF`.
  - `pdftotext -layout` found `TCG 3016 V16 S`,
    `Technical data 50 Hz`, `Caterpillar Energy Solutions GmbH`, and
    `www.mwm.net` in the MWM one-pager.
  - `pdftotext -layout` found `Engine model`, `G-56SL`,
    `Technical specifications`, and `Guascor Energy` in the Guascor PDF.
  - The importer rejects nearby MWM family tokens (`TCG 3016 V08`,
    `TCG 3016 V12`, `TCG 2020`, `TCG 3020`, `TCG 2032`) and nearby Guascor
    model tokens (`G-18FR`, `G-24FR`, `G-56HM`, `G-86EM`, `G-56SM`, and
    other current Guascor gaps) before upload/linking.
  - Script:
    `data/attach-mwm-guascor-official-gap-spec-sheets-2026-08.mjs`.
  - Guascor's host repeatedly timed out through Node `fetch`, so the importer
    uses `curl` only for that host and still performs the same `%PDF` and text
    checks after download.
  - The Guascor file crossed the storage helper threshold and was compressed
    from about **5,244KB** to **775KB** before upload.
- Rejected from the same MWM pass:
  - `TCG 3016` product brochure:
    `CES24031-Update-Produktbroschuere-TCG-3016_..._EN_...pdf` contains
    `TCG 3016 V08`, `V12`, `V16`, and `V16 S`, so it is a shared family
    brochure and was not imported for row-exclusive coverage.
  - `TCG 3020` product brochure contains multiple `V12`, `V16`, and `V20`
    rating tables, so it remains shared.
  - `TCG 2032B` product brochure contains `TCG 2032B V16` but also ordinary
    `TCG 2032 V12` and `TCG 2032 V16` technical data, so it was rejected for
    the strict exclusive metric.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **1,010 / 2,715
    (37.2%)** to **1,012 / 2,715 (37.3%)**.
  - Overall datasheet coverage remains **2,181 / 2,715 (80.3%)**.
  - PDF links / unique stored files increased to **3,801 / 1,294**.
  - Generated Haifeng model datasheet links remain **0**.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **1,012**.
  - Additional required verified one-row datasheet links: **1,160**.

## 2026-08-02 Kirloskar Americas Official Spec-Sheet Discovery

- Source:
  - Kirloskar Americas official generator-drive engines page:
    `https://www.kirloskaramericas.com/generator-drive-engines`.
- Accepted for import:
  - `kirloskar-4r810na1`:
    `https://www.kirloskaramericas.com/documents/5928996/5929168/T4.3068_4R810NA1_For+30kWe_Specification+Sheet.pdf/dcb1a4fc-f47d-03b9-1573-ce350345771e?t=1759466868790`.
  - `kirloskar-4r810ta2`:
    `https://www.kirloskaramericas.com/documents/5928996/5929170/4R810TA2_For+40kWe_Specification+Sheet.pdf/5ff08b8b-a344-1921-0694-d1d6749fb08d?t=1748927656345`.
  - `kirloskar-4r810ta1`:
    `https://www.kirloskaramericas.com/documents/5928996/5929170/4R810TA1_For+60kWe_Specification+Sheet.pdf/b7c73d90-2b56-3811-87ef-d964356047c2?t=1748927701521`.
  - `kirloskar-4k1080ta1`:
    `https://www.kirloskaramericas.com/documents/5928996/5929170/4K1080TA1_For+100kWe_Specification+Sheet.pdf/5ac20c32-a8f8-dcfd-1517-99bf83ac84ec?t=1748927730958`.
- Verification:
  - Each download began with `%PDF`.
  - `pdftotext -layout` found the exact row model token, `BROAD
    SPECIFICATIONS`, `Engine Model`, and `US EPA TIER`.
  - The four accepted PDFs did not contain sibling current-missing Kirloskar
    model tokens.
  - Script:
    `data/attach-kirloskar-americas-official-spec-sheets-2026-08.mjs`.
- Rejected from the same Kirloskar pass:
  - `2R550` and `3R550` PDFs are official Kirloskar Americas specification
    PDFs, but the extracted model tokens are `2R550NA` and `3R550NA`, not the
    current row models `2R550NA1` and `3R550NA1`, so they were rejected for the
    strict exact-model metric.
  - Bergen Engines official `B36:45V` fact sheet was rejected because the same
    PDF contains `B36:45V12`, `B36:45V16`, and `B36:45V20` rating tables.
  - Kawasaki Green Gas Engine pages exposed HTML/product-download forms but no
    public exact static PDF for the current `KG-12` / `KG-18` rows.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **1,012 / 2,715
    (37.3%)** to **1,016 / 2,715 (37.4%)**.
  - Overall datasheet coverage increased from **2,181 / 2,715 (80.3%)** to
    **2,185 / 2,715 (80.5%)**.
  - PDF links / unique stored files increased to **3,805 / 1,298**.
  - Generated Haifeng model datasheet links remain **0**.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **1,016**.
  - Additional required verified one-row datasheet links: **1,156**.

## 2026-08-02 PSI Official Legacy Gas Spec-Sheet Import

- Source discovery:
  - PSI's public WordPress media API exposed current PSI-hosted PDF spec sheets
    for `3.0L` and `8.1L` gas engines under
    `https://psiengines.com/wp-content/uploads/2025/08/`.
- Accepted and imported:
  - `psi-legacy-3-0l-l4`:
    `https://psiengines.com/wp-content/uploads/2025/08/PSI-PSYSTEMS_3.0L-Gas_Engine.pdf`,
    stored as `psi/official-legacy-gas-spec-sheets/3-0l-gas-engine.pdf`.
  - `psi-legacy-gm-8-1l-v8`:
    `https://psiengines.com/wp-content/uploads/2025/08/PSI-PSYSTEMS_8.1L-Gas_Engine.pdf`,
    stored as `psi/official-legacy-gas-spec-sheets/8-1l-gas-engine.pdf`.
- Verification:
  - Both downloads began with `%PDF`.
  - `pdftotext -layout` found the underlying exact PSI engine model (`3.0L`
    or `8.1L`), `ENGINE DATA`, `Model Number`, `Naturally aspirated`, fuel
    tokens, and `Power Solutions International`.
  - The importer rejects neighboring PSI data-sheet heading tokens such as
    `PSI 5.7-LITER`, `PSI 8.8-LITER`, `PSI 13-LITER`, and the opposite
    `3.0L` / `8.1L` heading before upload/linking. A generic PSI product-line
    sentence mentioning broad displacements is not treated as a sibling data
    table.
  - Script:
    `data/attach-psi-official-legacy-gas-spec-sheets-2026-08.mjs`.
- Post-apply coverage refresh:
  - Dedicated/exclusive datasheet coverage increased from **1,016 / 2,715
    (37.4%)** to **1,018 / 2,715 (37.5%)**.
  - Overall datasheet coverage increased from **2,185 / 2,715 (80.5%)** to
    **2,187 / 2,715 (80.6%)**.
  - PDF links / unique stored files increased to **3,807 / 1,300**.
  - Generated Haifeng model datasheet links remain **0**.
- Remaining target delta:
  - The 80% row-exclusive target requires **2,172** exclusive rows.
  - Current verified exclusive rows: **1,018**.
  - Additional required verified one-row datasheet links: **1,154**.
- Cummins GGHG WSG-1068:
  - Source page:
    `https://generatorsource.com/brands/cummins/`.
  - Accepted direct public Cummins PDF:
    `https://picgeneratorsource.com/specs/Cummins-85-GGHG.pdf`.
  - Verification: response begins with `%PDF`; extracted text contains
    `Generator set data sheet`, `Model: GGHG`, `Engine model WSG-1068`,
    `power.cummins.com`, `Cummins Inc.`, and bulletin `D-3384`.
  - Sibling rejection: the importer rejects adjacent/sibling gas package tokens
    including `GGHE`, `GGHF`, `GGHH`, `GGHJ`, `GGLA`, `GGLB`, `GGMC`, and
    `GGPC`. Spot checks rejected the Generator Source `GGHF` sheet because it
    covers both `GGHE` and `GGHF`, and rejected the `QSV91G` sheet because it is
    a QSV91 series/range specification sheet.
  - Imported with
    `data/attach-cummins-gghg-wsg1068-data-sheet-2026-08.mjs`, storing
    `cummins/gas/exact-data-sheets/gghg-wsg1068-generator-set-data-sheet.pdf`.
- Follow-up strict source sweep after the GGHG import:
  - Generator Source / Cummins: scanned all 64 direct
    `picgeneratorsource.com/specs/*.pdf` files against current Cummins
    missing-exclusive model tokens. Accepted 0. Sampled PDFs were real
    Cummins-authored `%PDF` sheets, but contained non-current or sibling/range
    engine tokens such as `QSM11-G4`, `QSK23-G7 NR2`, `QST30-G5 NR2`,
    `QSL9-G9`, `QSK78-G14`, or broad `4BT3.9 series`; no current missing
    Cummins row token matched exactly.
  - Mitsubishi: searched current `-C` rows including `S6R2-PTAA-C`,
    `S16R2-PTAW-C`, and `S16R2-PTAW2-E-C`. Scribd-hosted Mitsubishi-looking
    sheets were rejected as mirrors; Pauway direct PDFs were verified as real
    PDFs but rejected as Pauway generator-package sheets, not Mitsubishi-authored
    engine datasheets.
  - Origin Engines, Mesa, DNGV, Yanmar, Shibaura, Hino, Yangdong/JDP/Lion,
    Komatsu, FPT, John Deere, Jenbacher, Kohler/Rehlko, and Baudouin spot
    checks accepted 0. Public sources exposed exact HTML specs, shared family or
    type sheets, manuals, case studies, ecommerce/vendor pages, or mirrored
    documents, but no verified public OEM/model-specific PDF suitable for the
    row-exclusive metric.

## 2026-08-02 Hyundai / Doosan G-Drive Spec-Sheet Import

- Accepted and linked two public distributor-hosted, Doosan-authored, exact
  model G-Drive spec sheets for current Hyundai no-datasheet rows:
  - `hyundai/doosan-gdrive-spec-sheets/p180fe-gdrive-spec-sheet.pdf` from
    `https://thtsales.com.au/wp-content/uploads/2016/10/P180FE-1.pdf`.
  - `hyundai/doosan-gdrive-spec-sheets/p222fe-gdrive-spec-sheet.pdf` from
    `https://www.tradekorea.com/product/download.do?productfileno=828`.
- Source-page provenance:
  - THT Sales product page exposes `P180FE Specifications Sheet` on the
    `P180FE` G-Drive page.
  - tradeKorea product page exposes `11_P222FE.pdf` and describes it as P222FE
    engine specifications.
- Verification:
  - Both downloads began with `%PDF`.
  - `P180FE` extracted with `pdftotext -layout`, containing `DOOSAN INFRACORE
    GENERATOR ENGINE`, exact `Engine Model P180FE`, `Large Engine Design
    Team_P180FE_F`, and specifications/provenance footer tokens.
  - `P222FE` is image-based; `pdftoppm` + `tesseract --psm 6` found exact
    `P222FE G-DRIVE`, `Engine Model P222FE`, `DOOSAN`, `Infracore`, and
    specifications footer tokens.
  - Importer rejects sibling tokens between `P180FE` and `P222FE`.
- Imported with
  `data/attach-hyundai-doosan-gdrive-spec-sheets-2026-08.mjs`.

## 2026-08-02 Scania Kaihua DC16 Gap Spec-Sheet Import

- Accepted and linked two distributor-hosted, Scania-authored, exact DC16
  power-generation spec sheets from Kaihua public download records:
  - `scania/kaihua-official-spec-sheets/dc16-093a-02-51-447kw.pdf` from
    `https://hkimg.bjyyb.net/sites/95000/95303/20250827220113202.pdf`.
  - `scania/kaihua-official-spec-sheets/dc16-078a-02-44-644kw.pdf` from
    `https://hkimg.bjyyb.net/sites/95000/95303/20250827215557562.pdf`.
- Source-page provenance:
  - Kaihua listing row for `447kW SCANIA DC16 093A 02-51 Datasheet` exposes
    `Home/Download/did/97968/relation_id/409794`; its download interstitial
    names `447kW SCANIA DC16 093A 02-51 Datasheet.pdf` and the exact PDF URL.
  - Kaihua listing row for `644kW SCANIA DC16 078A 02-44 Datasheet` exposes
    `Home/Download/did/97888/relation_id/409714`; its download interstitial
    names `644kW SCANIA DC16 078A 02-44 Datasheet.pdf` and the exact PDF URL.
- Verification:
  - Both downloads began with `%PDF`.
  - `pdftotext -layout` found Scania-authored provenance and spec/rating tokens:
    `SCANIA POWER GENERATION ENGINES`, `DC16 093A. 447-496 kW`, `501-567 kVA`,
    `Scania CV AB`, and `engines@scania.com` in the `DC16 093A 02-51` PDF;
    `Scania POWER GENERATION engine`, `DC16 078A. 725-800 kVA`, `640-706 kW`,
    `Scania developed Engine Management System`, and `Technical data` in the
    `DC16 078A 02-44` PDF.
  - Importer rejects current sibling Scania model tokens before upload/linking.
  - `DC16 078A 02-45` was searched in the same Kaihua index/page flow; no public
    exact download endpoint was found, so no file was linked for that row.
- Imported with
  `data/attach-scania-kaihua-official-dc16-gap-spec-sheets-2026-08.mjs`.
- Post-apply verification:
  - `node data/pdf-coverage.mjs`: dedicated/exclusive datasheet coverage is
    **1,023 / 2,715 (37.7%)**; overall datasheet coverage remains
    **2,190 / 2,715 (80.7%)**; PDF links / unique stored files are
    **3,812 / 1,305**; generated Haifeng model datasheet links remain **0**.
  - `npm run test:database` passed with 2,715 engines, 149 alternators,
    3,812 PDF links, and 75 engine brands.
  - `npm run data:qa` completed with the existing 4 catalog issues.

## 2026-08-02 Kirloskar KFP4R-UF15 Rejection

- Checked the public Kirloskar test host directory surfaced by search:
  `https://testkfp.kirloskar.com/Resources/Themes/1/pdfs/Certifications/`.
- Downloaded and verified two real `%PDF` KOEL/Kirloskar files:
  - `Engine data sheet for KFP4R-UF15.pdf`
  - `Specification sheet for KFP4R-UF15.pdf`
- Rejected for current Kirloskar missing-exclusive rows because extracted text
  identifies the basic engine model as `KFP4R-UF15`, not current row model
  `4R1040TA`; neither extracted PDF text contains `4R1040TA` or `4R1040`.
- The separate directory entry
  `Engine materials and Construction for KFP4R-UF15(4R1040TA).pdf` returned
  404 when requested directly, so no Kirloskar file was imported.
