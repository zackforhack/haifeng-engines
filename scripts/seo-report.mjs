import fs from 'node:fs/promises'
import path from 'node:path'
import { google } from 'googleapis'

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
]

const today = new Date()
const isoDate = (date) => date.toISOString().slice(0, 10)
const daysAgo = (days) => {
  const d = new Date(today)
  d.setUTCDate(d.getUTCDate() - days)
  return d
}

const START_DATE = process.env.SEO_START_DATE ?? isoDate(daysAgo(29))
const END_DATE = process.env.SEO_END_DATE ?? isoDate(daysAgo(2))
const GSC_SITE_URL = process.env.GSC_SITE_URL ?? 'https://engines.haifengmachinery.com/'
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID
const OUT_DIR = process.env.SEO_REPORT_DIR ?? path.join(process.cwd(), 'reports', 'seo')

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function pct(value) {
  return `${(Number(value) * 100).toFixed(2)}%`
}

function table(rows, columns) {
  const header = `| ${columns.map((c) => c.label).join(' |')} |`
  const sep = `| ${columns.map(() => '---').join(' |')} |`
  const body = rows.map((row) => `| ${columns.map((c) => String(c.value(row))).join(' |')} |`)
  return [header, sep, ...body].join('\n')
}

async function getAuth() {
  requireEnv('GOOGLE_APPLICATION_CREDENTIALS')
  const auth = new google.auth.GoogleAuth({ scopes: SCOPES })
  return auth.getClient()
}

async function gscQuery(searchconsole, requestBody) {
  const res = await searchconsole.searchanalytics.query({
    siteUrl: GSC_SITE_URL,
    requestBody: {
      startDate: START_DATE,
      endDate: END_DATE,
      rowLimit: 25,
      dataState: 'final',
      ...requestBody,
    },
  })
  return res.data.rows ?? []
}

function mapGscRows(rows, dimensions) {
  return rows.map((row) => {
    const item = {
      clicks: Number(row.clicks ?? 0),
      impressions: Number(row.impressions ?? 0),
      ctr: Number(row.ctr ?? 0),
      position: Number(row.position ?? 0),
    }
    dimensions.forEach((dimension, i) => {
      item[dimension] = row.keys?.[i] ?? ''
    })
    return item
  })
}

async function getSearchConsole(searchconsole) {
  const [queries, pages, queryPages] = await Promise.all([
    gscQuery(searchconsole, { dimensions: ['query'], rowLimit: 50 }),
    gscQuery(searchconsole, { dimensions: ['page'], rowLimit: 50 }),
    gscQuery(searchconsole, { dimensions: ['query', 'page'], rowLimit: 100 }),
  ])

  return {
    queries: mapGscRows(queries, ['query']),
    pages: mapGscRows(pages, ['page']),
    queryPages: mapGscRows(queryPages, ['query', 'page']),
  }
}

async function getGa4(analyticsdata) {
  if (!GA4_PROPERTY_ID) return null

  const runReport = async (requestBody) => {
    const res = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: START_DATE, endDate: END_DATE }],
        limit: 50,
        ...requestBody,
      },
    })
    return res.data.rows ?? []
  }

  const landingRows = await runReport({
    dimensions: [{ name: 'landingPagePlusQueryString' }, { name: 'sessionDefaultChannelGroup' }],
    metrics: [
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'sessionDefaultChannelGroup',
        stringFilter: { matchType: 'EXACT', value: 'Organic Search' },
      },
    },
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  })

  const eventRows = await runReport({
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
  })

  return {
    organicLandingPages: landingRows.map((row) => ({
      page: row.dimensionValues?.[0]?.value ?? '',
      channel: row.dimensionValues?.[1]?.value ?? '',
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      engagedSessions: Number(row.metricValues?.[1]?.value ?? 0),
      engagementRate: Number(row.metricValues?.[2]?.value ?? 0),
      averageSessionDuration: Number(row.metricValues?.[3]?.value ?? 0),
    })),
    events: eventRows.map((row) => ({
      eventName: row.dimensionValues?.[0]?.value ?? '',
      eventCount: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  }
}

function safeCell(value) {
  return String(value).replaceAll('|', '\\|')
}

function buildMarkdown(report) {
  const gscColumns = [
    { label: 'Clicks', value: (r) => r.clicks },
    { label: 'Impr.', value: (r) => r.impressions },
    { label: 'CTR', value: (r) => pct(r.ctr) },
    { label: 'Pos.', value: (r) => r.position.toFixed(1) },
  ]

  const topQueries = table(report.gsc.queries.slice(0, 20), [
    { label: 'Query', value: (r) => safeCell(r.query) },
    ...gscColumns,
  ])

  const topPages = table(report.gsc.pages.slice(0, 20), [
    { label: 'Page', value: (r) => safeCell(r.page.replace('https://engines.haifengmachinery.com', '')) },
    ...gscColumns,
  ])

  const opportunities = report.gsc.queryPages
    .filter((r) => r.impressions >= 20 && r.position > 8 && r.position <= 30)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)

  const opportunityTable = opportunities.length
    ? table(opportunities, [
        { label: 'Query', value: (r) => safeCell(r.query) },
        { label: 'Page', value: (r) => safeCell(r.page.replace('https://engines.haifengmachinery.com', '')) },
        ...gscColumns,
      ])
    : 'No mid-position opportunities found for the current threshold.'

  const ga4Section = report.ga4
    ? `\n## GA4 Organic Landing Pages\n\n${table(report.ga4.organicLandingPages.slice(0, 20), [
        { label: 'Page', value: (r) => safeCell(r.page) },
        { label: 'Sessions', value: (r) => r.sessions },
        { label: 'Engaged', value: (r) => r.engagedSessions },
        { label: 'Eng. rate', value: (r) => pct(r.engagementRate) },
      ])}\n\n## GA4 Top Events\n\n${table(report.ga4.events.slice(0, 20), [
        { label: 'Event', value: (r) => safeCell(r.eventName) },
        { label: 'Count', value: (r) => r.eventCount },
      ])}\n`
    : '\n## GA4\n\nSkipped because `GA4_PROPERTY_ID` is not set.\n'

  return `# SEO Performance Report

Period: ${report.startDate} to ${report.endDate}

GSC property: ${report.gscSiteUrl}
${report.ga4PropertyId ? `GA4 property: ${report.ga4PropertyId}` : 'GA4 property: not configured'}

## Search Console Top Queries

${topQueries}

## Search Console Top Pages

${topPages}

## Query/Page Opportunities

Queries with impressions and average positions 8-30 are usually the best first content targets.

${opportunityTable}
${ga4Section}
`
}

async function main() {
  const auth = await getAuth()
  const searchconsole = google.searchconsole({ version: 'v1', auth })
  const analyticsdata = google.analyticsdata({ version: 'v1beta', auth })

  const report = {
    generatedAt: new Date().toISOString(),
    startDate: START_DATE,
    endDate: END_DATE,
    gscSiteUrl: GSC_SITE_URL,
    ga4PropertyId: GA4_PROPERTY_ID ?? null,
    gsc: await getSearchConsole(searchconsole),
    ga4: await getGa4(analyticsdata),
  }

  await fs.mkdir(OUT_DIR, { recursive: true })
  const stamp = `${START_DATE}_to_${END_DATE}`
  const jsonPath = path.join(OUT_DIR, `${stamp}.json`)
  const mdPath = path.join(OUT_DIR, `${stamp}.md`)
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2))
  await fs.writeFile(mdPath, buildMarkdown(report))

  console.log(`Wrote ${jsonPath}`)
  console.log(`Wrote ${mdPath}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
