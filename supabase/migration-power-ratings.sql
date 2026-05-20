-- Migration: Add detailed power rating columns
-- Run this in Supabase SQL Editor

ALTER TABLE engines
  ADD COLUMN IF NOT EXISTS prime_power_kw_50hz  NUMERIC,
  ADD COLUMN IF NOT EXISTS prime_power_kwe_50hz NUMERIC,
  ADD COLUMN IF NOT EXISTS prime_power_kva_50hz NUMERIC,
  ADD COLUMN IF NOT EXISTS standby_power_kw_50hz  NUMERIC,
  ADD COLUMN IF NOT EXISTS standby_power_kwe_50hz NUMERIC,
  ADD COLUMN IF NOT EXISTS standby_power_kva_50hz NUMERIC,
  ADD COLUMN IF NOT EXISTS prime_power_kw_60hz  NUMERIC,
  ADD COLUMN IF NOT EXISTS prime_power_kwe_60hz NUMERIC,
  ADD COLUMN IF NOT EXISTS prime_power_kva_60hz NUMERIC,
  ADD COLUMN IF NOT EXISTS standby_power_kw_60hz  NUMERIC,
  ADD COLUMN IF NOT EXISTS standby_power_kwe_60hz NUMERIC,
  ADD COLUMN IF NOT EXISTS standby_power_kva_60hz NUMERIC;
