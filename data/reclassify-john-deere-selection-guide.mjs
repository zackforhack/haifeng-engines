import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

for (const envFile of ['.env.local', '.env']) {
  try {
    for (const rawLine of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#') || !line.includes('=')) continue
      const separator = line.indexOf('=')
      const key = line.slice(0, separator).trim()
      const value = line
        .slice(separator + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '')
      if (key && process.env[key] == null) process.env[key] = value
    }
  } catch {
    // Local environment files are optional in CI.
  }
}

const APPLY = process.argv.includes('--apply')
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://ntrysdovwnbegxtjsqkz.supabase.co'
const supabaseKey = APPLY
  ? process.env.SUPABASE_SERVICE_KEY
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  throw new Error(
    APPLY
      ? 'SUPABASE_SERVICE_KEY is required with --apply'
      : 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required for a dry run',
  )
}

const supabase = createClient(supabaseUrl, supabaseKey)
const storagePath = 'john-deere/brochures/gen-drive-selection-guide.pdf'
const correctedLabel =
  'John Deere Generator Drive Diesel Engine Technical Selection Guide'

const { data: links, error: readError } = await supabase
  .from('engine_pdfs')
  .select('id, engine_id, type, label, engines!inner(brand, model, slug)')
  .eq('storage_path', storagePath)

if (readError) throw readError
if (links.length !== 25) {
  throw new Error(
    `Expected 25 John Deere selection-guide links, found ${links.length}`,
  )
}
if (links.some((link) => link.engines.brand !== 'John Deere')) {
  throw new Error('Selection guide is linked to a non-John Deere engine')
}

const brochureLinks = links.filter((link) => link.type === 'brochure')
const datasheetLinks = links.filter((link) => link.type === 'datasheet')

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${storagePath}`)
console.log(`Linked engine records: ${links.length}`)
console.log(`Rows requiring correction: ${brochureLinks.length}`)
console.log(`Rows already classified as datasheet: ${datasheetLinks.length}`)
for (const link of brochureLinks) {
  console.log(`- ${link.engines.model}: ${link.engines.slug}`)
}

if (APPLY && brochureLinks.length) {
  const { error: updateError } = await supabase
    .from('engine_pdfs')
    .update({ type: 'datasheet', label: correctedLabel })
    .in(
      'id',
      brochureLinks.map((link) => link.id),
    )
  if (updateError) throw updateError
}

console.log(
  APPLY
    ? `Updated ${brochureLinks.length} rows.`
    : `Dry run complete; ${brochureLinks.length} rows would be updated.`,
)
