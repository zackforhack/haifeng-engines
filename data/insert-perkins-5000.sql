-- Perkins 5000 Series engines
-- Power data from: 2026 Perkins 5000S Generator Set Power Selector Chart
-- Page 1: EU Stage II / China Nonroad Stage III — 50Hz (1500 rpm)
-- Page 2: U.S. EPA Tier 2 — 60Hz (1800 rpm)

INSERT INTO engines (
  brand, model, series, slug, status,
  rpm_rated, fuel_type, ignition_type, cooling_method,
  emissions_standard, cylinders,
  prime_power_kw_50hz,  standby_power_kw_50hz,
  prime_power_kwe_50hz, prime_power_kva_50hz,
  standby_power_kwe_50hz, standby_power_kva_50hz
) VALUES

-- ── 5006AC Series (6-cylinder) ────────────────────────────────────────────
('Perkins', '5006AC-E23TAG1', '5006 Series', 'perkins-5006ac-e23tag1', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',
  'EU Stage II / China Nonroad Stage III', 6,
  638, 702, 600, 750, 660, 825),

('Perkins', '5006AC-E23TAG2', '5006 Series', 'perkins-5006ac-e23tag2', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',
  'EU Stage II / China Nonroad Stage III', 6,
  681, 766, 640, 800, 720, 900),

-- ── 5008AC Series (8-cylinder) ────────────────────────────────────────────
('Perkins', '5008AC-E30TAG1', '5008 Series', 'perkins-5008ac-e30tag1', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',
  'EU Stage II / China Nonroad Stage III', 8,
  774, 851, 728, 910, 800, 1000),

('Perkins', '5008AC-E30TAG2', '5008 Series', 'perkins-5008ac-e30tag2', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',
  'EU Stage II / China Nonroad Stage III', 8,
  860, 957, 808, 1010, 900, 1125),

('Perkins', '5008AC-E30TAG3', '5008 Series', 'perkins-5008ac-e30tag3', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',
  'EU Stage II / China Nonroad Stage III', 8,
  957, 1064, 900, 1124, 1000, 1250),

-- ── 5012AC Series (12-cylinder) ───────────────────────────────────────────
('Perkins', '5012AC-E46TAG1', '5012 Series', 'perkins-5012ac-e46tag1', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',
  'EU Stage II / China Nonroad Stage III', 12,
  1090, 1196, 1036, 1295, 1136, 1420),

('Perkins', '5012AC-E46TAG2', '5012 Series', 'perkins-5012ac-e46tag2', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',
  'EU Stage II / China Nonroad Stage III', 12,
  1140, 1266, 1083, 1353, 1203, 1503),

('Perkins', '5012AC-E46TAG3', '5012 Series', 'perkins-5012ac-e46tag3', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',
  'EU Stage II / China Nonroad Stage III', 12,
  1265, 1392, 1202, 1502, 1322, 1652),

('Perkins', '5012AC-E46TAG4', '5012 Series', 'perkins-5012ac-e46tag4', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',
  'EU Stage II / China Nonroad Stage III', 12,
  1440, 1579, 1368, 1710, 1500, 1875),

-- ── 5016AC Series (16-cylinder) ───────────────────────────────────────────
('Perkins', '5016AC-E61TRG0', '5016 Series', 'perkins-5016ac-e61trg0', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',
  'EU Stage II / China Nonroad Stage III', 16,
  1474, 1621, 1400, 1750, 1540, 1925),

('Perkins', '5016AC-E61TRG1', '5016 Series', 'perkins-5016ac-e61trg1', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',
  'EU Stage II / China Nonroad Stage III', 16,
  1558, 1684, 1480, 1850, 1600, 2000),

('Perkins', '5016AC-E61TRG2', '5016 Series', 'perkins-5016ac-e61trg2', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',
  'EU Stage II / China Nonroad Stage III', 16,
  1698, 1909, 1613, 2016, 1814, 2266),

('Perkins', '5016AC-E61TRG3', '5016 Series', 'perkins-5016ac-e61trg3', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled',
  'EU Stage II / China Nonroad Stage III', 16,
  1895, 2105, 1800, 2250, 2000, 2500)

ON CONFLICT (slug) DO UPDATE SET
  prime_power_kw_50hz    = EXCLUDED.prime_power_kw_50hz,
  standby_power_kw_50hz  = EXCLUDED.standby_power_kw_50hz,
  prime_power_kwe_50hz   = EXCLUDED.prime_power_kwe_50hz,
  prime_power_kva_50hz   = EXCLUDED.prime_power_kva_50hz,
  standby_power_kwe_50hz = EXCLUDED.standby_power_kwe_50hz,
  standby_power_kva_50hz = EXCLUDED.standby_power_kva_50hz,
  updated_at             = now();

-- ── U.S. EPA Tier 2 — 60Hz (1800 rpm) ────────────────────────────────────
INSERT INTO engines (
  brand, model, series, slug, status,
  rpm_rated, fuel_type, ignition_type, cooling_method,
  emissions_standard, cylinders,
  prime_power_kw_60hz,  standby_power_kw_60hz,
  prime_power_kwe_60hz, prime_power_kva_60hz,
  standby_power_kwe_60hz, standby_power_kva_60hz
) VALUES
('Perkins', '5008C-E30TAG4', '5008 Series', 'perkins-5008c-e30tag4', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 'U.S. EPA Tier 2', 8,
  853, 947, 810, 1013, 900, 1125),
('Perkins', '5008C-E30TAG5', '5008 Series', 'perkins-5008c-e30tag5', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 'U.S. EPA Tier 2', 8,
  947, 1053, 900, 1125, 1000, 1250),
('Perkins', '5012C-E46TAG5', '5012 Series', 'perkins-5012c-e46tag5', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 'U.S. EPA Tier 2', 12,
  1186, 1316, 1127, 1408, 1250, 1563),
('Perkins', '5012C-E46TAG6', '5012 Series', 'perkins-5012c-e46tag6', 'active',
  1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', 'U.S. EPA Tier 2', 12,
  1422, 1580, 1351, 1688, 1501, 1876)
ON CONFLICT (slug) DO UPDATE SET
  prime_power_kw_60hz    = EXCLUDED.prime_power_kw_60hz,
  standby_power_kw_60hz  = EXCLUDED.standby_power_kw_60hz,
  prime_power_kwe_60hz   = EXCLUDED.prime_power_kwe_60hz,
  prime_power_kva_60hz   = EXCLUDED.prime_power_kva_60hz,
  standby_power_kwe_60hz = EXCLUDED.standby_power_kwe_60hz,
  standby_power_kva_60hz = EXCLUDED.standby_power_kva_60hz,
  updated_at             = now();

-- ── Fuel Optimised — 50Hz (1500 rpm, no emission certification) ───────────
INSERT INTO engines (
  brand, model, series, slug, status,
  rpm_rated, fuel_type, ignition_type, cooling_method,
  emissions_standard, cylinders,
  prime_power_kw_50hz,  standby_power_kw_50hz,
  prime_power_kwe_50hz, prime_power_kva_50hz,
  standby_power_kwe_50hz, standby_power_kva_50hz
) VALUES
('Perkins', '5006A-E23TAG1', '5006 Series', 'perkins-5006a-e23tag1', 'active', 1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', null, 6,  638,  702,  600,  750,  660,  825),
('Perkins', '5006A-E23TAG2', '5006 Series', 'perkins-5006a-e23tag2', 'active', 1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', null, 6,  681,  766,  640,  800,  720,  900),
('Perkins', '5008A-E30TAG1', '5008 Series', 'perkins-5008a-e30tag1', 'active', 1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', null, 8,  774,  851,  728,  910,  800,  1000),
('Perkins', '5008A-E30TAG2', '5008 Series', 'perkins-5008a-e30tag2', 'active', 1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', null, 8,  860,  957,  808,  1010, 900,  1125),
('Perkins', '5008A-E30TAG3', '5008 Series', 'perkins-5008a-e30tag3', 'active', 1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', null, 8,  957,  1064, 900,  1124, 1000, 1250),
('Perkins', '5012A-E46TAG1', '5012 Series', 'perkins-5012a-e46tag1', 'active', 1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', null, 12, 1090, 1196, 1036, 1295, 1136, 1420),
('Perkins', '5012A-E46TAG2', '5012 Series', 'perkins-5012a-e46tag2', 'active', 1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', null, 12, 1140, 1266, 1083, 1353, 1203, 1503),
('Perkins', '5012A-E46TAG3', '5012 Series', 'perkins-5012a-e46tag3', 'active', 1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', null, 12, 1265, 1392, 1202, 1502, 1322, 1652),
('Perkins', '5012A-E46TAG4', '5012 Series', 'perkins-5012a-e46tag4', 'active', 1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', null, 12, 1440, 1579, 1368, 1710, 1500, 1875),
('Perkins', '5016A-E61TRG0', '5016 Series', 'perkins-5016a-e61trg0', 'active', 1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', null, 16, 1479, 1627, 1400, 1750, 1540, 1925),
('Perkins', '5016A-E61TRG1', '5016 Series', 'perkins-5016a-e61trg1', 'active', 1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', null, 16, 1558, 1684, 1480, 1850, 1600, 2000),
('Perkins', '5016A-E61TRG2', '5016 Series', 'perkins-5016a-e61trg2', 'active', 1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', null, 16, 1698, 1909, 1613, 2016, 1814, 2267),
('Perkins', '5016A-E61TRG3', '5016 Series', 'perkins-5016a-e61trg3', 'active', 1500, 'Diesel', 'Compression Ignition', 'Liquid-Cooled', null, 16, 1895, 2105, 1800, 2250, 2000, 2500)
ON CONFLICT (slug) DO UPDATE SET
  prime_power_kw_50hz    = EXCLUDED.prime_power_kw_50hz,
  standby_power_kw_50hz  = EXCLUDED.standby_power_kw_50hz,
  prime_power_kwe_50hz   = EXCLUDED.prime_power_kwe_50hz,
  prime_power_kva_50hz   = EXCLUDED.prime_power_kva_50hz,
  standby_power_kwe_50hz = EXCLUDED.standby_power_kwe_50hz,
  standby_power_kva_50hz = EXCLUDED.standby_power_kva_50hz,
  updated_at             = now();
