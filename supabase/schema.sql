-- Diesel Engine Encyclopedia Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS engines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  series TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'limited')),
  year_introduced INTEGER,
  year_discontinued INTEGER,

  -- Power specs
  power_kw NUMERIC,
  power_hp NUMERIC,
  displacement_l NUMERIC,
  cylinders INTEGER,
  configuration TEXT,

  -- Performance
  rpm_rated INTEGER,
  rpm_max INTEGER,
  fuel_consumption_l_per_hr NUMERIC,
  compression_ratio TEXT,

  -- Physical
  weight_kg NUMERIC,
  length_mm INTEGER,
  width_mm INTEGER,
  height_mm INTEGER,

  -- Compliance
  emissions_standard TEXT,
  certifications TEXT[],

  -- Compatibility
  compatible_generator_brands TEXT[],

  -- Content
  description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engine_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id UUID NOT NULL REFERENCES engines(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'datasheet' CHECK (type IN ('datasheet', 'manual', 'brochure', 'other')),
  label TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER engines_updated_at
  BEFORE UPDATE ON engines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_engines_brand ON engines(brand);
CREATE INDEX IF NOT EXISTS idx_engines_status ON engines(status);
CREATE INDEX IF NOT EXISTS idx_engines_slug ON engines(slug);
CREATE INDEX IF NOT EXISTS idx_engine_pdfs_engine_id ON engine_pdfs(engine_id);

-- Enable Row Level Security (read-only public access)
ALTER TABLE engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE engine_pdfs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read engines" ON engines FOR SELECT USING (true);
CREATE POLICY "Public read engine_pdfs" ON engine_pdfs FOR SELECT USING (true);

-- Supabase Storage bucket for PDFs (run separately or via dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('engine-pdfs', 'engine-pdfs', true);
