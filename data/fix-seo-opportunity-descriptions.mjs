// Targeted editorial descriptions for GSC near-page-one model pages.
// Source priority list: SEO-GROWTH-OPPORTUNITY-BATCH-2026-07-12.md

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const updates = {
  'perkins-1206a-e70ttag2':
    'Perkins 1206A-E70TTAG2 1200 Series diesel generator engine for 50 Hz power generation. Rated 184 kWe prime / 200 kWe standby at 1500 rpm, with official ElectropaK datasheet and unregulated-market selection chart linked for generator package sizing.',
  'yuchai-yc16vtd2270-d30':
    'Yuchai YC16VTD2270-D30 16VTD series V16 diesel generator engine for high-power 50 Hz generator sets. Rated 1350 kWe prime / 1500 kWe standby at 1500 rpm, with China National Stage III / unregulated emissions coverage and official Yuchai spec sheet linked.',
}

const { data, error } = await supabase
  .from('engines')
  .select('slug, model, description')
  .in('slug', Object.keys(updates))

if (error) {
  console.error(error.message)
  process.exit(1)
}

const found = new Set((data ?? []).map((row) => row.slug))
const missing = Object.keys(updates).filter((slug) => !found.has(slug))
if (missing.length) {
  console.error(`Missing rows: ${missing.join(', ')}`)
  process.exit(1)
}

for (const row of data ?? []) {
  const description = updates[row.slug]
  const { error: updateError } = await supabase
    .from('engines')
    .update({ description })
    .eq('slug', row.slug)

  if (updateError) {
    console.error(`Failed ${row.slug}: ${updateError.message}`)
    process.exit(1)
  }

  console.log(`${row.model}: ${row.description ? 'updated' : 'filled'} description`)
}

console.log(`Updated ${Object.keys(updates).length} SEO opportunity descriptions`)
