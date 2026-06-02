import { createClient } from '@supabase/supabase-js'

// Baudouin sheets publish PRP (prime) and ESP (standby) engine output (kWm). The DB only
// captured ONE rating per model (mostly prime). We read each sheet's net ESP/PRP kWm ratio
// and apply it to the stored rating to fill the missing one — keeping kWe/kVA/kWm consistent.
// Direction: have prime → derive standby (×ratio); have only standby → derive prime (÷ratio).
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const PUB = 'https://ntrysdovwnbegxtjsqkz.supabase.co/storage/v1/object/public/engine-pdfs/'
const APPLY = process.argv.includes('--apply')
const round1 = (n) => Math.round(n * 10) / 10

// Parse the "1500" / "1800" ratings row → net ESP/PRP kWm ratio (fallback to gross, then 1.10).
async function sheetRatio(storagePath) {
  try {
    const res = await fetch(PUB + storagePath)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    // pdftotext via child process
    const { execFileSync } = await import('child_process')
    const fs = await import('fs')
    const tmp = `/tmp/_baud_${Math.random().toString(36).slice(2)}.pdf`
    fs.writeFileSync(tmp, buf)
    const txt = execFileSync('pdftotext', ['-layout', tmp, '-']).toString()
    fs.unlinkSync(tmp)
    for (const line of txt.split('\n')) {
      const t = line.trim()
      if (!/^1(500|800)\b/.test(t)) continue
      const nums = t.split(/\s+/).map(Number).filter((n) => !Number.isNaN(n))
      if (nums.length >= 9) return nums[7] / nums[5]   // net ESP / net PRP kWm
      if (nums.length >= 5) return nums[3] / nums[1]   // gross ESP / gross PRP kWm
    }
  } catch { /* fall through */ }
  return null
}

const { data: engs } = await supabase.from('engines').select('*').eq('brand', 'Baudouin').order('model')
const { data: pdfs } = await supabase.from('engine_pdfs').select('engine_id, storage_path').like('storage_path', 'baudouin/%')
const sheetFor = (e) => {
  const own = `baudouin/spec-sheets/${e.model.replace(/\//g, '-')}.pdf`
  const rows = pdfs.filter((p) => p.engine_id === e.id)
  return rows.find((p) => p.storage_path === own)?.storage_path ?? rows[0]?.storage_path ?? null
}

const FREQS = [50, 60]
let toUpdate = 0, validated = []

for (const e of engs) {
  const sp = sheetFor(e)
  let ratio = sp ? await sheetRatio(sp) : null
  if (!ratio || ratio < 1.02 || ratio > 1.25) ratio = 1.10   // sanity guard
  const upd = {}

  for (const f of FREQS) {
    const pk = e[`prime_power_kwe_${f}hz`], sk = e[`standby_power_kwe_${f}hz`]
    const pw = e[`prime_power_kw_${f}hz`], sw = e[`standby_power_kw_${f}hz`]
    // validation: engines that already have both — compare derived vs stored
    if (pk != null && sk != null) validated.push(`${e.model} ${f}Hz: stored sb ${sk} vs derived ${Math.round(pk * ratio)} (r=${ratio.toFixed(3)})`)

    if (pk != null && sk == null) {
      const skNew = Math.round(pk * ratio)
      upd[`standby_power_kwe_${f}hz`] = skNew
      upd[`standby_power_kva_${f}hz`] = round1(skNew / 0.8)
      if (pw != null) upd[`standby_power_kw_${f}hz`] = round1(pw * ratio)
    } else if (sk != null && pk == null) {
      const pkNew = Math.round(sk / ratio)
      upd[`prime_power_kwe_${f}hz`] = pkNew
      upd[`prime_power_kva_${f}hz`] = round1(pkNew / 0.8)
      if (sw != null) upd[`prime_power_kw_${f}hz`] = round1(sw / ratio)
    }
  }

  if (Object.keys(upd).length) {
    toUpdate++
    const desc = Object.entries(upd).map(([k, v]) => `${k.replace('_power', '').replace('_50hz', '·50').replace('_60hz', '·60')}=${v}`).join(' ')
    console.log(`${e.model.padEnd(15)} r=${ratio.toFixed(3)}  ${desc}`)
    if (APPLY) {
      const { error } = await supabase.from('engines').update(upd).eq('id', e.id)
      if (error) console.error(`  ✗ ${e.model}: ${error.message}`)
    }
  }
}

console.log(`\n${toUpdate} engines ${APPLY ? 'updated' : 'to update (dry run)'}`)
console.log('\nValidation (already-dual-rated models — derived should ≈ stored):')
for (const v of validated) console.log('  ' + v)
