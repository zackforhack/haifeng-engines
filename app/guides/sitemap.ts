import type { MetadataRoute } from 'next'
import { getAllGuides } from '@/lib/guides'

export const revalidate = 86400

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://engines.haifengmachinery.com'

  return [
    { url: `${base}/guides`, changeFrequency: 'weekly' as const, priority: 0.7 },
    ...getAllGuides().map((guide) => ({
      url: `${base}/guides/${guide.slug}`,
      lastModified: new Date(guide.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
