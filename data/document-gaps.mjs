import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)
const requestedBrands = new Set(
  process.argv
    .filter((argument) => argument.startsWith('--brand='))
    .map((argument) => argument.slice('--brand='.length).trim().toLowerCase()),
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
  fetchAll('engines', 'id, brand, model, slug'),
  fetchAll('engine_pdfs', 'engine_id, type'),
])

const typesByEngine = new Map()
for (const document of documents) {
  const types = typesByEngine.get(document.engine_id) ?? new Set()
  types.add(document.type)
  typesByEngine.set(document.engine_id, types)
}

const byBrand = new Map()
for (const engine of engines) {
  if (
    requestedBrands.size &&
    !requestedBrands.has(engine.brand.trim().toLowerCase())
  ) {
    continue
  }
  const types = typesByEngine.get(engine.id) ?? new Set()
  const group = byBrand.get(engine.brand) ?? {
    total: 0,
    noDocument: [],
    noDatasheet: [],
  }
  group.total += 1
  if (types.size === 0) group.noDocument.push(engine)
  if (!types.has('datasheet')) group.noDatasheet.push(engine)
  byBrand.set(engine.brand, group)
}

for (const [brand, group] of [...byBrand].sort(
  (a, b) => b[1].noDocument.length - a[1].noDocument.length,
)) {
  if (group.noDocument.length === 0 && group.noDatasheet.length === 0) continue
  console.log(
    `\n### ${brand}: ${group.noDocument.length}/${group.total} no document; ` +
      `${group.noDatasheet.length}/${group.total} no datasheet`,
  )
  if (group.noDocument.length) {
    console.log('No document:')
    for (const engine of group.noDocument) {
      console.log(`  ${engine.model}\t${engine.slug}`)
    }
  }
  const brochureOnly = group.noDatasheet.filter(
    (engine) => !group.noDocument.some((missing) => missing.id === engine.id),
  )
  if (brochureOnly.length) {
    console.log('Has another document type, but no datasheet:')
    for (const engine of brochureOnly) {
      console.log(`  ${engine.model}\t${engine.slug}`)
    }
  }
}
