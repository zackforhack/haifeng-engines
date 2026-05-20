-- Yanmar generator engine inserts
-- Source: Yanmar 2026 OEM quotation
-- kWe = kWm × 90% generator efficiency
-- kVA = kWe ÷ 0.8 power factor
-- All figures are standby power (PDF only provides standby)
-- All engines: Status active, Origin Japan

INSERT INTO engines (
  slug, brand, model, series, status, origin,
  cylinders, displacement_l, configuration, rpm_rated, emissions_standard,
  standby_power_kw_50hz, standby_power_kwe_50hz, standby_power_kva_50hz,
  standby_power_kw_60hz, standby_power_kwe_60hz, standby_power_kva_60hz,
  description
) VALUES

-- ============================================================
-- HIGH-SPEED SERIES (3000/3600 RPM, 2-pole) — HGE suffix
-- ============================================================
('yanmar-2tnv70-hge', 'Yanmar', '2TNV70-HGE', 'TNV Series', 'active', 'Japan',
  2, 0.854, 'Inline 2', 3000, 'EPA Tier 2',
  8.5, 7.7, 10,
  10.0, 9.0, 11,
  '2-cylinder high-speed diesel engine for generator sets. 3000/3600 RPM (50Hz/60Hz). EPA Tier 2 certified.'),

('yanmar-3tnm68-hge', 'Yanmar', '3TNM68-HGE', 'TNM Series', 'active', 'Japan',
  3, NULL, 'Inline 3', 3000, 'EPA Tier 2',
  12.0, 10.8, 14,
  14.2, 12.8, 16,
  '3-cylinder high-speed diesel engine for generator sets. 3000/3600 RPM (50Hz/60Hz). EPA Tier 2 certified.'),

('yanmar-3tnv70-hge', 'Yanmar', '3TNV70-HGE', 'TNV Series', 'active', 'Japan',
  3, 1.281, 'Inline 3', 3000, 'EPA Tier 2',
  13.3, 12.0, 15,
  16.0, 14.4, 18,
  '3-cylinder high-speed diesel engine for generator sets. 3000/3600 RPM (50Hz/60Hz). EPA Tier 2 certified.'),

('yanmar-3tnv76-hge', 'Yanmar', '3TNV76-HGE', 'TNV Series', 'active', 'Japan',
  3, 1.496, 'Inline 3', 3000, 'EPA Tier 2',
  16.5, 14.9, 19,
  19.5, 17.6, 22,
  '3-cylinder high-speed diesel engine for generator sets. 3000/3600 RPM (50Hz/60Hz). EPA Tier 2 certified.'),

-- ============================================================
-- STANDARD SPEED (1500/1800 RPM) — GGE series
-- ============================================================
('yanmar-3tnm68-gge', 'Yanmar', '3TNM68-GGE', 'TNM Series', 'active', 'Japan',
  3, NULL, 'Inline 3', 1500, 'EPA Tier 2',
  6.1, 5.5, 7,
  7.3, 6.6, 8,
  '3-cylinder diesel engine for generator sets. EPA Tier 2 certified.'),

('yanmar-3tnv70-gge', 'Yanmar', '3TNV70-GGE', 'TNV Series', 'active', 'Japan',
  3, 1.281, 'Inline 3', 1500, 'EPA Tier 2',
  6.7, 6.0, 8,
  8.0, 7.2, 9,
  '3-cylinder diesel engine for generator sets. EPA Tier 2 certified.'),

('yanmar-3tnv76-gge', 'Yanmar', '3TNV76-GGE', 'TNV Series', 'active', 'Japan',
  3, 1.496, 'Inline 3', 1500, 'EPA Tier 2',
  9.0, 8.1, 10,
  10.7, 9.6, 12,
  '3-cylinder diesel engine for generator sets. EPA Tier 2 certified.'),

('yanmar-3tnv82a-gge', 'Yanmar', '3TNV82A-GGE', 'TNV Series', 'active', 'Japan',
  3, 1.642, 'Inline 3', 1500, 'EPA Tier 2',
  11.0, 9.9, 12,
  13.2, 11.9, 15,
  '3-cylinder diesel engine for generator sets. EPA Tier 2 certified.'),

('yanmar-3tnv84t-gge', 'Yanmar', '3TNV84T-GGE', 'TNV Series', 'active', 'Japan',
  3, 1.758, 'Inline 3, Turbocharged', 1500, 'EPA Tier 2',
  15.6, 14.0, 18,
  18.8, 16.9, 21,
  '3-cylinder turbocharged diesel engine for generator sets. EPA Tier 2 certified.'),

('yanmar-3tnv88-gge', 'Yanmar', '3TNV88-GGE', 'TNV Series', 'active', 'Japan',
  3, 1.763, 'Inline 3', 1500, 'EPA Tier 2',
  13.2, 11.9, 15,
  16.2, 14.6, 18,
  '3-cylinder diesel engine for generator sets. EPA Tier 2 certified.'),

('yanmar-4tnv84t-gge', 'Yanmar', '4TNV84T-GGE', 'TNV Series', 'active', 'Japan',
  4, 2.344, 'Inline 4, Turbocharged', 1500, 'EPA Tier 2',
  21.0, 18.9, 24,
  26.8, 24.1, 30,
  '4-cylinder turbocharged diesel engine for generator sets. EPA Tier 2 certified.'),

('yanmar-4tnv84t-bgges', 'Yanmar', '4TNV84T-BGGES', 'TNV Series', 'active', 'Japan',
  4, 2.344, 'Inline 4, Turbocharged', 1500, 'EPA Tier 3',
  21.0, 18.9, 24,
  26.8, 24.1, 30,
  '4-cylinder turbocharged diesel engine for generator sets. EPA Tier 3 certified.'),

('yanmar-4tnv88-gge', 'Yanmar', '4TNV88-GGE', 'TNV Series', 'active', 'Japan',
  4, 2.351, 'Inline 4', 1500, 'EPA Tier 2',
  18.0, 16.2, 20,
  21.6, 19.4, 24,
  '4-cylinder diesel engine for generator sets. EPA Tier 2 certified.'),

('yanmar-4tnv88-bgges', 'Yanmar', '4TNV88-BGGES', 'TNV Series', 'active', 'Japan',
  4, 2.351, 'Inline 4', 1500, 'EPA Tier 3',
  18.0, 16.2, 20,
  21.6, 19.4, 24,
  '4-cylinder diesel engine for generator sets. EPA Tier 3 certified.'),

('yanmar-4tnv98-gge', 'Yanmar', '4TNV98-GGE', 'TNV Series', 'active', 'Japan',
  4, 3.119, 'Inline 4', 1500, 'EPA Tier 2',
  34.1, 30.7, 38,
  40.8, 36.7, 46,
  '4-cylinder diesel engine for generator sets. EPA Tier 2 certified.'),

('yanmar-4tnv98-zgges', 'Yanmar', '4TNV98-ZGGES', 'TNV Series', 'active', 'Japan',
  4, 3.119, 'Inline 4', 1500, 'EPA Tier 3',
  33.9, 30.5, 38,
  40.8, 36.7, 46,
  '4-cylinder diesel engine for generator sets. EPA Tier 3 certified.'),

('yanmar-4tnv98t-gge', 'Yanmar', '4TNV98T-GGE', 'TNV Series', 'active', 'Japan',
  4, 3.119, 'Inline 4, Turbocharged', 1500, 'EPA Tier 2',
  41.4, 37.3, 47,
  50.1, 45.1, 56,
  '4-cylinder turbocharged diesel engine for generator sets. EPA Tier 2 certified.'),

('yanmar-4tnv98t-zgges', 'Yanmar', '4TNV98T-ZGGES', 'TNV Series', 'active', 'Japan',
  4, 3.119, 'Inline 4, Turbocharged', 1500, 'EPA Tier 3',
  41.9, 37.7, 47,
  50.4, 45.4, 57,
  '4-cylinder turbocharged diesel engine for generator sets. EPA Tier 3 certified.'),

('yanmar-4tnv106-gge', 'Yanmar', '4TNV106-GGE', 'TNV Series', 'active', 'Japan',
  4, 3.769, 'Inline 4', 1500, 'EPA Tier 2',
  49.4, 44.5, 56,
  58.7, 52.8, 66,
  '4-cylinder diesel engine for generator sets. EPA Tier 2 certified.'),

('yanmar-4tnv106t-gge', 'Yanmar', '4TNV106T-GGE', 'TNV Series', 'active', 'Japan',
  4, 3.769, 'Inline 4, Turbocharged', 1500, 'EPA Tier 2',
  56.0, 50.4, 63,
  66.9, 60.2, 75,
  '4-cylinder turbocharged diesel engine for generator sets. EPA Tier 2 certified.'),

-- ============================================================
-- VARIANT / SPECIAL CONFIGURATION MODELS (1500/1800 RPM)
-- ============================================================
('yanmar-3tnv88-gghwc', 'Yanmar', '3TNV88-GGHWC', 'TNV Series', 'active', 'Japan',
  3, 1.763, 'Inline 3', 1500, 'EPA Tier 2',
  13.2, 11.9, 15,
  16.2, 14.6, 18,
  '3-cylinder diesel engine for generator sets with hot water cooling. EPA Tier 2 certified.'),

('yanmar-4tnv84t-ggfc', 'Yanmar', '4TNV84T-GGFC', 'TNV Series', 'active', 'Japan',
  4, 2.344, 'Inline 4, Turbocharged', 1500, 'EPA Tier 2',
  21.0, 18.9, 24,
  26.8, 24.1, 30,
  '4-cylinder turbocharged diesel engine for fire pump applications. EPA Tier 2 certified.'),

('yanmar-4tnv88-ggecc', 'Yanmar', '4TNV88-GGECC', 'TNV Series', 'active', 'Japan',
  4, 2.351, 'Inline 4', 1500, 'EPA Tier 2',
  18.0, 16.2, 20,
  21.6, 19.4, 24,
  '4-cylinder diesel engine for generator sets with commercial cooling configuration. EPA Tier 2 certified.'),

('yanmar-4tnv98-ggecc', 'Yanmar', '4TNV98-GGECC', 'TNV Series', 'active', 'Japan',
  4, 3.119, 'Inline 4', 1500, 'EPA Tier 2',
  34.1, 30.7, 38,
  40.8, 36.7, 46,
  '4-cylinder diesel engine for generator sets with commercial cooling configuration. EPA Tier 2 certified.'),

('yanmar-4tnv98t-ggecc', 'Yanmar', '4TNV98T-GGECC', 'TNV Series', 'active', 'Japan',
  4, 3.119, 'Inline 4, Turbocharged', 1500, 'EPA Tier 2',
  41.4, 37.3, 47,
  50.1, 45.1, 56,
  '4-cylinder turbocharged diesel engine for generator sets with commercial cooling configuration. EPA Tier 2 certified.'),

-- ============================================================
-- EURO STAGE V MODELS (1500 RPM / 50Hz only)
-- ============================================================
('yanmar-2tnv70-wlye', 'Yanmar', '2TNV70-WLYE', 'TNV Series', 'active', 'Japan',
  2, 0.854, 'Inline 2', 1500, 'Euro Stage V',
  4.2, 3.8, 5,
  NULL, NULL, NULL,
  '2-cylinder diesel engine for generator sets. Euro Stage V certified.'),

('yanmar-3tnm74f-ngge', 'Yanmar', '3TNM74F-NGGE', 'TNM F Series', 'active', 'Japan',
  3, NULL, 'Inline 3', 1500, 'Euro Stage V',
  7.3, 6.6, 8,
  NULL, NULL, NULL,
  '3-cylinder diesel engine for generator sets. Euro Stage V certified.'),

('yanmar-3tnv80f-ngge', 'Yanmar', '3TNV80F-NGGE', 'TNV F Series', 'active', 'Japan',
  3, NULL, 'Inline 3', 1500, 'Euro Stage V',
  9.5, 8.6, 11,
  NULL, NULL, NULL,
  '3-cylinder diesel engine for generator sets. Euro Stage V certified.'),

('yanmar-3tnv88f-ugge', 'Yanmar', '3TNV88F-UGGE', 'TNV F Series', 'active', 'Japan',
  3, NULL, 'Inline 3', 1500, 'Euro Stage V',
  14.3, 12.9, 16,
  NULL, NULL, NULL,
  '3-cylinder diesel engine for generator sets. Euro Stage V certified.'),

('yanmar-4tnv88-bige', 'Yanmar', '4TNV88-BIGE', 'TNV Series', 'active', 'Japan',
  4, 2.351, 'Inline 4', 1500, 'Euro Stage V',
  18.5, 16.7, 21,
  NULL, NULL, NULL,
  '4-cylinder diesel engine for generator sets. Euro Stage V certified.'),

('yanmar-4tnv98c-iye', 'Yanmar', '4TNV98C-IYE', 'TNV Series', 'active', 'Japan',
  4, 3.119, 'Inline 4, Common Rail', 1500, 'Euro Stage V',
  35.5, 32.0, 40,
  NULL, NULL, NULL,
  '4-cylinder common rail diesel engine for generator sets. Euro Stage V certified.'),

('yanmar-4tnv98ct-iye', 'Yanmar', '4TNV98CT-IYE', 'TNV Series', 'active', 'Japan',
  4, 3.119, 'Inline 4, Turbocharged Common Rail', 1500, 'Euro Stage V',
  43.7, 39.3, 49,
  NULL, NULL, NULL,
  '4-cylinder turbocharged common rail diesel engine for generator sets. Euro Stage V certified.'),

-- ============================================================
-- EPA TIER 4 FINAL MODELS (1800 RPM / 60Hz only)
-- ============================================================
('yanmar-3tnm74f-ng6ge', 'Yanmar', '3TNM74F-NG6GE', 'TNM F Series', 'active', 'Japan',
  3, NULL, 'Inline 3', NULL, 'EPA Tier 4 Final',
  NULL, NULL, NULL,
  8.8, 7.9, 10,
  '3-cylinder diesel engine for generator sets. 1800 RPM (60Hz). EPA Tier 4 Final certified.'),

('yanmar-3tnv80f-ng6ge', 'Yanmar', '3TNV80F-NG6GE', 'TNV F Series', 'active', 'Japan',
  3, NULL, 'Inline 3', NULL, 'EPA Tier 4 Final',
  NULL, NULL, NULL,
  10.7, 9.6, 12,
  '3-cylinder diesel engine for generator sets. 1800 RPM (60Hz). EPA Tier 4 Final certified.'),

('yanmar-3tnv88f-ug6ge', 'Yanmar', '3TNV88F-UG6GE', 'TNV F Series', 'active', 'Japan',
  3, NULL, 'Inline 3', NULL, 'EPA Tier 4 Final',
  NULL, NULL, NULL,
  15.7, 14.1, 18,
  '3-cylinder diesel engine for generator sets. 1800 RPM (60Hz). EPA Tier 4 Final certified.'),

('yanmar-4tnv98c-gge', 'Yanmar', '4TNV98C-GGE', 'TNV Series', 'active', 'Japan',
  4, 3.119, 'Inline 4, Common Rail', NULL, 'EPA Tier 4 Final',
  NULL, NULL, NULL,
  41.5, 37.4, 47,
  '4-cylinder common rail diesel engine for generator sets. 1800 RPM (60Hz). EPA Tier 4 Final certified.'),

('yanmar-4tnv98ct-gge', 'Yanmar', '4TNV98CT-GGE', 'TNV Series', 'active', 'Japan',
  4, 3.119, 'Inline 4, Turbocharged Common Rail', NULL, 'EPA Tier 4 Final',
  NULL, NULL, NULL,
  51.0, 45.9, 57,
  '4-cylinder turbocharged common rail diesel engine for generator sets. 1800 RPM (60Hz). EPA Tier 4 Final certified.');
