import type { MetadataRoute } from 'next'
import { getAllEngines, getAllBrands } from '@/lib/engines'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://engines.haifengmachinery.com'

  const [engines, brands] = await Promise.all([getAllEngines(), getAllBrands()])

  const engineUrls = engines.map((e) => ({
    url: `${base}/engines/${e.slug}`,
    lastModified: new Date(e.updated_at),
    changeFrequency: e.status === 'active' ? 'monthly' as const : 'yearly' as const,
    priority: e.status === 'active' ? 0.8 : 0.5,
  }))

  const brandUrls = brands.map((b) => ({
    url: `${base}/brands/${encodeURIComponent(b.toLowerCase())}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    { url: base, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/engines`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/brands`, changeFrequency: 'monthly', priority: 0.7 },
    ...brandUrls,
    ...engineUrls,
  ]
}
