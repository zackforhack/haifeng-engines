-- Update Volvo Penta engines with detailed power ratings (kWm / kWe / kVA)
-- Source: 2026 Volvo Engine Selector (version 2024.10)
-- Run AFTER migration-power-ratings.sql

-- ============================================================
-- 5 LITRE SERIES
-- ============================================================
UPDATE engines SET
  prime_power_kw_50hz=86,  prime_power_kwe_50hz=80,  prime_power_kva_50hz=100,
  standby_power_kw_50hz=94, standby_power_kwe_50hz=86, standby_power_kva_50hz=107,
  prime_power_kw_60hz=86,  prime_power_kwe_60hz=80,  prime_power_kva_60hz=98,
  standby_power_kw_60hz=94, standby_power_kwe_60hz=86, standby_power_kva_60hz=107
WHERE slug='volvo-penta-tad580ve';

UPDATE engines SET
  prime_power_kw_50hz=104, prime_power_kwe_50hz=95,  prime_power_kva_50hz=118,
  standby_power_kw_50hz=114, standby_power_kwe_50hz=104, standby_power_kva_50hz=130
WHERE slug='volvo-penta-tad581ve';

UPDATE engines SET
  prime_power_kw_50hz=118, prime_power_kwe_50hz=108, prime_power_kva_50hz=135,
  standby_power_kw_50hz=129, standby_power_kwe_50hz=118, standby_power_kva_50hz=147,
  prime_power_kw_60hz=131, prime_power_kwe_60hz=120, prime_power_kva_60hz=150,
  standby_power_kw_60hz=144, standby_power_kwe_60hz=132, standby_power_kva_60hz=165
WHERE slug='volvo-penta-tad582ve';

-- ============================================================
-- 8 LITRE SERIES — Stage II
-- ============================================================
UPDATE engines SET
  prime_power_kw_50hz=177, prime_power_kwe_50hz=163, prime_power_kva_50hz=203,
  standby_power_kw_50hz=194, standby_power_kwe_50hz=178, standby_power_kva_50hz=223,
  prime_power_kw_60hz=194, prime_power_kwe_60hz=178, prime_power_kva_60hz=223,
  standby_power_kw_60hz=213, standby_power_kwe_60hz=196, standby_power_kva_60hz=245
WHERE slug='volvo-penta-tad840ge-b';

UPDATE engines SET
  prime_power_kw_50hz=220, prime_power_kwe_50hz=202, prime_power_kva_50hz=253,
  standby_power_kw_50hz=242, standby_power_kwe_50hz=223, standby_power_kva_50hz=278,
  prime_power_kw_60hz=225, prime_power_kwe_60hz=207, prime_power_kva_60hz=259,
  standby_power_kw_60hz=248, standby_power_kwe_60hz=228, standby_power_kva_60hz=285
WHERE slug='volvo-penta-tad841ge';

UPDATE engines SET
  prime_power_kw_50hz=261, prime_power_kwe_50hz=243, prime_power_kva_50hz=303,
  standby_power_kw_50hz=287, standby_power_kwe_50hz=267, standby_power_kva_50hz=334,
  prime_power_kw_60hz=261, prime_power_kwe_60hz=243, prime_power_kva_60hz=303,
  standby_power_kw_60hz=287, standby_power_kwe_60hz=267, standby_power_kva_60hz=334
WHERE slug='volvo-penta-tad842ge';

UPDATE engines SET
  prime_power_kw_50hz=280, prime_power_kwe_50hz=260, prime_power_kva_50hz=326,
  standby_power_kw_50hz=308, standby_power_kwe_50hz=286, standby_power_kva_50hz=359,
  prime_power_kw_60hz=274, prime_power_kwe_60hz=254, prime_power_kva_60hz=318,
  standby_power_kw_60hz=301, standby_power_kwe_60hz=280, standby_power_kva_60hz=350
WHERE slug='volvo-penta-tad843ge';

-- ============================================================
-- 8 LITRE SERIES — Stage IIIA
-- ============================================================
UPDATE engines SET
  prime_power_kw_50hz=220, prime_power_kwe_50hz=202, prime_power_kva_50hz=253,
  standby_power_kw_50hz=242, standby_power_kwe_50hz=223, standby_power_kva_50hz=278,
  prime_power_kw_60hz=225, prime_power_kwe_60hz=207, prime_power_kva_60hz=259,
  standby_power_kw_60hz=248, standby_power_kwe_60hz=228, standby_power_kva_60hz=285
WHERE slug='volvo-penta-tad851ge';

UPDATE engines SET
  prime_power_kw_50hz=248, prime_power_kwe_50hz=231, prime_power_kva_50hz=289,
  standby_power_kw_50hz=273, standby_power_kwe_50hz=254, standby_power_kva_50hz=317,
  prime_power_kw_60hz=247, prime_power_kwe_60hz=230, prime_power_kva_60hz=287,
  standby_power_kw_60hz=272, standby_power_kwe_60hz=253, standby_power_kva_60hz=316
WHERE slug='volvo-penta-tad852ge';

UPDATE engines SET
  prime_power_kw_50hz=248, prime_power_kwe_50hz=233, prime_power_kva_50hz=291,
  standby_power_kw_50hz=273, standby_power_kwe_50hz=257, standby_power_kva_50hz=321,
  prime_power_kw_60hz=266, prime_power_kwe_60hz=250, prime_power_kva_60hz=313,
  standby_power_kw_60hz=293, standby_power_kwe_60hz=275, standby_power_kva_60hz=344
WHERE slug='volvo-penta-tad853ge';

-- ============================================================
-- 8 LITRE SERIES — Stage V
-- ============================================================
UPDATE engines SET
  prime_power_kw_50hz=129, prime_power_kwe_50hz=120, prime_power_kva_50hz=150,
  standby_power_kw_50hz=142, standby_power_kwe_50hz=132, standby_power_kva_50hz=165
WHERE slug='volvo-penta-tad880ge';

UPDATE engines SET
  prime_power_kw_50hz=172, prime_power_kwe_50hz=160, prime_power_kva_50hz=200,
  standby_power_kw_50hz=189, standby_power_kwe_50hz=176, standby_power_kva_50hz=220
WHERE slug='volvo-penta-tad881ge';

UPDATE engines SET
  prime_power_kw_50hz=215, prime_power_kwe_50hz=200, prime_power_kva_50hz=250,
  standby_power_kw_50hz=237, standby_power_kwe_50hz=220, standby_power_kva_50hz=276
WHERE slug='volvo-penta-tad882ge';

-- ============================================================
-- 8 LITRE SERIES — Tier 4f
-- ============================================================
UPDATE engines SET
  prime_power_kw_50hz=135, prime_power_kwe_50hz=124, prime_power_kva_50hz=155,
  standby_power_kw_50hz=149, standby_power_kwe_50hz=137, standby_power_kva_50hz=171
WHERE slug='volvo-penta-tad880ve';

UPDATE engines SET
  prime_power_kw_60hz=153, prime_power_kwe_60hz=140, prime_power_kva_60hz=176,
  standby_power_kw_60hz=168, standby_power_kwe_60hz=154, standby_power_kva_60hz=193
WHERE slug='volvo-penta-tad881ve';

UPDATE engines SET
  prime_power_kw_50hz=163, prime_power_kwe_50hz=150, prime_power_kva_50hz=187,
  standby_power_kw_50hz=179, standby_power_kwe_50hz=165, standby_power_kva_50hz=206,
  prime_power_kw_60hz=175, prime_power_kwe_60hz=161, prime_power_kva_60hz=201,
  standby_power_kw_60hz=192, standby_power_kwe_60hz=177, standby_power_kva_60hz=221
WHERE slug='volvo-penta-tad882ve';

UPDATE engines SET
  prime_power_kw_60hz=197, prime_power_kwe_60hz=181, prime_power_kva_60hz=226,
  standby_power_kw_60hz=216, standby_power_kwe_60hz=198, standby_power_kva_60hz=248
WHERE slug='volvo-penta-tad883ve';

-- ============================================================
-- 11 LITRE SERIES — Tier 4f
-- ============================================================
UPDATE engines SET
  prime_power_kw_50hz=223, prime_power_kwe_50hz=207, prime_power_kva_50hz=259,
  standby_power_kw_50hz=245, standby_power_kwe_50hz=228, standby_power_kva_50hz=285,
  prime_power_kw_60hz=217, prime_power_kwe_60hz=200, prime_power_kva_60hz=250,
  standby_power_kw_60hz=238, standby_power_kwe_60hz=219, standby_power_kva_60hz=274
WHERE slug='volvo-penta-tad1181ve';

-- ============================================================
-- 13 LITRE SERIES — Stage II
-- ============================================================
UPDATE engines SET
  prime_power_kw_50hz=275, prime_power_kwe_50hz=255, prime_power_kva_50hz=319,
  standby_power_kw_50hz=302, standby_power_kwe_50hz=281, standby_power_kva_50hz=351,
  prime_power_kw_60hz=294, prime_power_kwe_60hz=273, prime_power_kva_60hz=342,
  standby_power_kw_60hz=324, standby_power_kwe_60hz=301, standby_power_kva_60hz=377
WHERE slug='volvo-penta-tad1341ge-b';

UPDATE engines SET
  prime_power_kw_50hz=303, prime_power_kwe_50hz=282, prime_power_kva_50hz=352,
  standby_power_kw_50hz=333, standby_power_kwe_50hz=310, standby_power_kva_50hz=387,
  prime_power_kw_60hz=345, prime_power_kwe_60hz=321, prime_power_kva_60hz=401,
  standby_power_kw_60hz=377, standby_power_kwe_60hz=351, standby_power_kva_60hz=438
WHERE slug='volvo-penta-tad1342ge-b';

UPDATE engines SET
  prime_power_kw_50hz=325, prime_power_kwe_50hz=302, prime_power_kva_50hz=378,
  standby_power_kw_50hz=356, standby_power_kwe_50hz=331, standby_power_kva_50hz=414,
  prime_power_kw_60hz=353, prime_power_kwe_60hz=328, prime_power_kva_60hz=410,
  standby_power_kw_60hz=388, standby_power_kwe_60hz=361, standby_power_kva_60hz=451
WHERE slug='volvo-penta-tad1343ge-b';

UPDATE engines SET
  prime_power_kw_50hz=354, prime_power_kwe_50hz=329, prime_power_kva_50hz=411,
  standby_power_kw_50hz=389, standby_power_kwe_50hz=362, standby_power_kva_50hz=452,
  prime_power_kw_60hz=392, prime_power_kwe_60hz=364, prime_power_kva_60hz=455,
  standby_power_kw_60hz=431, standby_power_kwe_60hz=401, standby_power_kva_60hz=501
WHERE slug='volvo-penta-tad1344ge-b';

UPDATE engines SET
  prime_power_kw_50hz=388, prime_power_kwe_50hz=365, prime_power_kva_50hz=456,
  standby_power_kw_50hz=431, standby_power_kwe_50hz=405, standby_power_kva_50hz=506,
  prime_power_kw_60hz=392, prime_power_kwe_60hz=368, prime_power_kva_60hz=460,
  standby_power_kw_60hz=431, standby_power_kwe_60hz=405, standby_power_kva_60hz=506
WHERE slug='volvo-penta-tad1345ge-b';

UPDATE engines SET
  prime_power_kw_50hz=427, prime_power_kwe_50hz=402, prime_power_kva_50hz=502,
  standby_power_kw_50hz=470, standby_power_kwe_50hz=442, standby_power_kva_50hz=552,
  prime_power_kw_60hz=436, prime_power_kwe_60hz=409, prime_power_kva_60hz=512,
  standby_power_kw_60hz=479, standby_power_kwe_60hz=450, standby_power_kva_60hz=563
WHERE slug='volvo-penta-tad1346ge';

-- ============================================================
-- 13 LITRE SERIES — Stage IIIA
-- ============================================================
UPDATE engines SET
  prime_power_kw_50hz=245, prime_power_kwe_50hz=227, prime_power_kva_50hz=284,
  standby_power_kw_50hz=269, standby_power_kwe_50hz=250, standby_power_kva_50hz=313
WHERE slug='volvo-penta-tad1350ge';

UPDATE engines SET
  prime_power_kw_50hz=279, prime_power_kwe_50hz=259, prime_power_kva_50hz=324,
  standby_power_kw_50hz=306, standby_power_kwe_50hz=285, standby_power_kva_50hz=356,
  prime_power_kw_60hz=294, prime_power_kwe_60hz=273, prime_power_kva_60hz=341,
  standby_power_kw_60hz=323, standby_power_kwe_60hz=300, standby_power_kva_60hz=375
WHERE slug='volvo-penta-tad1351ge';

UPDATE engines SET
  prime_power_kw_50hz=314, prime_power_kwe_50hz=292, prime_power_kva_50hz=365,
  standby_power_kw_50hz=345, standby_power_kwe_50hz=321, standby_power_kva_50hz=401,
  prime_power_kw_60hz=344, prime_power_kwe_60hz=320, prime_power_kva_60hz=400,
  standby_power_kw_60hz=376, standby_power_kwe_60hz=350, standby_power_kva_60hz=437
WHERE slug='volvo-penta-tad1352ge';

UPDATE engines SET
  prime_power_kw_50hz=391, prime_power_kwe_50hz=364, prime_power_kva_50hz=454,
  standby_power_kw_50hz=430, standby_power_kwe_50hz=400, standby_power_kva_50hz=500
WHERE slug='volvo-penta-tad1353ge';

UPDATE engines SET
  prime_power_kw_50hz=328, prime_power_kwe_50hz=305, prime_power_kva_50hz=381,
  standby_power_kw_50hz=361, standby_power_kwe_50hz=336, standby_power_kva_50hz=420,
  prime_power_kw_60hz=344, prime_power_kwe_60hz=320, prime_power_kva_60hz=400,
  standby_power_kw_60hz=376, standby_power_kwe_60hz=350, standby_power_kva_60hz=437
WHERE slug='volvo-penta-tad1354ge';

UPDATE engines SET
  prime_power_kw_50hz=355, prime_power_kwe_50hz=334, prime_power_kva_50hz=417,
  standby_power_kw_50hz=390, standby_power_kwe_50hz=367, standby_power_kva_50hz=458,
  prime_power_kw_60hz=344, prime_power_kwe_60hz=323, prime_power_kva_60hz=404,
  standby_power_kw_60hz=376, standby_power_kwe_60hz=353, standby_power_kva_60hz=442
WHERE slug='volvo-penta-tad1355ge';

-- ============================================================
-- 13 LITRE SERIES — Stage V
-- ============================================================
UPDATE engines SET
  prime_power_kw_50hz=260, prime_power_kwe_50hz=242, prime_power_kva_50hz=302,
  standby_power_kw_50hz=286, standby_power_kwe_50hz=266, standby_power_kva_50hz=332
WHERE slug='volvo-penta-tad1380ge';

UPDATE engines SET
  prime_power_kw_50hz=303, prime_power_kwe_50hz=282, prime_power_kva_50hz=352,
  standby_power_kw_50hz=333, standby_power_kwe_50hz=310, standby_power_kva_50hz=387
WHERE slug='volvo-penta-tad1381ge';

UPDATE engines SET
  prime_power_kw_50hz=340, prime_power_kwe_50hz=320, prime_power_kva_50hz=400,
  standby_power_kw_50hz=374, standby_power_kwe_50hz=352, standby_power_kva_50hz=440
WHERE slug='volvo-penta-tad1382ge';

-- ============================================================
-- 13 LITRE SERIES — Tier 4f
-- ============================================================
UPDATE engines SET
  prime_power_kw_60hz=233, prime_power_kwe_60hz=216, prime_power_kva_60hz=271,
  standby_power_kw_60hz=256, standby_power_kwe_60hz=238, standby_power_kva_60hz=297
WHERE slug='volvo-penta-tad1381ve';

UPDATE engines SET
  prime_power_kw_50hz=267, prime_power_kwe_50hz=250, prime_power_kva_50hz=312,
  standby_power_kw_50hz=294, standby_power_kwe_50hz=273, standby_power_kva_50hz=341,
  prime_power_kw_60hz=259, prime_power_kwe_60hz=241, prime_power_kva_60hz=301,
  standby_power_kw_60hz=284, standby_power_kwe_60hz=264, standby_power_kva_60hz=331
WHERE slug='volvo-penta-tad1382ve';

UPDATE engines SET
  prime_power_kw_60hz=286, prime_power_kwe_60hz=266, prime_power_kva_60hz=332,
  standby_power_kw_60hz=314, standby_power_kwe_60hz=292, standby_power_kva_60hz=365
WHERE slug='volvo-penta-tad1383ve';

UPDATE engines SET
  prime_power_kw_60hz=312, prime_power_kwe_60hz=290, prime_power_kva_60hz=363,
  standby_power_kw_60hz=343, standby_power_kwe_60hz=319, standby_power_kva_60hz=399
WHERE slug='volvo-penta-tad1384ve';

UPDATE engines SET
  prime_power_kw_50hz=339, prime_power_kwe_50hz=315, prime_power_kva_50hz=394,
  standby_power_kw_50hz=373, standby_power_kwe_50hz=347, standby_power_kva_50hz=433,
  prime_power_kw_60hz=334, prime_power_kwe_60hz=310, prime_power_kva_60hz=388,
  standby_power_kw_60hz=368, standby_power_kwe_60hz=343, standby_power_kva_60hz=427
WHERE slug='volvo-penta-tad1385ve';

-- ============================================================
-- 16 LITRE SERIES — Stage II
-- ============================================================
UPDATE engines SET
  prime_power_kw_50hz=430, prime_power_kwe_50hz=404, prime_power_kva_50hz=505,
  standby_power_kw_50hz=473, standby_power_kwe_50hz=445, standby_power_kva_50hz=556,
  prime_power_kw_60hz=485, prime_power_kwe_60hz=456, prime_power_kva_60hz=570,
  standby_power_kw_60hz=546, standby_power_kwe_60hz=513, standby_power_kva_60hz=642
WHERE slug='volvo-penta-tad1641ge-b';

UPDATE engines SET
  prime_power_kw_50hz=503, prime_power_kwe_50hz=473, prime_power_kva_50hz=591,
  standby_power_kw_50hz=554, standby_power_kwe_50hz=521, standby_power_kva_50hz=651,
  prime_power_kw_60hz=532, prime_power_kwe_60hz=500, prime_power_kva_60hz=625,
  standby_power_kw_60hz=585, standby_power_kwe_60hz=550, standby_power_kva_60hz=687
WHERE slug='volvo-penta-tad1642ge-b';

UPDATE engines SET
  prime_power_kw_50hz=555, prime_power_kwe_50hz=521, prime_power_kva_50hz=652,
  standby_power_kw_50hz=610, standby_power_kwe_50hz=573, standby_power_kva_50hz=717,
  prime_power_kw_60hz=582, prime_power_kwe_60hz=547, prime_power_kva_60hz=684,
  standby_power_kw_60hz=640, standby_power_kwe_60hz=602, standby_power_kva_60hz=752
WHERE slug='volvo-penta-twd1644ge';

UPDATE engines SET
  prime_power_kw_50hz=595, prime_power_kwe_50hz=560, prime_power_kva_50hz=700,
  standby_power_kw_50hz=655, standby_power_kwe_50hz=616, standby_power_kva_50hz=770,
  prime_power_kw_60hz=619, prime_power_kwe_60hz=582, prime_power_kva_60hz=727,
  standby_power_kw_60hz=681, standby_power_kwe_60hz=640, standby_power_kva_60hz=800
WHERE slug='volvo-penta-twd1645ge';

-- ============================================================
-- 16 LITRE SERIES — Stage IIIA
-- ============================================================
UPDATE engines SET
  prime_power_kw_50hz=393, prime_power_kwe_50hz=370, prime_power_kva_50hz=462,
  standby_power_kw_50hz=433, standby_power_kwe_50hz=407, standby_power_kva_50hz=508,
  prime_power_kw_60hz=439, prime_power_kwe_60hz=413, prime_power_kva_60hz=516,
  standby_power_kw_60hz=483, standby_power_kwe_60hz=454, standby_power_kva_60hz=568
WHERE slug='volvo-penta-tad1650ge';

UPDATE engines SET
  prime_power_kw_50hz=430, prime_power_kwe_50hz=404, prime_power_kva_50hz=505,
  standby_power_kw_50hz=473, standby_power_kwe_50hz=445, standby_power_kva_50hz=556,
  prime_power_kw_60hz=494, prime_power_kwe_60hz=464, prime_power_kva_60hz=580,
  standby_power_kw_60hz=546, standby_power_kwe_60hz=513, standby_power_kva_60hz=641
WHERE slug='volvo-penta-tad1651ge';

UPDATE engines SET
  prime_power_kw_50hz=505, prime_power_kwe_50hz=480, prime_power_kva_50hz=600,
  standby_power_kw_50hz=557, standby_power_kwe_50hz=529, standby_power_kva_50hz=661
WHERE slug='volvo-penta-twd1652ge';

UPDATE engines SET
  prime_power_kw_50hz=547, prime_power_kwe_50hz=520, prime_power_kva_50hz=650,
  standby_power_kw_50hz=604, standby_power_kwe_50hz=574, standby_power_kva_50hz=717
WHERE slug='volvo-penta-twd1653ge';

-- ============================================================
-- 17 LITRE SERIES
-- ============================================================
UPDATE engines SET
  prime_power_kw_50hz=645, prime_power_kwe_50hz=606, prime_power_kva_50hz=758,
  standby_power_kw_50hz=709, standby_power_kwe_50hz=666, standby_power_kva_50hz=833,
  prime_power_kw_60hz=682, prime_power_kwe_60hz=641, prime_power_kva_60hz=801,
  standby_power_kw_60hz=750, standby_power_kwe_60hz=705, standby_power_kva_60hz=881
WHERE slug='volvo-penta-twd1744ge';

UPDATE engines SET
  prime_power_kw_60hz=532, prime_power_kwe_60hz=508, prime_power_kva_60hz=635,
  standby_power_kw_60hz=585, standby_power_kwe_60hz=559, standby_power_kva_60hz=698
WHERE slug='volvo-penta-twd1682ge';

UPDATE engines SET
  prime_power_kw_50hz=570, prime_power_kwe_50hz=536, prime_power_kva_50hz=670,
  standby_power_kw_50hz=627, standby_power_kwe_50hz=589, standby_power_kva_50hz=737,
  prime_power_kw_60hz=595, prime_power_kwe_60hz=560, prime_power_kva_60hz=700,
  standby_power_kw_60hz=655, standby_power_kwe_60hz=616, standby_power_kva_60hz=770
WHERE slug='volvo-penta-twd1683ge';
