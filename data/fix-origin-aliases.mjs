import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function parseEnvFile(text) {
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const idx = line.indexOf('=')
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] == null) process.env[key] = value
  }
}

async function loadLocalEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      parseEnvFile(await fs.readFile(path.join(process.cwd(), file), 'utf8'))
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

async function updateOrigin(supabase, from, to) {
  const { data, error } = await supabase
    .from('engines')
    .update({ origin: to })
    .eq('origin', from)
    .select('slug')
  if (error) throw error
  return data ?? []
}

async function main() {
  await loadLocalEnv()
  const supabase = createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    process.env.SUPABASE_SERVICE_KEY ?? requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  )

  const updates = [
    ['USA', 'United States'],
    ['UK', 'United Kingdom'],
  ]

  for (const [from, to] of updates) {
    const rows = await updateOrigin(supabase, from, to)
    console.log(`${from} -> ${to}: ${rows.length} rows`)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
