// Insert 62 John Deere diesel engine records from /tmp/jd_records.json
// Source: John Deere Generator Drive Selection Guide PDF
// 5 sections: FT4+StageV, FT4, Tier3(60Hz only), Tier3+StageIIIA, Non-Certified
// kWm/kWe/kVA all given directly in PDF — no conversion needed

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const records = JSON.parse(readFileSync('/tmp/jd_records.json', 'utf8'))
console.log(`Loaded ${records.length} John Deere records`)

let ok = 0, failed = 0

for (const rec of records) {
  const { error } = await supabase.from('engines').upsert(rec, { onConflict: 'slug' })
  if (error) {
    console.error(`Failed ${rec.slug}: ${error.message}`)
    failed++
  } else {
    process.stdout.write('.')
    ok++
  }
}

console.log(`\n\n=== DONE: ${ok} upserted, ${failed} failed ===`)
