// Correct Yanmar 3TNM74F displacement, enrich reviewed 60 Hz pages, and attach
// official model datasheets. Dry-run by default; pass --apply to save.

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import os from 'os'
import path from 'path'

const apply = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)
const bucket = 'engine-pdfs'
const tempDir = path.join(os.tmpdir(), 'haifeng-yanmar-epa-batch-16')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const updates = [
  {
    slug: 'yanmar-3tnm74f-ng6ge',
    patch: {
      displacement_l: 0.993,
      description:
        'Yanmar 3TNM74F-NG6GE 0.993 L naturally aspirated inline-3 diesel '
        + 'generator engine. The 60 Hz page stores 8.8 kWm standby at 1800 RPM. '
        + 'Yanmar documents the 3TNM74F generator family as U.S. EPA Tier 4 Final.',
    },
  },
  {
    slug: 'yanmar-3tnm74f-ngge',
    patch: {
      displacement_l: 0.993,
      description:
        'Yanmar 3TNM74F-NGGE 0.993 L naturally aspirated inline-3 diesel '
        + 'generator engine. The page stores the 50 Hz generator rating, while '
        + 'Yanmar documents the family as U.S. EPA Tier 4 Final and Euro Stage V.',
    },
  },
  {
    slug: 'yanmar-3tnv80f-ng6ge',
    patch: {
      description:
        'Yanmar 3TNV80F-NG6GE 1.267 L naturally aspirated inline-3 diesel '
        + 'generator engine. The 60 Hz page stores 10.7 kWm standby at 1800 RPM. '
        + 'Yanmar documents the 3TNV80F family as U.S. EPA Tier 4 Final.',
    },
  },
]

const documents = [
  {
    source: 'https://www.yanmar.com/media/news/2021/02/01094617/3TNM74F-NGGE.pdf',
    storagePath: 'yanmar/datasheets/3tnm74f-ngge.pdf',
    label: 'Yanmar 3TNM74F-NGGE Generator Engine Datasheet',
    type: 'datasheet',
    slugs: ['yanmar-3tnm74f-ngge', 'yanmar-3tnm74f-ng6ge'],
  },
  {
    source: 'https://www.yanmar.com/media/news/2021/02/01094641/3TNV80F-NGGE-bro.pdf',
    storagePath: 'yanmar/datasheets/3tnv80f-ngge.pdf',
    label: 'Yanmar 3TNV80F-NGGE Generator Engine Datasheet',
    type: 'datasheet',
    slugs: ['yanmar-3tnv80f-ngge', 'yanmar-3tnv80f-ng6ge'],
  },
  {
    source: 'https://www.yanmar.com/media/news/2021/02/01094514/3TNV88F-UGGE-bro.pdf',
    storagePath: 'yanmar/datasheets/3tnv88f-ugge.pdf',
    label: 'Yanmar 3TNV88F-UGGE Generator Engine Datasheet',
    type: 'datasheet',
    slugs: ['yanmar-3tnv88f-ugge', 'yanmar-3tnv88f-ug6ge'],
  },
  {
    source: 'https://www.yanmar.com/media/news/2021/02/01094530/4TNV88C-DYEM-brochure.pdf',
    storagePath: 'yanmar/datasheets/4tnv88c-tier-4.pdf',
    label: 'Yanmar 4TNV88C Tier 4 Engine Datasheet',
    type: 'datasheet',
    slugs: ['yanmar-4tnv88-cl'],
  },
]

async function downloadPdf(source, destination) {
  const response = await fetch(source, {
    headers: { 'User-Agent': 'Mozilla/5.0 HaifengEngineDatabase/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${source}: response is not a PDF`)
  }
  fs.writeFileSync(destination, buffer)
}

const slugs = [
  ...new Set([
    ...updates.map((update) => update.slug),
    ...documents.flatMap((document) => document.slugs),
  ]),
]
const { data: engines, error: enginesError } = await supabase
  .from('engines')
  .select('id, slug, model, displacement_l')
  .in('slug', slugs)
if (enginesError) throw enginesError

const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))
const missingSlugs = slugs.filter((slug) => !engineBySlug.has(slug))
if (missingSlugs.length) {
  throw new Error(`Missing Yanmar engine pages: ${missingSlugs.join(', ')}`)
}

console.table(updates.map(({ slug, patch }) => ({
  slug,
  current_displacement_l: engineBySlug.get(slug).displacement_l,
  corrected_displacement_l:
    patch.displacement_l ?? engineBySlug.get(slug).displacement_l,
  description_update: Boolean(patch.description),
})))

if (!apply) {
  console.log(
    `\nDry run: ${updates.length} pages will be corrected and `
    + `${documents.length} official datasheets will be linked across ${slugs.length} pages.`,
  )
  process.exit(0)
}

for (const { slug, patch } of updates) {
  const { error } = await supabase.from('engines').update(patch).eq('slug', slug)
  if (error) throw error
}

fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
  const localPath = path.join(tempDir, path.basename(document.storagePath))
  await downloadPdf(document.source, localPath)
  const uploaded = await uploadPdf(
    supabase,
    bucket,
    localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)

  const engineIds = document.slugs.map((slug) => engineBySlug.get(slug).id)
  const { data: linked, error: linkedError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('storage_path', document.storagePath)
    .in('engine_id', engineIds)
  if (linkedError) throw linkedError

  const linkedIds = new Set(linked.map((row) => row.engine_id))
  const links = engineIds
    .filter((engineId) => !linkedIds.has(engineId))
    .map((engineId) => ({
      engine_id: engineId,
      type: document.type,
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(localPath).size,
    }))
  if (links.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
    if (linkError) throw linkError
  }
}

console.log(
  `Corrected ${updates.length} Yanmar pages and linked `
  + `${documents.length} official datasheets.`,
)
