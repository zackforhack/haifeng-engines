import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const BASE = 'https://engines.haifengmachinery.com'
const OUT_DIR = process.env.SEO_REPORT_DIR ?? path.join(process.cwd(), 'reports', 'seo')
const PAGE = 1000
const DAILY_QUOTA = Number(process.env.INDEXING_DAILY_QUOTA ?? 10)

const CORE_URLS = [
  ['/', 'Homepage and strongest root signal'],
  ['/engines', 'Primary engine catalog hub'],
  ['/alternators', 'Primary alternator catalog hub'],
  ['/brands', 'Brand directory hub'],
  ['/guides', 'Guide directory hub'],
]

const ENGINE_FACETS = [
  ['/engines/fuel/diesel', 'High-volume fuel hub'],
  ['/engines/fuel/gas', 'High-value gas engine hub'],
  ['/engines/power/under-100-kwe', 'Power-range hub'],
  ['/engines/power/100-500-kwe', 'Power-range hub'],
  ['/engines/power/500-1500-kwe', 'Power-range hub'],
  ['/engines/power/1500-plus-kwe', 'Power-range hub'],
  ['/engines/rpm/1500-rpm', '50 Hz speed hub'],
  ['/engines/rpm/1800-rpm', '60 Hz speed hub'],
  ['/engines/rpm/1000-rpm', 'Low-speed engine hub'],
  ['/engines/configuration/inline-4', 'Common configuration hub'],
  ['/engines/configuration/inline-6', 'Common configuration hub'],
  ['/engines/configuration/v6', 'Configuration hub'],
  ['/engines/configuration/v8', 'Configuration hub'],
  ['/engines/configuration/v12', 'High-output configuration hub'],
  ['/engines/configuration/v16', 'Large-engine configuration hub'],
  ['/engines/configuration/v20', 'Large-engine configuration hub'],
  ['/engines/configuration/inline-3', 'Configuration hub'],
  ['/engines/configuration/v10', 'Configuration hub'],
  ['/engines/configuration/inline-8', 'Configuration hub'],
  ['/engines/emissions/epa-tier-4-final', 'Emissions-intent hub'],
  ['/engines/emissions/epa-tier-3', 'Emissions-intent hub'],
  ['/engines/emissions/epa-tier-2', 'Emissions-intent hub'],
  ['/engines/emissions/epa-stationary', 'Stationary-engine emissions hub'],
  ['/engines/emissions/euro-stage-v', 'Emissions-intent hub'],
  ['/engines/emissions/euro-stage-iiia', 'Emissions-intent hub'],
  ['/engines/emissions/china-stage-iii', 'Emissions-intent hub'],
  ['/engines/emissions/china-stage-iv', 'Emissions-intent hub'],
]

function parseEnvFile(text) {
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const idx = line.indexOf('=')
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] == null) process.env[key] = value
  }
}

async function loadLocalEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      parseEnvFile(await fs.readFile(path.join(process.cwd(), file), 'utf8'))
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

function brandSlug(brand) {
  return brand
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function seriesSlug(series) {
  return series.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function fetchAll(supabase, table, select) {
  const rows = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE - 1)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  return rows
}

async function latestSeoReport() {
  try {
    const files = (await fs.readdir(OUT_DIR))
      .filter((file) => file.endsWith('.json') && file.includes('_to_'))
      .sort()
    const latest = files.at(-1)
    if (!latest) return null
    return JSON.parse(await fs.readFile(path.join(OUT_DIR, latest), 'utf8'))
  } catch {
    return null
  }
}

function pageSignals(seo) {
  const signals = new Map()
  for (const row of seo?.gsc?.pages ?? []) {
    try {
      const url = new URL(row.page)
      signals.set(url.pathname, {
        clicks: Number(row.clicks ?? 0),
        impressions: Number(row.impressions ?? 0),
        position: Number(row.position ?? 0),
      })
    } catch {
      // Ignore malformed report rows.
    }
  }
  return signals
}

function signalScore(signals, pathName) {
  const row = signals.get(pathName)
  if (!row) return 0
  return row.clicks * 100 + row.impressions * 4 + Math.max(0, 40 - row.position)
}

function makeEntry(pathName, reason, score = 0, metric = '') {
  return {
    url: `${BASE}${pathName}`,
    path: pathName,
    reason,
    score,
    metric,
  }
}

function dedupe(entries) {
  const seen = new Set()
  const out = []
  for (const entry of entries) {
    if (seen.has(entry.url)) continue
    seen.add(entry.url)
    out.push(entry)
  }
  return out
}

function batch(entries, size) {
  const batches = []
  for (let i = 0; i < entries.length; i += size) {
    batches.push(entries.slice(i, i + size))
  }
  return batches
}

function table(rows, columns) {
  const header = `| ${columns.map((column) => column.label).join(' |')} |`
  const sep = `| ${columns.map(() => '---').join(' |')} |`
  const body = rows.map((row, rowIndex) => `| ${columns.map((column) => String(column.value(row, rowIndex)).replaceAll('|', '\\|')).join(' |')} |`)
  return [header, sep, ...body].join('\n')
}

function buildMarkdown(report) {
  const sections = report.batches.map((rows, index) => `## Day ${index + 1}

${table(rows, [
  { label: '#', value: (_row, rowIndex) => rowIndex + 1 },
  { label: 'URL', value: (row) => row.url },
  { label: 'Why submit', value: (row) => row.reason },
  { label: 'Signal', value: (row) => row.metric },
])}`).join('\n\n')

  return `# GSC Indexing Queue

Generated: ${report.generatedAt}

Daily quota: ${report.dailyQuota}
Total queued URLs: ${report.total}

Use Search Console URL Inspection's "Request indexing" action for these URLs. Submit canonical hub/detail URLs only; do not submit query-parameter filter URLs.

${sections}
`
}

async function main() {
  await loadLocalEnv()
  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const supabase = createClient(supabaseUrl, supabaseKey)
  const [engines, alternators, seo] = await Promise.all([
    fetchAll(supabase, 'engines', 'slug,brand,status,updated_at'),
    fetchAll(supabase, 'alternators', 'slug,series,status,updated_at'),
    latestSeoReport(),
  ])

  const signals = pageSignals(seo)

  const core = CORE_URLS.map(([pathName, reason], index) => makeEntry(
    pathName,
    reason,
    10000 - index,
    'Core hub',
  ))

  const engineFacets = ENGINE_FACETS.map(([pathName, reason], index) => makeEntry(
    pathName,
    reason,
    9000 - index + signalScore(signals, pathName),
    signals.has(pathName) ? 'Has GSC signal' : 'Curated facet',
  ))

  const brandCounts = new Map()
  for (const engine of engines) {
    if (!engine.brand) continue
    brandCounts.set(engine.brand, (brandCounts.get(engine.brand) ?? 0) + 1)
  }
  const brandHubs = [...brandCounts.entries()]
    .map(([brand, count]) => {
      const pathName = `/brands/${brandSlug(brand)}`
      return makeEntry(
        pathName,
        `${count.toLocaleString()} engine pages in brand hub`,
        7000 + count * 5 + signalScore(signals, pathName),
        signals.has(pathName) ? `${count} models + GSC signal` : `${count} models`,
      )
    })
    .sort((a, b) => b.score - a.score)

  const seriesCounts = new Map()
  for (const alternator of alternators) {
    if (!alternator.series) continue
    seriesCounts.set(alternator.series, (seriesCounts.get(alternator.series) ?? 0) + 1)
  }
  const alternatorSeries = [...seriesCounts.entries()]
    .filter(([, count]) => count >= 4)
    .map(([series, count]) => {
      const pathName = `/alternators/series/${seriesSlug(series)}`
      return makeEntry(
        pathName,
        `${count.toLocaleString()} alternator models in series hub`,
        5000 + count * 20 + signalScore(signals, pathName),
        signals.has(pathName) ? `${count} models + GSC signal` : `${count} models`,
      )
    })
    .sort((a, b) => b.score - a.score)

  const gscDetailPages = [...signals.entries()]
    .filter(([pathName]) => pathName.startsWith('/engines/') || pathName.startsWith('/alternators/'))
    .filter(([pathName]) => !pathName.includes('/compare/') && !pathName.includes('/series/'))
    .map(([pathName, row]) => makeEntry(
      pathName,
      'Detail page already receiving Search Console impressions/clicks',
      3000 + signalScore(signals, pathName),
      `${row.clicks} clicks, ${row.impressions} impr., pos. ${row.position.toFixed(1)}`,
    ))
    .sort((a, b) => b.score - a.score)

  const entries = dedupe([
    ...core,
    ...engineFacets.sort((a, b) => b.score - a.score),
    ...brandHubs,
    ...alternatorSeries,
    ...gscDetailPages,
  ])

  const report = {
    generatedAt: new Date().toISOString(),
    dailyQuota: DAILY_QUOTA,
    total: entries.length,
    entries,
    batches: batch(entries, DAILY_QUOTA),
  }

  await fs.mkdir(OUT_DIR, { recursive: true })
  const stamp = new Date().toISOString().slice(0, 10)
  const jsonPath = path.join(OUT_DIR, `indexing-queue-${stamp}.json`)
  const mdPath = path.join(OUT_DIR, `indexing-queue-${stamp}.md`)
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2))
  await fs.writeFile(mdPath, buildMarkdown(report))

  console.log(`Wrote ${jsonPath}`)
  console.log(`Wrote ${mdPath}`)
  console.log(`${entries.length} URLs queued in ${report.batches.length} batches of ${DAILY_QUOTA}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
