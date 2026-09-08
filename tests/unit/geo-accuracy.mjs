import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const modules = new Map()
function load(file) {
  file = path.resolve(file)
  if (modules.has(file)) return modules.get(file)
  const exports = {}
  modules.set(file, exports)
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  new Function('require', 'exports', code)((name) => load(path.resolve(path.dirname(file), name + '.ts')), exports)
  return exports
}
const { buildEngineFaqs } = load('lib/engine-faq.ts')
const { headlinePower } = load('lib/engine-display.ts')
const base = { slug: 'test-engine', brand: 'Example', model: 'A', status: 'active', rpm_rated: 1500 }
const shaftOnly = buildEngineFaqs({ ...base, prime_power_kw_50hz: 100 })
assert.ok(!JSON.stringify(shaftOnly).includes('125 kVA'), 'Shaft kW must never be converted directly to kVA')
const electrical = buildEngineFaqs({ ...base, prime_power_kwe_50hz: 100 })
assert.match(electrical[0].a, /125 kVA prime/)
const emissions = buildEngineFaqs({ ...base, emissions_standard: 'EPA Tier 2' })
assert.ok(!JSON.stringify(emissions).includes('is certified to'))
assert.ok(!JSON.stringify(emissions).includes('is a current production model'))
const manual = buildEngineFaqs({ ...base, pdfs: [{ type: 'manual' }] })
assert.ok(!JSON.stringify(manual).includes('official Example datasheet'))
const hsk = { ...base, slug: 'cummins-hsk78g', brand: 'Cummins', model: 'HSK78G', prime_power_kwe_50hz: 2000 }
assert.equal(headlinePower(hsk).rating, 'Continuous')
const hskFaq = buildEngineFaqs(hsk)
assert.match(hskFaq.find(f => f.q.startsWith('What is the power')).a, /C2000N5CD/)
assert.match(hskFaq.find(f => f.q.startsWith('Does')).a, /60 Hz with a gearbox/)
assert.equal(headlinePower({ ...hsk, slug: 'another-engine' }).rating, 'Prime')
console.log('PASS: mechanical/electrical distinction, qualification of certification and status, document type, HSK78G duty and frequency scope, unaffected model duties.')
