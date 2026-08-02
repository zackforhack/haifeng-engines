import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const BUCKET = 'engine-pdfs'
const TMP_DIR = path.join(os.tmpdir(), 'prune-exclusive-datasheet-sibling-links-2026-08')
const PAGE_SIZE = 1000

const FIXES = [
  {
    storagePath: 'perkins/spec-sheets/404J-electric-power.pdf',
    keepSlug: 'perkins-404j-22g',
    keepToken: '404J-22G',
    removeSlugs: ['perkins-404j-e22tag'],
    rejectTokens: ['404J-E22TAG'],
    note: 'Perkins 404J sheet text names the 404J-22G engine, not the E22TAG row.',
  },
  {
    storagePath: 'perkins/spec-sheets/1706J-E93TAG-electric-power.pdf',
    keepSlug: 'perkins-1706j-e93tag1',
    keepToken: '1706J-E93TAG1',
    removeSlugs: ['perkins-1706j-e93tag2'],
    rejectTokens: ['1706J-E93TAG2'],
    note: 'Perkins 1706J-E93TAG sheet title names TAG1 only.',
  },
  {
    storagePath: 'mesa/mesa-gv22pu-spec-sheet.pdf',
    keepSlug: 'mesa-gv22pu',
    keepToken: 'GV22PU',
    removeSlugs: ['mesa-gx22'],
    rejectTokens: ['GX22'],
    note: 'Mesa stored spec sheet is for GV22PU Engine only.',
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

async function fetchAll(supabase, table, select) {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) return rows
  }
}

function normalize(value) {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '')
}

async function downloadAndExtract(supabase, storagePath) {
  const { data, error } = await supabase.storage.from(BUCKET).download(storagePath)
  if (error) throw new Error(`${storagePath}: ${error.message}`)

  const buffer = Buffer.from(await data.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${storagePath}: stored object is not a PDF`)
  }

  const localPath = path.join(TMP_DIR, storagePath.replace(/[^A-Za-z0-9.-]+/g, '_'))
  await fsp.writeFile(localPath, buffer)
  const text = execFileSync('pdftotext', [localPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  })

  return { buffer, text }
}

await loadEnv()
fs.mkdirSync(TMP_DIR, { recursive: true })

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

const [engines, documents] = await Promise.all([
  fetchAll(supabase, 'engines', 'id, slug, brand, model'),
  fetchAll(supabase, 'engine_pdfs', 'id, engine_id, type, label, storage_path'),
])

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
const engineById = new Map(engines.map((engine) => [engine.id, engine]))

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: prune verified sibling datasheet links`)

let removals = 0
for (const fix of FIXES) {
  const keepEngine = engineBySlug.get(fix.keepSlug)
  if (!keepEngine) throw new Error(`Missing keep engine: ${fix.keepSlug}`)

  const removeEngines = fix.removeSlugs.map((slug) => {
    const engine = engineBySlug.get(slug)
    if (!engine) throw new Error(`Missing remove engine: ${slug}`)
    return engine
  })

  const { text } = await downloadAndExtract(supabase, fix.storagePath)
  const normalizedText = normalize(text)
  if (!normalizedText.includes(normalize(fix.keepToken))) {
    throw new Error(`${fix.storagePath}: missing keep token ${fix.keepToken}`)
  }

  const presentRejects = fix.rejectTokens.filter((token) =>
    normalizedText.includes(normalize(token)),
  )
  if (presentRejects.length) {
    throw new Error(`${fix.storagePath}: found rejected sibling token(s) ${presentRejects.join(', ')}`)
  }

  const links = documents
    .filter((document) => document.storage_path === fix.storagePath)
    .map((document) => ({
      ...document,
      engine: engineById.get(document.engine_id),
    }))

  const keepEngineIds = new Set(
    links
      .filter((link) => link.engine_id === keepEngine.id)
      .map((link) => link.engine_id),
  )
  if (keepEngineIds.size !== 1) {
    throw new Error(`${fix.storagePath}: expected a keep link for ${fix.keepSlug}`)
  }

  const removeIds = new Set(removeEngines.map((engine) => engine.id))
  const removalLinks = links.filter((link) => removeIds.has(link.engine_id))
  const removalEngineIds = new Set(removalLinks.map((link) => link.engine_id))
  if (removalEngineIds.size !== removeEngines.length) {
    throw new Error(`${fix.storagePath}: expected ${removeEngines.length} removable engine link(s)`)
  }

  console.log(`\n${fix.storagePath}`)
  console.log(`  keep: ${keepEngine.slug} (${keepEngine.model})`)
  for (const removal of removalLinks) {
    console.log(`  remove: ${removal.engine.slug} (${removal.engine.model})`)
  }
  console.log(`  evidence: ${fix.note}`)

  if (APPLY) {
    const { error } = await supabase
      .from('engine_pdfs')
      .delete()
      .in('id', removalLinks.map((link) => link.id))
    if (error) throw error
  }
  removals += removalLinks.length
}

console.log(`\n${APPLY ? 'Removed' : 'Would remove'} ${removals} incorrect sibling link(s).`)
