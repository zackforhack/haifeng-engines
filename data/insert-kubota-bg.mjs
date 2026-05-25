// Insert 45 Kubota BG-series engine records from /tmp/kubota_bg_records.json
// Source: 久保田BG系列发动机型谱表-20260105.pdf
// Tables: 50Hz (1500/3000 rpm) and 60Hz (1800/3600 rpm)
// Series: Z (2-cyl), D (3-cyl), V (4-cyl), WG (4-cyl gasoline)
// kWm values from PDF; kWe = kWm * 0.9; kVA = kWe / 0.8

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const records = JSON.parse(readFileSync('/tmp/kubota_bg_records.json', 'utf8'))
console.log(`Loaded ${records.length} Kubota BG records`)

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
