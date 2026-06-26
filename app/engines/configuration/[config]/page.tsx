import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { filterEngines } from '@/lib/engines'
import { CONFIG_FACETS } from '@/lib/facets'
import { FacetHub } from '@/components/FacetHub'
import { hubItemListElements } from '@/lib/hub-stats'

const BASE = 'https://engines.haifengmachinery.com'

interface Props { params: Promise<{ config: string }> }

export function generateStaticParams() {
  return Object.keys(CONFIG_FACETS).map((config) => ({ config }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { config } = await params
  const cfg = CONFIG_FACETS[config]
  if (!cfg) return {}
  return {
    title: `${cfg.label} Generator Engines`,
    description: `${cfg.label} diesel and gas generator engines — specifications, displacement, prime and standby power ratings and datasheets by brand and model.`,
    alternates: { canonical: `/engines/configuration/${config}` },
  }
}

export default async function ConfigurationFacetPage({ params }: Props) {
  const { config } = await params
  const cfg = CONFIG_FACETS[config]
  if (!cfg) notFound()

  const engines = await filterEngines({ config: cfg.token })
  if (!engines.length) notFound()

  const h1 = `${cfg.label} Generator Engines`
  const intro = `Generator engines with a ${cfg.blurb} cylinder configuration (${cfg.label}), used in diesel and gas generator sets for standby, prime and continuous power.`

  const siblings = Object.entries(CONFIG_FACETS).map(([slug, c]) => ({
    label: c.label, href: `/engines/configuration/${slug}`, active: slug === config,
  }))

  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: h1, url: `${BASE}/engines/configuration/${config}`, description: intro, mainEntity: { '@type': 'ItemList', numberOfItems: engines.length, itemListElement: hubItemListElements(engines, BASE) } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Engines', item: `${BASE}/engines` },
      { '@type': 'ListItem', position: 2, name: h1, item: `${BASE}/engines/configuration/${config}` },
    ] },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <FacetHub facetLabel={cfg.label} h1={h1} intro={intro} subject={`${cfg.label} generator engines`} engines={engines} siblings={siblings} siblingHeading="Browse by configuration" />
    </>
  )
}
