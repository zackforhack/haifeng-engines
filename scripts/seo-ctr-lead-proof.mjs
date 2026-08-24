import fs from 'node:fs/promises'
import path from 'node:path'
import { google } from 'googleapis'

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
]

const GSC_SITE_URL = process.env.GSC_SITE_URL ?? 'sc-domain:engines.haifengmachinery.com'
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID
const ORIGIN = process.env.SEO_ORIGIN ?? 'https://engines.haifengmachinery.com'
const OUT_DIR = process.env.SEO_REPORT_DIR ?? path.join(process.cwd(), 'reports', 'seo')

const periods = [
  { key: 'recent', label: 'Recent 28 days', startDate: process.env.SEO_START_DATE ?? '2026-07-26', endDate: process.env.SEO_END_DATE ?? '2026-08-22' },
  { key: 'previous', label: 'Previous 28 days', startDate: process.env.SEO_PREVIOUS_START_DATE ?? '2026-06-28', endDate: process.env.SEO_PREVIOUS_END_DATE ?? '2026-07-25' },
]

const targetSlugs = [
  'isuzu-4bd1',
  'mercedes-benz-om-352',
  'perkins-a4-248',
  'cummins-hsk78g',
  'kohler-kd62v12',
  'mercedes-benz-om-366-la',
  'hino-j08c',
  'isuzu-6bb1',
  'ford-2715e',
  'isuzu-6bd1',
  'ford-2712e',
  'volvo-penta-md11c',
]

const whatsappEvents = [
  'engine_whatsapp_impression',
  'engine_whatsapp_click',
  'engine_contact_cta_click',
]

function num(value) {
  return Number(value ?? 0)
}

function pct(value) {
  if (!Number.isFinite(value)) return 'n/a'
  return `${(value * 100).toFixed(2)}%`
}

function change(current, previous, decimals = 0) {
  const delta = current - previous
  const rel = previous ? delta / previous : null
  const signed = `${delta >= 0 ? '+' : ''}${delta.toFixed(decimals)}`
  return rel === null ? `${signed} (new)` : `${signed} (${pct(rel)})`
}

function table(rows, columns) {
  if (!rows.length) return 'No rows.'
  return [
    `| ${columns.map((c) => c.label).join(' |')} |`,
    `| ${columns.map(() => '---').join(' |')} |`,
    ...rows.map((row) => `| ${columns.map((c) => String(c.value(row)).replaceAll('|', '\\|')).join(' |')} |`),
  ].join('\n')
}

async function getAuth() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS')
  }
  const auth = new google.auth.GoogleAuth({ scopes: SCOPES })
  return auth.getClient()
}

async function gsc(searchconsole, period, dimensions, rowLimit = 25000) {
  const res = await searchconsole.searchanalytics.query({
    siteUrl: GSC_SITE_URL,
    requestBody: {
      startDate: period.startDate,
      endDate: period.endDate,
      dataState: 'final',
      type: 'web',
      dimensions,
      rowLimit,
    },
  })

  return (res.data.rows ?? []).map((row) => ({
    key: row.keys?.join(' | ') ?? 'total',
    keys: row.keys ?? [],
    clicks: num(row.clicks),
    impressions: num(row.impressions),
    ctr: num(row.ctr),
    position: num(row.position),
  }))
}

function mapRows(rows) {
  return new Map(rows.map((row) => [row.key, row]))
}

function targetPage(urlOrSlug) {
  if (urlOrSlug.startsWith('http')) return urlOrSlug
  return `${ORIGIN}/engines/${urlOrSlug}`
}

async function ga4Report(analyticsdata, period, dimensions, metricNames = ['eventCount']) {
  if (!GA4_PROPERTY_ID) return []

  const res = await analyticsdata.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate: period.startDate, endDate: period.endDate }],
      dimensions: dimensions.map((name) => ({ name })),
      metrics: metricNames.map((name) => ({ name })),
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: 'sessionDefaultChannelGroup',
                stringFilter: { matchType: 'EXACT', value: 'Organic Search' },
              },
            },
            {
              filter: {
                fieldName: 'eventName',
                inListFilter: { values: whatsappEvents },
              },
            },
          ],
        },
      },
      orderBys: [{ metric: { metricName: metricNames[0] }, desc: true }],
      limit: 250,
    },
  })

  return (res.data.rows ?? []).map((row) => ({
    key: row.dimensionValues?.map((v) => v.value).join(' | ') || 'total',
    values: row.dimensionValues?.map((v) => v.value) ?? [],
    metrics: Object.fromEntries(metricNames.map((name, i) => [name, num(row.metricValues?.[i]?.value)])),
  }))
}

async function getGa4Proof(analyticsdata) {
  if (!GA4_PROPERTY_ID) return { note: 'GA4_PROPERTY_ID is not configured.' }

  const eventRows = {}
  const pageRows = {}
  const customRows = {}
  const notes = []

  for (const period of periods) {
    eventRows[period.key] = await ga4Report(analyticsdata, period, ['eventName'])
    pageRows[period.key] = await ga4Report(analyticsdata, period, ['eventName', 'pagePathPlusQueryString'])

    try {
      customRows[period.key] = await ga4Report(analyticsdata, period, [
        'eventName',
        'customEvent:slug',
        'customEvent:placement',
        'customEvent:intent',
      ])
    } catch (error) {
      customRows[period.key] = []
      notes.push(`GA4 custom WhatsApp dimensions unavailable for ${period.label}: ${error.message}`)
    }
  }

  return { eventRows, pageRows, customRows, notes }
}

function eventCount(rows, name) {
  return rows.find((row) => row.values[0] === name)?.metrics.eventCount ?? 0
}

function summarize(data) {
  const recentPages = data.gsc.recent.pages
  const previousPages = mapRows(data.gsc.previous.pages)
  const recentQueryPages = data.gsc.recent.queryPages

  const targetRows = targetSlugs
    .map((slug) => {
      const url = targetPage(slug)
      const recent = recentPages.find((row) => row.key === url)
      const previous = previousPages.get(url)
      return {
        slug,
        url,
        recent: recent ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 },
        previous: previous ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      }
    })
    .sort((a, b) => b.recent.impressions - a.recent.impressions)

  const queryRows = recentQueryPages
    .filter((row) => targetSlugs.some((slug) => row.keys[1] === targetPage(slug)))
    .filter((row) => row.impressions >= 20 || row.clicks > 0)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 40)

  const recentEvents = data.ga4.eventRows?.recent ?? []
  const previousEvents = data.ga4.eventRows?.previous ?? []
  const recentImpressions = eventCount(recentEvents, 'engine_whatsapp_impression')
  const previousImpressions = eventCount(previousEvents, 'engine_whatsapp_impression')
  const recentWhatsAppClicks = eventCount(recentEvents, 'engine_whatsapp_click')
  const previousWhatsAppClicks = eventCount(previousEvents, 'engine_whatsapp_click')
  const recentAllContactClicks = eventCount(recentEvents, 'engine_contact_cta_click')
  const previousAllContactClicks = eventCount(previousEvents, 'engine_contact_cta_click')
  const recentWhatsappRate = recentImpressions ? recentWhatsAppClicks / recentImpressions : 0
  const previousWhatsappRate = previousImpressions ? previousWhatsAppClicks / previousImpressions : 0

  return `# CTR and WhatsApp Lead CTA Proof

Generated: ${data.generatedAt}

GSC property: ${GSC_SITE_URL}
GA4 property: ${GA4_PROPERTY_ID ?? 'not configured'}

Periods:
- Recent: ${periods[0].startDate} to ${periods[0].endDate}
- Previous: ${periods[1].startDate} to ${periods[1].endDate}

## Target Page CTR Baseline

${table(targetRows, [
  { label: 'Page', value: (r) => `/engines/${r.slug}` },
  { label: 'Recent clicks', value: (r) => r.recent.clicks },
  { label: 'Recent impr.', value: (r) => r.recent.impressions },
  { label: 'Recent CTR', value: (r) => pct(r.recent.ctr) },
  { label: 'Recent pos.', value: (r) => r.recent.position ? r.recent.position.toFixed(1) : 'n/a' },
  { label: 'Click change', value: (r) => change(r.recent.clicks, r.previous.clicks) },
  { label: 'Impr. change', value: (r) => change(r.recent.impressions, r.previous.impressions) },
])}

## Query/Page CTR Proof

${table(queryRows, [
  { label: 'Query', value: (r) => r.keys[0] },
  { label: 'Page', value: (r) => r.keys[1].replace(ORIGIN, '') },
  { label: 'Clicks', value: (r) => r.clicks },
  { label: 'Impr.', value: (r) => r.impressions },
  { label: 'CTR', value: (r) => pct(r.ctr) },
  { label: 'Pos.', value: (r) => r.position.toFixed(1) },
])}

## Organic WhatsApp Lead CTA Funnel

${table([
  {
    metric: 'WhatsApp CTA impressions',
    recent: recentImpressions,
    previous: previousImpressions,
    change: change(recentImpressions, previousImpressions),
  },
  {
    metric: 'WhatsApp CTA clicks',
    recent: recentWhatsAppClicks,
    previous: previousWhatsAppClicks,
    change: change(recentWhatsAppClicks, previousWhatsAppClicks),
  },
  {
    metric: 'WhatsApp impression-to-click rate',
    recent: pct(recentWhatsappRate),
    previous: pct(previousWhatsappRate),
    change: `${((recentWhatsappRate - previousWhatsappRate) * 100).toFixed(2)} pp`,
  },
  {
    metric: 'All contact CTA clicks',
    recent: recentAllContactClicks,
    previous: previousAllContactClicks,
    change: change(recentAllContactClicks, previousAllContactClicks),
  },
], [
  { label: 'Metric', value: (r) => r.metric },
  { label: 'Recent', value: (r) => r.recent },
  { label: 'Previous', value: (r) => r.previous },
  { label: 'Change', value: (r) => r.change },
])}

## Organic WhatsApp Events By Page

${table((data.ga4.pageRows?.recent ?? []).slice(0, 30), [
  { label: 'Event', value: (r) => r.values[0] },
  { label: 'Page', value: (r) => r.values[1] },
  { label: 'Count', value: (r) => r.metrics.eventCount },
])}

## Organic WhatsApp Events By Placement

${data.ga4.customRows?.recent?.length
  ? table(data.ga4.customRows.recent.slice(0, 30), [
      { label: 'Event', value: (r) => r.values[0] },
      { label: 'Slug', value: (r) => r.values[1] },
      { label: 'Placement', value: (r) => r.values[2] },
      { label: 'Intent', value: (r) => r.values[3] },
      { label: 'Count', value: (r) => r.metrics.eventCount },
    ])
  : 'GA4 custom event dimensions are not available in the Data API yet. Register `slug`, `placement`, and `intent` as event-scoped custom dimensions to break WhatsApp CTA performance down by page and placement.'}

${data.ga4.notes?.length ? `\nNotes:\n${data.ga4.notes.map((note) => `- ${note}`).join('\n')}\n` : ''}
`
}

async function main() {
  const auth = await getAuth()
  const searchconsole = google.searchconsole({ version: 'v1', auth })
  const analyticsdata = google.analyticsdata({ version: 'v1beta', auth })

  const data = {
    generatedAt: new Date().toISOString(),
    gsc: {},
    ga4: {},
  }

  for (const period of periods) {
    data.gsc[period.key] = {
      pages: await gsc(searchconsole, period, ['page']),
      queryPages: await gsc(searchconsole, period, ['query', 'page']),
    }
  }
  data.ga4 = await getGa4Proof(analyticsdata)

  await fs.mkdir(OUT_DIR, { recursive: true })
  const jsonPath = path.join(OUT_DIR, 'ctr-whatsapp-proof.json')
  const mdPath = path.join(OUT_DIR, 'ctr-whatsapp-proof.md')
  await fs.writeFile(jsonPath, JSON.stringify(data, null, 2))
  await fs.writeFile(mdPath, summarize(data))

  console.log(`Wrote ${jsonPath}`)
  console.log(`Wrote ${mdPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
