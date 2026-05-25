// Insert 182 Yuchai diesel engine records from /tmp/yuchai_records.json
// Source: 2024年玉柴发电机组用发动机型谱（李深严）20240221.xlsx
// Sheets: 国四排放 (47), 国三排放 (93), 国二排放 (34), 备用发电动力 (8), 双速机 (13, upgrades single-speed)
// kWe = 推荐机组功率 (already electrical output); kVA = kWe / 0.8; kWm = 发动机功率 (mechanical)

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const records = JSON.parse(readFileSync('/tmp/yuchai_records.json', 'utf8'))
console.log(`Loaded ${records.length} Yuchai records`)

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
