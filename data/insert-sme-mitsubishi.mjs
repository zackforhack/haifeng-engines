// Insert 16 Mitsubishi S-series engine records (manufactured by SME Shanghai)
// Source: 2026年SME产品价格.pdf — Shanghai MHI Engine Co., Ltd.
// All 50 Hz / 1500 rpm; 备用=standby kWm, 常用=prime kWm
// kWe = kWm * 0.9; kVA = kWe / 0.8
// Series: S6R2 (L6, 17.46L), S12R (V12, 34.92L), S16R/S16R2 (V16, 46.56L)

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const records = JSON.parse(readFileSync('/tmp/sme_mitsubishi_records.json', 'utf8'))
console.log(`Loaded ${records.length} Mitsubishi SME records`)

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
