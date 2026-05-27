-- Alternators table
CREATE TABLE IF NOT EXISTS alternators (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  series text,
  frame text,

  -- Power ratings @ 50 Hz, 0.8 pf
  prime_kva_50hz   numeric,
  prime_kw_50hz    numeric,
  standby_kva_50hz numeric,
  standby_kw_50hz  numeric,

  -- Power ratings @ 60 Hz, 0.8 pf
  prime_kva_60hz   numeric,
  prime_kw_60hz    numeric,
  standby_kva_60hz numeric,
  standby_kw_60hz  numeric,

  -- Electrical
  poles          integer,       -- 4 (1500/1800 rpm) or 2 (3000/3600 rpm)
  power_factor   numeric,       -- 0.8 default
  voltage_output text,          -- e.g. "380-480V"
  phases         integer DEFAULT 3,

  -- Physical
  weight_kg  numeric,
  length_mm  integer,
  width_mm   integer,
  height_mm  integer,

  -- Technical
  insulation_class text,        -- H, F
  ip_rating        text,        -- IP21, IP23
  excitation_type  text,        -- Brushless, PMG, SE
  efficiency       numeric,     -- e.g. 95.2

  origin      text,
  status      text NOT NULL DEFAULT 'active',
  description text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS alternators_brand_idx ON alternators(brand);
CREATE INDEX IF NOT EXISTS alternators_slug_idx  ON alternators(slug);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_alternators_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS alternators_updated_at ON alternators;
CREATE TRIGGER alternators_updated_at
  BEFORE UPDATE ON alternators
  FOR EACH ROW EXECUTE FUNCTION update_alternators_updated_at();
