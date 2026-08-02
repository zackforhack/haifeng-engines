import fsp from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')

const CROSS_LINKS = [
  {
    storagePath: 'cummins/spec-sheets/qsl9-gdrive.pdf',
    keepSlug: 'cummins-qsl9-g7',
    removeSlugs: [
      'cummins-qsl89-g2',
      'cummins-qsl89-g3',
      'cummins-qsl89-g30',
      'cummins-qsl89-g33',
      'cummins-qsl89-g34',
      'cummins-qsl89-g4',
      'cummins-qsl9-g3',
    ],
  },
  {
    storagePath: 'cummins/spec-sheets/qsk23-g5-60hz-epa-tier-2.pdf',
    keepSlug: 'cummins-qsk23-g5',
    removeSlugs: ['cummins-qsk23-g5-nr2'],
  },
  {
    storagePath: 'deutz/spec-sheets/motordatenblatt-deutz-tcd2013l06.pdf',
    keepSlug: 'deutz-tcd2013l06-4v',
    removeSlugs: [
      'deutz-tad750ge',
      'deutz-tad751ge',
      'deutz-tad752ge',
      'deutz-tad753ge',
      'deutz-tad754ge',
      'deutz-tcd2013l06-2v',
      'deutz-tcd2013l6',
    ],
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

const allSlugs = [
  ...new Set(CROSS_LINKS.flatMap((entry) => [entry.keepSlug, ...entry.removeSlugs])),
]
const storagePaths = CROSS_LINKS.map((entry) => entry.storagePath)

const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, brand, model')
  .in('slug', allSlugs)
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
const missingEngines = allSlugs.filter((slug) => !engineBySlug.has(slug))
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
  const keepLink = linkByEngineAndPath.get(`${keepEngine.id}:${entry.storagePath}`)
  if (!keepLink) throw new Error(`Missing expected keep link: ${entry.storagePath} -> ${entry.keepSlug}`)

  for (const removeSlug of entry.removeSlugs) {
    const removeEngine = engineBySlug.get(removeSlug)
    const removeLink = linkByEngineAndPath.get(`${removeEngine.id}:${entry.storagePath}`)
    if (removeLink) removals.push({ ...removeLink, engine: removeEngine })
  }
}

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: prune exact Cummins/Deutz PDFs from sibling rows`)
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

console.log(`Deleted ${removals.length} incorrect Cummins/Deutz sibling link rows.`)
