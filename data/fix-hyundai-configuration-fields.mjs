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

async function updateModels(supabase, models, configuration) {
  const { data, error } = await supabase
    .from('engines')
    .update({ configuration })
    .eq('brand', 'Hyundai')
    .in('model', models)
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

  // Source: data/generate-hyundai-unregulated-sql.mjs, generated from the
  // 2026 Hyundai DX37 CN uncertified engine price list.
  const fixes = [
    [['DP158LC', 'DP158LD'], 'V8'],
    [['DP222LA', 'DP222LB', 'DP222LC', 'DP222CA', 'DP222CB', 'DP222CC'], 'V12'],
  ]

  for (const [models, configuration] of fixes) {
    const rows = await updateModels(supabase, models, configuration)
    console.log(`${models.join(', ')} -> ${configuration}: ${rows.length} rows`)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
