// Attach the MAN E3872 LE201 / LE202 technical datasheet to the MAN E 3872 LE201 page.
// Source PDF supplied locally via WeChat export, dated/released 2024-12-16.
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const LOCAL_PDF = '/Users/ziqianhuang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/aassdfg684_5b6a/msg/file/2026-06/TD_E3872LE_1500_1800_EG_BG 2024-12-16 en.pdf'
const ENGINE_SLUG = 'man-e-3872-le201'
const STORAGE = 'man/spec-sheets/TD_E3872LE_1500_1800_EG_BG_2024-12-16_en.pdf'
const LABEL = 'MAN E3872 LE201 / LE202 Technical Datasheet (2024-12-16)'

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
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const buf = fs.readFileSync(LOCAL_PDF)
if (buf.subarray(0, 4).toString() !== '%PDF') {
  console.error(`Not a PDF: ${LOCAL_PDF}`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const { data: engine, error: engineError } = await supabase
  .from('engines')
  .select('id, slug, brand, model')
  .eq('slug', ENGINE_SLUG)
  .maybeSingle()
if (engineError) {
  console.error(`Engine lookup failed: ${engineError.message}`)
  process.exit(1)
}
if (!engine) {
  console.error(`Engine not found: ${ENGINE_SLUG}`)
  process.exit(1)
}

const { error: uploadError } = await supabase.storage
  .from('engine-pdfs')
  .upload(STORAGE, buf, { contentType: 'application/pdf', upsert: true })
if (uploadError) {
  console.error(`Upload failed: ${uploadError.message}`)
  process.exit(1)
}

await supabase
  .from('engine_pdfs')
  .delete()
  .eq('engine_id', engine.id)
  .eq('storage_path', STORAGE)

const { error: linkError } = await supabase.from('engine_pdfs').insert({
  engine_id: engine.id,
  type: 'datasheet',
  label: LABEL,
  storage_path: STORAGE,
  file_size_bytes: buf.length,
})
if (linkError) {
  console.error(`PDF link failed: ${linkError.message}`)
  process.exit(1)
}

console.log(`Uploaded ${STORAGE} (${buf.length} bytes)`)
console.log(`Linked ${LABEL} to ${engine.brand} ${engine.model} (${engine.slug})`)
