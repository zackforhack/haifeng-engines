import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { filterEngines } from '@/lib/engines'
import { RPM_FACETS } from '@/lib/facets'
import { FacetHub } from '@/components/FacetHub'
import { hubItemListElements } from '@/lib/hub-stats'

const BASE = 'https://engines.haifengmachinery.com'

interface Props { params: Promise<{ speed: string }> }

export function generateStaticParams() {
  return Object.keys(RPM_FACETS).map((speed) => ({ speed }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { speed } = await params
  const cfg = RPM_FACETS[speed]
  if (!cfg) return {}
  return {
    title: `${cfg.label} Generator Engines`,
    description: `Generator engines rated at ${cfg.label} — ${cfg.blurb}. Specifications, power ratings and datasheets by brand and model.`,
    alternates: { canonical: `/engines/rpm/${speed}` },
  }
}

export default async function RpmFacetPage({ params }: Props) {
  const { speed } = await params
  const cfg = RPM_FACETS[speed]
  if (!cfg) notFound()

  const engines = await filterEngines({ rpm: cfg.rpm })
  if (!engines.length) notFound()

  const h1 = `${cfg.label} Generator Engines`
  const intro = `Diesel and gas generator engines with a rated speed of ${cfg.label} — ${cfg.blurb}. Compare specifications, power ratings and datasheets by brand and model.`

  const siblings = Object.entries(RPM_FACETS).map(([slug, c]) => ({
    label: c.label, href: `/engines/rpm/${slug}`, active: slug === speed,
  }))

  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: h1, url: `${BASE}/engines/rpm/${speed}`, description: intro, mainEntity: { '@type': 'ItemList', numberOfItems: engines.length, itemListElement: hubItemListElements(engines, BASE) } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Engines', item: `${BASE}/engines` },
      { '@type': 'ListItem', position: 2, name: h1, item: `${BASE}/engines/rpm/${speed}` },
    ] },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <FacetHub facetLabel={cfg.label} h1={h1} intro={intro} subject={`${cfg.label} generator engines`} engines={engines} siblings={siblings} siblingHeading="Browse by rated speed" />
    </>
  )
}
