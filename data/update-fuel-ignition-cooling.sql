-- Populate fuel_type, ignition_type, cooling_method for all engines
-- Run this in the Supabase SQL editor

-- Step 1: Set defaults for all engines (covers Hyundai, Scania DC series, Volvo, and any future diesel brands)
UPDATE engines
SET
  fuel_type      = 'Diesel',
  ignition_type  = 'Compression Ignition',
  cooling_method = 'Liquid-Cooled'
WHERE fuel_type IS NULL
   OR ignition_type IS NULL
   OR cooling_method IS NULL;

-- Step 2: Override Scania OC16 natural gas engines
UPDATE engines
SET
  fuel_type     = 'Natural Gas',
  ignition_type = 'Spark Ignition',
  cooling_method = 'Liquid-Cooled'
WHERE slug IN (
  'scania-oc16-071a-02-81',
  'scania-oc16-071a-02-82',
  'scania-oc16-071a-02-83'
);

-- Step 3: Override Scania OC16 biogas engine
UPDATE engines
SET
  fuel_type     = 'Biogas',
  ignition_type = 'Spark Ignition',
  cooling_method = 'Liquid-Cooled'
WHERE slug = 'scania-oc16-071a-02-91';

-- Verify
SELECT brand, fuel_type, ignition_type, cooling_method, COUNT(*) as count
FROM engines
GROUP BY brand, fuel_type, ignition_type, cooling_method
ORDER BY brand, fuel_type;
