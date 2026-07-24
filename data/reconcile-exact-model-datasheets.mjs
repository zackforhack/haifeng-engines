import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)

async function fetchAll(table, columns) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...data)
    if (data.length < 1000) return rows
  }
}

const [engines, documents] = await Promise.all([
  fetchAll('engines', 'id, brand, model, series, slug'),
  fetchAll(
    'engine_pdfs',
    'engine_id, type, label, storage_path, file_size_bytes',
  ),
])

const engineById = new Map(engines.map((engine) => [engine.id, engine]))
const datasheetsByKey = new Map()
const linkedPathsByEngine = new Map()

function engineKey(engine) {
  return [engine.brand, engine.model, engine.series]
    .map((value) => (value ?? '').trim().toLowerCase())
    .join('\0')
}

for (const document of documents) {
  const paths = linkedPathsByEngine.get(document.engine_id) ?? new Set()
  paths.add(document.storage_path)
  linkedPathsByEngine.set(document.engine_id, paths)

  if (document.type !== 'datasheet') continue
  const engine = engineById.get(document.engine_id)
  if (!engine) continue
  const key = engineKey(engine)
  const candidates = datasheetsByKey.get(key) ?? new Map()
  candidates.set(document.storage_path, document)
  datasheetsByKey.set(key, candidates)
}

const inserts = []
for (const engine of engines) {
  const key = engineKey(engine)
  const candidates = datasheetsByKey.get(key)
  if (!candidates) continue

  const linkedPaths = linkedPathsByEngine.get(engine.id) ?? new Set()
  for (const document of candidates.values()) {
    if (linkedPaths.has(document.storage_path)) continue
    inserts.push({
      engine_id: engine.id,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storage_path,
      file_size_bytes: document.file_size_bytes,
    })
  }
}

const affected = new Map()
for (const row of inserts) {
  const engine = engineById.get(row.engine_id)
  const key = `${engine.brand} ${engine.model}`
  affected.set(key, (affected.get(key) ?? 0) + 1)
}

console.log(
  `${APPLY ? 'Applying' : 'Dry run:'} ${inserts.length} datasheet link(s) for ${affected.size} exact brand/model group(s).`,
)
for (const [model, count] of [...affected].sort()) {
  console.log(`  ${model}: ${count}`)
}

if (!APPLY || inserts.length === 0) process.exit(0)

for (let offset = 0; offset < inserts.length; offset += 500) {
  const batch = inserts.slice(offset, offset + 500)
  const { error } = await supabase.from('engine_pdfs').insert(batch)
  if (error) throw new Error(`engine_pdfs insert: ${error.message}`)
}

console.log(`Inserted ${inserts.length} exact-model datasheet link(s).`)
