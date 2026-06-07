import type { MetadataRoute } from 'next'
import { getAllEngines, getAllBrands, getAllPdfPaths } from '@/lib/engines'
import { getAllAlternators, getAlternatorFilterOptions } from '@/lib/alternators'
import { getAllGuides } from '@/lib/guides'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://engines.haifengmachinery.com'

  const [engines, brands, alternators, pdfPaths, altOptions] = await Promise.all([
    getAllEngines(),
    getAllBrands(),
    getAllAlternators(),
    getAllPdfPaths(),
    getAlternatorFilterOptions(),
  ])

  const engineUrls = engines.map((e) => ({
    url: `${base}/engines/${e.slug}`,
    lastModified: new Date(e.updated_at),
    changeFrequency: e.status === 'active' ? 'monthly' as const : 'yearly' as const,
    priority: e.status === 'active' ? 0.8 : 0.5,
  }))

  const alternatorUrls = alternators.map((a) => ({
    url: `${base}/alternators/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : undefined,
    changeFrequency: a.status === 'active' ? 'monthly' as const : 'yearly' as const,
    priority: a.status === 'active' ? 0.7 : 0.5,
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
    ...altOptions.series.map((s) => `${base}/alternators/series/${seriesSlug(s)}`),
  ].map((url) => ({ url, changeFrequency: 'weekly' as const, priority: 0.7 }))

  // Masked spec-sheet PDFs, now served under our own domain via /specsheets.
  const pdfUrls = pdfPaths.map(({ path, updatedAt }) => ({
    url: `${base}/specsheets/${path.split('/').map(encodeURIComponent).join('/')}`,
    lastModified: new Date(updatedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.4,
  }))

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
    ...pdfUrls,
  ]
}
