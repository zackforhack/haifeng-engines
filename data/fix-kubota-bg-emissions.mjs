// Correct Kubota BG-series emissions from:
// 久保田BG系列发动机型谱表-20260105.pdf
//
// PDF emission columns:
//   欧五 = Euro Stage V
//   美四 = U.S. EPA Final Tier 4
//   国四 = China Nonroad Stage IV
//   中国出口豁免 = export exemption, not an emissions standard facet.
// Rows that only show 中国出口豁免 are stored as Unregulated.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const S = {
  euro5: 'Euro Stage V',
  epa4: 'U.S. EPA Final Tier 4',
  china4: 'China Nonroad Stage IV',
  unregulated: 'Unregulated',
}

const join = (...values) => values.join(' / ')

const updates = {
  // 50 Hz rows
  'kubota-z482-b-chn-1': join(S.unregulated),
  'kubota-z482-e3b-chn-1': join(S.unregulated),
  'kubota-z482-e3b-chn-2': join(S.unregulated),
  'kubota-z482-e4b-chn-4': join(S.euro5, S.china4),
  'kubota-z482-e4bg2-chn-1': join(S.euro5, S.china4),
  'kubota-d722-e3b-chn-1': join(S.unregulated),
  'kubota-d722-e4b-chn-1': join(S.euro5, S.china4),
  'kubota-d905-e2bg-chn-1': join(S.unregulated),
  'kubota-d1005-e2b-chn-1': join(S.unregulated),
  'kubota-d1005-e3b-chn-1': join(S.unregulated),
  'kubota-d1105-e2bg-chn-1': join(S.unregulated),
  'kubota-d1105-e3bg2-chn-1': join(S.unregulated),
  'kubota-d1105-e4bg2-chn-1': join(S.euro5, S.china4),
  'kubota-d1703-e2bg-chn-1': join(S.unregulated),
  'kubota-d1703-m-e4bg2-chn-1': join(S.euro5),
  'kubota-d1803-m-di-bg-chn-1t': join(S.unregulated),
  'kubota-v1305-e2b-chn-1': join(S.unregulated),
  'kubota-v1505-e2bg-chn-1': join(S.unregulated),
  'kubota-v1505-e3b-cwl-1': join(S.china4),
  'kubota-v1505-e4bg2-chn-1': join(S.euro5, S.china4),
  'kubota-v1505-t-e3b-eu-z1': join(S.china4),
  'kubota-v2003-t-e2bg-chn-1': join(S.unregulated),
  'kubota-v2203-e2bg-chn-1': join(S.unregulated),
  'kubota-v2203-m-e3bg-chn-1': join(S.unregulated),
  'kubota-v2403-m-di-bg-chn-1t': join(S.unregulated),
  'kubota-v3300-e2bg2-chn-1': join(S.unregulated),
  'kubota-v3300-t-e2bg2-chn-1': join(S.unregulated),
  'kubota-v3800di-t-e2bg-chn-2': join(S.unregulated),

  // 60 Hz rows
  'kubota-z482-e4b-chn-1': join(S.epa4),
  'kubota-z482-e4b-chn-2': join(S.epa4),
  'kubota-z482-e4b-chn-3': join(S.epa4),
  'kubota-d722-e3b-chn-2': join(S.unregulated),
  'kubota-d722-e4b-eu-x2': join(S.epa4, S.china4),
  'kubota-d902-e4b-eu-x2': join(S.euro5, S.china4),
  'kubota-d1005-e4bg1-sae-2': join(S.epa4),
  'kubota-d1105-e4bg1-sae-2x': join(S.epa4),
  'kubota-d1305-e4bg1-chn-1': join(S.epa4),
  'kubota-d1703-m-e3bg-chn-1': join(S.unregulated),
  'kubota-v1505-e4bg1-sae-2x': join(S.epa4),
  'kubota-v3300-e2bg-chn-1': join(S.unregulated),
  'kubota-v3300-e3bg-chn-1': join(S.unregulated),
  'kubota-v3300-t-e2bg-chn-1': join(S.unregulated),
  'kubota-v3600-t-e3bg-chn-1': join(S.unregulated),
  'kubota-v3800di-t-e3bg-chn-1': join(S.unregulated),
  'kubota-wg3800-n-c': join(S.unregulated),
}

const slugs = Object.keys(updates)

const { data: before, error: beforeError } = await supabase
  .from('engines')
  .select('slug, model, emissions_standard')
  .eq('brand', 'Kubota')
  .in('slug', slugs)
  .order('slug')

if (beforeError) {
  console.error(beforeError.message)
  process.exit(1)
}

const found = new Set(before.map((row) => row.slug))
const missing = slugs.filter((slug) => !found.has(slug))
if (missing.length) {
  console.error(`Missing Kubota rows: ${missing.join(', ')}`)
  process.exit(1)
}

let changed = 0

for (const row of before) {
  const next = updates[row.slug]
  if (row.emissions_standard === next) continue

  const { error } = await supabase
    .from('engines')
    .update({ emissions_standard: next })
    .eq('slug', row.slug)

  if (error) {
    console.error(`Failed ${row.slug}: ${error.message}`)
    process.exit(1)
  }

  changed += 1
  console.log(`${row.model}: ${row.emissions_standard || '(blank)'} -> ${next}`)
}

console.log(`Updated ${changed} Kubota BG emissions records`)
