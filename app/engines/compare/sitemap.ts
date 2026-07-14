import type { MetadataRoute } from 'next'
import { getComparisonPairs } from '@/lib/compare'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://engines.haifengmachinery.com'
  const pairs = await getComparisonPairs()

  return pairs.map((pair) => ({
    url: `${base}/engines/compare/${pair}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))
}
