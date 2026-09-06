import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

const source = fs.readFileSync('lib/overhaul-preview.ts', 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const records = Array.from({ length: 12 }, (_, i) => ({
  engines: { slug: 'test-engine', brand: 'Test', model: 'Engine' }, verified_at: '2026-08-20T12:00:00Z', engine_id: 'engine', id: String(i), category_code: `part_${i}`, confidence: 'needs_serial_confirmation',
  workflow_status: 'reviewed', fitment_scope: 'model_exact', is_public: false,
  fitment_condition: 'Serial check required', internal_notes: 'MUST_NOT_ESCAPE',
  overhaul_part_categories: { label: `Part ${i}`, sort_order: i },
  overhaul_parts: { status: 'active', part_number: `REF${i}`, part_name: `Part ${i}` },
  overhaul_sources: { source_type: 'official_oem_parts_manual', source_name: 'OEM manual' },
}))
async function run({ mode = 'development', local = '1', enabled = false, rows = records, fail = false, method = 'getOverhaulPreview', argument = 'engine', snapshot = { models: {} }, credentials = true } = {}) {
  const calls = []
  const fakeDb = { from(table) {
    calls.push(table)
    let data = rows
    const query = {
      select() { return this }, order() { return this }, limit(n) { data = data.slice(0, n); return this },
      eq(key, value) { data = data.filter(row => key.split('.').reduce((v, k) => v?.[k], row) === value); return this },
      in(key, values) { data = data.filter(row => values.includes(row[key])); return this },
      async maybeSingle() { return { data: { enabled }, error: fail ? { code: 'test' } : null } },
      then(resolve) { return Promise.resolve({ data, error: fail ? { code: 'test' } : null }).then(resolve) },
    }
    return query
  } }
  const exported = {}
  const env = { NODE_ENV: mode, LOCAL_OVERHAUL_PREVIEW: local, SUPABASE_SERVICE_KEY: credentials ? 'test' : '', NEXT_PUBLIC_SUPABASE_URL: credentials ? 'test' : '' }
  new Function('require', 'exports', 'process', 'console', compiled)(name => name.includes('overhaul-previews.json') ? { default: snapshot } : name === 'server-only' ? {} : name === 'react' ? { cache: fn => fn } : { createClient: () => fakeDb }, exported, { env }, { error() {} })
  return { result: await exported[method](argument), calls }
}
const local = await run()
assert.equal(local.result.references.length, 3)
assert.equal(local.result.categories.length, 8)
assert.ok(!JSON.stringify(local.result).includes('MUST_NOT_ESCAPE'))
assert.ok(!JSON.stringify(local.result).includes('REF3'))
const locked = await run({ mode: 'production', local: '1' })
assert.deepEqual(locked.calls, [])
assert.equal(locked.result.references.length, 0)
const privateOnly = await run({ mode: 'production', enabled: true })
assert.equal(privateOnly.result.references.length, 0)
const published = await run({ mode: 'production', enabled: true, rows: records.map(r => ({ ...r, is_public: true, workflow_status: 'published' })) })
assert.equal(published.result.references.length, 0)
for (const patch of [{ confidence: 'unverified' }, { confidence: 'conflict' }, { fitment_scope: 'family_candidate' }, { workflow_status: 'raw_collected' }, { overhaul_parts: { ...records[0].overhaul_parts, status: 'deprecated' } }]) {
  assert.equal((await run({ rows: [{ ...records[0], ...patch }] })).result.references.length, 0)
}
assert.equal((await run({ rows: [{ ...records[0], overhaul_sources: { source_type: 'aftermarket_catalog' } }] })).result.references.length, 0)
assert.equal((await run({ fail: true })).result.unavailable, true)
assert.equal((await run({ rows: [] })).result.unavailable, false)
console.log('PASS: bounded DTO, private-field exclusion, development-only override, production publication gates, evidence filters, empty/error states.')

assert.equal(local.result.references[0].sourceName, 'OEM manual')
assert.equal(local.result.references[0].verifiedAt, '2026-08-20T12:00:00Z')
assert.equal((await run({ rows: [{ ...records[0], verified_at: null }] })).result.references[0].verifiedAt, null)
assert.equal((await run({ rows: [{ ...records[0], verified_at: 'bad date' }] })).result.references[0].verifiedAt, null)
assert.deepEqual((await run({ method: 'getOverhaulModelLinks', argument: 'Test' })).result, [{ slug: 'test-engine', brand: 'Test', model: 'Engine' }])
assert.deepEqual((await run({ method: 'getOverhaulModelLinks', argument: 'Other' })).result, [])
assert.deepEqual((await run({ method: 'getOverhaulModelLinks', mode: 'production', local: '1', enabled: false })).result, [])
console.log('PASS: source/date provenance, missing/invalid dates, model link deduplication, brand isolation and publication gate.')

const snapshot = { models: { engine: { slug: 'test-engine', brand: 'Test', model: 'Engine', categories: local.result.categories, references: local.result.references } } }
const deployed = await run({ mode: 'production', local: '1', snapshot, credentials: false })
assert.equal(deployed.result.references.length, 3)
assert.deepEqual(deployed.calls, [])
assert.equal(deployed.result.localPreview, false)
assert.equal((await run({ mode: 'production', argument: 'unknown', snapshot })).result.references.length, 0)
assert.deepEqual((await run({ mode: 'production', method: 'getOverhaulModelLinks', argument: 'Test', snapshot, credentials: false })).result, [{ slug: 'test-engine', brand: 'Test', model: 'Engine' }])
console.log('PASS: production serves only approved snapshot without private credentials or database access; development override cannot bypass it.')

const realSnapshot = JSON.parse(fs.readFileSync('data/public/overhaul-previews.json', 'utf8'))
for (const model of Object.values(realSnapshot.models)) {
  assert.deepEqual(Object.keys(model).sort(), ['brand', 'categories', 'model', 'references', 'slug'])
  assert.ok(model.categories.length <= 8)
  assert.ok(model.references.length <= 3)
  assert.equal(new Set(model.references.map(r => r.category)).size, model.references.length)
  for (const ref of model.references) {
    assert.deepEqual(Object.keys(ref).sort(), ['category', 'condition', 'name', 'number', 'sourceName', 'verifiedAt'])
    assert.ok(ref.number && ref.condition)
  }
}
assert.ok(!JSON.stringify(realSnapshot).includes('internal_notes'))
console.log(`PASS: all ${Object.keys(realSnapshot.models).length} released preview records satisfy field allowlists and disclosure caps.`)
