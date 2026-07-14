import type { MetadataRoute } from 'next'
import { getAllEngines } from '@/lib/engines'
import { CONFIG_FACETS, EMISSIONS_FACETS, RPM_FACETS } from '@/lib/facets'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://engines.haifengmachinery.com'
  const engines = await getAllEngines()

  const categoryUrls = [
    `${base}/engines`,
    `${base}/engines/fuel/diesel`,
    `${base}/engines/fuel/gas`,
    `${base}/engines/power/under-100-kwe`,
    `${base}/engines/power/100-500-kwe`,
    `${base}/engines/power/500-1500-kwe`,
    `${base}/engines/power/1500-plus-kwe`,
    ...Object.keys(CONFIG_FACETS).map((s) => `${base}/engines/configuration/${s}`),
    ...Object.keys(EMISSIONS_FACETS).map((s) => `${base}/engines/emissions/${s}`),
    ...Object.keys(RPM_FACETS).map((s) => `${base}/engines/rpm/${s}`),
  ].map((url) => ({ url, changeFrequency: 'weekly' as const, priority: 0.7 }))

  const engineUrls = engines.map((engine) => ({
    url: `${base}/engines/${engine.slug}`,
    lastModified: new Date(engine.updated_at),
    changeFrequency: engine.status === 'active' ? 'monthly' as const : 'yearly' as const,
    priority: engine.status === 'active' ? 0.8 : 0.5,
    images: [`${base}/engines/${engine.slug}/opengraph-image`],
  }))

  return [...categoryUrls, ...engineUrls]
}
