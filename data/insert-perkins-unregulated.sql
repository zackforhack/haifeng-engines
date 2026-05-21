-- Insert Perkins unregulated engine data
-- Source: 2026年珀金斯发动机选型表-无排放.pdf
-- 50Hz @ 1500 rpm, 60Hz @ 1800 rpm
-- Columns: prime_power_kw = Net Engine Prime kWm, standby_power_kw = Net Engine Standby kWm

INSERT INTO engines (
  slug, brand, model, series, status,
  fuel_type, ignition_type, cooling_method,
  rpm_rated,
  prime_power_kw_50hz,  standby_power_kw_50hz,
  prime_power_kwe_50hz, prime_power_kva_50hz,
  standby_power_kwe_50hz, standby_power_kva_50hz,
  prime_power_kw_60hz,  standby_power_kw_60hz,
  prime_power_kwe_60hz, prime_power_kva_60hz,
  standby_power_kwe_60hz, standby_power_kva_60hz
) VALUES

-- ── 400 Series ───────────────────────────────────────────────────────────────
('perkins-403d-11g',   'Perkins', '403D-11G',   '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500,  8,  9,  7,  9,  8, 10,  10, 11,  9, 11, 10, 12),
('perkins-403d-15g',   'Perkins', '403D-15G',   '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 12, 13, 10, 13, 12, 15,  14, 16, 13, 16, 14, 18),
('perkins-403a-15g2',  'Perkins', '403A-15G2',  '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 14, 15, 12, 15, 13, 16,  16, 18, 14, 18, 16, 20),
('perkins-404d-22g',   'Perkins', '404D-22G',   '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 18, 20, 16, 20, 18, 22,  22, 24, 19, 24, 21, 27),
('perkins-404d-22tg',  'Perkins', '404D-22TG',  '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 25, 27, 22, 27, 24, 30,  30, 33, 26, 33, 29, 36),

-- ── 1100 Series ──────────────────────────────────────────────────────────────
('perkins-1103a-33g',   'Perkins', '1103A-33G',   '1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500,  28,  30,  24,  30,  26,  33,  32,  35,  28,  35,  31,  38),
('perkins-1103a-33tg1', 'Perkins', '1103A-33TG1', '1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500,  42,  46,  36,  45,  40,  50,  49,  54,  43,  53,  47,  59),
('perkins-1103a-33tg2', 'Perkins', '1103A-33TG2', '1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500,  54,  59,  48,  60,  53,  66,  61,  68,  55,  68,  60,  75),
('perkins-1104a-44tg1', 'Perkins', '1104A-44TG1', '1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500,  58,  64,  52,  65,  57,  72,  69,  76,  61,  76,  67,  84),
('perkins-1104a-44tg2', 'Perkins', '1104A-44TG2', '1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500,  72,  79,  64,  80,  70,  88,  82,  90,  73,  91,  80, 100),
('perkins-1104c-44tag2','Perkins', '1104C-44TAG2','1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500,  90, 100,  81, 101,  90, 112, 102, 112,  92, 114, 101, 127),
('perkins-1106a-70tg1', 'Perkins', '1106A-70TG1', '1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 118, 131, 108, 135, 120, 150, 134, 148, 122, 152, 135, 169),
('perkins-1106a-70tag2','Perkins', '1106A-70TAG2','1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 131, 144, 120, 150, 132, 165, 147, 164, 135, 169, 150, 188),
('perkins-1106a-70tag3','Perkins', '1106A-70TAG3','1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 158, 175, 144, 180, 160, 200, 173, 192, 158, 197, 175, 219),
('perkins-1106a-70tag4','Perkins', '1106A-70TAG4','1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 174, 191, 160, 200, 176, 220, NULL, NULL, NULL, NULL, NULL, NULL),

-- ── 1200 Series ──────────────────────────────────────────────────────────────
('perkins-1206a-e70ttag1','Perkins','1206A-E70TTAG1','1200 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 177, 196, 160, 200, 176, 220, 201, 223, 180, 225, 200, 250),
('perkins-1206a-e70ttag2','Perkins','1206A-E70TTAG2','1200 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 196, 218, 184, 225, 200, 250, NULL, NULL, NULL, NULL, NULL, NULL),
('perkins-1206a-e70ttag3','Perkins','1206A-E70TTAG3','1200 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 218, 240, 200, 250, 220, 275, NULL, NULL, NULL, NULL, NULL, NULL),

-- ── 1700 Series ──────────────────────────────────────────────────────────────
('perkins-1706a-e93tag1','Perkins','1706A-E93TAG1','1700 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 267, 295, 246, 307, 286, 357, 311, 343, 286, 357, 316, 395),
('perkins-1706a-e93tag2','Perkins','1706A-E93TAG2','1700 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 302, 334, 278, 348, 286, 357, NULL, NULL, NULL, NULL, NULL, NULL),

-- ── 2200 Series ──────────────────────────────────────────────────────────────
-- 2206C-E13TAG2 and TAG3 share the same 60Hz rating in the catalog
('perkins-2206c-e13tag2','Perkins','2206C-E13TAG2','2200 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 305, 349, 280, 350, 320, 400, 349, 381, 320, 400, 350, 438),
('perkins-2206c-e13tag3','Perkins','2206C-E13TAG3','2200 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 349, 392, 320, 400, 360, 450, 349, 381, 320, 400, 350, 438),
-- 2206C-E13TAG5 (50Hz) / 2206A-E13TAG5 (60Hz catalog name) — same physical engine family
('perkins-2206c-e13tag5','Perkins','2206C-E13TAG5','2200 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 396, 435, 364, 455, 400, 500, 349, 381, 320, 400, 350, 438),
-- 2206A-E13TAG6 — 60Hz only in catalog
('perkins-2206a-e13tag6','Perkins','2206A-E13TAG6','2200 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1800, NULL, NULL, NULL, NULL, NULL, NULL, 381, 435, 350, 438, 400, 500),

-- ── 2500 Series ──────────────────────────────────────────────────────────────
-- 2506C-E15TAG1 and TAG2 share the same 60Hz rating in the catalog
('perkins-2506c-e15tag1','Perkins','2506C-E15TAG1','2500 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 396, 435, 364, 455, 400, 500, 435, 490, 400, 500, 450, 563),
('perkins-2506c-e15tag2','Perkins','2506C-E15TAG2','2500 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 435, 478, 400, 500, 440, 550, 435, 490, 400, 500, 450, 563),
-- 2506C-E15TAG3 and TAG4 — 60Hz only in catalog
('perkins-2506c-e15tag3','Perkins','2506C-E15TAG3','2500 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1800, NULL, NULL, NULL, NULL, NULL, NULL, 509, 562, 468, 585, 517, 646),
-- TAG4 is standby-only at 60Hz
('perkins-2506c-e15tag4','Perkins','2506C-E15TAG4','2500 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1800, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 597, NULL, NULL, 550, 687),

-- ── 2800 Series ──────────────────────────────────────────────────────────────
('perkins-2806c-e18tag1a','Perkins','2806C-E18TAG1A','2800 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 514, 565, 473, 591, 520, 650, 543, 598, 500, 625, 550, 687),
('perkins-2806a-e18tag2', 'Perkins','2806A-E18TAG2', '2800 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 565, 609, 520, 650, 560, 700, 543, 598, 500, 625, 550, 687),
-- 2806A/C-E18TAG3 — 60Hz only
('perkins-2806a-e18tag3', 'Perkins','2806A-E18TAG3', '2800 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1800, NULL, NULL, NULL, NULL, NULL, NULL, 592, 652, 545, 681, 600, 750),
-- TTAG4 and TTAG5 share the same 60Hz rating in the catalog
('perkins-2806a-e18ttag4','Perkins','2806A-E18TTAG4','2800 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 595, 657, 565, 706, 624, 780, 675, 748, 642, 802, 710, 888),
('perkins-2806a-e18ttag5','Perkins','2806A-E18TTAG5','2800 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 648, 716, 616, 770, 680, 850, 675, 748, 642, 802, 710, 888),
-- TTAG6 and TTAG7 — 60Hz only
('perkins-2806a-e18ttag6','Perkins','2806A-E18TTAG6','2800 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1800, NULL, NULL, NULL, NULL, NULL, NULL, 685, 754, 650, 813, 716, 895),
('perkins-2806a-e18ttag7','Perkins','2806A-E18TTAG7','2800 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1800, NULL, NULL, NULL, NULL, NULL, NULL, 716, 790, 680, 850, 750, 938),

-- ── 4006 / 4008 / 4012 Series ────────────────────────────────────────────────
('perkins-4006-23tag2a','Perkins','4006-23TAG2A','4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500,  628,  691,  597,  746,  656,  820,  638,  702,  600,  750,  660,  825),
('perkins-4006-23tag3a','Perkins','4006-23TAG3A','4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500,  675,  756,  641,  802,  718,  898,  715,  795,  680,  850,  755,  944),
('perkins-4008tag1a',   'Perkins','4008TAG1A',   '4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500,  767,  844,  728,  911,  802, 1002,  763,  843,  707,  884,  780,  975),
('perkins-4008tag2a',   'Perkins','4008TAG2A',   '4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500,  861,  947,  818, 1022,  900, 1125, NULL, NULL, NULL, NULL, NULL, NULL),
('perkins-4008tag2',    'Perkins','4008TAG2',    '4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500,  861,  947,  818, 1022,  900, 1125,  842,  948,  796,  995,  878, 1097),
('perkins-4008-30tag3', 'Perkins','4008-30TAG3', '4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500,  947, 1055,  900, 1125, 1000, 1250, NULL, NULL, NULL, NULL, NULL, NULL),
('perkins-4012-46twg2a','Perkins','4012-46TWG2A','4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 1055, 1166, 1002, 1253, 1108, 1385, 1055, 1166, 1002, 1253, 1108, 1385),
('perkins-4012-46twg3a','Perkins','4012-46TWG3A','4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 1149, 1263, 1092, 1364, 1200, 1500, 1149, 1263, 1092, 1364, 1200, 1500),
('perkins-4012-46tag2a','Perkins','4012-46TAG2A','4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 1267, 1395, 1200, 1500, 1320, 1650, 1272, 1399, 1208, 1511, 1329, 1661),
('perkins-4012-46tag3a','Perkins','4012-46TAG3A','4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 1440, 1583, 1368, 1710, 1504, 1880, 1440, 1583, 1368, 1710, 1504, 1880),

-- ── 4016 Series (50Hz only in catalog) ───────────────────────────────────────
('perkins-4016tag1a',   'Perkins','4016TAG1A',   '4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 1537, 1690, 1476, 1844, 1622, 2028, NULL, NULL, NULL, NULL, NULL, NULL),
('perkins-4016-61trg1', 'Perkins','4016-61TRG1', '4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 1558, 1648, 1480, 1850, 1600, 2000, NULL, NULL, NULL, NULL, NULL, NULL),
('perkins-4016-61trg2', 'Perkins','4016-61TRG2', '4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 1684, 1895, 1600, 2000, 1800, 2250, NULL, NULL, NULL, NULL, NULL, NULL),
('perkins-4016tag2a',   'Perkins','4016TAG2A',   '4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 1715, 1886, 1646, 2058, 1811, 2263, NULL, NULL, NULL, NULL, NULL, NULL),
('perkins-4016-61trg3', 'Perkins','4016-61TRG3', '4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 1875, 2083, 1800, 2250, 2000, 2500, NULL, NULL, NULL, NULL, NULL, NULL),
-- TRG3X: Data Centre Power (DCP) — prime-only, no standby rating
('perkins-4016-61trg3x','Perkins','4016-61TRG3X','4000 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 2083, NULL, 2000, 2500, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)

ON CONFLICT (slug) DO UPDATE SET
  prime_power_kw_50hz    = EXCLUDED.prime_power_kw_50hz,
  standby_power_kw_50hz  = EXCLUDED.standby_power_kw_50hz,
  prime_power_kwe_50hz   = EXCLUDED.prime_power_kwe_50hz,
  prime_power_kva_50hz   = EXCLUDED.prime_power_kva_50hz,
  standby_power_kwe_50hz = EXCLUDED.standby_power_kwe_50hz,
  standby_power_kva_50hz = EXCLUDED.standby_power_kva_50hz,
  prime_power_kw_60hz    = EXCLUDED.prime_power_kw_60hz,
  standby_power_kw_60hz  = EXCLUDED.standby_power_kw_60hz,
  prime_power_kwe_60hz   = EXCLUDED.prime_power_kwe_60hz,
  prime_power_kva_60hz   = EXCLUDED.prime_power_kva_60hz,
  standby_power_kwe_60hz = EXCLUDED.standby_power_kwe_60hz,
  standby_power_kva_60hz = EXCLUDED.standby_power_kva_60hz,
  series                 = EXCLUDED.series,
  status                 = EXCLUDED.status,
  fuel_type              = EXCLUDED.fuel_type,
  ignition_type          = EXCLUDED.ignition_type,
  cooling_method         = EXCLUDED.cooling_method,
  rpm_rated              = EXCLUDED.rpm_rated;
