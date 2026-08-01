-- Engine catalog performance hardening.
-- Apply in Supabase SQL Editor before relying on power-sorted catalog pages at scale.

ALTER TABLE engines
  ADD COLUMN IF NOT EXISTS representative_kwe NUMERIC GENERATED ALWAYS AS (
    COALESCE(
      standby_power_kwe_50hz,
      prime_power_kwe_50hz,
      standby_power_kwe_60hz,
      prime_power_kwe_60hz,
      standby_power_kw_50hz,
      prime_power_kw_50hz,
      standby_power_kw_60hz,
      prime_power_kw_60hz,
      round(power_kw * 0.9, 1)
    )
  ) STORED,
  ADD COLUMN IF NOT EXISTS fuel_bucket TEXT GENERATED ALWAYS AS (
    CASE
      WHEN lower(coalesce(fuel_type, '')) LIKE '%natural gas%'
        OR lower(coalesce(fuel_type, '')) LIKE '%biogas%'
        OR lower(coalesce(fuel_type, '')) LIKE '%biomethane%'
        OR lower(coalesce(fuel_type, '')) LIKE '%coal gas%'
        OR lower(coalesce(fuel_type, '')) LIKE '%cng%'
        OR lower(coalesce(fuel_type, '')) LIKE '%lng%'
        OR lower(coalesce(fuel_type, '')) LIKE '%lpg%'
        OR lower(coalesce(fuel_type, '')) LIKE '%propane%'
        THEN 'gas'
      WHEN lower(coalesce(fuel_type, '')) LIKE '%diesel%' THEN 'diesel'
      ELSE NULL
    END
  ) STORED,
  ADD COLUMN IF NOT EXISTS has_50hz BOOLEAN GENERATED ALWAYS AS (
    prime_power_kwe_50hz IS NOT NULL
    OR standby_power_kwe_50hz IS NOT NULL
    OR prime_power_kw_50hz IS NOT NULL
    OR standby_power_kw_50hz IS NOT NULL
  ) STORED,
  ADD COLUMN IF NOT EXISTS has_60hz BOOLEAN GENERATED ALWAYS AS (
    prime_power_kwe_60hz IS NOT NULL
    OR standby_power_kwe_60hz IS NOT NULL
    OR prime_power_kw_60hz IS NOT NULL
    OR standby_power_kw_60hz IS NOT NULL
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_engines_catalog_brand_model ON engines(brand, model);
CREATE INDEX IF NOT EXISTS idx_engines_catalog_representative_kwe ON engines(representative_kwe);
CREATE INDEX IF NOT EXISTS idx_engines_catalog_displacement ON engines(displacement_l);
CREATE INDEX IF NOT EXISTS idx_engines_catalog_fuel_bucket ON engines(fuel_bucket);
CREATE INDEX IF NOT EXISTS idx_engines_catalog_configuration ON engines(configuration);
CREATE INDEX IF NOT EXISTS idx_engines_catalog_origin ON engines(origin);
CREATE INDEX IF NOT EXISTS idx_engines_catalog_rpm ON engines(rpm_rated);
CREATE INDEX IF NOT EXISTS idx_engines_catalog_has_50hz ON engines(has_50hz);
CREATE INDEX IF NOT EXISTS idx_engines_catalog_has_60hz ON engines(has_60hz);
CREATE INDEX IF NOT EXISTS idx_engines_catalog_text ON engines
  USING gin (to_tsvector('simple', coalesce(brand, '') || ' ' || coalesce(model, '') || ' ' || coalesce(series, '')));

CREATE OR REPLACE FUNCTION engine_filter_options()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
WITH
  emissions AS (
    SELECT DISTINCT btrim(regexp_replace(part, '\s+', ' ', 'g')) AS value
    FROM engines
    CROSS JOIN LATERAL regexp_split_to_table(coalesce(emissions_standard, ''), '\s*/\s*') AS part
    WHERE btrim(part) <> ''
  ),
  fuel_types AS (
    SELECT DISTINCT
      CASE
        WHEN fuel_type ILIKE 'Natural Gas%' THEN 'Natural Gas'
        ELSE fuel_type
      END AS value
    FROM engines
    WHERE fuel_type IS NOT NULL AND fuel_type <> ''
  )
SELECT jsonb_build_object(
  'brands', coalesce((
    SELECT jsonb_agg(value ORDER BY value)
    FROM (SELECT DISTINCT brand AS value FROM engines WHERE brand IS NOT NULL AND brand <> '') s
  ), '[]'::jsonb),
  'origins', coalesce((
    SELECT jsonb_agg(value ORDER BY value)
    FROM (SELECT DISTINCT origin AS value FROM engines WHERE origin IS NOT NULL AND origin <> '') s
  ), '[]'::jsonb),
  'emissions', coalesce((
    SELECT jsonb_agg(value ORDER BY sort_order, value)
    FROM (
      SELECT 'U.S. EPA' AS value, 0 AS sort_order
      UNION
      SELECT 'Euro Stage' AS value, 1 AS sort_order
      UNION
      SELECT value, 2 AS sort_order
      FROM emissions
      WHERE value NOT IN ('U.S. EPA', 'Euro Stage')
    ) s
  ), '[]'::jsonb),
  'configs', coalesce((
    SELECT jsonb_agg(value ORDER BY value)
    FROM (SELECT DISTINCT configuration AS value FROM engines WHERE configuration IS NOT NULL AND configuration <> '') s
  ), '[]'::jsonb),
  'fuelTypes', coalesce((
    SELECT jsonb_agg(value ORDER BY
      CASE value WHEN 'Diesel' THEN 0 WHEN 'Natural Gas' THEN 1 ELSE 2 END,
      value
    )
    FROM fuel_types
  ), '[]'::jsonb)
);
$$;
