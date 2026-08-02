import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const PAGE_SIZE = 1000
const REPORT_DIR = path.join(process.cwd(), 'reports', 'datasheet-coverage')

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

async function loadPublicEnv() {
  for (const filename of ['.env.local', '.env']) {
    try {
      parseEnvFile(await fs.readFile(path.join(process.cwd(), filename), 'utf8'))
    } catch {
      // Local environment files are optional in CI.
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

async function fetchAll(supabase, table, columns) {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...data)
    if (data.length < PAGE_SIZE) return rows
  }
}

function percent(value, total) {
  return total ? Number(((value / total) * 100).toFixed(1)) : 0
}

function isEpaEngine(engine) {
  const compliance = [
    engine.emissions_standard,
    ...(engine.certifications ?? []),
  ]
    .filter(Boolean)
    .join(' ')
  return /\bEPA\b|Tier\s*[1-4]\b/i.test(compliance)
}

function markdownTable(rows, columns) {
  const header = `| ${columns.map((column) => column.label).join(' | ')} |`
  const divider = `| ${columns.map(() => '---').join(' | ')} |`
  const body = rows.map(
    (row) =>
      `| ${columns
        .map((column) => String(column.value(row)).replaceAll('|', '\\|'))
        .join(' | ')} |`,
  )
  return [header, divider, ...body].join('\n')
}

function summarize(engines, documents) {
  const documentsByEngine = new Map()
  const linksByStoragePath = new Map()
  const engineById = new Map(engines.map((engine) => [engine.id, engine]))

  for (const document of documents) {
    const engineDocuments = documentsByEngine.get(document.engine_id) ?? []
    engineDocuments.push(document)
    documentsByEngine.set(document.engine_id, engineDocuments)

    const pathLinks = linksByStoragePath.get(document.storage_path) ?? new Set()
    pathLinks.add(document.engine_id)
    linksByStoragePath.set(document.storage_path, pathLinks)
  }

  const hasAnyDocument = (engine) =>
    (documentsByEngine.get(engine.id) ?? []).length > 0
  const datasheetsFor = (engine) =>
    (documentsByEngine.get(engine.id) ?? []).filter(
      (document) => document.type === 'datasheet',
    )
  const hasDatasheet = (engine) => datasheetsFor(engine).length > 0
  const hasExclusivelyLinkedDatasheet = (engine) =>
    datasheetsFor(engine).some(
      (document) => linksByStoragePath.get(document.storage_path)?.size === 1,
    )

  const withAnyDocument = engines.filter(hasAnyDocument)
  const withDatasheet = engines.filter(hasDatasheet)
  const withExclusiveDatasheet = engines.filter(hasExclusivelyLinkedDatasheet)
  const generatedDatasheets = documents.filter(
    (document) =>
      document.type === 'datasheet' &&
      document.storage_path?.startsWith('generated/model-datasheets/'),
  )
  const withOtherDocumentOnly = engines.filter(
    (engine) => hasAnyDocument(engine) && !hasDatasheet(engine),
  )
  const withoutDocument = engines.filter((engine) => !hasAnyDocument(engine))

  const byType = Object.groupBy(documents, (document) => document.type)
  const uniquePathsByType = Object.fromEntries(
    Object.entries(byType).map(([type, rows]) => [
      type,
      new Set(rows.map((row) => row.storage_path)).size,
    ]),
  )

  const brandMap = new Map()
  for (const engine of engines) {
    const brand = brandMap.get(engine.brand) ?? {
      brand: engine.brand,
      total: 0,
      anyDocument: 0,
      datasheet: 0,
      exclusiveDatasheet: 0,
      noDocument: 0,
      missingDocumentEngines: [],
      missingDatasheetEngines: [],
      missingExclusiveDatasheetEngines: [],
    }
    brand.total += 1
    if (hasAnyDocument(engine)) brand.anyDocument += 1
    if (hasDatasheet(engine)) brand.datasheet += 1
    if (hasExclusivelyLinkedDatasheet(engine)) brand.exclusiveDatasheet += 1
    if (!hasAnyDocument(engine)) {
      brand.noDocument += 1
      brand.missingDocumentEngines.push({
        model: engine.model,
        slug: engine.slug,
      })
    }
    if (!hasDatasheet(engine)) {
      brand.missingDatasheetEngines.push({
        model: engine.model,
        slug: engine.slug,
        hasOtherDocument: hasAnyDocument(engine),
      })
    }
    if (!hasExclusivelyLinkedDatasheet(engine)) {
      brand.missingExclusiveDatasheetEngines.push({
        model: engine.model,
        slug: engine.slug,
        hasDatasheet: hasDatasheet(engine),
      })
    }
    brandMap.set(engine.brand, brand)
  }

  const brands = [...brandMap.values()]
    .map((brand) => ({
      ...brand,
      datasheetCoverage: percent(brand.datasheet, brand.total),
      documentCoverage: percent(brand.anyDocument, brand.total),
      exclusiveDatasheetCoverage: percent(
        brand.exclusiveDatasheet,
        brand.total,
      ),
    }))
    .sort(
      (a, b) =>
        b.noDocument - a.noDocument ||
        b.total - a.total ||
        a.brand.localeCompare(b.brand),
    )

  const recentCutoff = new Date()
  recentCutoff.setUTCDate(recentCutoff.getUTCDate() - 30)
  const recentEngines = engines.filter(
    (engine) => new Date(engine.created_at) >= recentCutoff,
  )
  const epaEngines = engines.filter(isEpaEngine)
  const recentEpaEngines = recentEngines.filter(isEpaEngine)
  const documentFiles = [...linksByStoragePath.entries()]
    .map(([storagePath, engineIds]) => {
      const linkedDocuments = documents.filter(
        (document) => document.storage_path === storagePath,
      )
      const linkedEngines = [...engineIds]
        .map((engineId) => engineById.get(engineId))
        .filter(Boolean)
        .map((engine) => ({
          brand: engine.brand,
          model: engine.model,
          slug: engine.slug,
        }))
        .sort(
          (a, b) =>
            a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model),
        )
      return {
        storagePath,
        type: linkedDocuments[0]?.type ?? null,
        label: linkedDocuments[0]?.label ?? null,
        linkCount: linkedEngines.length,
        linkedEngines,
      }
    })
    .sort(
      (a, b) =>
        b.linkCount - a.linkCount || a.storagePath.localeCompare(b.storagePath),
    )

  const segment = (rows) => ({
    total: rows.length,
    withAnyDocument: rows.filter(hasAnyDocument).length,
    withDatasheet: rows.filter(hasDatasheet).length,
    documentCoverage: percent(rows.filter(hasAnyDocument).length, rows.length),
    datasheetCoverage: percent(rows.filter(hasDatasheet).length, rows.length),
  })

  return {
    generatedAt: new Date().toISOString(),
    definitions: {
      anyDocument:
        'At least one engine_pdfs row of any type is linked to the engine.',
      datasheet:
        'At least one linked engine_pdfs row is classified as datasheet.',
      exclusiveDatasheet:
        'At least one linked datasheet storage file is linked to only this engine record. Shared family sheets can still be valid but are excluded from this stricter diagnostic.',
    },
    totals: {
      engines: engines.length,
      documentLinks: documents.length,
      uniqueFiles: new Set(documents.map((document) => document.storage_path))
        .size,
      withAnyDocument: withAnyDocument.length,
      withDatasheet: withDatasheet.length,
      withExclusiveDatasheet: withExclusiveDatasheet.length,
      generatedDatasheetLinks: generatedDatasheets.length,
      withOtherDocumentOnly: withOtherDocumentOnly.length,
      withoutDocument: withoutDocument.length,
      documentCoverage: percent(withAnyDocument.length, engines.length),
      datasheetCoverage: percent(withDatasheet.length, engines.length),
      exclusiveDatasheetCoverage: percent(
        withExclusiveDatasheet.length,
        engines.length,
      ),
    },
    documentTypes: Object.fromEntries(
      Object.entries(byType)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([type, rows]) => [
          type,
          {
            links: rows.length,
            uniqueFiles: uniquePathsByType[type],
          },
        ]),
    ),
    segments: {
      epa: segment(epaEngines),
      recent30Days: segment(recentEngines),
      recentEpa30Days: segment(recentEpaEngines),
    },
    documentFiles,
    brands,
  }
}

function buildMarkdown(report) {
  const { totals, segments } = report
  const brandGaps = report.brands.filter((brand) => brand.noDocument > 0)
  const largeBrands = report.brands
    .filter((brand) => brand.total >= 10)
    .sort(
      (a, b) =>
        a.datasheetCoverage - b.datasheetCoverage ||
        b.total - a.total ||
        a.brand.localeCompare(b.brand),
    )
  const exclusiveGaps = report.brands
    .filter((brand) => brand.total >= 10)
    .sort(
      (a, b) =>
        b.missingExclusiveDatasheetEngines.length -
          a.missingExclusiveDatasheetEngines.length ||
        b.total - a.total ||
        a.brand.localeCompare(b.brand),
    )

  return `# Engine Datasheet Coverage

Generated: ${report.generatedAt}

## Headline

- Engines: **${totals.engines.toLocaleString()}**
- Engines with any linked document: **${totals.withAnyDocument.toLocaleString()} (${totals.documentCoverage}%)**
- Engines with a linked row classified as a datasheet: **${totals.withDatasheet.toLocaleString()} (${totals.datasheetCoverage}%)**
- Engines with at least one exclusively linked datasheet file: **${totals.withExclusiveDatasheet.toLocaleString()} (${totals.exclusiveDatasheetCoverage}%)**
- Generated Haifeng model datasheet links: **${totals.generatedDatasheetLinks.toLocaleString()}**
- Engines with another document type but no datasheet: **${totals.withOtherDocumentOnly.toLocaleString()}**
- Engines with no linked document: **${totals.withoutDocument.toLocaleString()}**
- PDF links / unique stored files: **${totals.documentLinks.toLocaleString()} / ${totals.uniqueFiles.toLocaleString()}**

The exclusive-link figure is a diagnostic, not a quality verdict. A family or series datasheet may legitimately support multiple engine records.

## Segments

${markdownTable(
  [
    { segment: 'EPA-tagged engines', ...segments.epa },
    { segment: 'Added in last 30 days', ...segments.recent30Days },
    {
      segment: 'EPA-tagged and added in last 30 days',
      ...segments.recentEpa30Days,
    },
  ],
  [
    { label: 'Segment', value: (row) => row.segment },
    { label: 'Engines', value: (row) => row.total },
    {
      label: 'Any document',
      value: (row) => `${row.withAnyDocument} (${row.documentCoverage}%)`,
    },
    {
      label: 'Datasheet',
      value: (row) => `${row.withDatasheet} (${row.datasheetCoverage}%)`,
    },
  ],
)}

## Largest No-Document Gaps

${markdownTable(brandGaps.slice(0, 30), [
  { label: 'Brand', value: (row) => row.brand },
  { label: 'Missing', value: (row) => row.noDocument },
  { label: 'Total', value: (row) => row.total },
  {
    label: 'Document coverage',
    value: (row) => `${row.documentCoverage}%`,
  },
  {
    label: 'Datasheet coverage',
    value: (row) => `${row.datasheetCoverage}%`,
  },
])}

## Lowest Datasheet Coverage Among Brands With 10+ Engines

${markdownTable(largeBrands.slice(0, 30), [
  { label: 'Brand', value: (row) => row.brand },
  { label: 'Datasheets', value: (row) => row.datasheet },
  { label: 'Total', value: (row) => row.total },
  {
    label: 'Datasheet coverage',
    value: (row) => `${row.datasheetCoverage}%`,
  },
  { label: 'No document', value: (row) => row.noDocument },
])}

## Largest Exclusive Datasheet Gaps Among Brands With 10+ Engines

${markdownTable(exclusiveGaps.slice(0, 30), [
  { label: 'Brand', value: (row) => row.brand },
  {
    label: 'Exclusive datasheets',
    value: (row) =>
      `${row.exclusiveDatasheet} (${row.exclusiveDatasheetCoverage}%)`,
  },
  { label: 'Total', value: (row) => row.total },
  {
    label: 'Missing exclusive',
    value: (row) => row.missingExclusiveDatasheetEngines.length,
  },
])}

## Counting Definitions

- **Any document:** ${report.definitions.anyDocument}
- **Datasheet:** ${report.definitions.datasheet}
- **Exclusive datasheet:** ${report.definitions.exclusiveDatasheet}
`
}

async function main() {
  await loadPublicEnv()
  const supabase = createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  )

  const [engines, documents] = await Promise.all([
    fetchAll(
      supabase,
      'engines',
      'id, brand, model, slug, emissions_standard, certifications, created_at',
    ),
    fetchAll(
      supabase,
      'engine_pdfs',
      'engine_id, type, label, storage_path, created_at',
    ),
  ])

  const report = summarize(engines, documents)
  const stamp = report.generatedAt.slice(0, 10)
  const exclusiveTarget = Math.ceil(report.totals.engines * 0.8)
  const missingExclusiveReport = {
    generatedAt: report.generatedAt,
    total: report.totals.engines,
    dedicated: report.totals.withExclusiveDatasheet,
    target: exclusiveTarget,
    need: Math.max(0, exclusiveTarget - report.totals.withExclusiveDatasheet),
    groups: Object.fromEntries(
      report.brands
        .filter((brand) => brand.missingExclusiveDatasheetEngines.length > 0)
        .sort(
          (a, b) =>
            b.missingExclusiveDatasheetEngines.length -
              a.missingExclusiveDatasheetEngines.length ||
            b.total - a.total ||
            a.brand.localeCompare(b.brand),
        )
        .map((brand) => [
          brand.brand,
          brand.missingExclusiveDatasheetEngines,
        ]),
    ),
  }
  await fs.mkdir(REPORT_DIR, { recursive: true })
  const jsonPath = path.join(REPORT_DIR, `${stamp}.json`)
  const markdownPath = path.join(REPORT_DIR, `${stamp}.md`)
  const missingExclusivePath = path.join(
    REPORT_DIR,
    `missing-exclusive-${stamp}.json`,
  )
  await Promise.all([
    fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`),
    fs.writeFile(markdownPath, buildMarkdown(report)),
    fs.writeFile(
      missingExclusivePath,
      `${JSON.stringify(missingExclusiveReport, null, 2)}\n`,
    ),
  ])

  console.log(buildMarkdown(report))
  console.log(
    `\nReports written to:\n- ${jsonPath}\n- ${markdownPath}\n- ${missingExclusivePath}`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
