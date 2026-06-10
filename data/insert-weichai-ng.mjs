// Insert 12 Weichai natural gas engine records from /tmp/weichai_ng_records.json
// Source: 2026年潍柴动力(江都).pdf — gas section; kWm × 0.9 = kWe; kVA = kWe / 0.8
// All spark-ignited; WP series L4/L6, M series V-type

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const records = JSON.parse(readFileSync('/tmp/weichai_ng_records.json', 'utf8'))
console.log(`Loaded ${records.length} Weichai NG records`)

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
