-- Add fuel_type, ignition_type, cooling_method columns to engines table
-- Run this in the Supabase SQL editor

ALTER TABLE engines
  ADD COLUMN IF NOT EXISTS fuel_type text,
  ADD COLUMN IF NOT EXISTS ignition_type text,
  ADD COLUMN IF NOT EXISTS cooling_method text;

-- All Hyundai engines: diesel, compression ignition, liquid-cooled
UPDATE engines
SET
  fuel_type      = 'Diesel',
  ignition_type  = 'Compression Ignition',
  cooling_method = 'Liquid-Cooled'
WHERE brand = 'Hyundai';

-- All Scania diesel engines (DC13, DC16)
UPDATE engines
SET
  fuel_type      = 'Diesel',
  ignition_type  = 'Compression Ignition',
  cooling_method = 'Liquid-Cooled'
WHERE brand = 'Scania'
  AND slug NOT LIKE 'scania-oc16%';

-- Scania OC16 natural gas engines (02-81, 02-82, 02-83)
UPDATE engines
SET
  fuel_type      = 'Natural Gas',
  ignition_type  = 'Spark Ignition',
  cooling_method = 'Liquid-Cooled'
WHERE slug IN (
  'scania-oc16-071a-02-81',
  'scania-oc16-071a-02-82',
  'scania-oc16-071a-02-83'
);

-- Scania OC16 02-91: biogas variant
UPDATE engines
SET
  fuel_type      = 'Biogas',
  ignition_type  = 'Spark Ignition',
  cooling_method = 'Liquid-Cooled'
WHERE slug = 'scania-oc16-071a-02-91';
