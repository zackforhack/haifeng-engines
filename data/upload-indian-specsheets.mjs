import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Docs for the Indian brands (Kirloskar/KOEL, Greaves, Mahindra Powerol, Ashok Leyland),
// from manufacturer sites and authorized-distributor genset spec sheets. Per-model genset
// specs where available, official range brochures as fallback.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

const T = [
  // Kirloskar (KOEL) DV-series HHP
  { brand: 'Kirloskar', models: ['DV8TA'], url: 'https://www.abhishekpower.com/400%20KVA%20DV8.pdf', type: 'datasheet', label: 'Kirloskar DV8TA Genset Spec Sheet (400 kVA)', store: 'kirloskar/spec-sheets/dv8ta.pdf' },
  { brand: 'Kirloskar', models: ['DV10TA'], url: 'https://kwh.mx/fichaspdf/044_PRP_Specs_60Hz_500kVA_DV10_Rev02.pdf', type: 'datasheet', label: 'Kirloskar DV10TA Genset Spec Sheet (500 kVA)', store: 'kirloskar/spec-sheets/dv10ta.pdf' },
  { brand: 'Kirloskar', models: ['DV12TA'], url: 'https://www.accurategensets.com/images/products/Final_Kirloskar_Green_750_kVA_to_1500_kVA.pdf', type: 'brochure', label: 'Kirloskar Green HHP 750–1500 kVA Range (DV12TA)', store: 'kirloskar/brochures/koel-green-750-1500kva.pdf' },

  // Greaves GPWII-PII genset spec sheets
  { brand: 'Greaves', models: ['GPWII-PII-15X'], url: 'https://www.equiptrades.com/wp-content/uploads/2020/05/GPWII-PII-15X.pdf', type: 'datasheet', label: 'Greaves GPWII-PII-15X Genset Spec Sheet', store: 'greaves/spec-sheets/gpwii-pii-15x.pdf' },
  { brand: 'Greaves', models: ['GPWII-PII-25E'], url: 'https://www.equiptrades.com/wp-content/uploads/2020/05/GPWII-PII-25E.pdf', type: 'datasheet', label: 'Greaves GPWII-PII-25E Genset Spec Sheet', store: 'greaves/spec-sheets/gpwii-pii-25e.pdf' },
  { brand: 'Greaves', models: ['GPWII-PII-62.5'], url: 'https://www.equiptrades.com/wp-content/uploads/2020/05/GPWII-PII-62.5.pdf', type: 'datasheet', label: 'Greaves GPWII-PII-62.5 Genset Spec Sheet', store: 'greaves/spec-sheets/gpwii-pii-62-5.pdf' },
  { brand: 'Greaves', models: ['GPWII-PII-200'], url: 'https://5.imimg.com/data5/NT/FU/MY-10084521/greaves-200-kva-generator-set.pdf', type: 'datasheet', label: 'Greaves GPWII-PII-200 Genset Spec Sheet', store: 'greaves/spec-sheets/gpwii-pii-200.pdf' },
  { brand: 'Greaves', models: ['GPWII-PII-250'], url: 'https://4.imimg.com/data4/WD/EM/MY-2576899/greaves-power-generator-250kva.pdf', type: 'datasheet', label: 'Greaves GPWII-PII-250 Genset Spec Sheet', store: 'greaves/spec-sheets/gpwii-pii-250.pdf' },

  // Mahindra Powerol — official genset range brochure (no per-engine spec sheets published)
  { brand: 'Mahindra', models: ['4905 GMA-C2', 'mPower41565G', 'mPower61565G', 'mPower63105G'], url: 'https://www.mahindrapowerol.com/pdf/10-650kVA.pdf', type: 'brochure', label: 'Mahindra Powerol Diesel Genset Range (10–650 kVA)', store: 'mahindra/brochures/powerol-10-650kva.pdf' },

  // Ashok Leyland
  { brand: 'Ashok Leyland', models: ['H6G4DE125'], url: 'http://5.imimg.com/data5/SELLER/Doc/2025/9/547973609/JZ/HH/AS/970583/genlite-125-kva-diesel-generator-power-by-ashok-leyland.pdf', type: 'datasheet', label: 'Ashok Leyland H6G4DE125 Genset Spec Sheet (125 kVA)', store: 'ashok-leyland/spec-sheets/h6g4de125.pdf' },
  { brand: 'Ashok Leyland', models: ['AL8NTIDG6'], url: 'https://5.imimg.com/data5/ML/KB/YJ/SELLER-7461899/ashok-leyland-dg-set.pdf', type: 'datasheet', label: 'Ashok Leyland AL8NTIDG6 LEYPOWER Genset Spec (250 kVA)', store: 'ashok-leyland/spec-sheets/al8ntidg6.pdf' },
  { brand: 'Ashok Leyland', models: ['H4G4DE100', 'H6G4DE160'], url: 'https://horsepowersolutions.in/wp-content/uploads/2024/10/Ashok_leyland_Brochure.pdf', type: 'brochure', label: 'Ashok Leyland Power Solutions Genset Brochure', store: 'ashok-leyland/brochures/power-solutions.pdf' },
]

async function dl(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(60000) })
    if (!r.ok) return null
    const b = Buffer.from(await r.arrayBuffer())
    return b.slice(0, 4).toString() === '%PDF' ? b : null
  } catch { return null }
}

let linked = 0, fail = 0
for (const t of T) {
  process.stdout.write(`${t.brand} ${t.models.join('/')} ... `)
  const buf = await dl(t.url)
  if (!buf) { console.log('download failed'); fail += t.models.length; continue }
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(t.store, buf, { contentType: 'application/pdf', upsert: true })
  if (upErr) { console.log('upload failed: ' + upErr.message); fail += t.models.length; continue }
  const { data: rows } = await supabase.from('engines').select('id, model').eq('brand', t.brand).in('model', t.models)
  let n = 0
  for (const r of rows ?? []) {
    await supabase.from('engine_pdfs').delete().eq('engine_id', r.id).eq('storage_path', t.store)
    const { error } = await supabase.from('engine_pdfs').insert({ engine_id: r.id, type: t.type, label: t.label, storage_path: t.store, file_size_bytes: buf.length })
    if (!error) { n++; linked++ }
  }
  console.log(`${Math.round(buf.length / 1024)}KB ✓ ${n} link(s)`)
}
console.log(`\n✓ ${linked} engine links · ${fail} failed`)
