-- Alternators were seeded with the service key (bypasses RLS), but the table
-- had RLS enabled with no public-read policy — so the website (anon key) saw 0
-- rows and every /alternators/[slug] page 404'd. Mirror the engines policy.
-- Run this in the Supabase SQL Editor.

ALTER TABLE alternators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read alternators" ON alternators FOR SELECT USING (true);
