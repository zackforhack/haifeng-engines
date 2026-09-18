// User-supplied 2026 lineup is authoritative for specifications; brochure identifies BEINEI.
// Run: node data/add-beinei-engines-2026-09.mjs [--apply]
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { loadLocalEnv, requireEnv } from '../tests/helpers/env.mjs'

const apply = process.argv.includes('--apply')
const brand = 'BEINEI'
// model, cylinders, bore, stroke, displacement, aspiration, kW at 1500/1800/high RPM,
// high RPM, length, width, height, net weight. Null means not supplied, never zero.
const specs = [
  ['F2L912',2,100,120,1.88,'naturally aspirated',14,17,20,2300,678,704,872,245],
  ['F3L912',3,100,120,2.828,'naturally aspirated',24,28,36,2300,730,673,815,275],
  ['F4L912',4,100,120,3.77,'naturally aspirated',32,38,46,2300,860,673,815,300],
  ['F4L913',4,102,125,4.086,'naturally aspirated',34,40,50,2300,860,673,820,310],
  ['F4L912T',4,100,120,3.77,'turbocharged',41,48,null,null,865,673,815,310],
  ['F4L914',4,102,132,4.314,'naturally aspirated',41,46,50,2300,860,679,821,310],
  ['F6L912',6,100,120,5.655,'naturally aspirated',48,60,74,2300,1120,673,815,410],
  ['F6L913',6,102,125,6.128,'naturally aspirated',51,65,79,2300,1120,673,820,420],
  ['F6L912T',6,100,120,5.655,'turbocharged',61,72,null,null,1125,673,815,420],
  ['F6L914',6,102,132,6.472,'naturally aspirated',62,73,79,2300,1120,679,821,420],
  ['BF4L913',4,102,125,4.086,'turbocharged',57,66,66,2300,865,692,845,350],
  ['BF6L913',6,102,125,6.128,'turbocharged',88,106,112,2300,1134,711,910,485],
  ['BF6L914',6,102,132,6.472,'turbocharged',89,106,112,2300,1125,776,821,485],
  ['BF6L913C',6,102,125,6.128,'turbocharged',114,130,125,2300,1134,711,990,510],
  ['4D22',4,84,100,2.216,'naturally aspirated',18,21,34,3000,950,520,850,218],
  ['4D22T',4,84,100,2.216,'turbocharged',24,28,null,null,660,490,700,194],
]
const rows = specs.map(([model,cylinders,bore,stroke,displacement_l,aspiration,p1500,p1800,pHigh,highRpm,length_mm,width_mm,height_mm,weight_kg]) => {
  const water = model.startsWith('4D22')
  return {
    slug: `beinei-${model.toLowerCase()}`, brand, model,
    series: water ? '4D22 Series' : `${model.match(/91[234]/)[0]} Series`,
    status: 'active', origin: 'China', fuel_type: 'Diesel', ignition_type: 'Compression Ignition',
    cooling_method: water ? 'Liquid-Cooled' : 'Air-Cooled',
    configuration: `L${cylinders}, four-stroke, ${aspiration}`,
    cylinders, displacement_l, length_mm, width_mm, height_mm, weight_kg,
    power_kw: p1500, power_hp: Math.round(p1500 / 0.7457 * 10) / 10, rpm_rated: 1500,
    description: `BEINEI (北内) ${model} from Beijing Beinei Diesel Engine Co., Ltd. (北京北内柴油机有限责任公司). `
      + `The user-supplied 2026 engine lineup lists an inline ${cylinders}-cylinder, four-stroke, ${water ? 'water-cooled' : 'air-cooled'}, ${aspiration} diesel engine with ${displacement_l} L displacement and ${bore} × ${stroke} mm bore × stroke. `
      + `Published mechanical power: ${p1500} kW at 1500 rpm; ${p1800} kW at 1800 rpm${pHigh == null ? '' : `; ${pHigh} kW at ${highRpm} rpm`}. `
      + `Dimensions (L × W × H): ${length_mm} × ${width_mm} × ${height_mm} mm; net weight: ${weight_kg} kg. `
      + 'Power duty is not specified in the 2026 table; prime, standby, electrical output and emissions certification are not inferred. The attached older brochure provides manufacturer and family reference information; the 2026 table takes precedence for these specifications.',
  }
})
assert.equal(rows.length, 16)
assert.equal(new Set(rows.map(r => r.slug)).size, 16)
assert.equal(rows.filter(r => r.cooling_method === 'Air-Cooled').length, 14)
const documents = [
  { local: 'data/sources/beinei/product-brochure.pdf', storage_path: 'beinei/product-brochure.pdf', type: 'brochure', label: 'BEINEI Product Brochure (manufacturer and family reference)', contentType: 'application/pdf' },
  { local: 'data/sources/beinei/2026-engine-lineup.png', storage_path: 'beinei/2026-engine-lineup.png', type: 'other', label: 'BEINEI 2026 Engine Lineup — source specification table (PNG)', contentType: 'image/png' },
].map(doc => {
  const bytes = fs.readFileSync(doc.local)
  assert.ok(doc.contentType === 'application/pdf' ? bytes.subarray(0,4).toString() === '%PDF' : bytes.subarray(1,4).toString() === 'PNG')
  return {...doc, bytes, file_size_bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')}
})
loadLocalEnv()
const clientOptions = {global:{fetch:(url,init)=>fetch(url,{...init,signal:AbortSignal.timeout(60000)})}}
const client = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv(apply ? 'SUPABASE_SERVICE_KEY' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),clientOptions)
async function readBrand() {
  const {data,error} = await client.from('engines').select('*,pdfs:engine_pdfs(*)').eq('brand',brand).abortSignal(AbortSignal.timeout(30000))
  if (error) throw error
  return data
}
const existing = await readBrand()
for (const r of existing) assert.ok(rows.some(row => row.slug === r.slug && row.model === r.model), `Unexpected existing BEINEI record: ${r.slug}`)
console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${rows.length} models, ${existing.length} already present; ${documents.length} shared source files.`)
if (!apply) {
  console.table(rows.map(r => ({model:r.model,kW:r.power_kw,rpm:r.rpm_rated,litres:r.displacement_l,cooling:r.cooling_method,kg:r.weight_kg})))
  process.exit(0)
}
for (const doc of documents) {
  console.log(`Source: ${doc.storage_path}`)
  const {data:files,error:listError} = await client.storage.from('engine-pdfs').list('beinei')
  if (listError) throw listError
  // Final public download verification checks the full SHA-256 even when upload is skipped.
  if (files.some(file => file.name === doc.storage_path.split('/').at(-1) && file.metadata?.size === doc.file_size_bytes)) continue
  const {error} = await client.storage.from('engine-pdfs').upload(doc.storage_path,doc.bytes,{contentType:doc.contentType,upsert:true})
  if (error) throw error
}
// Insert only missing models so reruns cannot overwrite subsequent catalog edits.
const missing = rows.filter(r => !existing.some(e => e.slug === r.slug))
console.log(`Inserting ${missing.length} missing models`)
if (missing.length) {
  const {error} = await client.from('engines').insert(missing)
  if (error) throw error
}
let saved = await readBrand()
console.log(`Read back ${saved.length} models; attaching source links`)
const links = saved.flatMap(engine => documents.filter(doc => !engine.pdfs.some(p => p.storage_path === doc.storage_path)).map(doc => ({
  engine_id:engine.id,type:doc.type,label:doc.label,storage_path:doc.storage_path,file_size_bytes:doc.file_size_bytes,
})))
if (links.length) {
  const {error} = await client.from('engine_pdfs').insert(links)
  if (error) throw error
}
// Verify through the public client's RLS and check every supplied field, not only row counts.
console.log('Verifying public records and source downloads')
const publicClient = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'),requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),clientOptions)
const result = await publicClient.from('engines').select('*,pdfs:engine_pdfs(*)').eq('brand',brand)
if (result.error) throw result.error
saved = result.data
assert.equal(saved.length,16)
for (const expected of rows) {
  const actual = saved.find(r => r.slug === expected.slug)
  for (const [key,value] of Object.entries(expected)) assert.equal(actual[key],value,`${expected.model}.${key}`)
  for (const doc of documents) assert.equal(actual.pdfs.filter(p => p.storage_path === doc.storage_path).length,1)
  for (const key of Object.keys(actual).filter(k => /^(prime|standby)_power_/.test(k))) assert.equal(actual[key],null)
}
for (const doc of documents) {
  const {data:{publicUrl}} = publicClient.storage.from('engine-pdfs').getPublicUrl(doc.storage_path)
  const response = await fetch(publicUrl,{signal:AbortSignal.timeout(60000)})
  assert.ok(response.ok, `Source download failed: ${doc.storage_path}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  assert.equal(createHash('sha256').update(bytes).digest('hex'),doc.sha256)
}
const report = `# BEINEI engine addition\n\nDate: 2026-09-18\n\nAdded ${missing.length} models; verified all 16 public BEINEI records and 32 document links. Both uploaded originals passed SHA-256 download verification.\n\nBrand: BEINEI / 北内 / Beijing Beinei Diesel Engine Co., Ltd.\n\n## Source handling\n\nThe supplied 2026 table is authoritative for all imported model specifications. The older 20-page brochure establishes manufacturer identity and family context. Fourteen models are air-cooled and two (4D22, 4D22T) are water-cooled. Model names remain exactly as supplied; they are not merged with Deutz models or renamed to the brochure's BN4D22 variants.\n\nThe generic power field stores the listed 1500 rpm mechanical power. Every other published speed/power pair, bore and stroke, and aspiration is preserved in the description. No prime/standby, generator kWe/kVA, maximum RPM, emissions or certification values were inferred. Blank high-speed cells remain unspecified. BF6L913C retains 130 kW at 1800 rpm and 125 kW at 2300 rpm exactly as supplied.\n\n## Models\n\n| Model | kW @ 1500 rpm | kW @ 1800 rpm | Additional kW @ rpm |\n|---|---:|---:|---|\n${specs.map(s => `| ${s[0]} | ${s[6]} | ${s[7]} | ${s[8] == null ? 'Not supplied' : `${s[8]} @ ${s[9]}`} |`).join('\n')}\n\n## Source files\n\n${documents.map(d=>`- ${d.local}; SHA-256: ${d.sha256}`).join('\n')}\n`
fs.writeFileSync('reports/beinei-engine-addition-2026-09-18.md',report)
console.log('Verified: 16 public models, 32 source links, 2 byte-identical public source downloads.')
