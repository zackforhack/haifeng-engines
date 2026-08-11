import type { MetadataRoute } from 'next'
import { getAllAlternators, getAlternatorFilterOptions } from '@/lib/alternators'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://engines.haifengmachinery.com'
  const [alternators, options] = await Promise.all([
    getAllAlternators(),
    getAlternatorFilterOptions(),
  ])
  const seriesSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const seriesUrls = [
    `${base}/alternators`,
    ...options.series.map((series) => `${base}/alternators/series/${seriesSlug(series)}`),
  ].map((url) => ({ url, changeFrequency: 'weekly' as const, priority: 0.7 }))

  const alternatorUrls = alternators.map((alternator) => ({
    url: `${base}/alternators/${alternator.slug}`,
    lastModified: alternator.updated_at ? new Date(alternator.updated_at) : undefined,
    changeFrequency: alternator.status === 'active' ? 'monthly' as const : 'yearly' as const,
    priority: alternator.status === 'active' ? 0.7 : 0.5,
    images: [`${base}/alternators/${alternator.slug}/opengraph-image`],
  }))

  return [...seriesUrls, ...alternatorUrls]
}
