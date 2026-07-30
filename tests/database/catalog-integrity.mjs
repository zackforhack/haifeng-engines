import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createPublicCatalogClient, fetchAll } from '../helpers/supabase.mjs'

const baseline = JSON.parse(
  await fs.readFile(
    new URL('../contracts/catalog-baseline.json', import.meta.url),
    'utf8',
  ),
)
const supabase = createPublicCatalogClient()

const [engines, alternators, enginePdfs] = await Promise.all([
  fetchAll(supabase, 'engines'),
  fetchAll(supabase, 'alternators'),
  fetchAll(supabase, 'engine_pdfs'),
])

const failures = []

function check(name, test) {
  try {
    test()
  } catch (error) {
    failures.push(`${name}: ${error.message}`)
  }
}

function assertUnique(rows, field, label) {
  const seen = new Map()
  for (const row of rows) {
    const value = row[field]
    seen.set(value, (seen.get(value) ?? 0) + 1)
  }
  const duplicates = [...seen]
    .filter(([, count]) => count > 1)
    .map(([value, count]) => `${value} (${count})`)
  assert.deepEqual(duplicates, [], `${label}: ${duplicates.slice(0, 20).join(', ')}`)
}

function assertRequiredStrings(rows, fields, label) {
  const invalid = []
  for (const row of rows) {
    for (const field of fields) {
      if (typeof row[field] !== 'string' || !row[field].trim()) {
        invalid.push(`${row.slug ?? row.id ?? '(unknown)'}.${field}`)
      }
    }
  }
  assert.deepEqual(invalid, [], `${label}: ${invalid.slice(0, 20).join(', ')}`)
}

function assertNonNegativeNumbers(rows, fields, label) {
  const invalid = []
  for (const row of rows) {
    for (const field of fields) {
      const value = row[field]
      if (value == null) continue
      const numeric = Number(value)
      if (!Number.isFinite(numeric) || numeric < 0) {
        invalid.push(`${row.slug ?? row.id}.${field}=${value}`)
      }
    }
  }
  assert.deepEqual(invalid, [], `${label}: ${invalid.slice(0, 20).join(', ')}`)
}

function assertSchemaFields(rows, fields, label) {
  assert.ok(rows.length > 0, `${label} has no rows available for schema validation`)
  const sample = rows[0]
  const missing = fields.filter((field) => !Object.hasOwn(sample, field))
  assert.deepEqual(missing, [], `${label} missing columns: ${missing.join(', ')}`)
}

check('public catalog schema contracts', () => {
  assertSchemaFields(
    engines,
    [
      'id',
      'slug',
      'brand',
      'model',
      'series',
      'status',
      'power_kw',
      'power_hp',
      'prime_power_kw_50hz',
      'prime_power_kwe_50hz',
      'prime_power_kva_50hz',
      'standby_power_kw_50hz',
      'standby_power_kwe_50hz',
      'standby_power_kva_50hz',
      'prime_power_kw_60hz',
      'prime_power_kwe_60hz',
      'prime_power_kva_60hz',
      'standby_power_kw_60hz',
      'standby_power_kwe_60hz',
      'standby_power_kva_60hz',
      'displacement_l',
      'cylinders',
      'configuration',
      'rpm_rated',
      'fuel_type',
      'ignition_type',
      'cooling_method',
      'emissions_standard',
      'origin',
      'description',
      'created_at',
      'updated_at',
    ],
    'engines',
  )
  assertSchemaFields(
    alternators,
    [
      'id',
      'slug',
      'brand',
      'model',
      'series',
      'poles',
      'kva',
      'spec_sheet_url',
      'status',
      'created_at',
      'updated_at',
    ],
    'alternators',
  )
  assertSchemaFields(
    enginePdfs,
    [
      'id',
      'engine_id',
      'type',
      'label',
      'storage_path',
      'file_size_bytes',
      'created_at',
    ],
    'engine_pdfs',
  )
})

check('catalog row-count floors', () => {
  assert.ok(
    engines.length >= baseline.minimumCounts.engines,
    `engines fell from floor ${baseline.minimumCounts.engines} to ${engines.length}`,
  )
  assert.ok(
    alternators.length >= baseline.minimumCounts.alternators,
    `alternators fell from floor ${baseline.minimumCounts.alternators} to ${alternators.length}`,
  )
  assert.ok(
    enginePdfs.length >= baseline.minimumCounts.enginePdfs,
    `engine PDF links fell from floor ${baseline.minimumCounts.enginePdfs} to ${enginePdfs.length}`,
  )
})

check('manufacturer-document coverage floors', () => {
  const withAnyDocument = new Set(enginePdfs.map((pdf) => pdf.engine_id)).size
  const withDatasheet = new Set(
    enginePdfs
      .filter((pdf) => pdf.type === 'datasheet')
      .map((pdf) => pdf.engine_id),
  ).size
  const alternatorsWithSpecSheet = alternators.filter(
    (alternator) => alternator.spec_sheet_url?.trim(),
  ).length

  assert.ok(
    withAnyDocument >= baseline.minimumCounts.enginesWithAnyDocument,
    `engines with documents fell from floor `
      + `${baseline.minimumCounts.enginesWithAnyDocument} to ${withAnyDocument}`,
  )
  assert.ok(
    withDatasheet >= baseline.minimumCounts.enginesWithDatasheet,
    `engines with datasheets fell from floor `
      + `${baseline.minimumCounts.enginesWithDatasheet} to ${withDatasheet}`,
  )
  assert.ok(
    alternatorsWithSpecSheet >= baseline.minimumCounts.alternatorsWithSpecSheet,
    `alternators with spec sheets fell from floor `
      + `${baseline.minimumCounts.alternatorsWithSpecSheet} to ${alternatorsWithSpecSheet}`,
  )
})

check('engine identity fields', () => {
  assertRequiredStrings(engines, ['id', 'slug', 'brand', 'model', 'status'], 'engines')
  assertUnique(engines, 'id', 'duplicate engine IDs')
  assertUnique(engines, 'slug', 'duplicate engine slugs')
})

check('alternator identity fields', () => {
  assertRequiredStrings(alternators, ['id', 'slug', 'brand', 'model', 'status'], 'alternators')
  assertUnique(alternators, 'id', 'duplicate alternator IDs')
  assertUnique(alternators, 'slug', 'duplicate alternator slugs')
})

check('URL-safe slugs', () => {
  const invalid = [...engines, ...alternators]
    .filter((row) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug))
    .map((row) => row.slug)
  assert.deepEqual(invalid, [], `invalid slugs: ${invalid.slice(0, 20).join(', ')}`)
})

check('allowed status values', () => {
  const engineStatuses = new Set(['active', 'discontinued', 'limited'])
  const alternatorStatuses = new Set(['active', 'discontinued', 'limited'])
  const invalid = [
    ...engines
      .filter((row) => !engineStatuses.has(row.status))
      .map((row) => `engine:${row.slug}=${row.status}`),
    ...alternators
      .filter((row) => !alternatorStatuses.has(row.status))
      .map((row) => `alternator:${row.slug}=${row.status}`),
  ]
  assert.deepEqual(invalid, [], `invalid statuses: ${invalid.slice(0, 20).join(', ')}`)
})

check('engine numeric fields', () => {
  assertNonNegativeNumbers(
    engines,
    [
      'power_kw',
      'power_hp',
      'displacement_l',
      'cylinders',
      'rpm_rated',
      'rpm_max',
      'fuel_consumption_l_per_hr',
      'weight_kg',
      'length_mm',
      'width_mm',
      'height_mm',
      'prime_power_kw_50hz',
      'prime_power_kwe_50hz',
      'prime_power_kva_50hz',
      'standby_power_kw_50hz',
      'standby_power_kwe_50hz',
      'standby_power_kva_50hz',
      'prime_power_kw_60hz',
      'prime_power_kwe_60hz',
      'prime_power_kva_60hz',
      'standby_power_kw_60hz',
      'standby_power_kwe_60hz',
      'standby_power_kva_60hz',
    ],
    'engines',
  )
})

check('alternator numeric fields', () => {
  assertNonNegativeNumbers(alternators, ['kva', 'poles'], 'alternators')
})

check('engine PDF relational integrity', () => {
  const engineIds = new Set(engines.map((engine) => engine.id))
  const allowedTypes = new Set(['datasheet', 'manual', 'brochure', 'other'])
  const invalid = []
  const linkKeys = new Set()

  for (const pdf of enginePdfs) {
    if (!engineIds.has(pdf.engine_id)) invalid.push(`${pdf.id}: orphan engine_id`)
    if (!allowedTypes.has(pdf.type)) invalid.push(`${pdf.id}: type=${pdf.type}`)
    if (!pdf.label?.trim()) invalid.push(`${pdf.id}: missing label`)
    if (!pdf.storage_path?.trim()) invalid.push(`${pdf.id}: missing storage_path`)
    if (pdf.file_size_bytes != null && Number(pdf.file_size_bytes) <= 0) {
      invalid.push(`${pdf.id}: file_size_bytes=${pdf.file_size_bytes}`)
    }
    const linkKey = `${pdf.engine_id}|${pdf.type}|${pdf.storage_path}`
    if (linkKeys.has(linkKey)) invalid.push(`${pdf.id}: duplicate link ${linkKey}`)
    linkKeys.add(linkKey)
  }
  assert.deepEqual(invalid, [], `invalid PDF links: ${invalid.slice(0, 20).join(', ')}`)
})

check('engine brand floor', () => {
  const brands = new Set(engines.map((engine) => engine.brand))
  assert.ok(
    brands.size >= baseline.minimumCounts.engineBrands,
    `engine brands fell from floor ${baseline.minimumCounts.engineBrands} to ${brands.size}`,
  )
})

check('required landmark records', () => {
  const engineSlugs = new Set(engines.map((engine) => engine.slug))
  const alternatorSlugs = new Set(alternators.map((alternator) => alternator.slug))
  const missing = [
    ...baseline.requiredEngineSlugs
      .filter((slug) => !engineSlugs.has(slug))
      .map((slug) => `engine:${slug}`),
    ...baseline.requiredAlternatorSlugs
      .filter((slug) => !alternatorSlugs.has(slug))
      .map((slug) => `alternator:${slug}`),
  ]
  assert.deepEqual(missing, [], `missing records: ${missing.join(', ')}`)
})

check('major-brand count floors', () => {
  const counts = new Map()
  for (const engine of engines) {
    counts.set(engine.brand, (counts.get(engine.brand) ?? 0) + 1)
  }
  const belowFloor = Object.entries(baseline.requiredBrandCounts)
    .filter(([brand, floor]) => (counts.get(brand) ?? 0) < floor)
    .map(([brand, floor]) => `${brand}: ${counts.get(brand) ?? 0} < ${floor}`)
  assert.deepEqual(belowFloor, [], belowFloor.join(', '))
})

if (failures.length) {
  console.error(`Database integrity failed with ${failures.length} contract violation(s):`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(
  `Database integrity passed: ${engines.length} engines, `
    + `${alternators.length} alternators, ${enginePdfs.length} PDF links, `
    + `${new Set(engines.map((engine) => engine.brand)).size} engine brands.`,
)
