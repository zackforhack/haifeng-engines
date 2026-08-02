import fsp from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')

const CROSS_LINKS = [
  {
    storagePath: 'cummins/spec-sheets/kta38-g4-specsheet.pdf',
    keepSlug: 'cummins-kta38-g4',
    removeSlug: 'cummins-kta38-g4b',
  },
  {
    storagePath: 'cummins/spec-sheets/kta50-g3-specsheet.pdf',
    keepSlug: 'cummins-kta50-g3',
    removeSlug: 'cummins-kta50-g3e',
  },
  {
    storagePath: 'cummins/spec-sheets/kta50-g8-specsheet.pdf',
    keepSlug: 'cummins-kta50-g8',
    removeSlug: 'cummins-kta50-g8e',
  },
  {
    storagePath: 'cummins/spec-sheets/qsk19-g5-specsheet.pdf',
    keepSlug: 'cummins-qsk19-g5',
    removeSlug: 'cummins-qsk19-g8',
  },
  {
    storagePath: 'cummins/spec-sheets/qsk38-g5-specsheet.pdf',
    keepSlug: 'cummins-qsk38-g5',
    removeSlug: 'cummins-qsk38-g19',
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

const slugs = [...new Set(CROSS_LINKS.flatMap((entry) => [entry.keepSlug, entry.removeSlug]))]
const storagePaths = CROSS_LINKS.map((entry) => entry.storagePath)

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, brand, model')
  .in('slug', slugs)
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
const missingEngines = slugs.filter((slug) => !engineBySlug.has(slug))
if (missingEngines.length) {
  throw new Error(`Missing engine rows: ${missingEngines.join(', ')}`)
}

const { data: links, error: linksError } = await supabase
  .from('engine_pdfs')
  .select('id, engine_id, storage_path, type, label')
  .in('storage_path', storagePaths)
  .eq('type', 'datasheet')
if (linksError) throw linksError

const linkByEngineAndPath = new Map(
  links.map((link) => [`${link.engine_id}:${link.storage_path}`, link]),
)

const removals = []
for (const entry of CROSS_LINKS) {
  const keepEngine = engineBySlug.get(entry.keepSlug)
  const removeEngine = engineBySlug.get(entry.removeSlug)
  const keepLink = linkByEngineAndPath.get(`${keepEngine.id}:${entry.storagePath}`)
  const removeLink = linkByEngineAndPath.get(`${removeEngine.id}:${entry.storagePath}`)
  if (!keepLink) throw new Error(`Missing expected keep link: ${entry.storagePath} -> ${entry.keepSlug}`)
  if (removeLink) removals.push({ ...removeLink, engine: removeEngine })
}

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: prune Cummins exact PDFs from sibling ratings`)
console.log(`Checked ${links.length} datasheet links across ${storagePaths.length} storage files.`)
console.log(`Sibling links to remove: ${removals.length}`)
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

console.log(`Deleted ${removals.length} incorrect Cummins sibling link rows.`)
