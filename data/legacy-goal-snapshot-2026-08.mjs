// Snapshot current legacy-depth goal progress and remaining no-document gaps.
//
// Run:
//   node data/legacy-goal-snapshot-2026-08.mjs

import { createClient } from '@supabase/supabase-js'
import fsp from 'node:fs/promises'

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

async function fetchAllEngines(supabase) {
  const engines = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, brand, model, slug, status, pdfs:engine_pdfs(id,label,storage_path)')
      .range(from, from + 999)
    if (error) throw error
    engines.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return engines
}

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const engines = await fetchAllEngines(supabase)
const legacy = engines.filter((engine) => engine.status === 'discontinued')
const legacyWithDocs = legacy.filter((engine) => (engine.pdfs ?? []).length > 0)
const noDocLegacy = legacy.filter((engine) => (engine.pdfs ?? []).length === 0)

const gapsByBrand = new Map()
for (const engine of noDocLegacy) {
  gapsByBrand.set(engine.brand, (gapsByBrand.get(engine.brand) ?? 0) + 1)
}

console.log(JSON.stringify({
  engineCount: engines.length,
  legacyCount: legacy.length,
  legacyWithDocs: legacyWithDocs.length,
  legacyCoveragePercent: Number((legacyWithDocs.length / legacy.length * 100).toFixed(1)),
  remainingEngineRowsTo3750: Math.max(0, 3750 - engines.length),
  legacyDocsNeededFor60PercentAtCurrentLegacyCount: Math.max(
    0,
    Math.ceil(legacy.length * 0.6) - legacyWithDocs.length,
  ),
}, null, 2))

console.log('\nNo-doc legacy gaps by brand:')
for (const [brand, count] of [...gapsByBrand].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
  console.log(`${brand}\t${count}`)
}

console.log('\nTop no-doc exact rows excluding Volvo Penta marine-heavy rows:')
for (const engine of noDocLegacy
  .filter((row) => row.brand !== 'Volvo Penta')
  .sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model))
  .slice(0, 160)) {
  console.log(`${engine.brand}\t${engine.model}\t${engine.slug}`)
}
