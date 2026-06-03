-- Simplify the alternators schema: the point of this catalog is to list each model
-- and link its official spec sheet — not to replicate every voltage/RPM rating.
-- Run PART 1 first (additive, safe), seed + verify the site, THEN run PART 2 (the
-- destructive column drop) once you're happy. DDL must run in the Supabase SQL Editor.

-- ── PART 1: add the two lean columns (run now) ──────────────────────────────
ALTER TABLE alternators ADD COLUMN IF NOT EXISTS kva NUMERIC;
ALTER TABLE alternators ADD COLUMN IF NOT EXISTS spec_sheet_url TEXT;

-- ── PART 2: drop the replaced rich columns (run AFTER verifying the site) ────
-- ALTER TABLE alternators
--   DROP COLUMN IF EXISTS prime_kva_50hz,  DROP COLUMN IF EXISTS prime_kw_50hz,
--   DROP COLUMN IF EXISTS standby_kva_50hz, DROP COLUMN IF EXISTS standby_kw_50hz,
--   DROP COLUMN IF EXISTS prime_kva_60hz,  DROP COLUMN IF EXISTS prime_kw_60hz,
--   DROP COLUMN IF EXISTS standby_kva_60hz, DROP COLUMN IF EXISTS standby_kw_60hz,
--   DROP COLUMN IF EXISTS power_factor,    DROP COLUMN IF EXISTS voltage_output,
--   DROP COLUMN IF EXISTS phases,          DROP COLUMN IF EXISTS frame,
--   DROP COLUMN IF EXISTS insulation_class, DROP COLUMN IF EXISTS ip_rating,
--   DROP COLUMN IF EXISTS excitation_type, DROP COLUMN IF EXISTS efficiency,
--   DROP COLUMN IF EXISTS weight_kg,       DROP COLUMN IF EXISTS length_mm,
--   DROP COLUMN IF EXISTS width_mm,        DROP COLUMN IF EXISTS height_mm,
--   DROP COLUMN IF EXISTS origin,          DROP COLUMN IF EXISTS description;
