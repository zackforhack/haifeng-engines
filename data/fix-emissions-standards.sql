-- Standardise emissions_standard field to "Euro Stage X / EPA Tier Y" convention

UPDATE engines SET emissions_standard = 'Euro Stage II / EPA Tier 2'      WHERE emissions_standard = 'Stage II / Tier 2';
UPDATE engines SET emissions_standard = 'Euro Stage IIIA / EPA Tier 3'    WHERE emissions_standard = 'Stage IIIA / Tier 3';
UPDATE engines SET emissions_standard = 'Euro Stage V / EPA Tier 4 Final' WHERE emissions_standard IN ('Stage V / Tier 4f', 'Tier 4f / Stage V');
UPDATE engines SET emissions_standard = 'Euro Stage V'                     WHERE emissions_standard = 'Stage V';
UPDATE engines SET emissions_standard = 'EPA Tier 4 Final'                 WHERE emissions_standard = 'Tier 4f';

-- Fix inline mentions in description field
UPDATE engines SET description = REPLACE(description, 'Stage II certified',    'Euro Stage II certified')    WHERE description LIKE '%Stage II certified%';
UPDATE engines SET description = REPLACE(description, 'Stage IIIA certified',  'Euro Stage IIIA certified')  WHERE description LIKE '%Stage IIIA certified%';
UPDATE engines SET description = REPLACE(description, 'Stage V certified',     'Euro Stage V certified')     WHERE description LIKE '%Stage V certified%';
UPDATE engines SET description = REPLACE(description, 'Stage V and Tier 4 Final certified', 'Euro Stage V and EPA Tier 4 Final certified') WHERE description LIKE '%Stage V and Tier 4 Final certified%';
UPDATE engines SET description = REPLACE(description, 'Tier 4 Final certified','EPA Tier 4 Final certified') WHERE description LIKE '%Tier 4 Final certified%';
