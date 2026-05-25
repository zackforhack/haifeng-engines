// Patch engines table: fill missing kWm/kWe/kVA fields
// 121 engines across Baudouin, MTU, Cummins, Scania, Yuchai had partial data.
//
// Derivation rules (all use PF=0.8, alternator efficiency=0.9):
//   kWm known  → kWe = round(kWm * 0.9),  kVA = round(kWe / 0.8)
//   kWe known  → kWm = round(kWe / 0.9),  kVA = round(kWe / 0.8)
//   kVA known only → kWe = round(kVA * 0.8), kWm = round(kWe / 0.9)
//   kWm + kVA, kWe missing → kWe = round(kVA * 0.8)  (kVA more reliable for Cummins)

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function fillTriple(kw, kwe, kva) {
  // Returns [kw, kwe, kva] with all three derived where possible.
  // Priority: use whichever field is present, derive the others.
  if (kw != null && kwe == null && kva == null) {
    kwe = Math.round(kw * 0.9)
    kva = Math.round(kwe / 0.8)
  } else if (kwe != null && kw == null && kva == null) {
    kw  = Math.round(kwe / 0.9)
    kva = Math.round(kwe / 0.8)
  } else if (kva != null && kw == null && kwe == null) {
    kwe = Math.round(kva * 0.8)
    kw  = Math.round(kwe / 0.9)
  } else if (kw != null && kva != null && kwe == null) {
    // kWm + kVA both known: kWe from kVA (kVA is the published alternator output)
    kwe = Math.round(kva * 0.8)
  } else if (kwe != null && kva == null) {
    kva = Math.round(kwe / 0.8)
    if (kw == null) kw = Math.round(kwe / 0.9)
  } else if (kva != null && kwe != null && kw == null) {
    kw = Math.round(kwe / 0.9)
  }
  return [kw, kwe, kva]
}

// Fetch all engines
const all = []
let from = 0
while (true) {
  const { data, error } = await supabase.from('engines').select('*').range(from, from + 999)
  if (error) { console.error(error); process.exit(1) }
  all.push(...data)
  if (data.length < 1000) break
  from += 1000
}
console.log(`Loaded ${all.length} engines`)

const HZ    = ['50hz', '60hz']
const KINDS = ['prime', 'standby']

let patched = 0, ok = 0, failed = 0

for (const e of all) {
  const updates = {}

  for (const h of HZ) {
    for (const k of KINDS) {
      const fkw  = `${k}_power_kw_${h}`
      const fkwe = `${k}_power_kwe_${h}`
      const fkva = `${k}_power_kva_${h}`
      const kw = e[fkw], kwe = e[fkwe], kva = e[fkva]

      // Nothing to do if all present or all absent
      if (kw == null && kwe == null && kva == null) continue
      if (kw != null && kwe != null && kva != null) continue

      const [nkw, nkwe, nkva] = fillTriple(kw, kwe, kva)
      if (nkw !== kw)   updates[fkw]  = nkw
      if (nkwe !== kwe) updates[fkwe] = nkwe
      if (nkva !== kva) updates[fkva] = nkva
    }
  }

  if (Object.keys(updates).length === 0) continue
  patched++

  const { error } = await supabase
    .from('engines')
    .update(updates)
    .eq('slug', e.slug)

  if (error) {
    console.error(`Failed ${e.slug}: ${error.message}`)
    failed++
  } else {
    process.stdout.write('.')
    ok++
  }
}

console.log(`\n\nPatched ${patched} engines: ${ok} updated, ${failed} failed`)
