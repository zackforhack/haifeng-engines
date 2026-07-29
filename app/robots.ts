import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = 'https://engines.haifengmachinery.com'

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: [
      `${base}/sitemap.xml`,
      `${base}/engines/sitemap.xml`,
      `${base}/alternators/sitemap.xml`,
      `${base}/brands/sitemap.xml`,
      `${base}/guides/sitemap.xml`,
    ],
  }
}
