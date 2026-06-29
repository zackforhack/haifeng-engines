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

function normalizeCompressionRatio(value) {
  if (value == null || value === '') return null
  const text = String(value).trim()
  if (/^\d+(?:\.\d+)?:1$/i.test(text)) return text
  if (/^\d+(?:\.\d+)?$/.test(text)) return `${text}:1`
  return null
}

async function fetchAll(supabase) {
  const rows = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, slug, brand, model, compression_ratio')
      .not('compression_ratio', 'is', null)
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
const fixes = rows
  .map((row) => ({ ...row, normalized: normalizeCompressionRatio(row.compression_ratio) }))
  .filter((row) => row.normalized && row.normalized !== String(row.compression_ratio).trim())

let updated = 0
for (const row of fixes) {
  const { error } = await supabase
    .from('engines')
    .update({ compression_ratio: row.normalized })
    .eq('id', row.id)
  if (error) {
    console.error(`✗ ${row.slug}: ${error.message}`)
    continue
  }
  updated++
  console.log(`${row.slug}: ${row.compression_ratio} -> ${row.normalized}`)
}

console.log(`Updated ${updated} compression ratio values`)
