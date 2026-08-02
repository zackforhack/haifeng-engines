import fsp from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')

const CROSS_LINKS = [
  {
    storagePath: 'baudouin/spec-sheets/12M33G1500-5.pdf',
    keepSlug: 'baudouin-12m33g1500-5',
  },
  {
    storagePath: 'baudouin/spec-sheets/16M33G2000-5.pdf',
    keepSlug: 'baudouin-16m33g2000-5',
  },
  {
    storagePath: 'baudouin/spec-sheets/6M33G750-5.pdf',
    keepSlug: 'baudouin-6m33g750-5',
  },
  {
    storagePath: 'baudouin/spec-sheets/12M26G1000-5.pdf',
    keepSlug: 'baudouin-12m26g1000-5',
  },
  {
    storagePath: 'baudouin/spec-sheets/8M33G1100-5.pdf',
    keepSlug: 'baudouin-8m33g1100-5',
  },
]

function parseEnvFile(text) {
  for (const rawLine of text.split(/\r?\n/)) {
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

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const storagePaths = CROSS_LINKS.map((entry) => entry.storagePath)
const keepSlugs = new Set(CROSS_LINKS.map((entry) => entry.keepSlug))

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, brand, model')
  .in('brand', ['Baudouin', 'Weichai'])
if (enginesError) throw enginesError

const engineById = new Map(engines.map((engine) => [engine.id, engine]))
const { data: pdfLinks, error: pdfLinksError } = await supabase
  .from('engine_pdfs')
  .select('id, engine_id, storage_path, type, label')
  .in('storage_path', storagePaths)
  .eq('type', 'datasheet')
if (pdfLinksError) throw pdfLinksError

const removals = pdfLinks
  .map((link) => ({ ...link, engine: engineById.get(link.engine_id) }))
  .filter((link) => link.engine?.brand === 'Weichai')

const invalidKeeps = pdfLinks
  .map((link) => ({ ...link, engine: engineById.get(link.engine_id) }))
  .filter((link) => link.engine?.brand === 'Baudouin' && !keepSlugs.has(link.engine.slug))

if (invalidKeeps.length) {
  throw new Error(
    `Unexpected Baudouin links: ${invalidKeeps
      .map((link) => `${link.storage_path} -> ${link.engine.slug}`)
      .join(', ')}`,
  )
}

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: prune Baudouin spec-sheet links from Weichai rows`)
console.log(`Checked ${pdfLinks.length} datasheet links across ${storagePaths.length} storage files.`)
console.log(`Weichai links to remove: ${removals.length}`)
for (const removal of removals) {
  console.log(
    `  ${removal.storage_path} -> ${removal.engine.slug} (${removal.engine.model})`,
  )
}

if (!APPLY) {
  console.log('\nDry run only. Re-run with --apply to delete these link rows.')
  process.exit(0)
}

if (removals.length) {
  const { error: deleteError } = await supabase
    .from('engine_pdfs')
    .delete()
    .in('id', removals.map((link) => link.id))
  if (deleteError) throw deleteError
}

console.log(`Deleted ${removals.length} incorrect cross-brand link rows.`)
