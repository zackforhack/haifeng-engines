import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
const source = fs.readFileSync('lib/metadata-lengths.ts', 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const exported = {}
new Function('require', 'exports', compiled)(() => ({}), exported)
const engine = { brand: 'Volvo Penta', model: 'TWD1630G' }
assert.equal(exported.engineRepairMetadata(engine, false), null)
const meta = exported.engineRepairMetadata(engine, true)
assert.equal(meta.title, 'Volvo Penta TWD1630G Specs & Repair Parts')
assert.match(meta.description, /selected repair part references/)
assert.match(meta.description, /nameplate/)
for (const model of [engine, { brand: 'A very long manufacturer name with many words', model: 'MODEL-1234-ABC' }]) {
  const result = exported.engineRepairMetadata(model, true)
  assert.ok(result.title.length <= 60)
  assert.ok(result.description.length <= 160)
  assert.doesNotMatch(result.description, /in stock|guaranteed|complete kit/i)
}
console.log('PASS: reference-dependent metadata, model identity, fitment language, title/description budgets, no unsupported offers.')
