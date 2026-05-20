-- Migration: Add origin (country of manufacture) column
ALTER TABLE engines ADD COLUMN IF NOT EXISTS origin TEXT;
