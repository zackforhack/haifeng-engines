import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllGuides, CLUSTERS } from '@/lib/guides'

const BASE = 'https://engines.haifengmachinery.com'

export const metadata: Metadata = {
  title: 'Generator Engine Guides',
  description:
    'Practical guides to diesel and gas generator engines and alternators — power and sizing (kVA vs kW, prime vs standby), choosing an engine, and alternator basics.',
  alternates: { canonical: '/guides' },
}

export default function GuidesPage() {
  const guides = getAllGuides()
  const byCluster = CLUSTERS.map((c) => ({ cluster: c, items: guides.filter((g) => g.cluster === c) }))
    .filter((c) => c.items.length > 0)
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Generator Engine & Alternator Guides',
      description: metadata.description,
      url: `${BASE}/guides`,
      isPartOf: { '@id': `${BASE}/#website` },
      publisher: { '@id': `${BASE}/#org` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: guides.length,
        itemListElement: guides.map((g, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: g.title,
          url: `${BASE}/guides/${g.slug}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Guides', item: `${BASE}/guides` },
      ],
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div>
        <div className="text-center py-10 mb-10">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">Guides</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Generator Engine & Alternator Guides</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Practical, plain-English explanations of generator set power ratings, engine selection,
            and alternator fundamentals — backed by real spec data from the encyclopedia.
          </p>
        </div>

        {byCluster.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Guides are coming soon.</p>
          </div>
        ) : (
          <div className="space-y-10 max-w-4xl mx-auto">
            {byCluster.map(({ cluster, items }) => (
              <section key={cluster}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{cluster}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((g) => (
                    <Link
                      key={g.slug}
                      href={`/guides/${g.slug}`}
                      className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all"
                    >
                      <h3 className="text-base font-bold text-gray-900 mb-1">{g.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-3">{g.description}</p>
                      <span className="inline-block mt-3 text-sm font-semibold text-blue-600">Read guide →</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
