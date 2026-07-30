import assert from 'node:assert/strict'
import { loadLocalEnv } from '../helpers/env.mjs'
import { createPublicCatalogClient, fetchAll } from '../helpers/supabase.mjs'

loadLocalEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '')
assert.ok(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL is required')

const supabase = createPublicCatalogClient()
const enginePdfs = await fetchAll(
  supabase,
  'engine_pdfs',
  'storage_path,file_size_bytes',
)
const paths = [...new Set(enginePdfs.map((row) => row.storage_path).filter(Boolean))]
const concurrency = Math.max(
  1,
  Math.min(32, Number(process.env.STORAGE_QA_CONCURRENCY) || 6),
)
const failures = []
let nextIndex = 0

function publicObjectUrl(path) {
  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `${supabaseUrl}/storage/v1/object/public/engine-pdfs/${encodedPath}`
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function inspectObject(path) {
  const url = publicObjectUrl(path)
  let lastError

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(15_000),
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type') ?? ''
        const contentLength = response.headers.get('content-length')
        const invalidType = contentType
          && !/(application\/pdf|application\/octet-stream)/i.test(contentType)
        if (invalidType) {
          return `${path}: unexpected content-type ${contentType}`
        }
        if (contentLength != null && Number(contentLength) <= 0) {
          return `${path}: empty object (content-length ${contentLength})`
        }
        return null
      }

      lastError = `HTTP ${response.status}`
      if (response.status !== 429 && response.status < 500) break

      const retryAfterSeconds = Number(response.headers.get('retry-after'))
      const retryDelay = Number.isFinite(retryAfterSeconds)
        ? retryAfterSeconds * 1000
        : 1000 * (2 ** (attempt - 1))
      await sleep(Math.min(retryDelay, 15_000))
    } catch (error) {
      lastError = error.message
      await sleep(Math.min(500 * (2 ** (attempt - 1)), 8_000))
    }
  }

  return `${path}: ${lastError}`
}

async function worker() {
  while (nextIndex < paths.length) {
    const index = nextIndex
    nextIndex += 1
    const failure = await inspectObject(paths[index])
    if (failure) failures.push(failure)
  }
}

await Promise.all(
  Array.from({ length: Math.min(concurrency, paths.length) }, () => worker()),
)

if (failures.length) {
  console.error(
    `Storage integrity failed for ${failures.length} of ${paths.length} unique linked objects:`,
  )
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`)
  if (failures.length > 100) {
    console.error(`- ...and ${failures.length - 100} more`)
  }
  process.exit(1)
}

console.log(
  `Storage integrity passed: ${paths.length} unique linked PDF objects `
    + `across ${enginePdfs.length} engine document links.`,
)
