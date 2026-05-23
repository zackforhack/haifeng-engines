-- Insert Perkins regulated engine data
-- Sources:
--   50Hz: 2026年珀金斯发动机选型表-有排放.pdf  (EU Stage IIIA / Stage V)
--   60Hz: same PDF, page 2              (EPA Tier 2 / Tier 3 / Tier 4i / Tier 4 Final)
-- Columns: prime_power_kw = Net Engine Prime kWm, standby_power_kw = Net Engine Standby kWm

INSERT INTO engines (
  slug, brand, model, series, status,
  fuel_type, ignition_type, cooling_method,
  rpm_rated, emissions_standard,
  prime_power_kw_50hz,  standby_power_kw_50hz,
  prime_power_kwe_50hz, prime_power_kva_50hz,
  standby_power_kwe_50hz, standby_power_kva_50hz,
  prime_power_kw_60hz,  standby_power_kw_60hz,
  prime_power_kwe_60hz, prime_power_kva_60hz,
  standby_power_kwe_60hz, standby_power_kva_60hz
) VALUES

-- ── 400 Series — 50Hz ────────────────────────────────────────────────────────
-- 403J-07G: N/A <19kW (exempt); switchable 1500/1800
('perkins-403j-07g',     'Perkins', '403J-07G',     '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, NULL,
   5,  6,  5,  6,  5,  6,   NULL, NULL, NULL, NULL, NULL, NULL),

-- 403D-11G: N/A <19kW in 50Hz, Tier 4i ESE in 60Hz; switchable
('perkins-403d-11g',     'Perkins', '403D-11G',     '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage IIIA / EPA Tier 3',
   8,  9,  7,  9,  8, 10,   10, 11,  9, 11, 10, 12),

-- 403J-11G: Stage V; switchable
('perkins-403j-11g',     'Perkins', '403J-11G',     '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage V / EPA Tier 4 Final',
   8,  9,  7,  9,  8, 10,   NULL, NULL, NULL, NULL, NULL, NULL),

-- 403D-15G: N/A <19kW in 50Hz, Tier 4i ESE in 60Hz; switchable
('perkins-403d-15g',     'Perkins', '403D-15G',     '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage IIIA / EPA Tier 3',
  12, 13, 10, 13, 12, 15,   14, 16, 13, 16, 14, 18),

-- 404D-22G: Stage IIIA / Tier 4i ESE; switchable
('perkins-404d-22g',     'Perkins', '404D-22G',     '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage IIIA / EPA Tier 3',
  18, 20, 16, 20, 18, 22,   22, 24, 19, 24, 21, 27),

-- 404J-22G: Stage V; 50Hz only
('perkins-404j-22g',     'Perkins', '404J-22G',     '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage V / EPA Tier 4 Final',
  19, 21, 16, 20, 18, 22,   NULL, NULL, NULL, NULL, NULL, NULL),

-- 404J-E22TAG: Stage V / Tier 4 Final; switchable
('perkins-404j-e22tag',  'Perkins', '404J-E22TAG',  '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage V / EPA Tier 4 Final',
  38, 41, 32, 40, 35, 44,   45, 50, 36, 45, 40, 50),

-- ── 400 Series — 60Hz only ───────────────────────────────────────────────────
('perkins-402d-05g',     'Perkins', '402D-05G',     '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'EPA Tier 3',
   NULL, NULL, NULL, NULL, NULL, NULL,   5,  5,  4,  5,  4,  5),

('perkins-403d-07g',     'Perkins', '403D-07G',     '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'EPA Tier 3',
   NULL, NULL, NULL, NULL, NULL, NULL,   7,  7,  6,  7,  6,  8),

('perkins-403f-11g',     'Perkins', '403F-11G',     '400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'EPA Tier 4 Final',
   NULL, NULL, NULL, NULL, NULL, NULL,   9,  9,  7,  9,  8, 10),

-- ── 900 Series ───────────────────────────────────────────────────────────────
-- 904J-E36TAG1: Stage V / Tier 4 Final; switchable
('perkins-904j-e36tag1', 'Perkins', '904J-E36TAG1', '900 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage V / EPA Tier 4 Final',
  48, 53, 43, 54, 48, 60,   46, 51, 42, 52, 46, 58),

-- 904J-E36TAG3: Stage V; 50Hz only
('perkins-904j-e36tag3', 'Perkins', '904J-E36TAG3', '900 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage V / EPA Tier 4 Final',
  53, 58, 48, 60, 53, 66,   NULL, NULL, NULL, NULL, NULL, NULL),

-- ── 1100 Series — 50Hz ───────────────────────────────────────────────────────
('perkins-1103d-33g2',   'Perkins', '1103D-33G2',   '1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage IIIA / EPA Tier 3',
  29, 32, 25, 32, 28, 35,   NULL, NULL, NULL, NULL, NULL, NULL),

('perkins-1104d-44tg2',  'Perkins', '1104D-44TG2',  '1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage IIIA / EPA Tier 3',
  54, 59, 48, 60, 53, 66,   NULL, NULL, NULL, NULL, NULL, NULL),

-- 1104D-E44TAG1 / TAG2: Stage IIIA (50Hz), Tier 3 ESE (60Hz); switchable
('perkins-1104d-e44tag1','Perkins', '1104D-E44TAG1','1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage IIIA / EPA Tier 3',
  74, 81, 64, 80, 70, 88,   85, 93, 73, 91, 80, 100),

('perkins-1104d-e44tag2','Perkins', '1104D-E44TAG2','1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage IIIA / EPA Tier 3',
  91, 101, 80, 100, 88, 110,   104, 115, 91, 114, 100, 125),

-- ── 1100 Series — 60Hz only ──────────────────────────────────────────────────
-- 1104D-44TG1: standby-only rating at 60Hz
('perkins-1104d-44tg1',  'Perkins', '1104D-44TG1',  '1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'EPA Tier 3',
   NULL, NULL, NULL, NULL, NULL, NULL,   NULL, 63, NULL, NULL, 57, 71),

('perkins-1104d-e44tg1', 'Perkins', '1104D-E44TG1', '1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'EPA Tier 3',
   NULL, NULL, NULL, NULL, NULL, NULL,   65, 71, 55, 68, 60, 75),

-- ── 1100 Series — 1106D: Stage IIIA (50Hz) / Tier 3 ESE (60Hz); switchable ──
('perkins-1106d-e70tag2','Perkins', '1106D-E70TAG2','1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage IIIA / EPA Tier 3',
  129, 143, 117, 147, 130, 163,   145, 161, 132, 165, 147, 183),

('perkins-1106d-e70tag3','Perkins', '1106D-E70TAG3','1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage IIIA / EPA Tier 3',
  141, 156, 129, 161, 142, 177,   157, 173, 143, 178, 158, 197),

('perkins-1106d-e70tag4','Perkins', '1106D-E70TAG4','1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage IIIA / EPA Tier 3',
  165, 182, 144, 180, 160, 200,   180, 199, 160, 200, 175, 219),

-- 1106J-E70TAG3: Tier 4 Final; 60Hz only
('perkins-1106j-e70tag3','Perkins', '1106J-E70TAG3','1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'EPA Tier 4 Final',
   NULL, NULL, NULL, NULL, NULL, NULL,   151, 168, 135, 169, 150, 188),

-- 1106D-E70TAG5: Tier 3 ESE; standby-only at 60Hz
('perkins-1106d-e70tag5','Perkins', '1106D-E70TAG5','1100 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'EPA Tier 3',
   NULL, NULL, NULL, NULL, NULL, NULL,   NULL, 224, NULL, NULL, 200, 250),

-- ── 1200 Series — 1204J ──────────────────────────────────────────────────────
-- 1204J-E44TAG1: Stage V; 50Hz only
('perkins-1204j-e44tag1','Perkins', '1204J-E44TAG1','1200 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage V / EPA Tier 4 Final',
  107, 119, 97, 123, 109, 136,   NULL, NULL, NULL, NULL, NULL, NULL),

-- 1204J-E44TTAG2: Tier 4 Final; 60Hz only
('perkins-1204j-e44ttag2','Perkins','1204J-E44TTAG2','1200 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 'EPA Tier 4 Final',
   NULL, NULL, NULL, NULL, NULL, NULL,   106, 118, 98, 122, 109, 136),

-- ── 1200 Series — 1206D: Stage IIIA; 50Hz only ───────────────────────────────
('perkins-1206d-e70ttag1','Perkins','1206D-E70TTAG1','1200 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 'Euro Stage IIIA / EPA Tier 3',
  178, 196, 160, 200, 176, 225,   NULL, NULL, NULL, NULL, NULL, NULL),

('perkins-1206d-e70ttag2','Perkins','1206D-E70TTAG2','1200 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 'Euro Stage IIIA / EPA Tier 3',
  196, 218, 184, 225, 200, 250,   NULL, NULL, NULL, NULL, NULL, NULL),

('perkins-1206d-e70ttag3','Perkins','1206D-E70TTAG3','1200 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 'Euro Stage IIIA / EPA Tier 3',
  218, 240, 200, 250, 220, 275,   NULL, NULL, NULL, NULL, NULL, NULL),

-- ── 1200 Series — 1206J: Stage V / Tier 4 Final ──────────────────────────────
-- Both TTAG3 and TTAG4 share the same 50Hz rating in the catalog
-- TTAG4 additionally has a 60Hz rating; switchable
('perkins-1206j-e70ttag3','Perkins','1206J-E70TTAG3','1200 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 'Euro Stage V / EPA Tier 4 Final',
  172, 191, 159, 198, 175, 219,   NULL, NULL, NULL, NULL, NULL, NULL),

('perkins-1206j-e70ttag4','Perkins','1206J-E70TTAG4','1200 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 'Euro Stage V / EPA Tier 4 Final',
  172, 191, 159, 198, 175, 219,   200, 222, 180, 225, 200, 250),

-- ── 1700 Series — 1706J: Stage V ─────────────────────────────────────────────
('perkins-1706j-e93tag1','Perkins', '1706J-E93TAG1','1700 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage V / EPA Tier 4 Final',
  221, 244, 210, 263, 232, 290,   NULL, NULL, NULL, NULL, NULL, NULL),

-- 1706J-E93TAG2: Stage V / Tier 4 Final; switchable
('perkins-1706j-e93tag2','Perkins', '1706J-E93TAG2','1700 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage V / EPA Tier 4 Final',
  265, 292, 249, 312, 275, 343,   291, 321, 267, 334, 296, 369),

-- ── 1700 Series — 1706D: Tier 3 ESE; 60Hz only ───────────────────────────────
('perkins-1706d-e93tag1','Perkins', '1706D-E93TAG1','1700 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'EPA Tier 3',
   NULL, NULL, NULL, NULL, NULL, NULL,   254, 281, 237, 296, 261, 327),

('perkins-1706d-e93tag2','Perkins', '1706D-E93TAG2','1700 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'EPA Tier 3',
   NULL, NULL, NULL, NULL, NULL, NULL,   309, 341, 288, 359, 318, 397),

-- ── 2200 Series ──────────────────────────────────────────────────────────────
-- 2206D-E13TAG2: Tier 3 ESE; 60Hz only
('perkins-2206d-e13tag2','Perkins', '2206D-E13TAG2','2200 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'EPA Tier 3',
   NULL, NULL, NULL, NULL, NULL, NULL,   349, 381, 320, 400, 350, 438),

-- 2206D-E13TAG3: Stage IIIA / Tier 3 ESE; switchable
('perkins-2206d-e13tag3','Perkins', '2206D-E13TAG3','2200 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage IIIA / EPA Tier 3',
  349, 392, 320, 400, 360, 450,   381, 435, 350, 438, 400, 500),

-- ── 2400 Series ──────────────────────────────────────────────────────────────
-- 2406J-E13TAG3: Stage V / Tier 4 Final; switchable
('perkins-2406j-e13tag3','Perkins', '2406J-E13TAG3','2400 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage V / EPA Tier 4 Final',
  349, 385, 328, 410, 362, 452,   364, 403, 342, 428, 379, 474),

-- ── 2500 Series ──────────────────────────────────────────────────────────────
-- 2506C-E15TAG2: Stage IIIA; 50Hz primary (also exists in unregulated catalog)
('perkins-2506c-e15tag2','Perkins', '2506C-E15TAG2','2500 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage IIIA / EPA Tier 3',
  435, 478, 400, 500, 440, 550,   NULL, NULL, NULL, NULL, NULL, NULL),

-- 2506D-E15TAG1: Tier 3 ESE; 60Hz only
('perkins-2506d-e15tag1','Perkins', '2506D-E15TAG1','2500 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'EPA Tier 3',
   NULL, NULL, NULL, NULL, NULL, NULL,   435, 490, 400, 500, 450, 563),

-- 2506C-E15TAG3/4: Tier 2 ESE; 60Hz only (also in unregulated catalog)
('perkins-2506c-e15tag3','Perkins', '2506C-E15TAG3','2500 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage II / EPA Tier 2',
   NULL, NULL, NULL, NULL, NULL, NULL,   509, 562, 468, 585, 517, 646),

-- TAG4 is standby-only at 60Hz
('perkins-2506c-e15tag4','Perkins', '2506C-E15TAG4','2500 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage II / EPA Tier 2',
   NULL, NULL, NULL, NULL, NULL, NULL,   NULL, 597, NULL, NULL, 550, 687),

-- ── 2800 Series ──────────────────────────────────────────────────────────────
-- 2806J-E18TAG1: Stage V; 50Hz only
('perkins-2806j-e18tag1','Perkins', '2806J-E18TAG1','2800 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage V / EPA Tier 4 Final',
  479, 530, 444, 554, 488, 610,   NULL, NULL, NULL, NULL, NULL, NULL),

-- 2806F-E18TAG1: Tier 4 Final; 60Hz only
('perkins-2806f-e18tag1','Perkins', '2806F-E18TAG1','2800 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'EPA Tier 4 Final',
   NULL, NULL, NULL, NULL, NULL, NULL,   475, 529, 455, 569, 500, 625),

-- 2806C-E18TAG3: Tier 2 ESE; 60Hz only (switchable)
('perkins-2806c-e18tag3','Perkins', '2806C-E18TAG3','2800 Series', 'active', 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 1500, 'Euro Stage II / EPA Tier 2',
   NULL, NULL, NULL, NULL, NULL, NULL,   592, 652, 545, 681, 600, 750),

-- 2806C-E18TTAG6/7: Tier 2 ESE; 60Hz only
('perkins-2806c-e18ttag6','Perkins','2806C-E18TTAG6','2800 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 'Euro Stage II / EPA Tier 2',
   NULL, NULL, NULL, NULL, NULL, NULL,   685, 754, 650, 813, 716, 895),

('perkins-2806c-e18ttag7','Perkins','2806C-E18TTAG7','2800 Series','active','Diesel','Compression Ignition','Liquid-Cooled',1500, 'Euro Stage II / EPA Tier 2',
   NULL, NULL, NULL, NULL, NULL, NULL,   716, 790, 680, 850, 750, 938)

ON CONFLICT (slug) DO UPDATE SET
  brand                  = EXCLUDED.brand,
  model                  = EXCLUDED.model,
  series                 = EXCLUDED.series,
  status                 = EXCLUDED.status,
  fuel_type              = EXCLUDED.fuel_type,
  ignition_type          = EXCLUDED.ignition_type,
  cooling_method         = EXCLUDED.cooling_method,
  rpm_rated              = EXCLUDED.rpm_rated,
  emissions_standard     = EXCLUDED.emissions_standard,
  -- Preserve existing power data if regulated catalog has NULL for that field
  prime_power_kw_50hz    = COALESCE(EXCLUDED.prime_power_kw_50hz,    engines.prime_power_kw_50hz),
  standby_power_kw_50hz  = COALESCE(EXCLUDED.standby_power_kw_50hz,  engines.standby_power_kw_50hz),
  prime_power_kwe_50hz   = COALESCE(EXCLUDED.prime_power_kwe_50hz,   engines.prime_power_kwe_50hz),
  prime_power_kva_50hz   = COALESCE(EXCLUDED.prime_power_kva_50hz,   engines.prime_power_kva_50hz),
  standby_power_kwe_50hz = COALESCE(EXCLUDED.standby_power_kwe_50hz, engines.standby_power_kwe_50hz),
  standby_power_kva_50hz = COALESCE(EXCLUDED.standby_power_kva_50hz, engines.standby_power_kva_50hz),
  prime_power_kw_60hz    = COALESCE(EXCLUDED.prime_power_kw_60hz,    engines.prime_power_kw_60hz),
  standby_power_kw_60hz  = COALESCE(EXCLUDED.standby_power_kw_60hz,  engines.standby_power_kw_60hz),
  prime_power_kwe_60hz   = COALESCE(EXCLUDED.prime_power_kwe_60hz,   engines.prime_power_kwe_60hz),
  prime_power_kva_60hz   = COALESCE(EXCLUDED.prime_power_kva_60hz,   engines.prime_power_kva_60hz),
  standby_power_kwe_60hz = COALESCE(EXCLUDED.standby_power_kwe_60hz, engines.standby_power_kwe_60hz),
  standby_power_kva_60hz = COALESCE(EXCLUDED.standby_power_kva_60hz, engines.standby_power_kva_60hz);

-- Also update emissions_standard on the 404D-22TG which already exists
-- (from unregulated catalog; regulated 60Hz catalog confirms Tier 4 Interim)
UPDATE engines
SET emissions_standard = 'EPA Tier 4 Interim'
WHERE slug = 'perkins-404d-22tg'
  AND emissions_standard IS NULL;
