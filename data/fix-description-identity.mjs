import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function parseEnvFile(file) {
  try {
    const text = fs.readFileSync(path.join(process.cwd(), file), 'utf8')
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#') || !line.includes('=')) continue
      const idx = line.indexOf('=')
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
      if (key && process.env[key] == null) process.env[key] = value
    }
  } catch {
    // Optional local env file.
  }
}

function firstIdentityToken(value) {
  return String(value ?? '').trim().toLowerCase().split(/[\s/-]/)[0] ?? ''
}

function needsIdentityPrefix(row) {
  const description = String(row.description ?? '').toLowerCase()
  if (!description) return false
  const brandToken = firstIdentityToken(row.brand)
  const modelToken = firstIdentityToken(row.model)
  return (brandToken && !description.includes(brandToken)) || (modelToken && !description.includes(modelToken))
}

async function fetchAll(supabase) {
  const rows = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, slug, brand, model, description')
      .range(from, from + 999)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
    from += 1000
  }
  return rows
}

parseEnvFile('.env.local')
parseEnvFile('.env')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or Supabase key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const rows = await fetchAll(supabase)
const fixes = rows.filter(needsIdentityPrefix)

let updated = 0
for (const row of fixes) {
  const description = String(row.description).trim()
  const next = `${row.brand} ${row.model} - ${description}`
  const { error } = await supabase
    .from('engines')
    .update({ description: next })
    .eq('id', row.id)
  if (error) {
    console.error(`✗ ${row.slug}: ${error.message}`)
    continue
  }
  updated++
  console.log(`${row.slug}: ${description.length} -> ${next.length}`)
}

console.log(`Updated ${updated} descriptions with missing identity`)
