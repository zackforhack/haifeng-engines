import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { filterEngines } from '@/lib/engines'
import { EMISSIONS_FACETS } from '@/lib/facets'
import { FacetHub } from '@/components/FacetHub'

const BASE = 'https://engines.haifengmachinery.com'

interface Props { params: Promise<{ standard: string }> }

export function generateStaticParams() {
  return Object.keys(EMISSIONS_FACETS).map((standard) => ({ standard }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { standard } = await params
  const cfg = EMISSIONS_FACETS[standard]
  if (!cfg) return {}
  return {
    title: `${cfg.label} Generator Engines`,
    description: `Generator engines certified to ${cfg.label} (${cfg.blurb}) — specifications, power ratings and datasheets by brand and model.`,
    alternates: { canonical: `/engines/emissions/${standard}` },
  }
}

export default async function EmissionsFacetPage({ params }: Props) {
  const { standard } = await params
  const cfg = EMISSIONS_FACETS[standard]
  if (!cfg) notFound()

  const engines = await filterEngines({ emissions: cfg.value })
  if (!engines.length) notFound()

  const h1 = `${cfg.label} Generator Engines`
  const intro = `Diesel and gas generator engines meeting ${cfg.label} — ${cfg.blurb}. Compare specifications, prime and standby power ratings and datasheets by brand and model.`

  const siblings = Object.entries(EMISSIONS_FACETS).map(([slug, c]) => ({
    label: c.label, href: `/engines/emissions/${slug}`, active: slug === standard,
  }))

  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: h1, url: `${BASE}/engines/emissions/${standard}`, description: intro, mainEntity: { '@type': 'ItemList', numberOfItems: engines.length } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Engines', item: `${BASE}/engines` },
      { '@type': 'ListItem', position: 2, name: h1, item: `${BASE}/engines/emissions/${standard}` },
    ] },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <FacetHub facetLabel={cfg.label} h1={h1} intro={intro} engines={engines} siblings={siblings} siblingHeading="Browse by emissions standard" />
    </>
  )
}
