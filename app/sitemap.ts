import type { MetadataRoute } from 'next'
import { getAllEngines, getAllBrands } from '@/lib/engines'
import { getAllAlternators, getAlternatorFilterOptions } from '@/lib/alternators'
import { getAllGuides } from '@/lib/guides'
import { CONFIG_FACETS, EMISSIONS_FACETS, RPM_FACETS } from '@/lib/facets'
import { getComparisonPairs } from '@/lib/compare'

// Generate from live data on each request rather than a single build-time snapshot — the catalogue
// grows often, and a one-shot build fetch can transiently undercount, caching a partial sitemap.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://engines.haifengmachinery.com'

  const [engines, brands, alternators, altOptions, comparePairs] = await Promise.all([
    getAllEngines(),
    getAllBrands(),
    getAllAlternators(),
    getAlternatorFilterOptions(),
    getComparisonPairs(),
  ])

  const compareUrls = comparePairs.map((pair) => ({
    url: `${base}/engines/compare/${pair}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  // Each detail page advertises its own generated spec-card image (image sitemap entry)
  // so Google Images can discover the unique, owned graphic on every page.
  const engineUrls = engines.map((e) => ({
    url: `${base}/engines/${e.slug}`,
    lastModified: new Date(e.updated_at),
    changeFrequency: e.status === 'active' ? 'monthly' as const : 'yearly' as const,
    priority: e.status === 'active' ? 0.8 : 0.5,
    images: [`${base}/engines/${e.slug}/opengraph-image`],
  }))

  const alternatorUrls = alternators.map((a) => ({
    url: `${base}/alternators/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : undefined,
    changeFrequency: a.status === 'active' ? 'monthly' as const : 'yearly' as const,
    priority: a.status === 'active' ? 0.7 : 0.5,
    images: [`${base}/alternators/${a.slug}/opengraph-image`],
  }))

  const brandUrls = brands.map((b) => ({
    url: `${base}/brands/${encodeURIComponent(b.toLowerCase())}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const guideUrls = getAllGuides().map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Clean category pages (replacing the old query-param filter views).
  const seriesSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const categoryUrls = [
    `${base}/engines/fuel/diesel`,
    `${base}/engines/fuel/gas`,
    `${base}/engines/power/under-100-kwe`,
    `${base}/engines/power/100-500-kwe`,
    `${base}/engines/power/500-1500-kwe`,
    `${base}/engines/power/1500-plus-kwe`,
    ...Object.keys(CONFIG_FACETS).map((s) => `${base}/engines/configuration/${s}`),
    ...Object.keys(EMISSIONS_FACETS).map((s) => `${base}/engines/emissions/${s}`),
    ...Object.keys(RPM_FACETS).map((s) => `${base}/engines/rpm/${s}`),
    ...altOptions.series.map((s) => `${base}/alternators/series/${seriesSlug(s)}`),
  ].map((url) => ({ url, changeFrequency: 'weekly' as const, priority: 0.7 }))

  // Note: masked spec-sheet PDFs (/specsheets/*) are intentionally excluded — they are served
  // with X-Robots-Tag: none (noindex), so listing them here would send Google contradictory
  // signals and waste crawl budget. Users still reach them via the linked downloads on each page.

  return [
    { url: base, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/engines`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/alternators`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/brands`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/guides`, changeFrequency: 'weekly', priority: 0.7 },
    ...categoryUrls,
    ...guideUrls,
    ...brandUrls,
    ...engineUrls,
    ...alternatorUrls,
    ...compareUrls,
  ]
}
