/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS hook loads production TS helpers for isolated tests. */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const ts = require('typescript')
// Load the actual TypeScript query helpers without a running Next server.
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, filename)
}
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://catalog.test'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
const { catalogPage, normalizeCatalogParams, catalogSearchPattern } = require('../../lib/catalog-params.ts')
const { searchEnginesPage } = require('../../lib/engines.ts')
const { filterAlternators, searchAlternatorsPage, getFeaturedAlternators } = require('../../lib/alternators.ts')
let calls = []
let responses = []
let requestHeaders = []
global.fetch = async (input, init) => {
  requestHeaders.push(new Headers(init?.headers))
  calls.push(new URL(String(input)))
  assert.ok(responses.length, 'Unexpected extra database request')
  const index = responses.findIndex(item => !item.slug || item.slug === calls.at(-1).searchParams.get('slug'))
  assert.ok(index >= 0, 'No matching database response')
  const { status = 200, body = [], count = 0 } = responses.splice(index, 1)[0]
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json', 'Content-Range': `0-0/${count}`,
  } })
}
function mock(...items) { calls = []; requestHeaders = []; responses = items }
const rangeError = { status: 416, body: { code: 'PGRST103', message: 'Requested range not satisfiable' } }

test('normalizes malformed and repeated query parameters', () => {
  for (const value of ['abc', 'NaN', 'Infinity', '-1', '0', '1.5', '1e30', '999999999999999999', Infinity, NaN]) {
    assert.equal(catalogPage(value), 1)
  }
  assert.equal(catalogPage('2'), 2)
  const p = normalizeCatalogParams({ poles: ['4', 'abc'], min_kva: '500', max_kva: '100', page: 'Infinity', sort: 'bad' }, 'alternators')
  assert.equal(p.poles, '4'); assert.equal(p.min_kva, '100'); assert.equal(p.max_kva, '500'); assert.equal(p.page, '1'); assert.equal(p.sort, undefined)
  assert.equal(normalizeCatalogParams({ poles: 'abc', min_kva: 'NaN' }, 'alternators').poles, undefined)
})
test('out-of-range engine page recovers using the filtered count', async () => {
  mock(rangeError, { count: 25, body: [{ id: 'first' }] }, { count: 25, body: [{ id: 'last' }] })
  const result = await searchEnginesPage({ brand: 'Example' }, { page: 99999, pageSize: 24 })
  assert.equal(result.page, 2); assert.equal(result.total, 25); assert.equal(result.engines[0].id, 'last')
  assert.deepEqual(calls.map(u => u.searchParams.get('offset')), ['2399952', '0', '24'])
  assert.ok(calls.every(u => u.searchParams.get('brand') === 'eq.Example'))
})
test('empty catalog and concurrent deletion recover without loops', async () => {
  mock(rangeError, { count: 0 })
  assert.equal((await searchEnginesPage({}, { page: 100, pageSize: 24 })).page, 1)
  mock(rangeError, { count: 25 }, rangeError, { count: 0 })
  assert.equal((await searchEnginesPage({}, { page: 100, pageSize: 24 })).page, 1)
  assert.equal(calls.length, 4)
})
test('real database failures remain errors', async () => {
  mock({ status: 500, body: { code: 'XX000', message: 'Database failure' } })
  await assert.rejects(searchEnginesPage({}, { page: 10, pageSize: 24 }), e => e.code === 'XX000')
  assert.equal(calls.length, 1)
})
test('invalid helper inputs never send NaN or unsafe ranges to the database', async () => {
  mock({ count: 0 })
  await searchEnginesPage({}, { page: Infinity, pageSize: NaN })
  assert.equal(calls[0].searchParams.get('offset'), '0')
  assert.equal(calls[0].searchParams.get('limit'), '24')
  mock()
  for (const params of [{ poles: 'abc' }, { poles: '4.5' }, { min_kva: NaN }, { max_kva: Infinity }, { min_kva: 20, max_kva: 10 }]) {
    assert.deepEqual(await filterAlternators(params), [])
  }
  assert.equal(calls.length, 0)
})
test('valid alternator filters run in database and search punctuation stays quoted', async () => {
  mock({ body: [{ id: 1, kva: 125 }] })
  const term = 'a,b).x%_"\\'
  assert.equal((await filterAlternators({ poles: '4', min_kva: 100, max_kva: 150, q: term })).length, 1)
  const p = calls[0].searchParams
  assert.equal(p.get('poles'), 'eq.4'); assert.equal(p.get('kva'), 'gte.100'); assert.deepEqual(p.getAll('kva'), ['gte.100', 'lte.150'])
  assert.equal(p.get('or'), `(brand.ilike.${catalogSearchPattern(term)},model.ilike.${catalogSearchPattern(term)},series.ilike.${catalogSearchPattern(term)})`)
})

test('alternator catalog fetches only the requested page with a filtered exact count', async () => {
  mock({ count: 12000, body: [{ id: 'page-two', kva: 150 }] })
  const result = await searchAlternatorsPage({ brand: 'Stamford', poles: '4', min_kva: 100, max_kva: 200, sort: 'kva_desc' }, { page: 2, pageSize: 24 })
  assert.equal(result.page, 2); assert.equal(result.total, 12000); assert.equal(result.totalPages, 500)
  assert.equal(result.alternators[0].id, 'page-two'); assert.equal(calls.length, 1)
  const query = calls[0].searchParams
  assert.equal(query.get('offset'), '24'); assert.equal(query.get('limit'), '24')
  assert.equal(query.get('brand'), 'eq.Stamford'); assert.equal(query.get('poles'), 'eq.4')
  assert.deepEqual(query.getAll('kva'), ['gte.100', 'lte.200'])
  assert.equal(query.get('order'), 'kva.desc.nullslast,brand.asc,model.asc,id.asc')
  assert.equal(requestHeaders[0].get('prefer'), 'count=exact')
})

test('alternator range recovery preserves filters and returns the final partial page', async () => {
  mock(rangeError, { count: 25, body: [{ id: 'first' }] }, { count: 25, body: [{ id: 'last' }] })
  const result = await searchAlternatorsPage({ series: 'S4', q: 'test' }, { page: 99999 })
  assert.equal(result.page, 2); assert.equal(result.alternators[0].id, 'last')
  assert.deepEqual(calls.map(u => u.searchParams.get('offset')), ['2399952', '0', '24'])
  assert.ok(calls.every(u => u.searchParams.get('series') === 'eq.S4'))
  assert.ok(calls.every(u => u.searchParams.get('or') === calls[0].searchParams.get('or')))
})

test('alternator recovery covers zero results, concurrent deletions, and empty successful ranges', async () => {
  mock(rangeError, { count: 0 })
  assert.deepEqual(await searchAlternatorsPage({}, { page: 100 }), { alternators: [], total: 0, page: 1, pageSize: 24, totalPages: 1 })
  mock(rangeError, { count: 25 }, rangeError, { count: 0 })
  assert.equal((await searchAlternatorsPage({}, { page: 100 })).page, 1)
  assert.equal(calls.length, 4)
  mock({ count: 3 }, { count: 3, body: [{ id: 'first' }] })
  const result = await searchAlternatorsPage({}, { page: 10 })
  assert.equal(result.page, 1); assert.equal(result.alternators[0].id, 'first')
})

test('alternator recovery handles count growth without mislabeling the first page', async () => {
  mock(rangeError, { count: 60, body: [{ id: 'first' }] }, { count: 60, body: [{ id: 'second' }] })
  const result = await searchAlternatorsPage({}, { page: 2 })
  assert.equal(result.page, 2); assert.equal(result.alternators[0].id, 'second')
})

test('alternator page helper validates direct calls and keeps database failures visible', async () => {
  mock()
  for (const params of [{ poles: 'NaN' }, { min_kva: Infinity }, { min_kva: 20, max_kva: 10 }]) {
    assert.equal((await searchAlternatorsPage(params)).total, 0)
  }
  assert.equal(calls.length, 0)
  mock({ count: 0 })
  await searchAlternatorsPage({}, { page: Infinity, pageSize: NaN })
  assert.equal(calls[0].searchParams.get('offset'), '0'); assert.equal(calls[0].searchParams.get('limit'), '24')
  mock({ status: 500, body: { code: 'XX000', message: 'Database failure' } })
  await assert.rejects(searchAlternatorsPage({}, { page: 10 }), e => e.code === 'XX000')
  assert.equal(calls.length, 1)
})

test('featured alternators fetch one landmark plus at most five other models', async () => {
  mock({ slug: 'eq.stamford-uci224g', body: [{ id: 'landmark', slug: 'stamford-uci224g' }] }, { slug: 'neq.stamford-uci224g', body: [{ id: 'other' }] })
  const result = await getFeaturedAlternators()
  assert.deepEqual(result.map(a => a.id), ['landmark', 'other'])
  assert.equal(calls.length, 2)
  assert.ok(calls.some(u => u.searchParams.get('slug') === 'eq.stamford-uci224g'))
  assert.equal(calls.find(u => u.searchParams.get('slug') === 'neq.stamford-uci224g').searchParams.get('limit'), '5')
})

test('catalog firewall draft targets only catalog reads and starts in observation mode', () => {
  const rule = JSON.parse(fs.readFileSync(require.resolve('../../ops/vercel/catalog-rate-limit.json'), 'utf8'))
  const conditions = rule.conditionGroup[0].conditions
  const scope = new RegExp(conditions.find(c => c.type === 'path').value)
  for (const path of ['/engines', '/alternators', '/engines/', '/alternators/']) assert.ok(scope.test(path))
  for (const path of ['/engines/model', '/alternators/series/s4', '/sitemap.xml', '/robots.txt', '/_next/static/a.js', '/specsheets/a.pdf', '/engines-other']) assert.ok(!scope.test(path))
  assert.deepEqual(conditions.find(c => c.type === 'method').value, ['GET', 'HEAD'])
  assert.equal(rule.action.mitigate.action, 'rate_limit')
  assert.deepEqual(rule.action.mitigate.rateLimit, { algo: 'fixed_window', window: 60, limit: 120, keys: ['ip'], action: 'log' })
})
