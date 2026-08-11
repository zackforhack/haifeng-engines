import type { MetadataRoute } from 'next'
import { getAllBrands } from '@/lib/engines'
import { brandSlug } from '@/lib/seo'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://engines.haifengmachinery.com'
  const brands = await getAllBrands()

  return [
    { url: `${base}/brands`, changeFrequency: 'monthly' as const, priority: 0.7 },
    ...brands.map((brand) => ({
      url: `${base}/brands/${brandSlug(brand)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
