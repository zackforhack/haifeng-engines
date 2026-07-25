// Resolve EPA records whose Engine Operation field is blank but whose exact
// model occurs only at fixed generator speeds. Dry-run by default; pass
// --apply to update Supabase and attach the official FPT family brochure.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-fixed-speed-gap-batch')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const daedongRecords = [
  {
    slug: 'daedong-3hg4',
    model: '3HG4',
    series: 'H Series',
    cylinders: 3,
    configuration: 'L3 Naturally Aspirated',
    displacement_l: 1.826,
    power_kw: 22,
    description:
      'Daedong 3HG4 is a 1.826 L inline-3 naturally aspirated diesel engine. '
      + 'EPA annual certification data lists fixed-speed calibrations from '
      + '16 to 18 kWm at 1500 RPM and 20 to 22 kWm at 1800 RPM under '
      + 'Tier 4 Final for model years 2022 through 2025.',
  },
  {
    slug: 'daedong-3htig4',
    model: '3HTIG4',
    series: 'H Series',
    cylinders: 3,
    configuration: 'L3 Turbocharged Intercooled',
    displacement_l: 1.826,
    power_kw: 39,
    description:
      'Daedong 3HTIG4 is a 1.826 L inline-3 turbocharged and intercooled '
      + 'diesel engine. EPA annual certification data lists fixed-speed '
      + 'calibrations of 31 kWm at 1500 RPM and 39 kWm at 1800 RPM under '
      + 'Tier 4 Final for model year 2025.',
  },
  {
    slug: 'daedong-4htg4',
    model: '4HTG4',
    series: 'H Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 2.435,
    power_kw: 45,
    description:
      'Daedong 4HTG4 is a 2.435 L inline-4 turbocharged diesel engine. EPA '
      + 'annual certification data lists fixed-speed calibrations from '
      + '33 to 37 kWm at 1500 RPM and 40 to 45 kWm at 1800 RPM under '
      + 'Tier 4 Final for model years 2022 through 2026.',
  },
  {
    slug: 'daedong-4htig4',
    model: '4HTIG4',
    series: 'H Series',
    cylinders: 4,
    configuration: 'L4 Turbocharged',
    displacement_l: 2.435,
    power_kw: 51,
    description:
      'Daedong 4HTIG4 is a 2.435 L inline-4 turbocharged diesel engine. EPA '
      + 'annual certification data lists fixed-speed calibrations of 43 kWm '
      + 'at 1500 RPM and 51 kWm at 1800 RPM under Tier 4 Final for model '
      + 'years 2024 through 2026.',
  },
].map((record) => ({
  brand: 'Daedong',
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  emissions_standard: 'U.S. EPA Final Tier 4',
  certifications: ['U.S. EPA Tier 4 Final'],
  origin: 'South Korea',
  ...record,
}))

const fptRecords = [
  {
    slug: 'fpt-f5bfl415a-b',
    model: 'F5BFL415A*B',
    power_kw: 93,
    aftertreatment: 'DOC, SCR and ASC',
    years: '2020 through 2022',
  },
  {
    slug: 'fpt-f5bfl415b-b',
    model: 'F5BFL415B*B',
    power_kw: 73,
    aftertreatment: 'DOC, SCR and ASC',
    years: '2020 through 2022',
  },
  {
    slug: 'fpt-f5bfl415a-c',
    model: 'F5BFL415A*C',
    power_kw: 73,
    aftertreatment: 'SCR and ASC',
    years: '2024 and 2025',
  },
  {
    slug: 'fpt-f5bfl415b-c',
    model: 'F5BFL415B*C',
    power_kw: 93,
    aftertreatment: 'SCR and ASC',
    years: '2024 and 2025',
  },
  {
    slug: 'fpt-f5hgl465a-x',
    model: 'F5HGL465A*X',
    power_kw: 50,
    aftertreatment: 'DOC and DPF',
    years: '2021 through 2025',
    configuration: 'L4 Turbocharged',
  },
  {
    slug: 'fpt-f5hgl465b-x',
    model: 'F5HGL465B*X',
    power_kw: 40,
    aftertreatment: 'DOC and DPF',
    years: '2021 through 2025',
    configuration: 'L4 Turbocharged',
  },
].map(({ aftertreatment, years, ...record }) => ({
  brand: 'FPT',
  series: 'F34 Series',
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  cylinders: 4,
  configuration: 'L4 Turbocharged Intercooled',
  displacement_l: 3.387,
  rpm_rated: 1800,
  emissions_standard: 'U.S. EPA Final Tier 4',
  certifications: ['U.S. EPA Tier 4 Final'],
  origin: 'Italy',
  ...record,
  description:
    `FPT ${record.model} is a 3.387 L ${record.configuration ?? 'inline-4 '
      + 'turbocharged and intercooled'} diesel engine calibration. EPA annual `
    + `certification data lists ${record.power_kw} kWm at 1800 RPM under `
    + `Tier 4 Final for model years ${years}, with ${aftertreatment} `
    + 'aftertreatment. The technical certification identity is retained '
    + 'because no verified one-to-one commercial F34 cross-reference is available.',
}))

const kubotaRecord = {
  slug: 'kubota-v2203l-di-ef',
  brand: 'Kubota',
  model: 'V2203L-DI-EF',
  series: 'V2203 Series',
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  cylinders: 4,
  configuration: 'L4 Naturally Aspirated',
  displacement_l: 2.216,
  rpm_rated: 1800,
  power_kw: 18,
  emissions_standard: 'U.S. EPA Final Tier 4',
  certifications: ['U.S. EPA Tier 4 Final'],
  origin: 'Japan',
  description:
    'Kubota V2203L-DI-EF is a 2.216 L inline-4 naturally aspirated diesel '
    + 'engine. EPA annual certification data lists 18 kWm at 1800 RPM under '
    + 'Tier 4 Final from model years 2023 through 2026. Kubota Engine America '
    + 'lists the same V2203L-DI-EF identity in its official emissions lookup.',
}

const records = [...daedongRecords, ...fptRecords, kubotaRecord]
const fptSlugs = fptRecords.map((record) => record.slug)
const document = {
  source:
    'https://www.fptindustrial.com/-/media/FPT/Brochures/Engines/'
    + 'Engines_for_Power_Generation_Stage_V_ENG.pdf'
    + '?rev=607ea433726b4e7abdf7eda9004070d1',
  storagePath: 'fpt/f34-stage-v-tier-4-final-g-drive-portfolio.pdf',
  label: 'FPT F34 Stage V / Tier 4 Final G-Drive Portfolio',
  type: 'brochure',
  slugs: fptSlugs,
}

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

const slugs = records.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .in('slug', slugs)
if (existingError) throw existingError

const existingSlugs = new Set(existing.map((engine) => engine.slug))
console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  brand: record.brand,
  model: record.model,
  displacement_l: record.displacement_l,
  certified_kwm_1800: record.power_kw,
})))

if (!apply) {
  console.log(
    `\nDry run: ${existing.length} records will be updated and `
    + `${records.length - existing.length} inserted.`,
  )
  console.log('One official FPT family brochure will be uploaded and linked.')
  process.exit(0)
}

const { error: upsertError } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
if (upsertError) throw upsertError

const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (savedError) throw savedError
if (saved.length !== records.length) {
  throw new Error(`Expected ${records.length} saved records; found ${saved.length}`)
}
const engineBySlug = new Map(saved.map((engine) => [engine.slug, engine]))

fs.mkdirSync(tempDir, { recursive: true })
const localPath = path.join(tempDir, path.basename(document.storagePath))
await downloadPdf(document.source, localPath)
const uploaded = await uploadPdf(
  supabase,
  bucket,
  localPath,
  document.storagePath,
)
if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)

const engineIds = document.slugs.map((slug) => {
  const engine = engineBySlug.get(slug)
  if (!engine) throw new Error(`Missing engine after upsert: ${slug}`)
  return engine.id
})
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

console.log(
  `Saved ${records.length} fixed-speed EPA records and linked the official `
  + `FPT brochure to ${fptRecords.length} pages.`,
)
