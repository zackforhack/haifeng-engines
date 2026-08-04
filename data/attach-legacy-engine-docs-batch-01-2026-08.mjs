import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import { execFileSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

const APPLY = process.argv.includes('--apply')
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const BUCKET = 'engine-pdfs'
const USER_AGENT =
  'Mozilla/5.0 (compatible; HaifengLegacyDocAttachment/1.0; +https://engines.haifengmachinery.com)'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const tempDir = path.join(os.tmpdir(), 'haifeng-legacy-engine-docs-batch-01')
fs.mkdirSync(tempDir, { recursive: true })

const catSource = (file) =>
  `https://www.dieselpartsdirect.com/documents/caterpillar-specs/${file}`
const detroitSource = (file) =>
  `https://www.dieselpartsdirect.com/documents/detroit-diesel-specs/${file}`
const deutzSource = (file) =>
  `https://www.dieselpartsdirect.com/documents/deutz-specs/${file}`

const documents = [
  {
    source: catSource('cat-d334-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-d334-propulsion.pdf',
    label: 'Caterpillar D334 Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-d334-propulsion'],
  },
  {
    source: catSource('cat-d342-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-d342-propulsion.pdf',
    label: 'Caterpillar D342 Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-d342-propulsion'],
  },
  {
    source: catSource('cat-d343-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-d343-propulsion.pdf',
    label: 'Caterpillar D343 Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-d343-propulsion'],
  },
  {
    source: catSource('cat-d346-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-d346-propulsion.pdf',
    label: 'Caterpillar D346 Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-d346-propulsion'],
  },
  {
    source: catSource('cat-d348-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-d348-propulsion.pdf',
    label: 'Caterpillar D348 Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-d348-propulsion'],
  },
  {
    source: catSource('cat-d349-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-d349-propulsion.pdf',
    label: 'Caterpillar D349 Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-d349-propulsion'],
  },
  {
    source: catSource('cat-3054-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3054-propulsion.pdf',
    label: 'Caterpillar 3054 Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3054-propulsion'],
  },
  {
    source: catSource('cat-3054b-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3054b-propulsion.pdf',
    label: 'Caterpillar 3054B Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3054b-propulsion'],
  },
  {
    source: catSource('cat-3054t-mining.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3054t-mining.pdf',
    label: 'Caterpillar 3054T Mining Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3054t-mining'],
  },
  {
    source: catSource('cat-3056e-industrial.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3056e-industrial.pdf',
    label: 'Caterpillar 3056E Industrial Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3056e-industrial'],
  },
  {
    source: catSource('cat-3116-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3116-marine-propulsion.pdf',
    label: 'Caterpillar 3116 Marine Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3116-marine-propulsion'],
  },
  {
    source: catSource('cat-3176c-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3176c-marine-propulsion.pdf',
    label: 'Caterpillar 3176C Marine Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3176c-marine-propulsion'],
  },
  {
    source: catSource('cat-3208-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3208-marine-propulsion.pdf',
    label: 'Caterpillar 3208 Marine Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3208-marine-propulsion'],
  },
  {
    source: catSource('cat-d3304-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-d3304-propulsion.pdf',
    label: 'Caterpillar D3304 Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-d3304-propulsion'],
  },
  {
    source: catSource('cat-3304b-dina-auxiliary.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3304b-dina-auxiliary.pdf',
    label: 'Caterpillar 3304B DINA Auxiliary Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3304b-dina-auxiliary'],
  },
  {
    source: catSource('cat-3304b-dina-genset.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3304b-dina-genset.pdf',
    label: 'Caterpillar 3304B DINA Genset Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3304b-dina-genset'],
  },
  {
    source: catSource('cat-3304b-dina-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3304b-dina-propulsion.pdf',
    label: 'Caterpillar 3304B DINA Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3304b-dina-propulsion'],
  },
  {
    source: catSource('cat-3304b-dit-auxiliary.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3304b-dit-auxiliary.pdf',
    label: 'Caterpillar 3304B DIT Auxiliary Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3304b-dit-auxiliary'],
  },
  {
    source: catSource('cat-3304b-dit-genset.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3304b-dit-genset.pdf',
    label: 'Caterpillar 3304B DIT Genset Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3304b-dit-genset'],
  },
  {
    source: catSource('cat-3304b-dit-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3304b-dit-propulsion.pdf',
    label: 'Caterpillar 3304B DIT Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3304b-dit-propulsion'],
  },
  {
    source: catSource('cat-3306b-dina-auxiliary.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3306b-dina-auxiliary.pdf',
    label: 'Caterpillar 3306B DINA Auxiliary Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3306b-dina-auxiliary'],
  },
  {
    source: catSource('cat-3306b-dit-auxiliary.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3306b-dit-auxiliary.pdf',
    label: 'Caterpillar 3306B DIT Auxiliary Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3306b-dit-auxiliary'],
  },
  {
    source: catSource('cat-3306b-dita-auxiliary.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3306b-dita-auxiliary.pdf',
    label: 'Caterpillar 3306B DITA Auxiliary Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3306b-dita-auxiliary'],
  },
  {
    source: catSource('cat-3306b-dita-genset.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3306b-dita-genset.pdf',
    label: 'Caterpillar 3306B DITA Genset Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3306b-dita-genset'],
  },
  {
    source: catSource('cat-3306b-dita-propulsion.pdf'),
    storagePath: 'caterpillar/legacy/dpd-cat-3306b-dita-propulsion.pdf',
    label: 'Caterpillar 3306B DITA Propulsion Specification Sheet',
    type: 'datasheet',
    slugs: ['caterpillar-3306b-dita-propulsion'],
  },
  {
    source: detroitSource('6v53n-industrial.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-6v53n-industrial.pdf',
    label: 'Detroit Diesel 6V53N Industrial Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-6v-53n-industrial'],
  },
  {
    source: detroitSource('6v53t-industrial.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-6v53t-industrial.pdf',
    label: 'Detroit Diesel 6V53T Industrial Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-6v-53t-industrial'],
  },
  {
    source: detroitSource('271-standby-electric-set.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-271-371-standby-electric-set.pdf',
    label: 'Detroit Diesel 2-71 / 3-71 Standby Electric Set Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-2-71', 'detroit-diesel-3-71'],
  },
  {
    source: detroitSource('671-truck.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-671-truck.pdf',
    label: 'Detroit Diesel 6-71 Truck Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-6-71'],
  },
  {
    source: detroitSource('671t-generator-engine.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-671t-generator-engine.pdf',
    label: 'Detroit Diesel 6-71T Generator Engine Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-6-71t'],
  },
  {
    source: detroitSource('12v71-generator-set.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-12v71-generator-set.pdf',
    label: 'Detroit Diesel 12V71 Generator Set Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-12v-71-generator-set'],
  },
  {
    source: detroitSource('12v71-power-unit.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-12v71-power-unit.pdf',
    label: 'Detroit Diesel 12V71 Power Unit Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-12v-71-power-unit'],
  },
  {
    source: detroitSource('12v71n-industrial.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-12v71n-industrial.pdf',
    label: 'Detroit Diesel 12V71N Industrial Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-12v-71n-industrial'],
  },
  {
    source: detroitSource('12v71t-generator-set.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-12v71t-generator-set.pdf',
    label: 'Detroit Diesel 12V71T Generator Set Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-12v-71t-generator-set'],
  },
  {
    source: detroitSource('12v71ta-industrial.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-12v71ta-industrial.pdf',
    label: 'Detroit Diesel 12V71TA Industrial Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-12v-71ta-industrial'],
  },
  {
    source: detroitSource('12v71ti-marine.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-12v71ti-marine.pdf',
    label: 'Detroit Diesel 12V71TI Marine Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-12v-71ti-marine'],
  },
  {
    source: detroitSource('6v92ta-crew-boat-marine.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-6v92ta-crew-boat-marine.pdf',
    label: 'Detroit Diesel 6V92TA Crew Boat Marine Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-6v-92ta-crew-boat'],
  },
  {
    source: detroitSource('6v92ta-marine-pleasure-craft.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-6v92ta-marine-pleasure-craft.pdf',
    label: 'Detroit Diesel 6V92TA Marine Pleasure Craft Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-6v-92ta-marine-pleasure-craft'],
  },
  {
    source: detroitSource('8v92ta-commercial-marine.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-8v92ta-commercial-marine.pdf',
    label: 'Detroit Diesel 8V92TA Commercial Marine Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-8v-92ta-commercial-marine'],
  },
  {
    source: detroitSource('8v92ta-ddec-commercial-marine.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-8v92ta-ddec-commercial-marine.pdf',
    label: 'Detroit Diesel 8V92TA DDEC Commercial Marine Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-8v-92ta-ddec-commercial-marine'],
  },
  {
    source: detroitSource('16v92a-marine-pleasure-craft.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-16v92a-marine-pleasure-craft.pdf',
    label: 'Detroit Diesel 16V92A Marine Pleasure Craft Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-16v-92a-marine-pleasure-craft'],
  },
  {
    source: detroitSource('149-series-brochure.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-149-series-brochure.pdf',
    label: 'Detroit Diesel 149 Series Brochure',
    type: 'brochure',
    slugs: [
      'detroit-diesel-8v-149',
      'detroit-diesel-12v-149',
      'detroit-diesel-16v-149',
    ],
  },
  {
    source: detroitSource('12v149-marine.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-12v149-marine.pdf',
    label: 'Detroit Diesel 12V149 Marine Specification Sheet',
    type: 'datasheet',
    slugs: ['detroit-diesel-12v-149-marine'],
  },
  {
    source: detroitSource('marine-power-for-commercial-vessels.pdf'),
    storagePath: 'detroit-diesel/legacy/dpd-marine-power-commercial-vessels.pdf',
    label: 'Detroit Diesel Marine Power for Commercial Vessels Brochure',
    type: 'brochure',
    slugs: ['detroit-diesel-series-60-11-1l'],
  },
  {
    source: deutzSource('deutz-912-construction-specs.pdf'),
    storagePath: 'deutz/legacy/dpd-deutz-912-construction-specs.pdf',
    label: 'Deutz 912 Construction Engine Specification Sheet',
    type: 'datasheet',
    slugs: [
      'deutz-f-3l-912',
      'deutz-f-4l-912',
      'deutz-f-5l-912',
      'deutz-f-6l-912',
    ],
  },
  {
    source: deutzSource('deutz-912w-specs.pdf'),
    storagePath: 'deutz/legacy/dpd-deutz-912w-specs.pdf',
    label: 'Deutz 912W Underground Mining Engine Specification Sheet',
    type: 'datasheet',
    slugs: ['deutz-f-4l-912-w', 'deutz-f-6l-912-w'],
  },
  {
    source: deutzSource('deutz-913-specs.pdf'),
    storagePath: 'deutz/legacy/dpd-deutz-913-specs.pdf',
    label: 'Deutz 913 Construction Engine Specification Sheet',
    type: 'datasheet',
    slugs: ['deutz-bf-4l-913', 'deutz-bf-6l-913', 'deutz-bf-6l-913-c'],
  },
  {
    source: deutzSource('deutz-914-construction-specs.pdf'),
    storagePath: 'deutz/legacy/dpd-deutz-914-construction-specs.pdf',
    label: 'Deutz 914 Construction Engine Specification Sheet',
    type: 'datasheet',
    slugs: ['deutz-f-4l-914', 'deutz-f-6l-914'],
  },
  {
    source: deutzSource('deutz-l2011-construction-specs.pdf'),
    storagePath: 'deutz/legacy/dpd-deutz-l2011-construction-specs.pdf',
    label: 'Deutz L2011 Construction Engine Specification Sheet',
    type: 'datasheet',
    slugs: [
      'deutz-f-2l-2011',
      'deutz-f-3l-2011',
      'deutz-f-4l-2011',
      'deutz-bf-4l-2011',
    ],
  },
  {
    source: deutzSource('deutz-m2011-construction-specs.pdf'),
    storagePath: 'deutz/legacy/dpd-deutz-m2011-construction-specs.pdf',
    label: 'Deutz M2011 Construction Engine Specification Sheet',
    type: 'datasheet',
    slugs: ['deutz-f-2m-2011', 'deutz-f-3m-2011', 'deutz-f-4m-2011'],
  },
  {
    source: deutzSource('deutz-td2011-construction-specs.pdf'),
    storagePath: 'deutz/legacy/dpd-deutz-td2011-construction-specs.pdf',
    label: 'Deutz D/TD 2011 Construction Engine Specification Sheet',
    type: 'datasheet',
    slugs: [
      'deutz-d-2011-l02-i',
      'deutz-d-2011-l03-i',
      'deutz-d-2011-l04-i',
      'deutz-td-2011-l4-i',
    ],
  },
]

function localFileFor(document) {
  return path.join(tempDir, path.basename(document.storagePath))
}

async function downloadPdf(document) {
  const localPath = localFileFor(document)
  if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) return localPath

  let buffer = null
  if (document.source.includes('dieselpartsdirect.com/documents/')) {
    try {
      buffer = execFileSync(
        'curl',
        ['-L', '--fail', '--silent', '--show-error', '--max-time', '30', '-A', USER_AGENT, document.source],
        { maxBuffer: 50 * 1024 * 1024 },
      )
    } catch (curlError) {
      throw new Error('curl download failed')
    }
  } else {
    try {
      const response = await fetch(document.source, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/pdf,*/*',
        },
        signal: AbortSignal.timeout(15_000),
      })
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      buffer = Buffer.from(await response.arrayBuffer())
    } catch (fetchError) {
      try {
        buffer = execFileSync(
          'curl',
          ['-L', '--fail', '--silent', '--show-error', '--max-time', '30', '-A', USER_AGENT, document.source],
          { maxBuffer: 50 * 1024 * 1024 },
        )
      } catch (curlError) {
        throw new Error(`${fetchError.message}; curl fallback failed`)
      }
    }
  }

  if (!buffer.subarray(0, 4).equals(Buffer.from('%PDF'))) {
    throw new Error('downloaded file is not a PDF')
  }
  fs.writeFileSync(localPath, buffer)
  return localPath
}

async function fetchEngines(slugs) {
  const { data, error } = await supabase
    .from('engines')
    .select('id, slug, brand, model, status')
    .in('slug', slugs)
  if (error) throw error
  return data ?? []
}

async function existingLinks(storagePath) {
  const { data, error } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('storage_path', storagePath)
  if (error) throw error
  return new Set((data ?? []).map((row) => row.engine_id))
}

let checked = 0
let downloadable = 0
let missingEngines = 0
let plannedLinks = 0
let insertedLinks = 0
let skippedExistingLinks = 0
const failures = []

for (const document of documents) {
  checked += 1
  let localPath
  try {
    localPath = await downloadPdf(document)
    downloadable += 1
  } catch (error) {
    failures.push(`${document.storagePath}: ${error.message}`)
    console.log(`FAIL download ${document.storagePath}: ${error.message}`)
    continue
  }

  const engines = await fetchEngines(document.slugs)
  const foundSlugs = new Set(engines.map((engine) => engine.slug))
  const missingSlugs = document.slugs.filter((slug) => !foundSlugs.has(slug))
  missingEngines += missingSlugs.length
  if (missingSlugs.length) {
    console.log(`Missing engine rows for ${document.storagePath}: ${missingSlugs.join(', ')}`)
  }

  const linkedEngineIds = await existingLinks(document.storagePath)
  const newLinks = engines
    .filter((engine) => !linkedEngineIds.has(engine.id))
    .map((engine) => ({
      engine_id: engine.id,
      type: document.type,
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(localPath).size,
    }))

  skippedExistingLinks += engines.length - newLinks.length
  plannedLinks += newLinks.length

  console.log(
    `${APPLY ? 'Apply' : 'Plan'} ${document.storagePath}: ${newLinks.length} new link(s), ${engines.length} matched engine(s)`,
  )

  if (!APPLY || !newLinks.length) continue

  const upload = await uploadPdf(supabase, BUCKET, localPath, document.storagePath)
  if (!upload.ok) {
    failures.push(`${document.storagePath}: upload failed`)
    console.log(`FAIL upload ${document.storagePath}`)
    continue
  }

  const rows = newLinks.map((link) => ({
    ...link,
    file_size_bytes: upload.uploadedSizeBytes ?? link.file_size_bytes,
  }))
  const { error } = await supabase.from('engine_pdfs').insert(rows)
  if (error) {
    failures.push(`${document.storagePath}: ${error.message}`)
    console.log(`FAIL insert ${document.storagePath}: ${error.message}`)
    continue
  }
  insertedLinks += rows.length
}

console.log('\n=== Legacy Engine Docs Batch 01 ===')
console.log(`Documents checked: ${checked}`)
console.log(`Downloadable PDFs: ${downloadable}`)
console.log(`Planned new links: ${plannedLinks}`)
console.log(`Inserted links: ${insertedLinks}`)
console.log(`Skipped existing links: ${skippedExistingLinks}`)
console.log(`Missing engine slug references: ${missingEngines}`)
console.log(`Failures: ${failures.length}`)
for (const failure of failures) console.log(`- ${failure}`)

if (!APPLY) {
  console.log('\nDry run only. Re-run with --apply to upload PDFs and link engine rows.')
}
