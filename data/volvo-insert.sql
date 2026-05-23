-- Volvo Penta Diesel Generator Engines
-- Source: 2026 Volvo Engine Selector (version 2024.10)
-- power_kw = Standby mechanical power (kWm) at 50Hz/1500rpm unless noted
-- Run this in your Supabase SQL Editor

INSERT INTO engines (slug, brand, model, series, status, power_kw, displacement_l, cylinders, configuration, rpm_rated, emissions_standard, description) VALUES

-- ============================================================
-- 5 LITRE SERIES (Stage V / Tier 4f)
-- ============================================================
('volvo-penta-tad580ve',  'Volvo Penta', 'TAD580VE',  '5 Litre Series',  'active',  94,  5.0, 6, 'Inline-6', 1500, 'Stage V / Tier 4f', 'Turbocharged air-to-air intercooled 5 litre diesel engine for generator sets. 94 kWm standby at 50Hz.'),
('volvo-penta-tad581ve',  'Volvo Penta', 'TAD581VE',  '5 Litre Series',  'active', 114,  5.0, 6, 'Inline-6', 1500, 'Stage V',           'Turbocharged air-to-air intercooled 5 litre diesel engine for generator sets. 114 kWm standby at 50Hz.'),
('volvo-penta-tad582ve',  'Volvo Penta', 'TAD582VE',  '5 Litre Series',  'active', 129,  5.0, 6, 'Inline-6', 1500, 'Stage V / Tier 4f', 'Turbocharged air-to-air intercooled 5 litre diesel engine for generator sets. 129 kWm standby at 50Hz.'),

-- ============================================================
-- 8 LITRE SERIES (Stage II)
-- ============================================================
('volvo-penta-tad840ge-b', 'Volvo Penta', 'TAD840GE-B', '8 Litre Series', 'active', 194, 7.7, 6, 'Inline-6', 1500, 'Stage II / Tier 2',  'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. 194 kWm standby at 50Hz.'),
('volvo-penta-tad841ge',   'Volvo Penta', 'TAD841GE',   '8 Litre Series', 'active', 242, 7.7, 6, 'Inline-6', 1500, 'Stage II / Tier 2',  'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. 242 kWm standby at 50Hz.'),
('volvo-penta-tad842ge',   'Volvo Penta', 'TAD842GE',   '8 Litre Series', 'active', 287, 7.7, 6, 'Inline-6', 1500, 'Stage II / Tier 2',  'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. 287 kWm standby at 50Hz.'),
('volvo-penta-tad843ge',   'Volvo Penta', 'TAD843GE',   '8 Litre Series', 'active', 308, 7.7, 6, 'Inline-6', 1500, 'Stage II / Tier 2',  'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. 308 kWm standby at 50Hz.'),

-- ============================================================
-- 8 LITRE SERIES (Stage IIIA / Tier 3)
-- ============================================================
('volvo-penta-tad851ge', 'Volvo Penta', 'TAD851GE', '8 Litre Series', 'active', 242, 7.7, 6, 'Inline-6', 1500, 'Stage IIIA / Tier 3', 'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. 242 kWm standby at 50Hz.'),
('volvo-penta-tad852ge', 'Volvo Penta', 'TAD852GE', '8 Litre Series', 'active', 273, 7.7, 6, 'Inline-6', 1500, 'Stage IIIA / Tier 3', 'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. 273 kWm standby at 50Hz.'),
('volvo-penta-tad853ge', 'Volvo Penta', 'TAD853GE', '8 Litre Series', 'active', 273, 7.7, 6, 'Inline-6', 1500, 'Stage IIIA / Tier 3', 'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. 273 kWm standby at 50Hz.'),

-- ============================================================
-- 8 LITRE SERIES (Stage V)
-- ============================================================
('volvo-penta-tad880ge', 'Volvo Penta', 'TAD880GE', '8 Litre Series', 'active', 142, 7.7, 6, 'Inline-6', 1500, 'Stage V', 'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. 142 kWm standby at 50Hz.'),
('volvo-penta-tad881ge', 'Volvo Penta', 'TAD881GE', '8 Litre Series', 'active', 189, 7.7, 6, 'Inline-6', 1500, 'Stage V', 'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. 189 kWm standby at 50Hz.'),
('volvo-penta-tad882ge', 'Volvo Penta', 'TAD882GE', '8 Litre Series', 'active', 237, 7.7, 6, 'Inline-6', 1500, 'Stage V', 'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. 237 kWm standby at 50Hz.'),

-- ============================================================
-- 8 LITRE SERIES (Tier 4f — 60Hz / North America)
-- ============================================================
('volvo-penta-tad880ve', 'Volvo Penta', 'TAD880VE', '8 Litre Series', 'active', 149, 7.7, 6, 'Inline-6', 1500, 'Tier 4f', 'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. Tier 4 Final certified. 149 kWm standby at 50Hz.'),
('volvo-penta-tad881ve', 'Volvo Penta', 'TAD881VE', '8 Litre Series', 'active', 168, 7.7, 6, 'Inline-6', 1800, 'Tier 4f', 'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. Tier 4 Final certified. 168 kWm standby at 60Hz.'),
('volvo-penta-tad882ve', 'Volvo Penta', 'TAD882VE', '8 Litre Series', 'active', 192, 7.7, 6, 'Inline-6', 1800, 'Tier 4f', 'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. Tier 4 Final certified. 192 kWm standby at 60Hz.'),
('volvo-penta-tad883ve', 'Volvo Penta', 'TAD883VE', '8 Litre Series', 'active', 216, 7.7, 6, 'Inline-6', 1800, 'Tier 4f', 'Turbocharged air-to-air intercooled 8 litre diesel engine for generator sets. Tier 4 Final certified. 216 kWm standby at 60Hz.'),

-- ============================================================
-- 11 LITRE SERIES (Tier 4f)
-- ============================================================
('volvo-penta-tad1181ve', 'Volvo Penta', 'TAD1181VE', '11 Litre Series', 'active', 245, 11.0, 6, 'Inline-6', 1500, 'Tier 4f / Stage V', 'Turbocharged air-to-air intercooled 11 litre diesel engine for generator sets. Tier 4 Final certified. 245 kWm standby at 50Hz.'),

-- ============================================================
-- 13 LITRE SERIES (Stage II)
-- ============================================================
('volvo-penta-tad1341ge-b', 'Volvo Penta', 'TAD1341GE-B', '13 Litre Series', 'active', 302, 12.8, 6, 'Inline-6', 1500, 'Stage II / Tier 2',  '13 litre diesel engine for generator sets. Stage II certified. 302 kWm standby at 50Hz.'),
('volvo-penta-tad1342ge-b', 'Volvo Penta', 'TAD1342GE-B', '13 Litre Series', 'active', 333, 12.8, 6, 'Inline-6', 1500, 'Stage II / Tier 2',  '13 litre diesel engine for generator sets. Stage II certified. 333 kWm standby at 50Hz.'),
('volvo-penta-tad1343ge-b', 'Volvo Penta', 'TAD1343GE-B', '13 Litre Series', 'active', 356, 12.8, 6, 'Inline-6', 1500, 'Stage II / Tier 2',  '13 litre diesel engine for generator sets. Stage II certified. 356 kWm standby at 50Hz.'),
('volvo-penta-tad1344ge-b', 'Volvo Penta', 'TAD1344GE-B', '13 Litre Series', 'active', 389, 12.8, 6, 'Inline-6', 1500, 'Stage II / Tier 2',  '13 litre diesel engine for generator sets. Stage II certified. 389 kWm standby at 50Hz.'),
('volvo-penta-tad1345ge-b', 'Volvo Penta', 'TAD1345GE-B', '13 Litre Series', 'active', 431, 12.8, 6, 'Inline-6', 1500, 'Stage II / Tier 2',  '13 litre diesel engine for generator sets. 431 kWm standby at 50Hz.'),
('volvo-penta-tad1346ge',   'Volvo Penta', 'TAD1346GE',   '13 Litre Series', 'active', 470, 12.8, 6, 'Inline-6', 1500, 'Stage II / Tier 2',  '13 litre diesel engine for generator sets. 470 kWm standby at 50Hz.'),

-- ============================================================
-- 13 LITRE SERIES (Stage IIIA / Tier 3)
-- ============================================================
('volvo-penta-tad1350ge', 'Volvo Penta', 'TAD1350GE', '13 Litre Series', 'active', 269, 12.8, 6, 'Inline-6', 1500, 'Stage IIIA / Tier 3', '13 litre diesel engine for generator sets. Stage IIIA certified. 269 kWm standby at 50Hz.'),
('volvo-penta-tad1351ge', 'Volvo Penta', 'TAD1351GE', '13 Litre Series', 'active', 306, 12.8, 6, 'Inline-6', 1500, 'Stage IIIA / Tier 3', '13 litre diesel engine for generator sets. Stage IIIA certified. 306 kWm standby at 50Hz.'),
('volvo-penta-tad1352ge', 'Volvo Penta', 'TAD1352GE', '13 Litre Series', 'active', 345, 12.8, 6, 'Inline-6', 1500, 'Stage IIIA / Tier 3', '13 litre diesel engine for generator sets. Stage IIIA certified. 345 kWm standby at 50Hz.'),
('volvo-penta-tad1353ge', 'Volvo Penta', 'TAD1353GE', '13 Litre Series', 'active', 430, 12.8, 6, 'Inline-6', 1500, 'Stage IIIA / Tier 3', '13 litre diesel engine for generator sets. Stage IIIA certified. 430 kWm standby at 50Hz.'),
('volvo-penta-tad1354ge', 'Volvo Penta', 'TAD1354GE', '13 Litre Series', 'active', 361, 12.8, 6, 'Inline-6', 1500, 'Stage IIIA / Tier 3', '13 litre diesel engine for generator sets. Stage IIIA certified. 361 kWm standby at 50Hz.'),
('volvo-penta-tad1355ge', 'Volvo Penta', 'TAD1355GE', '13 Litre Series', 'active', 390, 12.8, 6, 'Inline-6', 1500, 'Stage IIIA / Tier 3', '13 litre diesel engine for generator sets. Stage IIIA certified. 390 kWm standby at 50Hz.'),

-- ============================================================
-- 13 LITRE SERIES (Stage V)
-- ============================================================
('volvo-penta-tad1380ge', 'Volvo Penta', 'TAD1380GE', '13 Litre Series', 'active', 286, 12.8, 6, 'Inline-6', 1500, 'Stage V', '13 litre diesel engine for generator sets. Stage V certified. 286 kWm standby at 50Hz.'),
('volvo-penta-tad1381ge', 'Volvo Penta', 'TAD1381GE', '13 Litre Series', 'active', 333, 12.8, 6, 'Inline-6', 1500, 'Stage V', '13 litre diesel engine for generator sets. Stage V certified. 333 kWm standby at 50Hz.'),
('volvo-penta-tad1382ge', 'Volvo Penta', 'TAD1382GE', '13 Litre Series', 'active', 374, 12.8, 6, 'Inline-6', 1500, 'Stage V', '13 litre diesel engine for generator sets. Stage V certified. 374 kWm standby at 50Hz.'),

-- ============================================================
-- 13 LITRE SERIES (Tier 4f — 60Hz / North America)
-- ============================================================
('volvo-penta-tad1381ve', 'Volvo Penta', 'TAD1381VE', '13 Litre Series', 'active', 256, 12.8, 6, 'Inline-6', 1800, 'Tier 4f', '13 litre diesel engine for generator sets. Tier 4 Final certified. 256 kWm standby at 60Hz.'),
('volvo-penta-tad1382ve', 'Volvo Penta', 'TAD1382VE', '13 Litre Series', 'active', 294, 12.8, 6, 'Inline-6', 1500, 'Tier 4f', '13 litre diesel engine for generator sets. Tier 4 Final certified. 294 kWm standby at 50Hz.'),
('volvo-penta-tad1383ve', 'Volvo Penta', 'TAD1383VE', '13 Litre Series', 'active', 314, 12.8, 6, 'Inline-6', 1800, 'Tier 4f', '13 litre diesel engine for generator sets. Tier 4 Final certified. 314 kWm standby at 60Hz.'),
('volvo-penta-tad1384ve', 'Volvo Penta', 'TAD1384VE', '13 Litre Series', 'active', 343, 12.8, 6, 'Inline-6', 1800, 'Tier 4f', '13 litre diesel engine for generator sets. Tier 4 Final certified. 343 kWm standby at 60Hz.'),
('volvo-penta-tad1385ve', 'Volvo Penta', 'TAD1385VE', '13 Litre Series', 'active', 373, 12.8, 6, 'Inline-6', 1500, 'Tier 4f', '13 litre diesel engine for generator sets. Tier 4 Final certified. 373 kWm standby at 50Hz.'),

-- ============================================================
-- 16 LITRE SERIES (Stage II)
-- ============================================================
('volvo-penta-tad1641ge-b', 'Volvo Penta', 'TAD1641GE-B', '16 Litre Series', 'active', 473, 16.1, 6, 'Inline-6', 1500, 'Stage II / Tier 2', '16 litre diesel engine for generator sets. Stage II certified. 473 kWm standby at 50Hz.'),
('volvo-penta-tad1642ge-b', 'Volvo Penta', 'TAD1642GE-B', '16 Litre Series', 'active', 554, 16.1, 6, 'Inline-6', 1500, 'Stage II / Tier 2', '16 litre diesel engine for generator sets. Stage II certified. 554 kWm standby at 50Hz.'),
('volvo-penta-twd1644ge',   'Volvo Penta', 'TWD1644GE',   '16 Litre Series', 'active', 610, 16.1, 6, 'Inline-6', 1500, 'Stage II / Tier 2', 'Turbocharged water-to-air intercooled 16 litre diesel engine for generator sets. 610 kWm standby at 50Hz.'),
('volvo-penta-twd1645ge',   'Volvo Penta', 'TWD1645GE',   '16 Litre Series', 'active', 655, 16.1, 6, 'Inline-6', 1500, 'Stage II / Tier 2', 'Turbocharged water-to-air intercooled 16 litre diesel engine for generator sets. 655 kWm standby at 50Hz.'),

-- ============================================================
-- 16 LITRE SERIES (Stage IIIA / Tier 3)
-- ============================================================
('volvo-penta-tad1650ge', 'Volvo Penta', 'TAD1650GE', '16 Litre Series', 'active', 433, 16.1, 6, 'Inline-6', 1500, 'Stage IIIA / Tier 3', '16 litre diesel engine for generator sets. Stage IIIA certified. 433 kWm standby at 50Hz.'),
('volvo-penta-tad1651ge', 'Volvo Penta', 'TAD1651GE', '16 Litre Series', 'active', 473, 16.1, 6, 'Inline-6', 1500, 'Stage IIIA / Tier 3', '16 litre diesel engine for generator sets. Stage IIIA certified. 473 kWm standby at 50Hz.'),
('volvo-penta-twd1652ge', 'Volvo Penta', 'TWD1652GE', '16 Litre Series', 'active', 557, 16.1, 6, 'Inline-6', 1500, 'Stage IIIA / Tier 3', 'Turbocharged water-to-air intercooled 16 litre diesel engine for generator sets. 557 kWm standby at 50Hz.'),
('volvo-penta-twd1653ge', 'Volvo Penta', 'TWD1653GE', '16 Litre Series', 'active', 604, 16.1, 6, 'Inline-6', 1500, 'Stage IIIA / Tier 3', 'Turbocharged water-to-air intercooled 16 litre diesel engine for generator sets. 604 kWm standby at 50Hz.'),

-- ============================================================
-- 17 LITRE SERIES
-- ============================================================
('volvo-penta-twd1744ge', 'Volvo Penta', 'TWD1744GE', '17 Litre Series', 'active', 709, 16.1, 6, 'Inline-6', 1500, 'Stage II / Tier 2', 'Turbocharged water-to-air intercooled high-output diesel engine for generator sets. 709 kWm standby at 50Hz.'),
('volvo-penta-twd1682ge', 'Volvo Penta', 'TWD1682GE', '17 Litre Series', 'active', 585, 16.1, 6, 'Inline-6', 1800, 'Tier 4f',            'Turbocharged water-to-air intercooled 17 litre diesel engine for generator sets. Tier 4 Final certified. 585 kWm standby at 60Hz.'),
('volvo-penta-twd1683ge', 'Volvo Penta', 'TWD1683GE', '17 Litre Series', 'active', 627, 16.1, 6, 'Inline-6', 1500, 'Stage V / Tier 4f',  'Turbocharged water-to-air intercooled 17 litre diesel engine for generator sets. Stage V and Tier 4 Final certified. 627 kWm standby at 50Hz.')

ON CONFLICT (slug) DO NOTHING;
