// Insert 55 Yunnei diesel engine records from /tmp/yunnei_records.json
// Source: 云内产品选型.pdf (Kunming Yunnei Power generator selection guide)
// Sections: 欧三A/欧五排放 (43 engines: DEF20/DEF30/DEF47 series, EU Stage V + EU Stage IIIA)
//           六缸/国三排放 (12 engines: D6R/D6S/D6T series, China National Stage III)
// kWm = 净功率 (net mechanical shaft output); kWe = kWm * 0.9; kVA = kWe / 0.8
// No standby values provided in PDF — standby fields null

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const records = JSON.parse(readFileSync('/tmp/yunnei_records.json', 'utf8'))
console.log(`Loaded ${records.length} Yunnei records`)

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
