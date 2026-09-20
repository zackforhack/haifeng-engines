// node --env-file=.env.local data/add-abc-evolve-engines-2026-09.mjs [--apply]
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { loadLocalEnv, requireEnv } from '../tests/helpers/env.mjs'

const APPLY = process.argv.includes('--apply')
const sourceDir = 'data/sources/abc-evolve-2026-09'
const manifest = JSON.parse(fs.readFileSync(`${sourceDir}/manifest.json`, 'utf8'))
const sources = new Map(manifest.sources.map(source => {
  const bytes = fs.readFileSync(source.path)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256)
  return [source.key, {...source, text:bytes.toString()}]
}))
const launch = sources.get('16ev23-launch')
for (const token of ['01 Sep 2026','330 kW per cylinder','360 kW per cylinder','single-stage turbocharging']) assert.ok(launch.text.includes(token),token)
const definitions = [
  {model:'4EL23',cylinders:4,layout:'L',kw:1320,source:'4el23',year:2021},
  {model:'6EL23',cylinders:6,layout:'L',kw:2160,source:'6el23',bore:230,stroke:310},
  {model:'8EL23',cylinders:8,layout:'L',kw:2880,source:'8el23',bore:230,stroke:310},
  {model:'12EV23',cylinders:12,layout:'V',calculatedKw:4320,source:'12ev23-launch',bore:230,stroke:310,year:2025},
  {model:'16EV23',cylinders:16,layout:'V',calculatedKw:5760,source:'16ev23-launch',year:2026},
  {model:'20EV23',cylinders:20,layout:'V',kw:7200,source:'20ev23'},
]
const records = definitions.map(d => {
  const source = sources.get(d.source)
  assert.ok(source.text.includes(d.model))
  assert.ok(launch.text.includes(d.model))
  if (d.kw) {
    assert.ok(source.text.includes(`${d.kw.toLocaleString('en-US')} kWm`))
    assert.ok(source.text.includes('1,200 rpm'))
  }
  const displacement = d.bore ? Math.round(d.cylinders * Math.PI / 4 * d.bore ** 2 * d.stroke / 1e6 * 10) / 10 : null
  const rating = d.kw
    ? `ABC publishes up to ${d.kw.toLocaleString('en-US')} kW mechanical ${d.model === '20EV23' ? 'maximum continuous rating (MCR)' : 'continuous output'}, with nominal speed up to 1200 rpm. `
    : `ABC's published upper figure of 360 kW per cylinder implies ${d.calculatedKw.toLocaleString('en-US')} kW for ${d.cylinders} cylinders (calculated, not a model-specific certified rating). Exact output, duty and speed require an application-specific ABC specification. `
  const turbo = d.model === '4EL23'
    ? 'Single-stage turbocharging only; the 360 kW-per-cylinder two-stage figure does not apply to this model. '
    : `Single- or two-stage turbocharging, depending on configuration; the September 2026 platform announcement states 330 and up to 360 kW per cylinder respectively. `
  const row = {
    slug:`abc-${d.model.toLowerCase()}`, brand:'ABC', model:d.model,
    series:d.layout === 'L' ? 'Evolve EL23' : 'Evolve EV23', status:'active', origin:'Belgium',
    cylinders:d.cylinders, configuration:`${d.layout}${d.cylinders}`,
    // The catalog entry describes the liquid-fuel baseline, not a separately certified gas variant.
    fuel_type:'Diesel', ignition_type:'Compression Ignition',
    ...(d.year ? {year_introduced:d.year} : {}),
    ...(d.kw ? {power_kw:d.kw,power_hp:Math.round(d.kw / 0.7457 * 10) / 10,rpm_max:1200} : {}),
    ...(displacement ? {displacement_l:displacement} : {}),
    ...(d.kw ? {emissions_standard:'IMO Tier II; IMO Tier III / EU Stage V with Evolve EATS'} : {}),
    description:`ABC Evolve ${d.model} is a ${d.cylinders}-cylinder ${d.layout === 'L' ? 'inline' : 'V'} medium-speed engine platform for heavy-duty marine and industrial applications, manufactured in Ghent, Belgium. `
      + rating + turbo
      + (displacement ? `Bore × stroke: ${d.bore} × ${d.stroke} mm; displacement ${displacement} L calculated from cylinder geometry. ` : '')
      + 'The liquid-fuel configuration supports diesel, biodiesel and HVO. Dual-fuel operation uses liquid pilot injection; 100% gas operation uses spark ignition. Fuel capability and conversion requirements depend on the engine configuration; these are not interchangeable fuel settings or separately verified gas ratings. '
      + (d.kw ? 'ABC lists IMO Tier II, with IMO Tier III and EU Stage V compliance dependent on the Evolve exhaust aftertreatment system. ' : '')
      + (d.model === '16EV23' ? 'Introduced at SMM Hamburg on 1 September 2026. ' : d.model === '12EV23' ? 'Introduced at Europort Rotterdam on 4 November 2025. ' : '')
      + 'No 50/60 Hz electrical output, prime or standby generator rating is inferred from mechanical engine output.',
  }
  return {row,docs:[
    {type:d.kw ? 'datasheet' : 'other',label:`ABC Evolve ${d.model} — official ${d.kw ? 'product specifications' : 'launch announcement'}`,storage_path:source.url},
    ...(source.url === launch.url ? [] : [{type:'other',label:'ABC Evolve complete six-model range — 1 September 2026',storage_path:launch.url}]),
  ]}
})
assert.equal(new Set(records.map(r => r.row.slug)).size,6)
loadLocalEnv()
const options = {global:{fetch:(url,init)=>fetch(url,{...init,signal:AbortSignal.timeout(30000)})}}
const client = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv(APPLY ? 'SUPABASE_SERVICE_KEY' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),options)
const read = async c => {
  const {data,error} = await c.from('engines').select('*,pdfs:engine_pdfs(*)').eq('brand','ABC')
  if (error) throw error
  return data
}
const before = await read(client)
const missing = records.filter(({row}) => !before.some(e => e.slug === row.slug))
for (const {row} of missing) assert.ok(!before.some(e => e.model.replace(/[^a-z0-9]/gi,'').toLowerCase().replace(/^evolve/,'') === row.model.toLowerCase()),`Duplicate model alias: ${row.model}`)
console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${missing.length} missing Evolve models; ABC currently has ${before.length} records.`)
if (!APPLY) {
  console.table(records.map(({row})=>({model:row.model,configuration:row.configuration,published_kw:row.power_kw??'Not published',max_rpm:row.rpm_max??'Not published'})))
  process.exit(0)
}
if (missing.length) {
  const {error} = await client.from('engines').insert(missing.map(r=>r.row))
  if (error) throw error
}
const saved = await read(client)
const links = records.flatMap(({row,docs}) => {
  const engine = saved.find(e=>e.slug === row.slug)
  assert.ok(engine)
  return docs.filter(d=>!engine.pdfs.some(p=>p.storage_path===d.storage_path)).map(d=>({...d,engine_id:engine.id,file_size_bytes:null}))
})
if (links.length) {
  const {error} = await client.from('engine_pdfs').insert(links)
  if (error) throw error
}
const publicClient = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'),requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),options)
const after = await read(publicClient)
for (const {row,docs} of records) {
  const engine = after.find(e=>e.slug===row.slug)
  assert.ok(engine)
  for (const [key,value] of Object.entries(row)) assert.equal(engine[key],value,`${row.model}.${key}`)
  for (const doc of docs) assert.equal(engine.pdfs.filter(p=>p.storage_path===doc.storage_path).length,1)
  for (const key of Object.keys(engine).filter(k=>/^(prime|standby)_power_/.test(k))) assert.equal(engine[key],null)
  if (!row.power_kw) assert.equal(engine.power_kw,null)
}
assert.equal(after.length,before.length+missing.length)
fs.writeFileSync('reports/abc-evolve-engine-addition-2026-09-20.md',`# ABC Evolve engine addition\n\nReviewed 2026-09-20. Added ${missing.length} models; ABC count ${before.length} → ${after.length}. Verified all six public rows and ${records.reduce((n,r)=>n+r.docs.length,0)} unique model/source links.\n\n## Findings\n\nThe 16EV23 announcement is dated 1 September 2026, not the review date. All six requested models were absent on initial inspection. Public model pages exist for the three inline engines and 20EV23; the two newer V engines are supported by official launch announcements. Download catalogues are form-gated, so no forms were submitted and no PDF downloads are claimed.\n\n| Model | Layout | Published maximum mechanical output | Calculated upper output (not stored as verified power) |\n|---|---|---:|---:|\n${definitions.map(d=>`| ${d.model} | ${d.layout}${d.cylinders} | ${d.kw ? `${d.kw} kW` : 'Not found in a public model sheet'} | ${d.calculatedKw ? `${d.calculatedKw} kW = ${d.cylinders} × 360` : '—'} |`).join('\n')}\n\n## Data boundaries\n\n- 4EL23: single-stage only, 330 kW/cylinder; the other models offer single- or two-stage turbocharging.\n- Generic power contains published mechanical output only. Newer-model calculated outputs are explicitly labelled in descriptions, with numeric power left null.\n- Maximum 1200 rpm is stored only where the model page publishes it; rated speed is not inferred.\n- Bore/stroke-derived displacement is recorded only for 6EL23, 8EL23 and 12EV23, where the reviewed source explicitly gives 230 × 310 mm.\n- No inherited weights, dimensions, generator frequency/duty/electrical ratings, gas-specific variants or certification claims for the newer V models.\n- Fuel category describes the liquid-fuel baseline. Conversion to pilot-ignited dual fuel or spark-ignited gas depends on configuration.\n- Existing ABC records were not modified. Import is insert-only and rerunnable.\n\n## Official sources\n\n${manifest.sources.map(s=>`- ${s.key}: ${s.url}\n  - Snapshot: ${s.path}; SHA-256: ${s.sha256}`).join('\n')}\n`)
console.log(`Verified ${records.length} Evolve records and ${records.reduce((n,r)=>n+r.docs.length,0)} source links; ABC now has ${after.length} models.`)
