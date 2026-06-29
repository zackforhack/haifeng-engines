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

parseEnvFile('.env.local')
parseEnvFile('.env')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or Supabase key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const aliases = new Map([
  ['Liquid-cooled', 'Liquid-Cooled'],
])

let updated = 0
for (const [current, preferred] of aliases) {
  const { data, error } = await supabase
    .from('engines')
    .update({ cooling_method: preferred })
    .eq('cooling_method', current)
    .select('slug')
  if (error) {
    console.error(`✗ ${current}: ${error.message}`)
    continue
  }
  updated += data?.length ?? 0
  console.log(`${current} -> ${preferred}: ${data?.length ?? 0} rows`)
}

console.log(`Updated ${updated} cooling method aliases`)
