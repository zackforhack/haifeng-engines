// Read-only catalog audit. Executes the actual preview loader against a bulk
// snapshot, avoiding thousands of live database requests or any publication writes.
import fs from 'node:fs'
import ts from 'typescript'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) throw new Error('Load .env.local with --env-file before running this audit.')
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
async function allRows(table, columns, configure = q => q) {
  const rows = []
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await configure(db.from(table).select(columns)).range(offset, offset + 999)
    if (error) throw new Error(`${table}: ${error.code} ${error.message}`)
    rows.push(...data)
    if (data.length < 1000) return rows
  }
}
const [engines, fitments, setting] = await Promise.all([
  allRows('engines', 'id,slug,brand,model', q => q.order('id')),
  allRows('engine_part_fitments', 'id,engine_id,category_code,confidence,workflow_status,is_public,fitment_scope,fitment_condition,verified_at,overhaul_part_categories(label,sort_order),overhaul_parts!inner(part_number,part_name,status),overhaul_sources!engine_part_fitments_source_id_fkey(source_type,source_name)', q => q
    .eq('fitment_scope', 'model_exact').eq('overhaul_parts.status', 'active')
    .in('workflow_status', ['reviewed', 'verified', 'published'])
    .in('confidence', ['verified', 'likely', 'needs_serial_confirmation'])
    .order('category_code').order('id')),
  db.from('overhaul_feature_settings').select('enabled').eq('setting_key', 'public_catalog').maybeSingle(),
])
if (setting.error) throw new Error(setting.error.code)
const grouped = new Map()
for (const row of fitments) {
  if (!grouped.has(row.engine_id)) grouped.set(row.engine_id, [])
  grouped.get(row.engine_id).push(row)
}
const code = ts.transpileModule(fs.readFileSync('lib/overhaul-preview.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const snapshotDb = { from(table) {
  let rows = []
  const query = {
    select() { return this }, order() { return this }, limit(n) { rows = rows.slice(0, n); return this },
    eq(k, v) {
      if (k === 'engine_id') rows = [...(grouped.get(v) ?? [])]
      else rows = rows.filter(row => k.split('.').reduce((value, part) => value?.[part], row) === v)
      return this
    },
    in(k, values) { rows = rows.filter(row => values.includes(row[k])); return this },
    async maybeSingle() { return { data: table === 'overhaul_feature_settings' ? setting.data : null, error: null } },
    then(resolve) { return Promise.resolve({ data: rows, error: null }).then(resolve) },
  }
  return query
} }
function loader(mode) {
  const exported = {}
  new Function('require', 'exports', 'process', 'console', code)(
    name => name.includes('overhaul-previews.json') ? { default: JSON.parse(fs.readFileSync('data/public/overhaul-previews.json', 'utf8')) } : name === 'server-only' ? {} : name === 'react' ? { cache: fn => fn } : { createClient: () => snapshotDb }, exported,
    { env: { NODE_ENV: mode, LOCAL_OVERHAUL_PREVIEW: '1', SUPABASE_SERVICE_KEY: 'snapshot', NEXT_PUBLIC_SUPABASE_URL: 'snapshot' } }, console)
  return exported.getOverhaulPreview
}
const local = loader('development')
const production = loader('production')
const totals = { references: 0, categories_only: 0, identification_only: 0 }
const states = []
const publicModels = {}
let productionReferences = 0
for (const engine of engines) {
  const preview = await local(engine.id)
  const state = preview.references.length ? 'references' : preview.categories.length ? 'categories_only' : 'identification_only'
  totals[state]++
  if (preview.categories.length || preview.references.length) publicModels[engine.id] = {
    slug: engine.slug, brand: engine.brand, model: engine.model,
    categories: preview.categories, references: preview.references,
  }
  states.push({ slug: engine.slug, brand: engine.brand, model: engine.model, state, referenceCount: preview.references.length, categoryCount: preview.categories.length })
  if ((await production(engine.id)).references.length) productionReferences++
}
const summary = {
  audited_at: new Date().toISOString(), engine_pages: engines.length,
  local_preview: totals, raw_catalog_publication_enabled: Boolean(setting.data?.enabled),
  production_reference_pages: productionReferences,
  note: 'Counts use the current shared loader against a bulk database snapshot. They are data eligibility counts, not a browser crawl or evidence of live deployment.',
}
fs.mkdirSync('outputs/overhaul-coverage', { recursive: true })
fs.writeFileSync('outputs/overhaul-coverage/coverage.json', JSON.stringify({ ...summary, models: states }, null, 2))
console.log(JSON.stringify(summary, null, 2))
console.log('Examples:', JSON.stringify(Object.fromEntries(Object.keys(totals).map(state => [state, states.filter(row => row.state === state).slice(0, 3).map(row => row.slug)]))))

if (process.argv.includes('--export-public-preview')) {
  fs.mkdirSync('data/public', { recursive: true })
  fs.writeFileSync('data/public/overhaul-previews.json', JSON.stringify({
    version: 1, generatedAt: summary.audited_at,
    models: Object.fromEntries(Object.entries(publicModels).sort((a, b) => a[1].slug.localeCompare(b[1].slug))),
  }, null, 2) + '\n')
  console.log(`Exported bounded public previews for ${Object.keys(publicModels).length} models. No database writes.`)
}
