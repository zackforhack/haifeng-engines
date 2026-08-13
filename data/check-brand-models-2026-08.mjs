// Check whether exact brand/model candidates already exist in Supabase.
//
// Run:
//   node data/check-brand-models-2026-08.mjs "Lister Petter" "TX" "TX2" "TX3"

import { createClient } from '@supabase/supabase-js'
import fsp from 'node:fs/promises'

const [brand, ...models] = process.argv.slice(2)
if (!brand || models.length === 0) {
  throw new Error('Usage: node data/check-brand-models-2026-08.mjs "<brand>" "<model>" [...]')
}

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

function normalize(value) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '')
}

await loadEnv()
const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const rows = []
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from('engines')
    .select('brand,model,slug,status,pdfs:engine_pdfs(id,label,storage_path)')
    .eq('brand', brand)
    .range(from, from + 999)
  if (error) throw error
  rows.push(...(data ?? []))
  if (!data || data.length < 1000) break
}

for (const model of models) {
  const matches = rows.filter((row) => normalize(row.model) === normalize(model))
  if (!matches.length) {
    console.log(`${model}\tmissing`)
    continue
  }
  console.log(
    `${model}\t${matches
      .map((row) => `${row.slug} status=${row.status} docs=${(row.pdfs ?? []).length}`)
      .join('; ')}`,
  )
}
