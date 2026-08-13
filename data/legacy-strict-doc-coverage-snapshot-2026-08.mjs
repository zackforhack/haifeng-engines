// Snapshot strict legacy document coverage.
//
// Run:
//   node data/legacy-strict-doc-coverage-snapshot-2026-08.mjs

import { createClient } from '@supabase/supabase-js'
import fsp from 'node:fs/promises'

const STRICT_TYPES = new Set(['datasheet', 'brochure'])

function parseEnvFile(text) {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const separator = line.indexOf('=')
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] == null) process.env[key] = value
  }
}

async function loadEnv() {
  for (const envFile of ['.env.local', '.env']) {
    try {
      parseEnvFile(await fsp.readFile(envFile, 'utf8'))
    } catch {
      // Optional local env files.
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

async function fetchAll(supabase, table, select) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + 999)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return rows
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const engines = await fetchAll(
  supabase,
  'engines',
  'id, brand, model, slug, status, pdfs:engine_pdfs(id,type,label,storage_path)',
)

const legacy = engines.filter((engine) => engine.status === 'discontinued')
const anyDocs = legacy.filter((engine) => (engine.pdfs ?? []).length > 0)
const strictDocs = legacy.filter((engine) =>
  (engine.pdfs ?? []).some((pdf) => STRICT_TYPES.has(pdf.type)),
)
const strictMissing = legacy.filter((engine) =>
  !(engine.pdfs ?? []).some((pdf) => STRICT_TYPES.has(pdf.type)),
)

const byBrand = new Map()
for (const engine of legacy) {
  const entry = byBrand.get(engine.brand) ?? { total: 0, strict: 0, missing: 0 }
  entry.total += 1
  if ((engine.pdfs ?? []).some((pdf) => STRICT_TYPES.has(pdf.type))) {
    entry.strict += 1
  } else {
    entry.missing += 1
  }
  byBrand.set(engine.brand, entry)
}

const byType = new Map()
for (const engine of legacy) {
  for (const pdf of engine.pdfs ?? []) {
    byType.set(pdf.type, (byType.get(pdf.type) ?? 0) + 1)
  }
}

const neededFor60 = Math.max(0, Math.ceil(legacy.length * 0.6) - strictDocs.length)

console.log(JSON.stringify({
  engineCount: engines.length,
  legacyCount: legacy.length,
  anyDocs: anyDocs.length,
  anyDocsPct: Number((anyDocs.length / legacy.length * 100).toFixed(1)),
  datasheetBrochure: strictDocs.length,
  datasheetBrochurePct: Number((strictDocs.length / legacy.length * 100).toFixed(1)),
  strictDocsNeededFor60Percent: neededFor60,
  byType: Object.fromEntries([...byType].sort((a, b) => a[0].localeCompare(b[0]))),
}, null, 2))

console.log('\nStrict datasheet/brochure gaps by brand:')
for (const [brand, counts] of [...byBrand].sort((a, b) => b[1].missing - a[1].missing || a[0].localeCompare(b[0]))) {
  if (counts.missing === 0) continue
  console.log(`${brand}\ttotal=${counts.total}\tstrict=${counts.strict}\tmissing=${counts.missing}`)
}

console.log('\nTop strict-gap rows excluding Volvo Penta marine-heavy rows:')
for (const engine of strictMissing
  .filter((row) => row.brand !== 'Volvo Penta')
  .sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model))
  .slice(0, 180)) {
  console.log(`${engine.brand}\t${engine.model}\t${engine.slug}`)
}
