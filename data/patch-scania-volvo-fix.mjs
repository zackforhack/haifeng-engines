import { createClient } from '@supabase/supabase-js'
const sb = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)

// Scania DC16/OC16 are V8 engines — my normalizeConfig incorrectly set them to L8
const SCANIA_V8 = [
  'scania-dc16-084a-01-01a',
  'scania-dc16-084a-01-01b',
  'scania-dc16-084a-01-01c',
  'scania-oc16-071a-02-91',
]

// Volvo Penta engines that failed with network error — config was Inline-6, correct value is L6
const VOLVO_L6 = [
  'volvo-penta-tad883ve',
  'volvo-penta-tad1353ge',
  'volvo-penta-tad1354ge',
  'volvo-penta-tad1355ge',
  'volvo-penta-tad1650ge',
  'volvo-penta-tad1651ge',
  'volvo-penta-tad1380ge',
]

let ok = 0, failed = 0

for (const slug of SCANIA_V8) {
  const { error } = await sb.from('engines').update({ configuration: 'V8' }).eq('slug', slug)
  if (error) { console.error(`FAIL ${slug}: ${error.message}`); failed++ }
  else { console.log(`  V8 → ${slug}`); ok++ }
}

for (const slug of VOLVO_L6) {
  const { error } = await sb.from('engines').update({ configuration: 'L6' }).eq('slug', slug)
  if (error) { console.error(`FAIL ${slug}: ${error.message}`); failed++ }
  else { console.log(`  L6 → ${slug}`); ok++ }
}

console.log(`\n=== DONE: ${ok} updated, ${failed} failed ===`)
