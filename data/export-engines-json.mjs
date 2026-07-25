// Export the live engine table for offline QA and certification analysis.
// Usage: node data/export-engines-json.mjs /tmp/haifeng-engines.json

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const outputPath = process.argv[2]
if (!outputPath) throw new Error('An output JSON path is required')
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)
const pageSize = 1000
const engines = []

for (let from = 0; ; from += pageSize) {
  const { data, error } = await supabase
    .from('engines')
    .select('*')
    .order('id')
    .range(from, from + pageSize - 1)
  if (error) throw error
  engines.push(...data)
  if (data.length < pageSize) break
}

fs.writeFileSync(outputPath, `${JSON.stringify(engines, null, 2)}\n`)
console.log(`Exported ${engines.length} engines to ${outputPath}`)
